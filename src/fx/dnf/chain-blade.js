import { ornateWeaponDrop } from "./_weapon-display.js";
import { CYAN } from "./_lib.js";
const item = ornateWeaponDrop({ id: "chain-blade", name: "Chainshade blade, placed", seed: 84,
  desc: "An obsidian hook blade with a silver cutting bevel, engraved cyan glyphs, a crescent scroll guard, faceted blue stones and seven articulated chain links ending in a crystal drop.", palette: CYAN });
export const meta = item.meta;
export const { draw, drawBack } = item;
