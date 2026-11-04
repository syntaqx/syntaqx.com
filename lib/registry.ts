import { readFileSync } from "node:fs";
import { join } from "node:path";
import { SITE_URL } from "@/lib/constants";
import registry from "@/registry.json";

export interface RegistryFile {
  path: string;
  /** Where the shadcn CLI puts it in an app with default aliases. */
  target: string;
  source: string;
}

export interface RegistryItem {
  name: string;
  title: string;
  description: string;
  dependencies: string[];
  /** Other items it installs: shadcn names, or this registry's item URLs. */
  registryDependencies: string[];
  files: RegistryFile[];
  command: string;
}

// The shadcn CLI rewrites these imports to the installing app's aliases;
// the manual install shows what it would write.
export const toAppImports = (source: string) =>
  source.replace(/@\/registry\/[^/]+\/(ui|hooks|lib)\//g, (_, kind) =>
    kind === "ui" ? "@/components/ui/" : `@/${kind}/`,
  );

/** A registry.json item with its files' source, for the install docs. */
export function getRegistryItem(name: string): RegistryItem {
  const item = registry.items.find((i) => i.name === name);
  if (!item) throw new Error(`No registry item "${name}"`);
  const deps = (item as { registryDependencies?: string[] }).registryDependencies ?? [];
  return {
    name: item.name,
    title: item.title,
    description: item.description,
    dependencies: (item as { dependencies?: string[] }).dependencies ?? [],
    registryDependencies: deps,
    files: item.files.map((f) => {
      const kind = f.path.split("/").at(-2);
      const file = f.path.split("/").at(-1)!;
      return {
        path: f.path,
        target: kind === "ui" ? `components/ui/${file}` : `${kind}/${file}`,
        source: toAppImports(readFileSync(join(process.cwd(), f.path), "utf8")),
      };
    }),
    command: `npx shadcn@latest add ${SITE_URL}/r/${item.name}.json`,
  };
}
