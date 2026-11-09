import { weaponDrop } from "./_lib.js";

export const { meta, drawBack, draw } = weaponDrop({
  id: "dagger", seed: 12,
  name: "Dagger, placed",
  desc: "A compact silver dagger with a star-etched face, gem-set guard, tiny gilt pommel and a tightly braided leather grip.",
  palette: ["#1c1408","#3a2a12","#6b4a1c","#a87828","#d8a840","#f2ce74","#fff0b8","#ffffff"],
});
