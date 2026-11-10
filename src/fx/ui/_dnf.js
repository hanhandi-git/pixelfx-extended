// Shared art for the arcade-dungeon HUD pack (not an effect: the file name starts with _). Flat blue-grey
// windows with a hairline frame, square skill slots with a clockwise cooldown, liquid orbs and stacked
// boss bars. Every helper draws in local pixels and reads at 1x; at a denser frame the half-pixel bevels appear.
import { hex, mix, clamp, TAU, createFrame, painterFor, WHITE, FONTS, glyphFor, isCjk } from "../../core/index.js";
import { tone, iconArt } from "./_ember.js";

export const DNF = {
  ink: hex("#05070b"), win: hex("#0c1018"), panel: hex("#121824"), well: hex("#080b11"),
  line: hex("#3a4658"), lineLo: hex("#232c3a"), lineHi: hex("#6b7a90"),
  bar0: hex("#1c2536"), bar1: hex("#141b28"),
  gold: hex("#c8a45a"), goldHi: hex("#ffe6a0"), goldLo: hex("#6e5628"),
  text: hex("#d7dbe2"), muted: hex("#7f8a9c"), blue: hex("#3d6fb4"), blueHi: hex("#8fc0ff"),
  red: hex("#e2463c"), green: hex("#7fd66a"),
};
export const RARITY = { common: "#ffffff", rare: "#68d5ed", epic: "#b36bff", unique: "#ff6bd5", legend: "#ffb400" };
export const ORB_HP = ["#1c0408", "#5a0c14", "#a3141c", "#dc3229", "#ff7a5c", "#ffd0b8"].map(hex);
export const ORB_MP = ["#040c20", "#0c2456", "#14469a", "#2a78d8", "#62b4f6", "#c6ecff"].map(hex);
/** Stacked bar layers, bottom of the stack first. */
export const LAYERS = ["#d8362e", "#e8842a", "#e6c82e", "#58b848", "#3a8ee0", "#8a56d8"].map(hex);

const HAN_ADV = 6.5;
const advance = (ch) => (isCjk(ch) ? HAN_ADV : (glyphFor(ch, "mini")?.w ?? FONTS.mini.space) + FONTS.mini.gap);
/** Width of a label() string in local pixels. */
export function labelWidth(p, str, opts = {}) {
  str = String(str);
  if ((p.density ?? 1) < 2 || (opts.font ?? "mini") !== "mini" || (opts.scale ?? 1) !== 1 || ![...str].some(isCjk)) return p.measure(str, opts)[0];
  let w = 0;
  for (const ch of str) w += advance(ch);
  return Math.max(0, w - 0.5);
}
/**
 * Pixel text for HUD copy. On a frame of density 2 or more, CJK is drawn from the 12 px table at half scale so
 * it stays legible beside the 3 x 5 Latin font; otherwise this is Painter.text. Same options as Painter.text.
 */
export function label(p, str, x, y, c, opts = {}) {
  str = String(str);
  if ((p.density ?? 1) < 2 || (opts.font ?? "mini") !== "mini" || (opts.scale ?? 1) !== 1 || ![...str].some(isCjk)) return p.text(str, x, y, c, opts);
  const w = labelWidth(p, str, opts), a = opts.a ?? 1, ol = opts.outline, han = FONTS.han12.glyphs;
  const left = Math.round(opts.align === "center" ? x - w / 2 : opts.align === "right" ? x - w : x), top = Math.round(y);
  const pass = (plot) => {
    let cx = left;
    for (const ch of str) {
      if (isCjk(ch)) {
        const g = han[ch];
        if (g) for (let r = 0; r < 12; r++) for (let q = 0; q < 12; q++) if (g.rows[r][q]) plot(cx + q * 0.5, top - 0.5 + r * 0.5, 0.5);
      } else {
        const g = glyphFor(ch, "mini");
        if (g) for (let r = 0; r < g.rows.length; r++) for (let q = 0; q < g.w; q++) if (g.rows[r][q]) plot(cx + q, top + r, 1);
      }
      cx += advance(ch);
    }
  };
  if (ol !== undefined) pass((px, py, k) => p.rect(px - 1, py - 1, k + 2, k + 2, ol, a));
  pass((px, py, k) => p.rect(px, py, k, k, c, a));
}

