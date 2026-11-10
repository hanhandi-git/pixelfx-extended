// A square arcade-dungeon skill slot: recessed well, illustrated icon, key cap, a clockwise cooldown
// wedge and the pressed, cast, denied and no-mana states. The same slot backs hotbars and inventory grids.
import { skillSlot } from "./_dnf.js";

export const meta = {
  name: "Dungeon skill slot",
  desc: "A square hotbar slot in the arcade-dungeon HUD style: recessed well, illustrated icon, key cap, clockwise cooldown wedge, and pressed, cast, denied and no-mana states.",
  tags: ["ui", "skill", "slot", "hotbar", "cooldown", "hud", "dungeon", "loop"],
  size: [40, 40],
  origin: [20, 20],
  duration: 2.4,
  loop: true,
  fps: 30,
  bg: "dark",
  options: {
    icon: "fire", key: "K", glyph: "", tint: "", cooldown: 0, cdText: "", mana: true,
    pressed: false, selected: false, flash: false, deny: false, disabled: false, rarity: "", size: 32, seed: 3,
  },
};

export function draw(p, t, o) {
  const s = Math.max(12, Math.min(38, Math.round(o.size ?? 32)));
  skillSlot(p, -s / 2, -s / 2, s, o);
}
