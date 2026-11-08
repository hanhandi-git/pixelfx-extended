// A sheltered home clearing, with six distinct facilities behind a continuous walking strip.
import { fit, hex, mix, rand, TAU } from "../../core/index.js";
import { bake, blit, sky, ridge, foliage } from "./_lib.js";
import { WOOD, STONE, FIRE, boards, flame, lantern, smoke, street } from "./_settlement.js";

export const meta = {
  name: "Starter Camp",
  desc: "初始营地：耕地、床、篝火、储物柜、圣像与传送门。A forest refuge with planted furrows, a canvas shelter, a glowing hearth, a guardian shrine and a rippling portal.",
  tags: ["map", "camp", "home", "farm", "bed", "campfire", "storage", "statue", "portal", "初始营地", "耕地", "床", "篝火", "储物柜", "圣像", "传送门", "fantasy", "loop"],
  kind: "map", size: [320, 180], origin: [0, 0], duration: 12, loop: true, fps: 30, bg: "dark",
  options: { palette: ["#142327", "#233b36", "#365340", "#527452", "#7b9866", "#a7b982", "#d4cd9a", "#f4dfae"], seed: 1 },
};

export const map = {
  groundY: 150, bounds: [8, 312], walk: [[8, 312]], platforms: [],
  spawns: { hero: [132, 150], mobs: [[184, 150], [246, 150]], boss: [284, 150] },
  arena: { x0: 8, x1: 312, groundY: 150 },
};

const D = meta.duration, BLUE = ["#1b2940", "#294c6b", "#347c9b", "#66c8ca", "#b8f0dc"].map(hex);

function shelter(p) {
  p.ellipse(56, 132, 41, 4, WOOD[0]);
  for (const x of [17, 91]) {
    p.rect(x, 76, 3, 56, WOOD[1]); p.rect(x, 76, 1, 54, WOOD[4]);
  }
  p.poly([[12, 95], [35, 64], [79, 67], [96, 96]], WOOD[0]);
  p.poly([[13, 93], [35, 65], [56, 67], [48, 94]], hex("#c6b47b"));
  p.poly([[56, 67], [79, 68], [95, 94], [48, 94]], hex("#8c8e68"));
  p.line(35, 65, 56, 67, hex("#eee0aa"));
  p.line(56, 68, 49, 91, hex("#d1c28b"));
  p.poly([[74, 79], [80, 80], [84, 86], [77, 85]], hex("#aaab79"));
  for (let i = 0; i < 4; i++) p.px(53 - i, 75 + i * 4, WOOD[2]);
  for (let x = 16; x < 95; x += 5) p.line(x, 94, x + 2, 96, WOOD[3]);
  p.line(17, 88, 8, 133, WOOD[4]); p.line(91, 90, 101, 131, WOOD[3]);
  // The bed has a headboard, raised mattress, pale pillow and folded blue blanket.
  boards(p, 25, 116, 51, 12);
  p.rect(26, 108, 4, 24, WOOD[1]); p.rect(27, 107, 3, 2, WOOD[4]);
  p.rect(72, 118, 3, 14, WOOD[1]);
  p.rect(30, 115, 43, 5, hex("#e1cfa5"));
  p.rect(31, 112, 12, 5, hex("#f2e5bc")); p.rect(32, 112, 10, 1, hex("#fff2cb"));
  p.rect(45, 115, 26, 10, BLUE[1]); p.rect(45, 115, 26, 3, BLUE[3]);
  p.rect(46, 119, 24, 1, BLUE[2]); p.rect(65, 118, 2, 7, BLUE[2]);
  // A tall double-door cabinet, rather than a chest, with a visible shelf and metal fittings.
  boards(p, 101, 87, 25, 43);
  p.rect(99, 84, 29, 4, WOOD[1]); p.rect(100, 84, 27, 1, WOOD[4]);
  p.rect(103, 90, 21, 9, WOOD[0]); p.rect(103, 98, 21, 2, WOOD[4]);
  for (const [x, c] of [[105, BLUE[2]], [112, FIRE[2]], [119, STONE[3]]]) {
    p.rect(x, 92, 3, 6, c); p.rect(x + 1, 91, 1, 1, STONE[4]);
  }
  p.rect(113, 101, 1, 26, WOOD[0]);
  p.rect(109, 112, 2, 3, STONE[4]); p.rect(116, 112, 2, 3, STONE[4]);
  p.rect(101, 128, 3, 4, WOOD[0]); p.rect(123, 128, 3, 4, WOOD[0]);
}