const TITLE_FILL = ["#fff6c8", "#ffe6a0", "#f2c868", "#c8a45a", "#a07a38"].map(hex);
/** Width of a title() string in local pixels. */
export function titleWidth(str) {
  let w = 0;
  for (const ch of String(str)) w += isCjk(ch) ? 13 : ((glyphFor(ch, "big")?.w ?? FONTS.big.space) + FONTS.big.gap) * 2;
  return Math.max(0, w - 1);
}
/**
 * A large gold headline, 14 px tall: stage names, results and banners. CJK comes from the 12 px table, Latin
 * from the big font doubled; a stepped gradient runs down the letters over a dark outline and drop shadow.
 * opts: { align, a, fill (five colors, top to bottom) }.
 */
export function title(p, str, x, y, opts = {}) {
  str = String(str);
  const w = titleWidth(str), a = opts.a ?? 1, F = opts.fill ?? TITLE_FILL;
  const left = Math.round(opts.align === "center" ? x - w / 2 : opts.align === "right" ? x - w : x), top = Math.round(y);
  const pass = (plot) => {
    let cx = left;
    for (const ch of str) {
      if (isCjk(ch)) {
        const g = FONTS.han12.glyphs[ch];
        if (g) for (let r = 0; r < 12; r++) for (let q = 0; q < 12; q++) if (g.rows[r][q]) plot(cx + q, top + 1 + r, 1, (r + 1) / 14);
        cx += 13;
      } else {
        const g = glyphFor(ch, "big");
        if (g) for (let r = 0; r < g.rows.length; r++) for (let q = 0; q < g.w; q++) if (g.rows[r][q]) plot(cx + q * 2, top + r * 2, 2, (r * 2 + 1) / 14);
        cx += ((g?.w ?? FONTS.big.space) + FONTS.big.gap) * 2;
      }
    }
  };
  pass((px, py, k) => p.rect(px - 1, py - 1, k + 2, k + 3, DNF.ink, a));
  pass((px, py, k, v) => {
    if (k === 1) p.rect(px, py, 1, 1, F[Math.min(F.length - 1, Math.floor(v * F.length))], a);
    else for (let i = 0; i < 2; i++) p.rect(px, py + i, 2, 1, F[Math.min(F.length - 1, Math.floor((v + i / 14) * F.length))], a);
  });
}

/** A truly translucent rectangle (not dithered): window bodies and screen dims. */
export function veil(p, x, y, w, h, c, a) {
  if (a >= 0.995) return p.rect(x, y, w, h, c);
  p.each(x, y, x + w, y + h, (lx, ly, sx, sy) => {
    if (lx >= x && ly >= y && lx < x + w && ly < y + h) p.blendPx(sx, sy, c, a);
  });
}

/**
 * A window: ink outline, hairline frame, translucent body and an optional title bar with a centered title.
 * opts: { title, a (body alpha), bar (title bar height), close (draw an x), accent (title color) }.
 * Returns the content box { x, y, w, h } under the title bar.
 */
