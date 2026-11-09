import { weaponDrop } from "../weapons/_lib.js";
import { DNF } from "./_lib.js";
const item = weaponDrop({ id: "blood-cleaver", name: "Bloodsteel cleaver, placed", seed: 83,
  desc: "A broad clipped blade with cold silver facets, a deep blood-red fuller and a squared guard; red embers rise around its heavy silhouette.", palette: DNF });
export const meta = { ...item.meta, tags: [...item.meta.tags, "dnf"] };
export const { draw, drawBack } = item;
