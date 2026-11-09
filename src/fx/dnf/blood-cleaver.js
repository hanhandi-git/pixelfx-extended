import { ornateWeaponDrop } from "./_weapon-display.js";
import { DNF } from "./_lib.js";
const item = ornateWeaponDrop({ id: "blood-cleaver", name: "Bloodsteel cleaver, placed", seed: 83,
  desc: "An engraved executioner blade with silver bevels, ruby enamel, gold acanthus inlay, a garnet wing guard and a crown pommel over a braided grip.", palette: DNF });
export const meta = item.meta;
export const { draw, drawBack } = item;
