import test from "node:test";
import assert from "node:assert/strict";
import {effects} from "../src/fx/index.js";
import {WEAPONS,ARMORY} from "../src/core/index.js";
import {isWeaponAsset,matchesMaterial} from "../gallery/materials.js";

test("equipment content includes every model preview and selectable weapon action",()=>{
  for(const id of Object.keys(WEAPONS)){
    const path=effects[`weapons/${id}`]?`weapons/${id}`:`dnf/${id}`;
    assert(isWeaponAsset(path,effects[path]),path);
  }
  for(const weapon of ARMORY)assert(isWeaponAsset(weapon.fx,effects[weapon.fx]),weapon.fx);
});
test("equipment content keeps theme-specific attacks while excluding characters and scenery",()=>{
  for(const id of ["dnf/chain-pull","dnf/overdrive-slash","dnf/launcher-volley"])assert(matchesMaterial("equipment",id,effects[id]),id);
  for(const id of ["dnf/ghost-slayer","dnf/dust-gunner","world/mossy-ruins","dnf/rage-aura","ui/loadout-card","ui/loadout-panel","konosuba/explosion-chant"])assert(!matchesMaterial("equipment",id,effects[id]),id);
  assert(matchesMaterial("all","dnf/ghost-slayer",effects["dnf/ghost-slayer"]));
});
