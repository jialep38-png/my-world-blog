/** V0.5 reference-led objects. All silhouettes below are real 3D geometry.
 * The saved concept is never used as a scene background or a camera-facing globe.
 */
import * as T from 'three';
import {fromLatLon,seededRandom} from './math.js';
import {part,box,ball,cyl,mergeStatic,makeFern,makeReeds,makeFlowerCluster,makeOrchid} from './garden-models.js';
import {texturedStoneMaterial,mossMaterial} from './collage-layers.js';
import {quietHaloTexture,paperImpressionTexture} from './song-surfaces.js';
import {makePoemAlbum} from './poem-album.js';
import {poemTexture} from './poem-reliquary.js';

const R=5.4,UP=new T.Vector3(0,1,0),Z=new T.Vector3(0,0,1);
const COLOR={bark:'#514333',barkLight:'#88735b',needle:'#314834',needleLight:'#627445',ivory:'#e9e0ca',pink:'#df9fa4',bud:'#b44750',gold:'#b99e60'};
function at(lat,lon,r=5.58){return new T.Vector3(...fromLatLon(lat,lon)).multiplyScalar(r);}
function tube(points,r,color,segments=24,extra={}){
  return part(new T.TubeGeometry(new T.CatmullRomCurve3(points.map(p=>p.isVector3?p:new T.Vector3(...p))),segments,r,7,false),color,[0,0,0],extra);
}
function place(g,lat,lon,r=5.57){const n=at(lat,lon,1);g.position.copy(n).multiplyScalar(r);g.quaternion.setFromUnitVectors(UP,n);return g;}
function triMesh(vertices,color,extra={}){
  const geo=new T.BufferGeometry();geo.setAttribute('position',new T.Float32BufferAttribute(vertices.flatMap(p=>p.isVector3?p.toArray():p),3));geo.computeVertexNormals();
  return part(geo,color,[0,0,0],{side:T.DoubleSide,...extra});
}

/** Rigid bamboo flute, with an actual bore, finger holes, bindings and silk tassel. */
function flute(){
  const root=new T.Group();root.name='reference-bamboo-flute';
  const bamboo=new T.MeshStandardMaterial({color:'#c5c78e',roughness:.36,metalness:.04});
  bamboo.onBeforeCompile=s=>{
    s.vertexShader='varying vec3 bambooPoint;\n'+s.vertexShader.replace('#include <begin_vertex>','#include <begin_vertex>\nbambooPoint=position;');
    s.fragmentShader='varying vec3 bambooPoint;\n'+s.fragmentShader.replace('#include <color_fragment>',`#include <color_fragment>
      float stripe=sin(atan(bambooPoint.z,bambooPoint.x)*71.+sin(bambooPoint.y*3.)*.45);
      diffuseColor.rgb*=.92+.075*stripe;`);
  };
  const body=new T.Mesh(new T.CylinderGeometry(.108,.115,4.35,32,16,true),bamboo);body.castShadow=body.receiveShadow=true;root.add(body);
  for(const [y,h] of [[2.06,.4],[-2.1,.18]])root.add(cyl(.119,.12,h,'#5d3e28',[0,y,0],24));
  for(const y of [-2.2,-2.01,-.72,.58,1.89,2.23]){
    const band=cyl(.122,.122,.016,COLOR.gold,[0,y,0],24,{roughness:.29,metalness:.75});root.add(band);
    root.add(cyl(.117,.117,.01,'#263e2b',[0,y-.027,0],24));
  }
  // Bore at the lower end, visible at oblique angles.
  const bore=new T.Mesh(new T.CircleGeometry(.081,24),new T.MeshStandardMaterial({color:'#141c14',roughness:.94}));bore.rotation.x=Math.PI/2;bore.position.y=-2.199;root.add(bore);
  for(const y of [-1.56,-1.21,-.86,-.35,.06,.48,1.39]){
    root.add(part(new T.TorusGeometry(.039,.006,5,16),'#8d8b52',[0,y,.11],{roughness:.5}));
    const hole=part(new T.CircleGeometry(.036,16),'#121c17',[0,y,.114]);root.add(hole);
  }
  root.add(tube([[0,-2.16,0],[.04,-2.39,.01],[.09,-2.53,0]],.023,'#476544',12));
  for(const [y,s] of [[-2.47,.078],[-2.69,.1]])root.add(ball(s,'#9eb591',[.08,y,0],[1,.88,1]));
  root.add(cyl(.095,.115,.11,'#43613c',[.08,-2.84,0],16));
  for(let i=0;i<38;i++){
    const a=i*2.399,r=.12*Math.sqrt(i/38),x=.08+Math.cos(a)*r,z=Math.sin(a)*r;
    root.add(tube([[.08,-2.86,0],[x,-3.09,z],[x+.14,-3.48-(i%5)*.024,z+.06]],.009,i%3?'#2e4c32':'#708052',12,{roughness:.82}));
  }
  // The front-facing reference diagonal is upper-left -> lower-right.
  const start=new T.Vector3(-1.9,3.53,5.08),end=new T.Vector3(.72,.00,6.25),direction=start.clone().sub(end).normalize();
  const front=Z.clone().addScaledVector(direction,-Z.dot(direction)).normalize(),right=new T.Vector3().crossVectors(direction,front).normalize();
  root.position.copy(start).add(end).multiplyScalar(.5);root.position.z+=.52;
  root.quaternion.setFromRotationMatrix(new T.Matrix4().makeBasis(right,direction,front));
  root.scale.setScalar(1.09);
  return mergeStatic(root);
}

