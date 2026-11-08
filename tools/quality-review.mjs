#!/usr/bin/env node
// Reproduce the seven-stage visual check against the sibling game. Baselines are opt-in and never overwritten.
import { mkdirSync, existsSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { pathToFileURL } from "node:url";
import { ROOT } from "./lib/fxlib.mjs";
import { encodePNG } from "./lib/png.mjs";

const { Game } = await import(pathToFileURL(join(ROOT, "../ember-echo/src/game.js")));
const out = join(ROOT, "records/quality-review");
mkdirSync(out, { recursive: true });
const baseline = process.argv.includes("--baseline");
const g = new Game({ getContext: () => ({
  createImageData: (w, h) => ({ data: new Uint8ClampedArray(w * h * 4) }), putImageData() {},
}) });
const stages = [];
for (let stage = 0; stage < 7; stage++) {
  const file = join(out, `${baseline ? "before" : "after"}-${stage}.png`);
  if (baseline && existsSync(file)) throw new Error(`Refusing to overwrite baseline: ${file}`);
  g.loadStage(stage); g.fade = 0; g.ui.fx = []; g.phase = "fight"; g.hero.x = 82;
  for (const [type, x] of [["goblin-warrior", 150], ["goblin-mage", 210], ["slime", 268]]) {
    const enemy = g.spawnEnemy(type, x, 153);
    enemy.state = "idle"; enemy.fx.update(0.4);
  }
  g.effects = []; g.render();
  writeFileSync(file, encodePNG(g.frame.w, g.frame.h, g.img.data));
  stages.push(g.stage.name);
}
if (!baseline) {
  writeFileSync(join(out, "index.html"), `<!doctype html><html lang="zh-CN"><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1"><title>余烬回响 · 画质对照</title>
<style>
:root{color-scheme:dark;font:16px/1.6 system-ui;background:#090d15;color:#e8edea}body{max-width:1320px;margin:0 auto;padding:40px 24px}h1{font-size:32px;margin:8px 0}p{color:#a6b5be}a{color:#9ed7c3}select{font:inherit;padding:10px 18px;background:#16232c;color:#e8edea;border:1px solid #405760;border-radius:6px}.views{display:grid;grid-template-columns:1fr 1fr;gap:20px;margin:24px 0}figure{margin:0;min-width:0}figcaption{padding:8px 0;color:#a6b5be}img{display:block;width:100%;image-rendering:pixelated;background:#080a10;border:1px solid #26343e;box-sizing:border-box}.label{color:#8ec9b1;letter-spacing:.15em;font-size:12px}nav{display:flex;flex-wrap:wrap;gap:24px;margin-top:30px}@media(max-width:850px){.views{grid-template-columns:1fr}body{padding:20px}}
</style>
<div class="label">EMBER ECHO / VISUAL REVIEW</div><h1>余烬回响 · 画质对照</h1>
<p>同一场景、同一站位、同一敌人动作。两张图片按相同显示尺寸呈现，可以检查人物轮廓、装备、叶簇、地面与月面细节。</p>
<label for="scene">检查场景 </label><select id="scene">${stages.map((name, i) => `<option value="${i}">${i + 1} · ${name}</option>`).join("")}</select>
<div class="views"><figure><figcaption>改造前 · 320 × 180</figcaption><img id="before" src="before-0.png" alt="改造前的同场景截图"></figure><figure><figcaption>改造后 · 640 × 360</figcaption><img id="after" src="after-0.png" alt="改造后的同场景截图"></figure></div>
<nav><a href="http://127.0.0.1:8123/" target="_blank">进入游戏检查动态画面 ↗</a><a href="/gallery/" target="_blank">打开 pixelfx 素材库 ↗</a><a href="/records/fire/fireball/contact.png" target="_blank">火球逐帧图 ↗</a><a href="/records/ice/frost-nova/contact.png" target="_blank">霜环逐帧图 ↗</a></nav>
<script>document.querySelector('#scene').addEventListener('change',e=>{for(const kind of ['before','after'])document.querySelector('#'+kind).src=kind+'-'+e.target.value+'.png'})</script></html>`);
}
console.log(`Visual review: ${out}/index.html`);
