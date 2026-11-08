import { weaponAttack } from "./_weapons.js";
export const { meta, act, draw, drawBack } = weaponAttack({
  weapon: "dragon-scale-sabre", name: "Dragon-scale sweep", two: false, windup: 0.46, hits: [4 / 30], width: 7, seed: 46, duration: 1.7,
  desc: "A dragon-scale sabre opens one wide jade crescent: scale-shaped sparks peel off its edge, gold glints ride the spine and a red tassel whips round the hilt.",
  palette: ["#0a2018", "#123c2c", "#1f6448", "#2f8c62", "#4cb884", "#8ee0b4", "#ccf6dc", "#ffffff"],
});
