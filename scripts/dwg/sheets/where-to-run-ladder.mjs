// The compute ladder: start on a platform, move to a managed container
// service when it no longer fits, and to Kubernetes only with a platform team
// to own it; the same OCI image runs on every rung. Embedded in
// content/docs/delivery/where-to-run.md.
import { sheet } from "../kit.mjs";

const STAGES = [
  { head: "start here", label: "platform", sub: ["you own: code, config", "move on when limits,", "the bill or compliance bind"], hl: true },
  { head: "next", label: "managed containers", sub: ["you own: image, service,", "network, IAM", "move on when a platform", "team exists to own more"] },
  { head: "with a platform team", label: "Kubernetes", sub: ["you own: upgrades, add-ons,", "observability, policy,", "the cluster's on-call"] },
];

export default function draw() {
  const W = 760, w = 210, gap = 45;
  const total = STAGES.length * w + (STAGES.length - 1) * gap;
  const x0 = (W - total) / 2;
  const s = sheet({ prefix: "wtr", width: W });

  s.comment("Rungs");
  const { bottom } = s.pipeline(x0, 40, STAGES, { w, h: 30, gap });

  s.comment("The portable unit");
  const sy = bottom + 22;
  const ty = s.span(x0, x0 + total, sy, "one OCI image runs on every rung: that is the exit path");

  s.height = Math.ceil(ty + 20);
  return s.toString();
}
