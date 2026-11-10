// The goblin canon: a hunched, big-headed scavenger. Heavy brow, hooked nose, long swept-back ears,
// a wide underbite jaw, a round pot belly over spindly bent legs, and big flat feet. Everything is drawn
// as layered cel-shaded parts: one 1 px rim on the lit side, a dark step under it, a hard ink edge where
// a part overlaps the one behind it. That keeps the silhouette readable at 1x and makes weapons, shields
// and robes sit in front of the body instead of dissolving into it.
//
// The body is shared; a class supplies its own pose mix, clothing and held props. All geometry is in
// "unit" pixels at scale 1 (a normal goblin is 40 units tall), so the giant can be 1.5x and the runt 0.9x.
import { fit, hex, TAU, clamp, luma, ease } from "../../core/index.js";
import { curve } from "../critters/_lib.js";

export const GOBLIN_PAL = ["#0d1a12", "#1d3522", "#2f5230", "#457a3d", "#5d9a4c", "#7fbc62", "#a6d886", "#d8efb0"];
export const GOBLIN_BELLY = ["#24331e", "#465c30", "#6b8044", "#96a862"];
export const GOBLIN_RED = ["#240a10", "#4a1218", "#7a2020", "#b03030", "#df5a48"];
export const LEATHER = ["#160f0a", "#2e1e12", "#4c3018", "#6e4622", "#96683a", "#c09058"];
export const METAL = ["#0c0a0c", "#202024", "#3c3c44", "#5c6068", "#8c9098", "#c0c4cc", "#eef0f4"];
export const RUST = ["#1a0e08", "#3a1c0e", "#6a3418", "#95502a", "#c07040", "#e09868"];
export const WOOD = ["#140d08", "#2c1c10", "#4a2e18", "#6c4422", "#936030", "#c08a4a"];
export const ROBE = ["#0e0818", "#1e1230", "#32204e", "#4a3170", "#6a4a98", "#9070c4", "#c0a4ec"];
export const BONE = ["#1a1814", "#3a352c", "#5e5648", "#8a806c", "#b8ad96", "#e4dcc8"];
export const ARCANE = ["#1a0a30", "#4a1c88", "#8a48e8", "#d0a0ff", "#ffffff"];
export const EYE = ["#2a1c08", "#7a5a10", "#d8a828", "#ffe680"];

const INK = hex("#070a07");
const OUTLINE_HI = hex("#0c1810");
const EAR_IN = hex("#3a2420");
const TOOTH = hex("#e8e0b8");
const MOUTH = hex("#2a0c10");

/** The colors a goblin draws with; the skin ramp follows the effect's `palette` option. */
export function goblinColors(o = {}) {
  return {
    skin: fit(o.palette ?? GOBLIN_PAL, 8),
    belly: fit(GOBLIN_BELLY, 4),
    red: fit(GOBLIN_RED, 5),
    leather: fit(LEATHER, 6),
    metal: fit(METAL, 7),
    rust: fit(RUST, 6),
    wood: fit(WOOD, 6),
    robe: fit(ROBE, 7),
    bone: fit(BONE, 6),
    arcane: fit(ARCANE, 5),
    eye: fit(o.eye ?? EYE, 4),
  };
}

export function pulse(u, a, b) {
  return u >= a && u < b ? Math.sin(Math.PI * ((u - a) / (b - a))) ** 0.85 : 0;
}

/**
 * The idle cycle: a slow weight shift, breath in the belly and shoulders, ears that flick, a blink,
 * a glance. A class's mix(base) overrides fields. Hands are [x, y] in unit space (feet at 0, 0, facing +x).
 */
export function goblinPose(t, D, o = {}) {
  const u = (((t / D + (o.phase ?? 0)) % 1) + 1) % 1;
  const ph = u * TAU;
  const breathe = Math.sin(ph * 2);
  const shift = curve(u, [
    [0, 0],
    [0.16, 0.9],
    [0.3, 1.3],
    [0.46, 0.3],
    [0.6, -0.9],
    [0.76, -1.3],
    [0.9, -0.2],
    [1, 0],
  ]);
  const bob = curve(u, [
    [0, 0],
    [0.07, -0.5],
    [0.2, 0.6],
    [0.33, 0.1],
    [0.47, 0.8],
    [0.57, -0.9],
    [0.7, 0.2],
    [0.85, 0.4],
    [1, 0],
  ]);
  const squash = curve(u, [
    [0, 0],
    [0.18, -0.03],
    [0.34, 0.02],
    [0.5, -0.02],
    [0.64, 0.03],
    [0.8, -0.02],
    [1, 0],
  ]);
  const tilt = curve(u, [
    [0, 0],
    [0.22, 0.45],
    [0.45, -0.55],
    [0.6, 0.25],
    [0.8, -0.35],
    [1, 0],
  ]);
  const look = u < 0.2 ? 0 : u < 0.32 ? 1 : u < 0.46 ? 0 : u < 0.58 ? 1 : u < 0.7 ? -1 : u < 0.84 ? 0 : -1;
  const blink = (u > 0.235 && u < 0.258) || (u > 0.712 && u < 0.728);
  const earL = Math.sin(ph * 2 + 0.6) * 1 + pulse(u, 0.17, 0.22) * 2.2;
  const earR = Math.sin(ph * 2 + 2.2) * 1.2 + pulse(u, 0.52, 0.56) * 1.6;
  const grin = pulse(u, 0.63, 0.72);
  const base = {
    u,
    ph,
    breathe,
    shift,
    bob,
    squash,
    look,
    blink,
    grin,
    earL,
    earR,
    tilt,
    scale: 1,
    hop: 0,
    lean: 0,
    armLen: 1,
    headX: shift * 0.6 + tilt * 0.6,
    headY: -breathe * 0.3 + bob * 0.45,
    hands: { L: [-9.8, -16.8 + bob * 0.2], R: [10.4, -17.0 + bob * 0.3] },
    bends: { L: 1, R: -1 },
    lift: { L: 0, R: 0 },
    knee: 0,
  };
  return { ...base, ...(o.mix ? o.mix(base, u, ph) : {}) };
}

