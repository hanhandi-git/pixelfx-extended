import { weaponDrop } from "./_lib.js";
import { PAL } from "../../core/index.js";
export const { meta, draw, drawBack } = weaponDrop({
  id: "hammer", name: "Hammer, placed", seed: 101,
  desc: "A heavy steel hammer with engraved gilt head plates, inset ruby crest, bevelled corners and a banded leather handle.", palette: PAL.gold,
});
