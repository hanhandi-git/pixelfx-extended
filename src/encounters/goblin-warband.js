// A minion wave showcase on a single screen: three goblins close in, the hero's blows stagger them one by one,
// then a mage and a giant walk into the clearing. Every attack plays its own body performance and its own effect;
// every hit answers with the unit's flinch, and every kill is a death pose under a poof.
import * as map from "../fx/world/mossy-ruins.js";
import * as warrior from "../fx/mobs/goblin-warrior.js";
import * as archer from "../fx/mobs/goblin-archer.js";
import * as agile from "../fx/mobs/goblin-agile.js";
import * as mage from "../fx/mobs/goblin-mage.js";
import * as giant from "../fx/mobs/goblin-giant.js";
import * as warriorSlash from "../fx/mobs/goblin-warrior-slash.js";
import * as archerShot from "../fx/mobs/goblin-archer-shot.js";
import * as agileFlurry from "../fx/mobs/goblin-agile-flurry.js";
import * as mageBolt from "../fx/mobs/goblin-mage-bolt.js";
import * as giantQuake from "../fx/mobs/goblin-giant-smash.js";
import * as goblinHit from "../fx/impacts/goblin-hit.js";
import * as goblinDeath from "../fx/spawn/goblin-death.js";

export const meta = {
  name: "Goblin Warband",
  desc: "哥布林小队在苔藓废墟里围攻英雄：战士、弓手与敏捷哥布林先上，中刀后仰、退散成烟；随后法师与巨人踏入空地.",
  tags: ["encounter", "mobs", "goblin", "fantasy", "wave", "minion"],
  duration: 16.5,
  fps: 30,
  size: [320, 180],
  map: "world/mossy-ruins",
  mobs: ["mobs/goblin-warrior", "mobs/goblin-archer", "mobs/goblin-agile", "mobs/goblin-mage", "mobs/goblin-giant"],
};

const GROUND = map.map.groundY;
const W = 104, A = 150, R = 196, M = 150, G = 250;

/** A goblin's attack, the hero's answer on the next beat, and the kill under it. */
const duel = (id, x, attack, at, opts = {}) => [
  { at, type: "attack", fx: attack, x, y: GROUND, flip: true, unit: id },
  { at: at + 1.0, type: "hurt", target: id, dir: -1 },
  { at: at + 1.0, type: "attack", fx: goblinHit, x: x - 10, y: GROUND - 8, flip: true },
];

export const encounter = {
  w: 320,
  h: 180,
  duration: 16.5,
  map,
  hero: { x: 54, y: GROUND },
  mobs: [
    { id: "warrior", mod: warrior, x: W, y: GROUND, hp: 48, until: 7.6 },
    { id: "agile", mod: agile, x: A, y: GROUND, hp: 32, until: 7.2 },
    { id: "archer", mod: archer, x: R, y: GROUND, hp: 40, until: 7.9 },
  ],
  phases: [
    { at: 0.3, hp: 1, name: "Goblin Warband", sub: "WAVE I · THE SCOUTS", dur: 2.4 },
    { at: 7.1, hp: 1, name: "Second Wave", sub: "WAVE II · THE BIG ONE", dur: 2.4 },
    { at: 14.4, hp: 1, name: "Clearing", sub: "THE WOODS GO QUIET", dur: 1.8 },
  ],
  timeline: [
    // wave one: each scout steps in with its own tell, takes the counter, then the killing blow
    ...duel("warrior", W, warriorSlash, 1.4),
    { at: 2.9, type: "hurt", target: "warrior", dir: -1 },
    { at: 2.9, type: "attack", fx: goblinHit, x: W - 10, y: GROUND - 8, flip: true },
    { at: 3.0, type: "defeat", target: "warrior" },
    { at: 3.0, type: "attack", fx: goblinDeath, x: W, y: GROUND },

    ...duel("agile", A, agileFlurry, 3.5),
    { at: 5.1, type: "hurt", target: "agile", dir: -1 },
    { at: 5.1, type: "attack", fx: goblinHit, x: A - 10, y: GROUND - 8, flip: true },
    { at: 5.2, type: "defeat", target: "agile" },
    { at: 5.2, type: "attack", fx: goblinDeath, x: A, y: GROUND },

    ...duel("archer", R, archerShot, 5.6),
    { at: 7.0, type: "hurt", target: "archer", dir: -1 },
    { at: 7.0, type: "attack", fx: goblinHit, x: R - 10, y: GROUND - 8, flip: true },
    { at: 7.1, type: "defeat", target: "archer" },
    { at: 7.1, type: "attack", fx: goblinDeath, x: R, y: GROUND },

    // wave two arrives: the caster first, the brute last
    { at: 7.2, type: "summon", mod: mage, id: "mage", x: M, y: GROUND },
    { at: 7.9, type: "summon", mod: giant, id: "giant", x: G, y: GROUND },

    ...duel("mage", M, mageBolt, 8.2),
    ...duel("giant", G, giantQuake, 9.6),
    { at: 12.4, type: "attack", fx: mageBolt, x: M, y: GROUND, flip: true, unit: "mage" },
    { at: 13.3, type: "hurt", target: "mage", dir: -1 },
    { at: 13.3, type: "attack", fx: goblinHit, x: M - 10, y: GROUND - 8, flip: true },
    { at: 13.4, type: "defeat", target: "mage" },
    { at: 13.4, type: "attack", fx: goblinDeath, x: M, y: GROUND },

    { at: 13.5, type: "hurt", target: "giant", dir: -1 },
    { at: 13.5, type: "attack", fx: goblinHit, x: G - 12, y: GROUND - 10, flip: true },
    { at: 13.9, type: "defeat", target: "giant" },
    { at: 13.9, type: "attack", fx: goblinDeath, x: G, y: GROUND },
  ],
};
