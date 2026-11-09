import { weaponDrop } from "./_lib.js";
import { PAL } from "../../core/index.js";
export const { meta, draw, drawBack } = weaponDrop({
  id: "greatsword", name: "Greatsword, placed", seed: 101,
  desc: "A broad steel greatsword with a carved gold guard, runic fuller, layered bevels and an inset stone above its braided two-hand grip.", palette: PAL.gold,
});
