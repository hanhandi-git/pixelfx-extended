import {composeWeaponArt,WEAPON_COLORS as C} from "./pixel-weapon-art.js";
import {WEAPON_PALETTES as P} from "./ornate-blades.js";

function shaftModel(id){
  const staff=id==="staff",lance=id==="lance",scythe=id==="scythe";
  const lo=staff?-25:lance?-21:scythe?-16:-18,hi=staff?34:lance?43:scythe?31:36,tip=lance?62:47;
  const model=composeWeaponArt(({C,poly,line,path,ellipse,gem,grip,scroll,dot})=>{
    poly([[lo,-1.1],[hi,-1.1],[hi,1.1],[lo,1.1]],C.ink);poly([[lo+.3,-.75],[hi,-.75],[hi,.65],[lo+.3,.65]],C.grip);
    line(lo+.5,-.55,hi,-.55,C.bronze);line(lo+.6,.5,hi,.5,C.gripD);line(lo+.5,-.8,hi,-.8,C.gold);
    for(let x=lo+2;x<hi;x+=4){path([[x,-.5],[x+.8,.5],[x+1.4,-.3]],C.goldD);dot(x,-.6,C.gold);}
    grip(-12,1,1.2);
    for(const x of [lo,lo+3,hi-5,hi-2]){poly([[x,-1.5],[x+1.6,-1.5],[x+1.6,1.5],[x,1.5]],C.goldD);line(x+.3,-1.3,x+.3,1.3,C.goldL);for(const s of [-1,1])dot(x+1,s,C.gold);}
    if(staff){
      for(const x of [lo+.8,hi-1.8]){ellipse(x,0,1.7,1.8,C.goldD);gem(x,0,.9,1.25);scroll(x-1,-.5,2.3,1,C.goldL);}
    }else if(scythe){
      for(let i=0;i<=112;i++){const u=i/112,x=31.5-u*u*12,y=.8+u*28,w=3.2*(1-u)+.3;for(let xx=x-w;xx<=x+w;xx+=.25)dot(xx,y,xx<x-w*.6?C.ink:xx<x?C.shadow:xx<x+w*.55?C.silver:C.edge);}
      for(let j=3;j<26;j+=4){const x=31.5-(j/28)**2*12;path([[x-.9,j],[x+.2,j+1.4],[x+1.1,j]],C.gold);}
      ellipse(30,0,3.1,3.3,C.goldD);gem(30,0,1.8,2.3);
    }else{
      const w=lance?3.6:2.7;poly([[hi-1,-1.4],[hi+5,-w],[tip,0],[hi+5,w],[hi-1,1.4]],C.ink);
      poly([[hi,-1],[hi+5,-w+.6],[tip-.7,0],[hi+5,w-.7],[hi,1]],C.steel);poly([[hi+.2,0],[hi+5,.2],[tip-.7,0],[hi+5,w-.7]],C.edge);
      line(hi+1,0,tip-1,0,C.gold);scroll(hi+2,-.4,3,1,C.goldL);gem(hi-.4,0,.7,1.2);
      if(lance){poly([[hi-1,1],[hi-3,8],[hi-9,8.8],[hi-7,5],[hi-12,6],[hi-4,1]],C.redD);poly([[hi-2,1.5],[hi-4,6.8],[hi-8,7.5],[hi-6,4.5]],C.red);path([[hi-2,2],[hi-4,6],[hi-7,6.8]],C.gold);}
    }
  },scythe?P.shadow:P.steel);
  return {...model,two:staff?-9:lance?-11:scythe?-11:-12};
}

