// Shared palette and hard-edged motifs for the DNF-inspired set.
// The reference is used for pixel language only; these shapes and names are original.
import { fit, TAU } from "../../core/index.js";

export const DNF = ["#0a0912", "#211226", "#4a1b3d", "#852642", "#c74145", "#ef744b", "#ffc46e", "#fff1c2"];
export const CYAN = ["#07141e", "#12354b", "#1e6680", "#369fb0", "#7ed9d1", "#c4fff0", "#effff8"];

export function seal(p, C, r, pulse = 1, phase = 0, a = 1) {
  const R = fit(C, 8), inner = r * 0.72;
  p.ellipse(0, 0, r, r * 0.18, R[1], 0.78 * a);
  p.ellipse(0, 0, r, r * 0.18, R[3], 0.52 * pulse * a);
  p.ellipse(0, 0, inner, inner * 0.18, R[5], 0.42 * pulse * a);
  for (let i = 0; i < 12; i++) {
    const g = i / 12 * TAU + phase, x = Math.cos(g) * r, y = Math.sin(g) * r * 0.18;
    p.dot(x, y, i % 3 ? R[4] : R[6], (0.42 + 0.35 * pulse) * a);
  }
  p.glow(0, -2, r * 1.2, R[4], 0.14 * pulse * a);
}

export function rune(p, x, y, s, C, a = 1) {
  const R = fit(C, 8);
  p.line(x - s, y, x + s, y, R[5], a * 0.65);
  p.line(x, y - s, x, y + s, R[5], a * 0.65);
  p.line(x - s * 0.7, y - s * 0.7, x + s * 0.7, y + s * 0.7, R[3], a * 0.55);
  p.line(x + s * 0.7, y - s * 0.7, x - s * 0.7, y + s * 0.7, R[3], a * 0.55);
  p.dot(x, y, R[7], a * 0.85);
}
