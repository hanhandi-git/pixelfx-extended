// Original weapon equipment, drawn in grip-local coordinates through the rig's depth buffer.
import { hex } from "./color.js";

const C = Object.fromEntries(Object.entries({
  white: "#fffdf2", silver: "#d8e4ed", steel: "#8b9cb8", edge: "#53627e",
  ink: "#25283d", dark: "#3c3951", wrap: "#a8939d", leather: "#60394b",
  gold: "#f0cb72", goldL: "#fff0b4", goldD: "#a3683d", wood: "#a3714a", woodD: "#603f36",
  red: "#c75461", redL: "#f48b74", orange: "#e8753b", orangeL: "#ffc15f", cyan: "#91dbe1", blue: "#568bb8", violet: "#8e71bb",
  jade: "#7fd3b0", jadeD: "#3f7f68", patina: "#7aa88a", patinaD: "#456b58",
  blood: "#a8324a", bloodL: "#ff7a86", bloodD: "#5c1424",
  void: "#3a2f5e", voidL: "#7f6fb0", voidD: "#1c1730", onyx: "#2a2233",
  ghost: "#cfe8ff", sky: "#7fc8ff", skyL: "#dff2ff", skyD: "#2f6a9c",
  scale: "#3f9c78", scaleL: "#9fe8c4", scaleD: "#1f5c48",
  energy: "#a8f4ff",
  ivory: "#f7eed9", ivoryD: "#cbb796", bronze: "#b98b4a", bronzeD: "#6f5228", rose: "#e8b3b8",
}).map(([k, v]) => [k, hex(v) >>> 0]));

function shaft(T, from, to, r, light, dark) {
  for (let i = from; i <= to; i += 0.4) for (let k = -r; k <= r; k += 0.4)
    T(i, k, k < 0 ? light : dark);
}
function band(T, at, width, radius, light = C.gold, dark = C.goldD) {
  shaft(T, at, at + width, radius, light, dark);
}
function polygon(T, pts, color) {
  const x0 = Math.min(...pts.map((p) => p[0])), x1 = Math.max(...pts.map((p) => p[0]));
  const y0 = Math.min(...pts.map((p) => p[1])), y1 = Math.max(...pts.map((p) => p[1]));
  for (let x = x0; x <= x1; x += 0.4) for (let y = y0; y <= y1; y += 0.4) {
    let inside = false;
    for (let i = 0, j = pts.length - 1; i < pts.length; j = i++) {
      const [ax, ay] = pts[i], [bx, by] = pts[j];
      if ((ay > y) !== (by > y) && x < (bx - ax) * (y - ay) / (by - ay) + ax) inside = !inside;
    }
    if (inside) T(x, y, typeof color === "function" ? color(x, y) : color);
  }
}
function ring(T, cx, cy, r, c) {
  for (let a = 0; a < Math.PI * 2; a += 0.1) T(cx + Math.cos(a) * r, cy + Math.sin(a) * r, c);
}
function wraps(T, from, to, radius = 0.9) {
  shaft(T, from, to, radius, C.leather, C.ink);
  for (let i = from + 0.5; i < to; i += 1.8) for (let k = -radius; k <= radius; k += 0.4) T(i + k * 0.5, k, C.wrap);
}

