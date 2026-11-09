import { weaponDrop } from "./_lib.js";

export const { meta, drawBack, draw } = weaponDrop({
  id: "katana", seed: 17,
  name: "Katana, placed",
  desc: "A curved steel katana with a scrollwork basket guard, carved glyphs, banded leather grip and two thin crimson tassels.",
  palette: ["#151226","#2a2246","#4a3a72","#6f589a","#a183c4","#cbb3e0","#efe4f6","#ffffff"],
});
