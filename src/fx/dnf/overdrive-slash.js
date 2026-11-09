// A red-gold awakening cut: a heavy cross slash with a short afterimage and a floor seal.
import { weaponAttack } from "../melee/_weapons.js";
import { DNF } from "./_lib.js";

const attack = weaponAttack({
  weapon: "blood-cleaver",
  name: "Overdrive awakening slash",
  desc: "A two-beat awakening cut: the blade winds behind the shoulder, crosses the target in white heat, then leaves a red-gold seal and a delayed afterimage.",
  windup: 0.42,
  hits: [0.24, 0.58],
  width: 13,
  seed: 117,
  palette: DNF,
});

export const meta = { ...attack.meta, size: [224, 184], origin: [72, 116], options: { ...attack.meta.options, character: "dnf-ghost-slayer" }, tags: [...attack.meta.tags, "dnf", "awakening", "red-gold"] };
export const act = attack.act;
export const draw = attack.draw;
export const drawBack = attack.drawBack;
