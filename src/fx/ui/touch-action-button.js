// A compact touch-first action button: a recessed round well, a readable pixel glyph and
// state feedback for pressed, cooldown, disabled and flash. The hit target can be larger than
// the rendered button in the game; this asset stays calm enough to sit beside another button.
import { TAU, clamp } from "../../core/index.js";
import { INK, BODY, TOP, SILVER, GOLD, tone, iconArt, rimGlint } from "./_ember.js";

export const meta = {
  name: "Touch action button",
  desc: "A dark fantasy action button: steel bevel, amber trim, sword, winged boot, dodge afterimage, bag, pause or resume, with pressed, disabled and clockwise cooldown states.",
  tags: ["ui", "touch", "button", "action", "combat", "cooldown", "loop"],
  size: [96, 96],
  origin: [48, 48],
  duration: 2.4,
  loop: true,
  fps: 30,
  bg: "dark",
  options: {
    icon: "quick", pressed: false, disabled: false, cooldown: 0, flash: false,
    label: "", key: "", badge: "", palette: null, hud: false, seed: 6,
  },
};

export function draw(p, t, o) {
  const icon = ["attack", "quick", "dodge", "bag", "pause", "resume"].includes(o.icon) ? o.icon : "quick";
  const C = tone(icon, o.palette, o.disabled), S = SILVER, G = GOLD;
  const cd = clamp(o.cooldown ?? 0), cy = o.pressed ? 2 : 0;
  const ready = !o.disabled && cd === 0;
  const hud = !!o.hud;
  if (hud) {
    p.glow(0, cy, 30, C[2], o.pressed ? 0.18 : 0.1);
    p.ring(0, cy, 36, 2, ready ? G[3] : S[2], 0.92);
    p.ring(0, cy, 34, 1, INK, 0.4);
    iconArt(p, icon, 0, cy, C, t);
    if (cd > 0) {
      p.disc(0, cy, 32, INK, (d, an) => {
        const u = ((an + Math.PI / 2) / TAU + 1) % 1;
        return u < cd ? 0.65 : 0;
      });
      const edge = -Math.PI / 2 + cd * TAU;
      p.arc(0, cy, 34, 2, -Math.PI / 2, edge, C[3]);
    }
    if (o.pressed || o.flash) p.ring(0, cy, 38, 1, C[4], 0.85);
    if (o.disabled) {
      p.ring(0, cy, 36, 3, INK, 0.55);
    }
    return;
  }
  p.circle(0, cy + 2, 39, INK);
  p.circle(0, cy, 38, (d, an) => d < 0.9 ? S[0] : Math.sin(an - 0.5) < 0 ? S[3] : S[1]);
  p.ring(0, cy, 36, 1, INK);
  p.ring(0, cy, 34, 2, (v, an) => Math.sin(an) < 0 ? G[3] : G[1]);
  p.circle(0, cy, 32, INK);
  p.circle(0, cy, 30, (d, an) => d < 0.7 ? BODY : Math.sin(an) < 0 ? TOP : S[0]);
  p.arc(0, cy, 28, 1, -2.8, -0.25, C[1]);
  p.arc(0, cy, 28, 1, 0.35, 2.5, INK);
  for (const dx of [-34, 34]) {
    p.poly([[dx - 4, cy], [dx, cy - 4], [dx + 4, cy], [dx, cy + 4]], INK);
    p.poly([[dx - 2, cy], [dx, cy - 2], [dx + 2, cy], [dx, cy + 2]], G[3]);
  }
  p.glow(0, cy, 26, C[2], o.pressed ? 0.22 : 0.09);
  iconArt(p, icon, 0, cy, C, t);
  if (cd > 0) {
    // One remaining-fraction convention for both skill and action assets.
    p.disc(0, cy, 30, INK, (d, an) => {
      const u = ((an + Math.PI / 2) / TAU + 1) % 1;
      return u < cd ? 0.72 : 0;
    });
    const edge = -Math.PI / 2 + cd * TAU;
    p.arc(0, cy, 32, 2, -Math.PI / 2, edge, C[3]);
    p.line(0, cy, Math.cos(edge) * 28, cy + Math.sin(edge) * 28, C[4], 0.7);
  }
  if (ready) rimGlint(p, t, 35, C, cy);
  if (o.pressed || o.flash) {
    p.ring(0, cy, 39, 1, C[4]);
    p.arc(0, cy, 30, 2, -2.5, -0.5, C[4]);
  }
  if (o.disabled) {
    p.rect(20, cy + 19, 10, 9, INK); p.rect(22, cy + 20, 6, 6, S[2]);
    p.arc(25, cy + 21, 4, 1, -Math.PI, 0, S[3]);
  }
  if (o.badge) {
    p.circle(26, cy - 26, 8, INK); p.circle(26, cy - 26, 6, C[2]);
    p.text(String(o.badge).slice(0, 2), 26, cy - 28, C[5], { align: "center", outline: INK });
  }
  if (o.key) p.text(String(o.key).slice(0, 2), -26, cy - 29, S[4], { align: "center", outline: INK });
  if (o.label) p.text(String(o.label).slice(0, 12), 0, 42, S[3], { align: "center", outline: INK });
}
