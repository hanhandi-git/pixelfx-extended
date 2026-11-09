import { weaponDrop } from "./_lib.js";

export const { meta, drawBack, draw } = weaponDrop({
  id: "sword", seed: 11,
  name: "Sword, placed",
  desc: "A silver longsword with a beveled cutting edge, gold vine inlay, faceted gems, wrapped grip and layered crossguard; every engraving is sampled from the held model.",
  palette: ["#0e1420","#1b2c44","#2f5478","#4d86ad","#7fc4e0","#bdeeff","#f2ffff","#ffffff"],
});
