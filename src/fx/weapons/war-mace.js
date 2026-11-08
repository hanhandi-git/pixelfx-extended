import { weaponDrop } from "./_lib.js";

export const { meta, drawBack, draw } = weaponDrop({
  id: "war-mace", seed: 20,
  name: "War mace, placed",
  desc: "A studded war mace floats head-up, too heavy to believe: embers shed from the flanges, a hot ring turns on the floor and the shaft ticks a slow quarter turn.",
  palette: ["#20100c","#4a1c12","#8a3018","#c44c1c","#f07c2c","#ffb050","#ffe0a0","#ffffff"],
});
