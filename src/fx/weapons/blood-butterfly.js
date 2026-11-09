import { weaponDrop } from "./_lib.js";

export const { meta, drawBack, draw } = weaponDrop({
  id: "blood-butterfly", seed: 30,
  name: "Blood butterfly, placed",
  desc: "A curved crimson blade with a butterfly-wing enamel guard, gold vine inlay, garnet pommel and split red tassels.",
  palette: ["#20080e", "#48101c", "#8a2034", "#c4364e", "#ef5c74", "#ff96a2", "#ffd0d4", "#ffffff"],
});
