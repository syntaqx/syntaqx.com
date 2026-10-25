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
  stack?: string;
}

/** What the public page and PDF show. */
export const PUBLIC_CONTACT: ResumeContact = {
  location: "Remote",
  email: CONTACT_EMAIL,
};

export const resume = {
  name: "Chase Pierce",
  title: "Software Architect · Engineering Leader",
  links: [
    { label: "syntaqx.com", href: SITE_URL },
    {
      label: "linkedin.com/in/syntaqx",
      href: "https://www.linkedin.com/in/syntaqx/",
    },
    { label: "github.com/syntaqx", href: "https://github.com/syntaqx" },
  ],
  summary: [
    "Architect at heart, open sorcerer, and your favorite internet junkie. I'm an engineer first and a leader by consequence, with more than two decades across consumer platforms, high-growth startups, and the platforms businesses actually run on. The systems I build ship faster because I invest in the patterns that make the right thing the easy thing, and throw fewer fires because the platform prevents them. The engineers around them grow into leaders because I model the work and give them cover to fail well. I'm still in PRs, still architecting the systems the business runs on, still in the room when a hard design call lands, because the title is downstream of the work, not a replacement for it.",
    "I've worked on every layer of the stack, from the UI users touch to the infrastructure that keeps it running, and I lead like it. I obsess over what compounds: architecture that enables, developer experience that multiplies, and the operating cadence that lets growth survive scale.",
    "I've proven it at both ends of the spectrum: platforms serving hundreds of millions of daily users where a bad deployment is a public incident, and greenfield builds taken from first commit to running the business across its core domains and millions of lines of production code, including the money-moving parts where correctness isn't negotiable. Engineering scorecards with quantifiable KPIs across reliability, impact, delivery, leverage, and security, because what gets measured improves. The work changes shape at every scale. The discipline doesn't.",
  ],
  skillsIntro: "Not a wishlist, a working set",
  skills: [
    {
      label: "Languages",
      items: "Go, TypeScript, JavaScript, PHP, Python, Bash",
    },
    {
      label: "Databases",
      items:
        "Postgres, CockroachDB, Timescale, ClickHouse, MySQL/MariaDB, Redis",
    },
    {
      label: "Messaging & APIs",
      items: "REST, gRPC, GraphQL, AMQP/RabbitMQ, Kafka, webhooks at scale",
    },
    {
      label: "Platform & Infra",
      items:
        "Docker, Kubernetes, ECS, microVMs, Nomad, Traefik, the Hashistack",
    },
    {
      label: "Cloud",
      items: "AWS, Google Cloud, DigitalOcean, Vercel, Cloudflare",
    },
    {
      label: "Observability",
      items:
        "Prometheus, Elastic (ELK), OpenTelemetry, Datadog, Sentry, PagerDuty",
    },
    {
      label: "IaC & Delivery",
      items: "Terraform, Pulumi, Packer, GitHub Actions, CircleCI",
    },
  ],
  experience: [
    {
      company: "Aptive",
      title: "VP, Software Engineering",
      start: "Sep 2023",
      end: "Sep 2026",
      progression: [
        "Principal Software Architect (2023)",
        "Sr. Director (2025)",
        "VP, Software Engineering (2026)",
      ],
      highlights: [
        "Architected Aspyn, a greenfield internal platform spanning product domains across the business, including CRM, Field Service, Pay, Sales, Communications, Licensing, Platform, and more. Built on Go, PHP/Laravel, React/TypeScript, Postgres/Aurora, AMQP, and AWS ECS/EKS.",
        "Led a 14-month greenfield-to-GA migration off an incumbent third-party vendor: 76 service centers and 1M customer accounts cut over with zero rollbacks and zero data-loss incidents.",
        "Scaled delivery to all 76 service centers and 1M active customers while holding a 99.95% uptime SLO; ran incident command across engineering and DevOps.",
        "Overhauled the engineering SDLC to cut low-value metawork and let teams ship faster with work they enjoyed more, backed by quantifiable KPIs across reliability, delivery, security, and developer experience.",
      ],
    },
    {
      company: "Entrata",
      title: "Software Architect",
      start: "May 2021",
      end: "Sep 2023",
      stack: "PHP/Laravel, Postgres, AMQP, React, AWS, On-Prem Datacenter",
    },
    {
      company: "TruGolf",
      title: "Principal Software Engineer",
      start: "Jan 2020",
      end: "Apr 2021",
      stack:
        "Go, Postgres, Vue.js, Docker, Kubernetes, Docker Swarm, Traefik, Terraform, GCP, AWS, DigitalOcean",
    },
    {
      company: "Outdoorsy",
      title: "Senior Backend Engineer",
      start: "Feb 2019",
      end: "Oct 2019",
      stack:
        "Docker (Swarm), Kubernetes, Hashistack, Go, gRPC, Postgres, Heroku, DigitalOcean, AWS, GCP",
    },
    {
      company: "Even",
      title: "Senior Infrastructure Engineer",
      start: "Jul 2018",
      end: "Dec 2018",
      stack:
        "Go, gRPC, Postgres, Docker, Kubernetes, Terraform, AWS, GCP, CircleCI, Codefresh",
    },
    {
      company: "Imgur",
      title: "Senior Software Engineer",
      start: "Oct 2016",
      end: "May 2018",
      stack:
        "Go, PHP 7, MySQL, Node.js, AWS, Docker, Chef, Kubernetes, ElasticSearch (ELK), Redis, AMQP, OTEL",
    },
    {
      company: "Riot Games",
      title: "Software Engineer",
      start: "May 2014",
      end: "Jul 2016",
      stack: "Go, PHP, MySQL, jQuery, Redis, AWS, Packer, Docker, Hadoop",
    },
  ] satisfies ResumeJob[],
  education: {
    selfTaught: {
      title: "Self-taught software engineer",
      details:
        "Writing code since age 11; mentored through a development internship at a local news station as a teenager.",
    },
    schools: [
      {
        name: "Granite Technical Institute",
        program: "3D Animation & Modeling, Information Technology",
        start: "2005",
        end: "2006",
        details:
          "Concurrent enrollment (grade 10): 3D Animation; Computer Programming",
      },
    ],
  },
  more: {
    text: "Full experience available on",
    label: "linkedin.com/in/syntaqx",
    href: "https://www.linkedin.com/in/syntaqx/",
  },
};
