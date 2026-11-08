// The placed-weapon recipe: an armory item floats point-up in its own light, slowly bobbing, with a sheen
// running down the steel, light ribbons circling the blade and motes climbing out of a turning floor seal.
// The hover, floor glow and motes follow Sprite Fusion's open-source pickup and sparkle
// (https://www.spritefusion.com/pixel-art-vfx/pickup), MIT License, Copyright (c) 2026 Hugo Duprez.
// Files starting with _ are helpers, not effects.

import { WEAPONS, fit, clamp, smooth, ease, cycle, band, TAU, WHITE, hex, mix } from "../../core/index.js";

const INK = hex("#0b0814");
const CACHE = new Map();

/**
 * The armory geometry, rasterized upright: the grip sits on the y axis, the blade runs up (-y) and the
 * blade's thickness is the screen x. The rig draws weapons in grip-local coordinates (x along the blade,
 * k across it, lit on k < 0), so a quarter turn keeps every 1 px step crisp and makes the lit edge the left
 * rim. Returns the body pixels with their height fraction u (0 at the pommel, 1 at the point), their 1 px
 * ink outline and the lit rim.
 */
function upright(id) {
  const hit = CACHE.get(id);
  if (hit) return hit;
  const sampled = new Map();
  const T = (x, y, c) => { if (c) sampled.set(`${Math.round(y)},${Math.round(-x)}`, c); };
  WEAPONS[id].draw(T, {});
  const body = [...sampled].map(([k, c]) => {
    const [x, y] = k.split(",").map(Number);
    return { x, y, c };
  });
  const xs = body.map((p) => p.x), ys = body.map((p) => p.y);
  const minX = Math.min(...xs), maxX = Math.max(...xs), minY = Math.min(...ys), maxY = Math.max(...ys);
  const span = Math.max(1, maxY - minY);
  for (const p of body) p.u = (maxY - p.y) / span;
  const bodyAt = new Set(body.map((p) => `${p.x},${p.y}`));
  const inkAt = new Set(), ink = [];
  for (const p of body) for (const [dx, dy] of [[-1, 0], [1, 0], [0, -1], [0, 1]]) {
    const k = `${p.x + dx},${p.y + dy}`;
    if (bodyAt.has(k) || inkAt.has(k)) continue;
    inkAt.add(k);
    ink.push({ x: p.x + dx, y: p.y + dy });
  }
  // the lit rim: the blade's edge that faces the light (k < 0 in the rig, screen left after the turn)
  const rim = body.filter((p) => !bodyAt.has(`${p.x - 1},${p.y}`));
  const sprite = { body, ink, rim, minX, maxX, minY, maxY, span };
  CACHE.set(id, sprite);
  return sprite;
}

/** The vertical line a ribbon rides: u 0 at the pommel, 1 at the point, twisting along the blade. */
const strand = (S, u, ph, off) => {
  const phase = u * 2.5 + ph * TAU + off;
  return { x: Math.sin(phase) * (4.2 + 2.6 * Math.sin(u * Math.PI)), y: S.minY + u * S.span, front: Math.cos(phase) > 0 };
};

// light ribbons: half of each strand is behind the blade, half in front, so the weapon reads as a solid in
// a swirl rather than a sticker with a border
function ribbons(p, C, S, ph, ox, oy, front) {
  for (let s = 0; s < 3; s++) {
    const off = (s * TAU) / 3 + 0.8, wide = s === 1;
    for (let j = 0; j <= 64; j++) {
      const u = j / 64, q = strand(S, u, ph, off);
      if (q.front !== front) continue;
      const a = Math.pow(Math.sin(Math.PI * u), 0.6), x = q.x + ox, y = q.y + oy;
      const c = front ? (wide && u > 0.3 ? WHITE : C[6]) : C[4];
      p.px(x, y, c);
      if (j % 5 === 0) p.glow(x, y, 3.4, C[5], 0.12 * a);
    }
  }
  if (!front) return;
  // a comet bead climbing one strand and fading out at the tip before it wraps: no seam
  const bu = 0.5 - 0.5 * Math.cos(ph * TAU), bq = strand(S, clamp(bu, 0, 1), ph, 0.8);
  for (let k = 5; k >= 0; k--) {
    const u = clamp(bu - k * 0.014, 0, 1), q = strand(S, u, ph, 0.8), fall = 1 - k / 6;
    const x = q.x + ox, y = q.y + oy;
    if (k === 0) { p.px(x, y, WHITE); p.glow(x, y, 7, C[6], 0.34); }
    else p.dot(x, y, C[6], 0.75 * fall * fall);
  }
  p.glow(bq.x + ox, bq.y + oy, 9, C[5], 0.12);
}

