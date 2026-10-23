/**
 * Industry volumes: the playbook applied to one industry's rules. Each lives
 * under content/docs/industries/<name>/, which makes its section
 * "industries-<name>" and gives it its own sidebar.
 */

/** Industries with a volume planned but not written yet, shown as "Soon". */
export const UPCOMING_INDUSTRIES = [
  "Field Service",
  "Property Tech",
  "Marketplaces",
  "Consumer Fintech",
  "Gaming",
  "Media & UGC",
  "Web Hosting",
  "E-commerce",
];

export const isIndustry = (section: string) => section.startsWith("industries-");

/** "Payments Industry" reads as "Payments" in a list of industries. */
export const industryName = (category: string) => category.replace(/ Industry$/, "");
