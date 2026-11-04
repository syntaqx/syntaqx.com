/*
 * The 404's arcade: a game playing itself behind the page's copy, the way
 * cabinets run in attract mode. Nobody plays it. The game is a Cabinet; the
 * runner in ./arcade-404.tsx owns the canvas and the loop, sizes the cabinet
 * to the whole stage and has it step and draw. A cabinet draws only its
 * moving action, no scenery or score, so it stays out of the copy's way.
 */

/** The site's colors, read from its CSS tokens, so the arcade follows the theme. */
export interface ArcadeTheme {
  /** The page background; cabinets draw over it, never fill with anything else. */
  bg: string;
  /** Primary text and bright line art. */
  fg: string;
  /** Quiet text, such as names. */
  muted: string;
  /** Faint structure, such as the maze's walls. */
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
  /** The site's monospace font family, for names and numbers. */
  mono: string;
  /** True on the dark theme: glows may blend additively. */
  dark: boolean;
}

export interface Cabinet {
  /** The game's name, one word or two, original to this site. */
  title: string;
  /** The whole stage in CSS pixels; called before the first step and on every resize. */
  resize(width: number, height: number): void;
  /**
   * Advances the game by dt seconds (0 to 1/30). Plays forever: when a round
   * ends it resets on its own after a short beat, and it never sits idle.
   */
  step(dt: number): void;
  /**
   * Draws the current frame. The runner has filled the background and restores
   * the context's state afterwards.
   */
  draw(ctx: CanvasRenderingContext2D, theme: ArcadeTheme, now: number): void;
}

export type CabinetFactory = () => Cabinet;