/**
 * The pose a unit plays. The idle loop is the base; an encounter can override it by writing options:
 *   pose "walk"  + walkDistance (local rendered units) / walkStride   alternating planted/lifted feet
 *   pose "cast"  + poseT / poseWindup / poseHold / poseRecover / cast   a wind-up, a release, a recovery
 *   pose "hurt"  + poseT / poseDur / hurtDir                          a flinch that snaps back
 *   pose "die"   + poseT / poseDur                                    a collapse that fades out
 * The extra fields (`fade`, `casting`) are for the class drawing code.
 */
export function goblinAction(t, D, o = {}, mix) {
  const base = goblinPose(t, D, { phase: o.phase, mix });
  const pose = o.pose ?? "idle";
  if (pose === "walk") return { ...base, ...walkPose(base, t, D, o), fade: 1 };
  if (pose === "cast") return { ...base, ...castPose(base, o), casting: true };
  if (pose === "hurt") return { ...base, ...hurtPose(base, o) };
  if (pose === "die") return { ...base, ...diePose(base, o) };
  return { ...base, fade: 1 };
}

const add = ([x, y], [dx, dy]) => [x + dx, y + dy];

function walkPose(base, t, duration, o) {
  const stride = Math.max(1, o.walkStride ?? 5);
  const cycle = o.walkDistance != null ? o.walkDistance / (stride * 4 * base.scale)
    : (o.poseT ?? t) / (o.walkDuration ?? duration / 4);
  const phase = ((cycle % 1) + 1) % 1;
  const angle = phase * TAU, bob = -0.65 * (1 - Math.cos(angle * 2));
  const shift = Math.sin(angle) * 0.45;
  const foot = (offset, plane) => {
    const u = ((phase + offset) % 1 + 1) % 1;
    const swing = Math.max(0, (u - 0.5) * 2);
    const eased = swing * swing * (3 - 2 * swing);
    return {
      x: plane + stride * (u < 0.5 ? 1 - u * 4 : eased * 2 - 1) - shift,
      y: -Math.sin(swing * Math.PI) * 3.3 - bob,
      roll: u < 0.5 ? (u * 4 - 1) * 0.08 : -Math.sin(swing * Math.PI) * 0.2,
    };
  };
  const swing = Math.sin(angle) * 1.1;
  return { shift, bob, hop: 0, knee: 0, lift: { L: 0, R: 0 },
    feet: { L: foot(0.5, 4), R: foot(0, -4) },
    hands: { L: add(base.hands.L, [swing, -Math.abs(swing) * 0.2]), R: add(base.hands.R, [-swing, -Math.abs(swing) * 0.2]) },
  };
}

/** How far through a cast we are, as three numbers: wind-up 0..1, release 0..1, recovery 0..1. */
export function castClock(o) {
  const win = Math.max(0.02, o.poseWindup ?? 0.3);
  const hold = Math.max(0.02, o.poseHold ?? 0.1);
  const rec = Math.max(0.02, o.poseRecover ?? 0.3);
  const pt = Math.max(0, o.poseT ?? 0);
  if (pt <= win) return { u: ease.outCubic(pt / win), s: 0, back: 0, phase: "windup" };
  if (pt <= win + hold) return { u: 1, s: (pt - win) / hold, back: 0, phase: "release" };
  return { u: 1, s: 1, back: clamp((pt - win - hold) / rec), phase: "recover" };
}

/**
 * Each class names its move in `cast`; the body answers with a wind-up, a release and a recovery. The hands
 * move relative to the idle rest pose, so a class can keep its own stance and still throw the same beats.
 */
