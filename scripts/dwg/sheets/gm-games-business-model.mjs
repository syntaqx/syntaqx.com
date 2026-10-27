// The gaming volume's data model in four rows (who plays, what they own,
// play, conduct): tables as boxes on a five-column grid, arrows from the
// one side to the many with their cardinality, the account in the accent.
// Embedded in content/books/gaming/games-business.md.
import { sheet } from "../kit.mjs";

export default function draw() {
  const W = 760, h = 26, gap = 48;
  const s = sheet({ prefix: "gm-gbmo", width: W });

  // Five columns, each as wide as its widest table name.
  const widths = [130, 110, 96, 84, 96];
  const total = widths.reduce((a, b) => a + b) + gap * (widths.length - 1);
  const X = [];
  widths.reduce((x, w) => (X.push(x), x + w + gap), (W - total) / 2);
  const tbl = (c, y, label, o = {}) => s.node(X[c], y, widths[c], h, label, { code: true, ...o });
  const rowY = [44, 134, 224, 314];
  const title = (i, t) => s.text(X[0], rowY[i] - 10, t, "lt");
  const sub = (n, t) => s.text(n.cx, n.y + h + 14, t, "sl", "middle");

  // Cardinality keeps its case (tc), beside the segment with a knockout.
  const card = (pts, t, side = "above") => {
    s.wire(pts);
    const [[x1, y1], [x2, y2]] = pts.slice(-2);
    if (Math.abs(y1 - y2) < 0.5) s.text((x1 + x2) / 2, y1 - 5, t, "tc ko", "middle");
    else s.text(side === "left" ? x1 - 6 : x1 + 6, (y1 + y2) / 2 + 3, t, "tc ko", side === "left" ? "end" : "start");
  };

  s.comment("Who plays");
  title(0, "who plays");
  const ident = tbl(0, rowY[0], "platform_identity");
  const account = tbl(1, rowY[0], "account", { hl: true });
  const profile = tbl(2, rowY[0], "player_profile");
  const game = tbl(3, rowY[0], "game", { fill: 1 });
  const build = tbl(4, rowY[0], "build");
  card([account.port("l"), ident.port("r")], "1..n");
  card([account.port("r"), profile.port("l")], "1..n");
  card([game.port("l"), profile.port("r")], "1..n");
  card([game.port("r"), build.port("l")], "1..n");

  s.comment("What they own");
  title(1, "what they own");
  const ledger = tbl(0, rowY[1], "currency_ledger_entry");
  const wallet = tbl(1, rowY[1], "wallet");
  const entitlement = tbl(2, rowY[1], "entitlement");
  const item = tbl(3, rowY[1], "item");
  const instance = tbl(4, rowY[1], "item_instance");
  s.connect(wallet, ledger, { from: "l", to: "r" });
  card([account.port("b"), wallet.port("t")], "1..n", "left");
  s.connect(account, entitlement, { from: "b", to: "t", at: [0.85, 0.3], seg: 1, label: "holds" });
  card([game.port("b"), item.port("t")], "0..n", "right");
  card([item.port("l"), entitlement.port("r")], "1..n");
  card([item.port("r"), instance.port("l")], "1..n");
  sub(ledger, "append-only, summed");
  sub(entitlement, "held by an account");
  sub(instance, "held by a profile");

  s.comment("Play");
  title(2, "play");
  const party = tbl(0, rowY[2], "party");
  const participant = tbl(1, rowY[2], "match_participant");
  const match = tbl(2, rowY[2], "match");
  const server = tbl(3, rowY[2], "game_server");
  s.connect(party, participant);
  card([match.port("l"), participant.port("r")], "1..n");
  s.connect(server, match, { from: "l", to: "r", label: "hosts" });
  sub(participant, "one per profile per match");
  sub(server, "runs a server build");

  s.comment("Conduct");
  title(3, "conduct");
  const report = tbl(0, rowY[3], "report");
  const penalty = tbl(2, rowY[3], "penalty");
  s.connect(report, penalty, { alt: true, label: "can lead to" });
  sub(report, "profile about profile");
  sub(penalty, "on an account: one game or all");

  s.height = Math.ceil(rowY[3] + h + 14 + 20);
  return s.toString();
}
