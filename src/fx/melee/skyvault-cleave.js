import { weaponAttack } from "./_weapons.js";
export const { meta, act, draw, drawBack } = weaponAttack({
  weapon: "skyvault-greatsword", name: "Skyvault cleave", two: true, windup: 0.58, hits: [5 / 30], width: 12, seed: 44, duration: 1.9,
  desc: "A two-handed skyvault arc: a broad blue crescent sweeps through, clouds tear open along it, a gold spine flares at the contact and pale feathers drift down.",
  palette: ["#0e1c30", "#1c3a5c", "#2f6a9c", "#4c94c8", "#7fc8ff", "#b4e4ff", "#e4f8ff", "#ffffff"],
});
