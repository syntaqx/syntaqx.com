/*
 * The 404's arcade: classic game genres playing themselves behind the page's
 * copy, the way cabinets run in attract mode. Nobody plays them. Each game
 * is a Cabinet; the runner in ./arcade-404.tsx owns the canvas, the loop and
 * the rotation, and asks the current cabinet to step and draw.
 */

/** The site's colors, read from its CSS tokens, so the arcade follows the theme. */
export interface ArcadeTheme {
  /** The page background; cabinets draw over it, never fill with anything else. */
  bg: string;
  /** Primary text and bright line art. */
  fg: string;
  /** Quiet text: labels, scores. */
  muted: string;
  /** Faint structure: grids, walls, courts. */
  line: string;
  /** Stronger structure. */
  strong: string;
  /** The brand teal: the hero of each game. */
  primary: string;
  /** Accents for opponents and pickups. */
  amber: string;
  pink: string;
  purple: string;
  cyan: string;
  green: string;
  /** The site's monospace font family, for scores and numbers. */
  mono: string;
  /** The site's instrument font family (Michroma), for small uppercase labels. */
  label: string;
  /** True on the dark theme: glows may blend additively. */
  dark: boolean;
}

export interface Cabinet {
  /** Shown as "Now playing" in a corner. One word or two, original to this site. */
  title: string;
  /** The drawing area in CSS pixels; called before the first step and on every resize. */
  resize(width: number, height: number): void;
  /**
   * Advances the game by dt seconds (0 to 1/30). Plays forever: when a round
   * ends it resets on its own after a short beat, and it never sits idle.
   */
  step(dt: number): void;
  /** Draws the current frame. The runner has already filled the background. */
  draw(ctx: CanvasRenderingContext2D, theme: ArcadeTheme, now: number): void;
}

export type CabinetFactory = () => Cabinet;
