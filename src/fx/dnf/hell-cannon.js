import { weaponDrop } from "../weapons/_lib.js";
import { DNF } from "./_lib.js";
const item = weaponDrop({ id: "hell-cannon", name: "Brass hellcannon, placed", seed: 85,
  desc: "A squared heavy barrel framed by brass straps, a red heat rail, a separate leather grip and a dark muzzle aperture.", palette: DNF });
export const meta = { ...item.meta, tags: [...item.meta.tags, "dnf"] };
export const { draw, drawBack } = item;
