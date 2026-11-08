import { weaponDrop } from "./_lib.js";

export const { meta, drawBack, draw } = weaponDrop({
  id: "talisman", seed: 25,
  name: "Talisman, placed",
  desc: "A paper talisman stands upright in vermilion light, its seal glowing: the slip flutters at one corner, cinnabar motes rise and a ward ring turns on the floor.",
  palette: ["#21080a","#4c1012","#8a1c1a","#c02c22","#e8502f","#ff8458","#ffc8a0","#fff0e0"],
});
