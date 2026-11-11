// The cinder imp canon: a small ember-born scavenger. A round furnace belly, a big head with two swept
// horns, stubby arms ending in ember claws, a tail tipped with a live coal, and two-digit legs that
// patter when it walks. Same contract as the goblin rig: parts are cel-shaded into a Grid, outlined once,
// and the pose options (walk/cast/hurt/die) come from the encounter, not from the loop.
import { fit, hex, clamp, luma, ease, TAU } from "../../core/index.js";
import { castClock, tintHurt, pulse } from "./_goblin.js";
import { Grid, shift, curve } from "./_lib.js";

export const IMP_PAL = ["#160a1e", "#2c1438", "#4a1e4e", "#6e2c5a", "#96506a", "#c0766a", "#e8a878", "#ffd9a0"];
export const IMP_COAL = ["#1a0c08", "#3a140c", "#6a2410", "#a83c14", "#e0681e", "#ff9a3c", "#ffd88a", "#fff4c8"];
export const IMP_BELLY = ["#1c0e26", "#341640", "#52244e", "#7a3862", "#a8546e"];
export const IMP_HORN = ["#241a2c", "#3e2c40", "#5e4454", "#82646a", "#b08a84", "#e0c0a8"];

const INK = hex("#0a0612");
const OUTLINE_HI = hex("#140a20");
const EYE = hex("#ffd84a");

/** The colors an imp draws with; the body ramp follows the effect's `palette` option. */
export function impColors(o = {}) {
  return {
    skin: fit(o.palette ?? IMP_PAL, 8),
    belly: fit(IMP_BELLY, 5),
    coal: fit(o.coal ?? IMP_COAL, 8),
    horn: fit(IMP_HORN, 6),
    eye: fit(o.eye ?? ["#3a2408", "#8a5a10", "#d89a20", "#ffe680"], 4),
  };
}

/**
 * The idle cycle: a furnace belly that breathes, weight shifting side to side, ears that flick,
 * a coal tail that gutters, an occasional hop and a glance. mix(base, u, ph) customizes per class.
 */
export function impPose(t, D, o = {}) {
  const u = (((t / D + (o.phase ?? 0)) % 1) + 1) % 1;
  const ph = u * TAU;
  const breathe = Math.sin(ph * 2);
  const shiftW = curve(u, [
    [0, 0], [0.18, 1.0], [0.34, 1.4], [0.5, 0.2], [0.64, -1.0], [0.8, -1.4], [0.92, -0.3], [1, 0],
  ]);
  const bob = curve(u, [
    [0, 0], [0.09, -0.6], [0.22, 0.5], [0.36, 0.1], [0.5, 0.7], [0.62, -0.8], [0.78, 0.2], [0.9, 0.4], [1, 0],
  ]);
  const hop = Math.max(0, Math.sin(ph * 2 + 1.2)) ** 6 * (o.hopScale ?? 1);
  const squash = curve(u, [[0, 0], [0.2, -0.04], [0.38, 0.03], [0.55, -0.02], [0.72, 0.04], [1, 0]]);
  const tilt = curve(u, [[0, 0], [0.25, 0.5], [0.48, -0.6], [0.66, 0.3], [0.85, -0.4], [1, 0]]);
  const look = u < 0.22 ? 0 : u < 0.36 ? 1 : u < 0.5 ? 0 : u < 0.64 ? -1 : u < 0.78 ? 0 : 1;
  const blink = (u > 0.3 && u < 0.322) || (u > 0.74 && u < 0.756);
  const earL = Math.sin(ph * 2 + 0.7) * 1.2 + pulse(u, 0.2, 0.25) * 2.4;
  const earR = Math.sin(ph * 2 + 2.4) * 1.4 + pulse(u, 0.58, 0.62) * 1.8;
  const grin = pulse(u, 0.66, 0.76);
  const tail = Math.sin(ph * 3 + 0.5);
  const base = {
    u, ph, breathe, shift: shiftW, bob, squash, tilt, look, blink, grin,
    hop: -hop * 3.0, scale: 1, lean: 0, armLen: 1,
    headX: shiftW * 0.7 + tilt * 0.7,
    headY: -breathe * 0.35 + bob * 0.4,
    hands: { L: [-6.4 + shiftW * 0.3, -13.6 + bob * 0.2], R: [7.0 - shiftW * 0.2, -13.8 + bob * 0.25] },
    bends: { L: 1, R: -1 },
    earL, earR, tail,
    feet: null, lift: { L: 0, R: 0 }, knee: 0,
  };
  return { ...base, ...(o.mix ? o.mix(base, u, ph) : {}) };
}

