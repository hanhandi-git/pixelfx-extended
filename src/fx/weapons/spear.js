import { weaponDrop } from "./_lib.js";

export const { meta, drawBack, draw } = weaponDrop({
  id: "spear", seed: 14,
  name: "Spear, placed",
  desc: "An engraved spear with a faceted leaf head, gold center ridge, gem socket and layered collars over a patterned shaft.",
  palette: ["#0c1a1a","#163234","#24565a","#387f84","#5cb4b0","#9ce0d4","#dffcf2","#ffffff"],
});
