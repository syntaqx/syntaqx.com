import { useId } from "react";
import Link from "next/link";
import { SceneArt } from "@/components/scene-art";
import type { BookSceneName } from "@/lib/scene/scenes";

/**
 * One card shape for every book: a cover, an instrument line, the name and
 * one line on what it covers. Written books link to their cover with live
 * art; the rest are dashed and dimmer, Soon books with their cover held
 * still and the ones I'm considering drawn as an empty wireframe.
 */
export type BookCard =
  | { href: string; cover: BookSceneName; eyebrow: string; name: string; summary: string }
  | { href?: undefined; cover?: BookSceneName; eyebrow: string; name: string; summary: string };

const COVER = "aspect-16/10 w-full border-b";

export function BookCards({ books }: { books: BookCard[] }) {
  return (
    <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {books.map((book) => (
        <li key={book.name}>
          {book.href ? (
            <Link
              href={book.href}
              className="group flex h-full flex-col border border-border transition-colors hover:border-accent"
            >
              <SceneArt scene={book.cover} grain={4} label={`${book.name} cover art`} className={`${COVER} border-border`} />
              <CardText book={book} />
            </Link>
          ) : (
            <div className="flex h-full flex-col border border-dashed border-border">
              {book.cover ? (
                <SceneArt
                  scene={book.cover}
                  grain={4}
                  still
                  label={`${book.name} cover art`}
                  className={`${COVER} border-dashed border-border opacity-60`}
                />
              ) : (
                <PlaceholderCover />
              )}
              <CardText book={book} />
            </div>
          )}
        </li>
      ))}
    </ul>
  );
}

function CardText({ book }: { book: BookCard }) {
  const live = !!book.href;
  return (
    <span className="block p-5">
      <span className={`inst block ${live ? "text-dim" : "text-dim/70"}`}>{book.eyebrow}</span>
      <span
        className={`font-voice mt-2 block text-2xl leading-none font-semibold uppercase transition-colors ${
          live ? "text-foreground group-hover:text-accent" : "text-dim"
        }`}
      >
        {book.name}
      </span>
      <span className={`mt-2 min-h-[3lh] text-sm leading-relaxed line-clamp-3 ${live ? "text-dim" : "text-dim/70"}`}>
        {book.summary}
      </span>
    </span>
  );
}

/**
 * A book not built yet: an isometric box in dashed outline over a faint
 * dither, the same size as a live cover but static, so no canvas.
 */
function PlaceholderCover() {
  // world (x, y, z) to the 160 by 100 view, the same projection as the scenes
  const P = (x: number, y: number, z: number) => `${80 + (x - y) * 10.4},${41 + ((x + y) / 2 - z) * 12}`;
  const poly = (pts: [number, number, number][]) => pts.map((p) => P(...p)).join(" ");
  const top = 2.4;
  const id = useId();
  return (
    <svg
      viewBox="0 0 160 100"
      aria-hidden
      className={`${COVER} border-dashed border-border text-accent mask-[radial-gradient(closest-side,black_70%,transparent)]`}
    >
      <defs>
        <pattern id={`${id}d`} width="3.2" height="3.2" patternUnits="userSpaceOnUse">
          <rect width="1.3" height="1.3" fill="currentColor" />
        </pattern>
        <radialGradient id={`${id}g`}>
          <stop offset="0" stopColor="white" stopOpacity="0.3" />
          <stop offset="1" stopColor="white" stopOpacity="0" />
        </radialGradient>
        <mask id={`${id}m`}>
          <rect width="160" height="100" fill={`url(#${id}g)`} />
        </mask>
      </defs>
      <rect width="160" height="100" fill={`url(#${id}d)`} mask={`url(#${id}m)`} />
      <g fill="none" strokeWidth="1" strokeDasharray="2 3" className="[&>*]:[vector-effect:non-scaling-stroke]">
        <polygon points={poly([[-2, -2, 0], [6, -2, 0], [6, 6, 0], [-2, 6, 0]])} stroke="var(--dim)" opacity="0.5" />
        <polyline points={poly([[0, 0, 0], [0, 0, top]])} stroke="currentColor" opacity="0.4" />
        <polyline points={poly([[0, 4, 0], [0, 0, 0], [4, 0, 0]])} stroke="currentColor" opacity="0.4" />
        <polygon points={poly([[0, 0, top], [4, 0, top], [4, 4, top], [0, 4, top]])} stroke="currentColor" />
        <polyline points={poly([[0, 4, top], [0, 4, 0], [4, 4, 0], [4, 0, 0], [4, 0, top]])} stroke="currentColor" />
        <polyline points={poly([[4, 4, 0], [4, 4, top]])} stroke="currentColor" />
      </g>
    </svg>
  );
}
