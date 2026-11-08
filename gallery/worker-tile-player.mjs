// Grid tile playback: simulation in a Worker, canvas blit on the main thread.

import { workerPoolSize, WorkerPool } from "./worker-pool.mjs";

// The static build supplies its filename; hosting paths need not contain /dist/.
const WORKER_FILE = typeof __PIXELFX_WORKER_FILE__ === "string" ? __PIXELFX_WORKER_FILE__ : "tile-worker.mjs";

let sharedPool = null;
let nextSlot = 1;

export function tileWorkersEnabled() {
  return typeof Worker !== "undefined" && typeof window !== "undefined";
}

export function getTilePool() {
  if (!tileWorkersEnabled()) return null;
  if (!sharedPool) {
    try {
      sharedPool = new WorkerPool(workerPoolSize(), new URL(`./${WORKER_FILE}`, import.meta.url));
    } catch (err) {
      console.warn("gallery workers disabled:", err);
      sharedPool = null;
    }
  }
  return sharedPool;
}

export class WorkerTilePlayer {
  constructor(canvas, fx, aspect, pad, options, pool, slot = nextSlot++) {
    this.canvas = canvas;
    this.ctx = canvas.getContext("2d");
    this.fx = fx;
    this.aspect = aspect;
    this.pad = pad;
    this.opts = { ...options };
    this.pool = pool;
    this.slot = slot;
    this.playing = true;
    this.speed = 1;
    this.actor = true;
    this.flip = false;
    this.ready = false;
    this.busy = false;
    this.density = 2;
    this.W = 0;
    this.H = 0;
    this._boot = pool.init(slot, fx.id, aspect, pad, this.opts).then(
      (res) => {
        if (res.type === "ready") this._applyFrame(res, true);
      },
      (err) => {
        console.error("worker init", fx.id, err);
        this._failed = true;
      },
    );
  }

  setCharacter(id) {
    this.opts.character = id;
    this.ready = false;
    return this.pool.init(this.slot, this.fx.id, this.aspect, this.pad, this.opts).then((res) => {
      if (res.type === "ready") this._applyFrame(res, true);
    });
  }

  async seek(t) {
    await this._boot;
    const res = await this.pool.seek(this.slot, Math.max(0, t));
    if (res?.type === "frame") this._applyFrame(res, true);
  }

  restart() {
    return this.pool.init(this.slot, this.fx.id, this.aspect, this.pad, this.opts);
  }

  _applyFrame(res, markReady) {
    if (this.canvas.width !== res.pw || this.canvas.height !== res.ph) {
      this.canvas.width = res.pw;
      this.canvas.height = res.ph;
      this._img = null;
    }
    this.W = res.W ?? res.pw;
    this.H = res.H ?? res.ph;
    this.density = res.density ?? this.density;
    if (!this._img) this._img = this.ctx.createImageData(res.pw, res.ph);
    const src = res.pixels instanceof ArrayBuffer ? new Uint8ClampedArray(res.pixels) : new Uint8ClampedArray(res.pixels);
    this._img.data.set(src);
    const sx = (res.shakeX ?? 0) * this.density;
    const sy = (res.shakeY ?? 0) * this.density;
    if (sx || sy) this.ctx.clearRect(0, 0, this.W, this.H);
    this.ctx.putImageData(this._img, sx, sy);
    if (markReady) this.ready = true;
  }

  tick(dt) {
    if (this._failed || !this.ready || this.busy) return null;
    this.busy = true;
    return this.pool
      .tick(this.slot, dt, this.playing, this.speed)
      .then((res) => {
        this.busy = false;
        if (res?.type === "frame") this._applyFrame(res, false);
        return res;
      })
      .catch((err) => {
        this.busy = false;
        console.error(this.fx.id, err);
        return null;
      });
  }
}
