// Bone-local finishing patterns for the playable cast. Dimensions are rig units, with
// half-pixel contours at density 2. Hair, cloth and hardware keep separate material ramps.
export const CHARACTER_TAILORING = {
  dummy: { hair: "helmet", coat: "armor", trim: 9, volume: 1 },
  "ember-duelist": { hair: "swept", coat: "duelist", trim: 6, volume: 1.013 },
  "moon-oracle": { hair: "silver", coat: "robe", trim: 6, volume: 0.964 },
  "laurel-ranger": { hair: "braid", coat: "ranger", trim: 6, volume: 1.039 },
  "styx-warden": { hair: "mask", coat: "armor", trim: 9, volume: 1 },
  naruto: { hair: "spikes", coat: "shinobi", trim: 9, volume: 1 },
  sasuke: { hair: "raven", coat: "avenger", trim: 10, volume: 1.013 },
  "hatsune-miku": { hair: "twintails", coat: "idol", trim: 10, volume: 1.013 },
  daoist: { hair: "sage", coat: "robe", trim: 9, volume: 1.013 },
  "lu-mingfei": { hair: "messy", coat: "uniform", trim: 9, volume: 1.013 },
  "uesugi-eriyi": { hair: "crimson", coat: "dress", trim: 10, volume: 1.026 },
  "iron-man": { hair: "helmet", coat: "powered", trim: 6, volume: 1.039 },
  hulk: { hair: "wild", coat: "muscle", trim: 3, volume: 1 },
  thor: { hair: "golden", coat: "armor", trim: 9, volume: 1.039 },
  "captain-america": { hair: "cowl", coat: "uniform", trim: 9, volume: 1.039 },
  amaterasu: { hair: "silk", coat: "ceremonial", trim: 6, volume: 0.889 },
  tsukuyomi: { hair: "silk", coat: "robe", trim: 9, volume: 0.909 },
  susanoo: { hair: "wild", coat: "warrior", trim: 10, volume: 0.988 },
  "ivory-swordsman": { hair: "silver", coat: "longcoat", trim: 6, volume: 1.026 },
  "dnf-ghost-slayer": { hair: "spikes", coat: "warrior", trim: 9, volume: 1 },
  "dnf-dust-gunner": { hair: "swept", coat: "longcoat", trim: 6, volume: 1.013 },
};