function farm(p, C) {
  p.poly([[17, 132], [84, 132], [94, 147], [9, 147]], WOOD[0]);
  for (let row = 0; row < 3; row++) {
    const y = 134 + row * 4, left = 17 - row * 2, width = 66 + row * 5;
    p.rect(left, y, width, 3, WOOD[2]); p.rect(left, y + 2, width, 1, WOOD[1]);
    p.rect(left, y, width, 1, WOOD[3]);
    for (let col = 0; col < 8; col++) {
      const x = left + 5 + col * (7.5 + row * 0.3);
      p.line(x, y, x, y - 4, C[4]);
      p.line(x, y - 2, x - 2, y - 4, C[3]);
      p.line(x, y - 2, x + 2, y - 3, C[5]);
      if (row === 2) p.line(x - 2, y - 3, x + 2, y - 3, C[4]);
      if ((row + col) % 4 === 0) p.px(x, y - 5, hex("#d7bc68"));
    }
  }
  // A small watering can and a hoe tie the planted rows to the camp.
  p.rect(96, 138, 7, 6, BLUE[1]); p.rect(97, 137, 5, 2, BLUE[3]);
  p.line(102, 141, 107, 137, BLUE[3]); p.line(95, 139, 93, 140, STONE[3]);
  p.line(10, 125, 13, 139, WOOD[4]); p.line(7, 125, 13, 125, STONE[3]);
}

function shrine(p) {
  p.ellipse(222, 139, 22, 4, WOOD[0]);
  p.rect(205, 136, 34, 4, STONE[1]); p.rect(208, 131, 28, 5, STONE[2]);
  p.rect(208, 131, 28, 1, STONE[4]); p.rect(214, 125, 16, 6, STONE[2]);
  // A robed guardian with swept stone wings and hands around a gold votive.
  p.poly([[219, 100], [208, 93], [201, 86], [203, 100], [215, 113]], STONE[2]);
  p.poly([[225, 100], [236, 93], [242, 86], [240, 100], [229, 113]], STONE[1]);
  for (let i = 0; i < 3; i++) {
    p.line(204 + i * 3, 94 + i * 2, 214 + i, 106 + i * 2, STONE[3]);
    p.line(238 - i * 3, 94 + i * 2, 231 - i, 105 + i * 2, STONE[2]);
  }
  p.poly([[218, 99], [226, 99], [232, 126], [212, 126]], STONE[3]);
  p.poly([[219, 102], [221, 105], [217, 125], [214, 125]], STONE[4]);
  p.poly([[224, 103], [228, 124], [222, 124]], STONE[2]);
  p.circle(222, 94, 5, STONE[2]); p.rect(219, 91, 6, 7, STONE[4]);
  p.rect(223, 93, 3, 6, STONE[3]);
  p.line(216, 104, 221, 110, STONE[4]); p.line(228, 104, 224, 110, STONE[3]);
  p.poly([[222, 105], [225, 110], [222, 114], [219, 110]], FIRE[3]);
  p.arc(222, 93, 10, 1, Math.PI * 0.95, TAU + 0.1, FIRE[3]);
  for (const x of [207, 235]) { p.rect(x, 126, 2, 5, STONE[5]); p.px(x, 125, FIRE[3]); }
}

