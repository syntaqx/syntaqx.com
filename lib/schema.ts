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
      },
      {
        ...personRef,
        alternateName: "syntaqx",
        jobTitle: "Software Engineering Leader",
        description: personDescription,
        sameAs,
        contactPoint,
      },
    ],
  };
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
  return {
    "@context": CONTEXT,
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
}: {
  type?: "TechArticle" | "Article";
  headline: string;
  description: string;
  path: string;
  crumbs: Crumb[];
  datePublished?: string;
}) {
  const url = abs(path);
  return {
    "@context": CONTEXT,
    "@graph": [
      {
        "@type": type,
        headline,
        description,
        url,
        mainEntityOfPage: url,
        inLanguage: "en",
        author: personRef,
        publisher: orgRef,
        ...(datePublished && { datePublished }),
      },
      breadcrumbList(crumbs),
    ],
  };
}

/** Free, in-browser developer tools. */
export function webApplication({
  name,
  description,
  path,
  crumbs,
}: {
  name: string;
  description: string;
  path: string;
  crumbs: Crumb[];
}) {
  return {
    "@context": CONTEXT,
    "@graph": [
      {
        "@type": "WebApplication",
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
    ],
  };
}
