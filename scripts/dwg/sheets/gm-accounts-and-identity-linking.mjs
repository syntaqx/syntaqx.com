// One account with its linked platform identities, per-game profiles and
// entitlement scopes, then one identity's links over time with the relink
// cooldown. Embedded in content/books/gaming/accounts-and-identity.md.
import { sheet } from "../kit.mjs";

// Illustrative values in days [4].
const V1 = 210, G1 = 30, W1 = V1 + G1;

export default function draw() {
  const W = 760, CX = W / 2;
  const s = sheet({ prefix: "gm-idl", width: W });

  s.comment("Notes");
  const ny = s.notes(32, 40, [
    [1, "One live link per platform identity, and one live identity per platform per account."],
    [2, "Device ID is anonymous; moving it into a real keychain discards the other progress permanently (EOS)."],
    [3, "Scope comes from the purchase's source and platform agreements; clients show only what is usable."],
    [4, "Illustrative values: the relink cooldown G1 is policy, not a platform rule."],
    [0, "View A not to scale. Values in days, listed in the table."],
  ], { width: 696 });

  // ---- Plan view A: one account, many identities ----
  s.comment("Plan view A: one account");
  let aBottom;
  {
    const top = ny + 40;
    const idW = 130, idH = 26, idGap = 12, idX = 52;
    const ids = ["Steam ID", "PSN account", "Xbox user", "Epic account", "Device ID"];
    const accW = 150, accH = 70, accX = CX - accW / 2;
    const idsH = ids.length * idH + (ids.length - 1) * idGap;
    const accY = top + (idsH - accH) / 2;
    const accMid = accY + accH / 2;

    ids.forEach((name, i) => {
      const y = top + i * (idH + idGap);
      s.rect(idX, y, idW, idH, i === 4 ? "slot" : "obj fill-2");
      s.label(idX, y, idW, idH, name);
      s.line(idX + idW, y + idH / 2, accX, accMid - 24 + i * 12, "leader");
    });
    s.nb(accX - 14, accY - 12, 1);
    s.nb(idX + idW - 14, top + 4 * (idH + idGap) + idH / 2, 2);

    s.rect(accX, accY, accW, accH, "obj hl");
    s.text(CX, accMid - 2, "account", "sl ink", "middle");
    s.text(CX, accMid + 12, "region · status · age band", "vs", "middle");

    // Per-game profiles under the account.
    const pW = 80, pH = 24, pY = accY + accH + 34;
    const pxs = [CX - pW - 8, CX + 8];
    pxs.forEach((x, i) => {
      s.line(CX, accY + accH, x + pW / 2, pY, "leader");
      s.rect(x, pY, pW, pH, "obj fill-1");
      s.label(x, pY, pW, pH, i ? "game B" : "game A");
    });
    s.text(CX, pY + pH + 14, "per-game profiles", "vs", "middle");

    // Entitlement scopes to the right.
    const sW = 150, sH = 26, sX = W - 52 - sW, sGap = 30;
    const scopes = [["portable", "web store · rewards · grants"], ["platform-scoped", "usable where bought"], ["time-bound", "passes · subscriptions"]];
    const sTop = accMid - (3 * sH + 2 * sGap) / 2;
    scopes.forEach(([name, sub], i) => {
      const y = sTop + i * (sH + sGap);
      s.line(accX + accW, accMid, sX, y + sH / 2, "leader");
      s.rect(sX, y, sW, sH, "obj fill-2");
      s.label(sX, y, sW, sH, name);
      s.text(sX + sW / 2, y + sH + 11, sub, "vs", "middle");
    });
    s.nb(sX + sW + 14, sTop + sH + sGap + sH / 2, 3);

    const bot = Math.max(top + idsH, pY + pH + 14);
    s.viewTitle(CX, bot + 40, "Plan view A · one account, many identities", "Not to scale · links in, ownership out");
    aBottom = bot + 53;
  }

  // ---- Plan view B: one identity's links over time, 1 day = 2 px ----
  s.comment("Plan view B: links over time");
  let bBottom;
  {
    const k = 2, v2 = 40; // V2 is open; drawn 40 days long with an arrow.
    const x0 = CX - ((W1 + v2) * k) / 2 + 10;
    const X = (d) => x0 + d * k;
    const aY = aBottom + 60, bY = aY + 36, h = 24;
    s.text(x0 - 10, aY + h / 2 + 3, "account A", "sl ink", "end");
    s.text(x0 - 10, bY + h / 2 + 3, "account B", "sl ink", "end");
    s.rect(X(0), aY, V1 * k, h, "obj fill-2");
    s.label(X(0), aY, V1 * k, h, "linked");
    s.rect(X(W1), bY, v2 * k, h, "obj fill-1");
    s.label(X(W1), bY, v2 * k, h, "V2", "dt");
    s.path(`M${X(W1 + v2)},${bY + h / 2}H${X(W1 + v2) + 20}`, "leader", { "marker-end": `url(#${s.id("ah")})` });
    s.text(X(W1 + v2) + 24, bY + h / 2 + 3, "open", "sl ink");

    const cy = bY + h + 22;
    s.chainH([X(0), X(V1), X(W1)], cy, ["V1", "G1"], { from: [aY + h, aY + h, bY + h], below: true });
    s.nb(X(W1) + 16, cy + 8, 4);
    const wy = cy + 30;
    s.dimH(X(0), X(W1), wy, "W1", { from: [cy + 4, cy + 4], below: true, hl: false });
    s.viewTitle(CX, wy + 46, "Plan view B · one identity's links over time", "Scale 1 day = 2 px · timeline · illustrative");
    bBottom = wy + 59;
  }

  s.comment("Variable table");
  const tb = s.table(CX - 190, bBottom + 46, "Variables · days, illustrative", [
    ["V1", "linked to account A, then unlinked", String(V1)],
    ["G1", "cooldown before linking to a different account", String(G1)],
    ["W1", "first link to relink", `V1 + G1 = ${W1}`],
    ["V2", "linked to account B, no end yet", "open"],
  ]);
  s.height = Math.ceil(tb.y + 30);
  return s.toString();
}
