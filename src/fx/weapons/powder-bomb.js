import { weaponDrop } from "./_lib.js";

export const { meta, drawBack, draw } = weaponDrop({
  id: "powder-bomb", seed: 23,
  name: "Powder bomb, placed",
  desc: "A fused powder bomb hangs nose-down over a scorched seal: the fuse spits a spark, embers cling to its iron shell, and a hot ring pulses across the floor.",
  palette: ["#200c08","#4a140e","#8a2212","#c43a18","#f06224","#ff9440","#ffcc8a","#ffffff"],
});