function hammerModel(id){
  const mace=id==="war-mace",from=mace?-8:-10,base=mace?20:18,end=mace?32:28,R=mace?6.4:9;
  return {...composeWeaponArt(({C,poly,line,path,ellipse,gem,grip,scroll})=>{
    poly([[from,-1.2],[base+1,-1.2],[base+1,1.2],[from,1.2]],C.ink);grip(from+1,2,1.05);
    line(2,-.6,base,-.6,C.silver);line(2,.6,base,.6,C.steelD);
    for(const x of [from,4,12,base-1]){poly([[x,-1.6],[x+1,-1.6],[x+1,1.6],[x,1.6]],C.goldD);line(x+.25,-1.3,x+.25,1.3,C.goldL);}
    poly([[base,-R+2],[base+2,-R],[end-2,-R],[end,-R+2],[end,R-2],[end-2,R],[base+2,R],[base,R-2]],C.ink);
    poly([[base+.6,-R+2],[base+2.3,-R+.7],[end-2.3,-R+.7],[end-.7,-R+2],[end-.7,R-2],[end-2.3,R-.7],[base+2.3,R-.7],[base+.6,R-2]],C.steelD);
    poly([[base+1,-R+2.3],[end-1,-R+2.3],[end-1,R-2],[base+1,R-2]],C.steel);path([[base+1,-R+1.8],[end-1.5,-R+1.8],[end-.8,-R+2.5]],C.edge);line(base+1,R-1.5,end-1,R-1.5,C.shadow);
    for(const s of [-1,1]){if(mace)for(const x of [base+3,end-3])poly([[x-1,s*(R-1)],[x+.5,s*(R+3.8)],[x+1.4,s*(R-1)]],C.silver);for(const x of [base+2,end-2])ellipse(x,s*(R-2),.65,.65,C.goldD);scroll(base+2,s*(R-3),end-base-4,s*2,C.goldL);}
    ellipse((base+end)/2,0,2.7,3.5,C.goldD);gem((base+end)/2,0,1.8,2.5);if(mace)poly([[end-1,-1.4],[end+3,0],[end-1,1.4]],C.silver);
  },P.steel),two:mace?-5:-7};
}

const claw=composeWeaponArt(({C,poly,line,path,gem,dot})=>{
  poly([[-1,-3.6],[3,-4],[5,-2.8],[5,2.8],[3,4],[-1,3.6]],C.ink);poly([[-.4,-3],[2.6,-3.3],[4.1,-2.4],[4.1,2.4],[2.6,3.3],[-.4,3]],C.goldD);
  path([[0,-2.6],[3,-2.8],[3.7,-2],[3.7,2],[3,2.8],[0,2.6]],C.goldL);gem(1.8,0,1.1,1.6);
  for(const s of [-1,1]){path([[0,s*2],[.5,s*1.3],[1,s*2],[1.4,s*2.6]],C.gold);line(-.4,s*2.7,.5,s*2.7,C.silver);}
  for(const yy of [-2.4,0,2.4])for(let x=3;x<=9.5;x+=.25){const u=(x-3)/6.5,y=yy+u*u*1.8;dot(x,y,C.edge);if(u<.9)dot(x,y+.35,C.steel);if(u<.7)dot(x,y+.65,C.shadow);}
  for(const yy of [-2.4,2.4])line(2,yy,5,yy+.5,C.silver);
});

