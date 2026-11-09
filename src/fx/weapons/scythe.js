import { weaponDrop } from "./_lib.js";
import { PAL } from "../../core/index.js";
export const { meta, draw, drawBack } = weaponDrop({
  id: "scythe", name: "Scythe, placed", seed: 101,
  desc: "A crescent silver scythe with gold ribs along the cutting head, a violet gem socket and an engraved wrapped shaft.", palette: PAL.gold,
});