export function windowFrame(p, x, y, w, h, opts = {}) {
  const a = opts.a ?? 0.93, bar = opts.title !== undefined ? opts.bar ?? 11 : 0;
  p.rect(x, y, w, 1, DNF.ink); p.rect(x, y + h - 1, w, 1, DNF.ink);
  p.rect(x, y, 1, h, DNF.ink); p.rect(x + w - 1, y, 1, h, DNF.ink);
  veil(p, x + 1, y + 1, w - 2, h - 2, DNF.win, a);
  p.rect(x + 1, y + 1, w - 2, 1, DNF.line); p.rect(x + 1, y + h - 2, w - 2, 1, DNF.lineLo);
  p.rect(x + 1, y + 1, 1, h - 2, DNF.line); p.rect(x + w - 2, y + 1, 1, h - 2, DNF.lineLo);
  p.rect(x + 2, y + 1, w - 4, 0.5, DNF.lineHi);
  if (bar) {
    p.rect(x + 2, y + 2, w - 4, bar - 2, DNF.bar1);
    p.rect(x + 2, y + 2, w - 4, Math.floor((bar - 2) / 2), DNF.bar0);
    p.rect(x + 2, y + bar, w - 4, 1, DNF.ink);
    p.rect(x + 2, y + bar + 1, w - 4, 0.5, DNF.lineLo);
    if (opts.title) label(p, opts.title, x + w / 2, y + 3 + Math.max(0, Math.floor((bar - 9) / 2)), opts.accent ?? DNF.goldHi, { align: "center", outline: DNF.ink });
    if (opts.close) {
      const cx = x + w - 9, cy = y + 3;
      p.line(cx, cy, cx + 4, cy + 4, DNF.muted); p.line(cx + 4, cy, cx, cy + 4, DNF.muted);
    }
    // gold ticks on both sides of the title bar
    p.rect(x + 4, y + Math.floor(bar / 2), 3, 1, DNF.gold); p.rect(x + w - (opts.close ? 16 : 7), y + Math.floor(bar / 2), 3, 1, DNF.gold);
  }
  return { x: x + 3, y: y + bar + 3, w: w - 6, h: h - bar - 6 };
}

/** A recessed square slot. opts: { selected, pressed, rarity, flash, deny }. */
export function slotFrame(p, x, y, s, opts = {}) {
  const edge = opts.deny ? DNF.red : opts.flash ? WHITE : opts.selected || opts.pressed ? DNF.goldHi
    : opts.rarity ? hex(RARITY[opts.rarity] ?? RARITY.common) : DNF.line;
  p.rect(x, y, s, s, DNF.ink);
  p.rect(x + 1, y + 1, s - 2, s - 2, edge);
  p.rect(x + 2, y + 2, s - 4, s - 4, DNF.well);
  // inner bevel: a shadow under the top-left lip, a faint light on the bottom-right
  p.rect(x + 2, y + 2, s - 4, 0.5, DNF.ink); p.rect(x + 2, y + 2, 0.5, s - 4, DNF.ink);
  p.rect(x + 2, y + s - 2.5, s - 4, 0.5, DNF.lineLo); p.rect(x + s - 2.5, y + 2, 0.5, s - 4, DNF.lineLo);
  if (!opts.deny && !opts.flash && !opts.selected && !opts.pressed && !opts.rarity) {
    p.rect(x + 1, y + 1, s - 2, 0.5, DNF.lineHi);
    p.rect(x + 1, y + s - 2, s - 2, 1, DNF.lineLo); p.rect(x + s - 2, y + 1, 1, s - 2, DNF.lineLo);
  }
}

