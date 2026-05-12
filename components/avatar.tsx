/**
 * Avatar with initials fallback.
 *
 * If `src` is set (Better Auth's `user.image`), render the image.
 * Otherwise render a deterministic-color circle with the first 1-2
 * characters of the handle.
 *
 * Why initials instead of Gravatar: Gravatar requires a third-party
 * lookup keyed on the user's email hash, which leaks an identifier we
 * don't need to leak for users who haven't opted in. Initials are zero
 * deps, work for orgs (no email at all), and the user can upload a
 * real image later.
 *
 * Why a plain <img> instead of next/image for uploaded avatars: at
 * avatar sizes (28-80px) the optimization payload (loader URLs,
 * srcset, blur placeholders) costs more than it saves, and next/image
 * has historically had layout-collapse bugs at small sizes that
 * pushed parent containers taller than the declared box. A plain
 * <img> with explicit width/height + object-cover is rigid:
 * `box-sizing: content-box` doesn't apply, the rendered box is
 * exactly `size × size`, end of story.
 */

const PALETTE = [
  "bg-mauve/30",
  "bg-accent/30",
  "bg-pink/30",
  "bg-jwt-purple/30",
  "bg-jwt-cyan/30",
];

function colorFor(seed: string): string {
  let h = 0;
  for (let i = 0; i < seed.length; i++) {
    h = (h * 31 + seed.charCodeAt(i)) >>> 0;
  }
  return PALETTE[h % PALETTE.length];
}

function initialsFor(label: string): string {
  const cleaned = label.replace(/[^a-zA-Z0-9]/g, "");
  if (cleaned.length === 0) return "?";
  return cleaned.slice(0, 2).toUpperCase();
}

export function Avatar({
  src,
  label,
  size = 48,
  alt,
}: {
  src?: string | null;
  label: string;
  size?: number;
  alt?: string;
}) {
  // Both variants share an outer wrapper with rigid width/height +
  // overflow-hidden so the rendered box is always exactly `size × size`
  // regardless of what's inside.
  //
  // `inline-flex` (not `inline-block`) is critical: an inline-block
  // box has a text baseline derived from its contents, which differs
  // between an <img> child and a <span>text</span> child. When this
  // wrapper sits inside a flex parent (`items-center`), that baseline
  // difference shifts the vertical position of the avatar depending
  // on which variant is rendering. `inline-flex` has no text baseline,
  // so both variants align identically.
  return (
    <span
      aria-label={alt ?? label}
      style={{
        width: size,
        height: size,
        minWidth: size,
        minHeight: size,
        maxWidth: size,
        maxHeight: size,
      }}
      className="flex shrink-0 items-center justify-center overflow-hidden rounded-full leading-none"
    >
      {src ? (
        <img
          src={src}
          alt={alt ?? label}
          width={size}
          height={size}
          loading="lazy"
          decoding="async"
          style={{ width: size, height: size }}
          className="block h-full w-full object-cover"
        />
      ) : (
        <span
          style={{ fontSize: size * 0.4 }}
          className={`flex h-full w-full items-center justify-center font-semibold text-foreground/80 ${colorFor(label)}`}
        >
          {initialsFor(label)}
        </span>
      )}
    </span>
  );
}
