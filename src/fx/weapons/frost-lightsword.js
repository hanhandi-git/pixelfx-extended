import { weaponDrop } from "./_lib.js";
import { PAL } from "../../core/index.js";
export const { meta, draw, drawBack } = weaponDrop({
  id: "frost-lightsword", name: "Frost Lightsword, placed", seed: 101,
  desc: "An icy energy sword with crystal diamond etchings, layered blue rails, a sculpted star guard and cold silver settings.", palette: PAL.ice,
});