// the turning floor seal: identical dashes rotated a dash a loop (seamless), a static inner ellipse of light,
// two rings pulsing out from under the item
function seal(p, C, ph) {
  p.shade(-20, -5, 20, 5, (x, y, out) => {
    const d = (x / 19) ** 2 + (y / 4.6) ** 2;
    if (d >= 1) return;
    out.l = C[3];
    out.k = 0.3 * (1 - Math.sqrt(d)) ** 2;
  });
  // the seal: two continuous ellipses (an unbroken line reads as one, a scatter of dots reads as noise),
  // ten turning dashes outside them and four ticks in the middle
  for (let i = 0; i < 84; i++) {
    const a = (i / 84) * TAU;
    p.px(Math.cos(a) * 12, Math.sin(a) * 3.7, i % 2 ? C[4] : C[3]);
  }
  for (let i = 0; i < 56; i++) {
    const a = (i / 56) * TAU;
    p.px(Math.cos(a) * 7.4, Math.sin(a) * 2.3, i % 2 ? C[3] : C[2]);
  }
  for (let i = 0; i < 10; i++) {
    const a = (i / 10) * TAU + (ph * TAU) / 10, ca = Math.cos(a), sa = Math.sin(a);
    for (let d = 0; d < 3; d++) p.px(ca * (14.4 + d * 0.55), sa * (4.45 + d * 0.17), d === 0 ? C[6] : d === 1 ? C[5] : C[4]);
  }
  for (let i = 0; i < 4; i++) {
    const a = (i / 4) * TAU - (ph * TAU) / 4, x = Math.cos(a) * 9.6, y = Math.sin(a) * 3.0;
    p.px(x, y, C[6]); p.px(x, y - 1, C[3]);
  }
  for (const launch of [0.1, 0.6]) {
    const age = (((ph - launch) % 1) + 1) % 1, k = age / 0.55;
    if (k >= 1) continue;
    band(p, 0, 0.4, 3.5 + 19 * ease.outCubic(k), 0.23, Math.max(1, 2.4 * (1 - k)), 0.95 * (1 - k), [C[2], C[4], C[5], C[6]]);
  }
}

// the hazy column that the item hangs in, and two filaments climbing it
function column(p, C, ph, ox, top) {
  for (let y = -2; y > top; y -= 6) {
    const u = -y / -top;
    p.glow(ox * 0.5, y, 11 + 5 * (1 - u), C[4], 0.1 * (1 - u * 0.6));
  }
  for (let s = -1; s <= 1; s += 2) for (let y = -3; y > top; y -= 1) {
    const u = -y / -top;
    p.dot(s * (3.5 + Math.sin(u * 5 + ph * TAU + s) * 1.8), y, C[5], 0.4 * Math.sin(Math.PI * u) ** 0.5);
  }
}

// motes climbing out of the seal and drifting past the blade
function motes(p, C, t, T, seed, top, S, oy) {
  cycle(t, T, 24, seed, (g) => g.range(0.9, 1.7), (age, life, r) => {
    const inner = r.chance(0.45), side = r.sign();
    const x0 = inner ? r.range(-4, 4) : side * r.range(5, 12), vy = r.range(13, 30) * (inner ? 1.7 : 1);
    const x = x0 + Math.sin(age * r.range(1.2, 2.6) + r.range(0, TAU)) * 1.7, y = -r.range(0, 4) - vy * age;
    const k = Math.min(1, age / 0.3, (life - age) / 0.5);
    if (k <= 0 || y < top) return;
    // keep the steel clean: no mote pixels across the item's own silhouette
    if (Math.abs(x) < 7 && y > S.minY + oy && y < S.maxY + oy) return;
    if (r.chance(0.22)) {
      const tw = 0.5 + 0.5 * Math.sin(age * r.range(8, 13) + r.range(0, TAU));
      if (tw * k > 0.35) { p.px(x, y, C[6]); p.px(x, y - 1, C[4]); }
      return;
    }
    p.dot(x, y, inner ? WHITE : C[6], k);
    for (let d = 1; d < 1 + Math.round(2 * k); d++) p.dot(x, y + d, C[5], k * (0.8 - d * 0.2));
    p.glow(x, y, 3, C[5], 0.16 * k);
  });
}

/**
 * A placed-weapon effect. `id` is an ARMORY weapon; `palette` is the aura ramp (dark to bright) that tints
 * the ribbons, seal and light without touching the weapon's own materials.
 */