const CASTS = {
  // a downhill cut: the sword cocks back over the shoulder, then sweeps through the front
  slash(b, u, s, back) {
    const k = u * (1 - back);
    return {
      shift: b.shift - 1.8 * k + 3.0 * s * (1 - back),
      headX: b.headX + 0.6 * k + 0.8 * s,
      headY: b.headY - 0.6 * k,
      hands: {
        L: add(b.hands.L, [-1.2 * k, -1.0 * k]),
        R: add(b.hands.R, [-3.8 * k + 7.6 * s, -4.6 * k + 5.2 * s]),
      },
      earL: b.earL + 2.0 * s,
      earR: b.earR + 1.4 * s,
      bends: { L: 1, R: -1 },
    };
  },
  // the staff is lifted, the free hand opens over the orb; the release pushes both forward
  spell(b, u, s, back) {
    const k = u * (1 - back);
    return {
      lift: { L: 0, R: 0 },
      hop: b.hop - 1.4 * k,
      headX: b.headX + 0.4 * k + 0.5 * s,
      headY: b.headY - 1.1 * k,
      hands: {
        L: add(b.hands.L, [1.4 * k + 2.6 * s, -2.6 * k - 1.2 * s]),
        R: add(b.hands.R, [0.2 * k + 1.2 * s, -2.2 * k + 0.6 * s]),
      },
      earL: b.earL - 2.6 * k + 1.8 * s,
      earR: b.earR - 2.2 * k + 1.4 * s,
      look: 1,
    };
  },
  // draw to the cheek, hold, then the draw hand snaps open behind the ear
  shoot(b, u, s, back) {
    const k = u * (1 - back);
    return {
      shift: b.shift - 1.0 * k,
      headX: b.headX + 0.9 * k,
      hands: {
        L: add(b.hands.L, [-3.4 * k + 2.8 * s, 1.6 * k - 0.4 * s]),
        R: add(b.hands.R, [-0.6 * k, -0.8 * k]),
      },
      earL: b.earL + 1.4 * k - 3.0 * s,
      earR: b.earR + 1.8 * k - 2.2 * s,
      look: 1,
      knee: 0.25 * k,
    };
  },
  // both feet plant, the body loads down, then the strike foot drives into the floor
  quake(b, u, s, back) {
    const k = u * (1 - back);
    const slam = s * (1 - back);
    return {
      bob: b.bob + 2.0 * k + slam * 0.6,
      squash: b.squash + 0.05 * k - 0.04 * slam,
      lift: { L: 0, R: 5.2 * k * (1 - s) },
      hands: {
        L: add(b.hands.L, [-0.8 * k, -2.4 * k + 2.0 * slam]),
        R: add(b.hands.R, [0.8 * k, -2.8 * k + 2.4 * slam]),
      },
      headY: b.headY + 0.9 * k - 0.6 * slam,
      earL: b.earL + 2.2 * slam,
      earR: b.earR + 1.8 * slam,
    };
  },
  // low and coiled, then both blades cross the front in one step
  flurry(b, u, s, back) {
    const k = u * (1 - back);
    return {
      shift: b.shift + 1.2 * k + 2.6 * s * (1 - back),
      bob: b.bob + 0.9 * k,
      headX: b.headX + 0.7 * s,
      hands: {
        L: add(b.hands.L, [1.0 * k + 3.4 * s, -1.6 * k - 0.8 * s]),
        R: add(b.hands.R, [0.8 * k + 3.0 * s, -2.0 * k - 1.0 * s]),
      },
      earL: b.earL - 2.0 * k + 2.6 * s,
      earR: b.earR - 1.6 * k + 2.0 * s,
      look: 1,
    };
  },
};

function castPose(b, o) {
  const { u, s, back, phase } = castClock(o);
  const fn = CASTS[o.cast] ?? CASTS.slash;
  // recovery eases the whole body back to the idle stance, so the loop needs no reset
  const out = fn(b, u, s, back);
  if (phase === "recover") out.fade = 1;
  return out;
}

function hurtPose(b, o) {
  const dur = Math.max(0.08, o.poseDur ?? 0.32);
  const k = clamp((o.poseT ?? 0) / dur);
  // a hard hit and a slow settle: the body snaps back on the first two frames, then sags
  const punch = Math.sin(Math.min(1, k * 1.35) * Math.PI);
  const dir = o.hurtDir ?? -1;
  return {
    fade: 1,
    shift: b.shift + punch * 3.4 * dir,
    bob: b.bob + punch * 1.8,
    squash: b.squash - punch * 0.05,
    headX: b.headX + punch * 2.6 * dir,
    headY: b.headY - punch * 1.4 + k * 0.8,
    hands: {
      L: add(b.hands.L, [punch * 1.6 * dir, -2.4 * punch]),
      R: add(b.hands.R, [punch * 2.0 * dir, -2.8 * punch]),
    },
    earL: b.earL - punch * 6.0 * dir,
    earR: b.earR - punch * 5.0 * dir,
    grin: 0,
    blink: k > 0.5 && k < 0.62,
  };
}

function diePose(b, o) {
  const dur = Math.max(0.2, o.poseDur ?? 0.8);
  const k = clamp((o.poseT ?? 0) / dur);
  const fall = ease.inCubic(clamp(k / 0.5)); // knees give, the body drops
  const settle = clamp((k - 0.45) / 0.55); // then it fades out where it lies
  return {
    fade: 1 - ease.inCubic(settle),
    bob: b.bob + fall * 15,
    scale: b.scale * (1 - fall * 0.1),
    squash: b.squash + fall * 0.08,
    lean: (b.lean ?? 0) + fall * 1.4,
    shift: b.shift - fall * 4.5,
    headX: b.headX - fall * 2.4,
    headY: b.headY + fall * 7.5,
    hands: {
      L: add(b.hands.L, [-2.2 * fall, 7.0 * fall]),
      R: add(b.hands.R, [2.0 * fall, 7.5 * fall]),
    },
    earL: b.earL + fall * 5.5,
    earR: b.earR + fall * 4.5,
    knee: b.knee + fall * 3.0,
    grin: 0,
    blink: k > 0.25,
  };
}

const HURT_RED = ["#1a0508", "#4a0a12", "#7a121c", "#a81c24", "#d43430", "#ff6a52", "#ffb09a", "#ffffff"].map(hex);
const WHITE_PX = hex("#ffffff");

/**
 * The damage flash on the body itself: a white frame, two red frames, then the red draining away. Applied to the
 * finished grid so weapons and cloth flash with the skin, the way a hit reads on a real unit.
 */
export function tintHurt(g, o) {
  const t = o.poseT ?? 0;
  if ((o.pose ?? "idle") !== "hurt" || t > 0.18) return;
  if (t < 0.04) return g.recolor(() => WHITE_PX);
  const drain = clamp((t - 0.04) / 0.14);
  g.recolor((_x, _y, c) => {
    const l = luma(c | 0xff000000);
    const idx = clamp(Math.round(2 + l * 5), 2, 6);
    return drain > 0.55 && l > 0.6 ? HURT_RED[7] : HURT_RED[idx];
  });
}

// --- shape helpers (unit space) ---------------------------------------------------------------
const ell = (cx, cy, rx, ry) => (x, y) => ((x - cx) / rx) ** 2 + ((y - cy) / ry) ** 2 <= 1;

