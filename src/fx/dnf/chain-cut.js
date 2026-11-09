import { weaponAttack } from "../melee/_weapons.js";
import { CYAN } from "./_lib.js";

const cut = weaponAttack({ weapon: "chain-blade", name: "Chainshade crossing cut", windup: 0.32,
  desc: "The hooked saber draws a narrow cyan crescent, recoils at the wrist and crosses back through its own trailing chain sparks.",
  hits: [0.1, 0.42], width: 5, seed: 81, palette: CYAN });
export const meta = { ...cut.meta, tags: [...cut.meta.tags, "dnf", "chain"] };
export const { act, draw, drawBack } = cut;
