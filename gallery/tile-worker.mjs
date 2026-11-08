// Gallery grid worker: one TileSim slot per message thread.

import { TileSim } from "./tile-sim.mjs";

const slots = new Map();
const modCache = new Map();

async function modFor(fxId) {
  let mod = modCache.get(fxId);
  if (!mod) {
    mod = await import(`../src/fx/${fxId}.js`);
    modCache.set(fxId, mod);
  }
  return mod;
}

function metaOf(mod) {
  return { fps: 30, bg: "dark", loop: false, duration: 1, tags: [], options: {}, ...mod.meta };
}

function emitRaster(type, msg, out) {
  const pixels = out.buffer;
  self.postMessage(
    {
      type,
      ...msg,
      pw: out.w,
      ph: out.h,
      W: out.W,
      H: out.H,
      density: out.density,
      shakeX: out.shakeX ?? 0,
      shakeY: out.shakeY ?? 0,
      pixels,
    },
    [pixels],
  );
}

let chain = Promise.resolve();

self.onmessage = (event) => {
  const msg = event.data;
  chain = chain.then(() => handle(msg)).catch((err) => {
    self.postMessage({ type: "error", slot: msg.slot, gen: msg.gen, message: String(err?.message ?? err) });
  });
};

async function handle(msg) {
  if (msg.type === "dispose") {
    slots.delete(msg.slot);
    self.postMessage({ type: "disposed", slot: msg.slot, gen: msg.gen });
    return;
  }
  if (msg.type === "init" || msg.type === "layout") {
    const mod = await modFor(msg.fxId);
    const meta = metaOf(mod);
    const preview = msg.preview !== false;
    let sim = slots.get(msg.slot);
    if (!sim || msg.type === "init") {
      sim = new TileSim(mod, meta, msg.aspect, msg.pad, msg.opts ?? {}, { preview });
      slots.set(msg.slot, sim);
    } else {
      sim.opts = { ...sim.opts, ...msg.opts };
      sim.preview = preview;
      sim.layout(msg.aspect, msg.pad);
    }
    sim.playing = msg.playing !== false;
    emitRaster("ready", { slot: msg.slot, gen: msg.gen }, sim.rasterize());
    return;
  }
  const sim = slots.get(msg.slot);
  if (!sim) {
    self.postMessage({ type: "idle", slot: msg.slot, gen: msg.gen });
    return;
  }
  if (msg.type === "seek") {
    emitRaster("frame", { slot: msg.slot, gen: msg.gen }, sim.seek(msg.t));
    return;
  }
  if (msg.type === "tick") {
    sim.playing = msg.playing !== false;
    sim.speed = msg.speed ?? 1;
    const out = sim.tick(msg.dt);
    if (!out) self.postMessage({ type: "idle", slot: msg.slot, gen: msg.gen });
    else emitRaster("frame", { slot: msg.slot, gen: msg.gen }, out);
  }
}
