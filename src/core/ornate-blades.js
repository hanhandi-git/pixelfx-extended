import {composeWeaponArt,weaponPalette,WEAPON_COLORS} from "./pixel-weapon-art.js";

const palettes={
  steel:WEAPON_COLORS,
  holy:weaponPalette({shadow:"#615345",steelD:"#9b937e",steel:"#cbc8af",silver:"#e6e3c9",edge:"#fff5d5",redD:"#3b392d",red:"#667857",ruby:"#9cc28a",scarlet:"#e3f4b2"}),
  ember:weaponPalette({shadow:"#3a1e30",steelD:"#683745",steel:"#b55e52",silver:"#dd9366",edge:"#ffdda0",redD:"#3e1424",red:"#9c2e36",ruby:"#ef713c",scarlet:"#ffd08c"}),
  ice:weaponPalette({shadow:"#20344f",steelD:"#38627e",steel:"#65a2b4",silver:"#a1d3dd",edge:"#e4faff",redD:"#1c3045",red:"#396b87",ruby:"#78c3d9",scarlet:"#d7ffff",goldD:"#36546c",bronze:"#668fa6",gold:"#a7ced4",goldL:"#e8f2de"}),
  shadow:weaponPalette({shadow:"#251d3d",steelD:"#47385f",steel:"#75668e",silver:"#aa9dc1",edge:"#e8d4e9",redD:"#25132e",red:"#58315e",ruby:"#9c5ba0",scarlet:"#e8a4c0",goldD:"#443745",bronze:"#786576",gold:"#ad91a1",goldL:"#e2c9c1"}),
  jade:weaponPalette({shadow:"#163e39",steelD:"#2f6557",steel:"#5e9b76",silver:"#a0d0a5",edge:"#def1c0",redD:"#173a36",red:"#347c6a",ruby:"#76b68e",scarlet:"#d6e9ac"}),
  sky:weaponPalette({shadow:"#293e65",steelD:"#42698f",steel:"#77a8c7",silver:"#bad6e6",edge:"#eef9ef",ruby:"#77bada",scarlet:"#d0f8ff"}),
};
export {palettes as WEAPON_PALETTES};

