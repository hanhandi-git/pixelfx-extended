import { weaponDrop } from "./_lib.js";
import { PAL } from "../../core/index.js";
export const { meta, draw, drawBack } = weaponDrop({
  id: "launcher", name: "Launcher, placed", seed: 101,
  desc: "A banded heavy launcher with silver cooling fins, brass scrollwork, a recessed crystal core and braided secondary grip.", palette: PAL.gold,
});
