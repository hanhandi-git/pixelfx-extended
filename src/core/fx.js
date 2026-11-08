// Frames and live effect instances.

import { Painter } from "./painter.js";
import { clamp } from "./math.js";
import { stockActor } from "./actor.js";
import { fit, toHex } from "./color.js";

/**
 * A frame: w x h pixels whose top-left sits at (ox, oy) in world space. `color` holds opaque pixels,
 * `light` additive glow; composite() puts them together. density multiplies the output dimensions
 * while ox/oy, effect anchors and geometry remain in world units. Existing calls default to 1.
 */
export function createFrame(w, h, ox = 0, oy = 0, density = 1) {
  if (!Number.isInteger(density) || density < 1 || density > 4) throw new RangeError("Frame density must be an integer from 1 to 4");
  const width = w * density, height = h * density;
  return { w: width, h: height, ox, oy, density, color: new Uint32Array(width * height), light: new Uint32Array(width * height) };
}
export function clearFrame(f) {
  f.color.fill(0);
  f.light.fill(0);
  return f;
}

const painters = new WeakMap();
/** The painter for a frame (one per frame, reused). */
export function painterFor(frame) {
  let p = painters.get(frame);
  if (!p) painters.set(frame, (p = new Painter(frame)));
  return p.reset();
}

const FADE = 0.3;

const isRamp = (v) => Array.isArray(v) && v.length > 0 && v.every((c) => typeof c === "number" || /^#[0-9a-f]{3,8}$/i.test(c));

/**
 * An effect's options: its defaults with the caller's on top. Any color ramp (palette, or another ramp option
 * like dust or smoke) of a different length than its default is resampled to the default's length, so effects
 * can index steps by number whatever a caller passes.
 */
export function resolveOptions(meta, o = {}) {
  const opts = { ...(meta.options ?? {}), ...o };
  for (const [k, def] of Object.entries(meta.options ?? {}))
    if (isRamp(def) && isRamp(o[k]) && o[k].length !== def.length) opts[k] = fit(o[k], def.length).map(toHex);
  if (meta.actor && !opts.actor) opts.actor = stockActor(meta.actor === 2 ? 2 : 1, opts.character);
  return opts;
}

/**
 * A live instance of an effect module: { update(dt), draw(frame, layer), stop(), done() }.
 * o: { x, y, flip, angle, seed, palette, light (glow strength), actor, ...the effect's own options }.
 * draw(frame, "back") draws what goes behind a character, "front" what goes in front, nothing both.
 */
export function createFx(mod, o = {}) {
  const meta = mod.meta ?? {};
  const opts = resolveOptions(meta, o);
  const impl = mod.create ? mod.create(opts) : mod;
  const D = meta.duration ?? 1;
  let t = 0, stopAt = Infinity;
  return {
    meta,
    options: opts,
    get t() {
      return t;
    },
    update(dt) {
      t += dt;
      if (!impl.update) return;
      // simulations step at 120 Hz or finer whatever the caller's frame rate, so they look the same everywhere
      const n = Math.max(1, Math.ceil(dt * 120 - 1e-9));
      for (let i = 0; i < n; i++) impl.update(dt / n, opts);
    },
    draw(frame, layer) {
      const p = painterFor(frame);
      p.place(opts.x ?? 0, opts.y ?? 0, !!opts.flip, opts.angle ?? 0);
      p.fade = stopAt === Infinity ? 1 : clamp(1 - (t - stopAt) / FADE);
      p.scale = opts.renderScale ?? 1;
      p.lightK = opts.light ?? 1;
      const tt = meta.loop ? t % D : Math.min(t, D);
      if (layer !== "front" && impl.drawBack) {
        p.layer = "back";
        impl.drawBack(p, tt, opts);
      }
      if (layer !== "back") {
        p.layer = "front";
        impl.draw(p, tt, opts);
      }
    },
    /** Let it end: loops fade out, one-shots cut short. */
    stop() {
      if (stopAt === Infinity) stopAt = t;
    },
    done() {
      return t - stopAt >= FADE || (!meta.loop && t >= D);
    },
  };
}

/**
 * Color over a background, plus light, into RGBA bytes (a Uint8ClampedArray or Buffer, w * h * 4).
 * bg: null for transparent, a color number, or a Uint32Array of the frame's size. Over transparency, light
 * becomes color with alpha (its brightest channel), which reads as additive over dark backgrounds.
 */
export function composite(f, out, bg = null, lightK = 1) {
  const n = f.w * f.h, C = f.color, L = f.light, flat = typeof bg === "number";
  const bgFlat = flat ? bg : null;
  for (let i = 0; i < n; i++) {
    const c = C[i], l = L[i] & 0xffffff;
    const j = i * 4;
    // Most pixels are empty; copying the backdrop (or zero) avoids the full blend loop.
    if (!c && !l) {
      if (bg === null) out[j] = out[j + 1] = out[j + 2] = out[j + 3] = 0;
      else if (bgFlat !== null) {
        out[j] = bgFlat & 255;
        out[j + 1] = (bgFlat >>> 8) & 255;
        out[j + 2] = (bgFlat >>> 16) & 255;
        out[j + 3] = 255;
      } else {
        const k = bg[i];
        out[j] = k & 255;
        out[j + 1] = (k >>> 8) & 255;
        out[j + 2] = (k >>> 16) & 255;
        out[j + 3] = 255;
      }
      continue;
    }
    let r, g, b, a;
    const ca = c >>> 24;
    if (ca === 255) {
      r = c & 255; g = (c >>> 8) & 255; b = (c >>> 16) & 255; a = 255;
      if (!l) {
        out[j] = r; out[j + 1] = g; out[j + 2] = b; out[j + 3] = 255;
        continue;
      }
    } else if (bg === null) {
      // translucent color over nothing keeps its alpha
      r = c & 255; g = (c >>> 8) & 255; b = (c >>> 16) & 255; a = ca;
    } else {
      const k = flat ? bg : bg[i], mix = ca / 255;
      r = (c & 255) * mix + (k & 255) * (1 - mix); g = ((c >>> 8) & 255) * mix + ((k >>> 8) & 255) * (1 - mix);
      b = ((c >>> 16) & 255) * mix + ((k >>> 16) & 255) * (1 - mix); a = 255;
    }
    if (l) {
      const lr = (l & 255) * lightK, lg = ((l >>> 8) & 255) * lightK, lb = ((l >>> 16) & 255) * lightK;
      if (a < 255) {
        // over transparency: premultiply what's there, add the light, divide by the new alpha
        const pa = a / 255, pr = r * pa + lr, pg = g * pa + lg, pb = b * pa + lb;
        const na = Math.min(1, Math.max(pa, Math.max(lr, lg, lb) / 255));
        if (na > 0) { r = Math.min(255, pr / na); g = Math.min(255, pg / na); b = Math.min(255, pb / na); a = na * 255; }
      } else {
        r = Math.min(255, r + lr); g = Math.min(255, g + lg); b = Math.min(255, b + lb);
      }
    }
    out[j] = r; out[j + 1] = g; out[j + 2] = b; out[j + 3] = a;
  }
  return out;
}
