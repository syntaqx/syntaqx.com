import type { CabinetFactory } from "./cabinet";
import { createBreak } from "./break";
import { createChase } from "./chase";
import { crawl } from "./crawl";
import { createDrift } from "./drift";
import { createFormation } from "./formation";
import { createRally } from "./rally";

// Every cabinet on the 404's wall, in reading order.
export const cabinets: CabinetFactory[] = [
  crawl,
  createRally,
  createBreak,
  createFormation,
  createChase,
  createDrift,
];
