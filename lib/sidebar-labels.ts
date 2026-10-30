/**
 * Short names for docs categories and book parts in the sidebar, where the
 * full name doesn't fit one line of the 248px rail in Michroma caps. Pages
 * and covers keep the full name. Keyed by the full name, shared across books.
 */
export const SIDEBAR_LABELS: Record<string, string> = {
  // Docs categories
  "Engineering Practice": "Engineering",
  "Requests & Responses": "Requests",
  "Telemetry & Analytics": "Telemetry",

  // Book parts
  "Abuse, Trust and the Law": "Abuse and Law",
  "Backend and Live Services": "Live Services",
  "Catalog and Pricing": "Catalog",
  "Clients and Delivery": "Clients",
  "Communications Platforms": "Communications",
  "Communities and Conversation": "Communities",
  "Creators and Money": "Creator Money",
  "Customers and Billing": "Billing",
  "Fair Play and Safety": "Fair Play",
  "How Games Get Made": "Making Games",
  "How the Work Flows": "How Work Flows",
  "Infrastructure as Code": "Infra as Code",
  "Market Rules and Compliance": "Compliance",
  "Marketing and Customers": "Marketing",
  "Metering and Billing": "Metering",
  "On-Demand Delivery": "On-Demand",
  "Orders, Inventory and Fulfillment": "Fulfillment",
  "Other Property Types": "Property Types",
  "Peer-to-Peer Marketplaces": "P2P Marketplaces",
  "Point of Sale and Stores": "Point of Sale",
  "Properties, Owners and Investors": "Properties",
  "Rent and Resident Money": "Rent and Money",
  "Running a Provider": "The Provider",
  "Running the Platform": "The Platform",
  "Running the Provider": "The Provider",
  "Scheduling and Routing": "Scheduling",
  "Social and Short-Form": "Short-Form",
  "Storefront and Checkout": "Storefront",
  "Subscriptions and Memberships": "Subscriptions",
  "The Stack, Bottom to Top": "The Stack",
  "Wholesale and B2B": "Wholesale",
};

/** The longest name that fits: about 160px of Michroma caps at the rail's size. */
export const SIDEBAR_LABEL_MAX = 16;

export const sidebarLabel = (name: string) => SIDEBAR_LABELS[name] ?? name;
