import { weaponDrop } from "./_lib.js";

export const { meta, drawBack, draw } = weaponDrop({
  id: "rapier", seed: 21,
  name: "Rapier, placed",
  desc: "A duelist's rapier hangs point-down from its cup guard: a rose halo circles the needle blade, the star guard catches a sheen and petals of light drift from the seal.",
  palette: ["#1e1020","#3e1c3c","#702f60","#a84884","#d470a8","#f0a8cc","#ffe0ee","#ffffff"],
});
