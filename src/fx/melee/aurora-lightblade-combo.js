import { weaponAttack } from "./_weapons.js";
export const { meta, act, draw, drawBack } = weaponAttack({
  weapon: "aurora-lightblade", name: "Aurora lightblade combo", two: false, windup: 0.38, hits: [3 / 30, 11 / 30], width: 5, seed: 45, duration: 1.8,
  desc: "An energy blade writes two thin arcs that outlive the hilt: each cut hangs as a rod of light, beads race back down it and the fringe cools to violet.",
  palette: ["#0d1c22", "#163c4a", "#22687a", "#3c9cb0", "#74d8e8", "#b8f4ff", "#e8feff", "#ffffff"],
});
