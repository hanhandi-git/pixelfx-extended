// Shared art for the Ember UI pack. Solid, hand-placed shapes stay in color;
// only the little spell cores and travelling rim glints write additive light.
import { fit, hex, TAU, createFrame, painterFor } from "../../core/index.js";

export const INK = hex("#080b12"), BODY = hex("#141c29"), TOP = hex("#243044");
export const SILVER = ["#242c3c", "#46536a", "#8391a5", "#cbd1d6", "#f5eddf"].map(hex);
export const GOLD = ["#332119", "#704b2c", "#ae7a42", "#d9ad65", "#ffdf99"].map(hex);
export const TONES = {
  attack: ["#291b20", "#743931", "#ba6444", "#edac69", "#ffe2af", "#fff5e5"],
  quick: ["#112c30", "#22565d", "#308e8f", "#62cbbc", "#b3f4da", "#effff0"],
  dodge: ["#241d39", "#4e3767", "#79519c", "#b68bda", "#e7caf6", "#fff1ff"],
  bag: ["#2c201d", "#65432d", "#99683f", "#d49b58", "#f4cf87", "#fff1d0"],
  pause: ["#1a2738", "#384d65", "#69869e", "#9cb7c7", "#d9e9e8", "#fff7e9"],
  resume: ["#172d2c", "#31574c", "#548f6b", "#8bcca0", "#c9f1ce", "#f4fff0"],
  slash: ["#2e2223", "#714236", "#ad6943", "#e7a963", "#ffdc99", "#fff4d9"],
  fire: ["#321b24", "#803132", "#c25132", "#f28e3b", "#ffd378", "#fff3c4"],
  frost: ["#152b40", "#275071", "#428db1", "#78c9dd", "#c0eef1", "#f0fffa"],
  bolt: ["#2a203d", "#564076", "#8160aa", "#bb93e4", "#e9ceff", "#fff1ff"],
  mend: ["#1a2d24", "#315c3e", "#4e915c", "#82c87a", "#c6eea3", "#f3ffd9"],
  meteor: ["#322028", "#7d3239", "#be503b", "#ec9148", "#ffd779", "#fff2c1"],
  burst: ["#2e1c37", "#603669", "#a35b9c", "#d78dc7", "#f4c8eb", "#fff0ff"],
};
export function tone(icon, palette, disabled = false) {
  return fit(disabled ? ["#1a202b", "#30394b", "#455166", "#647186", "#8c98a8", "#aeb7c3"] : palette ?? TONES[icon] ?? TONES.slash, 6);
}

/** Chamfered frame, bright on top-left and shaded below, with no flashing over its contents. */
const plates = new Map();
export function cutPlate(p, x, y, w, h, C, selected = false) {
  const key = `${w}:${h}:${C[2]}:${!!selected}`;
  let image = plates.get(key);
  if (!image) {
    const frame = createFrame(w, h);
    paintPlate(painterFor(frame), 0, 0, w, h, C, selected);
    image = frame.color;
    plates.set(key, image);
  }
  blitArt(p, image, w, h, x, y);
}
export function blitArt(p, image, w, h, x, y) {
  // Painter.image's fast path takes frame coordinates; its transformed path takes local ones.
  if (p.sn === 0 && p.fx === 1 && p.fade === 1) p.image(image, w, h, x + p.tx, y + p.ty);
  else for (let yy = 0; yy < h; yy++) for (let xx = 0; xx < w; xx++) {
    const c = image[yy * w + xx];
    if (c) p.dot(x + xx, y + yy, c);
  }
}
function paintPlate(p, x, y, w, h, C, selected) {
  const shape = (inset, cut, c) => p.poly([
    [x + inset + cut, y + inset], [x + w - inset, y + inset],
    [x + w - inset, y + h - inset - cut], [x + w - inset - cut, y + h - inset],
    [x + inset, y + h - inset], [x + inset, y + inset + cut],
  ], c);
  shape(0, 7, INK); shape(1, 6, selected ? GOLD[3] : SILVER[2]);
  shape(2, 6, SILVER[0]); shape(3, 6, TOP); shape(5, 5, BODY);
  p.line(x + 9, y + 2, x + w - 4, y + 2, selected ? GOLD[4] : SILVER[4]);
  p.line(x + 3, y + 10, x + 3, y + h - 5, SILVER[2]);
  p.line(x + 9, y + h - 4, x + w - 10, y + h - 4, INK);
  p.line(x + w - 4, y + 5, x + w - 4, y + h - 10, INK);
  for (const [cx, cy] of [[x + w - 5, y + 5], [x + 5, y + h - 5]]) {
    p.rect(cx - 2, cy - 2, 4, 4, INK); p.rect(cx - 1, cy - 1, 2, 2, selected ? GOLD[3] : SILVER[2]);
  }
  p.line(x + 13, y + h - 8, x + 24, y + h - 8, C[2]);
}