/** Scalloped celadon shell and recessed graphite well, not a flat green badge. */
function inkstone(){
  const g=new T.Group();g.name='reference-scalloped-inkstone';
  const contour=(scale,y)=>Array.from({length:97},(_,i)=>{const a=i*Math.PI/48,r=(.86+.115*Math.cos(a*4))*scale;return new T.Vector3(Math.cos(a)*r,y,Math.sin(a)*r);});
  const glaze=new T.MeshPhysicalMaterial({color:'#b9cab3',map:poemTexture('jade'),bumpMap:poemTexture('jade'),bumpScale:.007,metalness:.15,roughness:.21,clearcoat:1,clearcoatRoughness:.12});
  const pewter=new T.MeshStandardMaterial({color:'#b6c1b4',roughness:.23,metalness:.85});
  const shell=new T.Shape(contour(1,0).map(p=>new T.Vector2(p.x,p.z)));
  const hole=new T.Path(contour(.78,0).reverse().map(p=>new T.Vector2(p.x,p.z)));shell.holes.push(hole);
  const frame=new T.Mesh(new T.ExtrudeGeometry(shell,{depth:.20,bevelEnabled:true,bevelSize:.026,bevelThickness:.025,bevelSegments:3,curveSegments:48}),glaze);frame.rotation.x=-Math.PI/2;frame.position.y=.035;frame.castShadow=frame.receiveShadow=true;g.add(frame);
  for(const [scale,y,thickness,mat] of [[1.03,.07,.022,glaze],[.975,.255,.022,pewter],[.87,.25,.019,glaze],[.79,.24,.015,pewter]]){
    const rim=new T.Mesh(new T.TubeGeometry(new T.CatmullRomCurve3(contour(scale,y)),128,thickness,8,false),mat);rim.castShadow=true;g.add(rim);
  }
  const wellGeo=new T.ShapeGeometry(new T.Shape(contour(.80,0).map(p=>new T.Vector2(p.x,p.z))),48);wellGeo.rotateX(-Math.PI/2);
  const well=new T.Mesh(wellGeo,new T.MeshPhysicalMaterial({color:'#c4c9c3',map:poemTexture('graphite'),bumpMap:poemTexture('graphite'),bumpScale:.018,metalness:.45,roughness:.26,clearcoat:.7,clearcoatRoughness:.23}));well.position.y=.055;well.receiveShadow=true;g.add(well);
  for(let i=0;i<28;i++){const p=contour(.96,.17)[Math.floor(i*96/28)];g.add(ball(.013,'#bac4a9',p.toArray(),[1,1,.7]));}
  // Three veined lotus leaves resting on its far rim.
  for(let k=0;k<3;k++){
    const leaf=new T.Group(),verts=[],center=new T.Vector3(0,.025,0),rad=.47-k*.05;
    for(let i=0;i<40;i++){
      const point=j=>{const a=j*Math.PI*2/40,r=rad*(1+.065*Math.cos(a*7+k));return new T.Vector3(Math.cos(a)*r,.06*Math.cos(a*2)+.014*Math.sin(a*9),Math.sin(a)*r*.82);};
      verts.push(center,point(i),point(i+1));
      if(i%4===0)leaf.add(tube([center.clone().setY(.041),point(i).multiplyScalar(.62).add(new T.Vector3(0,.018,0)),point(i)],.004,'#a9b38a',5));
    }
    leaf.add(triMesh(verts,['#bac99d','#c1caac','#a5b48d'][k],{map:poemTexture('jade'),bumpMap:poemTexture('jade'),bumpScale:.008,roughness:.65}));leaf.position.set(.59+k*.13,.27+k*.045,.47-k*.29);leaf.rotation.y=k*.9;g.add(leaf);
  }
  place(g,36,82,6.04);g.rotateY(-.25);g.scale.setScalar(1.27);return mergeStatic(g);
}

