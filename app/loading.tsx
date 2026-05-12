/**
 * Top-level loading state shown while a route segment is fetching
 * data. Renders during any nav that lacks a more specific
 * `loading.tsx` further down the tree.
 *
 * The bar is rendered fixed at the top of the viewport via a portal-
 * equivalent (high z-index) so it floats over whatever the previous
 * page was showing. Keeps the perceived-latency low without us having
 * to wire a real progress library.
 */
export default function Loading() {
  return (
    <div
      aria-hidden
      className="fixed inset-x-0 top-0 z-200 h-0.5 overflow-hidden pointer-events-none"
    >
      <div className="h-full w-1/3 bg-accent animate-[loading-bar_1.2s_ease-in-out_infinite]" />
      <style>{`
        @keyframes loading-bar {
          0%   { transform: translateX(-100%); }
          50%  { transform: translateX(150%); }
          100% { transform: translateX(450%); }
        }
      `}</style>
    </div>
  );
}
