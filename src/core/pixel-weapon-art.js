// Shared opaque texel composition: resolve all decoration before the rig depth test.
import { hex } from "./color.js";
export const WEAPON_ART_DENSITY = 4;
export const WEAPON_COLORS = Object.fromEntries(Object.entries({
  ink: "#100f1b", black: "#211b30", shadow: "#35324f", steelD: "#4f5675",
  steel: "#778ca8", silver: "#a7c3d4", edge: "#d5e9ee", white: "#fff7de",
  goldD: "#65412f", bronze: "#9a6339", gold: "#d19b51", goldL: "#efd08a", ivory: "#ffedb7",
  redD: "#381526", red: "#752238", ruby: "#c83e51", scarlet: "#ef796d",
  violetD: "#242239", violet: "#49466d", blue: "#477a98", cyan: "#75bdca", ice: "#c2e5e7",
  gripD: "#271827", grip: "#613445", wrap: "#a65a58", patina: "#456e6b",
}).map(([k,v]) => [k,hex(v) >>> 0]));


export function composeWeaponArt(paint, C = WEAPON_COLORS) {
  const Q = WEAPON_ART_DENSITY;
  const cells = new Map();
  const dot = (x,y,c) => { const key=`${Math.round(x*Q)},${Math.round(y*Q)}`; if(c==null) cells.delete(key); else cells.set(key,c); };
  const line = (x0,y0,x1,y1,c) => {
    const n = Math.max(1,Math.ceil(Math.hypot(x1-x0,y1-y0)*Q*1.5));
    for(let i=0;i<=n;i++) dot(x0+(x1-x0)*i/n,y0+(y1-y0)*i/n,c);
  };
  const path = (points,c) => {
    for(let i=1;i<points.length;i++) line(...points[i-1],...points[i],c);
  };
  const poly = (points,c) => {
    const loX=Math.floor(Math.min(...points.map(p=>p[0]))*Q),hiX=Math.ceil(Math.max(...points.map(p=>p[0]))*Q);
    const loY=Math.floor(Math.min(...points.map(p=>p[1]))*Q),hiY=Math.ceil(Math.max(...points.map(p=>p[1]))*Q);
    for(let iy=loY;iy<=hiY;iy++) for(let ix=loX;ix<=hiX;ix++) {
      const x=ix/Q,y=iy/Q;let inside=false;
      for(let i=0,j=points.length-1;i<points.length;j=i++) {
        const [ax,ay]=points[i],[bx,by]=points[j];
        if((ay>y)!==(by>y)&&x<(bx-ax)*(y-ay)/(by-ay)+ax) inside=!inside;
      }
      if(inside) dot(x,y,typeof c==="function"?c(x,y):c);
    }
  };
  const ellipse = (x,y,rx,ry,c,fill=true) => {
    if(fill) {
      for(let yy=Math.floor((y-ry)*Q);yy<=Math.ceil((y+ry)*Q);yy++)
        for(let xx=Math.floor((x-rx)*Q);xx<=Math.ceil((x+rx)*Q);xx++)
          if(((xx/Q-x)/rx)**2+((yy/Q-y)/ry)**2<=1) dot(xx/Q,yy/Q,c);
    } else {
      const n=Math.ceil(Math.max(rx,ry)*Q*8);
      for(let i=0;i<=n;i++) dot(x+Math.cos(i/n*Math.PI*2)*rx,y+Math.sin(i/n*Math.PI*2)*ry,c);
    }
  };
  const gem = (x,y,rx,ry,colors=[C.redD,C.red,C.ruby,C.scarlet]) => {
    const pts=[[x-rx,y],[x,y-ry],[x+rx,y],[x,y+ry]];
    poly(pts,C.ink);
    poly([[x-rx+0.3,y],[x,y-ry+0.3],[x+rx-0.3,y],[x,y+ry-0.3]],colors[1]);
    poly([[x-rx+0.35,y],[x,y-ry+0.35],[x,y+0.25]],colors[2]);
    poly([[x,y-ry+0.35],[x+rx-0.3,y],[x,y+0.25]],colors[0]);
    poly([[x-rx+0.4,y],[x,y+0.25],[x,y+ry-0.35]],colors[3]);
    dot(x-0.25,y-ry+0.75,C.white);dot(x-0.5,y-ry+1,C.white);
  };
  const scroll = (x,y,length,height,c) => {
    // A stem with a tightly curled terminal, kept as contiguous pixel clusters.
    path([[x,y],[x+length*0.28,y-height*0.65],[x+length*0.62,y-height],[x+length,y-height*0.75]],c);
    const cx=x+length*0.78,cy=y-height*0.45;
    for(let i=0;i<=24;i++) {
      const u=i/24,a=-Math.PI*0.4+u*Math.PI*1.75,r=height*(0.47-u*0.3);
      dot(cx+Math.cos(a)*r,cy+Math.sin(a)*r,c);
    }
  };
  const grip = (from,to,r=1.15) => {
    poly([[from,-r],[to,-r],[to,r],[from,r]],C.ink);
    poly([[from+0.2,-r+0.25],[to,-r+0.25],[to,r-0.2],[from+0.2,r-0.2]],C.grip);
    for(let x=from+0.4;x<to;x+=1.5) {
      line(x,-r+0.25,x+0.9,r-0.25,C.wrap);
      line(x+0.3,-r+0.2,x+1.1,r-0.2,C.gripD);
    }
    line(from,-r,to,-r,C.bronze);
  };
  const rect = (x,y,w,h,c) => poly([[x,y],[x+w,y],[x+w,y+h],[x,y+h]],c);
  paint({dot,line,path,poly,ellipse,gem,scroll,grip,rect,C});
  const pixels=[...cells].map(([key,c])=>{const [x,y]=key.split(",").map(Number);return {x:x/Q,y:y/Q,c};});
  const bounds={x0:Math.min(...pixels.map(p=>p.x)),x1:Math.max(...pixels.map(p=>p.x)),y0:Math.min(...pixels.map(p=>p.y)),y1:Math.max(...pixels.map(p=>p.y))};
  return { pixels, bounds, density:Q, draw(T) { for(const p of pixels) T(p.x,p.y,p.c); } };
}

export const weaponPalette = overrides => ({ ...WEAPON_COLORS, ...Object.fromEntries(Object.entries(overrides).map(([k,v])=>[k,hex(v)>>>0])) });
