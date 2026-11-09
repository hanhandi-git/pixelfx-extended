#!/usr/bin/env node
// Full native masters, held previews and paged review boards for every rig weapon.
import { join } from "node:path";
import { ARMORY, WEAPONS, posed, createFrame, composite } from "../src/core/index.js";
import { ROOT, canvas, upscale, save, loadEffect, renderAct, spriteSheet, writeVideo } from "./lib/fxlib.mjs";

const out=join(ROOT,"records","weapons"),models=Object.entries(WEAPONS),manifest=[];
const cw=464,ch=292,cols=3,perPage=9;
for(let page=0;page<Math.ceil(models.length/perPage);page++){
  const rows=Math.ceil(Math.min(perPage,models.length-page*perPage)/cols),board=canvas(cols*cw,rows*ch+38);
  board.text(`ENGRAVED ARMORY / ${models.length} MODELS / ${page+1}`,16,10,2);
  for(let j=0;j<perPage&&page*perPage+j<models.length;j++){
    const [id,model]=models[page*perPage+j],Q=model.density,b=model.bounds;
    const w=Math.round((b.x1-b.x0)*Q)+5,h=Math.round((b.y1-b.y0)*Q)+5;
    const pixels=new Uint32Array(w*h);
    for(const p of model.pixels)pixels[(Math.round((p.y-b.y0)*Q)+2)*w+Math.round((p.x-b.x0)*Q)+2]=p.c;
    const rgba=new Uint8ClampedArray(pixels.buffer),icon=canvas(w,h,[0,0,0,0]);icon.paste(rgba,w,h,0,0);save(join(out,`${id}.png`),icon.png());
    const entry=ARMORY.find(v=>v.id===id),x=j%cols*cw,y=38+Math.floor(j/cols)*ch;
    board.rect(x+5,y+4,cw-10,ch-8,[23,21,32,255]);board.text((entry?.name??id.replaceAll("-"," ")).toUpperCase(),x+16,y+14,2);
    const k=Math.max(1,Math.min(3,Math.floor((cw-32)/w),Math.floor(142/h)));
    board.paste(upscale(rgba,w,h,k),w*k,h*k,x+Math.floor((cw-w*k)/2),y+48+Math.floor((142-h*k)/2));
    const held=createFrame(112,88,0,0,2),r=posed({weapon:id,two:!!model.two,fx:7,fy:-24,sa:-.4,ffx:5,fbx:-6},"ember-duelist",{density:2});
    for(let i=0;i<r.n;i++){const xx=Math.round((30+r.xs[i])*2),yy=Math.round((80+r.ys[i])*2);if(xx>=0&&yy>=0&&xx<held.w&&yy<held.h)held.color[yy*held.w+xx]=r.color[i];}
    const heldRgba=composite(held,new Uint8ClampedArray(held.w*held.h*4),null);
    board.paste(heldRgba,held.w,held.h,x+Math.floor((cw-held.w)/2),y+102);
    board.text(`${w}X${h} / ${model.pixels.length} TEXELS`,x+16,y+ch-28,1,[168,159,184]);
    manifest.push({id,...(entry??{}),class:entry?.class??"rig",image:`${id}.png`,size:[w,h],density:Q,grip:[2-b.x0*Q,2-b.y0*Q],placed:entry?.drop??(id==="hell-cannon"?"dnf/hell-cannon":`weapons/${id}`)});
  }
  console.log(save(join(out,`armory-${page+1}.png`),board.png()));
}
save(join(out,"weapons.json"),JSON.stringify({filtering:"nearest",weapons:manifest},null,2));
if(process.argv.includes("--gif")||process.argv.includes("--sheet"))for(const w of ARMORY){
  const fx=await loadEffect(w.fx),r=renderAct(fx,{fps:30,options:{character:"ember-duelist"},hold:.15});
  if(process.argv.includes("--gif")){const file=join(out,`${w.id}.gif`);if(!writeVideo(file,r,3))throw Error("ffmpeg is required");console.log(file);}
  if(process.argv.includes("--sheet")){const s=spriteSheet(fx,r,w.id);s.json.meta.pixelfx.pivot=r.pivot;s.json.meta.pixelfx.weapon=w.id;save(join(out,`${w.id}.sheet.png`),s.png);save(join(out,`${w.id}.sheet.json`),JSON.stringify(s.json,null,1));}
}
