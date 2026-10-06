import type { ReactNode } from "react";
import { SceneArt } from "@/components/scene-art";
import type { SceneName } from "@/lib/scene/scenes";

interface PageHeaderProps {
  label: string;
  title: ReactNode;
  children?: ReactNode;
  /** Optional live illustration beside the title. */
  scene?: SceneName;
  sceneLabel?: string;
}

export function PageHeader({
  label,
  title,
  children,
  scene,
  sceneLabel,
}: PageHeaderProps) {
  return (
    <header className="relative isolate mb-14 grid items-center gap-x-12 gap-y-8 border-b border-border pb-12 md:grid-cols-[minmax(0,1fr)_minmax(0,22rem)]">
      <div
        aria-hidden="true"
        className="beams pointer-events-none absolute inset-x-0 -top-12 bottom-0 -z-10 mask-[linear-gradient(to_bottom,black,transparent)]"
      />
      <div className="max-w-2xl">
        <p className="eyebrow mb-6">{label}</p>
        <h1 className="text-[clamp(3rem,6.5vw,5rem)] leading-[0.88] wrap-break-word">
          {title}
        </h1>
        {children && (
          <div className="mt-7 text-lg leading-relaxed text-dim">
            {children}
          </div>
        )}
      </div>
      {scene && (
        <SceneArt
          scene={scene}
          className="aspect-square max-w-88 justify-self-center md:justify-self-end"
          label={sceneLabel ?? ""}
        />
      )}
    </header>
  );
}
