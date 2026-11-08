import { weaponDrop } from "./_lib.js";

export const { meta, drawBack, draw } = weaponDrop({
  id: "kunai", seed: 22,
  name: "Kunai, placed",
  desc: "A kunai floats ring-pommel up, point down: cold steel-blue light pools under it, the edge takes a sheen, and the seal turns while dark motes drift across the blade.",
  palette: ["#101826","#1c2c44","#2f4a6a","#4a7296","#77a4c4","#a8cce4","#dcf0fb","#ffffff"],
});
