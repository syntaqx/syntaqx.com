import { Code, ExternalLink, Users } from "lucide-react";
import { Card } from "@/components/card";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Projects",
};

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
];

export default function ProjectsPage() {
  return (
    <div>
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
