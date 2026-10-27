// A card vault as one boundary: the card number's path (the accent) from
// the browser through capture, tokenizer and forwarder to the processors;
// the platform outside holds only tokens; the key service and the reveal
// console beside the tokenizer. Embedded in content/books/payments/card-vault.md.
import { sheet } from "../kit.mjs";

export default function draw() {
  const W = 760, h = 28;
  const s = sheet({ prefix: "cv", width: W });

  // Columns: outside left, the boundary with two columns, outside right.
  const c0 = 20, w0 = 120;
  const gx = 200, gw = 390;
  const c1 = 240, w1 = 150;
  const c2 = 430, w2 = 130;
  const c3 = W - 23 - 120; // the actor shadow sits 3 past the box
  const r0 = 56, r1 = 136, r2 = 230, yPlat = 186;

  s.comment("The boundary");
  s.group(gx, r0 - 20, gw, r2 + h + 16 - (r0 - 20), "cardholder data environment");

  s.comment("Inside: the card number's path");
  const capture = s.node(c1, r0, w1, h, "capture iframe", { hl: true });
  const tokenizer = s.node(c1, r1, w1, h, "tokenizer + store", { hl: true });
  const forwarder = s.node(c1, r2, w1, h, "forwarder", { hl: true });

  s.comment("Outside");
  const browser = s.node(c0, r0, w0, h, "browser", { kind: "actor" });
  const platform = s.node(c0, yPlat, w0, h, "platform");
  ["tokens in,", "tokens out,", "never a card number"].forEach((l, j) => s.text(platform.cx, yPlat + h + 14 + j * 11, l, "vs", "middle"));
  const processors = s.node(c3, r2, 120, h, "processors", { kind: "actor" });

  s.comment("Card number in, and out to processors only");
  s.connect(browser, capture, { hl: true });
  s.connect(capture, tokenizer, { from: "b", to: "t", hl: true });
  s.connect(tokenizer, forwarder, { from: "b", to: "t", hl: true });
  s.connect(forwarder, processors, { hl: true, shift: -0.2, label: "card number, allowlist only" });

  s.comment("Tokens: out to the platform, a charge request back in");
  const tIn = platform.port("r", 0.3), tOut = platform.port("r", 0.7);
  s.wire([tokenizer.port("l"), [gx + 20, tokenizer.cy], [gx + 20, tIn[1]], tIn]);
  s.wire([tOut, [gx - 30, tOut[1]], [gx - 30, forwarder.cy], forwarder.port("l")]);

  s.comment("Keys and reveal");
  const yk = tokenizer.port("r", 0.7)[1];
  const keys = s.node(c2, yk - h / 2, w2, h, "key service");
  ["KMS or HSM wraps", "the data keys"].forEach((l, j) => s.text(keys.cx, keys.y + h + 14 + j * 11, l, "vs", "middle"));
  s.wire([tokenizer.port("r", 0.7), keys.port("l")], { arrow: "both" });
  const reveal = s.node(c2, r0, w2, h, "reveal console");
  const jx = (c1 + w1 + c2) / 2;
  s.wire([reveal.port("l"), [jx, reveal.cy], [jx, tokenizer.port("r", 0.25)[1]], tokenizer.port("r", 0.25)], { alt: true, seg: 1, side: "right", label: "role, reason, MFA" });

  s.comment("Legend");
  const lg = s.legend(c0, r2 + h + 46, [
    { kind: "hl", label: "the card number" },
    { kind: "flow", label: "tokens and keys" },
    { kind: "alt", label: "a logged reveal" },
  ]);
  s.height = Math.ceil(lg.y + 16);
  return s.toString();
}