function envelope(){
  const g=new T.Group();g.name='reference-vermilion-letter';
  g.add(box(1.53,.028,.96,'#b92e23',[0,.015,0],.012));
  g.add(triMesh([[-.765,.043,-.48],[.765,.043,-.48],[0,.067,.19]],'#ce3e2d',{roughness:.94}));
  g.add(triMesh([[-.765,.038,-.42],[0,.048,.1],[-.765,.038,.48]],'#ba3529',{roughness:.94}));
  g.add(triMesh([[.765,.038,-.42],[.765,.038,.48],[0,.048,.1]],'#9d2d25',{roughness:.96}));
  const seal=cyl(.073,.078,.025,'#9e251c',[.03,.067,.12],18,{roughness:.32});g.add(seal);
  // Small blank seal block on an ivory offcut (no copied signatures/credits).
  g.add(box(.39,.018,.42,COLOR.ivory,[.67,.04,-.60],.005));
  g.add(box(.22,.012,.23,'#a84835',[.67,.06,-.60],.002));
  for(let j=0;j<4;j++)g.add(box(.014,.005,.14,'#e0c7a0',[.60+j*.045,.068,-.60],.001));
  place(g,14,88,6.25);g.rotateY(-.29);g.scale.setScalar(.90);return mergeStatic(g);
}

/** Irregular needles, tapered bark, exposed roots: no stacked canopy disks. */
export function makeSculpturalPine(size=1,seed=1){
  const g=new T.Group(),random=seededRandom(seed*973+61);g.name='sculptural-pine';
  const spine=[[0,0,0],[-.08,.16,.045],[.035,.36,-.02],[-.06,.58,.055],[.10,.86,.015],[.08,1.06,0]].map(p=>new T.Vector3(...p));
  const trunk=tube(spine,.064,'#a18e70',36,{map:poemTexture('bark'),bumpMap:poemTexture('bark'),bumpScale:.025,roughness:.92});const a=trunk.geometry.attributes.position;
  for(let i=0;i<a.count;i++){const x=a.getX(i),y=a.getY(i),z=a.getZ(i),taper=1-.63*Math.max(0,Math.min(1,y/1.12));a.setXYZ(i,x*(.76+taper*.45),y,z*(.8+taper*.3));}trunk.geometry.computeVertexNormals();g.add(trunk);
  for(let root=0;root<7;root++){const az=root*2.4,dx=Math.cos(az),dz=Math.sin(az);g.add(tube([[0,.09,0],[dx*.16,.033,dz*.15],[dx*.28,-.016,dz*.23]],.021,COLOR.bark,12));}
  for(let line=0;line<9;line++){
    const phase=line*Math.PI*2/9,pts=spine.map((p,i)=>p.clone().add(new T.Vector3(Math.cos(phase+i*.18)*(.058-i*.006),0,Math.sin(phase+i*.18)*(.05-i*.005))));
    g.add(tube(pts,.005,line%3?COLOR.barkLight:'#332e25',26));
  }
  const verts=[],colors=[],c=new T.Color();
  for(let branch=0;branch<11;branch++){
    const h=.36+branch*.06,az=branch*2.399+seed*.4,length=.30+(1-h)*.28;
    const tip=new T.Vector3(Math.cos(az)*length,h+.08,Math.sin(az)*length),middle=tip.clone().multiplyScalar(.64).setY(h-.045);
    g.add(tube([[0,h,0],middle,tip],.019,COLOR.bark,12));
    for(let tuft=0;tuft<7;tuft++){
      const center=tip.clone().add(new T.Vector3((random()-.5)*.28,(random()-.5)*.09,(random()-.5)*.26));
      g.add(ball(.040,tuft%3?'#283d29':'#485631',center.toArray(),[1.18,.60,1.0]));
      for(let needle=0;needle<85;needle++){
        const azimuth=random()*Math.PI*2,rise=random()*.9-.24,len=.085+random()*.090;
        const dir=new T.Vector3(Math.cos(azimuth),rise,Math.sin(azimuth)).normalize(),end=center.clone().addScaledVector(dir,len),side=new T.Vector3(-dir.z,0,dir.x).multiplyScalar(.0038);
        verts.push(...center.clone().add(side).toArray(),...center.clone().sub(side).toArray(),...end.toArray());
        c.set(needle%4===0?COLOR.needleLight:COLOR.needle).multiplyScalar(.72+random()*.54);for(let v=0;v<3;v++)colors.push(c.r,c.g,c.b);
      }
    }
  }
  const geo=new T.BufferGeometry();geo.setAttribute('position',new T.Float32BufferAttribute(verts,3));geo.setAttribute('color',new T.Float32BufferAttribute(colors,3));geo.computeVertexNormals();
  const needles=new T.Mesh(geo,new T.MeshStandardMaterial({vertexColors:true,roughness:.91,side:T.DoubleSide}));needles.castShadow=true;needles.receiveShadow=true;
  // mergeStatic intentionally preserves position/normal/uv, so keep vertex-coloured needles separate.
  const result=mergeStatic(g);result.add(needles);result.scale.setScalar(size);return result;
}

