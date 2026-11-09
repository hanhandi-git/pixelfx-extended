// Full-detail inventory presentation of the same grip-space model the character holds.
// One source texel becomes one display pixel. The metal and engraving stay opaque;
// sparse light stays outside the silhouette so it cannot bleach the decoration away.
import { DNF_WEAPON_SHAPES } from "../../core/dnf-weapons.js";
import { fit, TAU, mix, WHITE } from "../../core/index.js";

export function ornateWeaponDrop({ id,name,desc,palette,seed }) {
  const model=DNF_WEAPON_SHAPES[id], Q=model.density;
  const upright=id!=="hell-cannon", cx=(model.bounds.x0+model.bounds.x1)/2;
  const pixels=model.pixels.map(({x,y,c})=>({x:Math.round((upright?y:x-cx)*Q),y:Math.round((upright?-x:y)*Q),c}));
  const minY=Math.min(...pixels.map(p=>p.y)),maxY=Math.max(...pixels.map(p=>p.y));
  const minX=Math.min(...pixels.map(p=>p.x)),maxX=Math.max(...pixels.map(p=>p.x));
  const width=Math.max(128,Math.ceil((Math.max(Math.abs(minX),Math.abs(maxX))+24)*2));
  const height=maxY-minY+66, origin=[Math.ceil(width/2),height-14];
  const offset=-19-maxY;
  const meta={name,desc,tags:["dnf","武器","weapon",id,"equipment","drop","engraved","loop"],
    size:[width,height],origin,duration:3.2,loop:true,fps:30,bg:"ground",options:{palette,seed}};
  const placement=t=>({x:Math.round(Math.sin(t/meta.duration*TAU)*1.2),y:offset+Math.round(Math.sin(t/meta.duration*TAU)*2)});
  function drawBack(p,t,o) {
    const C=fit(o.palette,8),phase=t/meta.duration*TAU;
    p.ellipse(0,0,20,3,C[1],0.6);
    // Deliberately keep both circles low in contrast under the engraved item.
    for(let i=0;i<64;i++) {
      const a=i/64*TAU;
      p.px(Math.cos(a)*22,Math.sin(a)*4.5,C[3],0.5);
    }
    for(let i=0;i<6;i++) {
      const a=i/6*TAU+phase/6;
      p.line(Math.cos(a)*25,Math.sin(a)*5,Math.cos(a+0.08)*25,Math.sin(a+0.08)*5,C[5],0.7);
    }
    p.glow(0,-2,26,C[4],0.1);
  }
  function draw(p,t,o) {
    const C=fit(o.palette,8),phase=t/meta.duration,at=placement(t);
    const sheen=(phase-0.46)/0.27;
    for(const q of pixels) {
      const u=(q.y-minY)/Math.max(1,maxY-minY),k=sheen>0&&sheen<1?Math.max(0,1-Math.abs(u-sheen)/0.035)*0.17:0;
      p.px(q.x+at.x,q.y+at.y,k?mix(q.c,WHITE,k):q.c);
    }
    // A single jewel glint and only six drifting motes; the body remains the focal point.
    const beat=Math.max(0,Math.cos(phase*TAU-1.4))**18;
    const gy=at.y-6*Q;
    if(beat>0.15) {
      p.line(at.x-2,gy,at.x+2,gy,C[6],beat*0.55);
      p.line(at.x,gy-2,at.x,gy+2,C[6],beat*0.55);
      p.glow(at.x,gy,7,C[5],beat*0.12);
    }
    for(let i=0;i<6;i++) {
      const a=phase*TAU+i*TAU/6;
      const x=Math.sin(a)*((maxX-minX)/2+9),y=at.y+minY+(1-Math.cos(a))*0.5*(maxY-minY);
      const alpha=0.3+0.2*Math.sin(a*2);
      p.dot(x,y,C[i%2?4:5],alpha);
    }
  }
  return {meta,draw,drawBack};
}
