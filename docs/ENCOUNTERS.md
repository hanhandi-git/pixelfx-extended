# Encounters

1 choreographed encounters in `src/encounters/`. Render one with `node tools/encounter.mjs <id> --mp4`.

An encounter places a map, a hero, minions, a boss and that boss's attack effects on one timeline. The units and
attacks are ordinary effects from `src/fx/`; the encounter only says when they happen and what the fight calls them.

| encounter | map | boss | minions | length | what it does |
|---|---|---|---|---|---|
| Goblin Warband | `world/mossy-ruins` | — | 3 | 16.5s | 哥布林小队在苔藓废墟里围攻英雄：战士、弓手与敏捷哥布林先上，中刀后仰、退散成烟；随后法师与巨人踏入空地. |