export const MELEE_SHAPES = {
  "blood-cleaver": { two: -9, draw(T) {
    // Broad straight dungeon blade: clipped tip, cold flat and a deep red fuller.
    wraps(T, -10, 2, 0.9); band(T, -10.8, 1, 1.5, C.silver, C.edge);
    polygon(T, [[2,-4],[4,-6],[6,-5],[6,5],[4,6],[2,4]], C.edge);
    polygon(T, [[3,-4],[4.5,-4.8],[5,-3],[5,3],[4.5,4.8],[3,4]], C.silver);
    polygon(T, [[5,-4],[44,-4],[52,-1],[48,4],[5,4]], C.edge);
    polygon(T, [[6,-3],[44,-3],[50,-1],[46,2],[6,2]], C.steel);
    polygon(T, [[6,2],[46,2],[50,-1],[48,4],[6,4]], C.white);
    for (let x=8;x<44;x+=0.4) T(x,-2,C.silver);
    shaft(T,8,39,0.45,C.blood,C.bloodD);
    for (const x of [10,17,24,31]) { T(x,0,C.goldD); T(x+1,0,C.redL); }
    T(-11,0,C.redL);
  } },
  "chain-blade": { two: -4, draw(T) {
    // Narrow black saber with a hooked tip and a readable chain hanging behind the grip.
    wraps(T,-7,2,0.7); band(T,-8,1,1.2,C.gold,C.goldD);
    band(T,2,1.4,3.4,C.silver,C.edge);
    polygon(T,[[4,-2],[35,-3],[43,-7],[41,-1],[36,2],[4,2]],C.ink);
    polygon(T,[[5,-1],[35,-2],[41,-5],[38,0],[34,1],[5,1]],C.violet);
    for(let x=6;x<37;x+=0.4) T(x,1,C.silver);
    for(let x=9;x<34;x+=5) { T(x,-2,C.cyan); T(x+1,-2,C.white); }
    for(let i=0;i<6;i++) {
      const x=-8-i*1.5,y=2+i*1.7;
      ring(T,x,y,1.2,i%2?C.edge:C.silver);
      T(x-0.6,y-0.7,C.white);
    }
  } },
  "ember-greatsword": { two: -12, draw(T) {
    // DNF-style executioner silhouette: huge shoulders, a flame guard and a hot fuller.
    wraps(T, -11.8, 2.6, 1.2); band(T, -12.5, 0.9, 1.65, C.bronze, C.bronzeD);
    polygon(T, [[1.5, -2.2], [3.8, -8.2], [6.2, -5.5], [8.1, -9], [9.2, -3.2], [9.2, 3.2], [8.1, 9], [6.2, 5.5], [3.8, 8.2], [1.5, 2.2]], C.orange);
    polygon(T, [[3.8, -3.1], [5.6, -6.3], [7.2, -3.8], [8.1, -5.3], [8.1, 5.3], [7.2, 3.8], [5.6, 6.3], [3.8, 3.1]], C.gold);
    ring(T, 4.6, 0, 2.2, C.redL); T(4.6, 0, C.orangeL);
    for (let i = 9; i < 59; i += 0.4) {
      const u = (i - 9) / 50, w = u > 0.84 ? (1 - u) / 0.16 * 5.2 : 5.2;
      for (let k = -w; k <= w; k += 0.4) T(i, k, k < -3.2 ? C.white : k < -1 ? C.silver : k < 1.8 ? C.steel : C.edge);
    }
    for (let i = 11; i < 55; i += 0.35) {
      const heat = Math.sin(i * 0.55) > 0 ? C.orangeL : C.redL;
      T(i, 0, heat); if (i % 3 < 1) T(i, 1.2, C.red);
    }
    for (const s of [-1, 1]) {
      polygon(T, [[14, s * 3.2], [20, s * 5.2], [24, s * 3.3], [29, s * 4.4], [24, s * 1.9]], C.red);
      T(34, s * 2.5, C.orangeL); T(43, s * 2.1, C.goldL);
    }
  } },
  "frost-lightsword": { two: -5, draw(T) {
    // An energy lightsword: crystal crossguard, twin rails and a deliberately overbright core.
    wraps(T, -7.4, 2.1, 0.72); band(T, -8, 0.55, 1.05, C.cyan, C.blue);
    polygon(T, [[1.5, -1.4], [3.8, -5.8], [5.2, -2.2], [7.1, -4.2], [6.2, 0], [7.1, 4.2], [5.2, 2.2], [3.8, 5.8], [1.5, 1.4]], C.blue);
    polygon(T, [[2.4, -1], [4, -4], [5.1, -1.4], [6, 0], [5.1, 1.4], [4, 4], [2.4, 1]], C.cyan);
    ring(T, -2.6, 0, 1.5, C.cyan); T(-2.6, 0, C.goldL);
    for (let i = 6.2; i < 53; i += 0.3) {
      const u = (i - 6.2) / 46.8, w = u > 0.93 ? (1 - u) / 0.07 * 1.8 : 1.8;
      for (let k = -w; k <= w; k += 0.4) T(i, k, k < -0.55 ? C.white : k < 0.3 ? C.cyan : C.blue);
    }
    for (let i = 7; i < 51; i += 0.45) {
      T(i, -1.1, C.cyan); T(i, 0, C.white); T(i, 1.1, C.blue);
    }
    for (let i = 11; i < 49; i += 5.5) { T(i, -2.3, C.goldL); T(i, 2.3, C.goldL); }
    T(53, 0, C.white); T(54, 0, C.cyan);
  } },
  "shadow-katana": { two: -5, draw(T) {
    // A dramatic curved draw blade with a hooked tsuba, shadow saya and trailing ribbons.
    shaft(T, -10, 1.5, 1.1, C.dark, C.ink); wraps(T, -7.2, 2.6, 0.82); band(T, -7.9, 0.55, 1.1, C.violet, C.ink);
    ring(T, 2.9, 0, 4.2, C.ink); ring(T, 2.9, 0, 3.2, C.violet); T(2.9, 0, C.cyan);
    for (const s of [-1, 1]) {
      polygon(T, [[1.6, s * 2.2], [5.5, s * 5.5], [7.3, s * 4.2], [4.4, s * 1.4]], C.violet);
      T(5.2, s * 3.2, C.goldD);
    }
    for (let i = 4.4; i < 48; i += 0.3) {
      const u = (i - 4.4) / 43.6, curve = -7.4 * u * u, w = u > 0.87 ? (1 - u) / 0.13 * 1.7 : 1.7;
      for (let k = -w; k <= w; k += 0.4) T(i, curve + k, k < -0.6 ? C.silver : k < 0.35 ? C.violet : C.edge);
    }
    for (let i = 7; i < 45; i += 0.55) T(i, -4.8 * ((i - 4.4) / 43.6) ** 2, i % 3 ? C.cyan : C.violet);
    for (let i = 0; i < 5; i++) { T(-5.4 - i * 0.55, 1.3 + i * 1.25, i & 1 ? C.violet : C.ink); T(-5.2 - i * 0.55, -1.1 - i * 1.1, C.red); }
    T(47, -7.4, C.white); T(48, -7.6, C.cyan);
  } },
  "thunder-claymore": { two: -10, draw(T) {
    // A thick storm cleaver with a split guard, serrated spine and a visible lightning rune.
    wraps(T, -10.2, 2.4, 1.05); band(T, -10.9, 0.75, 1.45, C.gold, C.goldD);
    polygon(T, [[1.6, -3.1], [3.8, -7], [5.8, -4.5], [8.4, -8], [10.8, -3], [10.8, 3], [8.4, 8], [5.8, 4.5], [3.8, 7], [1.6, 3.1]], C.goldD);
    polygon(T, [[2.8, -2.2], [4.4, -5.4], [5.8, -3.3], [8.1, -5.7], [9.2, -2.2], [9.2, 2.2], [8.1, 5.7], [5.8, 3.3], [4.4, 5.4], [2.8, 2.2]], C.gold);
    ring(T, 5.5, 0, 1.6, C.blue); T(5.5, 0, C.cyan);
    // The blade itself breaks into a saw-toothed lightning silhouette instead of a straight sword.
    polygon(T, [[9, -4.4], [17, -5.6], [22, -3.2], [27, -4.7], [33, -2.7], [38, -3.8], [44, -1.7], [56, 0], [44, 1.7], [38, 3.8], [33, 2.7], [27, 4.7], [22, 3.2], [17, 5.6], [9, 4.4]], C.blue);
    polygon(T, [[10, -2.8], [18, -3.7], [23, -1.8], [28, -3.1], [33, -1.5], [39, -2.2], [46, -0.6], [53, 0], [46, 0.6], [39, 2.2], [33, 1.5], [28, 3.1], [23, 1.8], [18, 3.7], [10, 2.8]], (_, y) => y < -1 ? C.white : y < 0.6 ? C.silver : C.steel);
    for (const [x, y] of [[14, -2], [20, 2], [26, -1.6], [32, 1.8], [38, -1.2], [44, 1], [50, -0.4]]) {
      T(x, y, C.goldL); T(x + 1, y - 1, C.cyan); T(x + 2, y - 1.5, C.blue);
    }
    for (const s of [-1, 1]) polygon(T, [[3, s * 3], [9, s * 5.6], [12, s * 3], [8, s * 1.5]], C.blue);
  } },
  "starlight-rapier": { two: -3.5, draw(T) {
    // A showpiece dueling weapon: star guard, crescent cup and a needle blade with a light trail.
    wraps(T, -4.8, 1.9, 0.62); band(T, -5.6, 0.65, 1.1, C.gold, C.goldD);
    ring(T, 2.2, 0, 4.8, C.gold); ring(T, 2.2, 0, 3.5, C.cyan);
    polygon(T, [[-1, -2.6], [1.2, -6.2], [3.1, -2.3], [7, -4.2], [5.1, 0], [7, 4.2], [3.1, 2.3], [1.2, 6.2], [-1, 2.6]], C.goldL);
    for (let i = 5; i <= 54; i += 0.28) {
      T(i, 0, i < 35 ? C.silver : C.white);
      if (i < 48) T(i, -0.55, C.cyan);
      if (i < 36 && i % 5 < 2) T(i, 0.9, C.goldL);
    }
    for (const [x, y] of [[-6.2, 0], [-7.7, 0], [-6.9, -1.5], [-6.9, 1.5], [-5.7, -2.4], [-5.7, 2.4]]) T(x, y, C.goldL);
    T(55, 0, C.white); T(56, 0, C.cyan); T(52, -1, C.goldL);
  } },
  dagger: { two: -3, draw(T) {
    wraps(T, -3.8, 2, 0.7); band(T, -4.3, 0.7, 1.15);
    polygon(T, [[2, -3.2], [3.3, -2], [3.3, 2], [2, 3.2]], C.gold);
    polygon(T, [[3, -1.7], [8, -2.2], [14, 0], [8, 1.9], [3, 1.7]], (_, y) => y < -0.7 ? C.white : y < 0.25 ? C.silver : C.edge);
    for (let i = 4; i < 11; i += 0.5) T(i, 0, C.steel);
    T(-4.3, 0, C.cyan);
  } },
  staff: { two: -9, draw(T) {
    shaft(T, -25, 34, 0.9, C.wood, C.woodD);
    wraps(T, -12, 5, 0.95);
    for (const at of [-25, -21, 28, 32]) band(T, at, 1.8, 1.35, C.goldL, C.goldD);
    for (const at of [-23, 29]) {
      T(at, -1.4, C.goldL); T(at + 1.2, 1.4, C.gold);
    }
  } },
  lance: { two: -11, draw(T) {
    shaft(T, -21, 43, 0.65, C.wood, C.woodD); wraps(T, -10, 3, 0.85);
    for (const at of [-21, 29, 35, 41]) band(T, at, 1.1, 1.2);
    polygon(T, [[42, -1.5], [49, -3.5], [62, 0], [49, 3.5], [42, 1.5]], (_, y) => y < -0.7 ? C.white : y < 0.4 ? C.silver : C.edge);
    shaft(T, 44, 59, 0.3, C.goldL, C.gold);
    // A short split pennon at the socket, tapering away from the shaft.
    polygon(T, [[40, 1], [37, 7.5], [32, 8], [34, 5], [30, 6], [36, 1]], C.red);
    polygon(T, [[39, 1.2], [36, 6], [33, 6.8], [36.8, 1.2]], C.redL);
  } },
  "holy-sword": { two: -5, draw(T) {
    wraps(T, -6.5, 2.6, 1); ring(T, -7.4, 0, 1.7, C.gold); T(-7.4, 0, C.cyan);
    polygon(T, [[2, -1.8], [0, -7.8], [4, -5.8], [5.5, -2], [5.5, 2], [4, 5.8], [0, 7.8], [2, 1.8]], C.gold);
    for (const s of [-1, 1]) for (let k = 2; k <= 6; k += 0.4) T(3 - k * 0.35, s * k, C.goldL);
    polygon(T, [[5, -3.1], [28, -3.1], [40, 0], [28, 3.1], [5, 3.1]], (_, y) => y < -1.4 ? C.white : y < 1 ? C.silver : C.blue);
    shaft(T, 8, 32, 0.4, C.goldL, C.gold);
    for (const at of [12, 19, 26]) for (const s of [-1, 1]) T(at, s * 1.5, C.gold);
    ring(T, 4, 0, 1.5, C.goldL); T(4, 0, C.cyan);
  } },
  katana: { two: -5, draw(T) {
    wraps(T, -7, 2.5, 0.85); band(T, -7.6, 0.6, 1.1);
    band(T, 2.6, 0.7, 3.2, C.goldL, C.goldD);
    for (let i = 3.4; i < 36; i += 0.35) {
      const u = (i - 3.4) / 32.6, curve = -2.8 * u * u, width = u > 0.86 ? (1 - u) / 0.14 * 1.7 : 1.7;
      for (let k = -width; k <= width; k += 0.4) T(i, curve + k, k < -0.6 ? C.white : k < 0.5 ? C.silver : C.edge);
    }
    T(-7, -1.1, C.redL);
  } },
  "war-mace": { two: -5, draw(T) {
    shaft(T, -8, 23, 0.9, C.steel, C.edge); wraps(T, -7, 5, 1); band(T, -8.5, 1.1, 1.5);
    polygon(T, [[20, -3], [23, -6.4], [28, -6.4], [32, -2], [32, 2], [28, 6.4], [23, 6.4], [20, 3]], (_, y) => y < -2 ? C.silver : y < 1.5 ? C.steel : C.edge);
    for (const s of [-1, 1]) {
      polygon(T, [[22, s * 4], [23.5, s * 10], [25, s * 5]], C.silver);
      polygon(T, [[27, s * 5], [29.5, s * 9], [29.5, s * 3]], C.edge);
    }
    polygon(T, [[30, -1.7], [35, 0], [30, 1.7]], C.silver);
    band(T, 24, 1, 6, C.gold, C.goldD); T(25, -3, C.goldL);
  } },
  kusanagi: { two: -7, draw(T) {
    // 云从剑 / 天丛云剑: a straight tsurugi, a cloud-lobed guard, a dark storm-steel blade with one pale edge.
    wraps(T, -7.6, 2, 0.85); band(T, -8.2, 0.6, 1.1);
    ring(T, -8.8, 0, 1.25, C.gold); T(-8.8, 0, C.jade); T(-8.8, -0.6, C.goldL);
    polygon(T, [[2.2, -3.6], [3.6, -2.4], [3.6, 2.4], [2.2, 3.6]], C.gold);
    for (const dy of [-2.8, 0, 2.8]) polygon(T, [[2.7, dy - 1.1], [4.7, dy - 0.35], [4.7, dy + 0.35], [2.7, dy + 1.1]], C.goldL);
    for (let i = 4; i < 37; i += 0.35) {
      const u = (i - 4) / 33, w = u > 0.9 ? (1 - u) / 0.1 * 1.9 : 1.9;
      for (let k = -w; k <= w; k += 0.4) T(i, k, k < -1.2 ? C.white : k < -0.25 ? C.silver : k < 0.5 ? C.steel : C.edge);
    }
    for (let i = 5; i < 35; i += 0.7) T(i, 0, C.cyan);
    // a cloud notch cut into each shoulder near the guard
    for (const dy of [-1.6, 1.6]) for (let i = 4.4; i < 7; i += 0.3) T(i, dy, C.jade);
    T(-7.2, -1.2, C.cyan);
  } },
  totsuka: { two: -9, draw(T) {
    // 十拳剑: a broad, long straight blade, a red-wrapped grip, a dragon-head guard and a bronze pommel.
    wraps(T, -10, 2.4, 0.95); band(T, -10.6, 0.6, 1.3, C.bronze, C.bronzeD);
    polygon(T, [[-11.4, -1.5], [-9.4, 0], [-11.4, 1.5]], C.gold);
    polygon(T, [[2.4, -5], [4.2, -3.2], [4.2, 3.2], [2.4, 5]], C.gold);
    polygon(T, [[3, -4.2], [4, -2.4], [4, 2.4], [3, 4.2]], C.goldD);
    for (let i = 4.6; i < 46; i += 0.35) {
      const u = (i - 4.6) / 41, w = u > 0.9 ? (1 - u) / 0.1 * 2.4 : 2.4;
      for (let k = -w; k <= w; k += 0.4) T(i, k, k < -1.5 ? C.white : k < -0.3 ? C.silver : k < 0.8 ? C.steel : C.edge);
    }
    for (let i = 6; i < 44; i += 0.5) T(i, 0, C.violet);
    for (const dy of [-1.4, 1.4]) for (let i = 5; i < 8.6; i += 0.3) T(i, dy, C.violet);
    T(-9.7, 0, C.redL);
  } },

  "blood-butterfly": { two: -4.6, draw(T) {
    // 血蝶之刃: a rising crimson single edge, a butterfly guard and a red tassel.
    wraps(T, -7.6, 2.2, 0.82);
    band(T, -8.2, 0.6, 1.1, C.gold, C.goldD);
    ring(T, -8.7, 0, 1.3, C.gold); T(-8.7, 0, C.bloodL);
    for (const s of [-1, 1]) {
      polygon(T, [[2.2, s * 1.2], [4.2, s * 5.4], [6.2, s * 6.4], [7.2, s * 3.8], [5.4, s * 1.8]], C.bloodD);
      polygon(T, [[2.6, s * 1.5], [4.3, s * 4.6], [5.7, s * 5.3], [6.4, s * 3.6], [5.1, s * 2.0]], C.blood);
      T(5.9, s * 4.4, C.goldL); T(4.8, s * 3.1, C.bloodL); T(6.9, s * 3.9, C.gold);
    }
    band(T, 2.1, 0.8, 1.7, C.gold, C.goldD);
    for (let i = 5.4; i < 44; i += 0.32) {
      const u = (i - 5.4) / 38.6, curve = -4.4 * u * u, w = u > 0.86 ? (1 - u) / 0.14 * 2.2 : 2.2;
      for (let k = -w; k <= w; k += 0.4) T(i, curve + k, k < -1.3 ? C.bloodL : k < -0.2 ? C.blood : k < 1.0 ? C.bloodD : C.ink);
    }
    for (let i = 7; i < 41; i += 0.55) T(i, -4.4 * ((i - 5.4) / 38.6) ** 2, i % 3 < 1.4 ? C.gold : C.goldD);
    for (const s of [-1, 1]) { T(12, s * 2.2, C.gold); T(13, s * 2.8, C.goldL); T(14, s * 2.0, C.bloodL); }
    T(43.6, -4.4, C.white); T(44, -4.5, C.bloodL);
    for (let i = 0; i < 4; i++) T(-9.3 - i * 0.5, 1.2 + i * 1.1, i & 1 ? C.bloodL : C.blood);
  } },
  "ghost-blade": { two: -5, draw(T) {
    // 幽影剑: a lacquer grip, a crescent silver guard, and a straight blade that is mostly hollow, with a
    // broken ghost edge floating above the steel.
    shaft(T, -8, 2.2, 1.0, C.dark, C.ink);
    wraps(T, -6.6, 2.4, 0.86);
    band(T, -7.2, 0.6, 1.15, C.silver, C.edge);
    ring(T, -7.8, 0, 1.35, C.silver); T(-7.8, 0, C.ghost);
    for (const s of [-1, 1]) {
      polygon(T, [[2.2, s * 1.0], [3.4, s * 5.0], [6.2, s * 7.6], [5.4, s * 4.0], [4.2, s * 1.4]], C.silver);
      polygon(T, [[3.0, s * 1.2], [4.0, s * 4.2], [5.2, s * 6.0], [4.9, s * 3.4], [4.2, s * 1.6]], C.edge);
      T(6.1, s * 7.4, C.ghost);
    }
    band(T, 2.3, 0.7, 1.4, C.silver, C.edge);
    for (let i = 5; i < 41; i += 0.3) {
      const u = (i - 5) / 36, w = u > 0.9 ? (1 - u) / 0.1 * 1.9 : 1.9;
      for (let k = -w; k <= w; k += 0.4) T(i, k, k < -1.2 ? C.ghost : k < -0.3 ? C.white : k < 0.4 ? C.voidL : k < 1.2 ? C.void : C.edge);
    }
    for (let i = 7; i < 37; i += 1.2) if (Math.round(i) % 5) T(i, -2.4, C.ghost);
    for (let i = 9; i < 35; i += 0.8) T(i, 0, i % 4 < 1.2 ? C.ghost : C.voidL);
    T(40.6, 0, C.white); T(41.4, 0, C.ghost);
  } },
  "demon-eye-greatsword": { two: -12, draw(T) {
    // 魔眼巨剑: black horns over the fist, an open eye in the guard and a jagged slab laced with a red seam.
    wraps(T, -11.4, 2.4, 1.1);
    band(T, -12.1, 0.7, 1.5, C.goldD, C.ink);
    band(T, 2.2, 0.8, 2.2, C.voidD, C.ink);
    for (const s of [-1, 1]) {
      polygon(T, [[2.6, s * 1.6], [1.6, s * 5.6], [-0.8, s * 7.6], [0.8, s * 4.2], [0.4, s * 2.0]], C.onyx);
      polygon(T, [[1.8, s * 2.0], [1.0, s * 4.8], [-0.2, s * 6.4], [0.4, s * 3.8], [0.8, s * 2.2]], C.voidL);
      T(-0.7, s * 7.3, C.goldD);
    }
    ring(T, 4.4, 0, 2.6, C.goldD); ring(T, 4.4, 0, 1.9, C.gold); T(4.4, 0, C.bloodL); T(4.4, 0.8, C.bloodD);
    polygon(T, [[6, -4.4], [12, -5.6], [17, -4.2], [23, -5.8], [29, -4.1], [35, -5.1], [41, -3.7], [54, 0], [41, 3.7], [35, 5.1], [29, 4.1], [23, 5.8], [17, 4.2], [12, 5.6], [6, 4.4]], C.void);
    polygon(T, [[7, -3.0], [13, -4.0], [18, -2.8], [24, -4.1], [30, -2.9], [36, -3.6], [42, -2.5], [50, 0], [42, 2.5], [36, 3.6], [30, 2.9], [24, 4.1], [18, 2.8], [13, 4.0], [7, 3.0]], (_, y) => y < -2.2 ? C.ghost : y < -0.8 ? C.voidL : y < 1.2 ? C.void : C.voidD);
    for (let i = 11; i < 50; i += 0.45) T(i, Math.sin(i * 0.7) * 1.5, i % 3 < 1.2 ? C.bloodL : C.blood);
    ring(T, 9.5, 0, 1.7, C.bloodD); ring(T, 9.5, 0, 1.0, C.blood); T(9.5, 0, C.goldL);
    T(53.4, 0, C.white); T(52, -0.6, C.bloodL);
  } },
  "skyvault-greatsword": { two: -11, draw(T) {
    // 天穹巨剑: gold dragon horns sweeping up the blade, a sky-blue heart and a gold spine under it.
    wraps(T, -10.4, 2.2, 1.05);
    band(T, -11, 0.7, 1.4, C.gold, C.goldD);
    polygon(T, [[-11.6, -1.6], [-9.4, 0], [-11.6, 1.6]], C.gold);
    band(T, 2.2, 0.8, 2.0, C.gold, C.goldD);
    for (const s of [-1, 1]) {
      polygon(T, [[3, s * 1.6], [6.4, s * 6.6], [8.4, s * 7.4], [10.6, s * 5.2], [7, s * 2.4]], C.gold);
      polygon(T, [[4, s * 1.8], [6.8, s * 5.6], [8.2, s * 6.2], [9.4, s * 4.8], [6.8, s * 2.6]], C.goldL);
      T(10.4, s * 5.0, C.goldD);
      for (let i = 0; i < 3; i++) T(8.4 + i * 1.2, s * (3.4 + i * 0.5), C.goldD);
    }
    polygon(T, [[3.4, -1.6], [5.2, 0], [3.4, 1.6]], C.cyan); T(4.4, 0, C.skyL);
    for (let i = 5; i < 56; i += 0.3) {
      const u = (i - 5) / 51, w = u > 0.9 ? (1 - u) / 0.1 * 3.4 : 3.4;
      for (let k = -w; k <= w; k += 0.4) T(i, k, k < -2.4 ? C.white : k < -1.2 ? C.silver : k < -0.2 ? C.sky : k < 0.9 ? C.skyD : k < 2.4 ? C.steel : C.gold);
    }
    for (let i = 7; i < 52; i += 0.5) { T(i, 0.2, C.skyL); if (i % 4 < 1) T(i, -0.2, C.white); }
    for (const at of [12, 22, 32, 42]) { T(at, -1.6, C.white); T(at + 1, -2.2, C.skyL); T(at + 2, -1.6, C.skyL); T(at + 1.5, -1.0, C.skyL); }
    T(55.4, 0, C.white); T(54, -0.8, C.skyL);
  } },
  "aurora-lightblade": { two: -4.4, draw(T) {
    // 极光光刃: a gold emitter with two prongs and a blade of light: white core, aqua shell, violet fringe.
    wraps(T, -6.4, 2.2, 0.72);
    band(T, -7, 0.5, 1.1, C.gold, C.goldD);
    ring(T, -7.6, 0, 1.3, C.gold); T(-7.6, 0, C.skyL);
    band(T, 2.0, 1.0, 1.9, C.gold, C.goldD);
    for (const s of [-1, 1]) {
      polygon(T, [[2.6, s * 1.2], [5.2, s * 4.4], [6.6, s * 3.6], [4.2, s * 1.0]], C.gold);
      T(5.4, s * 4.1, C.skyL); T(6.2, s * 3.8, C.cyan);
    }
    for (let i = 5.4; i < 46; i += 0.3) {
      const u = (i - 5.4) / 40.6, w = u > 0.9 ? (1 - u) / 0.1 * 1.8 : 1.8;
      // a symmetric blade: white heart, aqua shell, violet fringe (sampled out from the heart, so both
      // sides get the same pixels whatever the float error is)
      for (let q = 0.2; q <= w + 1e-6; q += 0.5) {
        const c = q < 0.45 ? C.white : q < 1.35 ? C.cyan : C.voidL;
        T(i, q, c); T(i, -q, c);
      }
    }
    for (let i = 9; i < 43; i += 3.2) { T(i, 1.1, C.energy); T(i, -1.1, C.energy); T(i + 1.4, 0, C.white); }
    T(45.6, 0, C.white); T(44.6, 0, C.energy); T(46.2, 0, C.cyan);
  } },
  "dragon-scale-sabre": { two: -7.4, draw(T) {
    // 龙鳞斩刀: a small dragon-head guard, a wide jade curved blade with a gold spine of scales and a tassel.
    wraps(T, -9.4, 2.2, 0.92);
    band(T, -10, 0.6, 1.25, C.gold, C.goldD);
    ring(T, -10.6, 0, 1.4, C.gold); T(-10.6, 0, C.scaleL);
    polygon(T, [[2.2, -3.0], [4.6, -4.2], [7.0, -2.6], [6.2, 0.4], [3.4, 2.6], [2.2, 3.0]], C.gold);
    polygon(T, [[3.0, -2.4], [4.8, -3.2], [6.0, -2.2], [5.4, -0.2], [3.6, 1.6], [3.0, 2.2]], C.goldL);
    T(6.6, -2.4, C.bloodL); T(4.4, -1.0, C.ink); T(4.4, 1.2, C.ink);
    for (let i = 6; i < 48; i += 0.3) {
      const u = (i - 6) / 42, curve = -5.4 * u * u, w = u > 0.88 ? (1 - u) / 0.12 * 3.2 : 3.2;
      for (let k = -w; k <= w; k += 0.4) T(i, curve + k, k < -2.2 ? C.white : k < -1.1 ? C.scaleL : k < 0.2 ? C.scale : k < 1.8 ? C.scaleD : C.goldD);
    }
    const bend = (i) => -5.4 * ((i - 6) / 42) ** 2;
    for (let i = 8; i < 44; i += 3.4) {
      const q = bend(i);
      T(i, q + 1.6, C.goldL); T(i + 1.2, q + 1.1, C.gold); T(i + 2.2, q + 1.7, C.gold);
      T(i + 0.6, q + 2.3, C.goldD); T(i + 1.7, q + 2.6, C.goldD);
      T(i + 1, q - 2.7, C.white); T(i + 1, q - 3.0, C.scaleL);
    }
    T(47.4, -5.4, C.white); T(46.6, -5.5, C.scaleL);
    for (let i = 0; i < 4; i++) T(-10.2 - i * 0.4, -1.4 - i * 0.9, i & 1 ? C.red : C.redL);
  } },
  rapier: { two: -3.5, draw(T) {
    wraps(T, -4, 2, 0.65); band(T, -5, 0.7, 1.1);
    ring(T, 2.6, 0, 3.3, C.gold); ring(T, -0.2, 1.2, 3.2, C.goldD);
    for (let i = -2; i < 2; i += 0.4) T(i, -3.2, C.goldL);
    for (let i = 4; i <= 38; i += 0.35) {
      T(i, 0, C.silver); if (i < 32) T(i, -0.5, C.white);
    }
    T(-4.5, 0, C.violet);
  } },
};

