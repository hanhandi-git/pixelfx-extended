// Hand-built fantasy materials. Geometry and clustered pigment are baked; only hearths and magic animate.
import { hex, mix, rand, noise2, clamp, TAU } from "../../core/index.js";
import { contour } from "./_nature.js";

export const WOOD = ["#171b25", "#30252e", "#513732", "#79513b", "#aa7951", "#d3ab74", "#f2d49a"].map(hex);
export const STONE = ["#172437", "#2c3a4a", "#47535f", "#6c777a", "#98a393", "#c4c7a4", "#ece1b5"].map(hex);
export const GOLD = ["#322832", "#664238", "#97623c", "#c39250", "#e8c279", "#ffe7a8", "#fff6cd"].map(hex);
export const FIRE = ["#722a36", "#bb493a", "#f0803d", "#ffc568", "#fff0b0"].map(hex);
export const ARCANE = ["#1a2449", "#243b6c", "#32668d", "#43a5b3", "#7bdfd1", "#ccffe2"].map(hex);

/** Broad shade planes with small, connected pigment clusters rather than pixel noise. */
export function painted(p, pts, C, seed = 1, bias = 0) {
  const xs = pts.map(q => q[0]), ys = pts.map(q => q[1]);
  const x0 = Math.min(...xs), y0 = Math.min(...ys), w = Math.max(...xs) - x0 || 1, h = Math.max(...ys) - y0 || 1;
  p.poly(pts, (x, y) => {
    const mass = noise2(x / 13, y / 11, seed), brush = noise2(Math.floor(x / 2.5), Math.floor(y / 1.5), seed + 19);
    const light = 3.8 - (y - y0) / h * 1.4 - (x - x0) / w * 0.9 + mass * 0.8 + brush * 0.3 + bias;
    return C[Math.floor(clamp(light, 0, C.length - 1))];
  });
}

export function block(p, x, y, w, h, C = STONE, seed = 1) {
  const cut = Math.min(2, h * 0.3);
  const pts = [[x + cut, y], [x + w - 1, y - 0.5], [x + w, y + h - cut], [x + w - cut, y + h], [x, y + h - 1], [x, y + cut]];
  painted(p, pts, C, seed);
  p.polyline([pts[5], pts[0], pts[1]], C[4]);
  p.polyline([pts[2], pts[3], pts[4]], C[1]);
  if (w > 8) p.line(x + 3, y + h - 2, x + 6, y + h - 3, C[2]);
}

export function masonry(p, x, y, w, h, C = STONE, seed = 1) {
  p.rect(x, y, w, h, C[0]);
  let row = 0;
  for (let yy = y; yy < y + h; yy += 7, row++) {
    for (let xx = x - (row % 2) * 7; xx < x + w; xx += 15) {
      const a = Math.max(x, xx + 1), b = Math.min(x + w, xx + 14);
      if (b > a) block(p, a, yy + 1, b - a, Math.min(5.5, y + h - yy - 1), C, seed + row * 9 + xx);
    }
  }
}

export function timber(p, points, width = 3, C = WOOD) {
  const path = contour(points);
  for (let i = 1; i < path.length; i++) p.beam(...path[i - 1], ...path[i], width, C[1]);
  p.polyline(path.map(([x, y]) => [x - 0.6, y - 0.6]), C[4]);
  p.polyline(path.map(([x, y]) => [x + 0.8, y]), C[2]);
}

export function leafMass(p, x, y, rx, ry, C, seed = 1) {
  p.shade(x - rx, y - ry, x + rx, y + ry, (px, py) => {
    const nx = (px - x) / rx, ny = (py - y) / ry;
    const edge = 0.88 + noise2(px / 7, py / 5, seed) * 0.12;
    if (Math.hypot(nx, ny) > edge) return;
    const mass = noise2(px / 8, py / 5.5, seed + 3), brush = noise2(px / 3.5, py / 2.5, seed + 11);
    return C[Math.floor(clamp(2.8 - ny * 1.05 - nx * 0.5 + mass * 1.15 + brush * 0.2, 0, C.length - 1))];
  });
}

export function sprig(p, x, y, s, C, seed = 1) {
  for (let i = 0; i < 5; i++) {
    const dx = (i - 2) * s * 1.25, h = s * (2.4 + rand(seed, i, 1) * 1.7);
    p.poly([[x, y], [x + dx * 0.6 - 1, y - h * 0.5], [x + dx, y - h], [x + dx * 0.7 + 1, y - h * 0.45]], C[2 + i % 2]);
    p.line(x, y, x + dx, y - h, C[4]);
  }
}

