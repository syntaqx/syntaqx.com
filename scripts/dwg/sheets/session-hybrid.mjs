// A server-side session at the edge with short-lived tokens inside: the
// browser holds an opaque cookie, the BFF or gateway keeps the session and
// mints a signed JWT per call, services verify it locally, and revoking
// deletes the session. Embedded in content/docs/security/authentication.md.
import { sheet } from "../kit.mjs";

const SERVICES = ["orders", "payments", "accounts"];

export default function draw() {
  const W = 760, x = 20, nh = 40, sh = 28, svcGap = 20;
  const s = sheet({ prefix: "sh", width: W });

  // Columns: client side, the edge (BFF), the services.
  const bw = 140, gx = 236, gw = 200, pad = 12, svcW = 150, svcX = W - x - svcW, bus = 530;
  const revY = 52, gTop = 110, storeY = gTop + pad, mintY = storeY + nh + 34;

  s.comment("Captions");
  s.text(x, 26, "a session at the edge", "lt");
  s.text(W - x, 26, "short-lived tokens inside", "lt hl", "end");

  s.comment("The edge");
  s.group(gx, gTop, gw, mintY + nh + pad - gTop, "bff or gateway");
  const store = s.node(gx + pad, storeY, gw - 2 * pad, nh, "session store", { kind: "store", sub: "who signed in, how, when" });
  const mint = s.node(gx + pad, mintY, gw - 2 * pad, nh, "token minting", { sub: "for each internal call" });
  s.connect(store, mint, { from: "b", to: "t" });

  s.comment("Browser and revocation");
  const browser = s.node(x, store.cy - sh / 2, bw, sh, "browser", { kind: "actor" });
  s.text(browser.cx, browser.y + sh + 18, "opaque HttpOnly cookie", "tc", "middle");
  s.connect(browser, store, { label: "cookie" });
  const revoke = s.node(x, revY, bw, sh, "logout or revoke", { kind: "ghost" });
  s.connect(revoke, store, { from: "r", to: "t", at: [0.5, 0.75], alt: true, label: "deletes the session", side: "above" });

  s.comment("Services verify locally");
  const step = sh + svcGap;
  const svcs = SERVICES.map((n, i) => s.node(svcX, mint.cy + (i - 1) * step - sh / 2, svcW, sh, n));
  s.wire([mint.port("r"), [bus, mint.cy]], { hl: true, arrow: "none", label: "signed JWT,\nminutes long", side: "above", shift: 0.12 });
  s.line(bus, svcs[0].cy, bus, svcs[2].cy, "flow hl");
  svcs.forEach((n) => s.wire([[bus, n.cy], n.port("l")], { hl: true }));
  s.text(W - x, svcs[0].y - 12, "each checks the signature, no lookup", "sl", "end");

  const fy = Math.max(svcs[2].y + sh, mintY + nh + pad) + 26;
  s.text(x, fy, "delete the session, and the next token is never minted", "sl");
  s.height = Math.ceil(fy + 18);
  return s.toString();
}
