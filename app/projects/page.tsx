import { Code, ExternalLink, Rocket, Users } from "lucide-react";
import { Card } from "@/components/card";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Projects",
  description:
    "Open-source projects, tools, and experiments I've built and maintain, from static servers and developer utilities to the occasional community effort.",
};

const launched = [
  {
    title: "Flagon",
    description:
      "A source-available, self-hostable developer platform that brings your projects, environments, and teams together with the products you'd otherwise buy or build stitched right in.",
    tags: ["platform", "self-hosted", "developer-tools"],
    url: "https://flagon.io",
  },
  {
    title: "yourpasswordsucks.com",
    description:
      "A tongue-in-cheek single-page site that checks your password and tells you, honestly, how much it sucks.",
    tags: ["html", "security", "passwords", "open source"],
    url: "https://yourpasswordsucks.com",
  },
];

const community = [
  {
    title: "Salt Lake City Developers",
    description:
      "A meetup community for developers in Salt Lake City to connect, share ideas, and talk shop.",
    tags: ["community", "meetup", "slc"],
    url: "https://slcdevs.com",
  },
];

const projects = [
  {
    title: "serve",
    description: "A static http server anywhere you need one.",
    tags: ["cli", "http", "static-site", "open source"],
    url: "https://github.com/syntaqx/serve",
  },
  {
    title: "cookie",
    description:
      "A Go package that provides a simple and helpful way to populate structs from Cookies.",
    tags: ["cookie", "go", "open source"],
    url: "https://github.com/syntaqx/cookie",
  },
  {
    title: "env",
    description:
      "A simple and helpful way to interact with environment variables in Go.",
    tags: ["env", "dotenv", "go", "open source"],
    url: "https://github.com/syntaqx/env",
  },
  {
    title: "setup-kustomize",
    description:
      "A GitHub Action to download and install kustomize, and add it to your $PATH.",
    tags: ["github-action", "kustomize"],
    url: "https://github.com/syntaqx/setup-kustomize",
  },
  {
    title: "capacitor",
    description:
      "An adaptive HTTP client for Go that automatically adjusts concurrency based on rate limiting and capacity signaling headers.",
    tags: ["go", "http", "rate-limiting", "open source"],
    url: "https://github.com/syntaqx/capacitor",
  },
  {
    title: "nullable",
    description:
      "A single generic type for values that may be null in Go, with first-class support for JSON and database/sql.",
    tags: ["go", "generics", "json", "open source"],
    url: "https://github.com/syntaqx/nullable",
  },
];

export default function ProjectsPage() {
  return (
    <div>
      {/* Launched */}
      <section className="mb-16">
        <h2 className="text-xs font-medium uppercase tracking-widest text-dim mb-6 flex items-center gap-2">
          <Rocket size={12} className="text-accent" />
          Launched
        </h2>
        <div className="grid gap-3 sm:grid-cols-2">
          {launched.map((item) => (
            <a
              key={item.title}
              href={item.url}
              target="_blank"
              rel="noopener noreferrer"
              className="group flex flex-col"
            >
              <Card hover className="flex flex-col h-full">
                <div className="flex items-center justify-between mb-2">
                  <h2 className="text-sm font-medium text-accent">
                    {item.title}
                  </h2>
                  <ExternalLink
                    size={12}
                    className="text-dim group-hover:text-accent transition-colors"
                  />
                </div>
                <p className="text-xs text-dim leading-relaxed line-clamp-2 min-h-[2lh]">
                  {item.description}
                </p>
                <div className="mt-3 flex flex-wrap gap-1">
                  {item.tags.map((tag) => (
                    <span
                      key={tag}
                      className="inline-block rounded border border-border px-1.5 py-0.5 text-[10px] text-dim"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </Card>
            </a>
          ))}
        </div>
      </section>

      {/* Open Source */}
      <section className="mb-16">
        <h2 className="text-xs font-medium uppercase tracking-widest text-dim mb-6 flex items-center gap-2">
          <Code size={12} className="text-accent" />
          Open Source
        </h2>
        <div className="grid gap-3 sm:grid-cols-2">
          {projects.map((project) => (
            <a
              key={project.title}
              href={project.url}
              target="_blank"
              rel="noopener noreferrer"
              className="group flex flex-col"
            >
              <Card hover className="flex flex-col h-full">
                <div className="flex items-center justify-between mb-2">
                  <h2 className="text-sm font-medium text-accent">
                    {project.title}
                  </h2>
                  <ExternalLink
                    size={12}
                    className="text-dim group-hover:text-accent transition-colors"
                  />
                </div>
                <p className="text-xs text-dim leading-relaxed line-clamp-2 min-h-[2lh]">
                  {project.description}
                </p>
                <div className="mt-3 flex flex-wrap gap-1">
                  {project.tags.map((tag) => (
                    <span
                      key={tag}
                      className="inline-block rounded border border-border px-1.5 py-0.5 text-[10px] text-dim"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </Card>
            </a>
          ))}
        </div>
      </section>

      {/* Community */}
      <section>
        <h2 className="text-xs font-medium uppercase tracking-widest text-dim mb-6 flex items-center gap-2">
          <Users size={12} className="text-accent" />
          Community
        </h2>
        <div className="grid gap-3 sm:grid-cols-2">
          {community.map((item) => (
            <a
              key={item.title}
              href={item.url}
              target="_blank"
              rel="noopener noreferrer"
              className="group flex flex-col"
            >
              <Card hover className="flex flex-col h-full">
                <div className="flex items-center justify-between mb-2">
                  <h2 className="text-sm font-medium text-accent">
                    {item.title}
                  </h2>
                  <ExternalLink
                    size={12}
                    className="text-dim group-hover:text-accent transition-colors"
                  />
                </div>
                <p className="text-xs text-dim leading-relaxed line-clamp-2 min-h-[2lh]">
                  {item.description}
                </p>
                <div className="mt-3 flex flex-wrap gap-1">
                  {item.tags.map((tag) => (
                    <span
                      key={tag}
                      className="inline-block rounded border border-border px-1.5 py-0.5 text-[10px] text-dim"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </Card>
            </a>
          ))}
        </div>
      </section>
    </div>
  );
}
