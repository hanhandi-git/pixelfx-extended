import { weaponDrop } from "./_lib.js";
import { PAL } from "../../core/index.js";
export const { meta, draw, drawBack } = weaponDrop({
  id: "ember-greatsword", name: "Ember Greatsword, placed", seed: 101,
  desc: "A massive ember-steel blade with horned gold guard, lightning-shaped heat inlay, faceted gems and a long braided grip.", palette: PAL.fire,
});
