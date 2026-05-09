"use client";

import { siGithub, siX, siStackoverflow } from "simple-icons";

const icons: Record<string, { title: string; path: string }> = {
  github: siGithub,
  x: siX,
  stackoverflow: siStackoverflow,
  // LinkedIn was removed from simple-icons; using Lucide path
  linkedin: {
    title: "LinkedIn",
    path: "M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6zM2 9h4v12H2zM4 2a2 2 0 1 1 0 4 2 2 0 0 1 0-4z",
  },
};

export function SimpleIcon({
  name,
  size = 18,
  className,
}: {
  name: string;
  size?: number;
  className?: string;
}) {
  const icon = icons[name];
  if (!icon) return null;

  return (
    <svg
      role="img"
      viewBox="0 0 24 24"
      width={size}
      height={size}
      fill="currentColor"
      className={className}
      aria-label={icon.title}
    >
      <path d={icon.path} />
    </svg>
  );
}
