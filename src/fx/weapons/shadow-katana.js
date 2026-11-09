import { weaponDrop } from "./_lib.js";
import { PAL } from "../../core/index.js";
export const { meta, draw, drawBack } = weaponDrop({
  id: "shadow-katana", name: "Shadow Katana, placed", seed: 101,
  desc: "A deeply curved violet katana with carved runes, pierced scroll guard, dark braided grip and thin crimson ribbons.", palette: PAL.shadow,
});
