import { weaponDrop } from "../weapons/_lib.js";
import { CYAN } from "./_lib.js";
const item = weaponDrop({ id: "chain-blade", name: "Chainshade blade, placed", seed: 84,
  desc: "A hooked black saber with pale cyan inlays, a silver edge and linked steel hanging behind its lacquered grip.", palette: CYAN });
export const meta = { ...item.meta, tags: [...item.meta.tags, "dnf"] };
export const { draw, drawBack } = item;