export function tailorCharacter(S, look, api) {
  const design = CHARACTER_TAILORING[look.id];
  if (!design) return;
  const { ball, bone: line, panel } = api;
  const spike = (a, b, width = 0.8) => line("head", a, b, width, 0.08, 5);
  const strand = (a, b, width = 0.2) => line("head", a, b, width, width * 0.5, 11);
  const seam = (f, a, b, mat = design.trim, r = 0.18) => line(f, a, b, r, r, mat);
  const jewel = (f, at, size = 0.55) => {
    ball(f, at, [size * 0.48, size, size], 6);
    ball(f, [at[0] + 0.25, at[1] + 0.08, at[2] + 0.18], [size * 0.3, size * 0.55, size * 0.5], 8);
  };
  const stamp = (f, origin, rows, materials, step = 0.4) => {
    rows.forEach((row, y) => [...row].forEach((pixel, x) => {
      const mat = materials[pixel];
      if (mat === undefined) return;
      const left = origin[0] + x * step, top = origin[1] - y * step, z = origin[2] - x * 0.025;
      panel(f, [[left, top, z], [left + step, top, z - 0.025], [left + step, top - step, z - 0.025], [left, top - step, z]], mat);
    }));
  };

  if (!["mask", "helmet", "cowl"].includes(design.hair)) {
    // An angular cheek, near eyebrow, two-tone eye and a small mouth. Placing these on
    // the near cheek rather than the nose makes the face readable in a three-quarter view.
    panel("head", [[0.65, 1.5, 2.65], [1.8, 1.2, 2.6], [2.7, -0.3, 2], [2.05, -1.6, 2.25], [0.8, -1.75, 2.5]], 3);
    seam("head", [0.6, 0.65, 2.92], [1.7, 0.7, 2.72], 15, 0.14);
    seam("head", [0.8, 0.25, 2.98], [1.55, 0.25, 2.78], 9, 0.19);
    ball("head", [1.4, 0.24, 2.93], [0.18, 0.22, 0.18], 15);
    seam("head", [1.45, -1.1, 2.65], [1.95, -1.05, 2.42], 12, 0.1);
    // Authored pixel clusters, projected on the cheek plane, give a narrow eye and angular
    // jaw instead of spherical facial blobs. Flat materials preserve the tiny highlights.
    stamp("head", [0.15, 1.38, 3.18], [
      "hhhsss..", "hssssss.", "sseeess.", "sswessss", "ssssssd.", "ssssdss.", 
      ".ssdmd..", "..ddd...",
    ], { h: 20, s: 16, d: 17, w: 19, e: 15, m: 12 });
  }

  if (["swept", "messy", "spikes", "wild", "raven"].includes(design.hair)) {
    const spiky = ["spikes", "wild"].includes(design.hair), raven = design.hair === "raven";
    const locks = spiky ? [
      [[-1.6, 2.2, 1.8], [-3.8, 4.7, 2.2]], [[-0.7, 2.6, 0.2], [-1.5, 6.0, 0.4]],
      [[0.6, 2.4, 1.8], [1.7, 5.2, 2.7]], [[0.8, 2.5, -1.6], [2.2, 5.4, -2.2]],
      [[-1.8, 1.4, -2.2], [-4.4, 3.8, -3.3]], [[-2, 0.4, 2.2], [-4.1, 1.9, 3.1]],
    ] : [
      [[-1.8, 2.1, 1.6], [-4.7, 3.8, 2.5]], [[-0.6, 2.8, 1.4], [-2.1, 5.0, 2.1]],
      [[0.8, 2.7, 1.9], [2.7, 3.9, 2.8]], [[1.1, 2.1, 2.3], [2.35, 0.35, 2.9]],
      [[-1.7, 1.2, 2.5], [-3.5, -1.8, 3.15]],
    ];
    for (const [a, b] of locks) { spike(a, b, raven ? 1 : 0.9); strand(a.map((v, i) => v + (i === 2 ? 0.2 : 0)), b, 0.16); }
    if (raven) {
      spike([0.3, 2.7, 2.8], [1.6, -2.8, 3.15], 0.85);
      spike([-2.2, 1.6, 2.2], [-4.2, -4.8, 2.9], 1.1);
    }
  } else if (["silver", "golden", "silk", "crimson", "sage", "braid"].includes(design.hair)) {
    const length = design.hair === "crimson" ? 23 : design.hair === "silk" ? 18 : design.hair === "silver" ? 12 : 8;
    // Flat tapered locks replace bead-like hair: three value clusters and pointed hems.
    for (const side of [-1, 1]) {
      panel("head", [[-2.5, 2, side * 1.1], [-1.1, 2, side * 3.1], [-2.8, -length + 3, side * 4], [-4, -length, side * 2.7], [-3.7, -4, side * 1.5]], 5);
      strand([-1.8, 1.5, side * 3.2], [-3.25, -length + 2, side * 3.55], 0.22);
      strand([-2.5, -1, side * 2.8], [-3.9, -length + 1, side * 2.65], 0.14);
      spike([0.6, 2.8, side * 2.1], [1.3, -2.5, side * 3.0], 0.8);
    }
    spike([0, 2.6, 2.4], [2.1, 1.1, 2.9], 0.8);
    if (design.hair === "crimson") jewel("head", [-0.3, 3.8, 3.1], 0.5);
  } else if (design.hair === "twintails") {
    for (const side of [-1, 1]) {
      panel("head", [[-0.7, 3.4, side * 6.9], [0.5, 3.6, side * 9.5], [-0.2, -12, side * 10.3], [-2.6, -17, side * 9.6], [-2.0, -5, side * 7.5]], 5);
      strand([-0.1, 3, side * 9.7], [-1.1, -14.7, side * 10.1], 0.16);
      strand([-0.8, 1, side * 8.8], [-2.2, -15.5, side * 9.2], 0.1);
      seam("head", [-0.6, 3.2, side * 6.7], [0.3, 3.2, side * 9.6], 15, 0.36);
      for (const z of [0.8, 1.8, 2.5]) spike([1.4, 2.6, side * z], [1.9, 0.9, side * z], 0.6);
    }
  }

  const tailoredCoat = ["duelist", "longcoat", "uniform", "avenger", "shinobi"].includes(design.coat);
  if (tailoredCoat) {
    // Turned lapels, a dark central inset and a diagonal closure establish cloth layers.
    for (const side of [-1, 1]) {
      panel("chest", [[1.6, 4.4, side * 2.0], [2.5, 4.6, side * 4], [3.8, 0.9, side * 2.9], [3.9, -1.4, side * 0.6]], 4);
      seam("chest", [2, 4.4, side * 2.4], [3.9, 0.8, side * 1.1], design.trim, 0.18);
    }
    seam("chest", [3.65, 1.2, 0.45], [3.6, -2.8, 0.45], 15, 0.3);
    for (const y of [1.6, 0, -1.6]) ball("chest", [3.87, y, 1.2], [0.2, 0.25, 0.25], design.trim);
    jewel("pelvis", [3.8, 0.7, 1.25], 0.65);
  }
  if (design.coat === "duelist") {
    // Broad scarlet shoulder cape and a shaped bronze pauldron, with stitched outer edges.
    panel("chest", [[-1.5, 4.4, 4.4], [-4.2, 4.0, 5.7], [-7.6, -9.5, 7.2], [-5.5, -11.2, 7.5], [-3.4, -6, 5.8]], 4);
    seam("chest", [-4.1, 3.8, 5.85], [-6.8, -9.4, 7.4], 6, 0.24);
    panel("upperN", [[-0.7, 2.4, -2.2], [0.5, 3.1, 2.1], [3.0, 2.7, 2.7], [3.3, 1.8, -1.7]], 6);
    seam("upperN", [0.5, 3.2, 2.1], [3.1, 2.85, 2.7], 24, 0.15);
  }
  if (["longcoat", "duelist"].includes(design.coat)) {
    const length = design.coat === "duelist" ? 10 : 16;
    for (const side of [-1, 1]) {
      panel("pelvis", [[1.2, 0.7, side * 3.6], [3.4, 0.7, side * 4.7], [3.1, -length + 1, side * 7.1], [0.6, -length - 1.2, side * 6.4], [-1.6, -length + 3, side * 5.4]], 4);
      seam("pelvis", [3.4, -0.1, side * 4.8], [3.1, -length + 1.1, side * 7.15], 10, 0.27);
      seam("pelvis", [1.2, -3, side * 4.4], [0.7, -length + 0.4, side * 6.45], design.trim, 0.16);
    }
    seam("chest", [3.7, 1.9, 3.1], [3.6, -1.7, 1.3], 6, 0.18);
  }
  if (["robe", "dress", "ceremonial", "idol"].includes(design.coat)) {
    const length = design.coat === "idol" ? 6.8 : design.coat === "dress" ? 11.5 : 17;
    for (const z of [-4, -1.2, 1.6, 4.4]) {
      panel("pelvis", [[3.6, -1.8, z * 0.6], [3.65, -1.8, z * 0.6 + 0.75], [4.7, -length + 1.1, z * 1.2 + 0.8], [4.65, -length + 1.1, z * 1.2]], 14);
    }
    for (const side of [-1, 1]) {
      panel("chest", [[1.1, 4.3, side * 1.7], [2.8, 3.6, side * 2.8], [3.8, 0.7, side * 0.6]], 9);
      seam("chest", [2.8, 3.2, side * 2.3], [3.75, 0.5, side * 0.3], design.trim, 0.2);
    }
    jewel("chest", [3.85, 1.4, 0.5], 0.6);
    seam("pelvis", [3.8, -length + 0.2, -5.6], [4.8, -length - 0.3, 0], design.trim, 0.28);
    seam("pelvis", [4.8, -length - 0.3, 0], [4, -length + 0.2, 5.6], design.trim, 0.28);
  }
  if (design.coat === "shinobi") {
    for (const f of ["upperN", "upperF"]) line(f, [1.2, 0, 0], [7, 0, 0], 2.15, 1.8, 4);
    for (const f of ["thighN", "thighF"]) {
      line(f, [0.6, 0, 0], [7.8, 0, 0], 2.7, 2.1, 4);
      seam(f, [1.5, 1.9, 1], [6.6, 1.6, 0.9], 15, 0.25);
    }
    for (const f of ["foreN", "foreF"]) {
      line(f, [0.4, 0, 0], [5.4, 0, 0], 1.7, 1.35, 4);
      seam(f, [5.4, -0.2, 0], [6.7, -0.2, 0], 7, 1.45);
    }
  }
  if (["ranger", "avenger", "warrior"].includes(design.coat)) {
    for (const side of [-1, 1]) {
      panel("pelvis", [[3.6, 0.1, side * 1.2], [3.8, 0.1, side * 3.4], [4.1, -7.4, side * 4.6], [3.5, -8.3, side * 1.6]], 4);
      seam("pelvis", [3.9, -1, side * 3.35], [4.2, -7.2, side * 4.65], 10, 0.2);
    }
    seam("pelvis", [3.6, 1.3, -4], [3.6, 1.3, 4], design.trim, 0.6);
    jewel("pelvis", [4.1, 1.3, 1.4], 0.55);
  }
  if (["armor", "powered"].includes(design.coat)) {
    for (const f of ["upperN", "upperF"]) {
      panel(f, [[0, 2.3, -1.5], [0, 2.3, 2.9], [2.7, 2.7, 2.3], [3.9, 1.8, -0.4]], design.trim);
      seam(f, [0.2, 2.55, -1.3], [2.7, 2.85, 2.4], 9, 0.24);
      for (const x of [1, 2.4]) seam(f, [x, 2.7, 0.6], [x + 0.4, 2.4, 2.5], 15, 0.12);
    }
    for (const y of [-0.3, -1.7]) seam("chest", [3.65, y, -2.8], [3.65, y, 2.8], design.trim, 0.25);
    for (const f of ["shinN", "shinF"]) {
      panel(f, [[0.4, 1.5, -1.1], [0.4, 1.5, 1.4], [6.5, 1.45, 1], [7.1, 1.2, 0], [6.4, 1.5, -0.9]], 9);
      seam(f, [1, 1.8, 0.2], [6.6, 1.6, 0.2], 6, 0.15);
    }
  }
  // Tiny buckles and boot straps live on the limb frames and remain attached in a run or cut.
  if (design.coat !== "muscle") for (const f of ["shinN", "shinF"]) {
    for (const x of [3.2, 6.3]) {
      line(f, [x, 0, 0], [x + 0.35, 0, 0], 1.72, 1.65, 7);
      seam(f, [x, 1.55, -0.8], [x, 1.55, 0.8], design.trim, 0.18);
    }
  }
}