/** Weapon-art icons that the Ember set lacks, drawn in the same 44 px square: rush, rise, cleave, guard, awaken. */
const ART_TONE = { rush: "quick", rise: "slash", guard: "pause", awaken: "meteor", cleave: "fire" };
function artIcon(p, name, C) {
  const P = (pts, c) => p.poly(pts, c), S = [hex("#46536a"), hex("#8391a5"), hex("#cbd1d6"), hex("#f5eddf")];
  if (name === "rush") {
    for (const [yy, x0, x1] of [[-13, -20, -4], [-8, -16, -9], [9, -20, -6], [14, -14, 0]]) p.rect(x0, yy, x1 - x0, 2, C[3]);
    P([[-8, -8], [8, -10], [22, 0], [8, 10], [-8, 8]], DNF.ink);
    P([[-6, -6], [8, -8], [19, 0], [-6, 0]], S[3]); P([[-6, 0], [19, 0], [8, 8], [-6, 6]], S[1]);
    p.rect(-4, -1, 20, 2, S[2]);
    P([[-12, -13], [-6, -13], [-6, 13], [-12, 13]], DNF.ink); P([[-11, -12], [-7, -12], [-7, 12], [-11, 12]], C[3]);
    P([[-21, -4], [-12, -4], [-12, 4], [-21, 4]], DNF.ink); p.rect(-20, -3, 8, 6, C[1]);
    p.glow(14, 0, 12, C[4], 0.3);
  } else if (name === "rise") {
    P([[-17, 19], [-13, -2], [-2, -15], [16, -21], [8, -11], [0, 0], [-4, 20]], DNF.ink);
    P([[-14, 16], [-11, -1], [-1, -13], [11, -18], [5, -10], [-2, 0], [-6, 17]], C[3]);
    P([[-12, 10], [-9, -1], [0, -11], [7, -15], [-4, -3], [-9, 12]], C[5]);
    P([[10, -4], [17, 6], [13, 6], [13, 18], [7, 18], [7, 6], [3, 6]], DNF.ink);
    P([[10, -1], [14, 5], [11, 5], [11, 16], [9, 16], [9, 5], [6, 5]], C[4]);
    p.glow(0, -6, 14, C[4], 0.25);
  } else if (name === "cleave") {
    p.arc(-8, 10, 28, (u) => 2 + Math.sin(u * Math.PI) * 12, -1.95, 0.35, DNF.ink);
    p.arc(-8, 10, 27, (u) => Math.sin(u * Math.PI) * 11, -1.9, 0.3, C[2]);
    p.arc(-8, 10, 27, (u) => Math.sin(u * Math.PI) * 7, -1.85, 0.25, C[4]);
    p.arc(-8, 10, 27, (u) => Math.sin(u * Math.PI) * 3, -1.75, 0.15, WHITE);
    P([[-19, 17], [-15, 13], [-4, 4], [-1, 7], [-12, 16], [-16, 20]], DNF.ink);
    p.line(-17, 17, -4, 6, C[3]);
    p.glow(6, -6, 14, C[4], 0.3);
  } else if (name === "guard") {
    P([[-15, -16], [0, -20], [15, -16], [15, 2], [0, 20], [-15, 2]], DNF.ink);
    P([[-13, -14], [0, -18], [13, -14], [13, 1], [0, 17], [-13, 1]], S[1]);
    P([[-11, -12], [0, -16], [0, 14], [-11, 0]], S[2]); P([[0, -16], [11, -12], [11, 0], [0, 14]], S[0]);
    P([[-2, -11], [2, -11], [2, -3], [8, -3], [8, 1], [2, 1], [2, 9], [-2, 9], [-2, 1], [-8, 1], [-8, -3], [-2, -3]], C[4]);
    p.line(-11, -12, 0, -16, S[3]); p.line(-1, -10, -1, 8, C[5]);
    p.glow(0, -2, 14, C[3], 0.22);
  } else {
    for (let i = 0; i < 3; i++) {
      const a0 = -Math.PI * 0.5 + i * (TAU / 3);
      p.arc(0, 0, 21, (u) => 1 + Math.sin(u * Math.PI) * 9, a0, a0 + 1.7, DNF.ink);
      p.arc(0, 0, 20, (u) => Math.sin(u * Math.PI) * 8, a0 + 0.05, a0 + 1.65, C[3]);
      p.arc(0, 0, 20, (u) => Math.sin(u * Math.PI) * 4, a0 + 0.1, a0 + 1.6, C[5]);
    }
    P([[0, -11], [3, -3], [11, 0], [3, 3], [0, 11], [-3, 3], [-11, 0], [-3, -3]], DNF.ink);
    P([[0, -9], [2, -2], [9, 0], [2, 2], [0, 9], [-2, 2], [-9, 0], [-2, -2]], C[4]);
    P([[0, -5], [1, -1], [5, 0], [1, 1], [0, 5], [-1, 1], [-5, 0], [-1, -1]], WHITE);
    p.glow(0, 0, 14, C[4], 0.35);
  }
}

