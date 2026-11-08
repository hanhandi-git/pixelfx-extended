import assert from "node:assert/strict";
import test from "node:test";
import { glyphFor, textWidth, isCjk } from "../src/core/font.js";

test("CJK resolves in mini/big tiers", () => {
  assert.equal(isCjk("苔"), true);
  assert.ok(glyphFor("苔", "mini"));
  assert.ok(glyphFor("迹", "big"));
  assert.ok(textWidth("苔痕") > textWidth("AB"));
});

test("Latin still uses proportional mini", () => {
  assert.ok(textWidth("WAVE") < textWidth("WWWWW"));
});
