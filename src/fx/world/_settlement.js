// Small settlement materials, baked architecture and periodic hearth ambience.
import { hex, mix, rand } from "../../core/index.js";

export const WOOD = ["#211b24", "#392a2c", "#614137", "#8a5d43", "#ba8859", "#e0b777"].map(hex);
export const STONE = ["#202630", "#343c45", "#56616a", "#7c898c", "#acb8ad", "#e4debb"].map(hex);
export const FIRE = ["#79352c", "#c45532", "#ed843e", "#ffc866", "#fff1b3"].map(hex);

export function boards(p, x, y, w, h, C = WOOD) {
  p.rect(x, y, w, h, C[1]);
  for (let bx = x + 1; bx < x + w - 1; bx += 6) {
    const bw = Math.min(5, x + w - 1 - bx);
    p.rect(bx, y + 1, bw, h - 2, C[2]);
    p.rect(bx, y + 2, 1, h - 4, C[3]);
    p.line(bx + 2, y + h * 0.38, bx + 2, y + h * 0.7, C[1]);
  }
  p.rect(x, y, w, 1, C[4]);
}

export function roof(p, x, y, w, h, C) {
  p.poly([[x - 4, y + h], [x + w * 0.45, y - 2], [x + w * 0.58, y - 2], [x + w + 5, y + h]], C[0]);
  for (let row = 0; row < h; row += 4) {
    const left = x + w * 0.49 * (1 - row / h), right = x + w * 0.55 + w * 0.45 * row / h;
    p.rect(left, y + row, right - left, Math.min(4, h - row), C[2]);
    p.line(left, y + row, right, y + row, C[3]);
    for (let tx = left + 3 + row % 8; tx < right - 2; tx += 9) p.line(tx, y + row + 1, tx - 1, y + row + 3, C[1]);
  }
  p.line(x - 3, y + h, x + w + 4, y + h, C[0]);
  p.line(x - 3, y + h + 1, x + w + 4, y + h + 1, C[3]);
}

export function window(p, x, y, w = 12, h = 17) {
  p.rect(x - 2, y - 2, w + 4, h + 4, WOOD[0]);
  p.rect(x, y, w, h, FIRE[2]);
  p.rect(x + 1, y + 1, w - 2, h - 3, FIRE[3]);
  p.rect(x + 1, y + 1, w - 2, 3, FIRE[4]);
  p.rect(x + Math.floor(w / 2), y, 1, h, WOOD[2]);
  p.rect(x, y + Math.floor(h / 2), w, 1, WOOD[2]);
  p.rect(x - 3, y + h, w + 6, 2, WOOD[4]);
}

export function lantern(p, x, y, ph) {
  p.line(x, y - 4, x, y - 1, WOOD[1]);
  p.rect(x - 3, y - 1, 7, 2, WOOD[0]);
  p.rect(x - 2, y + 1, 5, 6, FIRE[2]);
  p.rect(x - 1, y + 1, 3, 5, FIRE[4]);
  p.rect(x - 3, y + 7, 7, 1, WOOD[0]);
  p.glow(x, y + 3, 17, FIRE[2], 0.15 + Math.sin(ph * 4) * 0.025);
}

export function flame(p, x, y, ph, s = 1) {
  for (let i = 0; i < 5; i++) {
    const sway = Math.sin(ph * (4 + i % 2) + i * 1.8), h = (8 + i % 3 * 3 + sway * 2) * s;
    const bx = x + (i - 2) * 2 * s;
    p.poly([[bx - 3 * s, y], [bx - 2 * s, y - h * 0.5], [bx + sway * 2 * s, y - h],
      [bx + 2 * s, y - h * 0.4], [bx + 3 * s, y]], FIRE[1 + i % 2]);
    p.poly([[bx - s, y], [bx + sway * s, y - h * 0.65], [bx + 2 * s, y]], FIRE[3]);
  }
  p.ellipse(x, y - 1, 3 * s, 2 * s, FIRE[4]);
  p.glow(x, y - 6 * s, 23 * s, FIRE[2], 0.3 + 0.035 * Math.sin(ph * 5));
  p.glow(x, y - 2 * s, 7 * s, FIRE[3], 0.25);
}

export function smoke(p, x, y, u, seed, { count = 7, rise = 45, spread = 5 } = {}) {
  // All travel counts are integers per loop; puffs fade out before their position wraps.
  for (let i = 0; i < count; i++) {
    const q = (u * 3 + i / count) % 1, a = Math.sin(q * Math.PI) * 0.12;
    const dx = Math.sin(q * 4 + i * 1.7) * spread * q;
    p.disc(x + dx + q * 7, y - q * rise, 1.5 + q * 4, mix(STONE[2], WOOD[3], rand(seed, i, 1) * 0.3), a);
  }
}

export function street(p, C, seed, { grass = false } = {}) {
  p.rect(0, 150, 320, 30, C[0]);
  p.rect(0, 150, 320, 1, C[4]);
  p.rect(0, 151, 320, 2, C[2]);
  for (let row = 0; !grass && row < 4; row++) {
    for (let x = -16 + row % 2 * 13; x < 320; x += 26) {
      p.rect(x + 1, 154 + row * 6, 24, 5, row < 2 ? C[1] : C[0]);
      p.line(x + 2, 154 + row * 6, x + 22, 154 + row * 6, C[2]);
      if (rand(seed, row, x) > 0.65) p.line(x + 7, 156 + row * 6, x + 10, 157 + row * 6, C[0]);
    }
  }
  if (grass) {
    p.rect(0, 153, 320, 27, mix(WOOD[1], C[0], 0.5));
    for (let i = 0; i < 50; i++) {
      const x = rand(seed, i, 12) * 314, y = 156 + rand(seed, i, 13) * 21;
      const w = 2 + rand(seed, i, 14) * 5;
      p.line(x, y, x + w, y, mix(C[1], WOOD[3], 0.45));
      if (i % 3 === 0) p.line(x, y + 1, x + w - 1, y + 1, C[0]);
    }
  }
  if (grass) for (let i = 0; i < 70; i++) {
    const x = 2 + rand(seed, i, 9) * 315, y = i < 40 ? 149 : 177;
    p.line(x, y, x - 1, y - 2 - rand(seed, i, 10) * 3, C[3]);
    if (i % 3 === 0) p.px(x + 1, y - 1, C[4]);
  }
}
