// A redirect payment as a sequence, top to bottom in time: the redirect and
// the return prove nothing, the provider's webhook (the accent) or a late
// status check moves the order from pending to paid. Embedded in
// content/books/payments/wallets-and-local-methods.md.
import { sheet } from "../kit.mjs";

const PARTIES = [
  ["your checkout", "process"],
  ["customer's bank", "actor"],
  ["payment provider", "actor"],
  ["your server", "process"],
];

export default function draw() {
  const W = 760, x = 20, nh = 28, nw = 150, step = 34;
  const s = sheet({ prefix: "ap", width: W });
  const cw = (W - 2 * x) / PARTIES.length;
  const CX = (i) => x + (i + 0.5) * cw;
  const [CHK, BANK, PROV, SRV] = PARTIES.map((_, i) => CX(i));
  const top = 20;

  // Rows, one per event, `step` apart.
  const yRedirect = top + nh + 38;
  const yApprove = yRedirect + 18;
  const yBack = yApprove + 24 + step;
  const yPending = yBack + 12;
  const yPush = yPending + 24 + step;
  const yHook = yPush + step;
  const yCheck = yHook + step;
  const yPaid = yCheck + 16;

  s.comment("Lifelines, each to its last event");
  s.line(CHK, top + nh, CHK, yPending, "ctr");
  s.line(BANK, top + nh, BANK, yPush, "ctr");
  s.line(PROV, top + nh, PROV, yCheck, "ctr");
  s.line(SRV, top + nh, SRV, yPaid, "ctr");

  s.comment("Parties");
  PARTIES.forEach(([name, kind], i) => s.node(CX(i) - nw / 2, top, nw, nh, name, { kind }));

  s.comment("1. Redirect, approve, maybe come back");
  s.wire([[CHK, yRedirect], [BANK, yRedirect]], { start: "dot", label: "redirect to bank or app" });
  s.node(BANK - 48, yApprove, 96, 24, "approve");
  s.wire([[BANK, yBack], [CHK, yBack]], { start: "dot", alt: true, label: "back, if they return" });
  s.node(CHK - 60, yPending, 120, 24, "order: pending", { kind: "state", code: true });

  s.comment("2. The money moves, then the provider says so");
  s.wire([[BANK, yPush], [PROV, yPush]], { start: "dot", label: "the push settles" });
  s.wire([[PROV, yHook], [SRV, yHook]], { start: "dot", hl: true, label: "webhook: received" });
  s.wire([[SRV, yCheck], [PROV, yCheck]], { start: "dot", alt: true, label: "status check, if late" });
  const paid = s.node(SRV - 60, yPaid, 120, 26, "order: paid", { kind: "state", code: true, hl: true, end: true });

  s.comment("Legend");
  const lg = s.legend(x, paid.y + paid.h + 30, [
    { kind: "hl", label: "the source of truth" },
    { kind: "alt", label: "may not happen" },
    { kind: "end", label: "terminal state" },
  ]);
  s.height = Math.ceil(lg.y + 16);
  return s.toString();
}