const add = ([x, y], [dx, dy]) => [x + dx, y + dy];

/** Pattering feet: the two stub legs alternate while the body bobs; no stride, just hustle. */
function walkPose(base, t, duration, o) {
  const stride = Math.max(1, o.walkStride ?? 4);
  const cycle = o.walkDistance != null ? o.walkDistance / (stride * 3 * base.scale)
    : (o.poseT ?? t) / (o.walkDuration ?? duration / 5);
  const phase = ((cycle % 1) + 1) % 1;
  const angle = phase * TAU;
  const bob = -Math.abs(Math.sin(angle)) * 1.6;
  const shift = Math.sin(angle) * 0.5;
  const foot = (offset) => {
    const u = ((phase + offset) % 1 + 1) % 1;
    return { x: (u < 0.5 ? -1 : 1) * stride * 0.5 * Math.sin(u * Math.PI), y: -Math.max(0, Math.sin(u * Math.PI * 2)) * 1.8, roll: 0 };
  };
  const swing = Math.sin(angle) * 1.0;
  return {
    shift, bob, hop: 0,
    feet: { L: foot(0.5), R: foot(0) },
    hands: { L: add(base.hands.L, [swing * 0.5, 0.4]), R: add(base.hands.R, [-swing * 0.5, 0.4]) },
  };
}

const CASTS = {
  // both claws cock back, then rake across the front
  slash(b, u, s, back) {
    const k = u * (1 - back);
    return {
      shift: b.shift - 1.2 * k + 2.6 * s * (1 - back),
      headX: b.headX + 0.7 * k + 0.8 * s,
      hands: {
        L: add(b.hands.L, [-1.4 * k + 3.0 * s, -1.2 * k - 0.6 * s]),
        R: add(b.hands.R, [-1.2 * k + 2.6 * s, -1.0 * k - 0.8 * s]),
      },
      earL: b.earL + 2.4 * s, earR: b.earR + 1.8 * s,
      tail: b.tail + 3 * s,
    };
  },
  // the coal tail lifts and the jaw opens; the release spits forward
  spell(b, u, s, back) {
    const k = u * (1 - back);
    return {
      hop: b.hop - 1.6 * k,
      headX: b.headX + 0.5 * k + 0.5 * s,
      headY: b.headY - 1.2 * k - 0.4 * s,
      hands: {
        L: add(b.hands.L, [1.2 * k + 1.8 * s, -2.0 * k - 1.0 * s]),
        R: add(b.hands.R, [0.8 * k + 1.4 * s, -1.6 * k - 0.6 * s]),
      },
      earL: b.earL - 2.4 * k + 1.6 * s,
      earR: b.earR - 2.0 * k + 1.2 * s,
      look: 1,
    };
  },
  // a crouch and a two-handed overhead slam
  quake(b, u, s, back) {
    const k = u * (1 - back);
    const slam = s * (1 - back);
    return {
      bob: b.bob + 2.4 * k + slam * 0.8,
      squash: b.squash + 0.07 * k - 0.06 * slam,
      hands: {
        L: add(b.hands.L, [-0.6 * k, -3.2 * k + 3.4 * slam]),
        R: add(b.hands.R, [0.8 * k, -3.4 * k + 3.8 * slam]),
      },
      headY: b.headY + 1.0 * k - 0.8 * slam,
      earL: b.earL + 2.4 * slam, earR: b.earR + 2.0 * slam,
      tail: b.tail - 3 * k,
    };
  },
};

function castPose(b, o) {
  const { u, s, back } = castClock(o);
  return (CASTS[o.cast] ?? CASTS.slash)(b, u, s, back);
}

