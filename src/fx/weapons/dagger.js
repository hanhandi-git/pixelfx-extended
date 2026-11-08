import { weaponDrop } from "./_lib.js";

export const { meta, drawBack, draw } = weaponDrop({
  id: "dagger", seed: 12,
  name: "Dagger, placed",
  desc: "A short dagger floats hilt-down in a pocket of ochre light: the blade ticks a quarter turn each loop, glints crawl its edge and gold dust drifts up from the seal.",
  palette: ["#1c1408","#3a2a12","#6b4a1c","#a87828","#d8a840","#f2ce74","#fff0b8","#ffffff"],
});
