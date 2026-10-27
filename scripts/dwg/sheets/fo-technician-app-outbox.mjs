// Offline sync through an outbox as a standard diagram: on the device one
// write puts the change in the local row and the outbox; on reconnect the
// outbox replays in order (accented) to the server, which skips applied ids,
// checks the base version and rules, then applies, appends or queues a
// conflict for review; the ack drops the command from the outbox. Embedded
// in content/books/field-operations/technician-app.md.
import { sheet } from "../kit.mjs";

export default function draw() {
  const W = 760;
  const s = sheet({ prefix: "fo-tao", width: W });

  const h = 26, pad = 16, rowH = 50, y0 = 40;
  const Y = (i) => y0 + pad + i * rowH;
  const dev = { x: 20, w: 280 };
  const srv = { x: 440, w: W - 20 - 440 };
  const dx = dev.x + pad, dw = dev.w - 2 * pad;
  const sx = srv.x + pad, sw = srv.w - 2 * pad;
  const bot = Y(3) + h + pad;

  s.comment("Zones");
  s.group(dev.x, y0, dev.w, bot - y0, "on the device");
  s.group(srv.x, y0, srv.w, bot - y0, "on the server");

  s.comment("Device");
  const tap = s.node(dx, Y(0), dw, h, "tap Complete, no signal");
  const write = s.node(dx, Y(1), dw, h, "one write: local row + outbox");
  const outbox = s.node(dx, Y(2), dw, h, "outbox: #41 #42 #43, in order", { kind: "store", hl: true });
  const screen = s.node(dx, Y(3), dw, h, "screen shows: 3 waiting to sync", { kind: "ghost" });
  s.connect(tap, write, { from: "b", to: "t" });
  s.connect(write, outbox, { from: "b", to: "t" });
  s.connect(outbox, screen, { from: "b", to: "t" });

  s.comment("Server");
  const skip = s.node(sx, Y(0), sw, h, "skip ids already applied");
  const check = s.node(sx, Y(1), sw, h, "compare base version, check rules");
  s.connect(skip, check, { from: "b", to: "t" });
  const [applied, appended, conflict] = s.row(sx, Y(2), sw, [{ label: "applied", hl: true }, "appended", { label: "conflict", fill: 1 }], { h, gap: 8 });
  const by = (check.y + check.h + applied.y) / 2;
  s.wire([check.port("b"), [check.cx, by]], { arrow: "none" });
  s.wire([[check.cx, by], appended.port("t")]);
  s.wire([[check.cx, by], [applied.cx, by], applied.port("t")], { hl: true });
  s.wire([[check.cx, by], [conflict.cx, by], conflict.port("t")]);
  const review = s.node(srv.x + srv.w - pad - 120, Y(3), 120, h, "review queue", { kind: "store", fill: 1 });
  s.wire([conflict.port("b"), [conflict.cx, review.y]]);

  s.comment("Replay on reconnect");
  const ch = (dev.x + dev.w + srv.x) / 2;
  s.wire([outbox.port("r"), [ch, outbox.cy], [ch, skip.cy], skip.port("l")], { hl: true, label: "replay\nin order", seg: 1, side: "left" });

  s.comment("Ack back to the device");
  const ay = bot + 18;
  s.wire([applied.port("b"), [applied.cx, ay], [screen.cx, ay], screen.port("b")], { label: "ack: drop from outbox, refresh", seg: 1, side: "below" });

  s.height = Math.ceil(ay + 30);
  return s.toString();
}