/** Thrown equipment is kept separate from the melee catalogue so its grip geometry can leave the hand. */
export const THROWN_SHAPES = {
  "hell-cannon": { two: -5, draw(T) {
    // Squared heavy barrel, brass rails, separate grip and a dark muzzle aperture.
    polygon(T,[[-8,-5],[19,-5],[23,-3],[23,3],[19,5],[-8,5]],C.ink);
    polygon(T,[[-7,-4],[18,-4],[21,-2],[21,2],[18,3],[-7,3]],C.steel);
    polygon(T,[[-6,-3],[16,-3],[18,-1],[-6,-1]],C.silver);
    polygon(T,[[19,-4],[24,-3],[24,3],[19,4]],C.edge);
    band(T,22,1.7,2.7,C.ink,C.dark);
    shaft(T,-6,18,0.6,C.blood,C.bloodD);
    for(const x of [-5,2,9,16]) band(T,x,1,4.2,C.gold,C.goldD);
    polygon(T,[[-3,3],[1,3],[0,9],[-4,9]],C.leather);
    polygon(T,[[-10,-3],[-7,-3],[-7,3],[-11,4]],C.red);
    T(18,-4,C.white); T(-6,-4,C.white);
  } },
  kunai: { two: -2.5, draw(T) {
    wraps(T, -4, 2.4, 0.65); ring(T, -6, 0, 1.8, C.steel); T(-7.8, 0, C.silver);
    band(T, 2.3, 0.5, 1.4, C.edge, C.ink);
    polygon(T, [[3, -1], [7.2, -3.1], [17, 0], [7.2, 3.1], [3, 1]], (_, y) => y < -0.25 ? C.steel : C.ink);
    polygon(T, [[3.5, -0.2], [7.2, -2.8], [17, 0], [7.2, 0.4]], C.silver);
    for (let i = 7; i < 16.5; i += 0.5) T(i, (17 - i) * -0.04, C.white);
  } },
  "powder-bomb": { draw(T) {
    wraps(T, -4, 2, 0.7); band(T, -4.2, 0.7, 1.2, C.gold, C.goldD);
    for (let x = 3; x <= 13; x += 0.4) for (let y = -5; y <= 5; y += 0.4) {
      const d = (x - 8) ** 2 / 26 + y * y / 25;
      if (d <= 1) T(x, y, y < -1 ? C.ink : y < 2 ? C.dark : C.edge);
    }
    band(T, 6.5, 1, 5.2, C.gold, C.goldD);
    for (let i = 0; i < 4; i++) T(13 + i * 0.8, -5 - i * 0.6, i & 1 ? C.gold : C.goldL);
  } },
  boomerang: { draw(T) {
    wraps(T, -4, 2, 0.7); band(T, -4.2, 0.7, 1.2, C.gold, C.goldD);
    for (let u = 0; u <= 1; u += 0.02) {
      const a = -0.75 + u * 1.5, r = 6 + u * 11, x = 3 + Math.cos(a) * r, y = Math.sin(a) * r;
      T(x, y, C.wood); T(x + 0.6, y - 0.4, C.goldL);
    }
    for (let i = 0; i < 5; i++) T(10 + i * 1.1, -2.5 + i * 0.35, C.silver);
  } },
  talisman: { draw(T) {
    // a slip of parchment pinched at one corner: one polygon so the rig's depth pass keeps the
    // cream face, the cinnabar stamp and the brush strokes together
    wraps(T, -3.4, 1.2, 0.6); band(T, -3.6, 0.6, 1.05, C.gold, C.goldD);
    polygon(T, [[2.6, -6], [10.6, -5], [11.6, 6], [3.6, 7]], (x, y) => {
      if (x > 10.4 || y > 5.7 || x < 3.2 || y < -5.4) return C.goldD;
      if (x > 8.3) return C.red;
      if (x > 5 && x < 7.5 && ((y > -1.9 && y < -1.2) || (y > 0.3 && y < 1.0))) return C.ink;
      if (y > -2.6 && y < 1.4 && x > 6.05 && x < 6.55) return C.ink;
      return C.goldL;
    });
  } },
  "flying-sword": { two: -2.4, draw(T) {
    // 一把尺长的小剑：缠柄、玉剑首、小金镡、短脊剑身，剑穗垂在柄后
    wraps(T, -3, 1.6, 0.6);
    ring(T, -3.8, 0, 1.2, C.gold); T(-3.8, 0, C.jade);
    band(T, 1.6, 0.6, 2.2, C.gold, C.goldD);
    for (let i = 2.2; i <= 16.4; i += 0.4) {
      const u = (i - 2.2) / 14.2, width = u > 0.84 ? (1 - u) / 0.16 * 1.2 : 1.2;
      for (let k = -width; k <= width; k += 0.4) T(i, k, k < -0.45 ? C.white : k < 0.3 ? C.silver : C.edge);
    }
    for (let i = 3; i < 15.4; i += 0.6) T(i, 0, C.steel);
    for (let i = 0; i < 3; i++) T(-4.4 - i * 0.4, 1 + i * 1.1, i & 1 ? C.red : C.redL);
  } },
  "binding-silk": { draw(T) {
    // 掌中一握素绫：两端金箍，绫尾从掌后垂下来
    for (let x = -2.2; x <= 6.6; x += 0.4) for (let y = -2.2; y <= 2.2; y += 0.4) {
      const d = (x - 2.2) ** 2 / 20 + y * y / 4.6;
      if (d <= 1) T(x, y, y < -0.55 ? C.ivory : y < 0.7 ? C.ivoryD : C.woodD);
    }
    band(T, -2.4, 0.9, 2.5, C.gold, C.goldD);
    band(T, 5.5, 0.9, 2.5, C.gold, C.goldD);
    for (let i = 0; i < 2; i++) {
      for (let j = 0; j < 8; j++) {
        const x = -2.6 - j * 0.55 + Math.sin(j * 0.8 + i * 2) * 1.1, y = (i ? -1.4 : 1.6) + j * 0.9;
        T(x, y, j & 1 ? C.ivoryD : C.ivory);
        if (j % 3 === 0) T(x, y + 0.5, C.goldD);
      }
    }
  } },
  "soul-bell": { draw(T) {
    // 铜铃：环钮、钟身、金口沿、铃舌与红穗，铜绿斑落在钟腹
    ring(T, -2.2, 0, 1.3, C.bronze); T(-2.2, 0, C.goldL);
    shaft(T, -1.4, 0.4, 0.8, C.bronze, C.bronzeD);
    polygon(T, [[0.6, -3], [3.6, -2.6], [7.4, -4.6], [8.4, 0], [7.4, 4.6], [3.6, 2.6], [0.6, 3]], (x, y) => {
      if (y > 3.4 || y < -3.4) return C.bronzeD;
      if (x > 6.8) return C.patinaD;
      if (y < -1.6) return C.bronze;
      if (y > 1.8) return C.bronzeD;
      return x > 4 ? C.patina : C.bronze;
    });
    band(T, 7.5, 1.1, 4.9, C.gold, C.goldD);
    T(8.9, 0, C.goldL); T(7.2, 0, C.goldD);
    for (let i = 0; i < 4; i++) T(-1.4 - i * 0.4, -2.6 - i * 0.9, i & 1 ? C.red : C.redL);
  } },
  "pear-needles": { draw(T) {
    // 指间三根细针，针身藏在袖口的缠布里，针尖一点白
    band(T, -1.2, 2, 2.4, C.blue, C.edge);
    for (let k = -2; k <= 2; k += 0.4) T(0.4, k, C.wrap);
    for (const dy of [-2.2, 0, 2.2]) {
      for (let i = 1.4; i <= 13; i += 0.35) T(i, dy, i > 11.4 ? C.white : i > 5 ? C.silver : C.steel);
      T(13.2, dy, C.white);
      T(13.6, dy, C.white);
      T(2.4, dy, C.rose);
    }
  } },
};

