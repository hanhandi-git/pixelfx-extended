import { weaponDrop } from "./_lib.js";
import { PAL } from "../../core/index.js";
export const { meta, draw, drawBack } = weaponDrop({
  id: "claw", name: "Claw, placed", seed: 101,
  desc: "Three curved silver talons mounted on a gem-set gilt knuckle plate with stepped metal faces and carved borders.", palette: PAL.gold,
});
