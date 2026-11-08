// Prebuild the MCP search index (lib/knowledge-index.ts) into
// .generated/knowledge, so production loads it instead of building it on a
// cold start. Runs in `npm run build` before `next build`.
import { buildIndex, collectSections, writeIndex, INDEX_DIR } from "../lib/knowledge-index";

const start = performance.now();
const index = buildIndex(collectSections());
const bytes = writeIndex(index);
const mb = (n: number) => `${(n / 1e6).toFixed(1)}MB`;
console.log(
  `knowledge index: ${index.sections.length} sections, ${index.postings.size} terms, ` +
    `${mb(bytes.meta)} + ${mb(bytes.postings)} in ${Math.round(performance.now() - start)}ms → ${INDEX_DIR}`,
);