function hurtPose(b, o) {
  const dur = Math.max(0.08, o.poseDur ?? 0.32);
  const k = clamp((o.poseT ?? 0) / dur);
  const punch = Math.sin(Math.min(1, k * 1.35) * Math.PI);
  const dir = o.hurtDir ?? -1;
  return {
    shift: b.shift + punch * 3.0 * dir,
    bob: b.bob + punch * 1.6,
    squash: b.squash - punch * 0.06,
    headX: b.headX + punch * 2.4 * dir,
    headY: b.headY - punch * 1.2 + k * 0.7,
    hands: {
      L: add(b.hands.L, [punch * 1.4 * dir, -2.0 * punch]),
      R: add(b.hands.R, [punch * 1.8 * dir, -2.4 * punch]),
    },
    earL: b.earL - punch * 5.0 * dir,
    earR: b.earR - punch * 4.4 * dir,
    tail: b.tail + punch * 4 * dir,
    grin: 0,
    blink: k > 0.5 && k < 0.62,
  };
}

function diePose(b, o) {
  const dur = Math.max(0.2, o.poseDur ?? 0.8);
  const k = clamp((o.poseT ?? 0) / dur);
  const fall = ease.inCubic(clamp(k / 0.5));
  const settle = clamp((k - 0.45) / 0.55);
  return {
    fade: 1 - ease.inCubic(settle),
    bob: b.bob + fall * 9,
    scale: b.scale * (1 - fall * 0.12),
    squash: b.squash + fall * 0.1,
    lean: (b.lean ?? 0) + fall * 1.8,
    shift: b.shift - fall * 3.5,
    headX: b.headX - fall * 2.0,
    headY: b.headY + fall * 5.5,
    hands: {
      L: add(b.hands.L, [-1.8 * fall, 5.5 * fall]),
      R: add(b.hands.R, [1.6 * fall, 6.0 * fall]),
    },
    earL: b.earL + fall * 4.5,
    earR: b.earR + fall * 3.8,
    tail: b.tail + fall * 6,
    grin: 0,
    blink: k > 0.25,
  };
}

/** The pose a unit plays; same option contract as goblinAction. */
export function impAction(t, D, o = {}, mix) {
  const base = impPose(t, D, { phase: o.phase, mix });
  const pose = o.pose ?? "idle";
  if (pose === "walk") return { ...base, ...walkPose(base, t, D, o), fade: 1 };
  if (pose === "cast") return { ...base, ...castPose(base, o), casting: true };
  if (pose === "hurt") return { ...base, ...hurtPose(base, o), fade: 1 };
  if (pose === "die") return { ...base, ...diePose(base, o) };
  return { ...base, fade: 1 };
}

// --- shape helpers -------------------------------------------------------------------------------
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
const any = (...fs) => (x, y) => { for (const f of fs) if (f(x, y)) return true; return false; };
const boxEll = (cx, cy, rx, ry) => [cx - rx, cy - ry, cx + rx, cy + ry];
const boxCap = (ax, ay, bx, by, r) => [Math.min(ax, bx) - r, Math.min(ay, by) - r, Math.max(ax, bx) + r, Math.max(ay, by) + r];
const boxPoly = (pts) => {
  let x0 = Infinity, y0 = Infinity, x1 = -Infinity, y1 = -Infinity;
  for (const [x, y] of pts) (x0 = Math.min(x0, x)), (y0 = Math.min(y0, y)), (x1 = Math.max(x1, x)), (y1 = Math.max(y1, y));
  return [x0, y0, x1, y1];
};
const boxUnion = (...bs) => [Math.min(...bs.map((b) => b[0])), Math.min(...bs.map((b) => b[1])), Math.max(...bs.map((b) => b[2])), Math.max(...bs.map((b) => b[3]))];

/** Cel-shaded part painter, same lighting logic as the goblin rig but on the imp's simpler palette. */
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

/**
 * Draw the imp body. hooks:
 *   back(g, ctx)   behind everything: tail, back spikes
 *   body(g, ctx)   after torso, before head/arms: belly glow, rags, belt
 *   front(g, ctx)  last: held weapons, glowing maw, chest ember
 */
