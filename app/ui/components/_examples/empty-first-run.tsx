"use client";

import { useState } from "react";
import { FolderPlus, RotateCcw } from "lucide-react";
import { Button } from "@/registry/syntaqx/ui/button";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/registry/syntaqx/ui/empty";

const SAMPLE_PROJECTS = ["checkout-api", "marketing-site", "billing-worker"];

export default function EmptyFirstRun() {
  const [projects, setProjects] = useState<string[]>([]);

  return (
    <div className="w-full max-w-md rounded-lg border">
      {projects.length === 0 ? (
        <Empty>
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <FolderPlus />
            </EmptyMedia>
            <EmptyTitle>No projects yet</EmptyTitle>
            <EmptyDescription>
              A project groups the services you deploy together, so their logs and alerts live in
              one place.
            </EmptyDescription>
          </EmptyHeader>
          <EmptyContent className="flex-row flex-wrap justify-center gap-2">
            <Button onClick={() => setProjects(["new-project"])}>Create a project</Button>
            <Button variant="outline" onClick={() => setProjects(SAMPLE_PROJECTS)}>
              Load sample projects
            </Button>
          </EmptyContent>
        </Empty>
      ) : (
        <>
          <ul className="divide-y">
            {projects.map((p) => (
              <li key={p} className="px-4 py-3 font-mono text-sm">
                {p}
              </li>
            ))}
          </ul>
          <div className="border-t p-4">
            <Button variant="outline" size="sm" onClick={() => setProjects([])}>
              <RotateCcw /> Reset
            </Button>
          </div>
        </>
      )}
    </div>
  );
}