/** The weapon classes the armory groups its actions by. */
export const WEAPON_CLASSES = Object.freeze([
  { id: "melee", label: "近战武器", name: "Melee" },
  { id: "thrown", label: "投掷武器", name: "Thrown" },
]);

/** Every selectable weapon: melee first, then thrown. `fx` is the dedicated action for each one. */
export const ARMORY = Object.freeze([
  { id: "blood-cleaver", label: "血焰斩铁剑", name: "Bloodsteel cleaver", fx: "dnf/overdrive-slash", tip: 52, family: "slam", drop: "dnf/blood-cleaver", class: "melee", theme: "dnf", tags: ["dnf"] },
  { id: "chain-blade", label: "锁影刃", name: "Chainshade blade", fx: "dnf/chain-cut", tip: 43, family: "sweep", drop: "dnf/chain-blade", class: "melee", theme: "dnf", tags: ["dnf"] },
  { id: "sword", label: "长剑", name: "Sword", fx: "melee/sword-slash", tip: 28, family: "sweep", drop: "weapons/sword", class: "melee" },
  { id: "dagger", label: "匕首", name: "Dagger", fx: "melee/dagger-flurry", tip: 14, family: "thrust", drop: "weapons/dagger", class: "melee" },
  { id: "staff", label: "金箍棍", name: "Banded staff", fx: "melee/staff-combo", tip: 34, family: "sweep", drop: "weapons/staff", class: "melee" },
  { id: "spear", label: "长矛", name: "Spear", fx: "melee/spear-sweep", tip: 47, family: "sweep", drop: "weapons/spear", class: "melee" },
  { id: "lance", label: "骑士长枪", name: "Knight lance", fx: "melee/lance-thrust", tip: 62, family: "thrust", drop: "weapons/lance", class: "melee" },
  { id: "holy-sword", label: "圣剑", name: "Holy sword", fx: "melee/holy-sword-cleave", tip: 40, family: "sweep", drop: "weapons/holy-sword", class: "melee" },
  { id: "katana", label: "太刀", name: "Katana", fx: "melee/katana-draw", tip: 36, family: "sweep", drop: "weapons/katana", class: "melee" },
  { id: "kusanagi", label: "云从剑", name: "Kusanagi", fx: "kami/ame-no-murakumo", tip: 36, family: "sweep", drop: "weapons/kusanagi", class: "melee" },
  { id: "totsuka", label: "十拳剑", name: "Totsuka", fx: "kami/susanoo-thunder", tip: 44, family: "sweep", drop: "weapons/totsuka", class: "melee" },
  { id: "blood-butterfly", label: "血蝶之刃", name: "Blood butterfly", fx: "melee/blood-butterfly-dance", tip: 44, family: "sweep", drop: "weapons/blood-butterfly", class: "melee" },
  { id: "ghost-blade", label: "幽影剑", name: "Ghostlight jian", fx: "melee/ghostlight-draw", tip: 42, family: "sweep", drop: "weapons/ghost-blade", class: "melee" },
  { id: "demon-eye-greatsword", label: "魔眼巨剑", name: "Demon-eye greatsword", fx: "melee/demon-eye-cleave", tip: 54, family: "slam", drop: "weapons/demon-eye-greatsword", class: "melee" },
  { id: "skyvault-greatsword", label: "天穹巨剑", name: "Skyvault greatsword", fx: "melee/skyvault-cleave", tip: 56, family: "slam", drop: "weapons/skyvault-greatsword", class: "melee" },
  { id: "aurora-lightblade", label: "极光光刃", name: "Aurora lightblade", fx: "melee/aurora-lightblade-combo", tip: 46, family: "sweep", drop: "weapons/aurora-lightblade", class: "melee" },
  { id: "dragon-scale-sabre", label: "龙鳞斩刀", name: "Dragon-scale sabre", fx: "melee/dragon-scale-sweep", tip: 48, family: "sweep", drop: "weapons/dragon-scale-sabre", class: "melee" },
  { id: "war-mace", label: "重钉锤", name: "War mace", fx: "melee/mace-crush", tip: 35, family: "slam", drop: "weapons/war-mace", class: "melee" },
  { id: "rapier", label: "刺剑", name: "Rapier", fx: "melee/rapier-lunge", tip: 38, family: "thrust", drop: "weapons/rapier", class: "melee" },
  { id: "kunai", label: "苦无", name: "Kunai", fx: "thrown/kunai-throw", tip: 18, family: "throw", drop: "weapons/kunai", class: "thrown" },
  { id: "powder-bomb", label: "火药弹", name: "Powder bomb", fx: "thrown/powder-bomb-throw", tip: 15, family: "throw", drop: "weapons/powder-bomb", class: "thrown" },
  { id: "boomerang", label: "回旋镖", name: "Boomerang", fx: "thrown/boomerang-throw", tip: 19, family: "throw", drop: "weapons/boomerang", class: "thrown" },
  { id: "talisman", label: "符箓", name: "Talisman", fx: "thrown/talisman-throw", tip: 17, family: "throw", drop: "weapons/talisman", class: "thrown" },
  { id: "flying-sword", label: "飞剑", name: "Flying sword", fx: "thrown/flying-sword-throw", tip: 17, family: "throw", drop: "weapons/flying-sword", class: "thrown" },
  { id: "binding-silk", label: "缚仙绫", name: "Binding silk", fx: "thrown/binding-silk-throw", tip: 9, family: "throw", drop: "weapons/binding-silk", class: "thrown" },
  { id: "soul-bell", label: "摄魂铃", name: "Soul bell", fx: "thrown/soul-bell-throw", tip: 10, family: "throw", drop: "weapons/soul-bell", class: "thrown" },
  { id: "pear-needles", label: "梨花针", name: "Pear-blossom needles", fx: "thrown/pear-needles-throw", tip: 13, family: "throw", drop: "weapons/pear-needles", class: "thrown" },
]);
export const MELEE_WEAPONS = Object.freeze(ARMORY.filter((w) => w.class === "melee"));
export const THROWN_WEAPONS = Object.freeze(ARMORY.filter((w) => w.class === "thrown"));
export const weaponOf = (id) => ARMORY.find((w) => w.id === id) ?? null;
export const meleeWeaponOf = (id) => MELEE_WEAPONS.find((w) => w.id === id) ?? null;
export const thrownWeaponOf = (id) => THROWN_WEAPONS.find((w) => w.id === id) ?? null;
