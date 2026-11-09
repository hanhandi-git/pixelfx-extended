import { ornateWeaponDrop } from "./_weapon-display.js";
import { DNF } from "./_lib.js";
const item = ornateWeaponDrop({ id: "hell-cannon", name: "Brass hellcannon, placed", seed: 85,
  desc: "An ornate brass cannon with engraved crimson plates, riveted collars, silver cooling fins, a cyan clockwork core, an open bore and a wrapped leather grip.", palette: DNF });
export const meta = item.meta;
export const { draw, drawBack } = item;
