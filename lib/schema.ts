/**
 * schema.org builders shared by every page that emits JSON-LD (rendered via
 * components/json-ld.tsx). Nodes reference each other by `@id`; references
 * also carry a name so they still read correctly on their own page.
 */
import { CONTACT_EMAIL, SITE_URL, socials } from "@/lib/constants";

const CONTEXT = "https://schema.org";

export const PERSON_ID = `${SITE_URL}/#person`;
export const ORG_ID = `${SITE_URL}/#organization`;
export const WEBSITE_ID = `${SITE_URL}/#website`;

const abs = (path: string) =>
  path.startsWith("http") ? path : `${SITE_URL}${path === "/" ? "" : path}`;

export const personRef = {
  "@type": "Person",
  "@id": PERSON_ID,
  name: "Chase Pierce",
  url: SITE_URL,
};

export const orgRef = {
  "@type": "Organization",
  "@id": ORG_ID,
  name: "syntaqx",
  url: SITE_URL,
  logo: `${SITE_URL}/brand.svg`,
};

/** Homepage graph: the site, the person behind it, and the syntaqx brand. */
export function siteGraph({
  description,
  personDescription,
}: {
  description: string;
  personDescription: string;
}) {
  const sameAs = socials.map((s) => s.href);
  const contactPoint = {
    "@type": "ContactPoint",
    contactType: "professional inquiries",
    email: CONTACT_EMAIL,
    url: `${SITE_URL}/contact`,
  };
  return {
    "@context": CONTEXT,
    "@graph": [
      {
        "@type": "WebSite",
        "@id": WEBSITE_ID,
        name: "syntaqx",
        url: SITE_URL,
        description,
        inLanguage: "en",
        author: { "@id": PERSON_ID },
        publisher: { "@id": ORG_ID },
      },
      {
        ...orgRef,
        description,
        sameAs,
        founder: { "@id": PERSON_ID },
        contactPoint,
        address: {
          "@type": "PostalAddress",
          addressLocality: "South Jordan",
          addressRegion: "UT",
          addressCountry: "US",
        },
      },
      { ...personNode(personDescription), contactPoint },
    ],
  };
}

/** The person in full, for the pages about them. */
function personNode(description: string) {
  return {
    ...personRef,
    alternateName: "syntaqx",
    jobTitle: "Software Engineering Leader",
    description,
    sameAs: socials.map((s) => s.href),
  };
}

/** /resume: a page about the person. */
export function profilePage({
  path,
  description,
  crumbs,
}: {
  path: string;
  description: string;
  crumbs: Crumb[];
}) {
  const url = abs(path);
  return {
    "@context": CONTEXT,
    "@graph": [
      {
        "@type": "ProfilePage",
        "@id": url,
        url,
        inLanguage: "en",
        isPartOf: { "@id": WEBSITE_ID },
        mainEntity: personNode(description),
      },
      breadcrumbList(crumbs),
    ],
  };
}

/**
 * A page that lists other pages: the /ui index, or a book's cover. A book's
 * cover is also the Book its chapters are part of (see `bookRef`).
 */
export function collectionPage({
  name,
  description,
  path,
  crumbs,
  items,
  book = false,
}: {
  name: string;
  description: string;
  path: string;
  crumbs: Crumb[];
  items: { name: string; path: string }[];
  book?: boolean;
}) {
  const url = abs(path);
  const list = { ...itemListNode(name, path, items), "@id": `${url}#items` };
  return {
    "@context": CONTEXT,
    "@graph": [
      {
        "@type": "CollectionPage",
        "@id": url,
        name,
        description,
        url,
        inLanguage: "en",
        isPartOf: { "@id": WEBSITE_ID },
        author: personRef,
        publisher: orgRef,
        mainEntity: book ? { "@id": `${url}#book` } : { "@id": list["@id"] },
      },
      ...(book
        ? [
            {
              ...bookRef(name, path),
              description,
              url,
              inLanguage: "en",
              author: personRef,
              publisher: orgRef,
              hasPart: { "@id": list["@id"] },
            },
          ]
        : []),
      list,
      breadcrumbList(crumbs),
    ],
  };
}

/** A book, by the `@id` its cover gives it. */
export function bookRef(name: string, path: string) {
  return { "@type": "Book", "@id": `${abs(path)}#book`, name };
}

/** A collection page, by the `@id` it gives itself. */
export function pageRef(name: string, path: string) {
  return { "@type": "CollectionPage", "@id": abs(path), name };
}

export interface Crumb {
  name: string;
  path: string;
}

export function breadcrumbList(crumbs: Crumb[]) {
  return {
    "@type": "BreadcrumbList",
    itemListElement: [{ name: "Home", path: "/" }, ...crumbs].map((c, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: c.name,
      item: abs(c.path),
    })),
  };
}

export function itemList(
  name: string,
  path: string,
  items: { name: string; path: string }[],
) {
  return { "@context": CONTEXT, ...itemListNode(name, path, items) };
}

function itemListNode(
  name: string,
  path: string,
  items: { name: string; path: string }[],
) {
  return {
    "@type": "ItemList",
    name,
    url: abs(path),
    numberOfItems: items.length,
    itemListElement: items.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.name,
      url: abs(item.path),
    })),
  };
}

/** Docs pages and long-form explainers. Dates only when they really exist. */
export function article({
  type = "TechArticle",
  headline,
  description,
  path,
  crumbs,
  datePublished,
  dateModified,
  isPartOf,
}: {
  type?: "TechArticle" | "Article";
  headline: string;
  description: string;
  path: string;
  crumbs: Crumb[];
  datePublished?: string;
  dateModified?: string;
  /** The book or collection it belongs to (`bookRef`, `pageRef`). */
  isPartOf?: object;
}) {
  const url = abs(path);
  return {
    "@context": CONTEXT,
    "@graph": [
      {
        // TechArticle is also typed Article: some crawlers (Ahrefs) only
        // recognize the parent type.
        "@type": type === "TechArticle" ? ["TechArticle", "Article"] : type,
        headline,
        description,
        url,
        mainEntityOfPage: url,
        inLanguage: "en",
        author: personRef,
        publisher: orgRef,
        ...(datePublished && { datePublished }),
        ...(dateModified && { dateModified }),
        ...(isPartOf && { isPartOf }),
      },
      breadcrumbList(crumbs),
    ],
  };
}

/** Free, in-browser developer tools. `related` lists the sibling tools the
 * page links to, emitted as an ItemList. */
export function webApplication({
  name,
  description,
  path,
  crumbs,
  related = [],
}: {
  name: string;
  description: string;
  path: string;
  crumbs: Crumb[];
  related?: { name: string; path: string }[];
}) {
  return {
    "@context": CONTEXT,
    "@graph": [
      {
        // Product too, for crawlers that classify tool pages as products;
        // the free Offer below keeps it accurate.
        "@type": ["WebApplication", "Product"],
        name,
        description,
        url: abs(path),
        applicationCategory: "DeveloperApplication",
        operatingSystem: "Any",
        browserRequirements: "Requires JavaScript",
        isAccessibleForFree: true,
        offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
        author: personRef,
        publisher: orgRef,
      },
      breadcrumbList(crumbs),
      ...(related.length ? [itemListNode("More tools", path, related)] : []),
    ],
  };
}
