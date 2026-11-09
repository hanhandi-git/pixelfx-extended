import { weaponDrop } from "./_lib.js";

export const { meta, drawBack, draw } = weaponDrop({
  id: "holy-sword", seed: 16,
  name: "Holy sword, placed",
  desc: "An ivory-silver holy sword with a winged gilt guard, green stones, fine runes and a layered luminous cutting bevel.",
  palette: ["#1c1a20","#4a4438","#8a7448","#c8a860","#efd68a","#fff2c0","#fffbe8","#ffffff"],
});
