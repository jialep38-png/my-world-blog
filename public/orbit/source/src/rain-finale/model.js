/** 雨终曲 / RAIN FINALE — an independently authored material assemblage.
 * Folded graphite, cut cobalt glass, open-weave ribbons, tangled filaments,
 * silver chains and a torn printed label. The old worlds are not imported.
 */
import * as T from 'three';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';
import { seededRandom } from '../math.js';
import { makeRainTextures } from './textures.js';
import {exposureTexture,emulsionPaper} from '../song-surfaces.js';

const Z=new T.Vector3(0,0,1),Y=new T.Vector3(0,1,0),R=2.63;
const V=a=>new T.Vector3(...a);

export function makeRainFinale({glyphs={}}={}) {
  const root=new T.Group();root.name='RAIN-FINALE';
  const random=seededRandom(917003),maps=makeRainTextures(glyphs),groups={};
  const group=name=>{const g=new T.Group();g.name=name;groups[name]=g;root.add(g);return g;};
  const material=(color,metalness,roughness,extra={})=>new T.MeshPhysicalMaterial({color,metalness,roughness,side:T.DoubleSide,...extra});
  const graphite=material('#101119',.87,.35,{map:maps.silver,normalMap:maps.normal,normalScale:new T.Vector2(.62,.62),roughnessMap:maps.rough,clearcoat:.42,clearcoatRoughness:.2});
  const silver=material('#aeb4c7',.96,.31,{map:maps.silver,normalMap:maps.normal,normalScale:new T.Vector2(.48,.48),roughnessMap:maps.rough});
  const foilBlue=material('#10215b',.86,.26,{normalMap:maps.normal,normalScale:new T.Vector2(.33,.33),clearcoat:.8});
  const cobalt=material('#314873',.70,.19,{normalMap:maps.normal,normalScale:new T.Vector2(.13,.13),clearcoat:1,clearcoatRoughness:.15,iridescence:.48,iridescenceIOR:1.4,iridescenceThicknessRange:[100,230],emissive:'#073681',emissiveIntensity:.13});
  const glass=material('#92acdd',.2,.15,{transparent:true,opacity:.56,depthWrite:false,clearcoat:1,iridescence:.48});
  const pearl=material('#9eaec9',.63,.23,{clearcoat:1});
  const fineSilver=material('#98a1b9',.92,.24);
  const wireDark=material('#292e46',.85,.31);
  const turquoise=material('#17535c',.62,.34,{emissive:'#09393d',emissiveIntensity:.18});
  const wireIce=material('#6678aa',.65,.4,{emissive:'#123359',emissiveIntensity:.35});
  const paper=new T.MeshStandardMaterial({color:'#b8b6c4',map:maps.label,roughness:.96,side:T.DoubleSide});
  const blackPrint=new T.MeshStandardMaterial({map:maps.blackPrint,roughness:.79,side:T.DoubleSide});
  const paperEdge=new T.MeshStandardMaterial({color:'#c4c2cc',roughness:1,side:T.DoubleSide});
  const fabric=material('#999eb1',.27,.79,{map:maps.gauze,alphaTest:.18,alphaToCoverage:true});
  const lightMats=['#1763ff','#39afff','#cbdfff'].map(color=>material('#b6d2ff',.15,.23,{emissive:color,emissiveIntensity:3.4}));
  function mesh(geo,mat,pos=[0,0,0]){const m=new T.Mesh(geo,mat);m.position.set(...pos);m.castShadow=true;m.receiveShadow=true;return m;}
  function aim(m,n,angle=0){m.quaternion.setFromUnitVectors(Z,n);m.rotateZ(angle);return m;}
  function tube(points,width,mat,segments=80,closed=false){
    const curve=points instanceof T.Curve?points:new T.CatmullRomCurve3(points.map(V),closed,'catmullrom',.48);
    return mesh(new T.TubeGeometry(curve,segments,width,5,closed),mat);
  }
  function direction(i,n){const y=1-2*(i+.5)/n,a=i*2.399963;return new T.Vector3(Math.cos(a)*Math.sqrt(1-y*y),y,Math.sin(a)*Math.sqrt(1-y*y));}

  const core=group('01 / FRACTURED GRAPHITE');
  const coreGeo=new T.IcosahedronGeometry(2.39,3),cp=coreGeo.attributes.position;
  for(let i=0;i<cp.count;i++){
    const n=new T.Vector3().fromBufferAttribute(cp,i).normalize();
    const radius=2.36+.10*Math.sin(n.x*17+n.y*9)*Math.cos(n.z*11)+.09*Math.sin(n.x*9-n.y*16+n.z*13);
    cp.setXYZ(i,...n.multiplyScalar(radius).toArray());
  }
  coreGeo.computeVertexNormals();core.add(mesh(coreGeo,graphite));
  function crumple(w,h,seed,radius) {
    const r=seededRandom(seed),g=new T.PlaneGeometry(w,h,15,19),p=g.attributes.position;
    const edgeL=Array.from({length:20},()=>r()*.13),edgeR=Array.from({length:20},()=>r()*.16);
    for(let i=0;i<p.count;i++){
      const row=Math.floor(i/16),col=i%16;let x=p.getX(i),y=p.getY(i);
      if(col<2)x+=edgeL[row]*(1-col/2);if(col>13)x-=edgeR[row]*(col-13)/2;
      if(row===0)y-=r()*.1;if(row===19)y+=r()*.12;
      const edge=Math.pow(Math.max(Math.abs(x)/(w/2),Math.abs(y)/(h/2)),6);
      const f=.045*Math.abs(Math.sin(x*9+y*6+seed))+.035*Math.abs(Math.sin(y*13-x*7))+.15*edge*Math.sin(y*5+x*7+seed);
      p.setXYZ(i,...new T.Vector3(x,y,R).normalize().multiplyScalar(radius+f).toArray());
    }
    g.computeVertexNormals();return g;
  }
  const flakes=group('02 / CRUMPLED BLACK AND SILVER FOIL');
  for(let i=0;i<126;i++){
    const n=direction(i,126),m=mesh(crumple(.34+random()*.83,.45+random()*1.06,301+i,R-.05+random()*.13),i%9===0?silver:i%4===0?foilBlue:graphite);
    aim(m,n,random()*6.28);flakes.add(m);
  }
  // Sharp folded polygons interrupt the outline; the planet is not a smooth sphere.
  function shard(w,h,seed) {
    const r=seededRandom(seed),corners=[[-w*.5,-h*.44,0],[w*.22,-h*.56,.025],[w*.52,-h*.09,-.018],[w*.29,h*.5,.016],[-w*.36,h*.39,-.025]];
    const points=[],uv=[],center=[w*.08,-h*.03,.028+r()*.055];
    for(let i=0;i<5;i++)for(const v of [corners[i],corners[(i+1)%5],center]){points.push(...v);uv.push(v[0]/w+.5,v[1]/h+.5);}
    const g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute(points,3));g.setAttribute('uv',new T.Float32BufferAttribute(uv,2));g.computeVertexNormals();return g;
  }
  const shards=group('03 / CUT COBALT AND MIRROR');
  for(let i=0;i<102;i++){
    const n=direction(i,102),isFront=n.z>.2;
    const m=mesh(shard(.12+random()*.28,.18+random()*.40,210+i),i%7===0?glass:i%5===0?silver:i%2?cobalt:graphite);
    aim(m,n,random()*6.28);m.rotateX((random()-.5)*.8);m.position.copy(n.multiplyScalar(R+.04+random()*.22));shards.add(m);
    if(isFront&&i%4===0){const tiny=m.clone();tiny.scale.multiplyScalar(.45);tiny.position.multiplyScalar(1.09);tiny.rotateZ(.8);shards.add(tiny);}
  }
  // Larger cobalt facets gather on the left, matching the asymmetric light mass.
  for(let i=0;i<46;i++){
    const x=-1.65+(random()-.5)*1.2,y=-.55+(random()-.5)*2.4,z=Math.sqrt(Math.max(.4,R*R-x*x-y*y));
    const n=new T.Vector3(x,y,z).normalize(),m=mesh(shard(.13+random()*.23,.21+random()*.32,660+i),i%7===0?silver:i%4===0?glass:cobalt);
    aim(m,n,random()*6.28);m.position.copy(n.multiplyScalar(R+.18+random()*.20));shards.add(m);
  }

  const label=group('04 / TORN TITLE AND RECORD');
  label.position.set(.50,-.17,2.73);label.rotation.set(.035,-.05,.19);label.scale.setScalar(.81);
  function tornSheet(w,h,seed){
    const r=seededRandom(seed),g=new T.PlaneGeometry(w,h,28,28),p=g.attributes.position;
    const left=Array.from({length:29},()=>r()*.13),right=Array.from({length:29},()=>r()*.16);
    for(let i=0;i<p.count;i++){
      const row=Math.floor(i/29),col=i%29;let x=p.getX(i),y=p.getY(i);
      if(col<2)x+=left[row]*(1-col/2);if(col>26)x-=right[row]*(col-26)/2;
      if(row===0)y-=r()*.1;if(row===28)y+=r()*.13;
      const edge=Math.pow(Math.max(Math.abs(x)/(w/2),Math.abs(y)/(h/2)),7);
      p.setXYZ(i,x,y,-.13*(x*x+y*y)+edge*(.03+.08*Math.sin(x*7+y*6))+.013*Math.sin(y*11));
    }
    g.computeVertexNormals();return g;
  }
  const backsheet=mesh(tornSheet(2.38,2.58,611),blackPrint,[-.03,.02,-.04]);backsheet.rotation.z=-.16;label.add(backsheet);
  const border=mesh(tornSheet(2.19,2.37,612),paperEdge,[-.015,.006,.026]);border.rotation.z=.035;label.add(border);
  const sleeve=mesh(tornSheet(2.10,2.30,615),paper,[.005,0,.048]);label.add(sleeve);
  // The round piece is ragged, eccentric and thin, not a glossy target disc.
  const ringPoints=[],ringUV=[],r=seededRandom(34),count=128,rr=Array.from({length:count},()=>1.012+(r()-.5)*.032);
  for(let i=0;i<count;i++){
    const a=i/count*Math.PI*2,b=(i+1)/count*Math.PI*2;
    for(const [x,y] of [[0,0],[Math.cos(a)*rr[i],Math.sin(a)*rr[i]],[Math.cos(b)*rr[(i+1)%count],Math.sin(b)*rr[(i+1)%count]]]){
      ringPoints.push(x,y,-.085*(x*x+y*y));ringUV.push(x/2.13+.5,y/2.13+.5);
    }
  }
  const discGeo=new T.BufferGeometry();discGeo.setAttribute('position',new T.Float32BufferAttribute(ringPoints,3));discGeo.setAttribute('uv',new T.Float32BufferAttribute(ringUV,2));discGeo.computeVertexNormals();
  const disc=mesh(discGeo,paper,[.03,-.19,.13]);label.add(disc);
  const edgeArc=new T.CatmullRomCurve3(Array.from({length:70},(_,i)=>{const a=-.65+i/69*4.64;return new T.Vector3(.03+Math.cos(a)*1.025,-.19+Math.sin(a)*1.025,.064);}));
  label.add(tube(edgeArc,.007,silver,90));
  // Additional dark printed pieces wrap around the back, rather than repeating the front label.
  const print=group('05 / SUBMERGED PRINT FRAGMENTS');
  for(const [i,p] of [[[-1.6,1.6,1.2],.6,1.34,-.41],[[1.4,1.35,1.6],.64,1.3,.5],[[-1.0,-1.8,1.6],.64,1.1,-.4],[[.5,.4,-2.4],1.9,2.15,-.2],[[-1.5,-1.3,-1.5],1.2,1.6,.5]].entries()){
    const [xyz,w,h,a]=p,n=V(xyz).normalize(),m=mesh(crumple(w,h,835+i,R+.08),blackPrint);aim(m,n,a);print.add(m);
  }

  function drape(points,width,phase=0) {
    const path=new T.CatmullRomCurve3(points.map(V)),g=new T.PlaneGeometry(1,1,9,110),p=g.attributes.position,uv=g.attributes.uv;
    for(let row=0;row<=110;row++){
      const u=row/110,center=path.getPoint(u),t=path.getTangent(u),normal=center.clone().normalize();
      const side=new T.Vector3().crossVectors(t,normal).normalize().applyAxisAngle(t,.45*Math.sin(u*10+phase));
      for(let col=0;col<=9;col++){
        const across=col/9-.5,fray=1+.05*Math.sin(row*2.4+col*3),s=width*(.7+.3*Math.sin(u*5+phase))*fray;
        const q=center.clone().addScaledVector(side,across*s).addScaledVector(normal,.06*Math.cos(across*10+u*15+phase));
        p.setXYZ(row*10+col,...q.toArray());uv.setXY(row*10+col,col/9,u*5.7);
      }
    }
    g.computeVertexNormals();return mesh(g,fabric);
  }
  const cloth=group('06 / OPEN WEAVE SILVER GAUZE');
  const clothSpecs=[
    {p:[[-.8,2.5,1.2],[.5,2.4,1.7],[1.1,1.8,2.2],[1.6,1.5,2.43],[2.0,.6,2.15],[1.97,-.2,2.20],[2.72,-.9,1.04],[2.25,-1.45,1.83]],w:.92},
    {p:[[-2.72,.6,1.05],[-2.26,-.25,2.1],[-2.2,-1.12,1.95],[-1.15,-1.54,2.22],[-.7,-2.2,1.85],[.16,-2.5,1.18],[1.1,-2.14,1.77],[1.8,-2.03,1.6]],w:.62},
    {p:[[2.45,1.36,-.4],[2.92,.41,.3],[2.47,-.48,1.7],[2.60,-1.1,1.23],[1.8,-2.20,.61],[1.1,-2.83,.5]],w:.8},
    {p:[[-2.56,1.48,.32],[-1.9,1.35,2.12],[-1.41,.57,2.6],[-1.09,-.02,2.75],[-.49,-.26,2.81]],w:.37},
    {p:[[-.9,2.62,-.13],[-1.53,2.31,-1.2],[-1.1,1.1,-2.6],[.01,.3,-2.95],[.58,-.5,-2.63],[1.58,-1.36,-1.93],[1.21,-2.51,-.85]],w:.84},
    {p:[[-2.31,-1.31,-.45],[-2.02,-1.4,-1.6],[-.83,-2.35,-1.5],[.1,-2.48,-1.1],[1.17,-2.5,.13]],w:.49},
  ];
  clothSpecs.forEach((s,i)=>cloth.add(drape(s.p,s.w,i*.8)));
  const threads=group('07 / LOOSE THREADS AND ELECTRIC FILAMENTS');
  for(let i=0;i<94;i++){
    const n=direction(i,94),q=new T.Quaternion().setFromUnitVectors(Z,n),points=[];
    const wide=.18+random()*.33,long=.35+random()*.55,phase=random()*6.28;
    for(let j=0;j<65;j++){
      const t=j/64,a=t*Math.PI*2;
      const x=wide*Math.sin(a*2.4+phase)+t*.17,y=(t-.5)*long*2+.09*Math.cos(a*5),z=R+.16+.10*Math.sin(a*2+phase);
      points.push(new T.Vector3(x,y,z).applyQuaternion(q));
    }
    threads.add(tube(new T.CatmullRomCurve3(points),.0035+random()*.003,i%5===0?turquoise:i%3===0?fineSilver:wireIce,88));
  }
  // Fine rain-bearing tails start at the actual fabric edge and enter its shadow.
  for(let i=0;i<13;i++){
    const u=i/12,x=1.56+u*.60,y=.98-u*1.76,z=2.29-u*.14,length=.26+(i%4)*.105;
    threads.add(tube([[x,y,z],[x-.035,y-length*.55,z+.035],[x-.15,y-length,z+.01]],.0038+i%3*.0012,i%4===0?wireDark:fineSilver,20));
    const bead=mesh(new T.SphereGeometry(1,9,7),glass,[x-.15,y-length-.029,z+.01]);bead.scale.set(.013,.042,.013);threads.add(bead);
  }
  // Wandering cables, not equidistant science-fiction rings.
  const wires=group('08 / WANDERING LIGHT CABLES');
  const cablePaths=[
    [[-3.33,-1.52,.55],[-2.98,-.18,1.8],[-2.22,.92,2.52],[-1.73,2.64,1.45],[.24,2.88,.16],[2.51,1.98,.1],[3.10,.52,.8],[2.71,-1.49,1.1],[.95,-2.9,.08],[-1.66,-2.53,-.41]],
    [[-2.65,-2.12,1.03],[-1.9,-2.2,1.93],[-.42,-2.84,1.1],[1.72,-2.44,1.0],[2.46,-1.17,2.04],[2.67,.64,1.91],[2.05,2.05,1.49],[.2,2.68,-1.0],[-2.12,.57,-1.8]],
    [[-2.17,-.26,2.33],[-2.81,-.11,2.14],[-2.55,1.18,2.01],[-1.12,1.82,2.02],[-.40,2.20,2.04],[1.08,2.54,1.51],[2.98,1.56,.55],[2.72,.18,-1.16],[1.02,-1.28,-2.59],[-1.13,-2.13,-1.59]],
  ];
  const bulbs=group('09 / BLUE RAIN LIGHTS');
  const emitterPoints=[];
  cablePaths.forEach((ps,i)=>{
    const path=new T.CatmullRomCurve3(ps.map(V),true,'catmullrom',.4);
    wires.add(tube(path,i===0?.013:.0085,i===0?wireDark:wireIce,210,true));
    const count=[5,3,3][i];
    for(let j=0;j<count;j++){
      const t=(j+.12+random()*.47)/count,p=path.getPointAt(t),tangent=path.getTangentAt(t),light=i===0?j%3:(j%5===0?2:0);
      const cap=mesh(new T.CylinderGeometry(.024,.027,.1,8),fineSilver);cap.position.copy(p);cap.quaternion.setFromUnitVectors(Y,tangent);bulbs.add(cap);
      const lamp=mesh(new T.SphereGeometry(.028,10,8),lightMats[light]);lamp.position.copy(p.clone().addScaledVector(tangent,.059));bulbs.add(lamp);emitterPoints.push(lamp.position.clone());
    }
  });
  const leftSpark=[[-1.91,.27,2.50],[-2.06,-.42,2.38],[-1.60,-1.26,2.16],[-.98,.89,2.60],[-1.89,1.25,2.04]];
  leftSpark.forEach((p,i)=>{bulbs.add(mesh(new T.SphereGeometry(.036,10,8),lightMats[i%3===0?1:0],p));emitterPoints.push(V(p));});
  for(let i=0;i<7;i++){
    const x=-.75-random()*1.50,y=(random()-.5)*3.4,z=Math.sqrt(Math.max(.45,R*R-x*x-y*y)),n=new T.Vector3(x,y,z).normalize();
    const p=n.multiplyScalar(R+.22+random()*.08);bulbs.add(mesh(new T.SphereGeometry(.024+random()*.017,10,8),lightMats[i%4===0?1:0],p.toArray()));emitterPoints.push(p);
  }

  const jewels=group('10 / PEARLS AND SILVER CHAINS');
  for(let i=0;i<5;i++){
    const offset=(i-2)*.058;
    jewels.add(tube([[.48+offset,-2.24,1.72],[.33+offset,-2.61,1.62],[.17+offset*.3,-2.93,1.44],[.13,-3.13,1.40]],.0055,i%2?fineSilver:wireDark,34));
  }
  const lastDrop=mesh(new T.SphereGeometry(1,18,14),pearl,[.13,-3.22,1.40]);lastDrop.scale.set(.042,.11,.042);jewels.add(lastDrop);
  const beadGeo=new T.SphereGeometry(1,12,9),linkGeo=new T.TorusGeometry(.027,.0065,4,10);
  for(let i=0;i<160;i++){
    const n=direction(i,160),m=mesh(beadGeo,i%5?pearl:silver);m.position.copy(n.multiplyScalar(R+.12+random()*.17));m.scale.setScalar(.019+Math.pow(random(),2)*.065);jewels.add(m);
  }
  const chains=[[[1.6,1.4,2.10],[1.37,1.82,2.28],[.61,2.53,1.55],[-.43,2.63,1.10]],[[2.6,.82,1.23],[2.13,.37,2.01],[2.54,-.28,1.79],[1.96,-1.57,1.74],[.73,-2.45,1.25]],[[-2.6,.12,1.64],[-2.3,-.9,1.96],[-1.65,-1.66,2.13],[-.73,-2.11,1.98]],[[-1.53,1.46,-1.93],[.17,.38,-2.73],[1.52,-.80,-2.17]]];
  chains.forEach(ps=>{
    const path=new T.CatmullRomCurve3(ps.map(V)),n=Math.round(path.getLength()/.043);
    for(let i=0;i<n;i++){
      const u=i/(n-1),m=mesh(linkGeo,fineSilver);m.position.copy(path.getPoint(u));aim(m,path.getTangent(u),i%2*Math.PI/2);m.scale.y=1.43;jewels.add(m);
    }
  });
  // Foil/sequin flowers echo the source's small reflective ornaments.
  const sequins=group('11 / REFLECTIVE PETALS');
  function flower(seed) {
    const shape=new T.Shape(),r=seededRandom(seed);
    for(let i=0;i<=120;i++){
      const a=i/120*Math.PI*2,rr=.12+.07*Math.cos(a*5),x=Math.cos(a)*rr,y=Math.sin(a)*rr;
      if(i===0)shape.moveTo(x,y);else shape.lineTo(x,y);
    }
    const hole=new T.Path();hole.absarc(0,0,.023,0,Math.PI*2,true);shape.holes.push(hole);
    return new T.ExtrudeGeometry(shape,{depth:.007,bevelEnabled:false,curveSegments:2});
  }
  const flowerGeo=flower(918);
  for(const [i,p] of [[-1.61,-1.81,1.8],[-2.46,-.51,1.73],[-2.16,.62,1.89],[-1.56,1.48,2.02],[1.63,1.33,1.97],[2.43,.95,1.30],[1.12,-2.34,1.22],[-.98,-2.38,1.23],[2.1,-1.50,1.48],[-.78,1.88,-1.94],[1.4,-1.5,-1.94]].entries()){
    const center=V(p),n=center.clone().normalize();
    for(let j=0;j<3;j++){
      const m=mesh(flowerGeo,(i+j)%4===0?turquoise:i%3===0?silver:cobalt);m.position.copy(center).add(new T.Vector3((j-1)*.19,(j%2)*.18,0));aim(m,n,i*.76+j*.31);m.scale.setScalar(.68+random()*.8);sequins.add(m);
    }
  }
  const floating=group('12 / SUSPENDED TYPE AND SHARDS');
  const letterMat=new T.MeshStandardMaterial({map:maps.letters,roughness:.62,metalness:.25,alphaTest:.3,side:T.DoubleSide});
  const floatingInfo=[[-2.88,2.10,.2,0,.34],[.08,3.29,-.31,1,-.3],[1.18,3.19,.16,2,.31],[2.43,2.4,.4,3,-.4],[3.2,1.5,.3,4,.6],[-3.10,-.53,.8,10,-.4],[2.91,-1.95,.2,11,.31],[-1.72,-3.07,.1,7,.52]];
  floatingInfo.forEach(([x,y,z,id,a],i)=>{
    const g=new T.PlaneGeometry(.31,.42),uv=g.attributes.uv;
    for(let j=0;j<uv.count;j++)uv.setXY(j,uv.getX(j)*.25+(id%4)*.25,uv.getY(j)*.25+1-(Math.floor(id/4)+1)*.25);
    const m=mesh(g,letterMat,[x,y,z]);m.rotation.set(.1*(i-3),.09*(i-2),a);floating.add(m);
  });
  for(let i=0;i<19;i++){
    const a=random()*6.28,radius=3.06+random()*.34,n=new T.Vector3(Math.cos(a),Math.sin(a),.17+(random()-.5)*.7).normalize();
    const m=mesh(shard(.08+random()*.15,.13+random()*.27,140+i),i%4===0?glass:i%2?graphite:silver);m.position.copy(n.multiplyScalar(radius));aim(m,n,random()*6.28);floating.add(m);
  }

  // v0.12.3 / private photographs behind the rain. An empty room keeps the
  // light of one instant; the paper carries moisture, not decorative lyrics.
  const room=exposureTexture({night:true});
  for(const [x,y,z,w,h,a] of [[-1.28,.36,2.69,1.04,.82,-.22],[1.45,.67,2.46,.71,.88,.27],[.36,-1.92,2.32,.95,.69,-.19]]){
    const photo=emulsionPaper(w,h,room,{curl:.105,night:true});photo.position.set(x,y,z);photo.rotation.set(.07,x*.09,a);print.add(photo);
  }
  // A cut exposure is suspended with a physical gap; no literal pause-button.
  for(const [offset,u] of [[-.16,0],[.20,.5]]){
    const half=room.clone();half.repeat.set(.46,1);half.offset.x=u;half.needsUpdate=true;
    const photo=emulsionPaper(.30,.50,half,{curl:.035,night:true});photo.position.set(.28+offset,-2.12,2.69);photo.rotation.set(.08,-.10,-.13);floating.add(photo);
  }
  print.userData.songGesture={edition:'0.12.3',photographs:3,gesture:'unlit room, photographs behind a protective rain screen'};
  // Fine slanting lines veil portions of the image without filling its dark air.
  for(let i=0;i<19;i++){
    const x=-1.82+i*.061,y=.64+.06*Math.sin(i*1.7),z=2.88;
    threads.add(tube([[x,y,z],[x-.025,y-.29,z+.008],[x-.055,y-.56-(i%3)*.06,z-.005]],.0023,i%4?wireDark:fineSilver,14));
  }
  const pauseA=[[.95,-1.70,2.42],[.79,-2.38,2.55],[.21,-2.53,2.51],[-.21,-2.25,2.45]];
  const pauseB=[[-.35,-2.20,2.46],[-.64,-1.91,2.40],[-.83,-1.78,2.35]];
  wires.add(tube(pauseA,.006,fineSilver,52),tube(pauseB,.006,wireIce,36));
  floating.userData.songGesture={edition:'0.12.3',gesture:'split image and interrupted trajectory, time held before falling'};
  // Remote streetlights are independent, unequal and behind the foreground.
  const distantLamp=material('#a8b2c2',.1,.55,{emissive:'#d0c3af',emissiveIntensity:.70});
  for(const [x,y,z,s] of [[-2.24,1.94,1.03,.016],[-1.63,2.39,.56,.023],[1.26,2.64,.27,.012],[2.72,.95,.34,.019],[2.86,-.19,.17,.010]])bulbs.add(mesh(new T.SphereGeometry(s,9,7),distantLamp,[x,y,z]));

  // Batch within authored layers so thousands of fine details don't cause
  // thousands of draw calls. Preserve real materials and GLB-exportable meshes.
  root.updateMatrixWorld(true);
  const originals=new Set();
  for(const g of Object.values(groups)){
    const inverse=g.matrixWorld.clone().invert(),buckets=new Map();
    g.traverse(o=>{
      if(!o.isMesh)return;originals.add(o.geometry);
      const geo=o.geometry.clone();geo.applyMatrix4(inverse.clone().multiply(o.matrixWorld));
      if(!geo.index)geo.setIndex(Array.from({length:geo.attributes.position.count},(_,i)=>i));
      if(!geo.attributes.uv)geo.setAttribute('uv',new T.Float32BufferAttribute(new Float32Array(geo.attributes.position.count*2),2));
      const key=o.material.uuid;if(!buckets.has(key))buckets.set(key,{material:o.material,geos:[]});buckets.get(key).geos.push(geo);
    });
    g.clear();
    for(const {material,geos} of buckets.values()){
      const merged=mergeGeometries(geos,false);geos.forEach(geo=>geo.dispose());
      if(!merged)throw new Error('Rain material layer could not be merged');g.add(mesh(merged,material));
    }
  }
  originals.forEach(g=>g.dispose());
  const separations=Object.values(groups).map((g,i)=>({g,base:g.position.clone(),offset:new T.Vector3((i%3-1)*.16,(i%2-.5)*.10,i*.052)}));
  root.userData={title:'雨终曲',english:'RAIN FINALE',layers:Object.keys(groups).length,reference:'Original 3D interpretation of the user-provided black/silver, blue-light and gauze collage. No original photograph, watermark, performer credits or lyrics are embedded.',back:'Authored continuation; not an inferred photograph of the original back.'};
  root.userData.sceneVersion='0.12.3';root.userData.structure='Dark room exposures under rain, suspended split photographs and an interrupted trajectory; distant lamps behind the original silver veil and cobalt coda.';
  return {
    root,groups,emitterPoints,
    setSeparated(amount){const a=T.MathUtils.clamp(Number(amount),0,1);for(const {g,base,offset} of separations)g.position.copy(base).addScaledVector(offset,a);},
    dispose(){const gs=new Set(),ms=new Set(),ts=new Set(Object.values(maps));root.traverse(o=>{if(o.geometry)gs.add(o.geometry);if(o.material)ms.add(o.material);});gs.forEach(g=>g.dispose());ms.forEach(m=>{for(const v of Object.values(m))if(v?.isTexture)ts.add(v);m.dispose();});ts.forEach(t=>t.dispose());}
  };
}