function cap(ax, ay, bx, by, r0, r1 = r0) {
  const dx = bx - ax, dy = by - ay, L2 = dx * dx + dy * dy || 1;
  return (x, y) => {
    let t = ((x - ax) * dx + (y - ay) * dy) / L2;
    t = t < 0 ? 0 : t > 1 ? 1 : t;
    const r = r0 + (r1 - r0) * t;
    return Math.hypot(x - (ax + dx * t), y - (ay + dy * t)) <= r;
  };
}

function poly(pts) {
  return (x, y) => {
    let inside = false;
    for (let i = 0, j = pts.length - 1; i < pts.length; j = i++) {
      const [xi, yi] = pts[i], [xj, yj] = pts[j];
      if (yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) inside = !inside;
    }
    return inside;
  };
}

const any = (...fs) => (x, y) => {
  for (const f of fs) if (f(x, y)) return true;
  return false;
};

const boxEll = (cx, cy, rx, ry) => [cx - rx, cy - ry, cx + rx, cy + ry];
const boxCap = (ax, ay, bx, by, r) => [Math.min(ax, bx) - r, Math.min(ay, by) - r, Math.max(ax, bx) + r, Math.max(ay, by) + r];
const boxPoly = (pts) => {
  let x0 = Infinity, y0 = Infinity, x1 = -Infinity, y1 = -Infinity;
  for (const [x, y] of pts) (x0 = Math.min(x0, x)), (y0 = Math.min(y0, y)), (x1 = Math.max(x1, x)), (y1 = Math.max(y1, y));
  return [x0, y0, x1, y1];
};
const boxUnion = (...bs) => [Math.min(...bs.map((b) => b[0])), Math.min(...bs.map((b) => b[1])), Math.max(...bs.map((b) => b[2])), Math.max(...bs.map((b) => b[3]))];

/**
 * Paint a part into the grid with cel shading. The top and left edges take the light step, the bottom and
 * right edges the shade step, and any edge that lands on an already-painted part gets a 1 px ink line, so
 * limbs, jaws and clothes stay separated from the body behind them.
 */
function paint(g, P, box, inside, ramp, opt = {}) {
  const s = P.scale, sh = P.shift, by = P.bob + P.hop, du = 1 / s;
  const x0 = Math.floor((box[0] + sh) * s) - 1, x1 = Math.ceil((box[2] + sh) * s) + 1;
  const y0 = Math.floor((box[1] + by) * s) - 1, y1 = Math.ceil((box[3] + by) * s) + 1;
  const ink = opt.ink ?? INK;
  for (let py = y0; py <= y1; py++)
    for (let px = x0; px <= x1; px++) {
      const ux = px / s - sh, uy = py / s - by;
      if (!inside(ux, uy)) continue;
      const up = inside(ux, uy - du), lf = inside(ux - du, uy), dn = inside(ux, uy + du), rt = inside(ux + du, uy);
      let c = ramp[opt.mid ?? 3];
      if (!up || !lf) c = ramp[opt.lit ?? 4];
      if (!up && !lf) c = ramp[opt.hi ?? 5];
      if (!dn || !rt) c = ramp[opt.dark ?? 2];
      if (!dn && !rt) c = ramp[opt.deep ?? 1];
      if (opt.tone) {
        const k = opt.tone(ux, uy, up, lf, dn, rt);
        if (k != null) c = ramp[k];
      }
      if (opt.noInk !== true) {
        const sep = (!up && g.get(px, py - 1)) || (!dn && g.get(px, py + 1)) || (!lf && g.get(px - 1, py)) || (!rt && g.get(px + 1, py));
        if (sep) c = ink;
      }
      g.set(px, py, c);
    }
}

/** Draw hands, fingers and wrist lines on a finished arm. */
function handDetail(g, P, W, C, kind = "fist") {
  const [s, sh, by] = [P.scale, P.shift, P.bob + P.hop];
  const px = Math.round((W[0] + sh) * s), py = Math.round((W[1] + by) * s);
  const r = Math.max(1, Math.round(1.6 * s));
  // knuckles catch the light, the palm stays in the body's mid tone
  g.rect(px - r, py - r, Math.max(2, Math.round(2.3 * s)), Math.max(1, Math.round(1.2 * s)), C.skin[5]);
  if (kind === "open") {
    for (let i = -1; i <= 1; i++) g.set(px + i * Math.max(1, Math.round(s)), py + r, C.skin[4]);
  } else {
    g.set(px - r, py, C.skin[2]);
    g.set(px, py - r, C.skin[6]);
  }
}

// --- the body ---------------------------------------------------------------------------------
/**
 * Draw the shared goblin body and return its anchors. hooks:
 *   back(g, ctx)   behind the legs and body: shields, quivers, tails
 *   body(g, ctx)   after the skin torso, before the arms and head: clothes, belts, armour
 *   front(g, ctx)  after head and arms: held weapons, hats, glows
 */