const icons = new Map();
/** One of the Ember icon silhouettes, rasterized once per size and density, centered on (cx, cy). */
export function slotIcon(p, icon, cx, cy, size, opts = {}) {
  const density = p.density ?? 1;
  const key = `${icon}:${size}:${density}:${!!opts.disabled}:${opts.palette ? opts.palette.join() : ""}`;
  let img = icons.get(key);
  if (!img) {
    img = createFrame(size, size, 0, 0, density);
    const q = painterFor(img).place(size / 2, size / 2);
    q.scale = size / 44;
    if (ART_TONE[icon]) artIcon(q, icon, tone(ART_TONE[icon], opts.palette, opts.disabled));
    else iconArt(q, icon, 0, 0, tone(icon, opts.palette, opts.disabled), 0);
    q.reset();
    // icons carry their own small glow; fold it into color so one blit draws the whole icon
    for (let i = 0; i < img.color.length; i++) {
      const l = img.light[i];
      if (!img.color[i] || !(l & 0xffffff)) continue;
      const c = img.color[i], ch = (s) => Math.min(255, ((c >>> s) & 255) + ((l >>> s) & 255));
      img.color[i] = (255 << 24) | (ch(16) << 16) | (ch(8) << 8) | ch(0);
    }
    icons.set(key, img);
  }
  p.image(img.color, img.w, img.h, cx - size / 2, cy - size / 2, density);
}

/** A clockwise cooldown: the lit wedge grows from 12 o'clock as cd (1..0) runs out. */
export function cooldownVeil(p, x, y, s, cd, a = 0.7) {
  cd = clamp(cd);
  if (cd <= 0.001) return;
  const cx = x + s / 2, cy = y + s / 2;
  p.each(x, y, x + s, y + s, (lx, ly, sx, sy) => {
    if (lx < x || ly < y || lx >= x + s || ly >= y + s) return;
    const u = ((Math.atan2(ly - cy, lx - cx) + Math.PI / 2) / TAU + 1) % 1;
    if (u >= 1 - cd) p.blendPx(sx, sy, DNF.ink, a);
  });
  // the sweeping hand
  const an = -Math.PI / 2 + (1 - cd) * TAU, r = s * 0.5 - 0.5;
  p.line(cx, cy, cx + Math.cos(an) * r, cy + Math.sin(an) * r, DNF.lineHi, 0.9);
}

/**
 * A whole skill slot: frame, icon, key cap, glyph, cooldown and the no-mana, pressed, cast and denied states.
 * o: { icon, key, glyph, tint, cooldown (0..1), cdText, mana (false = cannot pay), pressed, selected, flash,
 * deny, disabled, rarity, palette }.
 */
export function skillSlot(p, x, y, s, o = {}) {
  const dead = !!o.disabled || o.mana === false;
  slotFrame(p, x, y, s, o);
  if (o.icon && o.icon !== "none") slotIcon(p, o.icon, x + s / 2, y + s / 2 + (o.pressed ? 0.5 : 0), s - 3, { disabled: dead, palette: o.palette });
  if (o.glyph) label(p, o.glyph, x + s - 2, y + s - 7, dead ? DNF.muted : o.tint ? hex(o.tint) : DNF.goldHi, { align: "right", outline: DNF.ink });
  const cd = clamp(o.cooldown ?? 0);
  if (cd > 0.001) {
    cooldownVeil(p, x + 2, y + 2, s - 4, cd);
    if (o.cdText) p.text(String(o.cdText), x + s / 2 + 0.5, y + s / 2 - 2, WHITE, { align: "center", outline: DNF.ink });
  } else if (o.mana === false) veil(p, x + 2, y + 2, s - 4, s - 4, hex("#182c58"), 0.45);
  if (o.key) p.text(o.key, x + 2, y + 2, cd > 0.001 || dead ? DNF.muted : DNF.goldHi, { outline: DNF.ink });
  if (o.flash) p.glow(x + s / 2, y + s / 2, s * 0.9, DNF.goldHi, 0.28);
}

/**
 * A glass orb holding a liquid: value 0..1 fills from the bottom with a slow travelling surface.
 * C is a six-step ramp, dark to bright.
 */
