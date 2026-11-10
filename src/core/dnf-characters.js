// Code-owned DNF reference characters imported from Ember Echo's pixel source.
// The original source is a noncommercial NEOPLE / NEXON reference set; these pixels are
// kept separate from the MIT procedural roster and are only used when a DNF look is selected.
import { HERO_PIXEL_DATA } from "./dnf-pixel-data.js";
import { DNF_CHARACTER_META } from "./dnf-character-meta.js";
import { MELEE_SHAPES, THROWN_SHAPES } from "./weapons.js";

export const DNF_CHARACTER_LOOKS = DNF_CHARACTER_META.map((look) => ({
  ...look,
  style: "dnf-sprite",
  sprite: true,
  tags: ["dnf", "pixel-reference"],
  desc: `${look.name} · code-owned reference pixels`,
}));

const LOOKS = new Map(DNF_CHARACTER_LOOKS.map((look) => [look.id, look]));
const FRAME_CACHE = new Map();
const REST_CACHE = new Map();
const EQUIPPED_CACHE = new Map();
const FRAME_EQUIPMENT_CACHE = new WeakMap();
const EQUIPMENT_MODELS = { ...MELEE_SHAPES, ...THROWN_SHAPES };
const WORLD_SCALE = 0.5;

export const isDnfCharacter = (id) => LOOKS.has(id);
export const dnfCharacterOf = (id) => LOOKS.get(id) ?? null;

function colorOf(value) {
  const hex = value.slice(1);
  const r = Number.parseInt(hex.slice(0, 2), 16), g = Number.parseInt(hex.slice(2, 4), 16);
  const b = Number.parseInt(hex.slice(4, 6), 16), a = Number.parseInt(hex.slice(6, 8) || "ff", 16);
  return ((a << 24) | (b << 16) | (g << 8) | r) >>> 0;
}

function frameName(look, pose = {}) {
  const clips = look.clips;
  if (HERO_PIXEL_DATA[look.id]?.frames[pose.spriteFrame]) return pose.spriteFrame;
  if (pose.dead || pose.downed) return clips.dead?.[0] ?? clips.idle[0];
  if (pose.ghost || (pose.crouch ?? 0) >= 6) return clips.attack3?.[0] ?? clips.idle[0];
  if ((pose.fy ?? 0) < -29 && !(pose.weapon && (pose.fx ?? 0) > 14)) return clips.cast?.[0] ?? clips.idle[0];
  if ((pose.fx ?? 0) > 14) return clips.attack2?.[0] ?? clips.idle[0];
  if ((pose.fx ?? 0) < -4) return clips.attack1?.[0] ?? clips.idle[0];
  return clips.idle?.[0] ?? 0;
}

function decode(id, frameId, density) {
  const key = `${id}:${frameId}:${density}`;
  if (FRAME_CACHE.has(key)) return FRAME_CACHE.get(key);
  const source = HERO_PIXEL_DATA[id], frame = source?.frames?.[frameId];
  if (!source || !frame) return null;
  const palette = source.palette, offset = frame.offset ?? [0, 0], layer = frame.layers[0];
  const pixels = new Map();
  for (let y = 0; y < frame.height; y++) {
    const row = layer.rows[y] ?? "";
    for (let x = 0; x < frame.width; x++) {
      const token = row.slice(x * 2, x * 2 + 2);
      if (!token || token === "..") continue;
      const color = palette[token];
      if (!color) continue;
      const px = Math.round((offset[0] + x) * WORLD_SCALE * density) / density;
      const py = Math.round((offset[1] + y) * WORLD_SCALE * density) / density;
      pixels.set(`${px},${py}`, [px, py, colorOf(color)]);
    }
  }
  const values = [...pixels.values()], xs = values.map((v) => v[0]), ys = values.map((v) => v[1]), color = values.map((v) => v[2]);
  const out = {
    n: values.length, density, xs: density === 1 ? Int16Array.from(xs) : Float32Array.from(xs),
    ys: density === 1 ? Int16Array.from(ys) : Float32Array.from(ys), color: Uint32Array.from(color),
    src: new Int16Array(values.length), ink: new Uint8Array(values.length),
    x0: Math.min(...xs), x1: Math.max(...xs), y0: Math.min(...ys), y1: Math.max(...ys), z: 0,
  };
  FRAME_CACHE.set(key, out);
  return out;
}

function restFrame(id, density) {
  const key = `${id}:${density}`;
  if (!REST_CACHE.has(key)) REST_CACHE.set(key, decode(id, dnfCharacterOf(id).clips.idle[0], density));
  return REST_CACHE.get(key);
}

