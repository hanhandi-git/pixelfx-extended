// Compact HUD on/off tile: rounded square plate (like skill nodes), tiny icon, optional lit rim when on.
import { fit, clamp, hex } from "../../core/index.js";
import { panel, UI_INK, UI_GOLD } from "./_lib.js";

export const meta = {
  name: "HUD toggle",
  desc: "A small rounded square HUD toggle for auto-battle, auto-loot and similar switches. Gold when on, recessed ink when off.",
  tags: ["ui", "hud", "toggle", "button", "loop"],
  size: [18, 18],
  origin: [9, 9],
  duration: 2.4,
  loop: true,
  fps: 30,
  bg: "dark",
  options: { on: false, icon: "battle", size: 15, seed: 4 },
};

const OFF = {
  outline: hex("#0d0a14"),
  rim: hex("#4a3f62"),
  top: hex("#241e32"),
  body: hex("#1a1524"),
  low: hex("#100c18"),
};

const ICONS = {
  battle: {
    rows: [
      "....#....",
      "...###...",
      "..##o##..",
      ".##ooo##.",
      "###ooo###",
      "..##o##..",
      "...###...",
      "....#....",
    ],
    pal: { "#": "#fff4be", o: "#ff9a4a" },
  },
  loot: {
    rows: [
      "....c....",
      "...cbc...",
      "..cbbbc..",
      ".cbbbbbc.",
      "..cbbbc..",
      "...cbc...",
      "....c....",
      ".........",
    ],
    pal: { c: "#c8ffb0", b: "#7ce89a" },
  },
};

export function draw(p, t, o) {
  const s = clamp(Math.round(o.size ?? 15), 12, 20);
  const x = -Math.floor(s / 2), y = -Math.floor(s / 2);
  const on = !!o.on;
  const G = fit(UI_GOLD, 8);
  const plate = on
    ? { outline: G[0], rim: G[6], top: G[4], body: G[2], low: G[1] }
    : OFF;
  const r = s >= 16 ? 4 : 3;
  panel(p, x, y, s, s, plate, { r });
  if (on) {
    p.rect(x + 2, y + 2, s - 4, 1, G[6]);
    const u = (t / meta.duration) % 1;
    const gx = x + 2 + Math.round((s - 5) * u);
    p.rect(gx, y + 2, 1, s - 4, G[7], 0.65);
    p.glow(0, 0, s * 0.45, G[5], 0.1);
  } else {
    p.rect(x + 2, y + s - 3, s - 4, 1, OFF.low);
  }

  const spec = ICONS[o.icon === "loot" ? "loot" : "battle"];
  const pal = on ? spec.pal : Object.fromEntries(Object.keys(spec.pal).map((k) => [k, "#6a5f7e"]));
  const ix = -4, iy = -4;
  p.sprite(spec.rows, Object.fromEntries(Object.keys(pal).map((k) => [k, UI_INK.outline])), ix + 1, iy + 1, { a: on ? 0.85 : 0.7 });
  p.sprite(spec.rows, pal, ix, iy, { a: on ? 1 : 0.82 });
  if (on) {
    p.dot(x + s - 4, y + 3, G[7]);
    p.dot(x + s - 3, y + 3, G[6], 0.85);
  }
}
