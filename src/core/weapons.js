// Authored high-density equipment and class metadata.
import { ORNATE_MELEE_SHAPES, ORNATE_THROWN_SHAPES } from "./ornate-weapons.js";
export const MELEE_SHAPES = ORNATE_MELEE_SHAPES;
export const THROWN_SHAPES = ORNATE_THROWN_SHAPES;

/** The weapon classes the armory groups its actions by. */
export const WEAPON_CLASSES = Object.freeze([
  { id: "melee", label: "近战武器", name: "Melee" },
  { id: "thrown", label: "投掷武器", name: "Thrown" },
]);

/** Every selectable weapon: melee first, then thrown. `fx` is the dedicated action for each one. */
export const ARMORY = Object.freeze([
  { id: "blood-cleaver", label: "血焰斩铁剑", name: "Bloodsteel cleaver", fx: "dnf/overdrive-slash", tip: 52, family: "slam", drop: "dnf/blood-cleaver", class: "melee", theme: "dnf", tags: ["dnf"] },
  { id: "chain-blade", label: "锁影刃", name: "Chainshade blade", fx: "dnf/chain-cut", tip: 43, family: "sweep", drop: "dnf/chain-blade", class: "melee", theme: "dnf", tags: ["dnf"] },
  { id: "sword", label: "长剑", name: "Sword", fx: "melee/sword-slash", tip: 28, family: "sweep", drop: "weapons/sword", class: "melee" },
  { id: "dagger", label: "匕首", name: "Dagger", fx: "melee/dagger-flurry", tip: 14, family: "thrust", drop: "weapons/dagger", class: "melee" },
  { id: "staff", label: "金箍棍", name: "Banded staff", fx: "melee/staff-combo", tip: 34, family: "sweep", drop: "weapons/staff", class: "melee" },
  { id: "spear", label: "长矛", name: "Spear", fx: "melee/spear-sweep", tip: 47, family: "sweep", drop: "weapons/spear", class: "melee" },
  { id: "lance", label: "骑士长枪", name: "Knight lance", fx: "melee/lance-thrust", tip: 62, family: "thrust", drop: "weapons/lance", class: "melee" },
  { id: "holy-sword", label: "圣剑", name: "Holy sword", fx: "melee/holy-sword-cleave", tip: 40, family: "sweep", drop: "weapons/holy-sword", class: "melee" },
  { id: "katana", label: "太刀", name: "Katana", fx: "melee/katana-draw", tip: 36, family: "sweep", drop: "weapons/katana", class: "melee" },
  { id: "kusanagi", label: "云从剑", name: "Kusanagi", fx: "kami/ame-no-murakumo", tip: 36, family: "sweep", drop: "weapons/kusanagi", class: "melee" },
  { id: "totsuka", label: "十拳剑", name: "Totsuka", fx: "kami/susanoo-thunder", tip: 44, family: "sweep", drop: "weapons/totsuka", class: "melee" },
  { id: "blood-butterfly", label: "血蝶之刃", name: "Blood butterfly", fx: "melee/blood-butterfly-dance", tip: 44, family: "sweep", drop: "weapons/blood-butterfly", class: "melee" },
  { id: "ghost-blade", label: "幽影剑", name: "Ghostlight jian", fx: "melee/ghostlight-draw", tip: 42, family: "sweep", drop: "weapons/ghost-blade", class: "melee" },
  { id: "demon-eye-greatsword", label: "魔眼巨剑", name: "Demon-eye greatsword", fx: "melee/demon-eye-cleave", tip: 54, family: "slam", drop: "weapons/demon-eye-greatsword", class: "melee" },
  { id: "skyvault-greatsword", label: "天穹巨剑", name: "Skyvault greatsword", fx: "melee/skyvault-cleave", tip: 56, family: "slam", drop: "weapons/skyvault-greatsword", class: "melee" },
  { id: "aurora-lightblade", label: "极光光刃", name: "Aurora lightblade", fx: "melee/aurora-lightblade-combo", tip: 46, family: "sweep", drop: "weapons/aurora-lightblade", class: "melee" },
  { id: "dragon-scale-sabre", label: "龙鳞斩刀", name: "Dragon-scale sabre", fx: "melee/dragon-scale-sweep", tip: 48, family: "sweep", drop: "weapons/dragon-scale-sabre", class: "melee" },
  { id: "war-mace", label: "重钉锤", name: "War mace", fx: "melee/mace-crush", tip: 35, family: "slam", drop: "weapons/war-mace", class: "melee" },
  { id: "rapier", label: "刺剑", name: "Rapier", fx: "melee/rapier-lunge", tip: 38, family: "thrust", drop: "weapons/rapier", class: "melee" },
  { id: "kunai", label: "苦无", name: "Kunai", fx: "thrown/kunai-throw", tip: 18, family: "throw", drop: "weapons/kunai", class: "thrown" },
  { id: "powder-bomb", label: "火药弹", name: "Powder bomb", fx: "thrown/powder-bomb-throw", tip: 15, family: "throw", drop: "weapons/powder-bomb", class: "thrown" },
  { id: "boomerang", label: "回旋镖", name: "Boomerang", fx: "thrown/boomerang-throw", tip: 19, family: "throw", drop: "weapons/boomerang", class: "thrown" },
  { id: "talisman", label: "符箓", name: "Talisman", fx: "thrown/talisman-throw", tip: 17, family: "throw", drop: "weapons/talisman", class: "thrown" },
  { id: "flying-sword", label: "飞剑", name: "Flying sword", fx: "thrown/flying-sword-throw", tip: 17, family: "throw", drop: "weapons/flying-sword", class: "thrown" },
  { id: "binding-silk", label: "缚仙绫", name: "Binding silk", fx: "thrown/binding-silk-throw", tip: 9, family: "throw", drop: "weapons/binding-silk", class: "thrown" },
  { id: "soul-bell", label: "摄魂铃", name: "Soul bell", fx: "thrown/soul-bell-throw", tip: 10, family: "throw", drop: "weapons/soul-bell", class: "thrown" },
  { id: "pear-needles", label: "梨花针", name: "Pear-blossom needles", fx: "thrown/pear-needles-throw", tip: 13, family: "throw", drop: "weapons/pear-needles", class: "thrown" },
]);
export const MELEE_WEAPONS = Object.freeze(ARMORY.filter((w) => w.class === "melee"));
export const THROWN_WEAPONS = Object.freeze(ARMORY.filter((w) => w.class === "thrown"));
export const weaponOf = (id) => ARMORY.find((w) => w.id === id) ?? null;
export const meleeWeaponOf = (id) => MELEE_WEAPONS.find((w) => w.id === id) ?? null;
export const thrownWeaponOf = (id) => THROWN_WEAPONS.find((w) => w.id === id) ?? null;
