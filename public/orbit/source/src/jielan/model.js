import * as T from 'three';
import {mergeGeometries} from 'three/addons/utils/BufferGeometryUtils.js';
import {makeMaterials} from './materials.js?v=0230';
const TAU=Math.PI*2,V=p=>new T.Vector3(...p);
function surface(f,nu=36,nv=30,flip=false){
  const p=[],uv=[],ix=[];
  for(let j=0;j<=nv;j++)for(let i=0;i<=nu;i++){p.push(...f(i/nu,j/nv));uv.push(i/nu,j/nv);}
  for(let j=0;j<nv;j++)for(let i=0;i<nu;i++){const a=j*(nu+1)+i,b=a+nu+1;ix.push(...(flip?[a,b,a+1,b,b+1,a+1]:[a,a+1,b,b,a+1,b+1]));}
  const g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute(p,3));g.setAttribute('uv',new T.Float32BufferAttribute(uv,2));g.setIndex(ix);g.computeVertexNormals();return g;
}
function tube(points,r=.008,n=24,end=.45,sides=6){
  const c=new T.CatmullRomCurve3(points.map(V)),f=c.computeFrenetFrames(n,false),p=[],uv=[],ix=[];
  for(let i=0;i<=n;i++)for(let j=0;j<=sides;j++){const a=j/sides*TAU,t=i/n,rad=r*(1-t+end*t)*(1+.07*Math.sin(t*31));p.push(...c.getPoint(t).addScaledVector(f.normals[i],rad*Math.cos(a)).addScaledVector(f.binormals[i],rad*Math.sin(a)).toArray());uv.push(j/sides,t);}
  for(let i=0;i<n;i++)for(let j=0;j<sides;j++){const a=i*(sides+1)+j,b=a+sides+1;ix.push(a,b,a+1,b,b+1,a+1);}
  for(const i of [0,n]){const id=p.length/3;p.push(...c.getPoint(i/n).toArray());uv.push(.5,.5);for(let j=0;j<sides;j++){const a=i*(sides+1)+j;ix.push(...(i?[id,a+1,a]:[id,a,a+1]));}}
  const g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute(p,3));g.setAttribute('uv',new T.Float32BufferAttribute(uv,2));g.setIndex(ix);g.computeVertexNormals();return g;
}
export function makeJielan(){
  const root=new T.Group(),groups=[],m=makeMaterials(),owned=[],ownedTextures=[];
  root.name='芥兰 / a gathered botanical world';
  const layer=(name,separation=[0,0,0])=>{const g=new T.Group();g.name=name;g.userData.separation=separation;root.add(g);groups.push(g);return g;};
  const mesh=(g,geo,mat,name='')=>{const o=new T.Mesh(geo,mat);o.name=name;o.castShadow=!mat.transparent&&!(mat.transmission>0);o.receiveShadow=o.castShadow;if(mat.transparent)o.renderOrder=2;g.add(o);return o;};
  const batch=(g,geos,mat,name)=>{if(!geos.length)return;const result=mergeGeometries(geos);geos.forEach(x=>x.dispose());return mesh(g,result,mat,name);};
  const local=(g,p,r=[0,0,0])=>{const x=new T.Group();x.position.set(...p);x.rotation.set(...r);g.add(x);return x;};
  const oval=(p,s,r=0,detail=20)=>{const g=new T.SphereGeometry(1,detail,Math.max(10,detail-4));g.scale(...s);g.rotateZ(r);g.translate(...p);return g;};
  function skin(g,f,mat,back=m.linenReverse,thickness=.006,nu=42,nv=36){
    const reverse=(u,v)=>{const du=V(f(Math.min(1,u+.0005),v)).sub(V(f(Math.max(0,u-.0005),v))),dv=V(f(u,Math.min(1,v+.0005))).sub(V(f(u,Math.max(0,v-.0005))));return V(f(u,v)).addScaledVector(du.cross(dv).normalize(),-thickness).toArray();};
    mesh(g,surface(f,nu,nv),mat);mesh(g,surface(reverse,nu,nv,true),back);
    const es=[];for(const e of [0,1]){es.push(surface((u,v)=>V(f(u,e)).lerp(V(reverse(u,e)),v).toArray(),nu,1,e===0));es.push(surface((u,v)=>V(f(e,u)).lerp(V(reverse(e,u)),v).toArray(),nv,1,e===1));}batch(g,es,back,'thin irregular material edges');
  }
  const coreCenter=V([0,-.10,0]),coreRadius=1.30;
  const core=layer('00 / visible rough equal-axis botanical body');
  const coreGeo=new T.SphereGeometry(coreRadius,96,72),cp=coreGeo.attributes.position;
  for(let i=0;i<cp.count;i++){const v=new T.Vector3().fromBufferAttribute(cp,i),n=v.clone().normalize(),relief=.010*Math.sin(n.x*13+n.z*7)*Math.cos(n.y*11)+.006*Math.sin(n.z*31+n.y*17);v.multiplyScalar((coreRadius+relief)/coreRadius).add(coreCenter);cp.setXYZ(i,v.x,v.y,v.z);}coreGeo.computeVertexNormals();
  const coreMat=m.globeFiber.clone();coreMat.vertexColors=false;coreMat.color.set('#7b8666');coreMat.bumpScale=.018;owned.push(coreMat);
  const heart=mesh(core,coreGeo,coreMat,'visible closed rough botanical body');heart.userData={solidCore:true,radius:coreRadius,center:coreCenter.toArray(),axes:[1,1,1],maximumRelief:.016};
  // A visible rough round body joins the shoulders and belly. The independent
  // collage layers follow its volume, with openings and lifted outer edges.
  const wood=layer('01 / weathered driftwood and irregular round root cradle',[-.08,.05,-.06]);
  const limbs=[
    [[-.35,-1.15,-.22],[-.77,-.26,-.16],[-.72,.66,.04],[-.73,1.65,.06],[-.58,1.89,.02]],
    [[-.73,.58,.03],[-1.03,.91,.09],[-1.14,1.43,.14],[-1.01,1.73,.10]],
    [[-.68,.78,-.06],[-.42,1.11,-.09],[-.40,1.62,-.18]],
    [[-.30,-.90,-.65],[.34,-.17,-.77],[.67,.53,-.35],[.61,1.10,-.27]],
    [[.43,-1.0,-.32],[.92,-.32,-.27],[1.05,.46,-.14]]
  ];
  batch(wood,limbs.map((p,i)=>tube(p,i===0?.13:i===1?.075:.060,44,.14,9)),m.bark,'splintered load-bearing driftwood');
  const visibleForks=[
    [[[-.67,.22,.63],[-.70,.76,.68],[-.81,1.31,.60],[-.72,1.79,.52]],.16,.46],
    [[[-.72,.68,.62],[-.99,1.04,.56],[-1.02,1.47,.44]],.10,.31],
    [[[-.66,.54,.62],[-.49,1.03,.54],[-.46,1.47,.46]],.087,.29],
    [[[-.75,.30,.53],[-.97,.55,.40],[-1.08,.94,.24]],.073,.34]
  ];
  const rope=[];
  visibleForks.forEach(([ps,r,end],id)=>{
    const curve=new T.CatmullRomCurve3(ps.map(V)),geo=tube(ps,r,60,end,9),p=geo.attributes.position;
    for(let i=0;i<=60;i++)for(let j=0;j<=9;j++){const k=i*10+j,c=curve.getPoint(i/60),v=new T.Vector3().fromBufferAttribute(p,k).sub(c),q=1+.15*Math.sin(j*2.1+i*.11+id)+.08*Math.cos(j*4.9+i*.04);v.multiplyScalar(q).add(c);if(i===60)v.y+=.024*Math.sin(j*3.1+id);p.setXYZ(k,v.x,v.y,v.z);}geo.computeVertexNormals();mesh(wood,geo,m.bark,'deeply fissured visible front driftwood fork '+id);
    if(id===0)for(let j=0;j<6;j++){const pts=[];for(let k=0;k<=32;k++){const a=k/32*TAU*1.13,t=.33+j*.018+.017*Math.sin(a+j),c=curve.getPoint(t);pts.push([c.x+(r*.90+.011*Math.sin(a*3))*Math.cos(a),c.y+.033*Math.sin(a+j)+k*.0008,c.z+r*.89*Math.sin(a)]);}rope.push(tube(pts,.0045,36,.72,6));}
  });batch(wood,rope,m.thread,'irregular flax binding around the visible driftwood fork');
  const roots=[],fibres=[];
  for(let i=0;i<42;i++){
    const a=i*2.39996,n=V([Math.cos(a),.52*Math.sin(a*.77),Math.sin(a)]).normalize(),side=V([Math.sin(a*.61),1,Math.cos(a*.9)]).addScaledVector(n,-V([Math.sin(a*.61),1,Math.cos(a*.9)]).dot(n)).normalize(),ps=[];
    for(let k=0;k<=32;k++){const u=k/32,t=(u-.5)*(1.0+(i%4)*.15),p=n.clone().multiplyScalar(1.08+.04*Math.sin(i)).addScaledVector(side,t);p.multiplyScalar((1.08+.045*Math.sin(u*11+i))/p.length());p.y=p.y*1.04-.13;ps.push(p.toArray());}
    roots.push(tube(ps,.012+(i%5)*.003,36,.38,6));
  }
  // Front-facing nests wrap different depths, with dense irregular strands
  // extending around the side and reverse rather than a plane of random lines.
  const nests=[[-.78,-.17,.82,.59,.66,0],[.78,.58,.33,.50,.61,1],[.37,-.81,.67,.65,.46,2],[-.39,.20,-.91,.61,.77,3],[.70,-.24,-.68,.47,.63,4]];
  nests.forEach(([x,y,z,w,h,id])=>{
    for(let j=0;j<88;j++){const ps=[];for(let k=0;k<=20;k++){const t=k/20,a=(j*.618%1)*TAU;ps.push([x+(t-.5)*w*2+.028*Math.sin(t*27+j),y+Math.sin(a)*h*.74+.16*Math.sin(t*4+j*.73)+.021*Math.sin(t*43+j),z+.14*Math.sin(t*Math.PI)+.075*Math.sin(j*.7+t*8)]);}fibres.push(tube(ps,j%11===0?.0033:.0016,22,.7,4));}
    for(let j=0;j<34;j++){const ps=[];for(let k=0;k<=16;k++){const t=k/16;ps.push([x+(j/33-.5)*w*1.9+.045*Math.sin(t*13+j),y+(t-.5)*h*1.55,z+.075*Math.cos(j*.8+t*6)]);}fibres.push(tube(ps,.0019,18,.6,4));}
  });
  batch(wood,roots,m.branch,'forty-two bent roots around the volume');batch(wood,fibres,m.thread,'interlaced flax and fine dry roots across five depth nests');
  const plants=layer('02 / upright kale stems, narrow folded blades and reverse growth',[-.04,.10,.03]);
  const veins=[],stems=[],drops=[];let leafCount=0;
  function leaf(p,r,w,h,seed,short=false){
    const g=local(plants,p,r),f=(u,v)=>{
      const s=2*u-1,t=v,envelope=Math.pow(Math.sin(Math.PI*t),.67)*(.60+.55*t),edge=1+.082*Math.sin(t*33+seed)+.029*Math.sin(t*71+seed*.8);
      const crease=.011*Math.sin(s*11+t*13+seed)+.005*Math.sin(s*32-t*27+seed),fold=.040*Math.abs(s)+.041*s*s*Math.sin(t*7+seed);
      return [s*w*.5*envelope*edge+.025*w*Math.sin(t*5+seed),(t-.21)*h,.10*Math.sin(t*4.4+seed*.3)+(crease+fold)*envelope+.025*s**6*Math.sin(t*25+seed)];
    };
    mesh(g,surface(f,short?26:40,short?36:62),seed%6===0?m.leafDark:seed%3===0?m.leafPale:m.leaf,'photographic kale surface '+leafCount);
    g.updateMatrixWorld(true);const pt=(u,v)=>V(f(u,v)).add(V([0,0,.005])).applyMatrix4(g.matrixWorld).toArray();
    const mid=[];for(let k=0;k<=20;k++)mid.push(pt(.5,k/20));veins.push(tube(mid,.0030,24,.10,5));
    const base=pt(.5,0);stems.push(tube([[p[0]*.45,-.65,p[2]*.30],[p[0]*.78,p[1]-.45,p[2]*.75],base],short?.011:.019,27,.38,7));
    if(seed%4===1)drops.push(oval(pt(.73,.57),[.018,.029,.018],.2,14));leafCount++;
  }
  const crown=[
    [-.39,.94,.55,-.16,-.14,-.12,.44,1.38],[-.07,1.00,.33,.21,.19,-.18,.53,1.45],
    [.26,1.15,.02,-.12,-.13,-.45,.58,1.26],[-.30,1.25,-.28,.10,.40,.20,.59,1.18],
    [.43,1.29,-.27,.19,.34,-.59,.64,1.02],[-.63,1.00,.13,-.31,-.38,.14,.43,1.38],
    [-.40,.47,.79,-.22,.10,-.13,.39,1.20],[-.01,.68,.73,.28,-.20,-.32,.41,1.25],
    [.25,.61,.43,-.29,.43,-.69,.42,1.14],[-.72,.83,-.28,.28,-.43,.45,.48,1.11],
    [-.24,.50,.39,-.48,.18,-.30,.35,1.03],[.57,.99,-.10,-.31,.20,-1.0,.46,.93],
    [-.12,1.39,-.37,.35,-.54,.17,.56,.99],[-.83,1.48,.05,.22,-.3,1.10,.35,.86],
    [.58,.66,-.35,.40,.70,-1.01,.41,.83],[-.48,.14,.87,-.15,-.16,-.02,.32,1.04]
  ];
  crown.forEach((a,i)=>leaf([a[0],a[1]*.92,a[2]],a.slice(3,6),a[6]*1.03,a[7]*.85,i));
  // Long blades continue diagonally through the foreground, tying the crown
  // into the folded body instead of ending as a bouquet above a cloth sphere.
  [[-.44,.36,1.24,.13,-.13,-.15,.30,1.57],[-.71,.12,1.15,-.18,.29,.21,.29,1.12],[-.18,.49,1.01,.28,-.39,-.69,.34,1.15],[-.55,-.06,1.20,.34,.19,-.32,.24,.96]].forEach((a,i)=>leaf(a.slice(0,3),a.slice(3,6),a[6],a[7],71+i));
  for(let i=0;i<14;i++){
    const a=i*2.4,p=[1.07*Math.cos(a),-.11+.94*Math.sin(a),-.48-.32*(.5+.5*Math.cos(a))];
    leaf(p,[.22,Math.PI+(i%3-.8)*.42,-a+.7],.32+(i%3)*.08,.58+(i%4)*.09,30+i,true);
  }
  [[[-1.12,.33,.30],[.16,-.25,1.27]],[[1.16,.69,.00],[.1,.5,-1.26]],[[1.21,-.39,.26],[.45,.8,-1.72]],[[-.88,-.96,.31],[-.3,-.9,2.2]],[[.36,-1.23,-.19],[.2,.3,2.50]]].forEach(([p,r],i)=>leaf(p,r,.28,.67,60+i,true));
  batch(plants,veins,m.vein,'raised central kale veins');batch(plants,stems,m.leafPale,'long bundled edible green stems');batch(plants,drops,m.dew,'attached leaf dew');
  const porcelain=layer('03 / visible left and lower-right blue porcelain',[.035,-.025,.03]);
  function shard(p,r,w,h,id){
    const g=local(porcelain,p,r),f=(u,v)=>{const a=(u-.5)*2.9,rr=.40+v*.60,tear=.005*Math.sin(u*51+id)+.003*Math.sin(u*99+id*2);return [Math.sin(a)*w*.62*rr,(v-.48)*h+Math.cos(a)*h*.10+tear*(v>.5?1:.25),.42*Math.cos(a)*rr+.14*(v-.5)**2];};
    skin(g,f,m.blue,m.ceramicBack,.027,60,42);
    const rim=[];for(let k=0;k<=55;k++)rim.push(V(f(.03+k/55*.94,.96)).add(V([0,0,.008])).toArray());mesh(g,tube(rim,.007,56,.9),m.cobalt,'cobalt plate rim');
  }
  shard([-.87,.03,.57],[.04,-.85,.16],.76,.91,0);
  shard([.86,-.64,.58],[-.19,.59,-.22],1.0,1.04,1);
  shard([.33,.03,-.87],[.15,3.0,.48],.75,.81,2);
  shard([-.56,-.72,-.49],[.28,2.5,-.35],.76,.67,3);
  const cloth=layer('04 / crumpled sage linen shoulder and gravity-drawn gauze',[.07,-.055,.035]);
  const threads=[],roseThreads=[];
  // Overlapping folded skins turn around the lateral cradle. Each sheet has
  // free edges and an independent radius above the visible vegetal body.
  const sidePanels=[
    [.10,.30,.93,.69,.58,0],[.54,-.22,.96,.85,.96,1],[1.00,.18,.94,.84,.96,2],
    [1.43,-.32,.98,.91,.84,3],[1.87,.18,.95,.92,.89,4],[2.35,-.27,.93,.83,.97,5],
    [2.86,.15,.93,.87,.94,6],[3.22,-.31,.92,.90,.85,7],[3.61,.17,.92,.80,.92,8],
    [4.11,-.22,.90,.87,.91,9],[4.54,.17,.88,.79,.80,10],[5.25,-.35,.89,.88,.86,11],
    [5.73,.10,.90,.80,.88,12]
  ];
  sidePanels.forEach(([a,y,r,w,h,id])=>{
    const linen=[0,3,5,8,11].includes(id),face=linen?(id%2?m.linen:m.linenPale):m.bark;
    const f=(u,v)=>{const spread=linen?.77*(.65+.35*Math.sin(Math.PI*v)):.28*Math.pow(Math.sin(Math.PI*v),.4),b=a+(u-.5)*w*spread,yy=y+(v-.5)*h+.036*Math.sin(u*11+id)*(v**6+(1-v)**6),fold=.11*Math.sin(u*6.3+v*3.2+id)+.085*Math.cos(v*7.1-id)+.055*Math.pow(Math.abs(u-.5)*2,5),radius=linen?1.19:1.16,rr=Math.sqrt(Math.max(.16,radius*radius-(yy+.10)**2))+.35*Math.abs(fold);return [rr*Math.cos(b),yy,rr*Math.sin(b)];};
    skin(cloth,f,face,linen?m.linenReverse:face,linen?.006:.025,42,40);
    const seams=[];for(let k=0;k<26;k++){const v=(k+.35)/26,p=V(f(k%2,v)),q=p.clone().add(V([.025*Math.cos(a),-.026,.025*Math.sin(a)]));seams.push(tube([p.toArray(),q.toArray()],.0015,4,.12,4));}batch(cloth,seams,m.thread,'free flax edge on side fold '+id);
  });
  const heartRoots=[];
  for(let i=0;i<28;i++){const a=i*2.39996,ps=[];for(let j=0;j<=24;j++){const t=j/24,y=(t-.5)*1.98-.1,b=a+.23*Math.sin(t*5+i*.3),r=Math.sqrt(Math.max(.12,1.15**2-(y+.1)**2))+.016*Math.sin(t*9+i);ps.push([r*Math.cos(b),y,r*Math.sin(b)]);}heartRoots.push(tube(ps,.016+(i%4)*.003,30,.63,7));}
  for(let i=0;i<14;i++){const ps=[],lat=-1.04+i*.16;for(let j=0;j<=40;j++){const a=-.45+j/40*5.3+i*.79,b=lat+.055*Math.sin(a*3+i),r=1.16+.014*Math.sin(a*7+i);ps.push([r*Math.cos(b)*Math.cos(a),r*Math.sin(b)-.10,r*Math.cos(b)*Math.sin(a)]);}heartRoots.push(tube(ps,.012+(i%3)*.0025,48,.55,6));}batch(wood,heartRoots,m.branch,'irregular wood roots following the spherical shoulders and belly');
  function fray(f,rose=false,seed=0,amount=48){
    const out=rose?roseThreads:threads;
    for(const side of [0,1])for(let j=0;j<amount;j++){
      const t=(j+.2)/amount,p=V(f(side,t)),q=V(f(side? .96:.04,t)),d=p.clone().sub(q).normalize(),len=.018+.040*(.5+.5*Math.sin(j*2.73+seed));
      out.push(tube([p.toArray(),p.clone().addScaledVector(d,len*.5).add(V([0,-.006,.002])).toArray(),p.clone().addScaledVector(d,len).add(V([.004*Math.sin(j),-.016,.009])).toArray()],.0009,5,.1,4));
    }
  }
  // Separate compressed folds expose voids, rather than one giant inflated sail.
  [[.69,.71,.34,.68,.51,-.54],[1.01,.38,.40,.88,.64,.42],[1.08,.00,.39,.79,.54,-.35],[.40,.57,-.61,.68,.51,-.5]].forEach(([x,y,z,w,h,rz],i)=>{
    const g=local(cloth,[x,y,z],[.24-i*.15,-.06+i*.04,rz]),f=(u,v)=>{const s=u-.5,t=v-.5,crumple=.10*Math.sin(u*6.1+v*2+i)+.032*Math.sin(v*7-u*3+i)+.006*Math.sin(u*27+v*17);return [s*w*(1+.018*Math.sin(v*13+i)),t*h*(1+.016*Math.sin(u*15+i)),crumple+.08*Math.pow(Math.abs(s)*2,5)];};
    skin(g,f,i%2?m.linen:m.linenPale,m.linenReverse,.004,54,40);
    // Threads are transformed with the cloth panel.
    const tf=(u,v)=>{g.updateMatrixWorld(true);return V(f(u,v)).applyMatrix4(g.matrixWorld).toArray();};fray(tf,false,i,38);
  });
  function drape(points,width,mat,seed){
    const path=new T.CatmullRomCurve3(points.map(p=>V([p[0],p[1]<-.8?-.8+(p[1]+.8)*.86:p[1],p[2]]))),f=(u,v)=>{
      const p=path.getPoint(v),t=path.getTangent(v),twist=seed===6?-.6+1.9*Math.sin(v*4):seed===3?.75*Math.sin(v*5):.40*Math.sin(v*4+seed),cross=V([0,0,1]).cross(t).normalize().applyAxisAngle(t,twist),normal=t.clone().cross(cross).normalize(),s=u-.5;
      const w=width*(.92-.32*v+.22*Math.sin(v*6+seed)+.08*Math.sin(v*23+seed));
      const fold=.034*Math.sin(u*7+v*3+seed)+.006*Math.sin(u*21-v*8)+.013*Math.sin(v*11+seed)*s*s;
      return p.addScaledVector(cross,s*w).addScaledVector(normal,fold).toArray();
    };
    skin(cloth,f,mat,mat===m.roseLinen?mat:m.linenReverse,.003,38,86);fray(f,mat===m.roseLinen,seed,85);return f;
  }
  drape([[-1.0,-.31,1.04],[-.77,-.59,1.16],[-.69,-1.06,1.24],[-.48,-1.52,1.15]],.25,m.roseLinen,3);
  drape([[-.86,-.27,1.03],[-.57,-.42,1.17],[-.46,-.60,.97],[-.25,-.70,.72]],.20,m.roseLinen,6);
  drape([[.02,-.80,1.31],[-.12,-1.07,1.32],[-.04,-1.37,1.14],[.18,-1.66,1.12]],.52,m.linen,2);
  drape([[.10,-.85,1.14],[.39,-1.11,1.11],[.69,-1.35,.87],[1.02,-1.53,.81]],.40,m.linenPale,4);
  drape([[-.06,-.83,1.21],[-.41,-.97,1.19],[-.37,-1.24,1.03]],.23,m.linenPale,9);
  drape([[-.57,.29,-.83],[-.14,-.14,-1.05],[.32,-.64,-.89],[.59,-1.12,-.61]],.42,m.linen,5);
  batch(cloth,threads,m.thread,'loose unhemmed linen fibers');batch(cloth,roseThreads,m.roseThread,'loose dusty rose gauze fibers');
  const ties=[];for(let j=0;j<8;j++){const ps=[];for(let k=0;k<=30;k++){const a=k/30*TAU;ps.push([.035+.079*Math.cos(a),-.86+(j-4)*.012+.013*Math.sin(a*3),1.28+.063*Math.sin(a)]);}ties.push(tube(ps,.005,32,.95));}batch(cloth,ties,m.thread,'small twisted flax binding at the hanging linen anchor');
  const paper=layer('05 / large torn central handwritten slips',[0,.015,.10]);
  function note(p,r,w,h,mat,seed){
    const g=local(paper,p,r),f=(u,v)=>{const s=u-.5,t=v-.5,dx=.005*Math.sin(v*51+seed)+.004*Math.sin(v*27+seed),dy=.004*Math.sin(u*49+seed)+.006*Math.sin(u*23+seed*2);return [s*w+dx*(u**12+(1-u)**12),t*h+dy*(v**12+(1-v)**12),.008*Math.sin(u*4+v*3+seed)+.055*u**9+.025*v**9];};
    skin(g,f,mat,m.verso,.005,72,48);
  }
  note([.48,.17,1.40],[.025,-.32,-.23],.77,.51,m.menu,2);
  note([.57,-.43,1.42],[.08,.08,.16],.53,.44,m.receipt,4);
  note([-.21,.17,1.23],[.16,-.12,.16],.25,.46,m.paper,6);
  note([.48,.76,.60],[-.2,.25,.3],.45,.46,m.verso,8);
  note([-.31,.27,-1.0],[.15,3.12,-.25],.75,.61,m.verso,10);
  note([-.70,-.58,-.68],[.31,2.70,.39],.44,.35,m.paper,12);
  const silver=layer('06 / crossed worn spoon and fork',[0,0,.07]);
  const spoon=local(silver,[-.08,-.22,1.35],[.10,-.19,-.50]);spoon.scale.setScalar(.81);
  skin(spoon,(u,v)=>{const a=u*TAU,r=.02+.98*v;return [.145*r*Math.cos(a),.23*r*Math.sin(a),-.087*(1-r*r)];},m.silver,m.silver,.009,56,28);
  mesh(spoon,tube([[0,-.20,-.01],[.02,-.49,-.015],[.08,-.80,-.05],[.09,-1.03,-.07]],.025,40,.66,8),m.silver,'spoon handle continuing under flax knot');
  const fork=local(silver,[-.02,-.81,1.36],[.06,.12,.43]),forks=[];
  forks.push(tube([[0,-.42,.02],[0,-.13,0],[0,.17,.01]],.023,26,.8,8));
  for(let j=0;j<4;j++){const x=(j-1.5)*.043;forks.push(tube([[0,.12,.01],[x,.25,.04],[x,.42,.07],[x*.94,.52,.04]],.012,24,.3,6));}batch(fork,forks,m.silver,'four distinctly separated fork tines');
  const specimen=layer('07 / warm glass bowl, inner berries and amber memories',[.03,-.02,.12]);
  const pocket=local(specimen,[.61,-.67,1.24],[.02,-.12,-.13]);pocket.scale.setScalar(.77);
  const bowl=(u,v)=>{const a=-.26+u*TAU,r=.025+.975*v;return [.54*r*Math.cos(a),.55*r*Math.sin(a),.43*(1-r*r)+.007*Math.sin(a*5)*r];};
  mesh(pocket,surface(bowl,80,36),m.specimenGlass,'large convex clear glass shell');const rim=[];for(let k=0;k<=96;k++)rim.push(bowl(k/96,1));mesh(pocket,tube(rim,.014,100,1,9),m.glassRim,'continuous amber-gray glass bowl rim');
  mesh(pocket,surface((u,v)=>bowl(u,.84+v*.16),80,10),m.glassLip,'thicker curved glass shoulder around the clear center');
  const glassGlints=[];for(const [start,length,radius] of [[.02,.12,.87],[.52,.09,.92],[.76,.06,.78]]){const ps=[];for(let k=0;k<=32;k++)ps.push(V(bowl(start+k/32*length,radius)).add(V([0,0,.01])).toArray());glassGlints.push(tube(ps,.007,36,.12,6));}batch(pocket,glassGlints,m.glassEdge,'curved broken specular reflections on the glass volume');
  const seeds={amber:[],wine:[],seedGold:[]},seedLayout=[],seedGlassGap=.045;
  [[-.16,.04,.087,.090,.060,'amber'],[.035,.17,.078,.080,.055,'seedGold'],[.15,.08,.070,.078,.050,'wine'],[-.09,-.13,.068,.08,.052,'amber'],[.105,-.10,.075,.083,.050,'wine'],[.0,-.27,.063,.075,.046,'wine'],[-.24,-.11,.061,.064,.045,'seedGold'],[.22,-.20,.059,.060,.041,'wine']].forEach(([x,y,w,h,d,key],i)=>{
    x=x*.95;y=y*.95-.045;const radialBound=Math.hypot((Math.abs(x)+w)/.54,(Math.abs(y)+h)/.55),glassLowerBound=.43*(1-radialBound**2)-.007,z=glassLowerBound-d-seedGlassGap-.04,geo=oval([0,0,0],[w,h,d],i*.3,24),p=geo.attributes.position;
    for(let j=0;j<p.count;j++){const a=Math.atan2(p.getY(j),p.getX(j)),q=1+.016*Math.sin(a*8+i)*Math.cos(p.getZ(j)*77);p.setXYZ(j,p.getX(j)*q+x,p.getY(j)*q+y,p.getZ(j)*q+z);}geo.computeVertexNormals();seeds[key].push(geo);seedLayout.push({material:key,center:[x,y,z],radii:[w,h,d],minimumLocalZGap:seedGlassGap,radialBound,glassLowerBound});
  });
  for(const key of Object.keys(seeds))batch(pocket,seeds[key],m[key],key+' clustered behind curved glass');
  const petalGeo=[];for(let i=0;i<23;i++){const a=i*2.4,x=(.13+(i%3)*.045)*Math.cos(a),y=.20*Math.sin(a)-.06,w=.07+(i%4)*.025;petalGeo.push(surface((u,v)=>{const s=u-.5,t=v;return [x+s*w*Math.sin(t*Math.PI),y+(t-.5)*w,-.14+.045*Math.sin(t*6+i)+s*s*.10];},10,16));}batch(pocket,petalGeo,m.bud,'twenty-three curled dried flower petals');
  batch(pocket,seedLayout.map(s=>tube([[0,-.29,-.32],[s.center[0]*.6,s.center[1]-.07,-.26],[s.center[0],s.center[1],s.center[2]-s.radii[2]]],.0028,18,.35,5)),m.branch,'fine seed connections behind glass');
  pocket.userData.seedLayout=seedLayout;pocket.userData.minimumSeedGlassGap=seedGlassGap;
  const glints=layer('08 / clear suspended dew and restrained warm internal light');
  const globes=[[-1.0,.60,.74,.235],[.98,-.32,.85,.14],[-.64,-.92,.88,.10],[.80,.81,.20,.095],[-.95,1.35,.15,.078]];
  globes.forEach(([x,y,z,r],i)=>{mesh(glints,new T.SphereGeometry(r,30,22).translate(x,y,z),m.specimenGlass,'clear suspended glass orb '+i);const arc=[];for(let k=0;k<=25;k++){const a=.4+k/25*2.2;arc.push([x+r*.91*Math.cos(a),y+r*.91*Math.sin(a),z+r*.38]);}mesh(glints,tube(arc,.004,28,.3,5),m.glassEdge,'small crescent reflection');});
  const lights=[[-.88,.42,.71],[.54,-.76,1.41],[.24,-.85,1.15],[.97,-.42,.59],[-.34,-1.11,.49]];
  const glowCanvas=document.createElement('canvas');glowCanvas.width=glowCanvas.height=128;const gx=glowCanvas.getContext('2d'),gradient=gx.createRadialGradient(64,64,0,64,64,64);gradient.addColorStop(0,'#fffdeaff');gradient.addColorStop(.07,'#fff7c5ef');gradient.addColorStop(.20,'#ffd1689f');gradient.addColorStop(.47,'#edb45435');gradient.addColorStop(1,'#d98d2b00');gx.fillStyle=gradient;gx.fillRect(0,0,128,128);
  const glowMap=new T.CanvasTexture(glowCanvas);glowMap.colorSpace=T.SRGBColorSpace;ownedTextures.push(glowMap);const glowMaterial=new T.MeshBasicMaterial({map:glowMap,transparent:true,depthWrite:false,side:T.DoubleSide,toneMapped:false});owned.push(glowMaterial);
  lights.forEach((p,i)=>{mesh(glints,oval(p,[.020,.020,.019],0,12),m.warmCore,'small amber light source');const light=new T.PointLight('#ffca69',i===1?.52:.20,1.3,2);light.position.set(...p);glints.add(light);const s=i===1?.27:.18,glow=mesh(glints,new T.PlaneGeometry(s,s),glowMaterial,'soft local reflection around amber source');glow.position.set(p[0],p[1],p[2]+.16);});
  const botanical=layer('09 / many-branched small yellow kale flowers',[0,.025,0]),sprig=[],buds=[],petals=[];
  const joints=[[-.32,1.07,.76],[.23,1.49,.16],[-.81,1.41,.08],[-.38,.41,.99],[.88,.76,.38],[-1.08,.08,.84],[.97,-.47,.40],[.37,-1.16,.13],[-.68,.26,-.74],[.63,.28,-.72],[-.22,-.64,-.83]];
  joints.forEach((p,i)=>{sprig.push(tube([p,[p[0]+.025,p[1]+.20,p[2]],[p[0]+.08,p[1]+.40,p[2]+.025]],.0052,20,.22,5));for(let j=0;j<21;j++){const a=j*2.399+i,t=j/21,base=[p[0]+.06*t,p[1]+.30*t,p[2]+.016*t],tip=[base[0]+(.05+.038*t)*Math.cos(a),base[1]+.07,base[2]+.09*Math.sin(a)];sprig.push(tube([base,[base[0]+.02*Math.cos(a),tip[1]-.025,tip[2]*.98],tip],.0025,10,.23,4));buds.push(oval(tip,[.012,.018,.012],a,10));if(j%6===0)for(let k=0;k<4;k++){const b=k*TAU/4;petals.push(oval([tip[0]+.018*Math.cos(b),tip[1]+.018*Math.sin(b),tip[2]+.008],[.020,.014,.0045],b,10));}}});
  batch(botanical,sprig,m.leafPale,'branching kale flower stalks');batch(botanical,buds,m.flower,'two hundred and thirty-one small yellow buds');batch(botanical,petals,m.petal,'delicate four-petal yellow flowers');
  const orbit=layer('10 / wide clear botanical ribbon and fine wandering orbits');
  const path=new T.CatmullRomCurve3([V([-1.72,.03,.25]),V([-.95,.48,-.99]),V([.69,.46,-1.13]),V([1.66,-.17,-.18]),V([1.71,-.84,.59]),V([.69,-1.25,1.05]),V([-.71,-.43,1.41]),V([-1.69,.02,.62])]);
  const film=(u,v)=>{const p=path.getPoint(u),t=path.getTangent(u),cross=V([0,0,1]).cross(t).normalize();return p.addScaledVector(cross,(v-.5)*(.17+.032*Math.sin(u*6))).add(V([0,0,.015*Math.sin(u*29+v*7)])).toArray();};
  mesh(orbit,surface(film,160,10),m.film,'clear leaf-bearing front-to-back ribbon');
  const rims=[];for(const v of [0,1]){const p=[];for(let k=0;k<=140;k++)p.push(film(k/140,v));rims.push(tube(p,.0032,144,.9,5));}batch(orbit,rims,m.glassEdge,'visible transparent ribbon edges');
  const wire=[];
  [[[1.2,1.40,-.37],[1.78,.88,-.35],[1.12,.38,.58],[-.94,.38,.72],[-1.53,-.21,.20]],[[-1.48,-.68,-.12],[-.87,-1.40,.57],[.77,-1.30,.39],[1.61,-.68,-.39]],[[-.95,1.71,-.25],[-1.47,1.12,-.11],[-1.72,.20,.38],[-1.42,-.49,.40]]].forEach(p=>wire.push(tube(p,.0035,88,.75,5)));batch(orbit,wire,m.brass,'three fine open wandering brass paths');
  const satellites=[],tufts=[];
  [[-1.59,-1.02,.18,.12],[1.72,-.79,-.13,.13],[1.70,.88,-.22,.09],[-1.64,.38,-.22,.07]].forEach(([x,y,z,r],i)=>{
    const geo=oval([0,0,0],[r*.78,r*1.15,r*.83],i*.4,18),p=geo.attributes.position;for(let k=0;k<p.count;k++){const q=1+.15*Math.sin(p.getX(k)*67+i)*Math.cos(p.getY(k)*57);p.setXYZ(k,p.getX(k)*q+x,p.getY(k)*q+y,p.getZ(k)*q+z);}geo.computeVertexNormals();satellites.push(geo);
    for(let j=0;j<22;j++){const a=j*2.4;tufts.push(oval([x+r*.58*Math.cos(a),y+r*.93+(j%3)*.008,z+r*.57*Math.sin(a)],[.012,.023,.010],a,8));}
  });batch(orbit,satellites,m.bark,'four hanging rough root-stone fragments');batch(orbit,tufts,m.moss,'small moss growth on root fragments');
  function reshape(group,fn){group.updateMatrixWorld(true);group.traverse(o=>{if(!o.isMesh)return;const a=o.geometry.attributes.position,inv=o.matrixWorld.clone().invert();for(let i=0;i<a.count;i++){const v=new T.Vector3().fromBufferAttribute(a,i).applyMatrix4(o.matrixWorld);fn(v);v.applyMatrix4(inv);a.setXYZ(i,v.x,v.y,v.z);}o.geometry.computeVertexNormals();o.geometry.computeBoundingBox();o.geometry.computeBoundingSphere();});}
  reshape(plants,p=>{if(p.y>.50)p.y=.50+(p.y-.50)*.58;});
  reshape(botanical,p=>{if(p.y>.50)p.y=.50+(p.y-.50)*.58;});
  reshape(wood,p=>{if(p.y>.88)p.y=.88+(p.y-.88)*.54;});
  const fibreMesh=wood.children.find(o=>o.name==='interlaced flax and fine dry roots across five depth nests');
  reshape(fibreMesh,p=>{const d=p.clone().sub(coreCenter),r=coreRadius+.075+.018*Math.sin(p.x*9+p.y*6)*Math.cos(p.z*7);p.copy(d.normalize().multiplyScalar(r).add(coreCenter));});
  const wrap=(p,r)=>{const d=p.clone().sub(coreCenter);if(d.length()<r)p.copy(d.normalize().multiplyScalar(r).add(coreCenter));};
  for(const g of [wood,plants,botanical])reshape(g,p=>wrap(p,coreRadius+.035));
  reshape(cloth,p=>{if(p.y<-.80)p.y=-.80+(p.y+.80)*.75;wrap(p,coreRadius+.06);});
  for(const g of [paper,porcelain,silver])reshape(g,p=>wrap(p,coreRadius+.095));
  pocket.position.z+=.14;
  orbit.scale.setScalar(.87);
  // Each folio is an actual curved sheet with a turned free edge and a visible
  // reverse. Small offsets expose the seams while the round body stays intact.
  const folios=layer('11 / offset botanical folios and stitched material joints',[.025,.02,.11]);
  const inlays=layer('12 / porcelain offcuts, herb specimens and brass clips',[-.025,-.015,.16]);
  const gatherings=layer('13 / branching seed pods and small dried flower gatherings',[.015,.04,.055]);
  const sagePaper=m.verso.clone(),rosePaper=m.paper.clone();sagePaper.color.set('#a4b89d');rosePaper.color.set('#c9a5a1');owned.push(sagePaper,rosePaper);
  function folio(direction,radius,w,h,angle,material,seed,curl=.12){
    const n=V(direction).normalize(),g=local(folios,n.clone().multiplyScalar(radius).add(coreCenter).toArray());
    g.quaternion.setFromUnitVectors(V([0,0,1]),n);g.rotateZ(angle);
    const f=(u,v)=>{const s=u-.5,t=v-.5,edge=.0025*Math.sin(v*47+seed)+.0015*Math.sin(v*79+seed*.7),torn=.0025*Math.sin(u*43+seed)+.0015*Math.cos(u*83-seed),taper=material===m.blue?.58+.42*v:seed===146?.60+.40*v:1,x=s*w*taper+edge*(u**10+(1-u)**10),y=t*h+torn*(v**10+(1-v)**10),sag=-(x*x+y*y)/(2*radius),lift=curl*u**10*v**5+.025*(1-v)**12*u**3+.007*Math.sin(u*8+v*4+seed);return [x,y,sag+lift];};
    skin(g,f,material,material===m.blue?m.ceramicBack:m.verso,material===m.blue?.020:.0035,32,26);
    g.updateWorldMatrix(true,false);return {n,point:(u,v,lift=0)=>V(f(u,v)).add(V([0,0,lift])).applyMatrix4(g.matrixWorld)};
  }
  const folioSets=[
    {n:[-.31,-.36,1],r:1.49,w:.58,h:.34,a:-.24,m:m.paper},
    {n:[.49,.66,.73],r:1.43,w:.56,h:.30,a:.32,m:sagePaper},
    {n:[-.94,.12,.53],r:1.40,w:.20,h:.34,a:-.33,m:m.verso},
    {n:[1,.07,.42],r:1.40,w:.19,h:.32,a:-.15,m:m.paper},
    {n:[.16,-.99,.53],r:1.43,w:.40,h:.13,a:-.24,m:m.linenPale},
    {n:[.55,.35,-.84],r:1.44,w:.70,h:.40,a:.38,m:m.paper},
    {n:[-.67,-.44,-.74],r:1.44,w:.35,h:.55,a:-.31,m:sagePaper}
  ];
  const exposedSheets=[],stitches=[],clips=[];
  folioSets.forEach((s,i)=>{
    const under=folio(s.n,s.r-.060,s.w*1.16,s.h*1.10,s.a-.11,i%2?m.linenPale:rosePaper,100+i,.05);
    folio(s.n,s.r-.024,s.w*1.05,s.h*.95,s.a+.07,i%3===1?m.blue:m.verso,120+i,.065);
    const top=folio(s.n,s.r+.015,s.w*.86,s.h*.86,s.a,s.m,140+i,.11);top.under=under;exposedSheets.push(top);
    for(let j=0;j<7;j++){const v=.16+j*.097,p=top.point(.10,v,.007),q=under.point(.07,v+.014,.005);stitches.push(tube([p.toArray(),p.clone().lerp(q,.5).addScaledVector(top.n,.026).toArray(),q.toArray()],.0026,7,.82,5));}
    for(let j=0;j<2;j++){const u=.52+j*.13,p=top.point(u,.89,.007),q=under.point(u,.97,.005);clips.push(tube([p.clone().addScaledVector(top.n,-.007).toArray(),p.clone().addScaledVector(top.n,.016).toArray(),q.clone().addScaledVector(top.n,.019).toArray(),q.clone().addScaledVector(top.n,-.010).toArray()],.004,14,.95,6));}
  });
  batch(inlays,stitches,m.roseThread,'forty-nine irregular stitches joining the folio seams');
  batch(inlays,clips,m.brass,'fourteen small bent brass fasteners across lifted edges');
  const specimenVeins=[];
  for(const id of [0,1,5,6]){
    const s=exposedSheets[id];for(let j=0;j<5;j++){
      const u=(id===0?.10:.30)+(j%2)*.22,v=.26+j*.095,sign=j%2?1:-1;
      mesh(inlays,surface((x,y)=>s.point(u+sign*y*.14+(x-.5)*.115*Math.sin(y*Math.PI),v+y*.18,.012+.018*Math.sin(y*Math.PI)).toArray(),10,18),j%3?m.young:m.leafPale,'small pressed herb on an elevated botanical folio');
      specimenVeins.push(tube([(j===0?s.under.point(.06,v-.06,.008):s.point(.36,v-.06,.010)).toArray(),s.point(u,v,.020).toArray(),s.point(u+sign*.14,v+.18,.014).toArray()],.0025,14,.23,5));
    }
  }
  batch(inlays,specimenVeins,m.branch,'fine stems attached to the botanical paper specimens');
  // An interrupted diagonal of blue glaze and wine-red petals links the new
  // paper groups to the existing porcelain and warm glass pocket.
  const chips=[{n:[-.74,-.51,.62],a:.53},{n:[.43,.50,.81],a:-.34},{n:[.80,-.57,.29],a:.37},{n:[-.22,.38,-1],a:.21}];
  chips.forEach((s,i)=>{folio(s.n,1.435,.29+(i%2)*.04,.15,s.a,m.blue,180+i,.10);});
  const littleStems=[],pods=[],driedPetals=[],quietPetals=[],ochreSeeds=[];
  const fadedFlower=m.bud.clone();fadedFlower.color.set('#735953');owned.push(fadedFlower);
  [[-.80,-.29,1.07],[.78,.67,.82],[.13,-1.02,.88],[.76,.28,-.96],[-.74,-.48,-.96]].forEach((p,i)=>{
    const base=V(p).sub(coreCenter).normalize().multiplyScalar(1.39).add(coreCenter),n=base.clone().sub(coreCenter).normalize(),axis=V([-.20+(i%3)*.12,1,.10]).addScaledVector(n,-n.y).normalize(),across=axis.clone().cross(n).normalize();
    for(let j=0;j<(i===1?7:3);j++){const tip=base.clone().addScaledVector(axis,.12+j*.036).addScaledVector(across,.11*Math.sin(j*2.4+i)).addScaledVector(n,.025+(j%3)*.028),mid=base.clone().lerp(tip,.60).addScaledVector(n,.025);littleStems.push(tube([base.toArray(),mid.toArray(),tip.toArray()],.0038,13,.32,5));
      if(j%2)pods.push(oval(tip.toArray(),[.020,.031,.019],j*.7,12));
      else for(let k=0;k<5;k++){const a=k*TAU/5,at=tip.clone().addScaledVector(across,.023*Math.cos(a)).addScaledVector(axis,.023*Math.sin(a));(i===1?driedPetals:quietPetals).push(oval(at.toArray(),[.019,.026,.008],a+i*.2,10));}
      ochreSeeds.push(oval(tip.clone().addScaledVector(n,.008).toArray(),[.010,.011,.008],0,10));
    }
  });
  batch(gatherings,littleStems,m.branch,'five branching dried botanical gatherings');batch(gatherings,pods,m.seedGold,'seven small matte seed pods');batch(gatherings,driedPetals,m.bud,'wine-red flower accent above the upper folio');batch(gatherings,quietPetals,fadedFlower,'muted dried petals inside the secondary joins');batch(gatherings,ochreSeeds,m.flower,'small ochre flower centers');
  groups.forEach(g=>g.userData.restPosition=g.position.toArray());
  let meshCount=0,triangleCount=0;root.traverse(o=>{if(o.isMesh){meshCount++;triangleCount+=(o.geometry.index?.count||o.geometry.attributes.position.count)/3;}});
  root.userData={title:'芥兰',englishTitle:'Kale Planet',version:'0.24.0',artRevision:23,solidCore:true,bodyRadius:coreRadius,bodyCenter:coreCenter.toArray(),bodyAxes:[1,1,1],leafCount,leafClusters:3,seedSprigs:joints.length,netVeils:5,porcelainFragments:4,woodForks:9,structuralRoots:84,sideClothFolds:5,collageFolioSets:7,layeredSheets:21,porcelainOffcuts:4,pressedHerbs:20,seamStitches:49,brassFasteners:14,botanicalGatherings:5,smallSeedPods:7,seedGlassGap,seedLayout,meshCount,triangleCount,layers:groups.map(g=>g.name),detailTargets:{leaves:[.10,.75,1.22],linen:[-.50,-.55,1.30],glass:[.65,-.69,1.58],paper:[.48,.17,1.45],utensils:[-.09,-.50,1.44],rearSeam:[-.25,.12,-1.30]},structure:'Visible rough spherical botanical body with equal axes. Two primary collage nodes connect lifted papers, linen, blue porcelain, pressed herbs and botanical gatherings. Smaller tapered fragments and narrow seams continue around the sides and back. Fine stitches and brass fasteners bridge different sheets; physical gaps, curled corners and reverse faces create depth while the shared round volume stays readable at thumbnail size.',referenceBasis:'Two user botanical concept references. Two generated eight-material macro atlases are applied to curved surfaces; no complete reference image plane or spherical artwork projection.',back:'Independent radial roots, moss, reverse foliage, porcelain, layered folios, pressed herbs and cloth continue around the volume.',visualStatus:'Layered-collage revision preserving the spherical main body; independent thumbnail and six-view assessment is recorded separately and does not represent user approval.'};
  return {root,groups,ready:m.ready,setSeparated(amount){const a=T.MathUtils.clamp(Number(amount)||0,0,1);groups.forEach(g=>g.position.fromArray(g.userData.restPosition).addScaledVector(V(g.userData.separation),a));},dispose(){const geos=new Set();root.traverse(o=>{if(o.geometry)geos.add(o.geometry);});geos.forEach(g=>g.dispose());owned.forEach(x=>x.dispose());ownedTextures.forEach(t=>t.dispose());m.dispose();}};
}