function blossom(g,p,normal,size,variant){
  const f=new T.Group();
  const verts=[];
  for(let petal=0;petal<5;petal++){
    const az=petal*Math.PI*.4,point=(u,v)=>{
      const r=size*(.14+.87*u),w=size*.41*Math.sin(u*Math.PI*.92)*v;
      return [Math.cos(az)*r-Math.sin(az)*w,size*(.11+.14*u*u-.08*Math.sin(u*Math.PI)),Math.sin(az)*r+Math.cos(az)*w];
    };
    for(let row=0;row<4;row++){const a=point(row/4,-1),b=point(row/4,1),c=point((row+1)/4,1),d=point((row+1)/4,-1);verts.push(a,b,c,a,c,d);}
  }
  f.add(triMesh(verts,['#e7b6b7','#f0d6c6','#cc8892'][variant%3],{roughness:.8}));
  f.add(ball(size*.19,'#b78944',[0,size*.16,0],[1,.6,1]));
  for(let i=0;i<6;i++){const a=i*Math.PI/3;f.add(tube([[0,size*.13,0],[Math.cos(a)*size*.25,size*.4,Math.sin(a)*size*.25]],size*.014,COLOR.gold,2));}
  f.position.copy(p);f.quaternion.setFromUnitVectors(UP,normal);g.add(f);
}

function surfaceBlossoms(){
  const g=new T.Group();g.name='plum-canopy';const random=seededRandom(1505);
  const routes=[
    [[-40,132],[-20,138],[-2,131],[18,128],[35,113],[50,111]],
    [[-29,56],[-12,62],[4,65],[20,77]],
    [[-43,-132],[-23,-141],[-5,-129],[11,-138],[29,-128],[43,-111]],
    [[-36,-42],[-15,-43],[3,-48],[18,-55]],
    [[-39,172],[-14,167],[9,178],[30,170]],
    [[25,4],[44,-3],[56,21]]
  ]; 
  for(const [routeIndex,route] of routes.entries()){
    const curve=new T.CatmullRomCurve3(route.map(ll=>at(...ll,5.73)));
    const pts=Array.from({length:49},(_,i)=>curve.getPoint(i/48).normalize().multiplyScalar(5.74));g.add(tube(pts,.046,COLOR.bark,72));
    for(let strand=0;strand<4;strand++)g.add(tube(pts.map((p,i)=>p.clone().add(new T.Vector3(Math.sin(i*.18+strand)*.023,0,Math.cos(i*.18+strand)*.023))),.006,COLOR.barkLight,72));
    for(let twig=0;twig<16;twig++){
      const p=curve.getPoint(.04+twig*.055).normalize().multiplyScalar(5.75),normal=p.clone().normalize(),tangent=curve.getTangent(.04+twig*.055),side=new T.Vector3().crossVectors(normal,tangent).normalize().multiplyScalar(twig%2?1:-1);
      const end=p.clone().addScaledVector(side,.19+random()*.3).addScaledVector(tangent,.12).normalize().multiplyScalar(5.87),mid=p.clone().lerp(end,.5).addScaledVector(normal,.055);
      g.add(tube([p,mid,end],.012,COLOR.bark,10));
      for(let b=0;b<3;b++){const bp=mid.clone().lerp(end,.25+b*.3).addScaledVector(tangent,(b-1)*.08);blossom(g,bp,bp.clone().normalize(),.085+random()*.045,twig+b+routeIndex);}
      g.add(ball(.039,COLOR.bud,end.clone().addScaledVector(tangent,.09).toArray(),[.8,1,.8]));
    }
  }return mergeStatic(g);
}

