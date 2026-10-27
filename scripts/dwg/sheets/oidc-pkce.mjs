// OpenID Connect sign-in with PKCE as a sequence: browser, app and identity
// provider with lifelines, time running down; the back channel, where the
// tokens travel, in the accent. Embedded in content/docs/security/sso-and-federation.md.
import { sheet } from "../kit.mjs";

export default function draw() {
  const W = 760, x = 20;
  const s = sheet({ prefix: "oi", width: W });
  const cw = (W - 2 * x) / 3;
  const CX = (i) => x + (i + 0.5) * cw;
  const [BR, APP, IDP] = [CX(0), CX(1), CX(2)];
  const aw = 150, ah = 28, top = 20, step = 34;
  const Y = (i) => top + ah + 32 + i * step; // message rows

  // Lifelines first, so the boxes on them paint over.
  s.comment("Lifelines");
  s.line(BR, top + ah, BR, Y(5), "ctr");
  s.line(APP, top + ah, APP, Y(8), "ctr");
  s.line(IDP, top + ah, IDP, Y(7), "ctr");

  s.comment("Parties");
  ["browser", "your app", "identity provider"].forEach((l, i) => s.node(CX(i) - aw / 2, top, aw, ah, l, { kind: i === 1 ? "process" : "actor" }));

  // A message between lifelines; one that crosses the app's lifeline puts
  // its label in the gap next to the sender. Labels with identifiers set
  // in tc so code_challenge keeps its case.
  const msg = (a, b, y, label, { hl = false, code = false } = {}) =>
    s.message(a, b, y, label, { hl, labelCls: code ? "tc" : "sl", lifelines: [BR, APP, IDP] });
  const step1 = (cx, y, label, o = {}) => s.node(cx - 85, y - 13, 170, 26, label, o);

  s.comment("1. The app makes secrets the browser never learns");
  step1(APP, Y(0), "verifier, state, nonce");

  s.comment("2. Redirect to the provider");
  msg(APP, BR, Y(1), "redirect");
  msg(BR, IDP, Y(2), "authorize: code_challenge, state, nonce", { code: true });

  s.comment("3. The user signs in at the provider");
  step1(IDP, Y(3), "sign in, MFA");

  s.comment("4. Back with a one-time code");
  msg(IDP, BR, Y(4), "redirect back: code, state");
  msg(BR, APP, Y(5), "code, state: check state");

  s.comment("5. The back channel: the only place tokens travel");
  msg(APP, IDP, Y(6), "code + code_verifier, server to server", { hl: true, code: true });
  msg(IDP, APP, Y(7), "ID token, access token", { hl: true });

  s.comment("6. Validate, then start a session");
  const v = s.node(APP - 120, Y(8), 240, 28, "validate, then start a session", { hl: true, end: true });
  const ny = v.y + v.h + 18;
  s.text(APP, ny, "check iss, aud, exp, nonce and the signature", "tc", "middle");
  s.height = Math.ceil(ny + 18);
  return s.toString();
}