/** Continuous rim light; the period is shared by every member of the pack. */
export function rimGlint(p, t, radius, C, cy = 0) {
  const angle = t / 2.4 * TAU - Math.PI * 0.7;
  p.arc(0, cy, radius, 1, angle, angle + 0.2, C[4]);
  p.glow(Math.cos(angle + 0.1) * (radius - 0.5), cy + Math.sin(angle + 0.1) * (radius - 0.5), 4, C[3], 0.16);
}

/** Hand-painted icon silhouettes in a 42px square; no font glyphs or vector assets. */
export function iconArt(p, name, x, y, C, t = 0) {
  const P = (pts, c) => p.poly(pts.map(([px, py]) => [x + px, y + py]), c);
  const L = (x0, y0, x1, y1, c) => p.line(x + x0, y + y0, x + x1, y + y1, c);
  const R = (xx, yy, w, h, c) => p.rect(x + xx, y + yy, w, h, c);
  const D = (xx, yy, r, c) => p.circle(x + xx, y + yy, r, c);
  const S = SILVER, G = GOLD;
  if (name === "blade") name = "attack";
  if (name === "attack" || name === "slash") {
    p.arc(x - 2, y - 1, 20, (u) => Math.sin(u * Math.PI) * 3, -2.4, 0.55, C[2]);
    P([[-15, 12], [-8, 4], [9, -16], [18, -19], [16, -10], [-3, 9], [-11, 16]], INK);
    P([[-7, 5], [10, -15], [16, -17], [13, -10], [-3, 8]], S[2]);
    P([[-7, 5], [10, -15], [16, -17], [0, 4]], S[4]);
    L(-4, 5, 13, -14, S[3]);
    P([[-14, 3], [-11, 1], [1, 11], [-1, 14]], INK);
    L(-12, 3, -1, 12, G[3]); L(-12, 4, -2, 13, G[1]);
    P([[-9, 8], [-5, 11], [-12, 19], [-16, 16]], C[1]);
    L(-12, 11, -8, 14, C[3]); L(-14, 14, -10, 17, C[3]); D(-14, 18, 2, G[3]);
  } else if (name === "quick") {
    for (const [yy, len] of [[-13, 11], [-8, 8], [2, 10]]) L(-20, yy, -20 + len, yy, C[2]);
    P([[-10, -17], [7, -17], [4, -4], [13, 3], [18, 4], [18, 13], [12, 17], [-11, 15], [-14, 9], [-9, 1]], INK);
    P([[-8, -15], [5, -15], [2, -3], [10, 5], [16, 6], [16, 12], [10, 14], [-9, 13], [-11, 8], [-7, 0]], C[1]);
    P([[-7, -14], [3, -14], [0, -2], [8, 6], [14, 7], [14, 10], [2, 10], [-7, 7], [-5, -1]], C[3]);
    R(-7, -13, 11, 3, G[2]); R(-4, -12, 3, 2, G[4]);
    P([[-8, 1], [-16, -4], [-13, 5], [-7, 8], [0, 7]], C[4]);
    L(-9, 11, 14, 12, C[4]); L(-8, 16, 10, 17, S[2]);
  } else if (name === "dodge") {
    for (const [dx, c] of [[-9, C[0]], [-5, C[1]], [0, INK]]) {
      P([[dx - 4, -13], [dx + 1, -18], [dx + 9, -12], [dx + 12, -3], [dx + 6, 1], [dx + 13, 13], [dx + 3, 16], [dx - 9, 11], [dx - 4, 3], [dx - 8, -4]], c);
    }
    P([[-3, -12], [1, -15], [7, -11], [9, -4], [4, -1], [-5, -3]], C[3]);
    P([[-1, -10], [5, -10], [7, -5], [1, -3], [-3, -5]], INK);
    L(1, -7, 5, -7, C[5]);
    P([[-3, 2], [4, 2], [9, 12], [1, 13], [-6, 9]], C[2]);
    L(-4, 4, 2, 9, C[4]); L(-19, 0, -13, 0, C[3]); L(-18, 6, -12, 6, C[2]);
    p.arc(x, y + 1, 20, (u) => 1 + 2 * u, 0.3, 2.5, C[3]);
  } else if (name === "bag") {
    P([[-8, -11], [-7, -18], [7, -18], [9, -10], [5, -9], [4, -14], [-4, -14], [-4, -9]], INK);
    L(-6, -16, 5, -16, G[3]);
    P([[-15, -10], [-11, -13], [13, -11], [17, -6], [15, 17], [-12, 18], [-16, 12]], INK);
    P([[-12, -8], [12, -8], [14, -4], [12, 14], [-10, 15], [-13, 11]], C[2]);
    P([[-12, -8], [12, -8], [11, 1], [1, 6], [-11, 0]], C[3]);
    L(-11, -7, 11, -7, C[4]); L(-10, 12, 10, 12, C[1]);
    R(-1, -5, 4, 15, C[1]); R(-2, 0, 6, 6, G[4]); R(0, 2, 2, 2, INK);
    L(-11, 5, -10, 11, C[4]); L(11, 5, 10, 11, C[1]);
  } else if (name === "pause") {
    for (const dx of [-12, 4]) {
      R(dx - 1, -16, 10, 32, INK); R(dx, -15, 8, 30, S[1]); R(dx, -15, 5, 28, S[3]);
      R(dx, -15, 7, 2, S[4]); R(dx, 11, 8, 3, G[2]);
    }
  } else if (name === "resume") {
    P([[-10, -18], [19, 0], [-10, 18]], INK);
    P([[-8, -14], [15, 0], [-8, 14]], C[2]); P([[-8, -14], [15, 0], [-3, 3]], C[4]);
    L(-7, -12, -7, 11, C[5]);
  } else if (name === "fire") {
    P([[-2, -20], [5, -13], [3, -5], [10, -11], [16, 1], [15, 11], [7, 18], [-6, 18], [-15, 10], [-17, 2], [-11, -10], [-9, -2], [-4, -7]], C[1]);
    P([[-1, -16], [2, -10], [0, 0], [8, -6], [12, 3], [11, 11], [5, 16], [-5, 15], [-12, 9], [-12, 2], [-8, -4], [-8, 3], [-2, -2]], C[3]);
    P([[0, -3], [4, 2], [4, 6], [8, 7], [5, 14], [-2, 15], [-7, 10], [-6, 4], [-3, 7]], C[4]);
    P([[0, 5], [3, 10], [1, 14], [-3, 13], [-3, 10]], C[5]);
    for (let i = 0; i < 3; i++) {
      const u = ((t / 2.4 * 2 + i / 3) % 1 + 1) % 1;
      p.dot(x - 13 + i * 13, y - 7 - u * 11, C[4], Math.sin(u * Math.PI));
    }
  } else if (name === "frost") {
    for (let i = 0; i < 6; i++) {
      const an = i * TAU / 6 - Math.PI / 2, co = Math.cos(an), si = Math.sin(an);
      const v = (a, b) => [co * a - si * b, si * a + co * b];
      P([v(1, -2), v(19, -1), v(20, 0), v(15, 2), v(12, 7), v(10, 7), v(12, 2), v(2, 2)], C[2]);
      const [ex, ey] = v(18, 0); L(0, 0, ex, ey, C[4]);
    }
    P([[0, -8], [7, -3], [7, 4], [0, 9], [-7, 4], [-7, -3]], C[3]);
    P([[0, -7], [6, -2], [0, 3], [-6, -2]], C[5]); L(0, 3, 0, 7, C[4]);
  } else if (name === "bolt") {
    P([[3, -21], [-15, 3], [-5, 4], [-10, 21], [16, -7], [5, -7], [11, -21]], INK);
    P([[4, -18], [-11, 1], [-2, 2], [-6, 16], [12, -5], [2, -5], [7, -18]], C[3]);
    P([[4, -18], [-11, 1], [-3, 0], [2, -9]], C[5]);
    P([[-2, 2], [-6, 16], [10, -4], [5, -3]], C[4]);
    L(-16, -11, -20, -6, C[2]); L(15, 8, 19, 3, C[4]);
  } else if (name === "mend") {
    P([[-5, -17], [6, -17], [6, -6], [17, -6], [17, 5], [6, 5], [6, 17], [-5, 17], [-5, 5], [-17, 5], [-17, -6], [-5, -6]], INK);
    P([[-3, -15], [4, -15], [4, -4], [15, -4], [15, 3], [4, 3], [4, 15], [-3, 15], [-3, 3], [-15, 3], [-15, -4], [-3, -4]], C[3]);
    L(-3, -15, 3, -15, C[5]); L(-14, -4, -4, -4, C[5]); L(-3, -14, -3, -3, C[4]);
    P([[-20, 8], [-11, 9], [-6, 17], [-15, 16]], C[2]);
    P([[20, 7], [12, 8], [7, 17], [16, 15]], C[4]);
  } else if (name === "meteor") {
    P([[-15, 5], [2, -11], [18, -18], [13, -6], [19, -10], [12, 6], [2, 16]], C[1]);
    P([[-12, 5], [8, -13], [5, -3], [16, -11], [7, 7], [-2, 13]], C[3]);
    L(-4, 4, 14, -14, C[4]); L(0, 6, 10, -4, C[5]);
    D(-5, 8, 11, INK); D(-5, 8, 9, C[2]); D(-7, 5, 6, C[4]);
    P([[-12, 6], [-7, 0], [-1, 2], [-3, 7], [-9, 10]], C[5]); L(-7, 10, -2, 14, C[1]);
  } else if (name === "burst" || name === "orb") {
    for (const [dx, dy] of [[-1, -19], [17, -9], [18, 12], [-9, 18], [-19, -8]]) {
      P([[dx, dy], [dx * 0.35 - 2, dy * 0.35], [dx * 0.35, dy * 0.35 + 3]], C[2]);
    }
    P([[0, -13], [10, -7], [13, 5], [1, 15], [-11, 7], [-12, -6]], INK);
    P([[0, -11], [8, -6], [10, 4], [1, 12], [-8, 6], [-9, -5]], C[3]);
    P([[0, -11], [8, -6], [1, 2], [-9, -5]], C[5]);
    P([[1, 2], [10, 4], [1, 12]], C[2]); L(1, 2, 1, 10, C[4]);
  } else if (name === "staff") {
    P([[-13, 20], [-17, 17], [3, -11], [7, -9]], INK);
    L(-14, 18, 5, -10, G[2]); L(-12, 18, 6, -9, G[4]);
    D(7, -11, 9, INK); D(7, -11, 7, G[2]); D(7, -11, 5, C[3]); D(5, -13, 3, C[5]);
    P([[-1, -17], [0, -11], [-3, -7], [-6, -14]], G[3]); P([[15, -17], [14, -10], [10, -2], [18, -8]], G[3]);
    L(-9, 9, -5, 12, C[4]);
  } else if (name === "bow") {
    p.arc(x - 7, y, 19, 4, -1.5, 1.5, INK); p.arc(x - 7, y, 17, 2, -1.4, 1.4, G[3]);
    L(-4, -17, -10, 0, S[3]); L(-10, 0, -4, 17, S[3]);
    L(-20, 0, 19, 0, G[3]); P([[13, -5], [21, 0], [13, 5], [15, 0]], S[4]);
    L(-15, -3, -11, 0, C[3]); L(-15, 3, -11, 0, C[3]);
  }
}
