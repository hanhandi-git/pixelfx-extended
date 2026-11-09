# DNF theme

Gallery: `gallery/?theme=dnf&lang=zh`. Every asset carries `dnf` in `meta.tags`; characters and equipment also expose `theme: "dnf"`.

The set studies native pixel clusters from the local Spriters Resource DNF reference library: dark contour, stepped cold highlights, asymmetric red armor, white hair, loose cobalt trousers, and a burgundy split coat with a green scarf. No reference PNGs are bundled. All new forms are authored in code at the library's native character scale and rendered with nearest-neighbor presentation.

| Type | Assets |
| --- | --- |
| Characters | `dnf-ghost-slayer`, `dnf-dust-gunner` |
| Equipment | `blood-cleaver`, `chain-blade`, `hell-cannon` |
| Placed previews | `dnf/blood-cleaver`, `dnf/chain-blade`, `dnf/hell-cannon` |
| Actions and effects | `dnf/overdrive-slash`, `dnf/chain-cut`, `dnf/chain-pull`, `dnf/launcher-volley`, `dnf/awakening-burst`, `dnf/rage-aura` |
| Character previews | `dnf/ghost-slayer`, `dnf/dust-gunner` |

Weapons use the same geometry in hand and in placed previews. Attacks include anticipation, release, contact stop and recovery. Launcher impact timing follows the shell's flight time. Loops return to the same pixel state; one-shots end empty.

Ember Echo imports this set from its sibling pixelfx checkout. Its weapon, appearance and skill pages expose an `all` / `dnf` theme filter, and its skill catalog excludes character showcases and placed equipment.