/** A rock can be angular and eroded without looking like a repeated donut. */
function boulder(size,seed){
  const geo=new T.IcosahedronGeometry(size,2),p=geo.attributes.position;
  for(let i=0;i<p.count;i++){
    const x=p.getX(i),y=p.getY(i),z=p.getZ(i),n=1+.11*Math.sin(x*12+seed)*Math.cos(z*9-y*4)+.055*Math.sin(y*23+x*4);
    p.setXYZ(i,x*n,y*.68*n,z*.85*n);
  }
  geo.computeVertexNormals();const m=new T.Mesh(geo,texturedStoneMaterial());m.castShadow=m.receiveShadow=true;return m;
}

/** Authored foreground banks, rather than an even scatter over the whole sphere. */
function banks(){
  const g=new T.Group(),pines=new T.Group(),random=seededRandom(2505);g.name='reference-water-banks';
  const fern=makeFern(1.9,1),flower=makeFlowerCluster(1.2,0),reed=makeReeds(1.5,2),orchid=makeOrchid(2,1);
  for(let side of [-1,1])for(let j=0;j<30;j++){
    const ny=.08-j*.029,x=-.23+.10*Math.sin(ny*7)+side*(.20+random()*.03),z=Math.sqrt(Math.max(.01,1-x*x-ny*ny)),n=new T.Vector3(x,ny,z).normalize();
    const rock=boulder(.14+random()*.19,j+side);rock.position.copy(n).multiplyScalar(5.43);rock.quaternion.setFromUnitVectors(UP,n);rock.rotateY(j*.7);g.add(rock);
    if(j%2===0){
      const cushion=ball(.17,'#697b43',[0,0,0],[1.4,.43,1]);cushion.material=mossMaterial();const nn=n.clone().add(new T.Vector3(side*.03,0,0)).normalize();place(cushion,Math.asin(nn.y)*180/Math.PI,Math.atan2(nn.z,nn.x)*180/Math.PI,5.56);g.add(cushion);
      // This short stretch passes underneath the bamboo and silk. Keep its low
      // moss cushion; tall reeds formerly penetrated the instrument in close-up.
      if(!(side===1&&j<10)){
        const plant=(j%6===0?reed:j%4===0?fern:flower).clone();plant.position.copy(nn).multiplyScalar(5.58);plant.quaternion.setFromUnitVectors(UP,nn);plant.rotateY(j);g.add(plant);
      }
    }
  }
  for(const [i,entry] of [[9,124,1.85],[-30,59,1.65],[44,40,1.2],[12,-117,1.4],[-35,-60,1.4]].entries()){
    const [lat,lon,size]=entry,tree=makeSculpturalPine(size,i+1);place(tree,lat,lon,5.54);
    const normal=at(lat,lon,1),tangent=UP.clone().addScaledVector(normal,-UP.dot(normal)).normalize();tree.quaternion.setFromUnitVectors(UP,normal.multiplyScalar(.70).addScaledVector(tangent,.5).normalize());tree.rotateY(i*.9);pines.add(tree);
    const lawn=new T.Group();for(let j=0;j<14;j++){
      const a=j*2.399,r=.1+Math.sqrt(j)*.12,model=(j%3===0?orchid:j%3===1?fern:flower).clone();model.position.set(Math.cos(a)*r,.02,Math.sin(a)*r);model.scale.multiplyScalar(.6+random()*.4);model.rotateY(j);lawn.add(model);
      if(j%2===0){const rock=boulder(.16+random()*.1,j);rock.position.set(Math.cos(a)*r,-.07,Math.sin(a)*r);lawn.add(rock);}
    }place(lawn,lat,lon,5.54);g.add(lawn);
  }
  const result=mergeStatic(g);result.add(pines);return result;
}

