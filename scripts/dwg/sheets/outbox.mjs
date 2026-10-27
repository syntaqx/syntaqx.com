// The transactional outbox as a standard diagram: state and event in one
// commit, a relay reading the outbox in order, the broker delivering at least
// once, and the mark-published step where duplicates come from. Embedded in
// content/docs/architecture/events.md.
import { sheet } from "../kit.mjs";

export default function draw() {
  const W = 760, x = 20, pad = 12, rh = 26, rowGap = 8;
  const s = sheet({ prefix: "ob", width: W });

  // Widths per part; the three gaps share what is left.
  const svcW = 80, grpW = 220, relayW = 112, brokerW = 130;
  const gap = (W - 2 * x - svcW - grpW - relayW - brokerW) / 3;
  const gx = x + svcW + gap, rx = gx + grpW + gap, bx = rx + relayW + gap;

  const consumersY = 22, nh = 36;
  const gy = consumersY + nh + 22; // group top
  const gh = 2 * rh + rowGap + 2 * pad;

  s.comment("One transaction, one commit");
  s.group(gx, gy, grpW, gh, "one transaction, one commit");
  const row = (y, table, value, hl) => {
    const n = s.node(gx + pad, y, grpW - 2 * pad, rh, null, { kind: "store", hl });
    s.text(n.x + 16, n.cy + 3, table, hl ? "tc hl" : "tc");
    s.text(n.x + n.w - 10, n.cy + 3, value, hl ? "tc hl" : "tc", "end");
    return n;
  };
  const payments = row(gy + pad, "payments", "status = captured");
  const outbox = row(gy + pad + rh + rowGap, "outbox_events", "payment.captured", true);

  s.comment("The service writes both rows");
  const svc = s.node(x, gy + gh / 2 - 14, svcW, 28, "service");
  const jx = svc.x + svc.w + 22;
  s.connect(svc, payments, { via: jx });
  s.connect(svc, outbox, { via: jx });

  s.comment("The event's way out");
  const relay = s.node(rx, outbox.cy - nh / 2, relayW, nh, "relay", { sub: "reads in order" });
  s.text(relay.cx, relay.y - 8, "polling or CDC", "sl", "middle");
  const broker = s.node(bx, outbox.cy - nh / 2, brokerW, nh, "broker");
  const consumers = s.node(bx, consumersY, brokerW, nh, "consumers", { sub: "dedupe by event ID" });
  s.connect(outbox, relay, { hl: true });
  s.connect(relay, broker, { hl: true, label: "publish" });
  s.connect(broker, consumers, { from: "t", to: "b", hl: true, label: "at least once", side: "left" });

  s.comment("Mark published, and where duplicates come from");
  const ly = gy + gh + 24;
  const vx = outbox.x + outbox.w - 60;
  s.wire([relay.port("b"), [relay.cx, ly], [vx, ly], [vx, outbox.y + outbox.h]], {
    alt: true,
    seg: 1,
    side: "below",
    label: "mark published after the broker's ack;\na crash before marking publishes it twice",
  });

  s.height = Math.ceil(ly + 12 + 11 + 20);
  return s.toString();
}
