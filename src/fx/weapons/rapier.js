import { weaponDrop } from "./_lib.js";

export const { meta, drawBack, draw } = weaponDrop({
  id: "rapier", seed: 21,
  name: "Rapier, placed",
  desc: "A needle rapier with a pierced scrollwork cup guard, tiny star etchings and a faceted pommel over dark leather.",
  palette: ["#1e1020","#3e1c3c","#702f60","#a84884","#d470a8","#f0a8cc","#ffe0ee","#ffffff"],
});
