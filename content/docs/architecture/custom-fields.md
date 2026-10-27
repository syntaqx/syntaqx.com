+++
title = "Custom Fields"
description = "Per-tenant custom fields: JSONB with a definitions table, validation, indexing, option lists, changing definitions, limits, and exposing them everywhere."
category = "Architecture"
order = 421
tags = ["architecture", "custom-fields", "multi-tenancy", "postgres", "jsonb"]
+++

Every multi-tenant product eventually gets the request: "we need to track the gate code on each property," "our contracts have a PO number," "add a field for the referring partner." No two customers want the same extra fields, and none of them will wait for a migration. Custom fields are how a platform lets each tenant extend its records without the schema changing per customer.

They're also how a platform quietly grows a second, worse database inside the first. A custom field that can't be filtered, isn't in the API, disappears from exports or silently accepts garbage is one customers stop trusting, and then they keep the real data in a spreadsheet. My rule: **a custom field is a typed, validated, versioned definition, and its values go everywhere a built-in field goes.**

## How Platforms Do It

The public designs agree on the shape and differ on storage:

- **Salesforce** stores a field definition as metadata, not a column: defining a field adds a row to a fields table that maps it to a generic "flex" column in one shared data table, and "all flex columns use a variable-length string data type," converted on read and write. Indexed and unique custom fields are copied into typed pivot tables so they can be searched.
- **Shopify metafields** have definitions with a namespace and key, a type and type-specific validations (minimum, maximum, regex, allowed choices). The type and the namespace and key can't be changed after creation, and "tightening validations may fail if existing metafields violate the new constraint."
- **HubSpot** properties have a field type (text, number, date, dropdown and others) and a per-subscription limit on how many you can create. Changing a property's type "can invalidate current values stored in the property."
- **Stripe metadata** is the minimal version: up to 50 untyped key-value pairs per object, keys up to 40 characters and values up to 500, never for sensitive data. It's for integration IDs, not for fields a customer filters and reports on.

Two lessons carry over. A definition is a first-class object with a stable key, a type and validation. And changing a definition is the hard part, which is why the platforms restrict it.

## Three Storage Models

| Model | Shape | Good at | Bad at |
| ----- | ----- | ------- | ------ |
| **EAV** (entity-attribute-value) | One row per record per field: `(record_id, field_id, value)` | Unlimited fields, simple writes | Every read is a join or pivot; typing means one value column per type; queries across several fields are slow and hard to write |
| **JSONB with a definitions table** | A `custom_fields JSONB` column on each record, keyed by field key, validated against definitions | One read per record, flexible, indexable with GIN and expression indexes | Types are enforced by your code, not the column; reporting needs extraction |
| **Sparse or flex columns** | Pre-created typed columns (`text_1` to `text_50`, `num_1` to `num_20`) mapped to fields per tenant | Native types and B-tree indexes | A hard cap per type, mapping logic everywhere, and columns that mean different things per tenant |

My default is **JSONB with a definitions table** on PostgreSQL. It keeps a record and its custom values in one row, Postgres can index into it, and the definitions table carries everything the column can't. EAV earns its place when fields need per-value history or per-value permissions; flex columns, when the database has no usable document type. Salesforce's design is flex columns plus EAV-like pivot tables for indexing, at a scale where both costs are worth paying.

## The Definitions Table

```sql
CREATE TABLE custom_field_definitions (
  id              UUID PRIMARY KEY DEFAULT uuidv7(),
  tenant_id       UUID NOT NULL REFERENCES tenants (id),
  record_type     TEXT NOT NULL,                 -- 'customer', 'job', 'contract'
  key             TEXT NOT NULL CHECK (key ~ '^[a-z][a-z0-9_]{0,39}$'),
  label           TEXT NOT NULL,                 -- what users see; freely renamed
  field_type      TEXT NOT NULL CHECK (field_type IN
                    ('text', 'long_text', 'number', 'decimal', 'boolean', 'date',
                     'datetime', 'select', 'multi_select', 'url', 'email', 'reference')),
  validation      JSONB NOT NULL DEFAULT '{}',   -- {"min": 0, "max": 100}, {"max_length": 255}
  options         JSONB,                         -- for select types, see below
  is_required     BOOLEAN NOT NULL DEFAULT FALSE,
  is_filterable   BOOLEAN NOT NULL DEFAULT FALSE,
  edit_permission TEXT,                          -- role allowed to edit values, NULL for anyone who can edit the record
  status          TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'archived')),
  position        INTEGER NOT NULL DEFAULT 0,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  archived_at     TIMESTAMPTZ,
  CONSTRAINT custom_field_definitions_tenant_id_record_type_key_key
    UNIQUE (tenant_id, record_type, key)
);

ALTER TABLE customers ADD COLUMN custom_fields JSONB NOT NULL DEFAULT '{}';
```