export function drawGoblin(g, P, C, hooks = {}) {
  const s = P.scale, sh = P.shift, by = P.bob + P.hop;
  const at = (x, y) => [Math.round((x + sh) * s), Math.round((y + by) * s)];
  const lp = P.lean ?? 0;
  const bellyRX = 5.9 - lp * 1.0, bellyRY = 5.9 - lp * 0.5;
  const chestRX = 5.2 - lp * 0.5;

  const arm = (side, hand) => solveArm(P, side, hand);
  const arms = { L: arm(-1, P.hands.L), R: arm(1, P.hands.R) };

  const ctx = {
    at,
    P,
    C,
    s,
    arms,
    hands: { L: { x: arms.L.W[0], y: arms.L.W[1] }, R: { x: arms.R.W[0], y: arms.R.W[1] } },
    head: { x: 0.8 + P.headX, y: -33.2 + P.headY },
    chest: { x: 0.6 + P.headX * 0.3, y: -26.5 + P.bob * 0.3 },
    hip: { x: 0.4 + P.shift * 0.3, y: -13.4 },
    foot: { L: [-6 + sh + (P.feet?.L.x ?? 0), by + (P.feet?.L.y ?? 0)],
      R: [5.6 + sh + (P.feet?.R.x ?? 0), by + (P.feet?.R.y ?? 0)] },
    line: (x0, y0, x1, y1, c, a = 1) => {
      const [ax, ay] = at(x0, y0), [bx, by2] = at(x1, y1);
      g.line(ax, ay, bx, by2, c, a);
    },
    rect: (x, y, w, h, c, a = 1) => {
      const [ax, ay] = at(x, y);
      g.rect(ax, ay, Math.max(1, Math.round(w * s)), Math.max(1, Math.round(h * s)), c, a);
    },
    poly: (pts, c, a = 1) => g.poly(pts.map(([x, y]) => at(x, y)), c, a),
    px: (x, y, c, a = 1) => {
      const [ax, ay] = at(x, y);
      g.set(ax, ay, c, a);
    },
  };

  if (hooks.back) hooks.back(g, ctx);

  const placeFoot = (side, x, y) => {
    const f = P.feet?.[side];
    if (!f) return [x, y];
    const pivotX = side === "L" ? -6.2 : 6, pivotY = -2.6;
    const c = Math.cos(f.roll), s = Math.sin(f.roll);
    return [pivotX + (x - pivotX) * c - (y - pivotY) * s + f.x,
      pivotY + (x - pivotX) * s + (y - pivotY) * c + f.y];
  };
  const fStep = P.feet?.L ?? { x: 0, y: 0 }, nStep = P.feet?.R ?? { x: 0, y: 0 };

  // far leg: behind the near one, one ramp step darker
  const fHip = [-3.5, -13.0], fKnee = [-6.5 + fStep.x * 0.5, -7.0 - P.knee * 0.3 + fStep.y * 0.45],
    fAnkle = [-6.2 + P.shift * 0.1 + fStep.x, -2.6 - (P.lift.L ?? 0) + fStep.y];
  const fFoot = [[-9.9, -2.8], [-8.0, -3.5], [-3.2, -2.0], [-1.6, -0.7], [-2.1, 0], [-9.4, 0]].map(([x, y]) => placeFoot("L", x, y));
  const farLeg = any(cap(...fHip, ...fKnee, 2.9 - lp * 0.5, 2.2 - lp * 0.4), cap(...fKnee, ...fAnkle, 2.2, 1.8), poly(fFoot));
  paint(g, P, boxUnion(boxCap(...fHip, ...fKnee, 3), boxCap(...fKnee, ...fAnkle, 3), boxPoly(fFoot)), farLeg, C.skin, {
    mid: 2,
    lit: 3,
    hi: 4,
    dark: 1,
    deep: 0,
  });
  ctx.line(...placeFoot("L", -8.8, -0.7), ...placeFoot("L", -3.4, -0.7), C.skin[0]);
  ctx.line(...placeFoot("L", -8.6, -1.5), ...placeFoot("L", -5.9, -1.6), C.skin[1]);

  // near leg: brighter, with a big three-toed foot
  const nHip = [3.8, -13.0], nKnee = [6.6 + nStep.x * 0.5, -6.8 - P.knee * 0.3 + nStep.y * 0.45],
    nAnkle = [6.0 + P.shift * 0.1 + nStep.x, -2.6 - (P.lift.R ?? 0) + nStep.y];
  const nFoot = [[1.0, -2.8], [2.9, -3.6], [8.2, -2.2], [10.3, -0.8], [9.9, 0], [1.5, 0]].map(([x, y]) => placeFoot("R", x, y));
  const nearLeg = any(cap(...nHip, ...nKnee, 3.1 - lp * 0.5, 2.3 - lp * 0.4), cap(...nKnee, ...nAnkle, 2.3, 1.9), poly(nFoot));
  paint(g, P, boxUnion(boxCap(...nHip, ...nKnee, 3.2), boxCap(...nKnee, ...nAnkle, 3.2), boxPoly(nFoot)), nearLeg, C.skin, {
    mid: 3,
    lit: 4,
    hi: 5,
    dark: 2,
    deep: 1,
  });
  ctx.line(...placeFoot("R", 2.0, -0.6), ...placeFoot("R", 6.8, -0.9), C.skin[1]);
  ctx.line(...placeFoot("R", 6.8, -0.8), ...placeFoot("R", 6.8, -0.1), C.skin[1]);
  ctx.line(...placeFoot("R", 8.5, -0.8), ...placeFoot("R", 8.5, -0.1), C.skin[1]);

  // torso: pot belly, narrow chest, a hump across the back, a short neck with no chin room
  const sq = P.squash;
  const torso = any(
    ell(0.4, -19 + sq * 2, bellyRX, bellyRY + sq * 3),
    ell(-0.4, -28.2, chestRX, 4.7),
    ell(-3.4, -29.2, 3.7, 3.9),
    cap(1.2, -31.4, 2.1, -33.4, 2.7, 2.2),
  );
  paint(
    g,
    P,
    boxUnion(boxEll(0.4, -19 + sq * 2, bellyRX + 1, bellyRY + sq * 3 + 1), boxEll(-0.4, -27.5, chestRX + 1, 5.7), boxEll(-3.6, -28.6, 4.9, 5.0), boxCap(1.2, -31.4, 2.1, -33.4, 3.4)),
    torso,
    C.skin,
    { mid: 3, lit: 4, hi: 5, dark: 2, deep: 1 },
  );

  drawBelly(g, P, C, torso, 0.8, -18 + sq * 2, bellyRX - 2.4, bellyRY - 2.1);

  if (hooks.body) hooks.body(g, ctx);

  // the far arm sits behind the head (so the near ear is not buried); the near arm is in front
  drawArm(g, P, C, arms.L, true, lp);
  drawHead(g, P, C);
  drawArm(g, P, C, arms.R, false, lp);

  if (hooks.front) hooks.front(g, ctx);

  // one hard outline around the whole silhouette, a touch softer on the lit side
  g.outline((x, y, nx, ny) => (ny < 0 && nx <= 0 ? OUTLINE_HI : INK), 1);
  return ctx;
}

