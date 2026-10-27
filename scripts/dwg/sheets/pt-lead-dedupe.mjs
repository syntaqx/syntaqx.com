// Guest card dedupe across channels as a standard diagram: partial
// identities from four channels, normalized, matched within the tenant,
// then attached, sent to a review band or created; merges keep each
// source's lead ID. Embedded in
// content/books/property-tech/leads-crm-and-tours.md.
import { sheet } from "../kit.mjs";

export default function draw() {
  const W = 760;
  const s = sheet({ prefix: "pt-ld", width: W });

  s.comment("Channels");
  const cw = 124, ch = 26, cg = 12, top = 24;
  const chans = [
    ["listing site form", "name, email"],
    ["tracking call", "caller ID"],
    ["website chat", "first name"],
    ["walk-in", "name, phone"],
  ].map(([l], i) => s.node(20, top + i * (ch + cg), cw, ch, l));
  const midY = (chans[0].y + chans.at(-1).y2) / 2;

  s.comment("Normalize and match");
  const nh = 56, nw = 136, gap = 40;
  const ow = 196, ox = W - 20 - ow;
  const mx = ox - gap - 12 - nw;
  const nx = mx - gap - nw;
  const norm = s.node(nx, midY - nh / 2, nw, nh, "normalize", { sub: ["phones to E.164,", "emails lowercased"] });
  const match = s.node(mx, midY - nh / 2, nw, nh, "match", { sub: ["within the tenant,", "across properties"] });
  s.fanIn(chans, norm, { via: (20 + cw + nx) / 2 });
  s.connect(norm, match);

  s.comment("Outcomes");
  const oh = 40, og = 14;
  const oy0 = midY - (3 * oh + 2 * og) / 2;
  const outs = [
    s.node(ox, oy0, ow, oh, "attach", { sub: "strong match on phone or email", hl: true }),
    s.node(ox, oy0 + oh + og, ow, oh, "review band", { kind: "store", sub: "ambiguous: a person decides" }),
    s.node(ox, oy0 + 2 * (oh + og), ow, oh, "new household", { sub: "no match" }),
  ];
  s.fanOut(match, outs, { hl: 0 });

  const ny = s.note(outs[2], "merges are reversible and keep\neach source's lead ID", { anchor: "right" });
  s.height = Math.ceil(Math.max(ny, chans.at(-1).y2) + 20);
  return s.toString();
}
