import { ArrowUpRight } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { pageMetadata } from "@/lib/metadata";
import { cn } from "@/lib/cn";

export const metadata = pageMetadata(
  "/projects",
  "Projects",
  "Open-source projects, tools, and experiments I've built and maintain, from static servers and developer utilities to the occasional community effort.",
);

interface Project {
  title: string;
  description: string;
  tags: string[];
  url: string;
  /** Short instrument line above the title on cards. */
  kicker?: string;
}

const launched: (Project & { lead?: boolean })[] = [
  {
    title: "Flagon, Inc.",
    kicker: "founder · company",
    description:
      "The company I wish existed, so I made it real. A small, independent software company making good software, in the open: the handbook, the pay, and the way we decide are all public. The products can speak for themselves.",
    tags: ["company", "in the open", "cost + 20%"],
    url: "https://flagon.io",
    lead: true,
  },
  {
    title: "yourpasswordsucks.com",
    kicker: "site",
    description:
      "A tongue-in-cheek single-page site that checks your password and tells you, honestly, how much it sucks.",
    tags: ["html", "security", "passwords", "open source"],
    url: "https://yourpasswordsucks.com",
  },
];

const community: Project[] = [
  {
    title: "Salt Lake City Developers",
    kicker: "founder · meetup",
    description:
      "A meetup community for developers in Salt Lake City to connect, share ideas, and talk shop.",
    tags: ["community", "meetup", "slc"],
    url: "https://slcdevs.com",
  },
];

// Wide cards keep the grid's rows full: on two columns yoink takes a row of
// its own; on three, yoink and capacitor each take two of a row's three cells.
const projects: (Project & { wide?: string })[] = [
  {
    title: "yoink",
    kicker: "go · cli",
    description:
      "Clone every repository in an organization, and keep them all up to date with one command. A Go CLI for GitHub and Azure DevOps.",
    tags: ["git", "github", "azure-devops"],
    url: "https://github.com/syntaqx/yoink",
    wide: "md:col-span-2",
  },
  {
    title: "nullable",
    kicker: "go · package",
    description:
      "A single generic type for values that may be null in Go, with first-class support for JSON and database/sql.",
    tags: ["generics", "json", "sql"],
    url: "https://github.com/syntaqx/nullable",
  },
  {
    title: "serve",
    kicker: "cli",
    description: "A static http server anywhere you need one.",
    tags: ["http", "static-site"],
    url: "https://github.com/syntaqx/serve",
  },
  {
    title: "cookie",
    kicker: "go · package",
    description:
      "A Go package that provides a simple and helpful way to populate structs from Cookies.",
    tags: ["cookie", "http"],
    url: "https://github.com/syntaqx/cookie",
  },
  {
    title: "env",
    kicker: "go · package",
    description: "A simple and helpful way to interact with environment variables in Go.",
    tags: ["env", "dotenv"],
    url: "https://github.com/syntaqx/env",
  },
  {
    title: "setup-kustomize",
    kicker: "github action",
    description: "A GitHub Action to download and install kustomize, and add it to your $PATH.",
    tags: ["kustomize", "ci"],
    url: "https://github.com/syntaqx/setup-kustomize",
  },
  {
    title: "capacitor",
    kicker: "go · package",
    description:
      "An adaptive HTTP client for Go that automatically adjusts concurrency based on rate limiting and capacity signaling headers.",
    tags: ["http", "rate-limiting"],
    url: "https://github.com/syntaqx/capacitor",
    wide: "lg:col-span-2",
  },
];

function Tags({ tags }: { tags: string[] }) {
  return (
    <ul className="flex flex-wrap gap-x-4 gap-y-1">
      {tags.map((tag) => (
        <li key={tag} className="inst text-muted-foreground">
          {tag}
        </li>
      ))}
    </ul>
  );
}

/** A slanted card: the face leans, the content stays upright. */
function SlantCard({ item, lead = false }: { item: Project; lead?: boolean }) {
  return (
    <a
      href={item.url}
      target="_blank"
      rel="noopener noreferrer"
      className="group relative isolate flex h-full min-w-0 flex-col p-7  sm:px-10"
    >
      {/* The face leans; its accent bar is a child, so it leans with it. */}
      <span
        aria-hidden="true"
        className={cn(
          "absolute inset-0 -z-10 border transition-colors before:absolute before:-top-px before:left-0 before:h-0.5 before:w-12 before:bg-primary before:transition-[width] before:duration-300 before:ease-out group-hover:before:w-full md:slant",
          lead
            ? "beams border-primary/50 bg-card group-hover:border-primary"
            : "border-border bg-card group-hover:border-border-hover",
        )}
      />
      <span className="mb-4 flex items-center justify-between gap-4">
        <span className={cn("inst", lead ? "text-primary" : "text-muted-foreground")}>
          {item.kicker}
        </span>
        <ArrowUpRight
          size={16}
          className="text-muted-foreground transition-[color,translate] group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-primary"
        />
      </span>
      <h3
        className={cn(
          "mb-3 wrap-break-word text-foreground transition-colors group-hover:text-primary",
          lead ? "text-3xl sm:text-4xl" : "text-2xl sm:text-3xl",
          "leading-[0.95]",
        )}
      >
        {item.title}
      </h3>
      <p className={cn("mb-6 text-[0.95rem] leading-relaxed text-subtle", lead && "max-w-xl")}>
        {item.description}
      </p>
      <div className="mt-auto">
        <Tags tags={item.tags} />
      </div>
    </a>
  );
}

function SectionHead({ label, count }: { label: string; count: number }) {
  return (
    <div className="mb-8 flex items-center gap-4">
      <h2 className="eyebrow">{label}</h2>
      <span className="h-px flex-1 bg-border" />
      <span className="inst text-muted-foreground tabular-nums">
        {String(count).padStart(2, "0")}
      </span>
    </div>
  );
}

export default function ProjectsPage() {
  return (
    <div>
      <PageHeader
        label="projects"
        title="Things I've built"
        scene="modules"
        sceneLabel="Modules on a grid, with a teal block being lowered into an empty slot"
      >
        <p>
          Companies, open-source projects, tools, and experiments I&apos;ve built and maintain, from
          static servers and developer utilities to the occasional community effort.
        </p>
      </PageHeader>

      <section className="mb-20">
        <SectionHead label="launched" count={launched.length} />
        <div className="grid grid-cols-[minmax(0,1fr)] gap-6 md:px-8 md:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)]">
          {launched.map((item) => (
            <SlantCard key={item.title} item={item} lead={item.lead} />
          ))}
        </div>
      </section>

      <section className="mb-20">
        <SectionHead label="open source" count={projects.length} />
        <div className="grid grid-cols-[minmax(0,1fr)] gap-6 md:grid-cols-2 md:px-8 lg:grid-cols-3">
          {projects.map((p) => (
            <div key={p.title} className={cn("min-w-0", p.wide)}>
              <SlantCard item={p} />
            </div>
          ))}
        </div>
      </section>

      <section>
        <SectionHead label="community" count={community.length} />
        <div className="grid grid-cols-[minmax(0,1fr)] gap-6 md:px-8 md:grid-cols-[minmax(0,1fr)_minmax(0,1.5fr)]">
          {community.map((item) => (
            <SlantCard key={item.title} item={item} />
          ))}
        </div>
      </section>
    </div>
  );
}