export function drawImp(g, P, C, hooks = {}) {
  const s = P.scale, sh = P.shift, by = P.bob + P.hop;
  const at = (x, y) => [Math.round((x + sh) * s), Math.round((y + by) * s)];
  const ctx = {
    at, P, C, s,
    hands: { L: { x: P.hands.L[0], y: P.hands.L[1] }, R: { x: P.hands.R[0], y: P.hands.R[1] } },
    head: { x: P.headX, y: -24 + P.headY },
    chest: { x: P.headX * 0.3, y: -15 + P.bob * 0.3 },
    hip: { x: P.shift * 0.3, y: -8 },
    line: (x0, y0, x1, y1, c, a = 1) => { const [ax, ay] = at(x0, y0), [bx, by2] = at(x1, y1); g.line(ax, ay, bx, by2, c, a); },
    rect: (x, y, w, h, c, a = 1) => { const [ax, ay] = at(x, y); g.rect(ax, ay, Math.max(1, Math.round(w * s)), Math.max(1, Math.round(h * s)), c, a); },
    poly: (pts, c, a = 1) => g.poly(pts.map(([x, y]) => at(x, y)), c, a),
    px: (x, y, c, a = 1) => { const [ax, ay] = at(x, y); g.set(ax, ay, c, a); },
    ellipse: (cx, cy, rx, ry, c, a = 1) => g.ellipse(...at(cx, cy).map((v, i) => i ? v : v), rx * s, ry * s, c, a),
  };

  if (hooks.back) hooks.back(g, ctx);

  // tail: a curved ember-tipped whip behind the body
  drawTail(g, P, C, ctx);

  // legs: two stubby digitigrade legs with three claws each
  drawLegs(g, P, C, ctx);

  // torso: furnace belly over a narrow chest, a short neck
  const sq = P.squash;
  const torso = any(
    ell(0, -12 + sq * 1.6, 5.6 - (P.lean ?? 0) * 0.8, 5.4 + sq * 2.2),
    ell(-0.3, -19.5, 4.4, 3.6),
    cap(0.8, -22.5, 1.4, -24.5, 2.2, 1.8),
  );
  paint(g, P, boxUnion(boxEll(0, -12 + sq * 1.6, 6.6, 7.6), boxEll(-0.4, -19, 5.4, 4.6), boxCap(0.8, -22.5, 1.4, -24.5, 3)),
    torso, C.skin, { mid: 3, lit: 4, hi: 5, dark: 2, deep: 1 });
  drawBelly(g, P, C);

  if (hooks.body) hooks.body(g, ctx);

  // far arm behind the head, near arm in front
  drawArm(g, P, C, P.hands.L, true);
  drawHead(g, P, C);
  drawArm(g, P, C, P.hands.R, false);

  if (hooks.front) hooks.front(g, ctx);

  g.outline((x, y, nx, ny) => (ny < 0 && nx <= 0 ? OUTLINE_HI : INK), 1);
  return ctx;
}

function drawTail(g, P, C, ctx) {
  const sway = P.tail * 1.6 + Math.sin(P.ph * 3) * 0.8;
  const pts = [[-4, -14], [-8 - sway * 0.4, -12 + sway * 0.3], [-11 - sway, -8 + sway * 0.5], [-12 - sway * 1.4, -4 + sway * 0.7]];
  const mapped = pts.map(([x, y]) => ctx.at(x, y));
  for (let i = 1; i < mapped.length; i++) {
    const r0 = 1.6 - i * 0.3, r1 = Math.max(0.5, 1.6 - (i + 1) * 0.3);
    g.tube([mapped[i - 1], mapped[i]], (u) => r0 + (r1 - r0) * u, (u, v) => v > 0.55 ? C.skin[1] : v > 0.25 ? C.skin[2] : C.skin[3]);
  }
  // the coal tip: layered ember glow
  const tip = ctx.at(-12 - sway * 1.4, -4 + sway * 0.7);
  const k = 0.7 + 0.3 * Math.sin(P.ph * 5);
  const tr = Math.max(1, Math.round(1.7 * P.scale));
  g.ellipse(tip[0], tip[1], tr, tr, C.coal[4], k);
  g.ellipse(tip[0], tip[1], Math.max(1, Math.round(1.1 * P.scale)), Math.max(1, Math.round(1.1 * P.scale)), C.coal[5]);
  g.set(tip[0], tip[1], C.coal[7]);
}

