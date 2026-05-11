import { Button } from "@/components/button";
import { ArrowRight } from "lucide-react";

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-6">
      <p className="text-8xl font-bold text-accent mb-2">404</p>
      <h1 className="text-2xl font-bold tracking-tight mb-4">
        These aren&apos;t the droids you&apos;re looking for.
      </h1>
      <p className="text-sm text-dim max-w-md mb-2">
        The page you requested has mass&mdash;but it exists in a superposition
        of &ldquo;here&rdquo; and &ldquo;not here,&rdquo; and upon observation
        it collapsed to &ldquo;not here.&rdquo;
      </p>
      <p className="text-xs text-dim/60 mb-8 font-mono">
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
