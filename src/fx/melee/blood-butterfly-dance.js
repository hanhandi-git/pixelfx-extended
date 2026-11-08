import { weaponAttack } from "./_weapons.js";
export const { meta, act, draw, drawBack } = weaponAttack({
  weapon: "blood-butterfly", name: "Blood butterfly dance", two: false, windup: 0.42, hits: [3 / 30, 9 / 30], width: 6, seed: 41, duration: 1.6,
  desc: "Two crossing crimson cuts from a butterfly guard: rose petals scatter where the strokes cross, a gold trace hangs for a beat and the blade cools to ash.",
  palette: ["#240a12", "#4c1420", "#8a2438", "#c43a52", "#f0627a", "#ff9aa2", "#ffd8c8", "#ffffff"],
});
