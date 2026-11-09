import { weaponDrop } from "./_lib.js";
import { PAL } from "../../core/index.js";
export const { meta, draw, drawBack } = weaponDrop({
  id: "handle", name: "Handle, placed", seed: 101,
  desc: "A compact leather-wrapped handle with carved gold collars and a faceted inset pommel.", palette: PAL.gold,
});