function drawArm(g, P, C, A, dark, lean) {
  const mask = any(cap(...A.S, ...A.E, 2.7 - lean * 0.3, 2.0), cap(...A.E, ...A.W, 2.0, 1.6), ell(A.W[0], A.W[1], 2.2, 2.2));
  paint(
    g,
    P,
    boxUnion(boxCap(...A.S, ...A.E, 3.1), boxCap(...A.E, ...A.W, 2.5), boxEll(A.W[0], A.W[1], 2.5, 2.5)),
    mask,
    C.skin,
    dark ? { mid: 3, lit: 4, hi: 4, dark: 1, deep: 0 } : { mid: 4, lit: 5, hi: 6, dark: 2, deep: 1 },
  );
  const [s, sh, by] = [P.scale, P.shift, P.bob + P.hop];
  g.line(Math.round((A.E[0] - 1 + sh) * s), Math.round((A.E[1] + by) * s), Math.round((A.E[0] + 1 + sh) * s), Math.round((A.E[1] + 1.2 + by) * s), C.skin[dark ? 1 : 2]);
  handDetail(g, P, A.W, C, dark ? "open" : "fist");
}

function solveArm(P, side, hand) {
  const S = [side * 6.8, -28.4];
  const up = 6.6 * (P.armLen ?? 1), fore = 6.2 * (P.armLen ?? 1);
  const dx = hand[0] - S[0], dy = hand[1] - S[1];
  const raw = Math.hypot(dx, dy) || 1;
  const ux = dx / raw, uy = dy / raw;
  const d = clamp(raw, 1.5, up + fore - 0.25);
  const a = (up * up - fore * fore + d * d) / (2 * d);
  const h = Math.sqrt(Math.max(0, up * up - a * a));
  const bend = P.bends?.[side < 0 ? "L" : "R"] ?? (side < 0 ? 1 : -1);
  const E = [S[0] + ux * a - uy * h * bend, S[1] + uy * a + ux * h * bend];
  return { S, E, W: [S[0] + ux * d, S[1] + uy * d] };
}

function drawBelly(g, P, C, torso, cx, cy, rx, ry) {
  const s = P.scale, sh = P.shift, by = P.bob + P.hop;
  const x0 = Math.floor((cx - rx + sh) * s) - 1, x1 = Math.ceil((cx + rx + sh) * s) + 1;
  const y0 = Math.floor((cy - ry + by) * s) - 1, y1 = Math.ceil((cy + ry + by) * s) + 1;
  for (let py = y0; py <= y1; py++)
    for (let px = x0; px <= x1; px++) {
      const ux = px / s - sh, uy = py / s - by;
      if (!torso(ux, uy)) continue;
      const d = ((ux - cx) / rx) ** 2 + ((uy - cy) / ry) ** 2;
      if (d > 1) continue;
      if (d > 0.8 && ((px + py * 3) & 3) !== 0) continue;
      let c = d < 0.6 ? C.belly[2] : C.belly[1];
      if (d > 0.86) c = C.belly[0];
      g.set(px, py, c);
    }
  // two creases under the ribs
  const arc = (y, w) => {
    const [ax, ay] = [Math.round((cx - w + sh) * s), Math.round((y + by) * s)], [bx, byy] = [Math.round((cx + w + sh) * s), Math.round((y + 0.35 + by) * s)];
    g.line(ax, ay, bx, byy, C.skin[2]);
  };
  arc(cy + ry * 0.25, rx * 0.55);
  arc(cy + ry * 0.6, rx * 0.35);
}

