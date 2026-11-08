import { weaponAttack } from "./_weapons.js";
export const { meta, act, draw, drawBack } = weaponAttack({
  weapon: "demon-eye-greatsword", name: "Demon-eye cleave", two: true, windup: 0.62, hits: [6 / 30], width: 13, seed: 43, duration: 2.0,
  desc: "A corrupted greatsword comes over the top: the eye in its guard opens, the slab lands in a void ring, red seams climb the steel and dark shards rain.",
  palette: ["#170d1e", "#331840", "#5c2a66", "#8a3c86", "#b85c96", "#e08ab0", "#f8c8d8", "#ffffff"],
});
