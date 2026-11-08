import { weaponDrop } from "./_lib.js";

export const { meta, drawBack, draw } = weaponDrop({
  id: "sword", seed: 11,
  name: "Sword, placed",
  desc: "A longsword hangs point-up in pale light: a slow bob over a turning floor seal, a sheen down the steel, ribbons of light circling the blade and motes climbing past it.",
  palette: ["#0e1420","#1b2c44","#2f5478","#4d86ad","#7fc4e0","#bdeeff","#f2ffff","#ffffff"],
});