function drawHead(g, P, C) {
  const hx = 0.8 + P.headX, hy = -33.2 + P.headY;
  const H = (x, y) => [x + hx, y + hy];
  const s = P.scale, sh = P.shift, by = P.bob + P.hop;
  const Px = ([x, y]) => [Math.round((x + sh) * s), Math.round((y + by) * s)];

  // far ear, mostly hidden behind the skull: a shorter, darker blade
  const farEar = [H(-3.2, -1.6), H(-6.4, -4.8), H(-10.6, -8.0 + P.earL * 0.7), H(-9.6, -4.0 + P.earL * 0.5), H(-7.0, 0.2), H(-4.6, 1.0)];
  paint(g, P, boxPoly(farEar), poly(farEar), C.skin, { mid: 1, lit: 2, hi: 3, dark: 0, deep: 0 });

  // near ear: a long leaf sweeping back and up, a red inset and a 1 px skin edge
  const ear = [H(-1.8, -1.2), H(-4.4, -4.8), H(-9.4, -10.2 + P.earR * 0.9), H(-9.0, -5.6 + P.earR * 0.6), H(-6.6, -1.2), H(-3.8, 0.6)];
  const inner = [H(-3.6, -1.8), H(-5.4, -4.6), H(-8.4, -8.0 + P.earR * 0.9), H(-7.8, -4.8), H(-6.0, -1.6), H(-4.8, -0.8)];
  paint(g, P, boxPoly(ear), poly(ear), C.skin, { mid: 3, lit: 4, hi: 5, dark: 2, deep: 1 });
  // ear crease, not a filled inner leaf: one dark line following the ear's length
  g.line(...Px(H(-3.6, -1.6)), ...Px(H(-7.4, -6.4 + P.earR * 0.8)), EAR_IN);
  g.line(...Px(H(-4.0, -0.8)), ...Px(H(-7.8, -5.0 + P.earR * 0.8)), C.skin[1]);
  const [ex, ey] = H(-3.4, -0.2);
  g.set(Math.round((ex + sh) * s), Math.round((ey + by) * s), C.skin[1]);

  // profile skull: dome, jutting brow, hooked nose and a wide underbite jaw as one silhouette
  const skull = any(
    ell(hx, hy - 0.2, 5.7, 5.5),
    poly([H(1.8, -2.8), H(5.8, -2.0), H(6.8, -0.2), H(3.2, -0.4)]),
    poly([H(5.2, -0.6), H(6.6, -0.8), H(9.8, 3.0), H(9.4, 4.8), H(8.6, 5.4), H(8.0, 4.2), H(7.2, 2.0), H(5.6, 0.8), H(4.8, -0.2)]),
    poly([H(-1.8, 4.0), H(3.0, 3.4), H(8.4, 4.2), H(8.8, 6.6), H(7.0, 8.8), H(1.8, 8.8), H(-1.8, 6.6)]),
  );
  paint(g, P, boxUnion(boxEll(hx, hy - 0.2, 6.8, 6.5), boxPoly([H(2.6, -1.0), H(10.6, 3.2), H(9.0, 9.2), H(-2.0, 9.0)])), skull, C.skin, {
    mid: 3,
    lit: 4,
    hi: 5,
    dark: 2,
    deep: 1,
    tone: (x, y) => {
      const ux = x - hx, uy = y - hy;
      if (ux < -2.4) return 2;
      if (uy > 6.2) return 2;
      return null;
    },
  });

  const [jx, jy] = [(hx + sh) * s, (hy + by) * s];
  // brow over the single eye, and the crease under it
  g.line(jx + 0.4 * s, jy - 1.8 * s, jx + 5.2 * s, jy - 1.2 * s, C.skin[5]);
  g.line(jx + 0.6 * s, jy - 1.0 * s, jx + 5.4 * s, jy - 0.2 * s, C.skin[1]);
  g.line(jx + 2.6 * s, jy + 2.8 * s, jx + 5.6 * s, jy + 3.0 * s, C.skin[4]);
  // nose ridge and a hard underside: the hook that makes the profile
  g.line(jx + 5.4 * s, jy - 0.4 * s, jx + 8.0 * s, jy + 2.0 * s, C.skin[5]);
  g.line(jx + 7.4 * s, jy + 2.0 * s, jx + 9.4 * s, jy + 3.4 * s, C.skin[4]);
  g.line(jx + 9.0 * s, jy + 2.4 * s, jx + 9.6 * s, jy + 3.4 * s, C.skin[5]);
  g.line(jx + 8.2 * s, jy + 4.2 * s, jx + 9.4 * s, jy + 3.8 * s, C.skin[1]);
  g.line(jx + 6.2 * s, jy + 4.8 * s, jx + 9.2 * s, jy + 4.4 * s, INK);
  const [nx, ny] = [(hx + 8.4 + sh) * s, (hy + 3.6 + by) * s];
  g.set(nx, ny, INK);
  g.set(nx - s, ny, C.skin[2]);
  // mouth: a wide dark slit on the underbite with one big tusk
  g.rect(jx + 2.4 * s, jy + 6.4 * s, 5.8 * s, Math.max(1, Math.round(1.3 * s)), MOUTH);
  g.line(jx + 3.0 * s, jy + 7.4 * s, jx + 7.2 * s, jy + 7.5 * s, C.red[1]);
  g.line(jx + 2.4 * s, jy + 8.1 * s, jx + 8.0 * s, jy + 8.4 * s, C.skin[3]);
  g.rect((hx + 3.4 + sh) * s, (hy + 5.4 + by) * s, Math.max(1, Math.round(s * 1.1)), Math.max(2, Math.round(2.2 * s)), TOOTH);
  g.rect((hx + 6.6 + sh) * s, (hy + 6.0 + by) * s, Math.max(1, Math.round(s)), Math.max(1, Math.round(1.6 * s)), TOOTH);
  g.line(jx - 0.8 * s, jy + 9.0 * s, jx + 6.8 * s, jy + 9.3 * s, C.skin[4]);
  g.line(jx - 0.6 * s, jy + 9.6 * s, jx + 6.4 * s, jy + 9.9 * s, C.skin[1]);

  // one deep socket with a big amber eye, heavy lid, hard glint
  const px = Math.round((hx + 2.6 + sh) * s), py = Math.round((hy + 1.2 + by) * s);
  g.rect(px - 2, py - 2, 4, 4, C.skin[0]);
  if (P.blink) {
    g.line(px - 2, py + 1, px + 1, py + 1, C.skin[1]);
  } else {
    const lx = Math.round(P.look * 0.6);
    g.rect(px - 1 + lx, py - 1, 2, 2, C.eye[2]);
    g.set(px + lx, py, C.eye[0]);
    g.set(px - 1 + lx, py - 1, C.eye[3]);
    g.set(px + 1, py - 2, C.skin[1]);
  }
  // warts and a brow scar
  g.set((hx + 2.2 + sh) * s, (hy + 3.8 + by) * s, C.skin[2]);
  g.set((hx - 1.0 + sh) * s, (hy + 1.6 + by) * s, C.skin[2]);
  g.line(jx + 1.2 * s, jy + 4.0 * s, jx + 4.0 * s, jy + 4.4 * s, C.skin[4]);
}