function build(C, seed) {
  return bake(320, 180, p => {
    sky(p, 320, 180, hex("#1a2a3b"), hex("#b8b28a"), { horizon: 116 });
    p.circle(166, 42, 12, hex("#e5d9ab"));
    p.poly([[0, 103], [29, 77], [63, 89], [111, 59], [153, 94], [205, 70], [262, 89], [294, 65], [320, 84], [320, 123], [0, 123]], hex("#455f60"));
    ridge(p, 320, 102, 12, "#3b5554", seed);
    ridge(p, 320, 117, 19, "#304d48", seed + 8);
    const forest = [C[0], mix(C[1], C[2], 0.4), C[2], mix(C[2], C[3], 0.4), C[3]];
    for (let i = 0; i < 9; i++) {
      const x = 7 + i * 40, y = 87 + rand(seed, i, 1) * 14;
      p.poly([[x - 3, 127], [x - 1, y], [x + 2, y - 5], [x + 4, 127]], C[1]);
      p.line(x, y + 11, x - 13, y - 2, C[1]);
      foliage(p, x - 8, y - 3, 23, 12, forest, seed + i, 5);
      foliage(p, x + 9, y + 3, 19, 10, forest, seed + i + 20, 4);
    }
    p.rect(0, 119, 320, 31, C[1]); p.rect(0, 128, 320, 22, C[2]);
    for (let x = 6; x < 320; x += 17) {
      p.rect(x, 113, 2, 17, WOOD[1]); p.px(x, 112, WOOD[3]);
      p.rect(x, 120, 16, 2, WOOD[2]);
    }
    // A worn earth path remains quieter than the facilities.
    p.poly([[129, 130], [180, 130], [200, 150], [101, 150]], mix(C[2], WOOD[3], 0.55));
    shelter(p); farm(p, C); shrine(p);
    p.ellipse(161, 140, 18, 4, WOOD[0]);
    for (let i = 0; i < 10; i++) {
      const a = i / 10 * TAU;
      p.ellipse(161 + Math.cos(a) * 13, 139 + Math.sin(a) * 3, 3, 2, STONE[i % 2 ? 2 : 3]);
    }
    p.line(153, 138, 170, 141, WOOD[3]); p.line(153, 141, 168, 137, WOOD[2]);
    // Portal stones have a dark reveal; the moving interior is drawn later.
    p.ellipse(281, 141, 22, 4, STONE[0]);
    p.ellipse(281, 112, 19, 30, STONE[0]); p.ellipse(281, 111, 17, 28, STONE[2]);
    p.ellipse(281, 111, 13, 24, BLUE[0]);
    for (let i = 0; i < 13; i++) {
      const a = i / 13 * TAU, x = 281 + Math.cos(a) * 16, y = 111 + Math.sin(a) * 27;
      p.line(x - Math.sin(a) * 2, y + Math.cos(a) * 2, x + Math.sin(a) * 2, y - Math.cos(a) * 2, STONE[0]);
      p.px(x - 1, y - 1, BLUE[3]);
    }
    p.rect(260, 141, 43, 3, STONE[2]); p.rect(259, 144, 45, 2, STONE[1]);
    street(p, C, seed, { grass: true });
  });
}

export function create(o) {
  const C = fit(o.palette, 8), seed = o.seed ?? 1, layer = build(C, seed);
  let t = 0;
  return {
    update(dt) { t += dt; },
    draw(p) {
      const u = (t % D) / D, ph = u * TAU;
      blit(p, layer);
      smoke(p, 161, 122, u, seed);
      flame(p, 161, 137, ph);
      lantern(p, 87, 99, ph);
      p.glow(222, 110, 14, FIRE[3], 0.1 + Math.sin(ph * 2) * 0.02);
      // Hard nested portal ellipses, a rotating glint and faint ripples across the opening.
      p.ellipse(281, 111, 11, 22, BLUE[1]); p.ellipse(281, 111, 8, 19, BLUE[2]);
      p.ellipse(282, 111, 6, 16, BLUE[0]);
      for (let i = 0; i < 4; i++) {
        const q = (u * 2 + i / 4) % 1, y = 93 + q * 36;
        const w = Math.sqrt(Math.max(0, 1 - ((y - 111) / 21) ** 2)) * 9;
        p.line(281 - w, y, 281 + w, y, BLUE[3], Math.sin(q * Math.PI) * 0.65);
      }
      for (let i = 0; i < 3; i++) {
        const a = ph * 2 + i / 3 * TAU, x = 281 + Math.cos(a) * 11, y = 111 + Math.sin(a) * 23;
        p.px(x, y, BLUE[4]); p.glow(x, y, 4, BLUE[3], 0.2);
      }
      p.glow(281, 115, 31, BLUE[2], 0.19 + Math.sin(ph * 2) * 0.025);
      p.glow(281, 145, 20, BLUE[3], 0.13);
      for (let i = 0; i < 8; i++) {
        const q = (u * 4 + i / 8) % 1, x = 160 + Math.sin(i * 2 + q * 5) * 8 * q;
        p.dot(x, 132 - q * 27, FIRE[3], Math.sin(q * Math.PI) * 0.75);
      }
    },
  };
}
