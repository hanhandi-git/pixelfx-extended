import { weaponDrop } from "./_lib.js";

export const { meta, drawBack, draw } = weaponDrop({
  id: "flying-sword", seed: 26,
  name: "Flying sword, placed",
  desc: "A short jian floats point-up, jade pommel low: a green ribbon wraps the blade once, the point takes a hard glint and sword-qi motes stream from the seal.",
  palette: ["#0a1c16","#123a2c","#1e5c46","#2f8062","#4caa84","#86d4ae","#c8f4dc","#ffffff"],
});
