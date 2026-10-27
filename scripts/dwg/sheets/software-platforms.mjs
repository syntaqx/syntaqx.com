// The tenant tree of a software platform on a payment provider: provider,
// platform, organizations, merchants. Configuration inherits down, reporting
// rolls up, and money skips the middle. Embedded in
// content/books/payments/software-platforms.md.
import { sheet } from "../kit.mjs";

const LEVELS = ["provider", "platform", "organization", "merchant"];

export default function draw() {
  const W = 760, x = 20, w = 112, h = 28, gapX = 18, levelH = 60;
  const s = sheet({ prefix: "sp", width: W });
  const tx = 150, provY = 34, provH = 38, treeY = provY + provH + 34;
  const leavesW = 4 * w + 3 * gapX;
  const cx = tx + leavesW / 2;
  const LY = [provY + provH / 2, ...[0, 1, 2].map((d) => treeY + d * levelH + h / 2)];

  s.comment("Levels");
  LEVELS.forEach((l, i) => s.text(x, LY[i] + 3.5, l, "lt"));

  s.comment("Provider");
  const prov = s.node(cx - 140, provY, 280, provH, "payment provider", { fill: 1, sub: "underwrites, settles, holds the risk" });

  s.comment("Tenant tree");
  const org = () => ({ label: "organization", children: [{ label: "merchant" }, { label: "merchant" }] });
  const placed = s.tree({ label: "platform", children: [org(), org()] }, { x: tx, y: treeY, layout: "down", w, h, gapX, levelH });
  const platform = placed[0];
  const merchants = placed.filter((n) => n.depth === 2);
  s.connect(prov, platform, { from: "b", to: "t", label: "fees or revenue share", side: "right" });

  s.comment("Money skips the middle");
  const chan = tx - 20, m0 = merchants[0];
  s.wire([prov.port("l"), [chan, prov.cy], [chan, m0.cy], m0.port("l")], { hl: true });

  s.comment("Config down, reporting up");
  const top = platform.y, bot = m0.y + h, mid = (top + bot) / 2;
  const dx = W - x - 48, ux = W - x - 6;
  s.wire([[dx, top], [dx, bot]]);
  s.text(dx - 7, mid, "config inherits down", "sl", "middle", { transform: `rotate(-90 ${dx - 7} ${mid})` });
  s.wire([[ux, bot], [ux, top]]);
  s.text(ux - 7, mid, "reporting rolls up", "sl", "middle", { transform: `rotate(-90 ${ux - 7} ${mid})` });

  const fy = bot + 28;
  s.text(chan, fy, "the provider settles net funds directly to each merchant's bank", "sl hl");
  s.height = Math.ceil(fy + 18);
  return s.toString();
}