// --- clothes ----------------------------------------------------------------------------------
/** The back half of the loincloth, drawn behind the thighs. */
export function drawLoinBack(g, P, C) {
  const flap = [
    [-7.4, -13.2],
    [-1.2, -13.2],
    [-1.8, -8.8],
    [-3.4, -6.4],
    [-4.6, -9.6],
    [-6.2, -7.4],
    [-7.0, -10.4],
  ];
  paint(g, P, boxPoly(flap), poly(flap), C.red, { mid: 1, lit: 2, hi: 3, dark: 1, deep: 0 });
}

/** The front flap: a ragged red cloth, a hip knot and two hanging tails. */
export function drawLoin(g, P, C) {
  const s = P.scale, by = P.bob + P.hop;
  const flap = [
    [-2.4, -13.2],
    [6.2, -13.6],
    [6.9, -10.6],
    [5.7, -7.2],
    [4.9, -10.1],
    [3.7, -6.6],
    [2.5, -9.8],
    [1.2, -7.3],
    [-0.3, -10.4],
    [-1.6, -8.1],
    [-2.7, -11.0],
  ];
  paint(g, P, boxPoly(flap), poly(flap), C.red, { mid: 2, lit: 3, hi: 4, dark: 1, deep: 0 });
  // folds and a lit hem
  const fold = (x0, y0, x1, y1) => {
    const [ax, ay] = [(x0 + P.shift) * s, (y0 + by) * s], [bx, byy] = [(x1 + P.shift) * s, (y1 + by) * s];
    g.line(ax, ay, bx, byy, C.red[1]);
  };
  fold(0.4, -12.4, 0.2, -8.4);
  fold(2.8, -12.8, 2.7, -9.2);
  fold(4.8, -12.6, 5.0, -9.0);
  // knot at the near hip, tails sway with the body
  const sway = Math.sin(P.ph * 2) * 0.4;
  const [kx, ky] = [(6.0 + P.shift) * s, (-13.2 + by) * s];
  g.rect(kx, ky, 2.2 * s, 2.2 * s, C.leather[3]);
  g.set(kx, ky, C.leather[4]);
  g.line(kx + 0.6 * s, ky + 1.8 * s, kx + 1.6 * s + sway * s, ky + 5.4 * s, C.red[3]);
  g.line(kx + 1.4 * s, ky + 1.6 * s, kx + 2.6 * s + sway * s, ky + 4.6 * s, C.red[2]);
}

/** The leather waist band with a metal buckle and a hip pouch. */
export function drawBelt(g, P, C) {
  const belt = [[-7.0, -13.9], [6.8, -14.2], [7.0, -12.2], [-7.0, -11.9]];
  paint(g, P, boxPoly(belt), poly(belt), C.leather, { mid: 3, lit: 4, hi: 5, dark: 2, deep: 1, noInk: true });
  const s = P.scale, sh = P.shift, by = P.bob + P.hop;
  // pouch on the far hip, strap, buckle
  const [px, py] = [(-5.6 + sh) * s, (-13.4 + by) * s];
  g.rect(px - 1.4 * s, py, 3.0 * s, 3.4 * s, C.leather[2]);
  g.rect(px - 1.4 * s, py, 3.0 * s, 1.0 * s, C.leather[4]);
  g.set(px, py + 1.4 * s, C.leather[0]);
  const [bx, byy] = [(2.6 + sh) * s, (-14.0 + by) * s];
  g.rect(bx, byy, 2.4 * s, 2.2 * s, C.metal[4]);
  g.rect(bx + 0.5 * s, byy + 0.5 * s, 1.4 * s, 1.2 * s, C.metal[1]);
  g.set(bx + 1.0 * s, byy + 1.0 * s, C.metal[5]);
}

/** A leather strap across the chest, with two studs. */
export function drawHarness(g, P, C, opts = {}) {
  const s = P.scale, sh = P.shift, by = P.bob + P.hop;
  const pts = opts.pts ?? [[4.8, -29.0], [2.0, -24.6], [-1.0, -20.2], [-3.8, -15.2]];
  for (let i = 1; i < pts.length; i++) {
    const [ax, ay] = [(pts[i - 1][0] + sh) * s, (pts[i - 1][1] + by) * s];
    const [bx, byy] = [(pts[i][0] + sh) * s, (pts[i][1] + by) * s];
    g.line(ax, ay + s * 0.6, bx, byy + s * 0.6, C.leather[1]);
    g.line(ax, ay, bx, byy, C.leather[3]);
    g.line(ax, ay - s * 0.6, bx, byy - s * 0.6, C.leather[4]);
  }
  g.set((2.0 + sh) * s, (-24.4 + by) * s, C.metal[5]);
  g.set((-1.2 + sh) * s, (-20.0 + by) * s, C.metal[4]);
}

/** The contact shadow, drawn on the back layer. */
export function drawShadow(p, P, o = {}) {
  const s = P.scale, sh = P.shift;
  const fade = o.fade ?? 1;
  if (fade <= 0.01) return;
  const rx = (o.rx ?? 10.5) * s * (1 - Math.max(0, -P.hop) * 0.03), ry = (o.ry ?? 2.4) * s;
  for (let y = Math.floor(-ry); y <= Math.ceil(ry); y++)
    for (let x = Math.floor(-rx); x <= Math.ceil(rx); x++) {
      const d = (x / rx) ** 2 + (y / ry) ** 2;
      if (d >= 1) continue;
      const px = x + sh * s * 0.35 * (o.drift ?? 0.3), py = y;
      p.blend(px, py, 0x05070a, fade * (o.a ?? 0.55) * (1 - d) ** 0.7);
    }
}
