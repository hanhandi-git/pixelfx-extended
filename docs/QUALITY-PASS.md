# 第一轮画质改造

本轮保持现有像素画风、配色体系和世界比例，提升实际采样精度并保留小尺寸素材的细节。所有素材仍由仓库内的确定性程序生成，无新增外部图片或 AI 图片。

## 视觉与技术规格

| 内容 | 本轮规格与来源 |
| --- | --- |
| 游戏画面 | 320×180 世界坐标，640×360 实际颜色/光照缓冲，nearest 显示 |
| 角色、Boss、营地肖像 | 从现有骨骼、服饰和武器几何重新按半单位采样；4 阶材质与深度关系保留 |
| 怪物、拾取物、施法 | 直接在最终画布按游戏比例绘制；移除先画小图再缩小的中间步骤 |
| 七张地图 | 静态层按 2 倍精度烘焙；共享叶簇改为硬边叠色，石柱加入细槽，地面加入细沉积纹理，月面增加陨石坑并收敛光晕 |
| 火球 | 缩小宽光晕并降低强度，显露火舌与头部的色阶 |
| 素材库 | 独立效果与地图使用 2 倍画布；涉及身体像素重映射的 acted 预览继续使用原分辨率 |
| 输出 | `render --density 2` 输出真实尺寸的 PNG/JSON，pivot 同步乘以密度；默认导出保持兼容 |

不是对数百个效果逐一重绘。手工网格类怪物本轮保留原始设计，但游戏不再通过 320×180 中间画布丢失细线。Cocos 未重新导出，也未在 Creator 内验收。

## 本地检查入口

- 游戏：<http://127.0.0.1:8123/>
- 七场景前后对照：<http://localhost:8080/records/quality-review/index.html>
- 素材库：<http://localhost:8080/gallery/>

对照图的相机、人物位置、敌人类别、动作时间一致，左右按相同显示尺寸呈现。原图在 `records/quality-review/before-*.png`，新图在 `after-*.png`。这批 baseline 在修改源码前保存；默认命令不会覆盖 baseline。

```sh
node tools/quality-review.mjs
node tools/render.mjs fire/fireball --density 2 --max 8 --zoom 2
node tools/render.mjs melee/sword-slash --density 2 --max 8 --zoom 2
node tools/render.mjs ice/frost-nova --density 2 --max 8 --zoom 2
node tools/render.mjs impacts/hit-spark --density 2 --max 8 --zoom 2
npm test
npm run check
npm run build:web
```

在 sibling `ember-echo` 目录运行：

```sh
npm run lint
npm test
npm run build
```

## 新的绘制接口

```js
const frame = createFrame(320, 180, 0, 0, 2); // w/h 是实际像素数 640/360，ox/oy 保持世界单位
const fx = createFx(effect, { x: 100, y: 150, renderScale: 0.6 });
fx.draw(frame); // 放置/缩放不改变逻辑时间、攻击判定或 meta
const body = posed(pose, characterId, { density: 2 });
// 每个 body 像素的世界边长 = 1 / body.density。
```

Painter 的 `toX/toY` 与 `put/add/blendPx` 使用实际屏幕像素；`place`、图形、文字、`fromX/fromY` 使用世界单位。`image/lightImage` 最后一个参数为输入图片密度。原有调用默认密度 1。

`createAct.draw()` 的普通表演与素材库角色展示已支持高精度服饰/武器采样；`act.onBody` 的身体像素重映射保留密度 1。游戏使用其动作时序与 pose，特效通过 `act.fx.draw()` 进入高精度缓冲。

## 本次验证结果

- pixelfx：`npm test` 44/44 通过；`npm run check` 359 个特效、1 个遭遇战通过；`npm run build:web` 通过。
- ember-echo：`npm run lint`、`npm test`（78/78）、`npm run build` 通过。
- 浏览器：游戏 640×360 画布、施法、暂停、人物选择、肖像与动作高清画布、火球播放/重播、七场景对照切换已检查，未发现控制台错误。
- 全库检查还报告 21 项提示，包括若干效果的越界、lotus-lamp 的尾帧残留、地图/天气等的帧耗时。完整日志保存在 `records/quality-review/check.log`。校验中的地图运行在兼容的密度 1 输出上，需要从密度 2 静态缓存采样；游戏则直接拷贝匹配密度的缓存。
- 未 commit、push 或部署；未导出/打开 Cocos Creator。本轮针对画质的源代码与游戏构建保留在本地供检查。