function bladeModel(o){
  const L=o.tip,start=4.4,W=o.width??2.6,colors=palettes[o.palette??"steel"];
  const bend=x=>-(o.bend??0)*Math.max(0,(x-start)/(L-start))**2;
  const model=composeWeaponArt(({C,poly,line,path,ellipse,gem,grip,scroll,dot})=>{
    const h=o.hilt??7,g=o.guard??5;grip(-h,2,Math.min(1.2,W*.5));
    ellipse(-h-.7,0,1.5,1.8,C.ink);ellipse(-h-.7,0,1.15,1.35,C.goldD);gem(-h-.8,0,.75,1.05);
    for(const x of [-h+.2,1.3]){poly([[x,-1.5],[x+.7,-1.5],[x+.7,1.5],[x,1.5]],C.goldD);line(x+.2,-1.25,x+.2,1.25,C.goldL);}
    for(const s of [-1,1]){
      if(o.guardKind==="butterfly"){
        poly([[2,s],[3.8,s*g],[6.4,s*(g+1)],[7.8,s*(g-2)],[5.7,s*1.8]],C.ink);
        poly([[2.7,s*1.3],[4.1,s*(g-.5)],[6.1,s*(g+.1)],[6.9,s*(g-2)],[5.2,s*1.8]],C.red);
        path([[3.1,s*1.5],[5.7,s*(g-.4)],[6.4,s*(g-2)]],C.goldL);line(4.3,s*2.4,6.3,s*(g-2),C.scarlet);
      }else if(o.guardKind==="horn"){
        poly([[2,s],[2.1,s*4],[-1,s*g],[-2.5,s*(g+1)],[-1.3,s*(g-2)],[.5,s*2.1]],C.ink);
        path([[1.1,s*1.8],[1,s*3.8],[-1.2,s*(g-.2)]],C.steel);path([[1.7,s*2],[1.3,s*4.2],[-.7,s*(g-.7)]],C.silver);
      }else if(o.guardKind==="dragon"){
        poly([[2,s*1.1],[4,s*(g-.5)],[7,s*(g+.8)],[10,s*(g-1)],[6,s*2]],C.ink);
        poly([[2.8,s*1.5],[4.7,s*(g-.9)],[7,s*(g-.1)],[8.9,s*(g-1)],[5.7,s*2.2]],C.gold);
        path([[3.5,s*1.8],[5.5,s*(g-1.5)],[7.5,s*(g-1)]],C.goldL);
        for(let i=0;i<3;i++)line(5+i,s*(3+i*.5),6+i,s*(2.6+i*.5),C.goldD);gem(6.5,s*3.5,.5,.65);
      }else if(o.guardKind==="star"){
        poly([[1.3,s],[1.5,s*g],[3.4,s*3],[6.8,s*(g-1)],[5.4,s*.7]],C.goldD);path([[2,s*(g-1.2)],[2.8,s*2],[5.8,s*(g-1.7)]],C.goldL);
      }else if(o.guardKind==="cloud"){
        for(let j=0;j<3;j++){ellipse(3.1,s*(1.9+j*1.5),1.1,1.1,C.goldD);ellipse(3,s*(1.8+j*1.5),.72,.7,C.goldL);}
      }else if(o.guardKind==="cup"){
        ellipse(2.9,s*1.8,2.3,g*.7,C.ink,false);ellipse(2.7,s*1.7,1.9,g*.58,C.gold,false);scroll(1.1,s*2.2,3.3,s*1.8,C.goldL);
      }else{
        poly([[1.4,s],[1,s*(g-.6)],[2.3,s*g],[3.8,s*(g-.8)],[4.8,s*1.2]],C.ink);
        poly([[2,s],[1.8,s*(g-1)],[2.5,s*(g-.6)],[3.2,s*(g-1.2)],[4,s*1.2]],C.gold);path([[2.2,s*1.4],[2.4,s*(g-1.4)],[3,s*(g-1.6)]],C.goldL);
      }
      if(!["cup","cloud","horn"].includes(o.guardKind)){
        scroll(2.2,s*(g*.55),1.65,s*Math.min(1.4,g*.28),C.bronze);
        path([[2.7,s*1.6],[3.1,s*(g*.55)],[2.8,s*(g-.9)]],C.goldL);
        gem(2.6,s*(g*.5),.4,.65);
      }
    }
    for(let ix=Math.ceil(start*4);ix<=Math.round(L*4);ix++){
      const x=ix/4,u=(x-start)/(L-start),cy=bend(x),tooth=o.serrated?(Math.floor(u*8)%2)*.6:0;
      const w=(u>.82?Math.max(.12,(1-u)/.18):1)*(W+tooth);
      for(let iy=Math.floor((cy-w)*4);iy<=Math.ceil((cy+w)*4);iy++){
        const y=iy/4,q=(y-cy)/Math.max(w,.1);if(Math.abs(q)>1)continue;
        let c=Math.abs(q)>.94?C.ink:q>.65?C.edge:q>.36?C.silver:q>.1?C.steel:q>-.48?C.shadow:q>-.8?C.steelD:C.steel;
        if(o.energy)c=Math.abs(q)<.17?C.white:Math.abs(q)<.52?C.cyan:Math.abs(q)<.83?C.blue:C.violet;
        if(o.hollow&&u>.12&&u<.84&&Math.abs(q)<.18)continue;dot(x,y,c);
      }
    }
    const end=L-3;
    if(W>2.2&&!o.energy){
      for(let x=start+3;x<end-2;x+=6.6){
        const cy=bend(x);scroll(x,cy-W*.6,3.7,.65,C.steelD);
        path([[x,cy-W*.73],[x+1.1,cy-W*.8],[x+2,cy-W*.67]],C.steel);
      }
    }
    if(o.motif==="scales"){
      for(let x=start+3;x<end;x+=2.7){const cy=bend(x);path([[x,cy+W*.35],[x+1.2,cy+W*.68],[x+2.4,cy+W*.3]],C.gold);path([[x+.4,cy-.4],[x+1.4,cy-.8],[x+2.2,cy-.35]],C.silver);}
    }else if(o.motif==="thunder"){
      const pts=[];for(let x=start+2,i=0;x<end;x+=2.5,i++)pts.push([x,bend(x)+(i%2?-.65:.65)]);path(pts,C.goldL);for(const[x,y]of pts)dot(x,y,C.ice);
    }else if(o.motif==="ice"||o.motif==="stars"){
      for(let x=start+3;x<end;x+=5){const y=bend(x);path([[x-1,y],[x,y-1.2],[x+1,y],[x,y+1.2],[x-1,y]],C.silver);dot(x,y,C.white);if(o.motif==="stars")line(x-1.5,y,x+1.5,y,C.goldL);}
    }else if(o.motif==="runes"){
      for(let x=start+3,i=0;x<end;x+=4.4,i++){const y=bend(x);path([[x,y-.8],[x+.7,y+.6],[x+1.4,y-.5],[x+2,y+.3]],i%2?C.cyan:C.gold);line(x+.5,y-1.1,x+1.2,y+.9,C.silver);}
    }else{
      const pts=[];for(let x=start+3;x<end;x+=.5)pts.push([x,bend(x)]);path(pts,C.bronze);
      for(let x=start+3,i=0;x<end;x+=5.2,i++){const y=bend(x),s=i%2?-1:1;scroll(x,y,3.5,s*Math.min(1.5,W*.6),C.gold);poly([[x+.6,y],[x+1.3,y+s],[x+2,y+s*.9],[x+1.2,y+s*.3]],C.goldL);}
    }
    gem(start+.7,0,Math.min(1.4,W*.6),Math.min(2,W*.8));
    if(o.motif==="eye"){ellipse(start+2,0,2.1,1.2,C.goldD);ellipse(start+2,0,1.7,.8,C.ruby);line(start+2,-.7,start+2,.7,C.ink);dot(start+1.5,-.3,C.white);}
    if(o.tassel)for(const s of [-1,1]){path([[-h-.8,.7],[-h-2,2.2],[-h-1.4+s,5],[-h-2+s*1.2,6.4]],WEAPON_COLORS.red);line(-h-1.7+s,4.5,-h-2+s*1.2,6.4,WEAPON_COLORS.scarlet);}
  },colors);
  return {...model,two:o.two,tip:L};
}

