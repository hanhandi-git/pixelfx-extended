# Ember UI 备用素材

为 `ember-echo` 准备的独立 UI 素材，统一使用深色底、斜切钢框、琥珀选中线和元素色插画。此次生成素材，尚未替换游戏界面。源码始终留在 `src/fx/ui/`，不含游戏输入或背包逻辑。

| ID | 用途 | 选项 |
| --- | --- | --- |
| `ui/touch-action-button` | 攻击、疾行、闪避、背包、暂停、继续 | `icon: attack/quick/dodge/bag/pause/resume`；`pressed`、`disabled`、`flash`、`cooldown`、`badge`、`key` |
| `ui/skill-node` | 技能槽 / 选择技能 | `icon: slash/fire/frost/bolt/mend/meteor/burst/none`；`selected`、`pressed`、`disabled`、`cooldown`、`cdText`、`mana`、`level` |
| `ui/loadout-card` | 装备与法术卡片 | `glyph: blade/staff/bow/orb` 或上述技能图标；`rarity: common/rare/epic/legendary`；`selected`、`equipped`；`title`、`type`、`level`、`detail` |
| `ui/loadout-panel` | 背包面板底图 / 布局示例 | `contents: false` 清空示例内容；`frameOnly: true` 只输出钢框；`title: ""` 留给游戏叠字；`selected: 0..5` |

共用 `palette` 可换色。`cooldown` 是剩余比例，`1` 全部遮罩、`0` 可用，遮罩从正上方顺时针绘制；游戏应每帧传入 `remaining / duration`。`mana` 是 0..1；设为 `false` 或 `0` 显示缺蓝标记。文字可清空。ember-echo 画布 HUD / banner / toast / quest-complete 等走 `FONTS` 的 **han5（5×5）/ han7（7×7）** 与拉丁 mini/big 混排；设置面板仍用 HTML 字体。补字后运行 `npm run font:han`（需 Python PIL）。

## 导出与预览

```bash
node tools/ui-pack.mjs --gif
node tools/check.mjs ui/touch-action-button ui/skill-node ui/loadout-card ui/loadout-panel
node tools/index.mjs
npm run gallery
```

`records/ember-ui/` 包含总览 PNG/GIF、`manifest.json` 和 62 种资源配置，每种有透明静态 PNG、72 帧透明 PNG 图集及 Aseprite 格式 JSON。目录按 `actions/`、`skills/`、`inventory/` 分类。`node tools/ui-pack.mjs --preview-only` 仅重新生成总览。

图集为 30 FPS、2.4 秒无缝循环，pivot、行列和帧矩形在 JSON 的 `meta.pixelfx` 中。保留透明度，使用 nearest 采样；不要将静态 PNG 当成动画。所有导出都位于被忽略的 `records/` 下，可以用工具重建。

本地 Gallery：[新增 UI](http://localhost:8080/gallery/?source=new#ui)。点击素材打开详情，可修改 JSON 选项、暂停、重播和切换速度。

## 接入游戏

Canvas 可以直接导入 effect，通过 `createFx()` 更新与绘制，或在每帧调用 `draw(p, time, { ...meta.options, ...state })`。DOM 可以播放图集，把可读文字放在图片上层。备用面板的槽位与按钮是图案，真实的交互仍由游戏处理。

按钮图片与点击区域分别设置：保留现有图标尺寸，外层使用至少 48 CSS px 的真实 `<button>`，相邻热区不要重叠。装饰层设置 `pointer-events: none`，保留 `aria-label` 和触屏 `pointerdown` 处理；手机安全区、技能上下排顺序由现有游戏布局负责。

本包面向 H5；未同步 `pixelfx-cocos` 生成资源，也未在 Creator 中验证。
