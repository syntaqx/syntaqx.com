import type { CabinetFactory } from "./cabinet";
import { createBreak } from "./break";
import { crawl } from "./crawl";
import { createDrift } from "./drift";
import { createRally } from "./rally";

// Every cabinet the 404 can pick from is listed here.
export const cabinets: CabinetFactory[] = [crawl, createRally, createBreak, createDrift];