const specs={
  sword:{tip:28,width:2.3,hilt:6.5,guard:4.6,two:-4.4},
  greatsword:{tip:34,width:3.2,hilt:7.2,guard:6.6,two:-4.8,motif:"runes"},
  dagger:{tip:14,width:2.2,hilt:3.8,guard:3.2,two:-3,motif:"stars"},
  "holy-sword":{tip:40,width:3.1,hilt:6.5,guard:7.8,two:-5,palette:"holy",motif:"runes",guardKind:"dragon"},
  katana:{tip:36,width:1.9,bend:2.8,hilt:7,guard:4,two:-5,motif:"runes",guardKind:"cup",tassel:true},
  kusanagi:{tip:36,width:2.2,hilt:7.6,guard:6,two:-7,palette:"jade",motif:"runes",guardKind:"cloud"},
  totsuka:{tip:44,width:2.8,hilt:10,guard:5,two:-9,palette:"shadow",guardKind:"dragon",motif:"runes",tassel:true},
  "blood-butterfly":{tip:44,width:2.6,bend:4.4,hilt:7.6,guard:5.7,two:-4.6,palette:"ember",guardKind:"butterfly",tassel:true},
  "ghost-blade":{tip:42,width:2.2,hilt:6.6,guard:7.6,two:-5,palette:"shadow",hollow:true,motif:"runes",guardKind:"cloud"},
  "demon-eye-greatsword":{tip:54,width:5,hilt:11.4,guard:7.6,two:-12,palette:"shadow",serrated:true,motif:"eye",guardKind:"horn"},
  "skyvault-greatsword":{tip:56,width:3.6,hilt:10.4,guard:7.4,two:-11,palette:"sky",motif:"stars",guardKind:"dragon"},
  "aurora-lightblade":{tip:46,width:2,hilt:6.4,guard:4.4,two:-4.4,palette:"ice",energy:true,motif:"ice",guardKind:"star"},
  "dragon-scale-sabre":{tip:48,width:3.5,bend:5.4,hilt:9.4,guard:4.2,two:-7.4,palette:"jade",motif:"scales",guardKind:"dragon",tassel:true},
  rapier:{tip:38,width:.85,hilt:4,guard:5,two:-3.5,motif:"stars",guardKind:"cup"},
  "ember-greatsword":{tip:59,width:5.2,hilt:11.8,guard:9,two:-12,palette:"ember",motif:"thunder",guardKind:"horn"},
  "frost-lightsword":{tip:54,width:2,hilt:7.4,guard:5.8,two:-5,palette:"ice",energy:true,motif:"ice",guardKind:"star"},
  "shadow-katana":{tip:48,width:2,bend:7.4,hilt:7.2,guard:5.5,two:-5,palette:"shadow",motif:"runes",guardKind:"cup",tassel:true},
  "thunder-claymore":{tip:56,width:5,hilt:10.2,guard:8,two:-10,palette:"sky",motif:"thunder",serrated:true,guardKind:"dragon"},
  "starlight-rapier":{tip:56,width:.95,hilt:4.8,guard:6.2,two:-3.5,palette:"holy",motif:"stars",guardKind:"star"},
  "flying-sword":{tip:17,width:1.6,hilt:3,guard:2.8,two:-2.4,palette:"jade",motif:"runes",guardKind:"cloud",tassel:true},
};
export const ORNATE_BLADES=Object.fromEntries(Object.entries(specs).map(([id,o])=>[id,bladeModel(o)]));
