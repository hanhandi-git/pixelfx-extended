import { TAU, clamp } from "../../core/index.js";
import { INK, GOLD, SILVER, tone, iconArt, cutPlate } from "./_ember.js";

export const meta = {
  name: "Skill node",
  desc: "An illustrated chamfered skill tile: sword, flame, ice crystal, lightning, healing, meteor or arcane gem. Selection brackets, mana pips, cooldown, pressed and disabled states.",
  tags: ["ui", "skill", "node", "ability", "icon", "cooldown", "loop"],
  size: [92, 92], origin: [46, 46], duration: 2.4, loop: true, fps: 30, bg: "dark",
  options: { icon: "fire", selected: false, pressed: false, disabled: false, cooldown: 0, cdText: "", mana: 1, level: "", palette: null, seed: 8 },
};

export function draw(p, t, o) {
  const icon = ["slash", "fire", "frost", "bolt", "mend", "meteor", "burst", "none"].includes(o.icon) ? o.icon : "fire";
  const C = tone(icon, o.palette, o.disabled), y = o.pressed ? -32 : -34;
  cutPlate(p, -34, y, 68, 68, C, o.selected || o.pressed);
  p.rect(-27, y + 7, 54, 51, INK);
  p.poly([[-27, y + 12], [15, y + 7], [27, y + 7], [-27, y + 43]], C[0]);
  p.glow(0, y + 32, 25, C[2], o.selected ? 0.2 : 0.1);
  iconArt(p, icon, 0, y + 31, C, t);
  const cd = clamp(o.cooldown ?? 0), edge = -Math.PI / 2 + cd * TAU;
  if (cd > 0) {
    p.each(-27, y + 7, 27, y + 58, (x, py, sx, sy) => {
      if (x < -27 || x >= 27 || py < y + 7 || py >= y + 58) return;
      const u = ((Math.atan2(py - y - 32, x) + Math.PI / 2) / TAU + 1) % 1;
      if (u >= cd) return;
      p.blendPx(sx, sy, INK, 0.74);
    });
    p.arc(0, y + 32, 26, 1, -Math.PI / 2, edge, C[4]);
    if (o.cdText) p.text(String(o.cdText).slice(0, 4), 0, y + 28, SILVER[4], { font: "big", align: "center", outline: INK });
  }
  const mana = o.mana === false ? 0 : clamp(o.mana ?? 1);
  for (let i = 0; i < 3; i++) {
    const x = -8 + i * 8;
    p.poly([[x, y + 60], [x + 2, y + 62], [x, y + 64], [x - 2, y + 62]], mana > i / 3 ? C[3] : SILVER[0]);
  }
  if (o.selected) {
    for (const [x, py, sign] of [[-38, y - 3, 1], [37, y + 71, -1]]) {
      p.line(x, py, x + sign * 12, py, GOLD[4]); p.line(x, py, x, py + sign * 12, GOLD[3]);
    }
    p.glow(0, y + 3, 13, GOLD[3], 0.12 + 0.06 * Math.sin(t / 2.4 * TAU));
  }
  if (o.pressed) p.line(-24, y + 7, 24, y + 7, C[5]);
  if (o.level) {
    p.rect(16, y - 2, 17, 10, INK);
    p.text(String(o.level).slice(0, 3), 25, y, GOLD[4], { align: "center", outline: INK });
  }
  if (o.disabled || mana === 0) {
    p.rect(20, y + 48, 9, 9, INK); p.rect(22, y + 50, 5, 5, SILVER[2]);
    p.arc(24, y + 50, 3, 1, -Math.PI, 0, SILVER[3]);
  }
}
