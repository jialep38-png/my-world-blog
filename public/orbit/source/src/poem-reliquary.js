/**
 * 0.16: a continuous, hand-assembled poem object.
 * Original deterministic material drawings and real curved geometry. No reference
 * pixels, signatures, song-lyric textures or camera-facing replacement globe.
 */
import * as T from 'three';
import {fromLatLon,seededRandom} from './math.js';
import {part,box,ball,cyl,mergeStatic,makeFern,makeReeds,makeFlowerCluster} from './garden-models.js';
import {texturedStoneMaterial,mossMaterial} from './collage-layers.js';

const R=5.4,Z=new T.Vector3(0,0,1),UP=new T.Vector3(0,1,0);
const maps=new Map();
export function poemTexture(kind){
  if(maps.has(kind))return maps.get(kind);
  const c=document.createElement('canvas');c.width=c.height=kind==='paper'?1024:512;
  const x=c.getContext('2d'),S=c.width,rng=seededRandom(16051+kind.length*973+kind.charCodeAt(0));
  const backgrounds={silver:'#cbd0c8',indigo:'#617784',paper:'#ece7d6',graphite:'#919990',bark:'#66533d',water:'#9bbcc0',jade:'#aebb99',substrate:'#b4bfa5',inkwash:'#e7e4d3'};
  x.fillStyle=backgrounds[kind]||'#aaa991';x.fillRect(0,0,S,S);
  // Large, translucent stains are laid down before fine fibres and weave.
  for(let i=0;i<190;i++){
    const px=rng()*S,py=rng()*S,r=9+rng()*S*.22,g=x.createRadialGradient(px,py,0,px,py,r);
    const light=i%3===0;g.addColorStop(0,light?'rgba(244,239,220,.10)':'rgba(19,36,30,.055)');g.addColorStop(1,'rgba(0,0,0,0)');x.fillStyle=g;x.fillRect(px-r,py-r,r*2,r*2);
  }
  for(let i=0;i<(kind==='paper'?21000:11000);i++){
    x.fillStyle=i%3?'rgba(248,242,225,.09)':'rgba(28,44,33,.07)';
    x.fillRect(rng()*S,rng()*S,.3+rng()*1.25,kind==='paper'?1+rng()*4:.4+rng()*1.2);
  }
  if(['silver','indigo'].includes(kind)){
    for(let i=0;i<S;i+=2){
      x.strokeStyle=i%4?'rgba(231,235,215,.09)':'rgba(22,42,34,.12)';x.lineWidth=.65;
      x.beginPath();x.moveTo(i,0);x.lineTo(i,S);x.stroke();
      x.strokeStyle='rgba(221,229,217,.07)';x.beginPath();x.moveTo(0,i);x.lineTo(S,i);x.stroke();
    }
    for(let i=0;i<19;i++){
      const px=rng()*S;x.strokeStyle=kind==='silver'?'rgba(238,239,219,.23)':'rgba(181,199,183,.17)';x.lineWidth=.8;
      x.beginPath();x.moveTo(px,-10);x.bezierCurveTo(px-20,180,px+34,300,px+8,S+10);x.stroke();
    }
    if(kind==='indigo')for(let k=0;k<24;k++){
      const px=rng()*S,py=rng()*S;x.save();x.translate(px,py);x.rotate(rng()*6.28);
      x.strokeStyle='rgba(210,214,175,.26)';x.lineWidth=.9;
      for(let p=0;p<5;p++){x.rotate(Math.PI*2/5);x.beginPath();x.ellipse(0,-7,3.4,8,0,0,Math.PI*2);x.stroke();}x.restore();
    }
  }
  if(kind==='inkwash'){
    // Pigment granulation and a broken dry-brush edge, rather than blurred dots.
    const grids=[4,9,19,43,89].map(n=>({n,a:Float32Array.from({length:(n+1)*(n+1)},()=>rng())}));
    const noise=(g,u,v)=>{const xx=u*g.n,yy=v*g.n,ix=Math.min(g.n-1,Math.floor(xx)),iy=Math.min(g.n-1,Math.floor(yy));let a=xx-ix,b=yy-iy;a=a*a*(3-2*a);b=b*b*(3-2*b);const at=(i,j)=>g.a[j*(g.n+1)+i];return (at(ix,iy)*(1-a)+at(ix+1,iy)*a)*(1-b)+(at(ix,iy+1)*(1-a)+at(ix+1,iy+1)*a)*b;};
    const img=x.getImageData(0,0,S,S),d=img.data;
    for(let yy=0;yy<S;yy++)for(let xx=0;xx<S;xx++){
      const u=xx/(S-1),v=yy/(S-1),n=grids.reduce((sum,g,i)=>sum+noise(g,u,v)*[.42,.26,.16,.1,.06][i],0);
      const silhouette=.60-Math.abs(u-(.48+.14*Math.sin(v*4.7)))*1.52+(n-.5)*1.22;
      let ink=Math.max(0,Math.min(1,(silhouette-.08)*2.5));
      ink*=.49+.42*noise(grids[2],u,v);ink*=rng()>.13?1:.45;
      const k=(yy*S+xx)*4,grain=(rng()-.5)*13;
      for(let ch=0;ch<3;ch++)d[k+ch]=Math.max(0,Math.min(255,[228,226,211][ch]*(1-ink)+[52,60,54][ch]*ink+grain));
    }
    x.putImageData(img,0,0);
    for(let i=0;i<44;i++){const px=S*(.21+rng()*.59),py=rng()*S;x.fillStyle=i%3?'rgba(178,112,127,.41)':'rgba(223,198,164,.42)';x.beginPath();x.ellipse(px,py,1+rng()*5,1+rng()*4,rng()*6.28,0,Math.PI*2);x.fill();}
  }
  if(kind==='paper'){
    // Original ink wash: fractured mountains and absorbed brush marks, not text.
    for(let layer=0;layer<5;layer++){
      x.beginPath();x.moveTo(0,S);
      for(let j=0;j<=45;j++){const px=j*S/45,py=S*(.80+layer*.025)-Math.abs(Math.sin(j*.19+layer*.8)+Math.sin(j*.47)*.24)*S*(.14-layer*.019);x.lineTo(px,py);}
      x.lineTo(S,S);x.closePath();x.fillStyle=`rgba(59,78,62,${.08+layer*.025})`;x.fill();
    }
    x.strokeStyle='rgba(139,62,47,.34)';x.lineWidth=1.1;
    for(let px=S*.19;px<S*.94;px+=S*.165){x.beginPath();x.moveTo(px,S*.06);x.lineTo(px-2,S*.88);x.stroke();}
    // A few dry-brush impressions along an edge suggest a kept letter.
    for(let i=0;i<24;i++){
      const px=S*.10+rng()*S*.10,py=S*.13+i*S*.024;x.strokeStyle=`rgba(52,66,55,${.13+rng()*.15})`;x.lineWidth=1+rng()*5;
      x.beginPath();x.moveTo(px,py);x.quadraticCurveTo(px+12,py-6,px+6+rng()*15,py+12);x.stroke();
    }
  }
  if(kind==='graphite'){
    for(let i=0;i<110;i++){
      x.save();x.translate(rng()*S,rng()*S);x.rotate(rng()*6.28);x.fillStyle=i%3?'rgba(229,230,216,.085)':'rgba(10,22,18,.16)';x.beginPath();x.ellipse(0,0,7+rng()*67,1+rng()*10,0,0,6.28);x.fill();x.restore();
    }
  }
  if(kind==='bark')for(let i=0;i<90;i++){
    const px=rng()*S;x.strokeStyle=i%3?'rgba(28,31,21,.23)':'rgba(232,195,139,.2)';x.lineWidth=.4+rng()*2.2;
    x.beginPath();x.moveTo(px,0);x.bezierCurveTo(px-12,rng()*S,px+17,rng()*S,px+4,S);x.stroke();
  }
  if(kind==='water')for(let i=0;i<150;i++){
    const px=rng()*S,py=rng()*S;x.strokeStyle=i%4?'rgba(215,225,216,.18)':'rgba(33,61,66,.13)';x.lineWidth=.4+rng()*1.1;
    x.beginPath();x.moveTo(px-10,py);x.bezierCurveTo(px,py-4,px+12,py+2,px+23+rng()*24,py-2);x.stroke();
  }
  if(kind==='jade')for(let i=0;i<25;i++){
    const px=rng()*S,py=rng()*S;x.strokeStyle='rgba(218,222,189,.19)';x.lineWidth=.6;
    x.beginPath();x.moveTo(px,py);for(let j=1;j<6;j++)x.lineTo(px+j*10+rng()*5,py+j*7+rng()*13);x.stroke();
  }
  const map=new T.CanvasTexture(c);map.colorSpace=T.SRGBColorSpace;map.anisotropy=4;map.name='poem-original-'+kind;
  maps.set(kind,map);return map;
}
function tube(points,r,color,extra={}){
  const geo=new T.TubeGeometry(new T.CatmullRomCurve3(points.map(p=>p.isVector3?p:new T.Vector3(...p))),Math.max(16,points.length*2),r,5,false);
  return part(geo,color,[0,0,0],extra);
}
function frame(lat,lon,angle=0){return new T.Quaternion().setFromUnitVectors(Z,new T.Vector3(...fromLatLon(lat,lon))).multiply(new T.Quaternion().setFromAxisAngle(Z,angle));}
function surface(x,y,r=5.69){return new T.Vector3(x,y,R).normalize().multiplyScalar(r);}
function panelPoint(x,y,w,h,r,fold,seed){
  const u=x/(w*.5),v=y/(h*.5);
  const seams=Math.pow(Math.max(0,Math.cos(x*5.7+y*1.7+seed)),8)*.037;
  const wave=fold*(.5+.5*Math.sin(x*2.4+y*.7+Math.sin(y*2.3+seed)*1.2))*(.45+.55*Math.abs(u));
  const hem=.09*Math.abs(u)**12+.05*Math.abs(v)**16;
  return surface(x,y,r+wave+hem+seams);
}
function clothPanel(s,index){
  const [lat,lon,w,h,angle,kind,r,fold]=s,g=new T.Group();g.name=kind+'-draped-panel-'+index;g.quaternion.copy(frame(lat,lon,angle));
  const geometry=new T.PlaneGeometry(w,h,52,64),p=geometry.attributes.position;
  for(let i=0;i<p.count;i++){
    let x=p.getX(i),y=p.getY(i),u=x/(w*.5),v=y/(h*.5);
    x+=.024*Math.sin(y*38+index)*Math.abs(u)**16;y+=.020*Math.sin(x*40-index)*Math.abs(v)**16;
    p.setXYZ(i,...panelPoint(x,y,w,h,r,fold,index).toArray());
  }
  geometry.computeVertexNormals();
  const map=poemTexture(kind),material=new T.MeshStandardMaterial({map,bumpMap:map,bumpScale:kind==='silver'?.025:.013,roughness:kind==='silver'?.30:kind==='inkwash'?.95:.78,metalness:kind==='silver'?.48:kind==='inkwash'?0:.08,side:T.DoubleSide,color:kind==='silver'?'#fafbf3':'#f1f2e8'});
  const mesh=new T.Mesh(geometry,material);mesh.castShadow=mesh.receiveShadow=true;g.add(mesh);
  const hems=new T.Group();
  for(const sign of [-1,1]){
    const points=Array.from({length:57},(_,i)=>panelPoint(sign*w*.5,-h*.5+h*i/56,w,h,r,fold,index).multiplyScalar(1.001));
    hems.add(tube(points,.006,kind==='silver'?'#c5cdbd':'#adb8a6',{metalness:kind==='silver'?.74:.15,roughness:.45}));
    for(let j=0;j<15;j++){
      const yy=-h*.44+j*h*.062,base=panelPoint(sign*w*.497,yy,w,h,r,fold,index);
      hems.add(tube([base,base.clone().add(new T.Vector3(sign*.04,.02,.015)),base.clone().add(new T.Vector3(sign*.065,.04,-.015))],.0025,kind==='silver'?'#acb9ac':'#b5bca3',{roughness:.7}));
    }
  }
  g.add(mergeStatic(hems));return g;
}
const DRAPERY=[
    [-10,136,2.75,6.02,-.34,'silver',5.51,.21],
    [12,163,2.70,4.72,.36,'indigo',5.50,.12],
    [51,100,4.76,1.69,.11,'indigo',5.54,.13],
    [-40,-99,6.65,2.12,.27,'silver',5.52,.23],
    [8,-28,2.13,5.18,-.38,'silver',5.52,.20],
    [48,-98,4.18,2.04,-.21,'indigo',5.53,.14],
    [-10,-135,2.64,3.82,.40,'indigo',5.52,.15],
    [-54,94,4.75,1.73,.28,'silver',5.52,.22],
    [11,42,1.72,3.90,.23,'indigo',5.50,.11],
    [-53,4,3.76,2.32,.27,'indigo',5.52,.14],
    [22,103,2.18,2.70,-.32,'inkwash',5.61,.045],
    [12,-92,2.8,3.4,.27,'inkwash',5.61,.055],
    [-15,13,3.85,2.39,.19,'silver',5.52,.16],
];
const draperySupports=DRAPERY.map((s,index)=>({s,index,inverse:frame(s[0],s[1],s[4]).invert()}));
export function reliquarySurface(normal){
  let radius=0;
  for(const {s,index,inverse} of draperySupports){
    const n=normal.clone().applyQuaternion(inverse);
    if(n.z<.66)continue;
    const x=n.x/n.z*R,y=n.y/n.z*R,w=s[2],h=s[3];
    if(Math.abs(x)<w*.49&&Math.abs(y)<h*.49)radius=Math.max(radius,panelPoint(x,y,w,h,s[6],s[7],index).length()+.014);
  }
  return radius;
}
function drapery(){
  const g=new T.Group();g.name='continuous-silver-and-indigo-wrap';
  DRAPERY.forEach((s,i)=>g.add(clothPanel(s,i)));g.userData={physicalDrapes:DRAPERY.length,wrappedHemisphereCount:6};return g;
}
function moonAndStudy(){
  const g=new T.Group();g.name='verso-moon-and-study-window';g.quaternion.copy(frame(26,-71,-.14));
  // Moonstone held in a slender, imperfect pewter setting.
  const diskGeo=new T.CircleGeometry(.83,96),dp=diskGeo.attributes.position;
  for(let i=0;i<dp.count;i++){const x=dp.getX(i),y=dp.getY(i);dp.setXYZ(i,...surface(x-.32,y+.09,5.90+.06*(1-Math.min(1,(x*x+y*y)/.69))).toArray());}diskGeo.computeVertexNormals();
  const moonMap=poemTexture('jade'),moon=new T.Mesh(diskGeo,new T.MeshPhysicalMaterial({color:'#f3f0d5',map:poemTexture('paper'),emissive:'#d7d5b9',emissiveIntensity:.16,roughness:.47,metalness:.04,clearcoat:.64,clearcoatRoughness:.34,side:T.DoubleSide}));moon.castShadow=moon.receiveShadow=true;g.add(moon);
  for(const [radius,arc] of [[.857,5.68],[.891,3.67]]){
    const pts=Array.from({length:91},(_,i)=>{const a=.18+i/90*arc;return surface(Math.cos(a)*radius-.32,Math.sin(a)*radius+.09,5.92);});
    g.add(tube(pts,.014,'#9aa890',{roughness:.29,metalness:.69}));
  }
  // An actual open lattice lies over the edge; its holes reveal the material below.
  const woodMap=poemTexture('bark'),lattice=new T.Group();
  const line=(x1,y1,x2,y2,width=.017)=>{
    const pts=Array.from({length:16},(_,i)=>surface(x1+(x2-x1)*i/15,y1+(y2-y1)*i/15,6.015));
    lattice.add(tube(pts,width,'#d6c6a6',{map:woodMap,roughness:.72}));
  };
  for(const x of [.45,1.66])line(x,-1.15,x,1.34,.026);
  for(const y of [-1.15,1.34])line(.45,y,1.66,y,.026);
  for(const y of [-.73,-.04,.65]){
    line(.45,y,1.66,y,.019);
    line(.75,y,.75,y+.36);line(1.37,y,1.37,y+.36);
    line(.75,y+.36,1.37,y+.36);line(1.06,y+.36,1.06,y+.66);
  }
  g.add(mergeStatic(lattice));
  // A tied paper corner catches a trace of cinnabar; nothing is written on it.
  const tagGeo=new T.PlaneGeometry(.34,.56,6,10),tp=tagGeo.attributes.position;
  for(let i=0;i<tp.count;i++)tp.setXYZ(i,...surface(tp.getX(i)+1.48,tp.getY(i)-.86,6.055).toArray());tagGeo.computeVertexNormals();
  const tag=part(tagGeo,'#eee4cc',[0,0,0],{map:poemTexture('paper'),side:T.DoubleSide,roughness:.93});g.add(tag);
  g.add(tube([surface(1.42,-.44,6.06),surface(1.52,-.69,6.095),surface(1.58,-.93,6.07)],.009,'#a9513c',{roughness:.9}));
  g.userData.motifs=['moon','study window','unspoken letter'];return g;
}
function fernMargins(){
  const g=new T.Group();g.name='stitched-botanical-margins';const rng=seededRandom(16029);
  const models=[makeFern(1.55,0),makeFern(1.32,1),makeFlowerCluster(1.14,2),makeReeds(1.1,1)];
  // Irregular clusters along material junctions, not an evenly planted lawn.
  const seams=[[-21,136,34,140],[-47,108,-37,64],[44,-129,9,-144],[-38,-58,-1,-39],[51,-84,44,-40],[-8,174,-43,153],[18,12,-15,-2],[45,112,47,68],[-36,78,-48,69],[-19,-86,-32,-104]];
  for(const [k,[a,b,c,d]] of seams.entries()){
    for(let j=0;j<15;j++){
      const t=j/14,lat=a+(c-a)*t+(rng()-.5)*6,lon=b+(d-b)*t+(rng()-.5)*6,n=new T.Vector3(...fromLatLon(lat,lon));
      const plant=models[(k+j)%models.length].clone();plant.position.copy(n).multiplyScalar(5.66);plant.quaternion.setFromUnitVectors(UP,n);plant.rotateY(j*2.4);plant.scale.multiplyScalar(.67+rng()*.58);g.add(plant);
      if(j%2===0){
        const cushion=ball(.13+rng()*.12,'#798555',[0,0,0],[1.5,.24,1.05]);cushion.material=mossMaterial();cushion.position.copy(n).multiplyScalar(5.65);cushion.quaternion.setFromUnitVectors(UP,n);g.add(cushion);
      }
    }
  }
  return mergeStatic(g);
}
function specimenStitches(){
  const g=new T.Group();g.name='silk-thread-and-pressed-petals';const rng=seededRandom(16143);
  for(const [index,[lat,lon,w,angle]] of [[47,110,3.12,-.28],[-46,-98,4.7,.28],[20,-137,2.2,-.36],[2,143,2.8,.4],[-42,57,2.0,.2]].entries()){
    const s=new T.Group();s.quaternion.copy(frame(lat,lon,angle));
    for(let line=0;line<14;line++){
      const yy=(line-7)*.035,pts=Array.from({length:51},(_,i)=>{const x=-w/2+i*w/50;return surface(x,yy+.06*Math.sin(x*5+line*.2),5.83+.015*Math.sin(x*7+line));});
      const thread=tube(pts,.003,line%3?'#c9cec1':'#a9bcbb',{metalness:.28,roughness:.48});thread.castShadow=false;s.add(thread);
    }
    for(let bead=0;bead<11;bead++){
      const px=-w*.44+bead*w*.088,py=Math.sin(bead*2.4+index)*.19,p=surface(px,py,5.86);
      s.add(ball(.025+bead%3*.005,['#cdd4be','#b7a7bc','#9ab3b4'][bead%3],p.toArray(),[1,.84,.6]));
    }
    g.add(mergeStatic(s));
  }
  // Small caught petals use one merged mesh each colour, including the rear.
  const petals=new T.Group();
  for(let i=0;i<150;i++){
    const lat=-65+rng()*120,lon=-180+rng()*360,n=new T.Vector3(...fromLatLon(lat,lon));
    // The long flute retains a clear front corridor.
    if(n.z>.82&&n.x>-.27&&n.x<.3&&n.y>-.25&&n.y<.62)continue;
    const p=ball(.025+rng()*.015,i%3?'#d5a7a8':'#e7c9b3',[0,0,0],[.63,.12,1.28]);p.position.copy(n).multiplyScalar(5.81);p.quaternion.setFromUnitVectors(UP,n);p.rotateY(i*2.4);petals.add(p);
  }
  g.add(mergeStatic(petals));return g;
}
function mandarinDuck(size,lat,lon,angle){
  const g=new T.Group();g.name='paired-mandarin-duck';
  g.add(ball(.18,'#756249',[0,.08,0],[.82,.69,1.32]),ball(.105,'#344b3e',[0,.205,-.14],[.91,1,1]));
  g.add(ball(.079,'#e5d8b3',[0,.192,-.212],[.87,.80,.25]),ball(.054,'#a6422b',[0,.155,-.254],[.8,.48,1.2]));
  for(const side of [-1,1]){
    g.add(ball(.014,'#17291e',[side*.079,.229,-.20]),ball(.007,'#ede8d4',[side*.087,.233,-.205]));
    const sail=part(new T.SphereGeometry(.118,18,12),'#b96134',[side*.12,.168,.076],{roughness:.69});sail.scale.set(.2,1,.84);sail.rotation.z=-side*.36;g.add(sail);
    g.add(ball(.109,'#d6caaa',[side*.112,.091,-.005],[.29,.50,1.31]));
    for(let stripe=0;stripe<4;stripe++)g.add(tube([[side*.127,.145-stripe*.015,-.06],[side*.143,.148-stripe*.014,.00],[side*.134,.135-stripe*.013,.061]],.004,'#374139'));
  }
  const n=new T.Vector3(...fromLatLon(lat,lon));g.position.copy(n).multiplyScalar(5.455);g.quaternion.setFromUnitVectors(UP,n);g.rotateY(angle);g.scale.setScalar(size);
  return mergeStatic(g);
}
function riverMarginalia(){
  const g=new T.Group();g.name='river-pebbles-and-paired-ducks';const rng=seededRandom(160613);
  g.add(mandarinDuck(1.03,-28,108,-.8),mandarinDuck(.88,-40,111,.75));
  // Low islands break the glassy pool without closing its open path.
  for(const [lat,lon,scale] of [[-20,109,.26],[-37,103,.18],[-51,111,.23],[-18,-90,.23],[-17,-110,.21]]){
    const n=new T.Vector3(...fromLatLon(lat,lon)),stone=new T.Mesh(new T.IcosahedronGeometry(scale,2),texturedStoneMaterial());stone.position.copy(n).multiplyScalar(5.43);stone.quaternion.setFromUnitVectors(UP,n);stone.scale.set(1.32,.48,.89);stone.castShadow=stone.receiveShadow=true;g.add(stone);
    const u=new T.Vector3().crossVectors(n,UP).normalize(),v=new T.Vector3().crossVectors(n,u).normalize();
    for(let ring=0;ring<3;ring++){
      const points=Array.from({length:51},(_,i)=>{const a=.32+i/50*5.2,rr=scale*(1.25+ring*.4);return n.clone().multiplyScalar(5.438).addScaledVector(u,Math.cos(a)*rr).addScaledVector(v,Math.sin(a)*rr*.63).normalize().multiplyScalar(5.44);});
      const line=tube(points,.0028,'#d2d7c4',{roughness:.55,transparent:true,opacity:.62,depthWrite:false});line.castShadow=false;g.add(line);
    }
  }
  return g;
}
export function makePoemReliquary(){
  const root=new T.Group();root.name='poem-reliquary-0160';
  root.add(drapery(),moonAndStudy(),fernMargins(),specimenStitches(),riverMarginalia());
  root.userData={edition:'0.16.0',motifs:['folded silver textile','embroidered indigo silk','moonstone and open study lattice','stitched botanical margins','paired mandarin ducks','continuous river'],reference:'User supplied sage-green assemblage; original geometry and material drawings',rear:'Authored interpretation of the remembered river, moon and study, not a reconstruction from unseen reference pixels'};
  return root;
}
