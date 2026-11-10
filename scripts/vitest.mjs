// Runs vitest from a working directory with an uppercase drive letter.
//
// On Windows, VS Code opens folders as c:\..., and shells it starts inherit
// that spelling. Vitest 5.1 uppercases its root, so the CLI and the test
// workers load vitest under two spellings of one path, and every suite fails
// with "Cannot read properties of undefined (reading 'config')". Elsewhere
// this is a plain pass-through.
import { spawnSync } from "node:child_process";
import { join } from "node:path";

const cwd = process.cwd().replace(/^[a-z]:/, (drive) => drive.toUpperCase());
const cli = join(cwd, "node_modules", "vitest", "vitest.mjs");
const { status } = spawnSync(process.execPath, [cli, ...process.argv.slice(2)], {
  cwd,
  stdio: "inherit",
});
process.exit(status ?? 1);
