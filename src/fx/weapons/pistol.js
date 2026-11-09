import { weaponDrop } from "./_lib.js";
import { PAL } from "../../core/index.js";
export const { meta, draw, drawBack } = weaponDrop({
  id: "pistol", name: "Pistol, placed", seed: 101,
  desc: "A compact engraved steel pistol with gold scroll inlay, a gem-set wood grip, stepped sight and an open dark bore.", palette: PAL.gold,
});
