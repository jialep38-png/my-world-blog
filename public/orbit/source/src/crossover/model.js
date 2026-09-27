/** 删了一百遍 — paper/foil assemblage based on the supplied visual reference.
 * Tangible geometry: wrapped print sheets, raised sleeve and record, thick
 * cable loops and floating type tiles. No terrain, trees or reused garden models.
 */
import * as T from 'three';
import { seededRandom } from '../math.js';
import { makePressTextures } from './textures.js';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';
import {exposureTexture,emulsionPaper} from '../song-surfaces.js';
const Z=new T.Vector3(0,0,1),Y=new T.Vector3(0,1,0),R=3.02;

export function makeCrossover({glyphs={}}={}){
  const root=new T.Group();root.name='DELETED-A-HUNDRED-TIMES';
  const groups={},materials={},layers=[],random=seededRandom(220916),maps=makePressTextures(glyphs);
  const group=name=>{const g=new T.Group();g.name=name;groups[name]=g;root.add(g);return g;};
  const metallic=new T.MeshPhysicalMaterial({color:'#d7d7de',map:maps.foil,normalMap:maps.foilNormal,normalScale:new T.Vector2(.85,.85),roughnessMap:maps.foilRough,metalness:.94,roughness:.41,clearcoat:.16,clearcoatRoughness:.34,side:T.DoubleSide});
  const ink=new T.MeshPhysicalMaterial({color:'#111115',roughness:.30,metalness:.13,clearcoat:.36,clearcoatRoughness:.38});
  const paperEdge=new T.MeshStandardMaterial({color:'#e3e2dc',roughness:.97,side:T.DoubleSide});
  const paper=(kind,color='#ffffff')=>{
    const key=kind+color;if(materials[key])return materials[key];
    return materials[key]=new T.MeshStandardMaterial({color,map:maps[kind],roughness:.94,side:T.DoubleSide,bumpMap:maps.foilHeight,bumpScale:.003});
  };
  const mesh=(geo,mat,pos=[0,0,0])=>{const m=new T.Mesh(geo,mat);m.position.set(...pos);m.castShadow=true;m.receiveShadow=true;return m;};
  const core=group('01 / CRUMPLED SILVER');
  const sphere=new T.SphereGeometry(R,112,80),p=sphere.attributes.position;
  for(let i=0;i<p.count;i++){
    const n=new T.Vector3().fromBufferAttribute(p,i).normalize();
    const f=.040*Math.sin(n.x*18+n.y*9)*Math.cos(n.z*16-n.x*12)+.022*Math.sin(n.y*41+n.z*37)+.020*Math.abs(Math.sin(n.x*61+n.y*43));
    p.setXYZ(i,...n.multiplyScalar(R+f).toArray());
  }sphere.computeVertexNormals();core.add(mesh(sphere,metallic));
  // Matte broken print overlays avoid the look of an undecorated chrome ball.
  const surfaces=group('02 / WRAPPED PRINT');
  function patch(w,h,radius,seed,mat){
    const random=seededRandom(seed),geo=new T.PlaneGeometry(w,h,28,32),position=geo.attributes.position;
    const edgeL=Array.from({length:33},()=>random()*.13),edgeR=Array.from({length:33},()=>random()*.15);
    for(let i=0;i<position.count;i++){
      const row=Math.floor(i/29),col=i%29;let x=position.getX(i),y=position.getY(i);
      if(col<2)x+=edgeL[row]*(1-col/2);if(col>26)x-=edgeR[row]*(col-26)/2;
      if(row<2)y-=random()*.10*(1-row/2);if(row>30)y+=random()*.11*(row-30)/2;
      const edge=Math.pow(Math.max(Math.abs(x)/(w/2),Math.abs(y)/(h/2)),8);
      const n=new T.Vector3(x,y,R).normalize(),curl=.016*Math.sin(y*6+seed)*Math.sin(x*5)+edge*.045*Math.sin(y*8+x*9+seed);
      position.setXYZ(i,...n.multiplyScalar(radius+curl).toArray());
    }geo.computeVertexNormals();return mesh(geo,mat);
  }
  const specs=[
    [-.55,.74,.72,2.05,1.56,-.28,'wash'],[.18,.87,.64,2.28,1.44,.12,'fragments'],
    [.70,.52,.65,1.68,2.64,-.19,'news'],[-.82,.06,.65,1.80,2.32,-.35,'type'],
    [.79,-.24,.58,1.98,2.04,.3,'wash'],[-.42,-.72,.62,2.08,1.85,-.05,'news'],
    [.22,-.80,.53,2.16,1.98,.32,'diagram'],[-.34,.32,-.88,2.4,2.8,.4,'black'],
    [.55,.67,-.68,2.5,2.7,-.3,'news'],[-.76,-.49,-.47,2.2,2.4,-.2,'fragments'],
    [.72,-.59,-.43,2.65,2.6,.2,'type'],[.07,-.18,-1,2.4,2.2,-.2,'proof'],
  ];
  specs.forEach(([x,y,z,w,h,angle,kind],i)=>{
    const m=patch(w,h,R+.062+(i%3)*.023,811+i,paper(kind));m.quaternion.setFromUnitVectors(Z,new T.Vector3(x,y,z).normalize());m.rotateZ(angle);surfaces.add(m);layers.push(m);
  });
  // Ragged foil flakes protrude through the paper, instead of being a flat texture border.
  for(let i=0;i<104;i++){
    const y=1-2*(i+.5)/104,a=i*2.39996,n=new T.Vector3(Math.cos(a)*Math.sqrt(1-y*y),y,Math.sin(a)*Math.sqrt(1-y*y));
    const shard=patch(.18+random()*.47,.18+random()*.70,R+.10+random()*.075,940+i,i%5===0?paper('fragments'):metallic);
    shard.quaternion.setFromUnitVectors(Z,n);shard.rotateZ(random()*6.28);surfaces.add(shard);
  }
  // True crumpled foil facets catch moving highlights, with creases visible in profile.
  const facets=[],uv=[];
  for(let i=0;i<155;i++){
    const y=1-2*(i+.5)/155,a=i*2.39996,n=new T.Vector3(Math.cos(a)*Math.sqrt(1-y*y),y,Math.sin(a)*Math.sqrt(1-y*y)),q=new T.Quaternion().setFromUnitVectors(Z,n),w=.13+random()*.28,h=.13+random()*.30;
    const point=(x,y,z)=>new T.Vector3(x,y,R+.09+z).applyQuaternion(q);
    const corners=[[-w,-h,0],[w*.81,-h*.70,.035],[w,h*.7,0],[-w*.55,h,.02]],center=[w*.13,-h*.12,.09];
    for(let k=0;k<4;k++)for(const v of [center,corners[k],corners[(k+1)%4]]){facets.push(...point(...v).toArray());uv.push(v[0]/w*.35+.5,v[1]/h*.35+.5);}
  }
  const facetGeo=new T.BufferGeometry();facetGeo.setAttribute('position',new T.Float32BufferAttribute(facets,3));facetGeo.setAttribute('uv',new T.Float32BufferAttribute(uv,2));facetGeo.computeVertexNormals();core.add(mesh(facetGeo,metallic));

  const sleeve=group('03 / RECORD SLEEVE');
  function sheet(w,h,kind,z,x,y,angle,edge=true){
    const g=new T.Group();g.position.set(x,y,z);g.rotation.z=angle;
    const geo=new T.PlaneGeometry(w,h,20,20),a=geo.attributes.position;
    for(let i=0;i<a.count;i++){const xx=a.getX(i),yy=a.getY(i);a.setZ(i,-.065*(xx*xx+yy*yy)+.015*Math.sin(yy*4));}geo.computeVertexNormals();
    g.add(mesh(geo,paper(kind)));
    if(edge){
      const under=geo.clone();under.translate(0,0,-.028);g.add(mesh(under,paperEdge));
    }sleeve.add(g);layers.push(g);return g;
  }
  sheet(3.24,3.32,'wash',3.075,.08,.11,.13);
  sheet(2.94,3.06,'type',3.15,-.15,.10,.10);
  sheet(2.76,2.78,'black',3.22,-.09,-.04,.12);
  // Upper black broadside is a printed object, not oversized page UI painted over the globe.
  const broadside=mesh(new T.PlaneGeometry(1.54,1.05),paper('black'),[-.22,2.94,.76]);broadside.rotation.set(-.24,.1,.22);sleeve.add(broadside);
  // Projecting white sleeve strips retain their thickness and cast contact shadows.
  function strip(a,b,width,depth,color=paperEdge){
    const p=new T.Vector3(...a),q=new T.Vector3(...b),d=q.clone().sub(p);
    const m=mesh(new T.BoxGeometry(width,d.length(),depth),color);m.position.copy(p).add(q).multiplyScalar(.5);m.quaternion.setFromUnitVectors(Y,d.normalize());return m;
  }
  const border=group('04 / OPEN SLEEVE FRAME');
  const frame=new T.Group();frame.rotation.z=-.26;frame.position.set(.03,.04,2.48);
  frame.add(strip([-2.05,-2.57,0],[-2.05,2.60,0],.073,.022),strip([2.05,-2.57,0],[2.05,2.60,0],.073,.022),strip([-2.05,2.60,0],[2.05,2.60,0],.073,.022),strip([-.8,-2.57,0],[2.05,-2.57,0],.073,.022));border.add(frame);

  const record=group('05 / TYPE RECORD');record.position.set(.15,-.24,3.33);record.rotation.z=.025;
  const disc=mesh(new T.CylinderGeometry(1.075,1.075,.035,96),new T.MeshStandardMaterial({color:'#4b4651',roughness:.78}));disc.rotation.x=Math.PI/2;record.add(disc);
  const label=mesh(new T.CircleGeometry(1.07,96),new T.MeshStandardMaterial({map:maps.disc,roughness:.86}),[0,0,.025]);record.add(label);
  for(const [radius,width,color] of [[1.086,.012,'#b9b7be'],[.99,.006,'#74717b']])record.add(mesh(new T.TorusGeometry(radius,width,6,96),new T.MeshStandardMaterial({color,roughness:.78}),[0,0,.04]));
  // Interrupted white circular stroke, similar to a printed sleeve mark.
  const stroke=mesh(new T.TorusGeometry(1.12,.042,8,90,Math.PI*1.52),paperEdge,[-.035,.027,.056]);stroke.rotation.z=-.63;record.add(stroke);
  const graphicSlivers=group('06 / TYPE FRAGMENTS');
  for(const [i,info] of [[-.90,1.11,.56,1.06,.04],[.60,1.26,.46,.73,-.04],[-1.10,-.47,.29,.84,.10],[1.05,.36,.25,.65,.12]].entries()){
    const [x,y,w,h,a]=info,m=mesh(new T.PlaneGeometry(w,h),paper(['type','wash','fragments','diagram'][i]),[x,y,3.45]);m.rotation.z=a;graphicSlivers.add(m);
  }
  // Physical correction slips lift at one end and reveal the darker previous proof.
  // Each is fixed to the existing sleeve; these are not disconnected ornaments.
  function liftedProof(w,h,x,y,z,angle,lift){
    const g=new T.Group();g.name='lifted-correction-proof';g.position.set(x,y,z);g.rotation.z=angle;
    const geo=new T.PlaneGeometry(w,h,32,8),p=geo.attributes.position;
    for(let i=0;i<p.count;i++){
      const xx=p.getX(i),yy=p.getY(i),u=(xx+w/2)/w;
      p.setXYZ(i,xx,yy+.012*Math.sin(xx*29+yy*17),-.05*xx*xx+lift*Math.pow(u,4)+.012*Math.sin(xx*8));
    }
    geo.computeVertexNormals();const underside=geo.clone();underside.translate(0,0,-.018);
    g.add(mesh(underside,paper('black')),mesh(geo,paper('proof')));
    const pin=mesh(new T.BoxGeometry(.18,.12,.012),paper('wash'),[-w*.38,0,.016]);g.add(pin);graphicSlivers.add(g);
  }
  liftedProof(2.20,.40,-.15,-1.20,3.45,-.10,.42);
  liftedProof(1.85,.26,-.51,1.38,3.21,.17,.28);
  liftedProof(.43,1.78,-1.49,-.10,3.22,-.15,.18);

  const accents=group('07 / SMALL COLOUR SIGNALS');
  const blue=new T.MeshPhysicalMaterial({color:'#9cadd0',map:maps.blue,roughness:.53,metalness:.07,transparent:true,opacity:.88,depthWrite:false,side:T.DoubleSide});
  const rose=new T.MeshStandardMaterial({color:'#db7391',roughness:.83});
  const blueTape=mesh(new T.BoxGeometry(1.09,.50,.012),blue,[.05,2.12,2.60]);blueTape.rotation.set(-.2,.05,-.27);accents.add(blueTape);
  for(let i=0;i<3;i++){const seam=strip([-.39+i*.29,1.94,2.625],[-.38+i*.29,2.12,2.625],.004,.004,paperEdge);seam.rotation.z=-.27;accents.add(seam);}
  const pinkUnder=mesh(new T.PlaneGeometry(.53,.9),new T.MeshStandardMaterial({color:'#cd8890',transparent:true,opacity:.66,side:T.DoubleSide}),[-1.40,1.66,2.72]);pinkUnder.rotation.z=-.42;accents.add(pinkUnder);
  const crimson=mesh(new T.BoxGeometry(.42,1.07,.018),new T.MeshStandardMaterial({color:'#693441',roughness:.95}),[-.79,-2.59,1.63]);crimson.rotation.set(.3,-.3,.46);accents.add(crimson);

  const orbits=group('08 / BLACK CABLE ORBITS');
  const chipMaterials=['#aea68b','#98704e','#874754','#cecac0'].map(color=>new T.MeshBasicMaterial({color}));
  const paths=[
    [[-4.08,1.29,.12],[-3.56,1.90,.80],[-1.9,1.50,2.95],[0,1.00,3.63],[2.30,.93,2.89],[4.00,.39,1.38],[4.42,-.19,.2],[3.04,-.64,-1.5],[.4,-.53,-3.18],[-2.38,.07,-2.4]],
    [[-3.51,-2.73,1.22],[-2.48,-2.13,2.76],[0,-1.49,3.54],[2.78,-.82,2.85],[4.33,.18,1.26],[4.24,1.14,-.51],[1.34,1.82,-3.16],[-2.43,.25,-2.46],[-4.1,-1.98,-.35]],
  ];
  paths.forEach((pts,idx)=>{
    const curve=new T.CatmullRomCurve3(pts.map(p=>new T.Vector3(...p)),true,'catmullrom',.45);
    const wire=mesh(new T.TubeGeometry(curve,300,.029+idx*.006,10,true),ink);orbits.add(wire);
    for(let i=0;i<210;i++){
      const t=random(),p=curve.getPointAt(t),tan=curve.getTangentAt(t),side=new T.Vector3().crossVectors(tan,Z).normalize(),az=random()*Math.PI*2;
      p.addScaledVector(side,Math.cos(az)*.036).addScaledVector(Z,Math.sin(az)*.034);
      const chip=mesh(new T.BoxGeometry(.009,.008,.006),chipMaterials[i%4]);chip.position.copy(p);chip.rotation.set(random()*3,random()*3,random()*3);orbits.add(chip);
    }
  });
  const hardware=group('09 / BLACK BAR & PINK CLIP');
  const bar=new T.Group(),barmat=new T.MeshPhysicalMaterial({color:'#111115',metalness:.38,roughness:.29,clearcoat:.6});
  bar.add(mesh(new T.CylinderGeometry(.126,.146,1.93,18),barmat));
  for(const y of [-.83,-.70,.73,.83])bar.add(mesh(new T.CylinderGeometry(.151,.151,.035,18),ink,[0,y,0]));
  for(let i=0;i<25;i++){
    const p=[(random()-.5)*.21,(random()-.5)*1.75,.139];bar.add(mesh(new T.SphereGeometry(.008+random()*.006,5,4),paperEdge,p));
  }
  bar.rotation.set(0,0,-1.04);bar.position.set(2.49,1.65,2.35);hardware.add(bar);
  const clip=new T.Group();clip.position.set(1.86,1.26,3.08);clip.rotation.z=.15;
  clip.add(mesh(new T.BoxGeometry(.36,.79,.055),new T.MeshStandardMaterial({color:'#3a2633',roughness:.52})),mesh(new T.BoxGeometry(.27,.65,.06),rose,[0,0,.025]));
  for(const y of [-.27,.27])clip.add(mesh(new T.BoxGeometry(.035,.015,.006),paperEdge,[-.08,y,.060]));hardware.add(clip);
  const plug=new T.Group();plug.add(mesh(new T.CylinderGeometry(.078,.097,.55,12),ink));plug.add(mesh(new T.CylinderGeometry(.062,.065,.14,12),new T.MeshStandardMaterial({color:'#a99959',metalness:.8,roughness:.28}),[0,.34,0]));plug.rotation.set(.1,0,.35);plug.position.set(-2.54,-3.04,1.95);hardware.add(plug);
  const tail=new T.CatmullRomCurve3([[-3.51,-2.73,1.22],[-3.12,-2.56,1.68],[-2.83,-2.68,1.86],[-2.57,-2.80,1.94]].map(p=>new T.Vector3(...p)));
  hardware.add(mesh(new T.TubeGeometry(tail,32,.031,8,false),ink));

  const ribbons=group('10 / FOLDED PAPER RIBBONS');
  function ribbon(points,width,mat){
    const path=new T.CatmullRomCurve3(points.map(p=>new T.Vector3(...p))),verts=[],uvs=[];
    for(let i=0;i<42;i++)for(const [u,side] of [[i/42,-1],[i/42,1],[(i+1)/42,1],[i/42,-1],[(i+1)/42,1],[(i+1)/42,-1]]){
      const p=path.getPoint(u),t=path.getTangent(u),s=new T.Vector3().crossVectors(t,Z).normalize().multiplyScalar(side*width/2);p.add(s);verts.push(...p.toArray());uvs.push((side+1)/2,u);
    }
    const geo=new T.BufferGeometry();geo.setAttribute('position',new T.Float32BufferAttribute(verts,3));geo.setAttribute('uv',new T.Float32BufferAttribute(uvs,2));geo.computeVertexNormals();return mesh(geo,mat);
  }
  for(let i=0;i<5;i++)ribbons.add(ribbon([[-4.17,-.83-i*.20,.18],[-2.6,-.82-i*.24,1.08],[-1.78,-1.15-i*.28,2.55],[-.86,-2.37-i*.12,2.0]],.13+i*.018,i%2?paper('news'):metallic));
  ribbons.add(ribbon([[-3.60,3.73,-1.2],[-1.85,2.75,-1.38],[.0,2.06,-1.61],[3.63,1.09,-.82]],.075,paperEdge));

  const tiles=group('11 / FLOATING LETTERS');
  const tileInfo=[[-3.27,2.36,.9,-.60,0],[-1.77,3.63,.28,.11,1],[.38,3.99,-.1,.70,2],[2.12,3.03,.23,-.35,3],[3.89,.64,.95,-.32,4],[-.47,3.21,1.29,-.2,5],[2.83,-2.70,.11,.44,6]];
  tileInfo.forEach(([x,y,z,a,id],i)=>{
    const t=new T.Group();t.name='Letter_'+id;t.position.set(x,y,z);t.rotation.set(.08*(i-2),-.1*(i-3),a);
    t.add(mesh(new T.BoxGeometry(.58,.65,.045),paperEdge));
    const map=maps.letters.clone();map.needsUpdate=true;map.repeat.set(.25,.25);map.offset.set((id%4)*.25,1-(Math.floor(id/4)+1)*.25);
    const face=new T.MeshStandardMaterial({map,roughness:.93});t.add(mesh(new T.PlaneGeometry(.565,.636),face,[0,0,.024]));
    const back=mesh(new T.PlaneGeometry(.565,.636),face,[0,0,-.024]);back.rotation.y=Math.PI;t.add(back);tiles.add(t);
  });
  // v0.12.3 / one exposure, returned to four times. The same room loses its
  // red and blue with each development; the final print keeps an empty margin.
  const exposures=[
    {p:[1.25,1.98,2.93],w:.76,h:.91,a:-.15,c:1.0},
    {p:[1.61,1.68,3.02],w:.79,h:.94,a:.025,c:.55},
    {p:[1.94,1.41,3.13],w:.77,h:.92,a:.15,c:.13},
    {p:[-.23,-1.32,3.57],w:1.39,h:.73,a:-.12,c:0,crop:.5}
  ];
  exposures.forEach(({p,w,h,a,c,crop},i)=>{
    const photo=emulsionPaper(w,h,exposureTexture({chroma:c,crop:crop||0}),{curl:.10+i*.035});
    photo.position.set(...p);photo.rotation.set(i===3?-.12:.10,-.12,a);graphicSlivers.add(photo);
    // A dark previous image is still visible along each lifted paper edge.
    const old=mesh(new T.PlaneGeometry(w*.97,h*.96),paper('black'),[p[0]-.047,p[1]+.035,p[2]-.055]);old.rotation.copy(photo.rotation);graphicSlivers.add(old);
  });
  graphicSlivers.userData.songGesture={edition:'0.12.3',exposureCount:4,chroma:[1,.55,.13,0],gesture:'delete, withdraw, expose the previous print'};
  // Crop registration encloses only three corners. Regret occupies the fourth.
  for(const [x,y,sx,sy] of [[-.92,-.99,1,-1],[.57,-.98,-1,-1],[-.93,-1.72,1,1]]){
    graphicSlivers.add(strip([x+sx*.17,y,3.72],[x,y,3.72],.008,.007,ink),strip([x,y,3.72],[x,y+sy*.12,3.72],.008,.007,ink));
  }
  const revisit=new T.CatmullRomCurve3([[-1.34,-1.57,3.42],[-1.58,-1.81,3.50],[-.80,-1.96,3.63],[.43,-1.78,3.71],[.57,-1.58,3.68]].map(p=>new T.Vector3(...p)));
  graphicSlivers.add(mesh(new T.TubeGeometry(revisit,80,.008,5,false),ink));

  // Batch within each of the eleven authored layers; retains distinct material
  // and contact-shadow boundaries while avoiding hundreds of chip draw calls.
  root.updateMatrixWorld(true);
  for(const g of Object.values(groups)){
    const inverse=g.matrixWorld.clone().invert(),buckets=new Map();
    g.traverse(o=>{
      if(!o.isMesh)return;const key=o.material.uuid,geo=o.geometry.clone();
      geo.applyMatrix4(inverse.clone().multiply(o.matrixWorld));
      if(!geo.index)geo.setIndex(Array.from({length:geo.attributes.position.count},(_,i)=>i));
      if(!geo.attributes.uv)geo.setAttribute('uv',new T.Float32BufferAttribute(new Float32Array(geo.attributes.position.count*2),2));
      if(!buckets.has(key))buckets.set(key,{material:o.material,geometries:[]});buckets.get(key).geometries.push(geo);
    });
    g.clear();
    for(const {material,geometries} of buckets.values()){
      const joined=mergeGeometries(geometries,false);geometries.forEach(g=>g.dispose());
      if(!joined)throw new Error('Collage layer could not be batched');g.add(mesh(joined,material));
    }
  }
  // Animate a reversible separation for inspecting the real volume, not a fake backdrop.
  const separated=[surfaces,sleeve,border,record,graphicSlivers,accents,orbits,hardware,ribbons,tiles].map((g,i)=>({g,position:g.position.clone(),axis:new T.Vector3((i%3-1)*.15,0,.10+i*.04)}));
  root.userData.title='删了一百遍';root.userData.reference='User-provided monochrome foil and printed type collage. Original artwork, no performer credits or photograph mapped onto geometry.';
  root.userData.layers=Object.keys(groups).length;
  root.userData.sceneVersion='0.12.3';root.userData.structure='Repeated photographic exposure, chromatic loss, incomplete crop registration and a returned proof, joined to the original wrapped silver core.';
  return {root,groups,textures:maps,setSeparated(value){const amount=typeof value==='number'?T.MathUtils.clamp(value,0,1):Number(Boolean(value));for(const {g,position,axis} of separated)g.position.copy(position).addScaledVector(axis,amount);},dispose(){const gs=new Set(),ms=new Set(),ts=new Set(Object.values(maps));root.traverse(o=>{if(o.geometry)gs.add(o.geometry);for(const m of (Array.isArray(o.material)?o.material:o.material?[o.material]:[])){ms.add(m);for(const v of Object.values(m))if(v?.isTexture)ts.add(v);}});gs.forEach(g=>g.dispose());ms.forEach(m=>m.dispose());ts.forEach(t=>t.dispose());}};
}