function drawLegs(g, P, C, ctx) {
  const feet = P.feet;
  for (const side of ["L", "R"]) {
    const sgn = side === "L" ? -1 : 1;
    const f = feet?.[side];
    const hip = [sgn * 2.4, -8.5], knee = [sgn * 3.6 + (f?.x ?? 0) * 0.5, -4.2 + (f?.y ?? 0) * 0.4], ankle = [sgn * 3.2 + (f?.x ?? 0), -1.2 + (f?.y ?? 0) - (P.lift?.[side] ?? 0)];
    const leg = any(cap(...hip, ...knee, 1.7, 1.3), cap(...knee, ...ankle, 1.3, 1.0));
    paint(g, P, boxUnion(boxCap(...hip, ...knee, 2.2), boxCap(...knee, ...ankle, 1.8)), leg, C.skin,
      side === "L" ? { mid: 2, lit: 3, hi: 4, dark: 1, deep: 0 } : { mid: 3, lit: 4, hi: 5, dark: 2, deep: 1 });
    // three toe claws
    const [ax, ay] = ctx.at(ankle[0], ankle[1]);
    for (let i = -1; i <= 1; i++) {
      const tx = ankle[0] + i * 1.1 + sgn * 0.6, ty = ankle[1] + 0.4 - Math.abs(i) * 0.2;
      const [px2, py2] = ctx.at(tx, ty);
      g.set(px2, py2, C.horn[3]);
      g.set(px2 + Math.sign(sgn + i * 0.4 || 1), py2 + 1, C.horn[2]);
    }
  }
}

function drawBelly(g, P, C) {
  // furnace glow showing through the belly seams
  const s = P.scale, sh = P.shift, by = P.bob + P.hop;
  const k = 0.55 + 0.45 * Math.sin(P.ph * 2 + 0.6);
  for (const [ox, oy, rx, ry] of [[-1.6, -13, 1.6, 2.2], [1.2, -10.5, 1.2, 1.6]]) {
    g.ellipse(Math.round((ox + sh) * s), Math.round((oy + by) * s), rx * s, ry * s, C.belly[2]);
    g.ellipse(Math.round((ox + sh) * s), Math.round((oy + by) * s), rx * 0.6 * s, ry * 0.6 * s, C.coal[3]);
    g.ellipse(Math.round((ox + sh) * s), Math.round((oy + by) * s), rx * 0.3 * s, ry * 0.35 * s, C.coal[5], k);
  }
  // belly seam cracks
  g.line(Math.round((-3.4 + sh) * s), Math.round((-15 + by) * s), Math.round((-1 + sh) * s), Math.round((-12.5 + by) * s), C.skin[1]);
  g.line(Math.round((1 + sh) * s), Math.round((-9 + by) * s), Math.round((3.4 + sh) * s), Math.round((-7 + by) * s), C.skin[1]);
}

function solveArm(P, side, hand) {
  const S = [side * 4.6, -21.5];
  const up = 4.6 * (P.armLen ?? 1), fore = 4.2 * (P.armLen ?? 1);
  const dx = hand[0] - S[0], dy = hand[1] - S[1];
  const raw = Math.hypot(dx, dy) || 1;
  const ux = dx / raw, uy = dy / raw;
  const d = clamp(raw, 1.2, up + fore - 0.2);
  const a = (up * up - fore * fore + d * d) / (2 * d);
  const h = Math.sqrt(Math.max(0, up * up - a * a));
  const bend = P.bends?.[side < 0 ? "L" : "R"] ?? (side < 0 ? 1 : -1);
  const E = [S[0] + ux * a - uy * h * bend, S[1] + uy * a + ux * h * bend];
  return { S, E, W: [S[0] + ux * d, S[1] + uy * d] };
}

function drawArm(g, P, C, hand, dark) {
  const side = dark ? -1 : 1;
  const A = solveArm(P, side, hand);
  const mask = any(cap(...A.S, ...A.E, 1.9, 1.5), cap(...A.E, ...A.W, 1.5, 1.1), ell(A.W[0], A.W[1], 1.8, 1.8));
  paint(g, P, boxUnion(boxCap(...A.S, ...A.E, 2.3), boxCap(...A.E, ...A.W, 2), boxEll(A.W[0], A.W[1], 2, 2)), mask, C.skin,
    dark ? { mid: 2, lit: 3, hi: 4, dark: 1, deep: 0 } : { mid: 3, lit: 4, hi: 5, dark: 2, deep: 1 });
  // ember claws: three short fingers with coal tips
  const s = P.scale, sh = P.shift, by = P.bob + P.hop;
  const [wx, wy] = [Math.round((A.W[0] + sh) * s), Math.round((A.W[1] + by) * s)];
  for (let i = -1; i <= 1; i++) {
    const fx = wx + i * Math.max(1, Math.round(s)), fy = wy - Math.abs(i);
    g.set(fx, fy, C.coal[4]);
    g.set(fx, fy - 1, C.coal[5]);
  }
  g.set(wx, wy, C.skin[dark ? 3 : 4]);
}

