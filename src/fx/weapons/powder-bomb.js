import { weaponDrop } from "./_lib.js";

export const { meta, drawBack, draw } = weaponDrop({
  id: "powder-bomb", seed: 23,
  name: "Powder bomb, placed",
  desc: "A dark powder bomb with engraved brass straps, inset gem, stepped metal faces and a braided burning fuse.",
  palette: ["#200c08","#4a140e","#8a2212","#c43a18","#f06224","#ff9440","#ffcc8a","#ffffff"],
});
