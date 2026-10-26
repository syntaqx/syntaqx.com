// The resume, as data. /resume, /resume.pdf, the Markdown version and the
// private PDF (npm run resume:pdf) all render from this file, so editing it
// is how the resume changes. Keep private details out: the phone number and
// home address live only in the gitignored .private/resume.json.
import { CONTACT_EMAIL, SITE_URL } from "@/lib/constants";

export interface ResumeContact {
  location: string;
  email: string;
  phone?: string;
}

export interface ResumeJob {
  company: string;
  /** The title held last; earlier titles go in `progression`. */
  title: string;
  start: string;
  end: string;
  /** Every promotion, with the year it happened. */
  progression?: string[];
  highlights?: string[];
}

/** What the public page and PDF show. */
export const PUBLIC_CONTACT: ResumeContact = {
  location: "Remote",
  email: CONTACT_EMAIL,
};

export const resume = {
  name: "Chase Pierce",
  title: "Software Architect · Engineering Executive",
  links: [
    { label: "syntaqx.com", href: SITE_URL },
    {
      label: "linkedin.com/in/syntaqx",
      href: "https://www.linkedin.com/in/syntaqx/",
    },
    { label: "github.com/syntaqx", href: "https://github.com/syntaqx" },
  ],
  summary: [
    "Engineer first and leader by consequence, with 20+ years across consumer platforms, high-growth startups, and the platforms businesses run on. I architect distributed systems that ship faster because the patterns make the right thing the easy thing, and break less because the platform prevents the fires. I've worked every layer of the stack, from platforms serving hundreds of millions of daily users to greenfield builds taken from first commit to running the business, money-moving systems included. Still in the PRs and the hard design calls, because the title is downstream of the work.",
  ],
  skillsIntro: "Not a wishlist, a working set",
  // PDF metadata some parsers index: only titles held and skills used.
  keywords: [
    "Software Architect",
    "Principal Software Architect",
    "Vice President of Software Engineering",
    "VP of Software Engineering",
    "Engineering Leadership",
    "AI-Native SDLC",
    "System Design",
    "Distributed Systems",
    "Platform Engineering",
    "Cloud Architecture",
    "Microservices",
    "DevOps",
    "Go",
    "TypeScript",
    "React",
    "PHP",
    "Postgres",
    "AWS",
    "Kubernetes",
    "Terraform",
  ],
  skills: [
    {
      label: "Architecture",
      items:
        "System design, distributed systems, microservices, event-driven architecture, greenfield platforms, legacy migrations, multi-cloud infrastructure",
    },
    {
      label: "Leadership",
      items:
        "Technical strategy, architecture review (RFCs), incident command, service level objectives (SLOs), engineering KPIs, AI-native SDLC design, mentoring",
    },
    {
      label: "Languages & Frameworks",
      items:
        "Go, TypeScript, JavaScript, PHP, Python, Bash, React, Vue.js, Node.js, Laravel",
    },
    {
      label: "Data",
      items:
        "Postgres, CockroachDB, Timescale, ClickHouse, MySQL/MariaDB, MongoDB, SQLite, Redis, Elasticsearch, Hadoop",
    },
    {
      label: "Messaging & APIs",
      items: "REST, gRPC, GraphQL, AMQP/RabbitMQ, Kafka, webhooks at scale",
    },
    {
      label: "Platform & Infra",
      items:
        "Docker, Docker Swarm, Kubernetes, ECS, microVMs, Traefik, Nomad, Consul, Vault",
    },
    {
      label: "Cloud",
      items:
        "AWS, Google Cloud (GCP), DigitalOcean, Heroku, Vercel, Cloudflare, on-prem datacenters",
    },
    {
      label: "Observability",
      items:
        "Prometheus, Elastic (ELK), OpenTelemetry, Jaeger, Datadog, Sentry, PagerDuty",
    },
    {
      label: "IaC & Delivery",
      items:
        "Terraform, Pulumi, Packer, Chef, CI/CD, GitHub Actions, CircleCI, Codefresh",
    },
  ],
  experience: [
    {
      company: "Aptive",
      // Spelled out: parsers match "Vice"/"VP" as whole words, and "VP," isn't one.
      title: "Vice President, Software Engineering",
      start: "Sep 2025",
      end: "Sep 2026",
      progression: [
        "Senior Director, Software Engineering (Sep 2025)",
        "Vice President, Software Engineering (Mar 2026)",
      ],
      highlights: [
        "Led a 43-person department through four direct reports across product engineering, platform engineering, DevOps, and QA; grew the inherited team with six engineering hires.",
        "Scaled Aspyn's delivery and product offerings to all 76 service centers and 1M active customers while holding a 99.95% uptime SLO; ran incident command across engineering and DevOps.",
        "Introduced the engineering Forge: KPI scorecards across reliability, delivery, impact, leverage, and security, built on issue and pull request flow, holding teams accountable for reviews, rollbacks, and rework, and estimating GitHub spend per change.",
        "Moved the organization to an AI-native, API-first SDLC with AI as a core product feature, cutting low-value metawork.",
      ],
    },
    {
      company: "Aptive",
      title: "Principal Software Architect",
      start: "Sep 2023",
      end: "Sep 2025",
      highlights: [
        "Architected and led Aspyn, a greenfield platform processing $500M+ in annual recurring revenue (ARR) across seven domains (CRM, Field Service, Pay, Sales, Communications, Licensing, Platform) on Go, PHP, React, Postgres, RabbitMQ, and AWS.",
        "Delivered a 14-month greenfield-to-GA migration off legacy vendor systems: 76 service centers and 1M customer accounts cut over with zero rollbacks and zero data-loss incidents.",
        "Designed Pay as an adapter over Stripe, which held card data and kept PCI DSS scope minimal.",
      ],
    },
    {
      company: "Entrata",
      title: "Software Architect",
      start: "May 2021",
      end: "Sep 2023",
      progression: [
        "Cloud Architect (May 2021)",
        "DevOps Architect (Dec 2021)",
        "Software Architect (Oct 2022)",
      ],
      highlights: [
        "Led containerization and moved the core monolithic repository onto GitHub Actions CI/CD.",
        "Partnered with teams to break services out of the monolith, including the Pay domain, into Laravel services with real continuous deployment, paying down decades of tech debt and modernizing the UI and UX with React.",
      ],
    },
    {
      company: "TruGolf",
      title: "Principal Software Engineer",
      start: "Jan 2020",
      end: "Apr 2021",
      highlights: [
        "Owned the marketing website and player interactions with E6Connect, stabilizing the existing Go backends.",
        "Modernized peer-to-peer multiplayer and built an engine-agnostic multiplayer service for E6Golf's online play.",
      ],
    },
    {
      company: "Outdoorsy",
      title: "Senior Backend Engineer",
      start: "Feb 2019",
      end: "Oct 2019",
      highlights: [
        "Built a Docker Swarm platform that moved services off Heroku to stateless, Docker-first architecture; owned CI/CD, repo automation, and security tooling, and trained the team through it.",
      ],
    },
    {
      company: "Even",
      title: "Senior Infrastructure Engineer",
      start: "Jul 2018",
      end: "Dec 2018",
      highlights: [
        "Defined the engineering infrastructure alongside the CTO as the sole DevOps, security, operations, and IT engineer, building a stable, testable, continuously delivered platform as the team grew.",
      ],
    },
    {
      company: "Imgur",
      title: "Senior Software Engineer",
      start: "Oct 2016",
      end: "May 2018",
      highlights: [
        "Designed a scalable microservice architecture to replace the legacy monolith, led the company's migration to Go, and shipped Messaging, Favorite Folders, and Video Upload.",
      ],
    },
    {
      company: "Riot Games",
      title: "Software Engineer",
      start: "May 2014",
      end: "Jul 2016",
      highlights: [
        "Built the Amazon integration that gave players a free champion for claiming League of Legends on Amazon.",
        "Shipped the global RiotBar used across every Riot Games website, and the in-house CMS for League of Legends Universe.",
        "Worked on the in-game content management and delivery system, and the client's move from legacy Flash to HTML5.",
      ],
    },
  ] satisfies ResumeJob[],
  // Listed compactly: title, company and dates only.
  earlier: [
    {
      title: "Developer",
      company: "Bluehost",
      start: "Nov 2013",
      end: "May 2014",
    },
    {
      title: "Web Developer",
      company: "BetterServers",
      start: "Nov 2012",
      end: "Jun 2013",
    },
    {
      title: "Head of Information Technology",
      company: "SoftwareMedia.com",
      start: "Apr 2011",
      end: "Oct 2012",
    },
  ],
  education: {
    selfTaught: {
      title: "Self-taught software engineer",
      details:
        "Writing code since age 11; mentored through a development internship at a local news station as a teenager.",
    },
  },
  more: {
    text: "Full experience available on",
    label: "linkedin.com/in/syntaqx",
    href: "https://www.linkedin.com/in/syntaqx/",
  },
};
