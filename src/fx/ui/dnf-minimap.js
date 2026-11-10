// The top-right dungeon card of an arcade-dungeon HUD: the dungeon name, a row of room cells (cleared,
// current, ahead, boss) joined by a corridor line, and a wave/timer line. Anchored at its top-right corner.
import { hex, TAU } from "../../core/index.js";
import { DNF, label, windowFrame } from "./_dnf.js";

export const meta = {
  name: "Dungeon minimap",
  desc: "A dungeon progress card: name, a corridor of room cells (cleared, current, ahead and boss rooms) and a wave and timer line, in the arcade-dungeon HUD style.",
  tags: ["ui", "hud", "minimap", "dungeon", "stage", "progress", "loop"],
  size: [72, 40],
  origin: [70, 2],
  duration: 2.4,
  loop: true,
  fps: 30,
  bg: "dark",
  options: { title: "MOSSY RUINS", rooms: 7, current: 2, boss: [2, 6], sub: "WAVE 2/3", time: "1:24", width: 66, seed: 6 },
};

export function draw(p, t, o) {
  const w = Math.max(48, Math.min(70, Math.round(o.width ?? 66))), h = o.sub || o.time ? 31 : 23, x = -w;
  windowFrame(p, x, 0, w, h, { a: 0.72 });
  label(p, o.title ?? "", x + w / 2, 3, DNF.goldHi, { align: "center", outline: DNF.ink });
  const n = Math.max(1, Math.min(9, o.rooms ?? 7)), cell = 6, step = Math.min(8, Math.floor((w - 8 - cell) / Math.max(1, n - 1)));
  const x0 = x + Math.round((w - (step * (n - 1) + cell)) / 2), y0 = 12;
  p.rect(x0 + 2, y0 + 2.5, step * (n - 1), 1, DNF.lineLo);
  const boss = Array.isArray(o.boss) ? o.boss : [], blink = 0.5 + 0.5 * Math.sin((t / 2.4) * TAU * 2);
  for (let i = 0; i < n; i++) {
    const cx = x0 + i * step, cur = i === o.current, done = i < o.current, isBoss = boss.includes(i);
    p.rect(cx, y0, cell, cell, DNF.ink);
    p.rect(cx + 1, y0 + 1, cell - 2, cell - 2, cur ? DNF.goldHi : done ? DNF.blue : isBoss ? hex("#7a2030") : DNF.lineLo);
    if (cur) {
      p.rect(cx + 2, y0 + 2, 2, 2, blink > 0.5 ? hex("#ffffff") : DNF.gold);
      p.glow(cx + 3, y0 + 3, 6, DNF.goldHi, 0.2 + 0.15 * blink);
    } else if (done) p.rect(cx + 1, y0 + 1, cell - 2, 1, DNF.blueHi);
    else if (isBoss) { p.rect(cx + 2, y0 + 2, 2, 2, DNF.red); p.rect(cx + 1, y0 + 1, cell - 2, 0.5, hex("#c04050")); }
    else p.rect(cx + 2, y0 + 2, 2, 2, DNF.well);
  }
  if (o.sub) label(p, o.sub, x + 4, 22, DNF.text, { outline: DNF.ink });
  if (o.time) p.text(o.time, x + w - 4, 22, DNF.muted, { align: "right", outline: DNF.ink });
}
