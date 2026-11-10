// The bottom console of an arcade-dungeon HUD: a red life orb, a row of square skill slots over an action
// bar and an experience bar, and a blue mana orb. It is anchored at the bottom centre of the screen.
import { clamp, hex } from "../../core/index.js";
import { DNF, ORB_HP, ORB_MP, orb, skillSlot, layeredBar } from "./_dnf.js";

export const SLOT = 15, GAP = 2, SLOT_X = -59, SLOT_Y = -23;
/** The local rectangle of slot i, for hit-testing by the host. */
export const slotRect = (i) => ({ x: SLOT_X + i * (SLOT + GAP), y: SLOT_Y, w: SLOT, h: SLOT });

const SAMPLE = [
  { icon: "slash", key: "J" }, { icon: "fire", key: "K", cooldown: 0.6, cdText: "2" }, { icon: "frost", key: "L" },
  { icon: "bolt", key: "U", mana: false }, { icon: "mend", key: "I" }, { icon: "meteor", key: "O", flash: true }, { icon: "burst", key: "T" },
];

export const meta = {
  name: "Dungeon HUD console",
  desc: "The bottom console of an arcade-dungeon HUD: a liquid life orb, seven square skill slots with key caps and clockwise cooldowns, an action bar, an experience bar and a mana orb.",
  tags: ["ui", "hud", "hotbar", "orb", "health", "mana", "xp", "dungeon", "loop"],
  size: [200, 36],
  origin: [100, 34],
  duration: 2.4,
  loop: true,
  fps: 30,
  bg: "dark",
  options: { hp: 0.72, mp: 0.55, ap: 0.8, xp: 0.4, hpText: "79", mpText: "38", slots: SAMPLE, locked: false, seed: 2 },
};

const AP = ["#c8a45a"].map(hex), XP = ["#9ac83c"].map(hex);

export function draw(p, t, o) {
  // the console plate: a chamfered slab that the orbs sit into
  const plate = (inset, c) => p.poly([
    [-90 + inset, 0], [-90 + inset, -16], [-82 + inset, -25 + inset], [82 - inset, -25 + inset], [90 - inset, -16], [90 - inset, 0],
  ], c);
  plate(0, DNF.ink); plate(1, DNF.line); plate(2, DNF.win);
  p.rect(-80, -23, 160, 0.5, DNF.lineHi);
  p.rect(-88, 0, 176, 1, DNF.ink);

  orb(p, -76, -12, 11, o.hp ?? 1, ORB_HP, t, 1);
  orb(p, 76, -12, 11, o.mp ?? 1, ORB_MP, t, 4);
  if (o.hpText) p.text(String(o.hpText), -76, -14, hex("#fff0e6"), { align: "center", outline: DNF.ink });
  if (o.mpText) p.text(String(o.mpText), 76, -14, hex("#e6f4ff"), { align: "center", outline: DNF.ink });

  const slots = Array.isArray(o.slots) ? o.slots : [];
  for (let i = 0; i < 7; i++) {
    const s = slots[i] ?? { icon: "none" };
    skillSlot(p, SLOT_X + i * (SLOT + GAP), SLOT_Y, SLOT, o.locked ? { ...s, disabled: true, cooldown: 0, flash: false } : s);
  }
  const w = 7 * SLOT + 6 * GAP;
  layeredBar(p, SLOT_X, -6, w, 1, clamp(o.ap ?? 1), 1, { colors: AP });
  layeredBar(p, SLOT_X, -3, w, 2, clamp(o.xp ?? 0), 1, { colors: XP, cells: 10 });
}