export function orb(p, cx, cy, r, value, C, t = 0, seed = 0) {
  value = clamp(value);
  const inner = r - 2, level = cy + inner - 2 * inner * value, ph = (t / 2.4) * TAU;
  p.circle(cx, cy, r, DNF.ink);
  p.circle(cx, cy, r - 1, (d, an) => (an < -0.4 && an > -2.8 ? DNF.lineHi : an > 0.5 && an < 2.4 ? DNF.lineLo : DNF.line));
  p.shade(cx - inner, cy - inner, cx + inner, cy + inner, (x, y) => {
    const dx = x - cx, dy = y - cy, d = Math.sqrt(dx * dx + dy * dy) / inner;
    if (d > 1) return;
    const surf = level + Math.sin(x * 0.7 + ph * 2 + seed) * 0.6 + Math.sin(x * 0.31 - ph + seed * 2) * 0.4;
    if (value <= 0 || y < surf) return d > 0.8 ? mix(DNF.well, C[0], 0.6) : DNF.well;
    const depth = y - surf;
    if (depth < 1) return C[5];
    if (depth < 2) return C[4];
    const k = d > 0.9 ? 1 : d > 0.72 ? 2 : 3;
    return dy > inner * 0.45 ? C[Math.max(1, k - 1)] : C[k];
  });
  // a glass highlight top-left and a small rim light bottom-right
  p.arc(cx, cy, inner - 1, 1.5, -2.5, -1.75, WHITE, 0.55);
  p.dot(cx - inner * 0.45, cy - inner * 0.5, WHITE, 0.9);
  p.arc(cx, cy, inner, 1, 0.5, 1.2, C[4], 0.45);
  if (value > 0.02) p.glow(cx, cy, r * 1.5, C[3], 0.1);
}

/**
 * A stacked bar: value 0..1 of the whole stack, split into `layers` full-width lines. The current line
 * drains over the colour of the line beneath it; trail (0..1 of the whole) leaves a pale chip that catches up.
 * Returns the number of lines left.
 */
export function layeredBar(p, x, y, w, h, value, layers = 1, opts = {}) {
  value = clamp(value); layers = Math.max(1, Math.round(layers));
  const total = value * layers, left = Math.max(value > 0 ? 1 : 0, Math.ceil(total - 1e-6));
  const frac = value <= 0 ? 0 : total - (left - 1);
  const col = opts.colors ?? LAYERS, cur = col[(left - 1 + col.length * 8) % col.length];
  const under = left > 1 ? col[(left - 2) % col.length] : null;
  p.rect(x - 1, y - 1, w + 2, h + 2, DNF.ink);
  p.rect(x, y, w, h, DNF.well);
  const fill = (x0, ww, c) => {
    if (ww <= 0) return;
    p.rect(x0, y, ww, h, c);
    p.rect(x0, y, ww, Math.max(0.5, Math.floor(h / 3)), mix(c, WHITE, 0.38));
    p.rect(x0, y + h - Math.max(0.5, Math.floor(h / 4)), ww, Math.max(0.5, Math.floor(h / 4)), mix(c, DNF.ink, 0.45));
  };
  if (under) fill(x, w, mix(under, DNF.ink, 0.35));
  const fw = Math.round(w * frac * 2) / 2;
  if (opts.trail !== undefined) {
    const tt = clamp(opts.trail) * layers - (left - 1), tw = Math.round(w * clamp(tt) * 2) / 2;
    if (tw > fw) p.rect(x + fw, y, tw - fw, h, hex("#fff2d0"));
  }
  fill(x, fw, cur);
  if (fw > 0 && fw < w) p.rect(x + fw - 1, y, 1, h, WHITE);
  const cells = opts.cells ?? 0;
  for (let i = 1; i < cells; i++) p.rect(x + Math.round((w * i) / cells), y, 0.5, h, DNF.ink);
  return left;
}

/** A flat button: opts { hot (highlighted), dim }. */
export function button(p, x, y, w, h, text, opts = {}) {
  const edge = opts.hot ? DNF.goldHi : DNF.line;
  p.rect(x, y, w, h, DNF.ink);
  p.rect(x + 1, y + 1, w - 2, h - 2, edge);
  p.rect(x + 2, y + 2, w - 4, h - 4, opts.hot ? hex("#2a3550") : DNF.bar1);
  p.rect(x + 2, y + 2, w - 4, Math.floor((h - 4) / 2), opts.hot ? hex("#34446a") : DNF.bar0);
  if (text) label(p, text, x + w / 2, y + Math.floor((h - 5) / 2), opts.dim ? DNF.muted : opts.hot ? DNF.goldHi : DNF.text, { align: "center", outline: DNF.ink });
}
