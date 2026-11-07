import { createFrame, painterFor, TAU } from "../../core/index.js";
import { INK, GOLD, SILVER, tone, iconArt, cutPlate, blitArt } from "./_ember.js";

export const meta = {
  name: "Loadout panel",
  desc: "A matching backpack panel: black steel frame, slanted tabs, item sockets, equipped details and an amber selected slot. Hide contents for a background with native text overlays.",
  tags: ["ui", "inventory", "backpack", "panel", "equipment", "loop"],
  size: [352, 252], origin: [176, 126], duration: 2.4, loop: true, fps: 30, bg: "dark",
  options: { contents: true, frameOnly: false, title: "SATCHEL", selected: 0, palette: null, seed: 12 },
};
const panels = new Map();
export function draw(p, t, o) {
  const C = tone("bag", o.palette), key = JSON.stringify([o.contents, o.frameOnly, o.title, o.selected, C]);
  let image = panels.get(key);
  if (!image) {
    const frame = createFrame(...meta.size);
    paint(painterFor(frame).place(...meta.origin), o);
    image = frame.color;
    panels.set(key, image);
  }
  blitArt(p, image, ...meta.size, -meta.origin[0], -meta.origin[1]);
  const gx = -148 + (0.5 - 0.5 * Math.cos(t / 2.4 * TAU)) * 282;
  p.line(gx, -110, gx + 8, -110, C[4]);
}
function paint(p, o) {
  const C = tone("bag", o.palette), x = -164, y = -112;
  cutPlate(p, x, y, 328, 224, C, false);
  if (o.frameOnly) return;
  p.poly([[x + 9, y - 4], [x + 113, y - 4], [x + 105, y + 19], [x + 1, y + 19]], INK);
  p.line(x + 10, y - 3, x + 111, y - 3, SILVER[4]);
  p.line(x + 2, y + 18, x + 103, y + 18, SILVER[2]);
  if (o.title) p.text(String(o.title).slice(0, 15), x + 14, y + 3, SILVER[4], { font: "big", outline: INK });
  p.line(x + 16, y + 31, x + 310, y + 31, SILVER[0]);
  // Artwork beneath a real close button; the game owns its larger touch target.
  p.rect(153, -119, 16, 16, INK); p.rect(155, -117, 12, 12, SILVER[1]);
  p.line(158, -114, 164, -108, SILVER[4]); p.line(164, -114, 158, -108, SILVER[4]);
  if (!o.contents) return;
  for (let i = 0; i < 3; i++) {
    const xx = x + 16 + i * 66;
    p.poly([[xx, y + 21], [xx + 59, y + 21], [xx + 55, y + 38], [xx - 4, y + 38]], i === 0 ? GOLD[1] : INK);
    p.text(["GEAR", "HERO", "SETTINGS"][i], xx + 6, y + 26, i === 0 ? GOLD[4] : SILVER[2]);
  }
  const names = ["blade", "staff", "bow", "fire", "frost", "bolt"];
  const colors = ["attack", "bolt", "quick", "fire", "frost", "bolt"];
  names.forEach((icon, i) => {
    const xx = x + 17 + (i % 3) * 58, yy = y + 51 + Math.floor(i / 3) * 65, T = tone(colors[i]);
    cutPlate(p, xx, yy, 51, 56, T, i === o.selected);
    iconArt(p, icon, xx + 26, yy + 25, T);
    p.line(xx + 12, yy + 49, xx + 39, yy + 49, T[3]);
  });
  p.rect(x + 197, y + 51, 112, 132, INK);
  p.line(x + 197, y + 51, x + 197, y + 182, SILVER[0]);
  p.text("EQUIPPED", x + 208, y + 60, C[3]);
  iconArt(p, "blade", x + 254, y + 94, C);
  p.text("EMBER BLADE", x + 253, y + 124, SILVER[4], { align: "center" });
  p.line(x + 209, y + 136, x + 299, y + 136, SILVER[0]);
  p.text("ATK  +18%", x + 210, y + 146, C[4]);
  p.text("SPD  +6%", x + 210, y + 159, SILVER[2]);
  p.poly([[x + 212, y + 191], [x + 309, y + 191], [x + 303, y + 211], [x + 206, y + 211]], GOLD[1]);
  p.line(x + 213, y + 192, x + 307, y + 192, GOLD[3]);
  p.text("RETURN", x + 258, y + 198, GOLD[4], { align: "center", outline: INK });
  p.text("06 / 24", x + 19, y + 200, SILVER[2]);
}
