// An abuse desk from intake to mitigation as a standard flow: reports from
// every channel, an acknowledgment, triage by resource and harm, then four
// dispositions (forward, the child-safety path, the compromised-site
// ladder in the accent, suspension of a malicious registration), and the
// rule for lifting in a footnote. Embedded in
// content/books/user-generated-platforms/abuse-desks.md (Intake).
import { sheet } from "../kit.mjs";

export default function draw() {
  const W = 760;
  const s = sheet({ prefix: "ugp-ad", width: W });

  const top = 30, rh = 62, gap = 12;
  const Y = (i) => top + i * (rh + gap);
  const total = 4 * (rh + gap) - gap;
  const cy = top + total / 2;

  s.comment("Intake, acknowledgment, triage");
  const intake = s.node(20, cy - 45, 132, 90, "report", { kind: "store", sub: ["web form, role", "mailbox, API,", "structured feed,", "blocklist"] });
  const ack = s.node(172, cy - 30, 112, 60, "acknowledge", { sub: ["receipt with a", "case number"] });
  const triage = s.node(304, cy - 30, 138, 60, "triage", { sub: ["group by resource,", "rank by harm"] });
  s.connect(intake, ack);
  s.connect(ack, triage);

  s.comment("Dispositions");
  const xo = 484, wo = W - 20 - xo;
  const outs = [
    s.node(xo, Y(0), wo, rh, "not ours: forward", { sub: ["to the operator or host,", "with recipient and time"] }),
    s.node(xo, Y(1), wo, rh, "child safety: its own path", { kind: "ghost", sub: ["a separate staffed path,", "never the general tool"] }),
    s.node(xo, Y(2), wo, rh, "compromised site", { hl: true, sub: ["block paths, notify the owner", "with a deadline, then suspend", "the site if nothing changes"] }),
    s.node(xo, Y(3), wo, rh, "malicious registration", { sub: ["suspend the account or domain,", "minimal notice, look for", "related registrations"] }),
  ];
  s.fanOut(triage, outs, { via: (triage.x2 + xo) / 2, hl: 2 });

  s.comment("Footnotes");
  const fy = Y(3) + rh + 28;
  s.text(20, fy, "every report gets a disposition; each mitigation takes the narrowest layer that stops the harm", "sl");
  s.text(20, fy + 16, "a mitigation is lifted when the site is remediated or a dispute is upheld, with an actor and a reason", "sl");
  s.height = Math.ceil(fy + 34);
  return s.toString();
}