function silkOrbit(){
  const g=new T.Group();g.name='reference-open-orchid-gestures';
  const gestures=[
    [[-3.8,-2.9,2.7],[-5.65,-.4,1.3],[-5.10,2.8,.1],[-2.8,5.4,.55],[.12,5.7,1.35]],
    [[-4.1,-2.4,2.8],[-5.9,.7,.75],[-4.55,3.9,-.2],[-1.52,5.58,.65],[.86,5.01,1.20]],
    [[3.7,-3.8,1.8],[5.4,-1.5,1.05],[5.48,1.7,-.3],[3.43,4.52,1.45]],
    [[3.93,-3.20,2.1],[5.63,-.75,.32],[4.94,2.14,-.85],[2.83,4.61,.75]],
    [[-3.48,-3.15,-2.2],[-4.42,-.1,-3.68],[-2.73,4.20,-2.88],[1.15,5.3,-.34]],
    [[4.42,.38,-2.9],[3.7,3.54,-2.89],[.36,5.57,-1.19],[-1.55,4.99,-1.65]]
  ];
  for(const [i,points] of gestures.entries()){
    const path=new T.CatmullRomCurve3(points.map(p=>new T.Vector3(...p))),verts=[],steps=90;
    const point=(t,sign)=>{const p=path.getPoint(t),tangent=path.getTangent(t),edge=new T.Vector3().crossVectors(tangent,p.clone().normalize()).normalize();return p.addScaledVector(edge,sign*(.035+i%3*.019)*Math.sin(Math.PI*t)**.6);};
    for(let j=0;j<steps;j++)verts.push(point(j/steps,-1),point(j/steps,1),point((j+1)/steps,1),point(j/steps,-1),point((j+1)/steps,1),point((j+1)/steps,-1));
    g.add(triMesh(verts,['#304736','#617147','#344638'][i%3],{roughness:.52,metalness:.05}));
    if(i%2===0)g.add(tube(Array.from({length:61},(_,j)=>point(j/60,0)),.004,'#9caa7a',60));
  }
  g.userData={openGestures:gestures.length,closedRings:0};return mergeStatic(g);
}

function waterDetail(){
  const g=new T.Group();g.name='reference-river-and-waterfall';const random=seededRandom(722);
  // Curved foam ribbons lie on the water sphere, not on a flat image card.
  for(let i=0;i<180;i++){
    const y=.06-random()*.91,x=-.23+.10*Math.sin(y*7)+(random()-.5)*.34,z=Math.sqrt(Math.max(.001,1-y*y-x*x)),n=new T.Vector3(x,y,z).normalize();
    const side=new T.Vector3().crossVectors(n,UP).normalize(),pts=[];
    for(let j=0;j<6;j++){const u=(j-2.5)*(.006+(i%4)*.002);pts.push(n.clone().addScaledVector(side,u).add(new T.Vector3(0,Math.sin(j*.9+i)*.003,0)).normalize().multiplyScalar(5.434));}
    const line=tube(pts,.0012+random()*.0022,i%3?'#9bb6af':'#c4d1c1',7,{roughness:.63,metalness:.06,transparent:true,opacity:.62,depthWrite:false});line.castShadow=false;g.add(line);
  }
  for(let ribbon=0;ribbon<12;ribbon++){
    const vertices=[];
    const p=(t,side)=>{const y=.12-t*.27,x=-.23+.10*Math.sin(y*7)+(ribbon-8.5)*.0035+Math.sin(t*12+ribbon)*.004+side*.0015,z=Math.sqrt(1-x*x-y*y);return new T.Vector3(x,y,z).normalize().multiplyScalar(5.43+.20*Math.pow(1-t,2));};
    for(let k=0;k<28;k++)vertices.push(p(k/28,-1),p(k/28,1),p((k+1)/28,1),p(k/28,-1),p((k+1)/28,1),p((k+1)/28,-1));
    const strand=triMesh(vertices,ribbon%3?'#b6ccc4':'#91b0aa',{roughness:.62,metalness:.06,transparent:true,opacity:.45,depthWrite:false});strand.castShadow=false;g.add(strand);
  }
  return mergeStatic(g);
}