export function weaponDrop({ id, name, desc, palette, seed = 1 }) {
  const S = upright(id), FLOAT = 13;
  const baseY = -FLOAT - S.maxY; // the pommel hovers at y = -13
  const tip = { x: 0, y: S.minY }; // sprite-local: draw() adds the same oy as the body
  // the canvas is cut to the item: the floor sits 10 px up from the bottom and the halo needs ~29 px
  // above the point, so a dagger and a two-handed lance both fill their tile at the same 1x scale
  const height = Math.max(100, Math.round(S.span + 68));
  const meta = {
    name, desc,
    tags: ["武器", "weapon", id, "equipment", "drop", "hover", "idle", "glow", "armory", "loop"],
    size: [88, height], origin: [44, height - 10], duration: 3.2, loop: true, fps: 30, bg: "ground",
    options: { palette, seed },
  };

  function place(ph) {
    const bob = -2 * Math.sin(ph * TAU), sway = Math.round(Math.sin(ph * TAU + 1.1) * 1.4);
    return { bob, sway, ox: sway, oy: baseY + Math.round(bob) };
  }

  function drawBack(p, t, o) {
    const C = fit(o.palette, 8), T = meta.duration, ph = t / T, { bob, sway, oy } = place(ph);
    const lift = smooth(-2, 2, bob); // 0 at the top of the bob, 1 at the bottom
    // floor: a soft pool, a small shadow that thins as the item rises, the turning seal and its pulses
    blob(p, 0, 7.5 - lift * 1.4, 0.62 - lift * 0.16);
    seal(p, C, ph);
    column(p, C, ph, sway, S.minY + oy - 16);
    // the far half of the ribbons, the halo and the light the blade throws
    ribbons(p, C, S, ph, sway, oy, false);
    const mid = (S.minY + S.maxY) / 2 + oy;
    p.glow(sway * 0.4, mid, 24, C[4], 0.14 + 0.03 * Math.sin(ph * TAU * 2));
    // a halo of dotted rings behind the upper blade: the item is held by something, not just floating
    const hy = S.minY + S.span * 0.42 + oy, r = Math.max(9, S.span * 0.27);
    for (const [rad, n, spin, c1, c2] of [[r, 30, 1, C[6], C[5]], [r + 4, 40, -1, C[5], C[4]], [r + 8, 14, 1, C[4], C[3]]]) {
      for (let i = 0; i < n; i++) {
        const a = (i / n) * TAU + (spin * ph * TAU) / 6;
        p.px(sway * 0.5 + Math.cos(a) * rad, hy + Math.sin(a) * rad, i % 3 ? c1 : c2);
      }
    }
    p.glow(sway * 0.5, hy, r + 9, C[4], 0.16);
    for (let y = S.maxY; y >= S.minY; y -= 5) p.glow(sway * 0.5, y + oy, 7, C[4], 0.06);
    // the bloom of the silhouette itself
    for (let i = 0; i < S.body.length; i += 6) {
      const q = S.body[i];
      p.glow(q.x + sway, q.y + oy, 5, C[4], 0.07);
    }
  }

  function draw(p, t, o) {
    const C = fit(o.palette, 8), T = meta.duration, ph = t / T, { ox, oy } = place(ph);
    // the ink outline, then the body: hard pixels over the glow
    for (const q of S.ink) p.px(q.x + ox, q.y + oy, INK);
    const sheen = (ph - 0.55) / 0.3, su = sheen > 0 && sheen < 1 ? ease.inOutSine(sheen) : -1;
    for (const q of S.body) {
      let c = q.c;
      if (su >= 0) {
        const d = Math.abs(q.u - su);
        if (d < 0.13) c = d < 0.045 ? WHITE : mix(c, C[6], 1 - d / 0.13);
      }
      p.px(q.x + ox, q.y + oy, c);
    }
    for (const q of S.rim) p.px(q.x + ox, q.y + oy, mix(q.c, C[6], 0.45));
    // the point catches the light, then a hard glint on the beat
    p.glow(tip.x + ox, tip.y + oy, 10, C[5], 0.3);
    const g1 = (ph - 0.36) / 0.12;
    if (g1 > 0 && g1 < 1) {
      const k = Math.sin(g1 * Math.PI), n = Math.round(1 + 3 * k);
      for (let d = 1; d <= n; d++) {
        p.px(tip.x + ox + d, tip.y + oy, k > 0.6 ? C[6] : C[4]);
        p.px(tip.x + ox - d, tip.y + oy, C[4]);
        p.px(tip.x + ox, tip.y + oy + d, C[4]);
        p.px(tip.x + ox, tip.y + oy - d, k > 0.5 ? C[6] : C[4]);
      }
      p.px(tip.x + ox, tip.y + oy, WHITE);
      p.glow(tip.x + ox, tip.y + oy, 4 + 5 * k, C[6], 0.3 * k);
    }
    // the near half of the ribbons, its comet, and the motes
    ribbons(p, C, S, ph, ox, oy, true);
    motes(p, C, t, T, o.seed, S.minY + oy - 12, S, oy);
    // a rare twinkle at the guard, out of step with the point
    const g2 = (ph - 0.82) / 0.1;
    if (g2 > 0 && g2 < 1) {
      const k = Math.sin(g2 * Math.PI), gx = ox + Math.round(S.maxX * 0.2), gy = oy + S.maxY - 4;
      p.px(gx, gy, WHITE); p.px(gx + 1, gy, C[5]); p.px(gx - 1, gy, C[5]);
      p.glow(gx, gy, 7, C[5], 0.28 * k);
    }
  }
  return { meta, drawBack, draw };
}

// a dithered floor shadow under the floating item
function blob(p, x, rx, k) {
  if (rx < 0.8 || k <= 0) return;
  for (let i = Math.floor(x - rx); i <= Math.ceil(x + rx); i++) {
    const u = Math.abs(i + 0.5 - x) / rx;
    if (u > 1) continue;
    p.dot(i, 0, INK, k * (1 - u * u) * 1.1);
    if (u < 0.55) p.dot(i, 1, INK, k * 0.5);
  }
}
