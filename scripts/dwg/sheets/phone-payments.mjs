// An agent-assisted phone payment with DTMF masking as a standard diagram:
// the real digits (accent) go from the caller through the masking service to
// the vault; the agent and the recorder get flat tones; the platform gets a
// token. Embedded in content/books/payments/phone-payments.md.
import { sheet } from "../kit.mjs";

export default function draw() {
  const W = 760, x = 20, h = 40;
  const s = sheet({ prefix: "ph", width: W });

  // Columns: caller, masking service, agent and recorder, vault and platform.
  const cw = [110, 140, 150, 120];
  const gap = (W - 2 * x - cw.reduce((a, b) => a + b, 0)) / 3;
  const cx = cw.reduce((acc, w, i) => [...acc, i ? acc[i - 1] + cw[i - 1] + gap : x], []);
  const top = 24, mid = top + h + 46, bot = mid + h + 46;

  s.comment("The call path");
  const caller = s.node(cx[0], mid, cw[0], h, "caller", { kind: "actor", sub: "keys the card" });
  const mask = s.node(cx[1], mid, cw[1], h, "masking service", { hl: true, sub: "in the call path" });
  const agent = s.node(cx[2], top, cw[2], h, "agent", { sub: "sees **** filling in" });
  const rec = s.node(cx[2], bot, cw[2], h, "call recorder", { kind: "store", sub: "nothing to protect" });
  const vault = s.node(cx[3], mid, cw[3], h, "card vault", { kind: "store", hl: true });
  const platform = s.node(cx[3], bot, cw[3], h, "platform");

  s.comment("Real digits");
  s.connect(caller, mask, { hl: true });
  s.connect(mask, vault, { hl: true, label: "out of band", side: "below", shift: 0.3 });

  s.comment("Flat tones");
  const jx = mask.x + mask.w + 18;
  // Labels left of the drops, over the open space above and below the
  // masking service; the short runs into the boxes have no room for them.
  s.connect(mask, agent, { at: [0.2, 0.5], via: jx, seg: 1, label: "flat tones", side: "left" });
  s.connect(mask, rec, { at: [0.8, 0.5], via: jx, seg: 1, label: "flat tones", side: "left" });

  s.comment("Token back");
  s.connect(vault, platform, { from: "b", to: "t", label: "token,\nlast four", side: "left" });

  s.comment("Legend");
  const lg = s.legend(cx[0], bot + h + 30, [
    { kind: "hl", label: "real digits" },
    { kind: "flow", label: "flat tones or a token" },
  ]);
  s.height = Math.ceil(lg.y + 16);
  return s.toString();
}
