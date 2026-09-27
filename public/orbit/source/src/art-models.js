/** Original Little Orbit art, v0.2. Y-up, doors / characters face -Z.
 * Merge static pieces by material: roof tiles must not each cost a draw call.
 */
import * as T from 'three';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';
import { seededRandom } from './math.js';
export const PALETTE=Object.freeze({cream:'#f9ebcc',wall:'#efce95',wood:'#795140',bark:'#654b37',roof:'#c26148',roofLight:'#df8b60',green:'#365d4c',mint:'#719e79',leaf:'#73a062',lime:'#b7c573',gold:'#e7b958',glass:'#a7d7c8',ink:'#233b35',blue:'#6197a5',pink:'#e9aaa2'});
const materials=new Map(),shapes=new Map();
export function mat(color,extra={}){const key=color+JSON.stringify(extra);if(!materials.has(key))materials.set(key,new T.MeshStandardMaterial({color,roughness:.8,...extra}));return materials.get(key);}
function shape(key,build){if(!shapes.has(key))shapes.set(key,build());return shapes.get(key);}
export function part(geometry,color,pos=[0,0,0],extra={}){const m=new T.Mesh(geometry,mat(color,extra));m.position.set(...pos);m.castShadow=true;m.receiveShadow=true;return m;}
export function box(w,h,d,color,pos=[0,0,0],r=.025){return part(shape(`b${w}/${h}/${d}/${r}`,()=>new RoundedBoxGeometry(w,h,d,1,Math.min(r,w/3,h/3,d/3))),color,pos);}
export function ball(r,color,pos=[0,0,0],scale=[1,1,1]){const m=part(shape(`s${r}`,()=>new T.SphereGeometry(r,12,8)),color,pos);m.scale.set(...scale);return m;}
export function cyl(rt,rb,h,color,pos=[0,0,0],sides=12,extra={}){return part(shape(`c${rt}/${rb}/${h}/${sides}`,()=>new T.CylinderGeometry(rt,rb,h,sides)),color,pos,extra);}
export function cone(r,h,color,pos=[0,0,0],sides=10){return cyl(0,r,h,color,pos,sides);}
function ring(r,t,color,pos=[0,0,0]){return part(shape(`t${r}/${t}`,()=>new T.TorusGeometry(r,t,5,24)),color,pos);}
function rod(a,b,r,color){const av=new T.Vector3(...a),bv=new T.Vector3(...b),v=bv.clone().sub(av);const m=cyl(r,r,v.length(),color,av.clone().add(bv).multiplyScalar(.5).toArray(),8);m.quaternion.setFromUnitVectors(new T.Vector3(0,1,0),v.normalize());return m;}
function curve(points,r,color){return part(new T.TubeGeometry(new T.CatmullRomCurve3(points.map(p=>new T.Vector3(...p))),22,r,5,false),color);}
export function mergeStatic(group){
  group.updateMatrixWorld(true);const buckets=new Map();
  group.traverse(node=>{
    if(!node.isMesh)return;
    const key=`${node.material.uuid}/${node.castShadow}/${node.receiveShadow}`;
    if(!buckets.has(key))buckets.set(key,{material:node.material,cast:node.castShadow,receive:node.receiveShadow,geometries:[]});
    const geom=node.geometry.clone();
    // Preserve indexed vertices: expanding every leaf/sphere into independent
    // triangles used ~76 MB for the landscape alone. Non-indexed shapes receive
    // identity indices; triangle order, seams, UVs and normals are unchanged.
    if(!geom.index){
      const count=geom.attributes.position.count,ArrayType=count>65535?Uint32Array:Uint16Array;
      geom.setIndex(new T.BufferAttribute(ArrayType.from({length:count},(_,i)=>i),1));
    }
    geom.applyMatrix4(node.matrixWorld);
    for(const attr of Object.keys(geom.attributes))if(!['position','normal','uv'].includes(attr))geom.deleteAttribute(attr);
    if(!geom.getAttribute('uv'))geom.setAttribute('uv',new T.Float32BufferAttribute(new Float32Array(geom.getAttribute('position').count*2),2));
    buckets.get(key).geometries.push(geom);
  });
  const result=new T.Group();result.name=group.name;
  for(const {material,cast,receive,geometries} of buckets.values()){const geometry=mergeGeometries(geometries,false);geometries.forEach(g=>g.dispose());if(!geometry)throw new Error('Cannot merge art geometry');const m=new T.Mesh(geometry,material);m.castShadow=cast;m.receiveShadow=receive;result.add(m);}
  return result;
}
function windowAt(g,x,y,z,r=.12){
  g.add(box(r*2.5,r*2.7,.055,PALETTE.wood,[x,y,z]),box(r*1.9,r*2.15,.065,'#eeca7c',[x,y,z-.018]));
  g.add(box(.024,r*2.3,.08,PALETTE.cream,[x,y,z-.046]),box(r*2.1,.023,.08,PALETTE.cream,[x,y,z-.046]),box(r*2.9,.038,.13,PALETTE.wood,[x,y-r*1.48,z-.025]));
}
function archedDoor(g,x,y,z,color=PALETTE.green,width=.22,height=.35){
  const arch=new T.Shape();arch.moveTo(-width/2,0);arch.lineTo(width/2,0);arch.lineTo(width/2,height-width/2);arch.absarc(0,height-width/2,width/2,0,Math.PI,false);arch.closePath();
  g.add(part(new T.ExtrudeGeometry(arch,{depth:.055,bevelEnabled:true,bevelThickness:.006,bevelSize:.008,bevelSegments:1,curveSegments:10}),color,[x,y,z]),ball(.014,PALETTE.gold,[x+width*.29,y+height*.46,z-.012]));
  for(let i=-1;i<=1;i++)g.add(box(.009,height*.7,.012,'#203f37',[x+i*width*.22,y+height*.39,z-.013],0));
}
function pot(g,x,z,color=PALETTE.roof,s=1){
  const p=new T.Group();p.add(cyl(.085,.065,.13,color,[0,.09,0]),cyl(.09,.09,.025,color,[0,.16,0]));
  for(let i=0;i<4;i++){const a=i*2.4;const leaf=ball(.09,i%2?PALETTE.leaf:PALETTE.mint,[Math.cos(a)*.045,.2+i*.016,Math.sin(a)*.045],[.65,1.2,.6]);leaf.rotation.z=Math.cos(a)*.5;p.add(leaf);}p.position.set(x,0,z);p.scale.setScalar(s);g.add(p);
}
function chimney(g,x,z){g.add(box(.13,.43,.14,PALETTE.wall,[x,1.1,z]),box(.17,.05,.18,PALETTE.cream,[x,1.335,z]));for(let i=0;i<3;i++)g.add(box(.07,.019,.008,PALETTE.roof,[x+(i%2)*.025-.015,1.19-i*.09,z-.075],0));}
function gableRoof(g,color=PALETTE.roof,w=1.04,d=.87,base=.78,rise=.4){
  const slope=Math.atan2(rise,w/2),len=Math.hypot(w/2,rise);
  for(const side of [-1,1]){
    const slab=box(len+.075,.07,d+.08,color,[side*w/4,base+rise/2,0]);slab.rotation.z=-side*slope;g.add(slab);
    for(let row=0;row<4;row++)for(let col=0;col<6;col++){const t=(row+.5)/4;const tile=box(len/4+.025,.035,d/6-.008,(row+col)%4===0?PALETTE.roofLight:color,[side*w/2*t,base+rise*(1-t)+.047,(col-2.5)*d/6]);tile.rotation.z=-side*slope;g.add(tile);}
    const trim=box(len+.1,.07,.065,PALETTE.cream,[side*w/4,base+rise/2,-d/2-.048]);trim.rotation.z=-side*slope;g.add(trim);
  }g.add(box(.085,.075,d+.12,PALETTE.roofLight,[0,base+rise+.046,0]));
}
function gardenFence(g,x,z,length=.64,angle=0){const f=new T.Group();for(let i=0;i<5;i++)f.add(box(.04,.2,.04,PALETTE.cream,[-length/2+i*length/4,.115,0]));for(const y of [.075,.17])f.add(box(length+.08,.025,.034,PALETTE.cream,[0,y,0]));f.position.set(x,0,z);f.rotation.y=angle;g.add(f);}
function flowers(g,x,z,color=PALETTE.pink,count=6){for(let i=0;i<count;i++){const a=i*2.399,r=.04+Math.sqrt(i)*.05,xx=x+Math.cos(a)*r,zz=z+Math.sin(a)*r,yy=.16+(i%3)*.025;g.add(rod([xx,.025,zz],[xx,yy,zz],.009,PALETTE.green));for(let k=0;k<5;k++)g.add(ball(.024,color,[xx+Math.cos(k*1.256)*.028,yy,zz+Math.sin(k*1.256)*.028],[1,.5,1]));g.add(ball(.016,PALETTE.gold,[xx,yy+.008,zz]));}}
function cottage(kind='home'){
  const g=new T.Group(),roofColor=kind==='library'?'#658b79':kind==='mail'?'#466f79':kind==='studio'?'#dbac56':PALETTE.roof;
  g.add(box(.88,.09,.84,'#b49a78',[0,.045,0]),box(.79,.66,.65,kind==='mail'?'#e2c2a1':PALETTE.wall,[0,.4,0]));
  const triangle=new T.Shape();triangle.moveTo(-.4,0);triangle.lineTo(.4,0);triangle.lineTo(0,.37);triangle.closePath();g.add(part(new T.ExtrudeGeometry(triangle,{depth:.65,bevelEnabled:false}),PALETTE.cream,[0,.72,-.325]));
  for(const x of [-.36,.36])g.add(box(.045,.63,.055,PALETTE.wood,[x,.42,-.34]));gableRoof(g,roofColor);chimney(g,.26,.2);
  archedDoor(g,0,.09,-.39,PALETTE.green,.21,.4);windowAt(g,-.255,.47,-.347,.074);windowAt(g,.255,.47,-.347,.074);
  g.add(ring(.073,.018,PALETTE.wood,[0,.85,-.335]));const pane=cyl(.059,.059,.02,'#ecc66f',[0,.85,-.337]);pane.rotation.x=Math.PI/2;g.add(pane,box(.028,.13,.034,PALETTE.cream,[0,.85,-.359]));
  g.add(box(.3,.035,.21,'#d8c29e',[0,.055,-.49]),box(.38,.03,.14,PALETTE.cream,[0,.027,-.62]));pot(g,-.51,-.27);pot(g,.49,-.34,PALETTE.blue,.8);gardenFence(g,-.43,.36,.53);flowers(g,-.5,.02,PALETTE.pink,5);
  if(kind==='studio'){
    const awning=box(.62,.055,.34,PALETTE.cream,[.52,.52,-.04]);awning.rotation.z=-.12;g.add(awning);for(let i=0;i<5;i++)g.add(box(.085,.07,.36,i%2?roofColor:PALETTE.cream,[.28+i*.11,.525,-.04]));for(const z of [-.19,.12])g.add(cyl(.018,.018,.48,PALETTE.wood,[.79,.24,z]));g.add(box(.35,.22,.3,PALETTE.wood,[.57,.13,.02]));
    const easel=new T.Group();easel.add(box(.27,.32,.028,PALETTE.wood,[0,.37,0]),box(.225,.27,.035,'#fff7db',[0,.37,-.02]),ball(.06,PALETTE.blue,[.02,.4,-.04],[1,1,.07]),box(.18,.06,.012,PALETTE.leaf,[0,.28,-.045]));for(const x of [-.1,.1])easel.add(rod([x,0,.07],[x*.5,.56,.015],.018,PALETTE.wood));easel.position.set(.63,0,-.48);easel.rotation.y=-.25;g.add(easel);
  }
  if(kind==='library'){g.add(box(.57,.12,.04,PALETTE.wood,[0,.63,-.395]));for(let i=0;i<7;i++){const h=.12+(i%3)*.025;g.add(box(.048,h,.07,[PALETTE.roof,PALETTE.blue,PALETTE.gold,PALETTE.green][i%4],[-.16+i*.052,.63+h/2,-.42]));}const stack=new T.Group();for(let i=0;i<3;i++){const b=box(.23,.046,.15,[PALETTE.roof,PALETTE.blue,PALETTE.gold][i],[0,.055+i*.05,0]);b.rotation.y=i*.15;stack.add(b);}stack.position.set(.54,0,-.54);g.add(stack);}
  if(kind==='mail'){g.add(box(.6,.08,.04,PALETTE.blue,[0,.64,-.39]));const m=new T.Group();m.add(cyl(.025,.025,.35,PALETTE.wood,[0,.19,0]),box(.24,.18,.23,PALETTE.roof,[0,.42,0],.055),box(.16,.026,.012,PALETTE.ink,[0,.435,-.119],.005),box(.09,.06,.014,PALETTE.gold,[.14,.54,0]),box(.015,.16,.015,PALETTE.gold,[.105,.49,0]));m.position.set(.61,0,-.36);g.add(m);for(let i=0;i<3;i++)g.add(box(.14,.03,.1,PALETTE.cream,[-.6,.06+i*.034,-.43],.003));}
  return g;
}
function garden(){
  const g=new T.Group();for(const x of [-.49,.49]){g.add(box(.22,.075,.91,PALETTE.wood,[x,.038,.02]));for(let j=0;j<3;j++)flowers(g,x,-.23+j*.25,[PALETTE.pink,'#d08497',PALETTE.cream][j],4);}g.add(ring(.38,.035,PALETTE.wood,[0,.51,.3]));for(const x of [-.38,.38])g.add(cyl(.027,.032,.56,PALETTE.wood,[x,.28,.3]));
  for(let i=0;i<11;i++){const t=i/10*Math.PI;g.add(ball(.088,i%3?PALETTE.mint:PALETTE.leaf,[Math.cos(t)*.39,.51+Math.sin(t)*.39,.3],[1,.7,.8]));if(i%2===0)g.add(ball(.046,PALETTE.pink,[Math.cos(t)*.39,.52+Math.sin(t)*.4,.235]));}
  g.add(cyl(.06,.1,.25,PALETTE.wood,[0,.13,-.17]),box(.38,.045,.31,PALETTE.wood,[0,.29,-.2]));for(const side of [-1,1]){const page=box(.19,.05,.3,PALETTE.cream,[side*.09,.34,-.2],.004);page.rotation.z=side*.19;g.add(page);for(let i=0;i<4;i++)g.add(box(.12,.006,.008,'#b9b39d',[side*.09,.37,-.3+i*.059],0));}for(let i=0;i<4;i++)g.add(box(.22,.025,.1,PALETTE.cream,[0,.015,-.59+i*.17]));gardenFence(g,0,.52,.68);return g;
}
function lighthouse(){
  const g=new T.Group();g.add(cyl(.3,.34,.1,PALETTE.cream,[0,.05,0]));for(let i=0;i<4;i++)g.add(cyl(.21-i*.018,.23-i*.018,.245,i%2?PALETTE.roof:PALETTE.cream,[0,.22+i*.245,0],16));archedDoor(g,0,.09,-.24,PALETTE.green,.14,.25);
  for(let i=0;i<2;i++){const w=cyl(.047,.047,.045,PALETTE.ink,[0,.55+i*.32,-.202+i*.021]);w.rotation.x=Math.PI/2;g.add(w,ring(.049,.012,PALETTE.gold,[0,.55+i*.32,-.226+i*.021]));}
  g.add(cyl(.3,.3,.046,PALETTE.wood,[0,1.1,0]));for(let i=0;i<12;i++){const a=i/12*Math.PI*2;g.add(cyl(.009,.009,.16,PALETTE.cream,[Math.cos(a)*.28,1.2,Math.sin(a)*.28],6));}const rail=ring(.28,.012,PALETTE.cream,[0,1.28,0]);rail.rotation.x=Math.PI/2;g.add(rail);
  g.add(cyl(.137,.137,.24,'#edc766',[0,1.25,0],12,{emissive:'#eca23d',emissiveIntensity:.32}));for(let i=0;i<6;i++){const a=i/6*Math.PI*2;g.add(cyl(.012,.012,.26,PALETTE.wood,[Math.cos(a)*.15,1.25,Math.sin(a)*.15],6));}g.add(cone(.28,.22,PALETTE.green,[0,1.49,0],12),ball(.035,PALETTE.gold,[0,1.63,0]));for(const x of [-.44,.44]){const rock=part(new T.DodecahedronGeometry(.2),x<0?'#95a2a3':'#b9b7a1',[x,.09,.16]);rock.scale.set(1,.8,1);g.add(rock);}return g;
}
function observatory(){
  const g=new T.Group();g.add(cyl(.45,.49,.11,PALETTE.wood,[0,.055,0]),cyl(.4,.42,.48,PALETTE.cream,[0,.32,0],24),part(new T.SphereGeometry(.42,24,12,0,Math.PI*2,0,Math.PI/2),PALETTE.blue,[0,.55,0],{metalness:.15,roughness:.57}));const lip=ring(.421,.026,PALETTE.gold,[0,.56,0]);lip.rotation.x=Math.PI/2;g.add(lip);
  for(let i=0;i<4;i++){const arc=part(new T.TorusGeometry(.425,.008,4,32,Math.PI),PALETTE.gold,[0,.55,0]);arc.rotation.y=i*Math.PI/4;g.add(arc);}archedDoor(g,0,.1,-.435,PALETTE.green,.22,.33);
  const scope=new T.Group();scope.add(cyl(.09,.115,.5,PALETTE.wood),cyl(.105,.105,.075,PALETTE.gold,[0,.25,0]),cyl(.089,.089,.008,'#203e50',[0,.291,0]));scope.position.set(.13,.89,-.16);scope.rotation.x=-.93;g.add(scope);g.add(ring(.11,.013,PALETTE.gold,[-.52,.47,-.2]),ball(.072,PALETTE.blue,[-.52,.47,-.2]),rod([-.52,0,-.2],[-.52,.33,-.2],.027,PALETTE.wood));return g;
}
function campsite(){
  const g=new T.Group();for(const s of [-1,1]){const side=box(.66,.04,.79,PALETTE.gold,[s*.205,.3,.05],.012);side.rotation.z=-s*.83;g.add(side);}const t=new T.Shape();t.moveTo(-.43,0);t.lineTo(.43,0);t.lineTo(0,.6);t.closePath();g.add(part(new T.ShapeGeometry(t),PALETTE.wood,[0,.014,-.352],{side:T.DoubleSide}));
  for(const s of [-1,1]){const f=new T.Shape();f.moveTo(s*.4,0);f.lineTo(0,.59);f.lineTo(s*.12,.05);f.closePath();g.add(part(new T.ShapeGeometry(f),PALETTE.gold,[0,.016,-.358],{side:T.DoubleSide}));}for(const x of [-.49,.49])g.add(rod([x,.01,-.5],[0,.65,-.35],.012,PALETTE.cream));g.add(box(.045,.04,.89,PALETTE.wood,[0,.64,.05]));
  for(let i=0;i<9;i++){const a=i*2*Math.PI/9;g.add(ball(.055,'#979c93',[.56+Math.cos(a)*.18,.04,-.33+Math.sin(a)*.18],[1,.7,1]));}for(const a of [-.7,.7]){const log=cyl(.032,.032,.28,PALETTE.wood,[.56,.06,-.33]);log.rotation.z=Math.PI/2;log.rotation.y=a;g.add(log);}g.add(ball(.08,'#d8743c',[.56,.13,-.33],[1,1.45,1]),cone(.051,.19,PALETTE.gold,[.55,.22,-.33]),box(.28,.065,.2,PALETTE.roof,[-.55,.18,-.38]));for(const x of [-.64,-.46])g.add(box(.035,.16,.12,PALETTE.wood,[x,.08,-.38]));return g;
}
export function makeArtLandmark(item){
  const root=new T.Group();root.name=`landmark-${item.id}`;let building=item.id==='journal'?garden():item.id==='lab'?lighthouse():item.id==='observatory'?observatory():item.id==='camp'?campsite():cottage(item.id);building.name=`building-${item.id}`;building=mergeStatic(building);building.rotation.y=Math.PI;
  const plaza=new T.Group();plaza.add(cyl(.72,.75,.07,'#d4ba91',[0,.002,0],36));for(let i=0;i<22;i++){const a=i/22*Math.PI*2;const p=box(.12,.045,.065,i%3===0?'#e6d4b1':'#f5e7ca',[Math.cos(a)*.71,.047,Math.sin(a)*.71],.014);p.rotation.y=-a;plaza.add(p);}root.add(mergeStatic(plaza),building);
  const ornament=new T.Group();ornament.name=`treasure-${item.id}`;ornament.add(part(new T.OctahedronGeometry(.056),PALETTE.gold,[0,0,0],{metalness:.45,roughness:.4}),ring(.081,.009,PALETTE.cream));ornament.position.set(.65,.32,.38);root.add(ornament);return {root,building,ornament};
}
export function makeArtTree(size=1,variant=0){
  const g=new T.Group();g.name='woodland-tree';g.add(cyl(.04,.068,.4,PALETTE.bark,[0,.2,0],7));
  if(variant%4===0){for(let i=0;i<3;i++)g.add(cone(.29-i*.067,.46-i*.045,['#38674d','#548358','#79a365'][i],[0,.43+i*.18,0],9));}
  else{const colors=variant%4===3?['#d4af61','#e0c077','#b99955']:['#659259','#7fa665','#94b672'];g.add(rod([0,.26,0],[-.15,.46,0],.025,PALETTE.bark),rod([0,.25,0],[.15,.46,.04],.026,PALETTE.bark));for(let i=0;i<4;i++){const a=i*2.4;const m=part(new T.IcosahedronGeometry(.235,1),colors[i%3],[Math.cos(a)*.12,.53+(i%2)*.105,Math.sin(a)*.13]);m.scale.set(.91,1.1,.88);g.add(m);}if(variant%5===0)for(let i=0;i<4;i++)g.add(ball(.027,PALETTE.roof,[Math.cos(i*1.7)*.21,.51+(i%2)*.13,Math.sin(i*1.7)*.22]));}
  const result=mergeStatic(g);result.scale.setScalar(size);return result;
}
export function makeArtAvatar(){
  const root=new T.Group(),visual=new T.Group(),body=new T.Group();root.name='traveller';visual.name='traveller-heading';body.name='traveller-body';root.add(visual);visual.add(body);
  body.add(ball(.215,'#ecc3a0',[0,.715,-.015],[1,.96,.92]),ball(.04,'#e3ac8d',[-.2,.69,0]),ball(.04,'#e3ac8d',[.2,.69,0]),ball(.22,PALETTE.wood,[0,.79,.022],[1,.59,.93]));body.add(cyl(.277,.28,.043,PALETTE.green,[0,.853,.018],20),ball(.217,PALETTE.green,[0,.86,.02],[1,.5,1]),cyl(.201,.218,.045,'#b29663',[0,.892,.02],20));const feather=ball(.055,PALETTE.gold,[.16,.965,.018],[.45,1.65,.3]);feather.rotation.z=-.43;body.add(feather);
  for(const x of [-.071,.071])body.add(ball(.026,PALETTE.ink,[x,.728,-.198],[.8,1.16,.45]),ball(.008,'#fff8ed',[x-.006,.739,-.210]),ball(.034,'#d9917f',[x*1.55,.677,-.178],[1,.46,.25]));body.add(ball(.027,'#dba585',[0,.693,-.213],[1,.8,.7]),curve([[-.035,.66,-.204],[0,.65,-.208],[.035,.66,-.204]],.007,PALETTE.wood));
  body.add(box(.26,.28,.21,PALETTE.blue,[0,.442,0],.068),cyl(.145,.13,.07,PALETTE.cream,[0,.571,0],14));const scarf=box(.08,.18,.03,PALETTE.roof,[.033,.493,-.129],.015);scarf.rotation.z=.25;body.add(scarf);body.add(box(.23,.25,.14,PALETTE.gold,[0,.46,.162],.055),box(.24,.06,.16,PALETTE.wood,[0,.566,.162]),box(.075,.1,.04,PALETTE.cream,[0,.43,.249]));for(const x of [-.103,.103])body.add(box(.025,.25,.032,PALETTE.wood,[x,.455,-.109]));
  const legs=[],arms=[];for(const [i,x] of [-.072,.072].entries()){const leg=new T.Group();leg.name=i?'legR':'legL';leg.position.set(x,.313,0);leg.add(box(.107,.21,.116,'#687f64',[0,-.092,0],.034),box(.115,.09,.165,PALETTE.wood,[0,-.262,-.02],.029),box(.12,.027,.17,'#c3a277',[0,-.301,-.02],.012));body.add(leg);legs.push(leg);const arm=new T.Group();arm.name=i?'armR':'armL';arm.position.set(Math.sign(x)*.17,.535,0);arm.add(box(.077,.205,.095,PALETTE.blue,[0,-.089,0],.038),ball(.045,'#ecc3a0',[0,-.202,-.005]));body.add(arm);arms.push(arm);}
  for(const leg of legs)leg.add(cyl(.037,.038,.09,PALETTE.cream,[0,-.211,0],10));
  const times=[0,.2,.4,.6,.8],angles=[0,.58,0,-.58,0];const tracks=[['legL',1],['legR',-1],['armL',-.6],['armR',.6]].map(([n,m])=>new T.QuaternionKeyframeTrack(`${n}.quaternion`,times,angles.flatMap(a=>new T.Quaternion().setFromAxisAngle(new T.Vector3(1,0,0),a*m).toArray())));
  const clips=[new T.AnimationClip('Walk',.8,tracks),new T.AnimationClip('Idle',2.4,[new T.QuaternionKeyframeTrack('armL.quaternion',[0,1.2,2.4],[0,0,0,1,0,0,-.025,.999687,0,0,0,1])])];root.animations=clips;
  return {root,visual,body,clips,animate(time,moving,reduced){const swing=moving&&!reduced?Math.sin(time*7.85)*.58:0;legs[0].rotation.x=swing;legs[1].rotation.x=-swing;arms[0].rotation.x=-swing*.6;arms[1].rotation.x=swing*.6;body.position.y=reduced?0:moving?Math.abs(Math.sin(time*7.85))*.012:Math.sin(time*2)*.004;}};
}
export function makeArtGuide(variant='sprout'){
  const root=new T.Group(),visual=new T.Group();root.name=`guide-${variant}`;root.add(visual);const color=({sprout:PALETTE.mint,ember:'#e7a55f',droplet:PALETTE.blue,petal:PALETTE.pink})[variant]||PALETTE.mint;visual.add(ball(.172,color,[0,.12,0],[1,1.08,.87]),ball(.14,PALETTE.cream,[0,.105,-.084],[1,.8,.43]));
  for(const x of [-.053,.053])visual.add(ball(.017,PALETTE.ink,[x,.148,-.148],[.85,1.15,.4]),ball(.005,'#ffffff',[x-.003,.153,-.156]),ball(.023,PALETTE.pink,[x*1.6,.096,-.14],[1,.48,.3]));visual.add(curve([[-.023,.088,-.149],[0,.079,-.153],[.023,.088,-.149]],.005,PALETTE.wood));
  for(const side of [-1,1]){const w=ball(.08,PALETTE.cream,[side*.202,.13,0],[1,.38,.61]);w.rotation.z=side*.5;w.name=side<0?'wingL':'wingR';visual.add(w);}visual.add(rod([0,.26,0],[.01,.36,0],.012,PALETTE.green));for(const s of [-1,1]){const l=ball(.07,variant==='petal'?PALETTE.pink:PALETTE.green,[s*.047,.36,0],[.5,1,.35]);l.rotation.z=-s*.75;visual.add(l);}visual.add(ball(.044,PALETTE.gold,[0,-.046,.01],[1,.8,1]));return {root,visual,animate(time,reduced){if(reduced)return;for(const n of visual.children)if(n.name.startsWith('wing'))n.rotation.z=(n.name==='wingL'?-1:1)*(.4+Math.sin(time*7)*.17);}};
}
export function makeMeadow(seed=4){const g=new T.Group(),random=seededRandom(seed);for(let i=0;i<4;i++){const x=(random()-.5)*.3,z=(random()-.5)*.3,h=.065+random()*.04;g.add(cone(.018,h,PALETTE.leaf,[x,h/2,z],4));if(i===0)g.add(cyl(.006,.006,.095,PALETTE.green,[x,.048,z],4),ball(.024,seed%3===0?PALETTE.pink:PALETTE.cream,[x,.106,z],[1,.45,1]),ball(.01,PALETTE.gold,[x,.116,z]));}return mergeStatic(g);}
export function makeMushrooms(){const g=new T.Group();for(let i=0;i<3;i++){const x=(i-1)*.085,z=(i%2)*.08,h=.08+i*.023;g.add(cyl(.018,.022,h,PALETTE.cream,[x,h/2,z],6),ball(.065,i%2?PALETTE.gold:PALETTE.roof,[x,h,z],[1,.5,1]),ball(.012,PALETTE.cream,[x-.025,h+.027,z-.012]));}return mergeStatic(g);}
export function makeTreasure(id){
  const g=new T.Group();g.name=`collectible-${id}`;
  if(id==='home')g.add(ring(.15,.04,PALETTE.gold,[0,.44,0]),box(.05,.28,.07,PALETTE.gold,[0,.16,0]),box(.12,.045,.07,PALETTE.gold,[.04,.06,0]),box(.1,.035,.07,PALETTE.gold,[.03,.13,0]));
  else if(id==='journal'){g.add(box(.22,.42,.035,PALETTE.roof,[0,.24,0],.007),box(.17,.32,.008,PALETTE.cream,[0,.25,-.023],.004),ring(.04,.008,PALETTE.gold,[0,.39,-.03]),curve([[0,.44,0],[.08,.55,0],[.16,.49,0]],.014,PALETTE.gold));for(let i=0;i<3;i++)g.add(box(.11,.01,.008,PALETTE.mint,[0,.15+i*.045,-.03],0));}
  else if(id==='library'){for(const s of [-1,1]){const b=box(.3,.06,.4,s<0?PALETTE.cream:'#f4dfb6',[s*.14,.14,0]);b.rotation.z=s*.12;g.add(b);}g.add(box(.03,.06,.46,PALETTE.roof,[.06,.182,0]));}
  else if(id==='lab'){g.add(cyl(.11,.14,.08,PALETTE.wood,[0,.04,0]),cyl(.105,.105,.28,PALETTE.gold,[0,.22,0]),cone(.16,.1,PALETTE.green,[0,.41,0]),ring(.068,.016,PALETTE.wood,[0,.51,0]));for(const x of [-.12,.12])g.add(rod([x,.05,0],[x,.4,0],.012,PALETTE.wood));}
  else if(id==='studio'){g.add(ring(.19,.065,PALETTE.gold,[0,.27,0]));for(let i=0;i<8;i++){const a=i*Math.PI/4,t=box(.12,.085,.12,PALETTE.gold,[Math.cos(a)*.25,.27+Math.sin(a)*.25,0]);t.rotation.z=a;g.add(t);}}
  else if(id==='observatory'){g.add(part(new T.OctahedronGeometry(.22),PALETTE.gold,[0,.29,0]));const r=ring(.31,.018,PALETTE.blue,[0,.29,0]);r.rotation.y=.65;r.rotation.x=.4;g.add(r);}
  else if(id==='mail')g.add(box(.48,.34,.06,PALETTE.cream,[0,.22,0],.006),rod([-.225,.38,-.04],[0,.18,-.04],.008,PALETTE.roof),rod([0,.18,-.04],[.225,.38,-.04],.008,PALETTE.roof),box(.085,.075,.012,PALETTE.blue,[.16,.32,-.04],.002));
  else{g.add(ball(.16,PALETTE.wood,[0,.25,0],[.8,1.4,.8]));for(let i=0;i<5;i++)for(let j=0;j<5;j++){const a=j*1.256+i*.5;g.add(ball(.06,i%2?'#bd9566':'#997247',[Math.cos(a)*.115,.1+i*.07,Math.sin(a)*.115],[1,.55,1]));}g.add(cyl(.02,.025,.09,PALETTE.wood,[0,.49,0]));}return mergeStatic(g);
}