function drawHead(g, P, C) {
  const hx = P.headX, hy = -24 + P.headY;
  const H = (x, y) => [x + hx, y + hy];
  const s = P.scale, sh = P.shift, by = P.bob + P.hop;
  const Px = ([x, y]) => [Math.round((x + sh) * s), Math.round((y + by) * s)];

  // horns: swept-back, layered horn ramp, lit top edge
  for (const side of [-1, 1]) {
    const flick = (side < 0 ? P.earL : P.earR) * 0.7;
    const pts = [[side * 3.4, -3.2], [side * 5.6 + flick * side * 0.4, -6.4], [side * 6.8 + flick * side * 0.7, -10.6], [side * 6.2 + flick * side, -13.4]];
    for (let i = 1; i < pts.length; i++) {
      const r = 1.7 - i * 0.32;
      g.tube([Px(H(...pts[i - 1])), Px(H(...pts[i]))], () => Math.max(0.4, r), (u, v) => v > 0.55 ? C.horn[1] : v > 0.25 ? C.horn[2] : v > 0.1 ? C.horn[3] : C.horn[4]);
    }
    const tip = Px(H(...pts.at(-1)));
    g.set(tip[0], tip[1], C.horn[5]);
  }
  // skull: big dome, jaw, ear nubs
  const skull = any(
    ell(hx, hy - 1.2, 4.4, 4.0),
    ell(hx + 0.6, hy + 2.4, 3.0, 2.0),
    ell(hx - 3.6, hy - 0.6, 1.3, 1.8),
    ell(hx + 3.7, hy - 0.8, 1.2, 1.6),
  );
  paint(g, P, boxUnion(boxEll(hx, hy - 1.2, 5.4, 5), boxEll(hx + 0.6, hy + 2.4, 4, 2.6), boxEll(hx - 3.8, hy - 0.6, 1.8, 2.2), boxEll(hx + 3.9, hy - 0.8, 1.7, 2)),
    skull, C.skin, { mid: 3, lit: 4, hi: 5, dark: 2, deep: 1 });
  // brow ridge and eyes
  const [ex, ey] = Px(H(hx - 1.9 + P.look * 0.4, hy - 0.9));
  const [ex2, ey2] = Px(H(hx + 1.9 + P.look * 0.4, hy - 0.9));
  if (P.blink) {
    g.line(ex - 1, ey, ex + 1, ey, C.skin[1]); g.line(ex2 - 1, ey2, ex2 + 1, ey2, C.skin[1]);
  } else {
    g.set(ex, ey, C.eye[3]); g.set(ex + (P.look > 0 ? 1 : -1), ey, C.eye[2]); g.set(ex, ey - 1, C.eye[3]);
    g.set(ex2, ey2, C.eye[3]); g.set(ex2 + (P.look > 0 ? 1 : -1), ey2, C.eye[2]); g.set(ex2, ey2 - 1, C.eye[3]);
    g.set(ex, ey, hex("#fff8d0")); g.set(ex2, ey2, hex("#fff8d0"));
  }
  // snout and grin: a short muzzle with two tusks and a coal mouth
  const mouthK = 0.4 + P.grin * 0.6;
  g.line(...Px(H(hx - 1.6, hy + 2.6)), ...Px(H(hx + 1.8, hy + 2.7)), C.skin[2]);
  g.set(...Px(H(hx - 1.2, hy + 2.9)), C.coal[4]);
  if (mouthK > 0.5) {
    g.set(...Px(H(hx - 0.6, hy + 3.1)), C.coal[5]);
    g.set(...Px(H(hx + 0.4, hy + 3.0)), C.coal[4]);
  }
  // tusks
  g.set(...Px(H(hx - 2.6, hy + 1.4)), C.horn[4]); g.set(...Px(H(hx - 3.0, hy + 2.0)), C.horn[3]);
  g.set(...Px(H(hx + 2.8, hy + 1.3)), C.horn[4]); g.set(...Px(H(hx + 3.2, hy + 1.9)), C.horn[3]);
}

export { tintHurt, pulse };
