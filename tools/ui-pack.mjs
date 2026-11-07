#!/usr/bin/env node
// Export the complete Ember UI options, rather than overwriting each effect's default sheet.
// node tools/ui-pack.mjs [--preview-only] [--gif]
import { join } from "node:path";
import { createFrame, painterFor, composite, hex } from "../src/core/index.js";
import { ROOT, renderFrames, spriteSheet, upscale, writeVideo, save } from "./lib/fxlib.mjs";
import { encodePNG } from "./lib/png.mjs";
import * as action from "../src/fx/ui/touch-action-button.js";
import * as skill from "../src/fx/ui/skill-node.js";
import * as card from "../src/fx/ui/loadout-card.js";
import * as panel from "../src/fx/ui/loadout-panel.js";

const out = join(ROOT, "records/ember-ui"), presets = [];
const modules = { "touch-action-button": action, "skill-node": skill, "loadout-card": card, "loadout-panel": panel };
function preset(name, id, options) { presets.push({ name, id: `ui/${id}`, mod: modules[id], options }); }
for (const icon of ["attack", "quick", "dodge", "bag", "pause", "resume"]) {
  for (const [state, opts] of Object.entries({ ready: {}, pressed: { pressed: true }, cooldown: { cooldown: 0.62 }, disabled: { disabled: true } })) {
    preset(`actions/${icon}-${state}`, "touch-action-button", { icon, ...opts });
  }
}
for (const icon of ["slash", "fire", "frost", "bolt", "mend", "meteor", "burst"]) {
  for (const [state, opts] of Object.entries({ ready: {}, selected: { selected: true }, cooldown: { cooldown: 0.62, cdText: "3" }, disabled: { disabled: true, mana: 0 } })) {
    preset(`skills/${icon}-${state}`, "skill-node", { icon, ...opts });
  }
}
for (const [glyph, rarity, title] of [["blade", "legendary", "EMBER BLADE"], ["staff", "epic", "MOON STAFF"], ["bow", "rare", "WIND BOW"], ["orb", "common", "ARCANE GEM"]]) {
  for (const equipped of [false, true]) {
    preset(`inventory/${glyph}-${equipped ? "equipped" : "idle"}`, "loadout-card", { glyph, rarity, title, selected: equipped, equipped });
  }
}
preset("inventory/panel", "loadout-panel", {});
preset("inventory/panel-blank", "loadout-panel", { contents: false, title: "" });

function board(t) {
  const f = createFrame(720, 760), p = painterFor(f);
  const white = hex("#efe7d9"), muted = hex("#8d9db2"), amber = hex("#d9ad65");
  p.rect(0, 0, 720, 760, hex("#0b101a"));
  p.text("EMBER ECHO", 24, 19, white, { font: "big", scale: 2 });
  p.text("PIXELFX / BACKUP UI ASSET PACK", 26, 43, muted);
  p.line(24, 59, 695, 59, hex("#334152"));
  function heading(y, n, text) {
    p.rect(24, y, 17, 11, hex("#463527")); p.text(n, 28, y + 3, amber);
    p.text(text, 49, y + 2, white, { font: "big" });
  }
  function draw(mod, x, y, options = {}) {
    p.place(x, y); mod.draw(p, t, { ...mod.meta.options, ...options }); p.place(0, 0);
  }
  function label(text, x, y) { p.text(text, x, y, muted, { align: "center" }); }
  heading(72, "01", "COMBAT / TOUCH");
  ["attack", "quick", "dodge", "bag", "pause", "resume"].forEach((icon, i) => {
    const x = 70 + i * 114; draw(action, x, 131, { icon }); label(icon.toUpperCase(), x, 178);
  });
  heading(204, "02", "SPELLS / ABILITY SLOTS");
  ["slash", "fire", "frost", "bolt", "mend", "meteor", "burst"].forEach((icon, i) => {
    const x = 65 + i * 98; draw(skill, x, 262, { icon }); label(icon.toUpperCase(), x, 307);
  });
  heading(334, "03", "STATES / FEEDBACK");
  const states = [["READY", {}], ["PRESSED", { pressed: true }], ["COOLDOWN", { cooldown: 0.62 }], ["DISABLED", { disabled: true }]];
  states.forEach(([name, opts], i) => {
    const x = 70 + i * 114; draw(action, x, 393, { icon: "dodge", ...opts }); label(name, x, 440);
  });
  draw(skill, 535, 393, { icon: "fire", selected: true }); label("SELECTED", 535, 440);
  draw(skill, 649, 393, { icon: "frost", cooldown: 0.62, cdText: "3" }); label("RECHARGE", 649, 440);
  heading(466, "04", "SATCHEL / EQUIPMENT");
  draw(panel, 195, 621);
  draw(card, 548, 552);
  draw(card, 548, 666, { title: "MOON STAFF", glyph: "staff", rarity: "epic", selected: false, equipped: false, detail: "+24% ARCANE" });
  return composite(f, new Uint8ClampedArray(f.w * f.h * 4), null);
}
save(join(out, "overview.png"), encodePNG(1440, 1520, upscale(board(0.5), 720, 760, 2)));
if (process.argv.includes("--gif")) {
  const frames = Array.from({ length: 36 }, (_, i) => ({ color: board(i / 15) }));
  if (!writeVideo(join(out, "overview.gif"), { w: 720, h: 760, fps: 15, frames }, 1)) throw new Error("GIF export needs ffmpeg");
}
if (!process.argv.includes("--preview-only")) {
  const manifest = { name: "Ember UI", fps: 30, duration: 2.4, sampling: "nearest", assets: [] };
  for (const entry of presets) {
    const fx = { id: entry.id, meta: entry.mod.meta, mod: entry.mod };
    const frames = renderFrames(fx, { options: entry.options, bg: "none" });
    const filename = entry.name.split("/").at(-1), sheet = spriteSheet(fx, frames, filename);
    const atlas = `${entry.name}.png`, json = `${entry.name}.json`, still = `${entry.name}-still.png`;
    save(join(out, atlas), sheet.png); save(join(out, json), JSON.stringify(sheet.json, null, 2));
    save(join(out, still), encodePNG(frames.w, frames.h, frames.frames[0].clear));
    manifest.assets.push({ name: entry.name, id: entry.id, options: { ...fx.meta.options, ...entry.options }, atlas, json, still, frameSize: fx.meta.size, pivot: fx.meta.origin, frames: frames.n });
  }
  save(join(out, "manifest.json"), JSON.stringify(manifest, null, 2));
  console.log(`${presets.length} variants: transparent still PNG + 72-frame atlas PNG/JSON -> ${out}`);
}
console.log(`Preview -> ${join(out, "overview.png")}`);
