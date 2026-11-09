// Four authored texels per grip-space unit. Bake the engraving into the material before
// submitting it to the rig: coplanar overpainting is rejected by the rig's depth test.
import { hex } from "./color.js";
import { composeWeaponArt } from "./pixel-weapon-art.js";

export const DNF_WEAPON_DENSITY = 4;
const C = Object.fromEntries(Object.entries({
  ink: "#100f1b", black: "#211b30", shadow: "#35324f", steelD: "#4f5675",
  steel: "#778ca8", silver: "#a7c3d4", edge: "#d5e9ee", white: "#fff7de",
  goldD: "#65412f", bronze: "#9a6339", gold: "#d19b51", goldL: "#efd08a", ivory: "#ffedb7",
  redD: "#381526", red: "#752238", ruby: "#c83e51", scarlet: "#ef796d",
  violetD: "#242239", violet: "#49466d", blue: "#477a98", cyan: "#75bdca", ice: "#c2e5e7",
  gripD: "#271827", grip: "#613445", wrap: "#a65a58", patina: "#456e6b",
}).map(([k,v]) => [k,hex(v) >>> 0]));

const art = paint => composeWeaponArt(paint,C);

const blood = art(({dot,line,path,poly,gem,scroll,grip}) => {
  grip(-9.5,1.3,1.2);
  // Crown pommel, inset garnet and two gold grip collars.
  poly([[-12,-1.1],[-10.7,-2.4],[-8.9,-1.5],[-8.9,1.5],[-10.7,2.4],[-12,1.1]],C.goldD);
  poly([[-11.5,-0.9],[-10.6,-1.8],[-9.4,-1.1],[-9.4,1.1],[-10.6,1.8],[-11.5,0.9]],C.gold);
  gem(-10.5,0,0.8,1.25);
  for(const x of [-8.9,0.2]) {
    poly([[x,-1.6],[x+0.8,-1.6],[x+0.8,1.6],[x,1.6]],C.goldD);
    line(x+0.2,-1.3,x+0.2,1.3,C.goldL);dot(x+0.4,-1.3,C.white);
  }
  // Wing-shaped guard: shadow border, raised gold rib and engraved red enamel.
  for(const s of [-1,1]) {
    poly([[0.9,s*1.2],[1.5,s*4.6],[-0.3,s*8.4],[1.1,s*10],[3.5,s*7.6],[5.1,s*3.1],[7,s*2]],C.ink);
    poly([[1.6,s*1.4],[2.2,s*4.5],[0.6,s*8.1],[1.2,s*8.9],[2.9,s*7.2],[4.5,s*2.8],[6,s*1.8]],C.goldD);
    path([[1.3,s*8.8],[2.4,s*6.8],[3.6,s*3],[5.4,s*1.7]],C.goldL);
    path([[1.1,s*7.5],[2.6,s*4.1],[2.3,s*2.4]],C.gold);
    poly([[2.5,s*2.1],[2.8,s*4.3],[1.5,s*7.1],[3.1,s*4.9],[4.1,s*2.6]],C.red);
    scroll(1.5,s*7,2.2,s*2.6,C.gold);
    gem(2.6,s*4.9,0.6,1.05);
  }
  poly([[0.5,-1.8],[2.1,-3],[4.6,-1.7],[5.4,0],[4.6,1.7],[2.1,3],[0.5,1.8]],C.goldD);
  path([[0.8,-1.5],[2.2,-2.4],[4.1,-1.3],[4.7,0],[4.1,1.3],[2.2,2.4],[0.8,1.5]],C.goldL);
  gem(2.2,0,1,1.5);
  // Asymmetric executioner blade: a wide dark face, silver bevel and hooked clipped point.
  poly([[4,-4],[9,-5.4],[43,-4.9],[52,-1.2],[49,2.5],[46,4.8],[10,5.4],[4,3.8]],C.ink);
  poly([[5.1,-3.4],[10,-4.6],[42.8,-4.2],[50.8,-1.2],[47.7,2],[45.7,4],[10,4.7],[5.1,3.2]],C.steelD);
  poly([[6,-3],[10,-3.9],[43,-3.6],[49.9,-1.1],[43.8,1.3],[9.8,2.8],[6,2.6]],C.shadow);
  poly([[6,2.5],[43.9,1.1],[50.8,-1.2],[49,1.7],[45.8,4.1],[10,4.7],[6,3.4]],C.silver);
  path([[6,3.35],[10,4.35],[45.6,3.8],[49,1.1],[51,-1.15]],C.edge);
  path([[7,-3.4],[11,-4.5],[42.8,-4.1],[48.7,-1.65]],C.steel);
  path([[10,3.8],[44,3.1],[48,1]],C.white);
  // Ruby fuller and articulated gold inlay, each repeat has an etched leaf pair.
  poly([[8.4,-1.4],[42,-2.1],[47.4,-1.1],[41.2,-0.3],[8.4,0.9]],C.goldD);
  poly([[9,-1.1],[42,-1.75],[45.5,-1.05],[40.9,-0.6],[9,0.45]],C.redD);
  path([[9,-1],[41.5,-1.6],[45.5,-1.05]],C.ruby);
  line(9,0.5,41,-0.55,C.bronze);
  for(let x=12;x<40;x+=6) {
    const y=0.4-(x-9)*0.032;
    scroll(x,y,4,1.7,C.gold);
    scroll(x+1,y+0.55,3.3,-1.45,C.bronze);
    poly([[x+0.7,y-0.5],[x+1.8,y-1.4],[x+2.5,y-1.3],[x+1.6,y-0.6]],C.goldL);
    poly([[x+1.8,y+0.8],[x+2.8,y+1.5],[x+3.5,y+1.4],[x+2.7,y+0.9]],C.gold);
    dot(x+2,y-1.5,C.goldL);dot(x+3.3,y+1.8,C.silver);
  }
  // Low-contrast damascene curls sit in the steel above the raised gold vine.
  for(let x=14;x<39;x+=7) {
    scroll(x,-2.55,4.5,0.8,C.steelD);
    path([[x,-3.2],[x+1.3,-3.5],[x+2,-3.25]],C.steel);
  }
  // Ricasso crest with an enamel lozenge, raised setting and four rivets.
  poly([[4,-2],[6,-3],[10,-2.3],[11.2,0],[9.8,2.5],[6,3],[4,2]],C.goldD);
  path([[4.6,-1.8],[6.2,-2.4],[9.3,-1.9],[10.5,0],[9.2,2],[6.2,2.4]],C.goldL);
  gem(7.1,0,2,2.4);
  for(const [x,y] of [[4.9,-1.2],[4.9,1.2],[9.1,-1.6],[9.1,1.6]]) {dot(x,y,C.ink);dot(x-0.25,y-0.25,C.ivory);}
  for(const [x,y] of [[16,3.4],[27,3],[38,2.7]]) line(x,y,x+1.4,y-0.2,C.steel);
});

