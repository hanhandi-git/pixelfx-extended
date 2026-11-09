import { weaponDrop } from "./_lib.js";
import { PAL } from "../../core/index.js";
export const { meta, draw, drawBack } = weaponDrop({
  id: "bow", name: "Bow, placed", seed: 101,
  desc: "A carved greenwood bow with gold leaf tracery, faceted inset stones, braided grip and a taut silver string.", palette: PAL.gold,
});
