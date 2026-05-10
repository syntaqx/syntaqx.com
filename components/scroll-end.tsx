"use client";

import { useCallback, type ReactNode } from "react";

export function ScrollEnd({ children }: { children: ReactNode }) {
  const ref = useCallback((el: HTMLDivElement | null) => {
    if (el) {
      el.scrollLeft = el.scrollWidth;
    }
  }, []);

  return (
    <div ref={ref} className="overflow-x-auto -mx-5 px-5">
      {children}
    </div>
  );
}