/** Composite equipment at the source frame's hand. Both the gallery and Ember use this adapter. */
export function equipDnfFrame(body, id, frameId, pose = {}) {
  const frame = HERO_PIXEL_DATA[id]?.frames[frameId];
  if (!body || !frame) return body;
  const models = EQUIPMENT_MODELS;
  if (!models[pose.weapon] && !models[pose.offWeapon]) return body;
  const angle = Math.round((pose.sa ?? frame.angle) * 20) / 20;
  const offAngle = Math.round((pose.sb ?? frame.angle) * 20) / 20;
  const key = `${pose.weapon ?? ""}:${angle}:${pose.offWeapon ?? ""}:${offAngle}:${(pose.y ?? 0) < -0.5}`;
  let variants = FRAME_EQUIPMENT_CACHE.get(body);
  if (!variants) FRAME_EQUIPMENT_CACHE.set(body, variants = new Map());
  if (variants.has(key)) return variants.get(key);
  const density = body.density, points = new Map();
  const put = (x, y, color, src, ink = 0) => {
    const px = Math.round(x * density), py = Math.round(y * density);
    points.set(`${px},${py}`, [px / density, py / density, color, src, ink]);
  };
  for (let i = 0; i < body.n; i++) put(body.xs[i], body.ys[i], body.color[i], body.src?.[i] ?? -1, body.ink?.[i] ?? 0);
  const hand = frame.grip.map((v) => v * WORLD_SCALE);
  const paintWeapon = (name, angle, offsetX = 0) => {
    const model = models[name];
    if (!model) return;
    const c = Math.cos(angle), s = Math.sin(angle), gripX = hand[0] + offsetX, gripY = hand[1];
    model.draw((along, across, color) => {
      const x = gripX + c * along - s * across, y = gripY + s * along + c * across;
      if (y > 0 && (pose.y ?? 0) >= -0.5) return;
      // Let the original fingers occlude the grip; the remainder is the selected model.
      const key = `${Math.round(x * density)},${Math.round(y * density)}`;
      if (points.has(key) && Math.hypot(x - gripX, y - gripY) < 1.25) return;
      put(x, y, color, -1);
    }, pose);
  };
  paintWeapon(pose.offWeapon, offAngle, -6);
  paintWeapon(pose.weapon, angle);
  const values = [...points.values()], xs = values.map((v) => v[0]), ys = values.map((v) => v[1]);
  const equipped = {
    ...body, n: values.length, xs: density === 1 ? Int16Array.from(xs) : Float32Array.from(xs),
    ys: density === 1 ? Int16Array.from(ys) : Float32Array.from(ys), color: Uint32Array.from(values.map((v) => v[2])),
    src: Int16Array.from(values.map((v) => v[3])), ink: Uint8Array.from(values.map((v) => v[4])),
    x0: Math.min(...xs), x1: Math.max(...xs), y0: Math.min(...ys), y1: Math.max(...ys),
    weapon: pose.weapon, hand,
  };
  variants.set(key, equipped);
  if (variants.size > 128) variants.delete(variants.keys().next().value);
  return equipped;
}

/** Return a pose-compatible raster while retaining the source's hard pixel clusters. */
export function dnfPose(pose, id, density = 1) {
  const look = dnfCharacterOf(id);
  if (!look) return null;
  const frameId = frameName(look, pose);
  const key = `${id}:${frameId}:${density}:${pose.weapon ?? ""}:${pose.sa ?? ""}:${pose.offWeapon ?? ""}:${pose.sb ?? ""}:${(pose.y ?? 0) < -0.5}`;
  if (EQUIPPED_CACHE.has(key)) return EQUIPPED_CACHE.get(key);
  const out = decode(id, frameId, density), rest = restFrame(id, density);
  if (!out || !rest) return out;
  // Source indices address stockActor's world-pixel mask, including on a dense output.
  const base = restFrame(id, 1), width = base.x1 - base.x0 + 1;
  for (let i = 0; i < out.n; i++) {
    const x = Math.max(base.x0, Math.min(base.x1, Math.round(out.xs[i])));
    const y = Math.max(base.y0, Math.min(base.y1, Math.round(out.ys[i])));
    out.src[i] = (y - base.y0) * width + x - base.x0;
  }
  const equipped = equipDnfFrame(out, id, frameId, pose);
  EQUIPPED_CACHE.set(key, equipped);
  if (EQUIPPED_CACHE.size > 1024) EQUIPPED_CACHE.delete(EQUIPPED_CACHE.keys().next().value);
  return equipped;
}
