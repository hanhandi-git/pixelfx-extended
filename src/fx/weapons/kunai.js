import { weaponDrop } from "./_lib.js";

export const { meta, drawBack, draw } = weaponDrop({
  id: "kunai", seed: 22,
  name: "Kunai, placed",
  desc: "A steel kunai with a hollow ring pommel, gold guard stone, engraved blade lozenge and fine crosswrapped grip.",
  palette: ["#101826","#1c2c44","#2f4a6a","#4a7296","#77a4c4","#a8cce4","#dcf0fb","#ffffff"],
});