const chain = art(({dot,line,path,poly,ellipse,gem,scroll,grip}) => {
  grip(-6.6,1.4,0.95);
  for(const x of [-7.4,0.8]) {
    poly([[x,-1.5],[x+0.9,-1.5],[x+0.9,1.5],[x,1.5]],C.ink);
    line(x+0.3,-1.25,x+0.3,1.25,C.silver);line(x+0.6,-1.1,x+0.6,1.1,C.blue);
  }
  ellipse(-8.2,0,1.65,1.65,C.ink);ellipse(-8.2,0,1.25,1.25,C.steelD);
  gem(-8.3,0,0.75,0.9,[C.violetD,C.blue,C.cyan,C.ice]);
  // Interlocking chain links with alternating face/edge-on orientations.
  for(let i=0;i<7;i++) {
    const x=-8.5-i*0.9,y=1.4+i*1.55;
    ellipse(x,y,i%2?0.6:1.1,i%2?1.25:0.9,C.ink,false);
    ellipse(x,y,i%2?0.4:0.85,i%2?1.05:0.65,C.steel,false);
    path([[x-0.5,y],[x-0.35,y-0.6],[x+0.2,y-0.7]],C.ice);
  }
  gem(-14.8,12.7,1.25,2,[C.violetD,C.violet,C.cyan,C.ice]);
  // Crescent basket guard: two swept horns and nested silver scrolls.
  for(const s of [-1,1]) {
    poly([[1.5,s*0.7],[-0.2,s*3.2],[-1.8,s*5.8],[0.5,s*7.4],[3.3,s*6.2],[5.5,s*2.3],[7,s*0.8]],C.ink);
    poly([[2,s*1],[0.4,s*3.2],[-0.8,s*5.6],[0.8,s*6.4],[2.7,s*5.5],[4.9,s*2],[5.8,s*1.1]],C.steelD);
    path([[0.7,s*6],[1.9,s*5.5],[3.5,s*2.6],[5.1,s*1.4]],C.edge);
    scroll(0.6,s*4.7,3.4,s*2.6,C.silver);
    gem(2.1,s*3.6,0.65,0.95,[C.violetD,C.blue,C.cyan,C.ice]);
  }
  // Curved obsidian blade, pronounced hook and an icy lower cutting edge.
  poly([[4,-2.6],[13,-3],[26,-4.2],[35,-5.3],[43,-9],[41,-3.2],[36,0],[25,1.3],[12,2.5],[4,2.3]],C.ink);
  poly([[5,-1.9],[13,-2.3],[26,-3.4],[35,-4.5],[41.8,-7.8],[39.8,-3.5],[35.7,-0.8],[25,0.6],[12,1.8],[5,1.6]],C.violetD);
  poly([[6,-1.5],[25,-3],[35,-4],[41,-7],[38.8,-3.4],[25,-0.8],[7,0.3]],C.violet);
  poly([[6,0.7],[25,-0.7],[38.8,-3.4],[41.8,-7.8],[40.3,-3.3],[35.6,-0.6],[25,0.7],[12,1.8],[6,1.5]],C.steel);
  path([[6,1.5],[25,0.6],[35.6,-0.8],[40,-3.5],[42,-7.9]],C.ice);
  path([[7,-1.8],[25,-3.25],[35,-4.4],[41.5,-7.6]],C.blue);
  // Silver vine above a broken runic channel, with deliberate dark counters in the glyphs.
  for(let i=0;i<6;i++) {
    const x=10+i*4.2,y=-0.6-i*0.27;
    path([[x-0.5,y-0.4],[x+0.3,y-1.2],[x+1.4,y-0.7],[x+0.7,y],[x+1.8,y+0.35]],i%2?C.silver:C.cyan);
    line(x+0.4,y-1.4,x+0.7,y+0.5,C.blue);
    dot(x+1.35,y-0.7,C.ice);
  }
  scroll(8,-0.6,3,1.4,C.silver);scroll(29,-2.25,4,1.5,C.silver);
  gem(4.9,0,1.3,1.8,[C.violetD,C.blue,C.cyan,C.ice]);
});

