declare module "turndown-plugin-gfm" {
  import type TurndownService from "turndown";
  type Plugin = Parameters<TurndownService["use"]>[0];
  export const gfm: Plugin;
  export const tables: Plugin;
  export const strikethrough: Plugin;
  export const taskListItems: Plugin;
}