/** A deep-perspective floor, with worn slabs sunk into earth instead of a platform edge. */
export function road(p, C, seed, forest = false) {
  p.rect(0, 136, 320, 44, C[1]);
  p.poly([[0, 144], [90, 138], [200, 141], [320, 135], [320, 180], [0, 180]], C[2]);
  for (let row = 0; row < 5; row++) {
    const y = 139 + row * 8, step = 16 + row * 7;
    for (let x = -step + (row % 2) * step * 0.6; x < 320; x += step) {
      const px = x + rand(seed, row, x) * 5;
      const py = y + rand(seed + 2, row, x) * 3;
      const width = step * (0.65 + rand(seed + 4, row, x) * 0.2);
      if (forest && (x < 76 || x > 253) && rand(seed, row, x + 1) > 0.22) continue;
      const pts = [[px + 2, py], [px + width - 3, py - 1], [px + width, py + 3], [px + width - 4, py + 5], [px, py + 5], [px - 1, py + 2]];
      const S = C.map((c, i) => mix(c, STONE[i], forest ? 0.25 : 0.5));
      if (!forest) { S[0] = mix(S[0], S[2], 0.55); S[1] = mix(S[1], S[2], 0.3); }
      painted(p, pts, S, seed + x + row, -0.6);
      p.line(px + 3, py, px + width - 4, py - 1, S[3]);
      p.line(px + 1, py + 5, px + width - 4, py + 5, S[forest ? 0 : 1]);
    }
  }
  if (forest) for (let i = 0; i < 45; i++) {
    const x = 4 + rand(seed, i, 20) * 311, y = 146 + rand(seed, i, 21) * 31;
    if (x > 80 && x < 248 && i % 4) continue;
    sprig(p, x, y, 0.8 + rand(seed, i, 22) * 0.8, C, seed + i);
  }
}

export function lantern(p, x, y, ph, s = 1) {
  p.line(x, y - 7 * s, x, y - 3 * s, GOLD[2]);
  p.poly([[x - 4 * s, y], [x, y - 4 * s], [x + 4 * s, y], [x + 3 * s, y + 8 * s], [x, y + 11 * s], [x - 3 * s, y + 8 * s]], GOLD[1]);
  p.poly([[x - 2 * s, y + s], [x + 2 * s, y + s], [x + 1.5 * s, y + 7 * s], [x, y + 9 * s], [x - 2 * s, y + 7 * s]], FIRE[3]);
  p.line(x, y + s, x, y + 7 * s, FIRE[4]);
  p.line(x - 4 * s, y, x + 4 * s, y, GOLD[4]); p.px(x, y + 11 * s, GOLD[4]);
  p.glow(x, y + 4 * s, 16 * s, FIRE[2], 0.15 + Math.sin(ph * 4) * 0.02);
}

export function flame(p, x, y, ph, s = 1) {
  for (let i = 0; i < 4; i++) {
    const sway = Math.sin(ph * (4 + i % 2) + i * 1.8), h = (12 + i % 3 * 3 + sway * 2) * s, bx = x + (i - 1.5) * 2 * s;
    p.poly(contour([[bx - 3 * s, y], [bx - 4 * s, y - h * 0.35], [bx + sway * s, y - h * 0.8], [bx + 2 * s, y - h], [bx + 3 * s, y - h * 0.3], [bx + 2 * s, y]]), FIRE[1 + i % 2]);
    p.poly([[bx - s, y], [bx + sway * s, y - h * 0.65], [bx + 2 * s, y]], FIRE[3]);
  }
  p.ellipse(x, y - 1, 3 * s, 2 * s, FIRE[4]);
  p.glow(x, y - 6 * s, 22 * s, FIRE[2], 0.27 + 0.03 * Math.sin(ph * 5));
}

export function smoke(p, x, y, u, seed, { count = 6, rise = 36, spread = 5 } = {}) {
  for (let i = 0; i < count; i++) {
    const q = (u * 3 + i / count) % 1, a = Math.sin(q * Math.PI) * 0.12;
    p.disc(x + Math.sin(q * 5 + i) * spread * q + q * 7, y - q * rise, 1.7 + q * 5, mix(STONE[3], WOOD[3], rand(seed, i, 1) * 0.3), a);
  }
}

export function crystal(p, x, y, w, h, C = ARCANE) {
  p.poly([[x, y - h], [x + w, y - h * 0.4], [x + w * 0.6, y], [x - w * 0.6, y], [x - w, y - h * 0.4]], C[1]);
  p.poly([[x, y - h], [x + w * 0.25, y - h * 0.4], [x, y], [x - w * 0.6, y], [x - w, y - h * 0.4]], C[3]);
  p.poly([[x, y - h], [x - w * 0.25, y - h * 0.35], [x - w, y - h * 0.4]], C[4]);
  p.line(x, y - h + 1, x - w * 0.25, y - h * 0.45, C[5]);
}

export function orbit(p, x, y, rx, ry, ph, C = ARCANE) {
  for (let i = 0; i < 32; i++) {
    const a = i / 32 * TAU;
    p.dot(x + Math.cos(a) * rx, y + Math.sin(a) * ry, C[i % 4 ? 2 : 4], 0.65);
  }
  for (let i = 0; i < 3; i++) {
    const a = ph * 2 + i / 3 * TAU;
    p.px(x + Math.cos(a) * rx, y + Math.sin(a) * ry, C[5]);
  }
}
