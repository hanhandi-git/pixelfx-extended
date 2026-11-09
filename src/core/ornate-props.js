import {composeWeaponArt,WEAPON_COLORS as BASE} from "./pixel-weapon-art.js";
import {WEAPON_PALETTES as P} from "./ornate-blades.js";

function propModel(id){return composeWeaponArt(({C,poly,line,path,ellipse,gem,grip,scroll,dot,rect})=>{
  if(id==="kunai"){
    grip(-4,2.1,.75);ellipse(-6,0,2,2,C.steelD);ellipse(-6,0,1.25,1.25,null);path([[-7.3,-.6],[-6.6,-1.4],[-5.4,-1.4]],C.edge);
    poly([[2.4,-1.3],[7,-3.2],[17,0],[7,3.2],[2.4,1.3]],C.ink);poly([[3,-.7],[7,-2.5],[16.2,0],[7,.3]],C.silver);poly([[3,.2],[7,.2],[16.2,0],[7,2.5],[3,.8]],C.steelD);
    line(5,0,14.8,0,C.edge);path([[6.2,-1],[7,-1.7],[8,-1],[7,-.4],[6.2,-1]],C.gold);gem(2.4,0,.65,1.3);
  }else if(id==="powder-bomb"){
    grip(-3.5,2,.7);ellipse(8,0,5.4,5.4,C.ink);ellipse(7.8,-.2,4.7,4.8,C.shadow);poly([[4.2,-2.4],[6.1,-4.3],[9.6,-4.2],[11.3,-2.7],[10.8,-1.2],[5.4,-1.2]],C.steelD);
    path([[4.3,-2.5],[6,-4.1],[9.7,-4]],C.silver);rect(6.4,-5,1.1,10,C.goldD);line(6.7,-4.8,6.7,4.6,C.goldL);scroll(8,-.5,3,1.7,C.gold);scroll(8,1.2,2.7,-1.5,C.bronze);gem(9.5,0,1,1.4);
    path([[4,1.4],[5.4,3.4],[8,4.2],[10.5,3.3]],C.steelD);path([[4.4,-1.2],[5.1,-2],[5.7,-1.2]],C.gold);
    for(const[x,y]of[[5,1.3],[8,-3.3],[11,1.5]]){ellipse(x,y,.45,.45,C.goldD);dot(x-.25,y-.25,C.goldL);}
    path([[12,-3.6],[13.6,-5.3],[15.2,-5.1],[16,-6.8]],C.bronze);path([[12,-3.8],[13.7,-5.6],[15,-5.4]],C.goldL);dot(16,-6.8,C.scarlet);dot(16.2,-7.1,C.ivory);
  }else if(id==="boomerang"){
    poly([[-3,-1.7],[2.6,-2.5],[18,-11],[20,-9],[9,-1],[20,7.8],[18,10],[2.5,2],[-3,1.7]],C.ink);poly([[-2.4,-1.1],[2.8,-1.8],[17.8,-10],[18.7,-9],[7.7,-1],[18.7,8],[18,8.8],[2.8,1.4],[-2.4,1.1]],C.grip);
    path([[2,-1.5],[17.6,-9.1],[18.7,-9]],C.goldL);path([[3,1.2],[18,8.4]],C.gold);for(const s of [-1,1]){scroll(8,s*3.1,4,s*1.7,C.gold);gem(15,s*7,.7,1);}
    for(let x=-2;x<4;x+=1.4)line(x,-1.5,x+1,1.5,C.wrap);gem(5,0,1.3,1.6);
  }else if(id==="talisman"){
    poly([[2.6,-6],[10.6,-5],[11.6,6],[3.6,7]],C.goldD);poly([[3.1,-5.4],[10.1,-4.4],[11,5.5],[4.1,6.4]],C.ivory);path([[3.6,-4.7],[9.5,-4],[10.3,4.9],[4.6,5.7],[3.6,-4.7]],C.gold);
    poly([[8.3,-4.3],[9.7,-4.1],[10.4,5],[9.1,5.2]],C.red);rect(4.5,-3.3,3.1,2.2,C.redD);rect(4.9,-3,2.3,1.5,C.ruby);
    path([[5.1,-2.3],[6.4,-2.2],[6,-.7],[5.2,.2],[7.3,.4],[5.7,1.7],[7.4,2.6],[6,4.4]],C.ink);line(4.8,1.3,7.5,1.5,C.ink);path([[4.9,3.3],[5.6,4.3],[7,3.4]],C.red);poly([[9.8,4.7],[11,5.5],[9.9,5.6]],C.silver);
  }else if(id==="binding-silk"){
    for(const s of [-1,1]){poly([[-2,s*1.2],[-5,s*1.6],[-8,s*6],[-5,s*5],[-6,s*8],[-3,s*6],[0,s*2]],C.goldD);poly([[-2,s*1.4],[-4.8,s*2.2],[-6.8,s*5.8],[-4.2,s*4.8],[-4.8,s*6.8],[-3.2,s*5.4],[-.3,s*2]],C.ivory);path([[-1.5,s*1.8],[-4,s*3],[-5.2,s*5.7]],BASE.red);scroll(-4,s*3.2,1.8,s*.8,C.gold);}
    ellipse(2.2,0,5,2.5,C.ink);ellipse(2,-.2,4.6,2,C.ivory);line(-1.2,-1.2,5.8,-1.2,C.white);for(const x of [-2.4,5.7]){rect(x,-2.4,.9,4.8,C.goldD);line(x+.25,-2.1,x+.25,2.1,C.goldL);}scroll(-.6,.3,4,1.3,C.gold);gem(2.5,0,.75,.85);
  }else if(id==="soul-bell"){
    ellipse(-2.2,0,1.6,1.6,C.goldD);ellipse(-2.2,0,.85,.85,null);rect(-1,-.8,2.2,1.6,C.bronze);poly([[.6,-2.8],[3.7,-2.7],[7.4,-4.6],[8.4,-4.3],[8.4,4.3],[7.4,4.6],[3.7,2.7],[.6,2.8]],C.ink);
    poly([[1.2,-2.2],[3.9,-2],[7.3,-3.8],[7.6,3.7],[3.8,2.1],[1.2,2.2]],C.bronze);poly([[1.4,-1.7],[4,-1.6],[7.1,-3.2],[7,.1],[1.4,.8]],C.gold);scroll(2,.2,4.6,1.7,C.goldL);
    for(const[x,y]of[[3,1.2],[5,-1.4],[6,1.8]]){dot(x,y,C.patina);dot(x+.25,y+.25,C.patina);}rect(7.5,-4.6,.9,9.2,C.goldD);line(7.7,-4.2,7.7,4.2,C.goldL);ellipse(8.5,0,.65,3.7,C.ink);gem(8.5,0,.35,.7);for(const s of [-1,1])path([[-1,s],[-3,s*2.6],[-4.6,s*4.6]],BASE.red);
  }else if(id==="pear-needles"){
    poly([[-1.4,-3],[1.2,-3],[2.3,-2],[2.3,2],[1.2,3],[-1.4,3]],C.ink);rect(-1,-2.5,2.5,5,C.blue);for(const y of [-1.8,0,1.8])line(-.9,y,1.3,y+.5,C.silver);
    for(const y of [-2.2,0,2.2]){poly([[1.4,y-.35],[10.8,y-.25],[13.6,y],[10.8,y+.25],[1.4,y+.35]],C.ink);line(2,y,13.2,y,C.silver);line(5,y-.25,12,y-.25,C.edge);for(const x of [2.2,3.4,4.6])dot(x,y,C.goldL);}gem(.2,0,.55,.8);
  }else if(id==="handle"){
    grip(-2.6,6,1.15);for(const x of [-3,5.6]){rect(x,-1.6,.9,3.2,C.goldD);line(x+.25,-1.3,x+.25,1.3,C.goldL);}gem(-2.7,0,.5,.9);
  }
},id==="binding-silk"||id==="soul-bell"?P.jade:P.steel);}
export const ORNATE_PROPS=Object.fromEntries(["kunai","powder-bomb","boomerang","talisman","binding-silk","soul-bell","pear-needles","handle"].map(id=>[id,propModel(id)]));
