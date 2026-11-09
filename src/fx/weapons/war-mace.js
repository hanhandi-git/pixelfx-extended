import { weaponDrop } from "./_lib.js";

export const { meta, drawBack, draw } = weaponDrop({
  id: "war-mace", seed: 20,
  name: "War mace, placed",
  desc: "A spiked steel mace with engraved gold head plates, a large faceted center gem and banded braided handle.",
  palette: ["#20100c","#4a1c12","#8a3018","#c44c1c","#f07c2c","#ffb050","#ffe0a0","#ffffff"],
});