function gunModel(id){const launcher=id==="launcher";return {...composeWeaponArt(({C,poly,line,path,ellipse,gem,scroll,grip})=>{
  if(launcher){
    poly([[-14,-6.8],[21,-6.8],[23,-5.5],[23,-.5],[21,.3],[-14,.3]],C.ink);poly([[-13.5,-6.1],[20.5,-6.1],[22.3,-5.1],[22.3,-1],[20.3,-.5],[-13.5,-.5]],C.steelD);poly([[-12.8,-5.5],[19.8,-5.5],[19.8,-2],[-12.8,-2]],C.shadow);
    for(const x of [-13,-7,0,9,19.5]){poly([[x,-6.6],[x+1,-6.6],[x+1,-.2],[x,-.2]],C.goldD);line(x+.25,-6.2,x+.25,-.6,C.goldL);}
    for(let x=2;x<17;x+=1.7){line(x,-5,x+.3,-3.5,C.ink);line(x+.5,-5,x+.8,-3.5,C.silver);}scroll(-5,-2.7,5.4,1.6,C.gold);gem(-3,-3.9,1.8,1.6);ellipse(22,-3.4,.8,2.1,C.ink);grip(-10,-5,1.1);
  }else{
    poly([[-1.8,-4.8],[8.3,-4.8],[10,-4],[10,-2.4],[8.7,-1.8],[1,-1.8],[.5,2.6],[-2,2.6]],C.ink);poly([[-1.2,-4.2],[8.3,-4.2],[9.3,-3.7],[9.3,-2.7],[8.5,-2.4],[.2,-2.4]],C.steelD);
    line(-.8,-4.1,8.1,-4.1,C.edge);line(.2,-2.8,8.9,-2.8,C.gold);scroll(1,-3.2,4.7,.8,C.goldL);poly([[-1.4,-2],[.8,-2],[.1,2],[-1.6,2]],C.grip);path([[-1,-1.6],[-.1,-1],[0,1.4],[-1.2,1.5]],C.bronze);
    gem(-.7,.1,.5,.8);ellipse(9.6,-3.25,.35,.75,C.ink);poly([[6.7,-4.7],[7.2,-4.7],[7.2,-5.4],[6.7,-5.4]],C.gold);
  }
}),...(launcher?{two:-9}:{across:true})};}

function bowModel(){
  const body=composeWeaponArt(({C,poly,line,path,ellipse,gem,scroll,dot})=>{
    for(let i=0;i<=136;i++){const u=-1+i/68,y=u*17,x=6*(1-u*u)-1;for(let j=-.7;j<=.7;j+=.25)dot(x+j,y,j<-.4?C.edge:j<0?C.gold:C.grip);}
    for(const s of [-1,1]){path([[0,s*16],[2,s*12],[4.5,s*7]],C.goldL);gem(3.8,s*8,.8,1.4);scroll(1,s*13,3,s*2,C.gold);ellipse(-.8,s*16.7,.65,.85,C.goldD);}
    poly([[3.5,-3],[5.8,-3],[5.8,3],[3.5,3]],C.gripD);for(let y=-2.5;y<2.6;y+=1)line(3.6,y,5.6,y+.3,C.wrap);
  },P.jade);
  const full=composeWeaponArt(({dot})=>{for(const p of body.pixels)dot(p.x,p.y,p.c);for(let y=-17;y<=17;y+=.25)dot(-1,y,C.silver);});
  const string=(T,A,B)=>{const n=Math.max(1,Math.ceil(Math.hypot(...B.map((v,i)=>v-A[i]))*4));for(let i=0;i<=n;i++)T(A[0]+(B[0]-A[0])*i/n,A[1]+(B[1]-A[1])*i/n,C.silver,A[2]+(B[2]-A[2])*i/n);};
  return {...full,across:true,draw(T,q={},off){
    body.draw(T);let mid=[-1,0,0];
    if(q.pull&&off&&T.at){const O=T.at(0,0),X=T.at(1,0).map((v,i)=>v-O[i]),Y=T.at(0,1).map((v,i)=>v-O[i]),Z=[X[1]*Y[2]-X[2]*Y[1],X[2]*Y[0]-X[0]*Y[2],X[0]*Y[1]-X[1]*Y[0]],V=off.map((v,i)=>v-O[i]);mid=[X,Y,Z].map(A=>A.reduce((s,v,i)=>s+v*V[i],0)/(A.reduce((s,v)=>s+v*v,0)||1));}
    string(T,[-1,-17,0],mid);string(T,[-1,17,0],mid);if(q.nocked){string(T,mid,[13,0,0]);for(let i=9;i<13;i+=.25)T(i,(13-i)*.35,C.edge);}
  }};
}

export const ORNATE_EQUIPMENT={staff:shaftModel("staff"),spear:shaftModel("spear"),lance:shaftModel("lance"),scythe:shaftModel("scythe"),hammer:hammerModel("hammer"),"war-mace":hammerModel("war-mace"),claw,bow:bowModel(),pistol:gunModel("pistol"),launcher:gunModel("launcher")};
