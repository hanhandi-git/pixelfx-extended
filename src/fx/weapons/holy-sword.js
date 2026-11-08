import { weaponDrop } from "./_lib.js";

export const { meta, drawBack, draw } = weaponDrop({
  id: "holy-sword", seed: 16,
  name: "Holy sword, placed",
  desc: "A wing-guarded holy blade hangs point-up in ivory light: gold arcs circle the tip, a slow sheen crosses the crossguard's inset and gold motes climb from the seal.",
  palette: ["#1c1a20","#4a4438","#8a7448","#c8a860","#efd68a","#fff2c0","#fffbe8","#ffffff"],
});
