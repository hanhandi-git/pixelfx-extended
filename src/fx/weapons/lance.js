import { weaponDrop } from "./_lib.js";

export const { meta, drawBack, draw } = weaponDrop({
  id: "lance", seed: 15,
  name: "Knight lance, placed",
  desc: "A long knight lance with a faceted point, etched gold socket, split crimson pennon, braided grip and gilded shaft collars.",
  palette: ["#0b1226","#18264c","#2c4a86","#4772ba","#74a4e0","#b0d4f8","#e8f4ff","#ffffff"],
});
