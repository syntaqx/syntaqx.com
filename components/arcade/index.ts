import type { CabinetFactory } from "./cabinet";
import { createBreak } from "./break";
import { createChase } from "./chase";
import { crawl } from "./crawl";
import { createDrift } from "./drift";
import { createFormation } from "./formation";
import { createRally } from "./rally";

// Every cabinet on the 404's shared canvas, back to front: the maze is the
// backdrop and each later game draws over the ones before it.
export const cabinets: CabinetFactory[] = [
  createChase,
  crawl,
  createBreak,
  createFormation,
  createRally,
  createDrift,
];
