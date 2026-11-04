import type { CabinetFactory } from "./cabinet";
import { crawl } from "./crawl";

// Every cabinet the 404 can pick from is listed here.
export const cabinets: CabinetFactory[] = [crawl];
