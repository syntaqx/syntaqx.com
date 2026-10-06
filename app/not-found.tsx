import { Button } from "@/components/button";
import { ArrowRight } from "lucide-react";
import { SceneArt } from "@/components/scene-art";

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-6">
      <SceneArt
        scene="missing"
        className="mb-10 aspect-square w-64! sm:w-72!"
        label="A grid of tiles with the center tile missing, floating high above its empty slot"
      />
      <p className="eyebrow mb-4">404</p>
      <h1 className="mb-5 max-w-2xl text-3xl leading-[0.95] sm:text-4xl">
        These aren&apos;t the droids you&apos;re looking for.
      </h1>
      <p className="mb-3 max-w-md text-muted">
        The page you requested has mass, but it exists in a superposition of
        &ldquo;here&rdquo; and &ldquo;not here,&rdquo; and upon observation it
        collapsed to &ldquo;not here.&rdquo;
      </p>
      <p className="text-xs text-dim mb-10">
        HTTP 404 &middot; ERR_EXISTENTIAL_CRISIS
      </p>
      <div className="flex flex-wrap items-center gap-3">
        <Button href="/">
          Go home
          <ArrowRight size={13} />
        </Button>
        <Button href="/posts" variant="secondary">
          Read the blog
        </Button>
      </div>
    </div>
  );
}
