# Detailed pixel weapons

## Approved visual baseline

The user approved the refined DNF weapon set and requested this level of finish for future weapons.
Use **detailed, ornamental pixel craftsmanship** as the default for weapon creation and rework across themes.
Keep each weapon's own silhouette, materials and visual identity. An explicit request for plain equipment,
a strict resolution, or a different art direction takes precedence.

Inspect [the approved before/after comparison](images/weapon-quality-baseline.png) with the image-viewing tool.
The right column is the target finish. The image is a quality reference, not a template for every silhouette
or a requirement that every weapon use gold, red gems or the DNF theme.

## Art direction

- **Silhouette:** distinguish blade, edge, spine, ricasso, guard, grip and pommel. For guns, distinguish stock,
  receiver, barrel, muzzle opening, sights and grip. Create a recognizable outline before adding decoration.
- **Material:** use hard, hue-shifted ramps. Give metal a dark face, a middle facet, a lighter bevel and a thin
  controlled highlight. Keep enamel, leather, crystal and brass visually separate.
- **Ornament:** design connected motifs with stems, leaves, curls, glyph counters, inlay borders or engraved
  mechanical plates. Place them along the structure and leave quiet metal between ornaments. Random dots and
  repeated bright ticks do not communicate the same craftsmanship.
- **Construction:** give guards and pommels layered settings, rivets or scrollwork; give grips deliberate wraps
  and collars; give gems multiple facets. Preserve useful negative space in chain links and muzzle bores.
- **Lighting:** keep the body opaque and readable with glow disabled. Use restrained sheen and sparse motes;
  preserve the engraving's contrast throughout the animation.

The accepted examples use ruby enamel and gold acanthus on a silver executioner blade; cyan glyphs, a silver
scroll guard and articulated chain on an obsidian saber; and chased brass, cooling fins and a clockwork core
on a heavy cannon. Future themes should develop their own equally intentional motifs.

## Pixel density and one source of truth

Author enough native pixels for the ornament. In this library, **four texels per grip-space unit** is the
preferred starting point for detailed weapons. The approved masters, including margins, are 260×83,
240×98 and 148×67 pixels. These are examples of useful detail budgets, not mandatory dimensions or a reason
to enlarge a small weapon in the world. Increasing authored density should add actual bevels, engraving and
facets; nearest-neighbor enlargement only helps inspection.

When refining existing equipment, preserve its grip, second-hand attachment, tip length and gameplay scale.
Use one composed high-detail model for all views:

- **Held:** adapt the master texels into grip-local coordinates and rasterize at the host's rendering density.
- **Display:** show source texels clearly, with sufficient canvas margin. Present a gun broadside when that
  best reveals the receiver and barrel; choose the pose that shows a blade's engraving.
- **Icon:** sample the composed source with nearest-neighbor filtering. For the existing 78-unit Ember Echo
  socket, the accepted implementation uses a 156×156 raster. Verify the actual card at its displayed size.

Avoid independently redrawing an approximate icon, display sprite or held model: these views need to agree.

## Preserve decoration through the depth buffer

The rig's `plot()` rejects a fragment when `z <= Zb[i]`. Submitting a silhouette/base polygon and then painting
engraving onto the same plane can therefore leave the held weapon as a flat base color, even when a standalone
render looks detailed.

Compose outlines, facets, engraving and highlights into a local texel map first. Resolve overpainting there,
then submit each final texel once through `shape.draw(T)`. Keep real depth for genuinely separate geometry.
Do not change the global depth comparison merely to make one decorative layer appear.

The checked-out library's `src/core/dnf-weapons.js` demonstrates this composition, and
`src/fx/dnf/_weapon-display.js` shows the same source at full detail with restrained lighting. Ember Echo's
`src/ui-art.js` samples the composed source for equipment icons. Adapt these patterns to the current project.

## Visual acceptance

Inspect the native master at an integer nearest-neighbor magnification, then check the held weapon, actual
equipment card and animated display. Engraving should remain legible, material faces should stay distinct,
and guards, gems, links and muzzle openings should survive the intended presentation size. A large master
alone is insufficient when the game still shows a flat shape.

For a refinement, provide a before/after comparison. Check both facing directions and attack poses for
clipping, alignment and lost color. Run the affected rendering checks and relevant weapon tests; if fixing
the depth issue, a focused regression check should inspect the held raster beyond the character's body.
Register and preview assets through the existing gallery workflow. Use the approved image as the finish
benchmark and iterate on the weakest visible detail before delivering.
