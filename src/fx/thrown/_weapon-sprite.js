// Flight and held views sample the same authored equipment texels.
import {THROWN_SHAPES} from "../../core/weapons.js";

export function drawWeaponSprite(p,id,x,y,angle,{alpha=1,scale=1,pivot=[0,0],filter,map,tint}={}){
  const model=THROWN_SHAPES[id],ca=Math.cos(angle),sa=Math.sin(angle);
  for(const q of model.pixels){
    if(filter&&!filter(q))continue;
    let point=[(q.x-pivot[0])*scale,(q.y-pivot[1])*scale];
    if(map){point=map(...point,q);if(!point)continue;}
    const [u,v]=point;
    p.px(x+ca*u-sa*v,y+sa*u+ca*v,tint?tint(q.c,q):q.c,alpha);
  }
}
