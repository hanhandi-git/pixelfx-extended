// A target bar for an arcade-dungeon HUD. Bosses get a portrait box, a name, a phase tag and a stacked
// bar that drains line by line with an "xN" counter; ordinary enemies get the compact name and thin bar.
import { clamp, hex, WHITE } from "../../core/index.js";
import { DNF, label, layeredBar } from "./_dnf.js";

export const meta = {
  name: "Dungeon boss bar",
  desc: "A stacked target bar: portrait box, name, phase tag and a multi-line health bar that drains colour by colour with an xN counter and a damage trail. Compact mode for mobs.",
  tags: ["ui", "hud", "boss", "health", "bar", "dungeon", "loop"],
  size: [184, 28],
  origin: [92, 2],
  duration: 2.4,
  loop: true,
  fps: 30,
  bg: "dark",
  options: { name: "THE WARDEN", value: 0.62, trail: 0.64, layers: 12, phase: "PHASE II", compact: false, a: 1, seed: 5 },
};

const SKULL = [
  "..#######..",
  ".#########.",
  "###########",
  "##..###..##",
  "##..###..##",
  "#####.#####",
  ".####.####.",
  "..#######..",
  "..#.#.#.#..",
  "..#.#.#.#..",
];

export function draw(p, t, o) {
  const a = clamp(o.a ?? 1);
  if (a <= 0.02) return;
  const value = clamp(o.value ?? 1), trail = o.trail === undefined || o.trail === null ? undefined : clamp(o.trail);
  if (o.compact) {
    if (o.name) label(p, o.name, 0, 0, DNF.text, { align: "center", outline: DNF.ink, a });
    if (a > 0.5) layeredBar(p, -44, 8, 88, 2, value, 1, { trail });
    return;
  }
  // portrait box
  p.rect(-88, 0, 19, 19, DNF.ink); p.rect(-87, 1, 17, 17, DNF.gold); p.rect(-86, 2, 15, 15, hex("#1a1024"));
  p.sprite(SKULL, { "#": "#d9c8f0" }, -84, 4);
  const pulse = 0.5 + 0.5 * Math.sin((t / 2.4) * Math.PI * 4);
  p.dot(-81.5, 7.5, hex("#ff5a4a"), 0.6 + 0.4 * pulse); p.dot(-76.5, 7.5, hex("#ff5a4a"), 0.6 + 0.4 * pulse);
  p.glow(-78.5, 9, 9, hex("#b060ff"), 0.14);

  label(p, o.name ?? "", -66, 1, hex("#e8ccff"), { outline: DNF.ink });
  if (o.phase) label(p, o.phase, 68, 1, DNF.gold, { align: "right", outline: DNF.ink });
  const left = layeredBar(p, -66, 9, 134, 8, value, o.layers ?? 1, { trail, cells: 10 });
  p.rect(-67, 18, 136, 0.5, DNF.lineLo);
  if ((o.layers ?? 1) > 1) {
    p.text("x", 72, 11, DNF.goldHi, { outline: DNF.ink });
    p.text(String(left), 77, 9, WHITE, { font: "big", outline: DNF.ink });
  }
}
