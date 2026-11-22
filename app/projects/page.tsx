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
    tags: ["company", "in the open"],
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

// Open source is an index, not more cards, so it reads apart from the
// slanted cards above and below it.
const projects: Omit<Project, "tags">[] = [
  {
    title: "yoink",
    kicker: "go · cli",
    description:
      "Clone every repository in an organization, and keep them all up to date with one command. A Go CLI for GitHub and Azure DevOps.",
    url: "https://github.com/syntaqx/yoink",
  },
  {
    title: "nullable",
    kicker: "go · package",
    description:
      "A single generic type for values that may be null in Go, with first-class support for JSON and database/sql.",
    url: "https://github.com/syntaqx/nullable",
  },
  {
    title: "serve",
    kicker: "cli",
    description: "A static http server anywhere you need one.",
    url: "https://github.com/syntaqx/serve",
  },
  {
    title: "cookie",
    kicker: "go · package",
    description:
      "A Go package that provides a simple and helpful way to populate structs from Cookies.",
    url: "https://github.com/syntaqx/cookie",
  },
  {
    title: "env",
    kicker: "go · package",
    description: "A simple and helpful way to interact with environment variables in Go.",
    url: "https://github.com/syntaqx/env",
  },
  {
    title: "setup-kustomize",
    kicker: "github action",
    description: "A GitHub Action to download and install kustomize, and add it to your $PATH.",
    url: "https://github.com/syntaqx/setup-kustomize",
  },
  {
    title: "capacitor",
    kicker: "go · package",
    description:
      "An adaptive HTTP client for Go that automatically adjusts concurrency based on rate limiting and capacity signaling headers.",
    url: "https://github.com/syntaqx/capacitor",
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

/**
 * One numbered row of the open source index. Wide screens give it columns and
 * cut the description to one line so rows stay one height; phones stack it.
 */
function IndexRow({ item, n }: { item: Omit<Project, "tags">; n: number }) {
  return (
    <li>
      <a
        href={item.url}
        target="_blank"
        rel="noopener noreferrer"
        className="group relative grid grid-cols-[2.25rem_minmax(0,1fr)_auto] items-baseline gap-x-5 gap-y-1 border-b border-border px-3 py-4.5 transition-colors after:absolute after:inset-x-0 after:-bottom-px after:h-px after:origin-left after:scale-x-0 after:bg-primary after:transition-transform after:duration-300 after:ease-out hover:bg-card hover:after:scale-x-100 lg:grid-cols-[2.5rem_11rem_8.5rem_minmax(0,1fr)_1rem] lg:items-center"
      >
        <span className="inst tabular-nums text-muted-foreground">
          {String(n).padStart(2, "0")}
        </span>
        <span className="flex flex-wrap items-baseline gap-x-4 gap-y-1 lg:contents">
          <h3 className="text-2xl text-foreground transition-colors group-hover:text-primary">
            {item.title}
          </h3>
          <span className="inst text-muted-foreground">{item.kicker}</span>
        </span>
        <span className="col-start-2 min-w-0 text-[0.95rem] leading-relaxed text-subtle lg:col-auto lg:truncate">
          {item.description}
        </span>
        <ArrowUpRight
          size={16}
          className="col-start-3 row-start-1 self-center text-muted-foreground transition-[color,translate] group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-primary lg:col-auto lg:row-auto"
        />
      </a>
    </li>
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
        <ol className="border-t border-border md:mx-8">
          {projects.map((p, i) => (
            <IndexRow key={p.title} item={p} n={i + 1} />
          ))}
        </ol>
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