- **Scoped to a tenant and a record type,** with `tenant_id` enforced like every other tenant-owned table ([Multi-Tenancy](/docs/architecture/multi-tenancy#enforce-it-in-the-database)).
- **The key is the identity, the label is presentation.** Values are stored under the key, so renaming "PO #" to "Purchase order" is a label change that touches no data. The key never changes, the same rule Shopify enforces.
- **Values live on the record,** `{"po_number": "4471-A", "gate_code": "1234"}`, so reading a customer is one row and writing one is one transaction with the built-in fields.

## Types and Option Lists

- **Pick a small set of types and map each to one JSON representation:** numbers as JSON numbers, exact decimals as strings ([Money & Amounts](/docs/payments/money) for why), dates as `YYYY-MM-DD` strings, datetimes as RFC 3339 in UTC ([Time & Date Formats](/docs/fundamentals/time)). A type that has two representations will be stored both ways.
- **Options have stable keys and editable labels:** `[{"key": "residential", "label": "Residential"}, {"key": "commercial", "label": "Commercial", "archived": true}]`. Values store the key. Renaming a label changes nothing stored; archiving an option hides it from new input while old values still display.
- **Multi-select is an array of option keys,** never a comma-joined string.
- **References point at another record by ID,** checked for existence and tenant on write. Without that check, a custom field becomes a way to read across tenants.

## Validating Against Definitions

JSONB will store anything, so validation is the definitions table's job, and it runs in one place on every write path: the API, the UI, imports, integrations and background jobs. A value that's validated in the form but not the import is not validated.

- **Unknown keys are rejected,** not stored. A typo in an integration otherwise creates a phantom field nobody can see.
- **Type and validation are checked** against the current definition: type, required, min and max, length, pattern, option membership.
- **Archived fields are read-only.** Values stay on the record, and writes to them are refused.
- **Errors name the field by key** in the standard error format, so an integration can tell which value failed ([Error Responses](/docs/requests/error-responses)).

Generating a JSON Schema from each record type's definitions gives one validator for the API, the UI and the import path, and a document integrators can read. A database trigger that validates against the definitions table is a reasonable backstop if anything writes around the application.

## Indexing and Querying

Custom fields that can't be filtered get used once. Postgres gives you two tools:

```sql
-- One GIN index answers containment queries on any custom field.
CREATE INDEX customers_custom_fields_idx
  ON customers USING GIN (custom_fields jsonb_path_ops);

-- Finds customers whose segment is 'commercial'.
SELECT id FROM customers
WHERE tenant_id = $1 AND custom_fields @> '{"segment": "commercial"}';

-- A heavily used field gets its own typed expression index.
CREATE INDEX customers_custom_contract_value_idx
  ON customers (tenant_id, ((custom_fields ->> 'contract_value')::numeric));
```

- **`jsonb_path_ops` for equality across all fields.** Postgres documents it as usually smaller and faster than the default GIN class for containment (`@>`), at the cost of not supporting key-exists queries.
- **Expression indexes for ranges and sorting.** GIN containment can't answer `contract_value > 10000` or `ORDER BY` a date; a B-tree on the extracted, cast value can. Create them for fields marked filterable that get used, not for every field.
- **Cast safely.** An expression index on `::numeric` fails the whole write if one row holds a non-numeric string, which is one more reason validation can't be optional.
- **Postgres keeps only the last of duplicate keys** in a JSONB object and doesn't preserve key order, so order fields by the definition's `position`, never by the JSON.

Past a few hundred thousand records per tenant, or when users want full-text search and faceting across custom fields, query a search index instead and keep Postgres for writes (below).

## Changing Definitions

| Change | How |
| ------ | --- |
| **Rename** | Change the label. The key, and every stored value, stay put |
| **Add an option** | Append to `options`. No data changes |
| **Remove an option** | Archive it. Old values keep displaying; new input can't choose it |
| **Loosen validation** | Apply immediately |
| **Tighten validation or make required** | Count the records that would violate it first; refuse, or require the tenant to fix them, before applying. New rules apply to writes, so old invalid values must not block unrelated edits to the record |
| **Change type** | Don't. Create a new field, copy and convert values in a [background job](/docs/architecture/background-jobs) with a report of what didn't convert, then archive the old field |
| **Delete** | Archive first: hidden, read-only, values kept. A purge job removes values from records after a grace period, and only then is the definition deleted |

Every definition change is a recorded event with the actor and the before and after ([Audit Trails](/docs/architecture/audit-trails)). Deleting a field deletes customer data, so it deserves the same confirmation and delay as deleting records.

## Limits Per Tenant

A tenant with 4,000 custom fields on one record type is a performance problem and, usually, a sign the product is missing a feature. Limits keep one tenant from degrading everyone else ([Noisy Neighbors](/docs/architecture/multi-tenancy#noisy-neighbors)) and make the cost of the design visible:

- **Fields per record type,** by plan, as HubSpot does. Count archived fields until they're purged.
- **Value sizes:** a maximum length for text, a maximum number of options and of selected values, and a maximum total size of `custom_fields` per record. Stripe's 50 keys and 500-character values are a useful reminder that a cap of that order covers most real use.
- **Filterable fields,** which cost an index each, capped separately and lower.

Document the limits in the API reference, return a clear error when one is hit, and alert internally when a tenant approaches one.

## Everywhere a Field Goes

A custom field is only as useful as the places it appears. Treat this as the definition of done:

- **The API.** Custom values in a nested object keyed by field key (`"custom_fields": {"po_number": "4471-A"}`), never mixed in with built-in attributes where a tenant's key could collide with a future built-in one. A definitions endpoint lets integrations discover keys, types and options.
- **Webhooks and events** carry custom values in the same shape ([Webhooks](/docs/api-design/webhooks)).
- **Search.** Map each type to a typed field in the search index, keyed by tenant and field ID, and reindex when a definition's type or options change. Dynamic mapping that infers types from the first value will guess wrong for some tenant.
- **Exports and reports.** One column per active field, headed by the label, in the definition's order. In the warehouse, flatten custom values into a long table (`record_id, field_key, typed value columns`) so analysts can pivot what they need ([Data Pipelines & Analytics](/docs/architecture/data-pipelines)).
- **The audit trail,** field by field, exactly like built-in fields.
- **Permissions.** A field marked restricted is hidden from roles that can't see it in the UI, the API, exports and search results alike.
- **Sensitive data.** Customers will put personal and sensitive data in free-text custom fields whatever the label says. Treat custom values as personal data for retention and erasure ([Data Retention](/docs/architecture/data-retention#erasure-requests)), and offer an explicit "sensitive" flag that redacts the value from logs and analytics.

## Checklist

- **A definitions table** per tenant and record type: immutable key, editable label, a small set of types, validation and options with stable keys.
- **Values in JSONB on the record,** validated against the definitions on every write path, unknown keys rejected.
- **A GIN `jsonb_path_ops` index** for equality, and typed expression indexes for fields that are filtered by range or sorted.
- **Definition changes as procedures:** rename by label, archive before delete, new field instead of a type change, tightened validation checked against existing data.
- **Per-tenant limits** on fields, value sizes and filterable fields, documented and enforced.
- **Custom values in the API, webhooks, search, exports, the warehouse, the audit trail and permissions,** the same as built-in fields.

## References

**Reference**

- [PostgreSQL: JSON Types](https://www.postgresql.org/docs/current/datatype-json.html), `jsonb_ops` and `jsonb_path_ops` GIN indexes, expression indexes on a key, and duplicate keys and key order in `jsonb`
- [Shopify: Metafield definitions](https://shopify.dev/docs/apps/build/custom-data/metafields/definitions), immutable type and key, validations, tightening validations against existing values, and deleting definitions with or without their values
- [HubSpot: Create and edit properties](https://knowledge.hubspot.com/properties/create-and-edit-properties), field types, limits by subscription, and type changes that invalidate stored values
- [Stripe: Metadata](https://docs.stripe.com/metadata), 50 keys, 40-character keys and 500-character values, and no sensitive data

**In practice**

- [Salesforce Architects: Platform Multitenant Architecture](https://architect.salesforce.com/fundamentals/platform-multitenant-architecture), metadata-defined fields, string flex columns and typed pivot tables for indexes and uniqueness
