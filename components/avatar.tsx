import Image from "next/image";

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
  if (src) {
    return (
      <Image
        src={src}
        alt={alt ?? label}
        width={size}
        height={size}
        className="rounded-full object-cover"
        style={{ width: size, height: size }}
      />
    );
  }
  return (
    <div
      aria-label={alt ?? label}
      style={{ width: size, height: size, fontSize: size * 0.4 }}
      className={`flex items-center justify-center rounded-full font-semibold text-foreground/80 ${colorFor(label)}`}
    >
      {initialsFor(label)}
    </div>
  );
}
