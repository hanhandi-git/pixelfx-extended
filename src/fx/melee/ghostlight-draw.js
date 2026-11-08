import { weaponAttack } from "./_weapons.js";
export const { meta, act, draw, drawBack } = weaponAttack({
  weapon: "ghost-blade", name: "Ghostlight draw cut", two: false, windup: 0.5, hits: [2 / 30], width: 4, seed: 42, duration: 1.7,
  desc: "A shadowless draw cut: the blade arrives as a white line and its echo a frame later, a hollow violet gap hangs where it passed and ghost motes stay behind.",
  palette: ["#141a2c", "#2a3450", "#4d6488", "#7f9cc4", "#b4d4ec", "#dff2ff", "#f4ffff", "#ffffff"],
});