const cannon = art(({dot,line,path,poly,ellipse,gem,scroll}) => {
  // Stock, receiver and segmented barrel with a stepped muzzle and open bore.
  poly([[-11,-4],[-8,-5.5],[-5,-3.5],[-5,3.8],[-9,5],[-11,3]],C.ink);
  poly([[-10,-3.5],[-8,-4.6],[-6,-3],[-6,3],[-9,4],[-10,2.6]],C.redD);
  line(-9.5,-3.5,-9.5,2.8,C.ruby);
  path([[-9,-3.2],[-7.7,-3.8],[-6.7,-2.5],[-6.7,2.5],[-8.7,3.3]],C.bronze);
  gem(-8.2,-0.1,1,1.8,[C.goldD,C.bronze,C.gold,C.goldL]);
  poly([[-6,-5.5],[17.5,-5.5],[20,-4.2],[24,-4.2],[25,-2.8],[25,3.2],[23,4.8],[18,4.8],[16.5,5.5],[-6,5.5]],C.ink);
  poly([[-5.4,-4.8],[17,-4.8],[20,-3.5],[23.5,-3.5],[24.3,-2.5],[24.3,2.7],[22.5,4],[18,4],[16,4.8],[-5.4,4.8]],C.goldD);
  poly([[-5,-4],[16.6,-4],[20,-2.8],[22.6,-2.8],[22.6,2.8],[17.2,3.3],[-5,3.8]],C.shadow);
  poly([[-4.5,-3.6],[16,-3.6],[19.8,-2.3],[19.8,-1.1],[-4.5,-1.1]],C.steel);
  line(-4.4,-3.6,16,-3.6,C.silver);
  // Crimson pressure chamber framed by an engraved brass side plate.
  poly([[-3,-0.6],[14,-0.6],[16,0.4],[14,2.9],[-3,2.9]],C.bronze);
  poly([[-2.5,-0.15],[13.7,-0.15],[15,0.5],[13.5,2.3],[-2.5,2.3]],C.redD);
  line(-2.2,0.2,13.5,0.2,C.ruby);
  for(const x of [-1,3.5,8,12]) {
    scroll(x,1.3,2.5,0.9,C.gold);scroll(x+0.3,1.4,2.3,-0.65,C.bronze);
  }
  // Four armored collars, articulated bevels and paired rivets.
  for(const x of [-5,1.8,9,16.8]) {
    poly([[x,-5.2],[x+1.4,-5.2],[x+1.9,-3.5],[x+1.9,3.5],[x+1.4,5.2],[x,5.2],[x-0.4,3.3],[x-0.4,-3.3]],C.ink);
    poly([[x+0.1,-4.7],[x+1.05,-4.7],[x+1.45,-3.4],[x+1.45,3.4],[x+1.05,4.7],[x+0.1,4.7],[x-0.1,3.1],[x-0.1,-3.1]],C.gold);
    path([[x+0.2,-4.45],[x+0.7,-4.45],[x+1,-3.4],[x+1,3.4]],C.goldL);
    line(x+0.2,-3.1,x+0.2,3.3,C.bronze);
    for(const y of [-2.8,3]) {ellipse(x+0.65,y,0.4,0.4,C.goldD);dot(x+0.4,y-0.25,C.ivory);}
  }
  // Cooling fins and a cyan clockwork core recessed into the receiver.
  for(let x=4.5;x<15.5;x+=1.3) {
    line(x,-3,x+0.25,-1.5,C.ink);line(x+0.4,-3,x+0.65,-1.6,C.silver);
  }
  ellipse(-1,-1.4,2.1,2.1,C.ink);ellipse(-1,-1.4,1.75,1.75,C.goldD);
  ellipse(-1,-1.4,1.35,1.35,C.gold);gem(-1,-1.4,1,1.25,[C.violetD,C.blue,C.cyan,C.ice]);
  for(let i=0;i<8;i++){const a=i*Math.PI/4;line(-1+Math.cos(a)*1.8,-1.4+Math.sin(a)*1.8,-1+Math.cos(a)*2.25,-1.4+Math.sin(a)*2.25,C.goldL);}
  // Open muzzle has a separate shadowed bore; the sight and trigger remain separate silhouettes.
  poly([[21.4,-3.3],[23.5,-3.5],[24.5,-2.5],[24.5,2.7],[23.2,3.7],[21.4,3.5]],C.steelD);
  ellipse(23.2,0.1,1.15,2.7,C.ink);ellipse(23.4,0.2,0.6,1.85,C.black);
  path([[22.4,-2.3],[23,-2.7],[23.6,-2.2]],C.edge);
  poly([[-4,4],[-0.5,4],[-1.4,9],[-5,9],[-5.5,7.6]],C.ink);
  poly([[-3.8,4.6],[-1.2,4.6],[-2,8.3],[-4.5,8.3]],C.grip);
  for(const y of [5.4,6.3,7.2]) line(-4.4,y,-1.6,y,C.wrap);
  path([[-0.3,4],[2.5,4],[2.5,6],[-0.6,6]],C.goldD);
  poly([[6.6,-5],[7.4,-5],[7.4,-6.7],[6.6,-6.7]],C.goldD);
  line(6.8,-5.1,6.8,-6.5,C.gold);line(6.8,-6.7,9.2,-6.7,C.goldL);
  for(const [x,y] of [[-3,3.4],[5.8,3.2],[13.3,3.2]]) dot(x,y,C.patina);
});

export const DNF_WEAPON_SHAPES = Object.freeze({
  "blood-cleaver": { ...blood, two:-9 },
  "chain-blade": { ...chain, two:-4 },
  "hell-cannon": { ...cannon, two:-5 },
});
