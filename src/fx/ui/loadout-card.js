import { TAU } from "../../core/index.js";
import { INK, GOLD, SILVER, tone, iconArt, cutPlate } from "./_ember.js";

export const meta = {
  name: "Loadout card",
  desc: "A chamfered steel inventory card: illustrated weapon or spell, rarity inlay, amber selection, equipped checkmark and a quiet rim glint. Optional text for native font overlays.",
  tags: ["ui", "inventory", "loadout", "weapon", "spell", "card", "loop"],
  size: [240, 112], origin: [120, 56], duration: 2.4, loop: true, fps: 30, bg: "dark",
  options: { title: "EMBER BLADE", type: "WEAPON", glyph: "blade", rarity: "legendary", selected: true, equipped: true, level: "LV 03", detail: "+18% ATTACK", palette: null, seed: 10 },
};
const RARITIES = {
  common: ["#182030", "#343e50", "#5d6e83", "#a0adbb", "#c5cdd3", "#eef0e8"],
  rare: ["#14273b", "#27496e", "#3b7ba4", "#83bfd7", "#c5e9ee", "#f3fffa"],
  epic: ["#281e39", "#503465", "#81528e", "#c28cce", "#eac4ec", "#fff0ff"],
  legendary: ["#30211c", "#65412c", "#a36d3d", "#dbab61", "#ffe3a5", "#fff7e4"],
};
function fitText(p, value, maxWidth, font = "mini") {
  let str = String(value ?? "");
  if (p.measure(str, { font })[0] <= maxWidth) return str;
  while (str.length && p.measure(str + "...", { font })[0] > maxWidth) str = str.slice(0, -1);
  return str + "...";
}
export function draw(p, t, o) {
  const C = tone("bag", o.palette ?? RARITIES[o.rarity] ?? RARITIES.common), x = -110, y = -46;
  cutPlate(p, x, y, 220, 92, C, o.selected);
  p.rect(x + 8, y + 14, 2, 60, C[2]);
  cutPlate(p, x + 14, y + 13, 58, 58, C, false);
  p.rect(x + 20, y + 19, 46, 45, C[0]);
  p.glow(x + 43, y + 40, 23, C[2], 0.11);
  iconArt(p, o.glyph ?? "blade", x + 43, y + 41, C, t);
  const tiers = ["common", "rare", "epic", "legendary"], tier = Math.max(0, tiers.indexOf(o.rarity));
  for (let i = 0; i < 4; i++) p.rect(x + 27 + i * 9, y + 76, 5, 2, i <= tier ? C[3] : SILVER[0]);
  const tx = x + 84;
  if (o.type) p.text(fitText(p, o.type, 104), tx, y + 13, C[3], { outline: INK });
  if (o.title) p.text(fitText(p, o.title, 124, "big"), tx, y + 28, SILVER[4], { font: "big", outline: INK });
  p.line(tx, y + 43, x + 207, y + 43, SILVER[0]);
  if (o.detail) p.text(fitText(p, o.detail, 124), tx, y + 51, C[4], { outline: INK });
  if (o.level) p.text(fitText(p, o.level, 60), tx, y + 72, SILVER[2], { outline: INK });
  if (o.equipped) {
    p.poly([[x + 159, y + 66], [x + 208, y + 66], [x + 204, y + 80], [x + 155, y + 80]], GOLD[0]);
    p.line(x + 160, y + 67, x + 206, y + 67, GOLD[2]);
    p.poly([[x + 160, y + 73], [x + 163, y + 76], [x + 169, y + 69], [x + 163, y + 73]], GOLD[4]);
    p.text("EQUIP", x + 175, y + 71, GOLD[4]);
  }
  // The glint stays on the border and cannot wipe across names or icons.
  const u = 0.5 - 0.5 * Math.cos(t / 2.4 * TAU), gx = x + 12 + u * 192;
  p.line(gx, y + 2, Math.min(x + 214, gx + 7), y + 2, C[4]);
}