function unspokenAlbum(){
  const g=new T.Group();g.name='song-memory-river-moon-and-folio';
  // The same curved river runs from a warm beginning towards a cool distance.
  for(let line=0;line<3;line++){
    const points=Array.from({length:70},(_,i)=>{
      const y=.065-i/69*.94,x=-.23+.10*Math.sin(y*7)+(line-1)*.013+.008*Math.sin(i*.14);
      return new T.Vector3(x,y,Math.sqrt(Math.max(.001,1-x*x-y*y))).normalize().multiplyScalar(5.445);
    });
    const strand=tube(points,.0022,line===0?'#b8b699':'#b0c7bb',120,{roughness:.68,transparent:true,opacity:.34,depthWrite:false});strand.castShadow=false;g.add(strand);
  }
  // Moon as a thin paper-light impression in the upper margin, not a new sky.
  const moon=new T.Group();moon.position.set(2.05,3.91,4.49);moon.quaternion.setFromUnitVectors(Z,moon.position.clone().normalize());
  const moonMat=new T.MeshPhysicalMaterial({map:paperImpressionTexture(true),color:'#d0d5c6',roughness:.84,metalness:0,side:T.DoubleSide,transparent:true,opacity:.74,depthWrite:false});
  const disk=new T.Mesh(new T.CircleGeometry(.48,80),moonMat);disk.castShadow=false;moon.add(disk);
  const halo=new T.Mesh(new T.PlaneGeometry(1.75,1.75),new T.MeshBasicMaterial({map:quietHaloTexture(),transparent:true,depthWrite:false,side:T.DoubleSide}));halo.position.z=-.006;moon.add(halo);
  const broken=part(new T.TorusGeometry(.52,.002,4,80,Math.PI*.91),'#bfc9b8',[0,0,.015],{roughness:.7,transparent:true,opacity:.45});broken.rotation.z=.4;moon.add(broken);g.add(moon);
  // A quiet sheaf is tucked under the existing ruled paper and bamboo.
  // Unwritten pages, folds and a thread carry the story instead of quoted verse.
  const folio=new T.Group();folio.position.copy(at(27,-114,5.91));folio.quaternion.setFromUnitVectors(Z,folio.position.clone().normalize());folio.rotateZ(.20);
  const folioMap=poemTexture('paper');
  for(let sheet=0;sheet<3;sheet++){
    const geo=new T.PlaneGeometry(1.18,1.62,30,32),p=geo.attributes.position;
    for(let i=0;i<p.count;i++){
      const x=p.getX(i),y=p.getY(i),u=x/.59,v=y/.81;
      p.setXYZ(i,x+.012*Math.sin(v*35)*Math.abs(u)**18,y,.045*sheet+.07*u*u+.22*Math.max(0,u)**5*Math.max(0,-v)**3);
    }
    geo.computeVertexNormals();const page=part(geo,['#d8d5bd','#e3dfc9','#eae5d1'][sheet],[sheet*.039,sheet*.025,0],{map:folioMap,side:T.DoubleSide,roughness:.97});folio.add(page);
  }
  for(let i=0;i<4;i++){
    const x=-.43+i*.25;folio.add(tube([[x,-.60,.124],[x,-.08,.106],[x,.66,.124]],.0018,'#b3aaa0',15,{transparent:true,opacity:.42}));
  }
  folio.add(tube([[-.53,-.53,.13],[-.58,.02,.13],[-.51,.63,.13]],.006,'#8c8d75',30));
  for(const y of [-.45,.07,.56])folio.add(tube([[-.58,y,.12],[-.52,y+.015,.15],[-.48,y-.02,.12]],.004,'#a09d80',8));
  g.add(folio);
  g.userData.songSemantics={edition:'0.12.3',motifs:['continuous river','moonlit margin','unspoken folio'],meaning:'youthful longing carried through the same river and different readings of the past'};
  return g;
}

export function makeReferenceAccents(){
  const root=new T.Group();root.name='reference-composition-v05';
  root.add(flute(),inkstone(),envelope(),surfaceBlossoms(),banks(),silkOrbit(),waterDetail(),unspokenAlbum(),makePoemAlbum());
  root.userData.artDirection='Scalloped celadon / bamboo flute / torn letters / moss banks';
  return root;
}
