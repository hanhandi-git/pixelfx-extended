// Worker pool with sticky slot routing: slot N always uses worker N % pool size.

export function workerPoolSize() {
  if (typeof navigator === "undefined") return 0;
  const hw = navigator.hardwareConcurrency || 4;
  return Math.min(8, Math.max(2, hw - 1));
}

export class WorkerPool {
  constructor(n = workerPoolSize(), workerUrl) {
    if (!workerUrl) throw new Error("workerUrl required");
    this.n = n;
    this.workers = [];
    this.pending = new Map();
    this.gen = 0;
    this.tails = new Array(n).fill(null);
    for (let i = 0; i < n; i++) {
      const w = new Worker(workerUrl, { type: "module" });
      w.onmessage = (e) => this._onMessage(w, e.data);
      w.onerror = (e) => console.error("tile-worker", e.message ?? e);
      this.workers.push(w);
    }
  }

  workerFor(slot) {
    return this.workers[((slot % this.n) + this.n) % this.n];
  }

  _onMessage(worker, data) {
    if (data.type === "disposed") return;
    const key = `${data.slot}:${data.gen}`;
    const job = this.pending.get(key);
    if (!job) return;
    this.pending.delete(key);
    if (data.type === "error") job.reject(new Error(data.message ?? "worker error"));
    else job.resolve(data);
  }

  _send(worker, payload) {
    const gen = ++this.gen;
    return new Promise((resolve, reject) => {
      this.pending.set(`${payload.slot}:${gen}`, { resolve, reject });
      worker.postMessage({ ...payload, gen });
    });
  }

  _enqueue(slot, task) {
    const w = this.workerFor(slot);
    const i = this.workers.indexOf(w);
    const run = () =>
      task(w).catch((err) => {
        console.error("tile-worker task", err);
        throw err;
      });
    const prev = this.tails[i] ?? Promise.resolve();
    const next = prev.then(run, run);
    this.tails[i] = next.catch(() => {});
    return next;
  }

  init(slot, fxId, aspect, pad, opts, preview = true) {
    return this._enqueue(slot, (w) => this._send(w, { type: "init", slot, fxId, aspect, pad, opts, preview, playing: true }));
  }

  tick(slot, dt, playing, speed) {
    return this._enqueue(slot, (w) => this._send(w, { type: "tick", slot, dt, playing, speed }));
  }

  seek(slot, t) {
    return this._enqueue(slot, (w) => this._send(w, { type: "seek", slot, t }));
  }

  dispose(slot) {
    return this._enqueue(slot, (w) => this._send(w, { type: "dispose", slot }));
  }
}
