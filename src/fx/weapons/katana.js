import { weaponDrop } from "./_lib.js";

export const { meta, drawBack, draw } = weaponDrop({
  id: "katana", seed: 17,
  name: "Katana, placed",
  desc: "A drawn katana floats point-up with its saya gone: violet ribbons wind the curved blade, the tsuba's ring pulses, a sheen travels the edge and ash motes drift up.",
  palette: ["#151226","#2a2246","#4a3a72","#6f589a","#a183c4","#cbb3e0","#efe4f6","#ffffff"],
});
