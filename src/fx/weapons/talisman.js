import { weaponDrop } from "./_lib.js";

export const { meta, drawBack, draw } = weaponDrop({
  id: "talisman", seed: 25,
  name: "Talisman, placed",
  desc: "A folded parchment charm with a gilt border, cinnabar side band, raised seal stamp and dark branching calligraphy.",
  palette: ["#21080a","#4c1012","#8a1c1a","#c02c22","#e8502f","#ff8458","#ffc8a0","#fff0e0"],
});
