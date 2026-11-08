// Pure tile simulation + raster (no DOM). Used by gallery Web Workers.

import {
  createFrame,
  clearFrame,
  createFx,
  createAct,
  actBounds,
  composite,
  backdrop,
  drawActor,
  painterFor,
  stockActor,
  actorAlphaOf,
} from "../src/core/index.js";

export const MAX_SIM_STEPS = 3;

export class TileSim {
  constructor(fxMod, meta, aspect, pad, options = {}, { preview = false } = {}) {
    this.fxMod = fxMod;
    this.fxMeta = meta;
    this.opts = { ...options };
    this.preview = preview;
    this.flip = false;
    this.actor = true;
    this.speed = 1;
    this.playing = true;
    this.bg = meta.bg;
    this.aspect = aspect;
    this.pad = pad;
    this.layout(aspect, pad);
  }

  get acted() {
    return !!this.fxMod.act && this.actor;
  }

  get anchorX() {
    return this.flip ? this.x + this.artW - 1 : this.x;
  }

  layout(aspect, pad) {
    this.aspect = aspect;
    this.pad = pad;
    const acted = this.acted;
    const b = acted ? { ...actBounds(this.fxMod, this.opts) } : null;
    if (b) b.y1 = Math.min(b.y1, 22);
    const [w, h] = acted ? [b.x1 - b.x0, b.y1 - b.y0] : this.fxMeta.size;
    const [ox, oy] = acted ? [-b.x0, -b.y0] : this.fxMeta.origin;
    this.W = Math.ceil(Math.max(w * (acted ? Math.min(pad, 1.1) : pad), h * (acted ? Math.min(pad, 1.1) : pad) * aspect));
    this.H = Math.ceil(this.W / aspect);
    this.artW = w;
    this.artH = h;
    this.x = Math.floor((this.W - w) / 2) + ox;
    this.y = acted ? Math.max(oy + 2, this.H - b.y1 - 2) : Math.floor((this.H - h) / 2) + oy;
    this.density = acted && this.fxMod.act.onBody ? 1 : this.preview ? 1 : 2;
    this.pw = this.W * this.density;
    this.ph = this.H * this.density;
    this.frame = createFrame(this.W, this.H, 0, 0, this.density);
    this.pixels = new Uint8ClampedArray(this.pw * this.ph * 4);
    this.setBg(this.bg);
    this.restart();
  }

  setBg(kind) {
    this.bg = kind;
    this.bgBuf = kind === "none" ? null : backdrop(kind, this.pw, this.ph, this.y * this.density);
    this.dirty = true;
  }

  setCharacter(id) {
    this.opts.character = id;
    this.layout(this.aspect, this.pad);
  }

  restart() {
    this.inst = (this.acted ? createAct : createFx)(this.fxMod, { x: this.anchorX, y: this.y, flip: this.flip, ...this.opts });
    this.acc = 0;
    this.wait = 0;
    this.dirty = true;
  }

  seek(t) {
    this.restart();
    this.inst.update(t);
    this.dirty = true;
    return this.rasterize();
  }

  tick(dt) {
    const m = this.fxMeta;
    const step = 1 / m.fps;
    if (this.playing) this.acc = Math.min(this.acc + dt * this.speed, 0.25);
    let moved = false;
    let steps = 0;
    while (this.acc >= step && steps < MAX_SIM_STEPS) {
      this.acc -= step;
      steps++;
      if (!m.loop && (this.acted ? this.inst.done() : this.inst.t >= m.duration)) {
        this.wait += step;
        if (this.wait > 0.45) this.restart();
      } else this.inst.update(step);
      moved = true;
    }
    if (this.acc > step * 2) this.acc = step * 2;
    if (!moved && !this.dirty) return null;
    return this.rasterize();
  }

  rasterize() {
    const f = clearFrame(this.frame);
    let shakeX = 0;
    let shakeY = 0;
    if (this.acted) {
      this.inst.draw(f);
      composite(f, this.pixels, this.bgBuf);
      [shakeX, shakeY] = this.inst.shake;
    } else {
      this.inst.draw(f, "back");
      const m = this.fxMeta;
      const tt = m.loop ? this.inst.t % m.duration : Math.min(this.inst.t, m.duration);
      if (m.actor && this.actor) {
        drawActor(
          painterFor(f).place(this.anchorX, this.y, this.flip),
          this.inst.options.actor ?? stockActor(),
          actorAlphaOf(this.fxMod, tt, this.inst.options),
        );
      }
      this.inst.draw(f, "front");
      composite(f, this.pixels, this.bgBuf);
    }
    this.dirty = false;
    const buf = this.pixels.buffer;
    this.pixels = new Uint8ClampedArray(this.pw * this.ph * 4);
    return { buffer: buf, w: this.pw, h: this.ph, shakeX, shakeY, W: this.W, H: this.H, density: this.density };
  }
}
