import { weaponDrop } from "./_lib.js";

export const { meta, drawBack, draw } = weaponDrop({
  id: "lance", seed: 15,
  name: "Knight lance, placed",
  desc: "A knight's lance floats point-up, tall as a door: a royal-blue halo rings the shaft, a sheen runs to the socket, the split pennon stirs and motes rise from the seal.",
  palette: ["#0b1226","#18264c","#2c4a86","#4772ba","#74a4e0","#b0d4f8","#e8f4ff","#ffffff"],
});
