/** The legal documents, for their pages, the /legal index and each other's pager. */
export interface LegalDoc {
  href: string;
  title: string;
  /** One line for the index card and the page header. */
  summary: string;
  /** When its content last changed, as shown on the page. */
  updated: string;
}

export const TERMS: LegalDoc = {
  href: "/legal/terms",
  title: "Terms of Service",
  summary:
    "What you can expect from the site and what I expect from visitors. Plain language, no surprises.",
  updated: "November 2026",
};

export const PRIVACY: LegalDoc = {
  href: "/legal/privacy",
  title: "Privacy",
  summary:
    "What's collected, what isn't, and the choices you have. I try to collect as little as possible.",
  updated: "November 2026",
};

export const LEGAL_DOCS = [TERMS, PRIVACY];
