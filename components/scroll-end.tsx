"use client";

import { useRef, useEffect, type ReactNode } from "react";

export function ScrollEnd({ children }: { children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (el) {
      el.scrollLeft = el.scrollWidth;
    }
  }, []);

  return (
    <div ref={ref} className="overflow-x-auto md:overflow-x-visible -mx-5 px-5">
      {children}
    </div>
  );
}
