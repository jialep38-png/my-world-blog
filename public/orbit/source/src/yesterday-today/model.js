/** v0.12 — a translucent time specimen. Authored around an unflattened volume.
 * Printed fragments, attachment points and front/back passages are geometry.
 * No generated cover is projected onto the sculpture; exports use this scene.
 */
import * as T from 'three';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';
import { seededRandom } from '../math.js';
import { makeYesterdayTextures } from './textures.js';
const Z=new T.Vector3(0,0,1),Y=new T.Vector3(0,1,0),TAU=Math.PI*2;
const v=p=>new T.Vector3(...p);

export function makeYesterdayToday(){
  const root=new T.Group();root.name='YESTERDAY-TODAY';
  const groups=[],maps=makeYesterdayTextures(),random=seededRandom(26091809);
  const layer=name=>{const g=new T.Group();g.name=name;root.add(g);groups.push(g);return g;};
  const mat=o=>new T.MeshPhysicalMaterial({side:T.DoubleSide,...o});
  const pearl=mat({color:'#f2e6ef',map:maps.membrane,roughness:.24,metalness:.06,transmission:.32,thickness:.025,ior:1.29,iridescence:.57,iridescenceIOR:1.28,iridescenceThicknessRange:[210,460],clearcoat:.6,bumpMap:maps.folds,bumpScale:.012});
  const depth=mat({color:'#897896',roughness:.48,metalness:.06,bumpMap:maps.folds,bumpScale:.024});
  const violet=mat({color:'#a7a4d1',roughness:.24,metalness:.18,transmission:.28,thickness:.035,ior:1.32,iridescence:.43,clearcoat:.55,bumpMap:maps.folds,bumpScale:.011});
  const silver=mat({color:'#e8e4ec',roughness:.31,metalness:.88,bumpMap:maps.folds,bumpScale:.019});
  const white=mat({color:'#f2eaf0',roughness:.73,metalness:0});
  const lilac=mat({color:'#bba6d8',roughness:.18,transmission:.62,thickness:.025,ior:1.28,iridescence:.5,clearcoat:.58});
  const stem=mat({color:'#ad83a4',roughness:.6,metalness:.03});
  const glass=mat({color:'#faf6ff',roughness:.075,metalness:0,transmission:.94,thickness:.028,ior:1.32,iridescence:.42,clearcoat:.52,iridescenceThicknessRange:[220,420]});
  const rose=mat({color:'#e9bfd7',roughness:.17,transmission:.71,thickness:.032,ior:1.27,iridescence:.47,clearcoat:.46});
  const mistBlue=mat({color:'#b9cfed',roughness:.18,transmission:.67,thickness:.025,ior:1.28,iridescence:.48,clearcoat:.48});
  const pink=mat({color:'#ffe3ec',map:maps.petal,roughness:.64,sheen:.7,sheenColor:'#f5d5e5',sheenRoughness:.7});
  const pale=mat({color:'#fff1e8',map:maps.petal,roughness:.70,sheen:.55,sheenColor:'#e6c0d4'});
  const fiber=mat({color:'#fff1f4',roughness:.89,sheen:.8,sheenColor:'#f6dbe9'});
  const fiberDark=mat({color:'#d9b7cd',roughness:.84});
  const wire=mat({color:'#b6a2d3',metalness:.48,roughness:.34});
  const steel=mat({color:'#bfc0cc',metalness:.94,roughness:.23});
  const inkPaper=[maps.paperA,maps.paperB,maps.paperC].map(map=>mat({map,color:'#fff9f0',roughness:.95,metalness:0,bumpMap:maps.paperGrain,bumpScale:.011}));
  function mesh(geo,m,p=[0,0,0]){const o=new T.Mesh(geo,m);o.position.set(...p);o.castShadow=!(m.transmission>0||m.transparent);o.receiveShadow=true;return o;}
  const curve=(pts,closed=false)=>new T.CatmullRomCurve3(pts.map(v),closed,'catmullrom',.48);
  const tube=(path,r,m,steps=100,sides=6)=>mesh(new T.TubeGeometry(path,steps,r,sides,path.closed),m);
  function ball(p,r,m,scale=[1,1,1]){const o=mesh(new T.SphereGeometry(r,20,14),m,p);o.scale.set(...scale);return o;}
  function orient(o,normal,spin=0){o.quaternion.setFromUnitVectors(Z,v(normal).normalize());o.rotateZ(spin);return o;}

  const core=layer('01 / FOLDED PEARLESCENT MEMORY CORE');
  const cg=new T.SphereGeometry(1.94,72,48),cp=cg.attributes.position;
  for(let i=0;i<cp.count;i++){const n=new T.Vector3().fromBufferAttribute(cp,i).normalize(),r=1.91+.12*Math.sin(n.x*8+n.y*3)*Math.cos(n.z*7)+.045*Math.sin(n.y*21+n.z*11);cp.setXYZ(i,n.x*r,n.y*r*1.035,n.z*r);}
  cg.computeVertexNormals();core.add(mesh(cg,depth));
  // Core lobes enclose actual space; this thickness does not come from orbits.
  [[-.65,.88,.77,.98],[.77,.7,.65,.98],[-.82,-.63,.48,1.02],[.7,-.74,.6,.95],[-.67,.68,-.8,1.03],[.76,-.5,-.73,1.04]].forEach(([x,y,z,r],i)=>{
    const l=ball([x,y,z],r,i%3===1?violet:pearl,[1,.94,1.02]);l.rotation.set(i*.53,i*.71,i*.19);core.add(l);
  });
  // A radially wrapped, curled surface. Its edges leave the sphere and reveal
  // underlayers; tearing changes the silhouette, not just its colour map.
  function sheet(w,h,normal,radius,m,spin=0,seed=1,curl=.18){
    const geo=new T.PlaneGeometry(w,h,30,24),p=geo.attributes.position;
    for(let i=0;i<p.count;i++){let x=p.getX(i),y=p.getY(i);const u=x/w*2,t=y/h*2,edge=Math.max(Math.abs(u),Math.abs(t));
      const torn=m.transmission>0?.18:.60;
      x+=torn*Math.pow(Math.abs(t),18)*(.038*Math.sin(u*49+seed)+.018*Math.sin(u*93));
      y+=torn*Math.pow(Math.abs(u),18)*(.035*Math.sin(t*38+seed)+.013*Math.sin(t*87));
      const n=new T.Vector3(x,y,2.25).normalize();
      const fold=(m.metalness>.5?.030:.013)*Math.sin(u*12+t*5+seed)+.008*Math.sin(t*28+u*7);
      n.multiplyScalar(radius+fold+Math.pow(edge,4)*curl*(.6+.4*Math.sin(u*4+t*3+seed)));
      p.setXYZ(i,n.x,n.y,n.z);
    }geo.computeVertexNormals();return orient(mesh(geo,m),normal,spin);
  }
  const skins=layer('02 / CURVED MEMBRANES & SILVER SEAMS');
  const skinspec=[
    [2.6,1.9,[-.46,.73,.51],2.22,pearl,-.6],[2.8,1.6,[.43,.83,.19],2.21,lilac,.5],
    [1.8,2.8,[.85,.14,.45],2.22,mistBlue,-.3],[1.7,2.1,[-.84,.16,.3],2.20,pearl,.6],
    [3.0,1.6,[.2,-.85,.36],2.24,pearl,.25],[1.6,2.3,[-.57,-.58,.55],2.25,rose,-.8],
    [2.5,2.0,[.18,.65,-.8],2.24,pearl,.6],[2.1,2.3,[-.79,.12,-.59],2.21,violet,-.5],
    [2.5,2.2,[.64,-.21,-.72],2.24,pearl,.55],[2.5,1.8,[-.1,-.81,-.52],2.20,lilac,-.3],
    [1.3,2.3,[.12,.13,-1],2.27,rose,.1],[1.65,1.7,[-.47,-.71,-.62],2.30,pearl,.6],
    [1.45,1.14,[-.30,.48,.85],2.18,rose,-.4],[1.36,.68,[-.06,-.60,.82],2.18,pearl,.3]
  ];
  skinspec.forEach(([w,h,n,r,m,s],i)=>skins.add(sheet(w,h,n,r,m,s,10+i,.24)));

  function ribbon(points,width,m,twist=.6){
    const path=curve(points),rows=90,cols=6,ps=[],uv=[],ids=[];
    for(let i=0;i<=rows;i++){const t=i/rows,c=path.getPoint(t),tan=path.getTangent(t),across=new T.Vector3().crossVectors(tan,Z).normalize();across.applyAxisAngle(tan,twist*Math.sin(t*5));for(let j=0;j<=cols;j++){const u=j/cols*2-1,q=c.clone().addScaledVector(across,u*width*.5*(.45+.55*Math.sin(Math.PI*t)**.4));q.z+=u*u*.09*Math.sin(t*14)+.018*Math.sin(t*68+u*12);ps.push(...q.toArray());uv.push(j/cols,t);if(i<rows&&j<cols){const a=i*(cols+1)+j,b=a+cols+1;ids.push(a,b,a+1,b,b+1,a+1);}}}
    const g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute(ps,3));g.setAttribute('uv',new T.Float32BufferAttribute(uv,2));g.setIndex(ids);g.computeVertexNormals();return mesh(g,m);
  }
  const films=layer('03 / LUCENT FOLDS');
  films.add(ribbon([[-2.27,.6,.3],[-2.1,1.9,.75],[-.8,2.24,1.2],[.72,1.86,1.7],[1.45,.94,1.7]],.68,rose,1.9));
  films.add(ribbon([[-1.92,-.45,1.1],[-1.5,-1.8,1.85],[.02,-2.15,1.9],[1.72,-1.58,1.45],[2.04,-.63,.48]],.73,pearl,1.15));
  films.add(ribbon([[1.15,1.73,-1.3],[2.01,.85,-.6],[2.35,-.4,.22],[1.85,-1.1,1.58],[.5,-1.0,2.3]],.42,glass,1.3));
  films.add(ribbon([[-1.8,-1.5,-.25],[-1.38,-.96,-1.82],[-.12,.05,-2.47],[1.02,1.3,-1.72]],.53,glass,1.4));
  for(let i=0;i<5;i++)films.add(ribbon([[-1.8,-1.2,1.2],[-.7,-2.03-i*.03,1.5],[.95,-2.29+i*.06,.94],[1.84,-1.65,.67]],.04+i*.014,i%2?pearl:silver,.9));

  const record=layer('04 / MEMORY LENS — NO PRINTED TITLE');
  record.position.set(.17,-.035,2.05);record.rotation.set(.065,-.09,-.105);record.scale.setScalar(1.09);
  const disc=mesh(new T.CylinderGeometry(1.07,1.03,.10,100),depth);disc.rotation.x=Math.PI/2;record.add(disc);
  // The broad printed label is gone. A narrow interrupted rim holds a
  // convex coloured memory window with physical inlays underneath.
  record.add(mesh(new T.RingGeometry(.885,1.068,120,1,.06,Math.PI*1.72),violet,[0,0,.058]));
  for(let i=0;i<6;i++)record.add(mesh(new T.TorusGeometry(.928+i*.019,.0015,3,100,Math.PI*1.55),i%3?steel:pearl,[0,0,.064]));
  const memoryMat=mat({map:maps.memory,color:'#fff5ff',roughness:.79,metalness:0,clearcoat:.10});
  record.add(mesh(new T.CircleGeometry(.894,112),memoryMat,[0,0,.073]));
  function inlay(w,h,p,angle,m,curl=.08){
    const geo=new T.PlaneGeometry(w,h,18,12),a=geo.attributes.position;
    for(let i=0;i<a.count;i++){const x=a.getX(i),y=a.getY(i),u=x/w*2,t=y/h*2;
      a.setXYZ(i,x+Math.pow(Math.abs(t),18)*.012*Math.sin(u*34),y+Math.pow(Math.abs(u),18)*.014*Math.sin(t*29),curl*(u*u*.65+t*t*.24)+.009*Math.sin(u*8+t*5));}
    geo.computeVertexNormals();const o=mesh(geo,m,p);o.rotation.z=angle;return o;
  }
  record.add(inlay(.26,.53,[-.55,.02,.095],-.37,inkPaper[1],.045));
  record.add(inlay(.74,.33,[.10,-.49,.104],.24,memoryMat,.07));
  const lensMat=mat({side:T.FrontSide,color:'#fff9fc',roughness:.025,metalness:0,transmission:.97,thickness:.035,ior:1.18,clearcoat:.25,iridescence:.18,iridescenceThicknessRange:[170,390]});
  const optical=mesh(new T.SphereGeometry(.91,64,40),lensMat,[.02,.012,.165]);optical.scale.z=.115;record.add(optical);
  record.add(mesh(new T.TorusGeometry(.91,.013,8,112,Math.PI*1.58),steel,[.02,.012,.12]));
  const arc=mesh(new T.TorusGeometry(.954,.019,7,100,Math.PI*.56),glass,[.018,.0,.118]);arc.rotation.z=3.75;record.add(arc);
  // Torn emulsion and a silver hinge overlap the rim, embedding the lens.
  record.add(inlay(.34,.64,[-.76,.36,.20],-.51,inkPaper[0],.12));
  record.add(inlay(.52,.22,[.54,-.57,.22],.38,pearl,.16));
  record.add(inlay(.15,.32,[.74,-.48,.21],.32,silver,.06));
  // Keep the optical centre uninterrupted: attachment points live on the rim.
  record.add(ball([-.63,.61,.208],.021,steel,[1,1,.54]));
  record.add(ball([.49,-.50,.255],.045,rose,[.86,1.13,.67]));
  // v0.12.1 / a quiet conservation edge, confined to the existing lens.
  // Keep the botanical exposure, optical material and clear centre unchanged.
  // No seeded random calls here: every other authored layer stays identical.
  const etching=mat({color:'#eee5f2',roughness:.46,metalness:.18,
    transmission:.12,thickness:.003,ior:1.24,iridescence:.28,clearcoat:.24});
  for(const [r,start,sweep,z] of [[.850,.18,1.10,.207],[.865,.40,.43,.203],[.850,1.48,.24,.207]]){
    const trace=mesh(new T.TorusGeometry(r,.0018,5,64,sweep),etching,[.02,.012,z]);
    trace.rotation.z=start;trace.castShadow=false;record.add(trace);
  }
  // A short, open crescent of seed pearls; deliberately not a full necklace.
  for(let i=0;i<15;i++){
    const a=.27+i*.070,r=.882,size=.0057+.0011*Math.sin(i*.86)**2;
    const bead=ball([.02+Math.cos(a)*r,.012+Math.sin(a)*r,.198],size,pearl,[1,1,.65]);
    bead.castShadow=false;record.add(bead);
  }
  // Two almost-clear sleeve keepers cross the rim, with tiny silver pinheads.
  for(const a of [.11,1.31]){
    const x=.02+Math.cos(a)*.928,y=.012+Math.sin(a)*.928;
    const keeper=inlay(.052,.118,[x,y,.218],a-Math.PI/2,glass,.016);
    keeper.castShadow=false;record.add(keeper);
    record.add(ball([.02+Math.cos(a)*.968,.012+Math.sin(a)*.968,.226],.009,steel,[1,1,.43]));
  }
  record.userData.refinement={edition:'0.12.1',etchedArcs:3,microPearls:15,
    clearKeepers:2,zone:'rim only; botanical centre unchanged',hasText:false};
  // The first visual review rejected a broad, flat C-shaped frame. A narrow
  // bent bridge now connects two folds without becoming a second front plate.
  films.add(ribbon([[-1.34,1.15,1.60],[-.72,1.46,2.13],[.10,1.31,2.30],[.66,.73,2.09]],.12,lilac,1.3));
  films.add(ribbon([[1.15,.39,2.0],[1.31,-.03,1.93],[1.28,-.48,1.76]],.073,silver,.4));
  films.add(ribbon([[-1.0,.81,1.9],[-.65,.62,2.25],[-.56,.14,2.41],[-.04,-.81,2.28],[.79,-1.01,1.85]],.105,glass,1.35));
  films.add(ribbon([[.98,1.10,1.70],[1.24,.73,2.04],[1.32,.12,2.07],[1.05,-.32,2.02]],.24,glass,.9));

  // The former corrugated device is completely absent. Three continuous,
  // thin sheets cross at different depths; small folds replace heavy fittings.
  const wraps=layer('05 / LILAC CELLOPHANE — RECTO TO VERSO');
  wraps.add(ribbon([[-1.1,1.16,-1.80],[-1.0,2.18,-.73],[-.63,2.43,.70],[.3,2.08,1.70],[1.35,1.46,1.98],[2.18,.52,1.24],[2.30,-.52,.14],[1.72,-1.54,-.86],[.44,-2.06,-1.04]],.34,lilac,2.8));
  wraps.add(ribbon([[-1.45,1.73,.52],[-.28,2.54,1.13],[1.23,2.32,.43],[2.37,1.12,.72],[2.36,-.16,1.33],[1.60,-1.15,1.77],[.71,-1.48,1.56]],.19,mistBlue,3.3));
  wraps.add(ribbon([[-2.1,.48,-1.1],[-2.47,-.51,.32],[-1.42,-1.18,2.28],[.46,-1.39,2.39],[1.64,-.79,1.88],[2.22,.38,.8]],.14,rose,2.0));
  wraps.add(ribbon([[-2.48,.31,1.07],[-2.57,1.44,.59],[-1.59,2.10,1.04],[-.71,1.75,1.91]],.22,glass,3.7));
  wraps.add(tube(curve([[-2.24,-.79,.33],[-1.6,-1.54,2.03],[.30,-1.53,2.45],[1.64,-.69,1.98]]),.006,wire,120,5));

  const orbits=layer('06 / ORBITAL ATTACHMENTS');
  const paths=[
    curve([[-2.53,1.42,.12],[-1.32,2.71,.63],[.7,2.65,-.58],[2.38,1.27,-1.16],[2.65,-.62,.02],[.47,-2.53,1.68],[-1.79,-1.86,1.73],[-2.70,.21,1.25]],true),
    curve([[-2.58,-1.37,.05],[-2.16,-.04,1.89],[-.69,1.55,2.05],[1.22,2.50,.64],[2.29,1.20,-1.31],[1.14,-1.71,-2.12],[-.63,-2.58,-.71]],true),
    curve([[-2.36,.50,-1.13],[-1.55,-.33,-2.23],[.89,.43,-2.40],[2.54,.50,-.43],[2.14,-.32,1.83],[.28,-.87,2.55],[-1.88,-.24,1.89]],true)
  ];
  paths.forEach((p,i)=>orbits.add(tube(p,i===0?.009:.006,i===1?steel:wire,180,5)));
  for(const [index,t] of [[0,.02],[0,.40],[0,.71],[1,.18],[1,.57],[2,.23],[2,.82]]){const point=paths[index].getPoint(t);orbits.add(ball(point.toArray(),.052,steel));const clasp=mesh(new T.TorusGeometry(.068,.009,5,20),steel,point.toArray());orient(clasp,paths[index].getTangent(t).toArray());orbits.add(clasp);}

  const lenses=layer('07 / GLASS MEMORY WINDOWS');
  [[-1.05,2.27,1.12,.42,-.32],[-2.35,.74,1.13,.38,-.52],[1.91,-.87,1.5,.38,.42],[-1.81,-1.92,.89,.47,.44],[.71,2.45,-.78,.36,.8],[-1.76,.95,-1.76,.38,-.3]].forEach(([x,y,z,r,a],i)=>{
    const lens=new T.Group();lens.position.set(x,y,z);lens.rotation.set(.2,a,a*.57);lens.add(ball([0,0,0],r,i%3?glass:rose,[1,1.14,.16]));lens.add(mesh(new T.TorusGeometry(r,.006,5,68),steel));lens.add(ball([0,-r,.005],.04,steel));lenses.add(lens);
  });

  const nearLens=new T.Group();nearLens.position.set(-1.13,.92,2.04);nearLens.rotation.set(.16,.36,-.32);
  nearLens.add(ball([0,0,0],.31,mistBlue,[1,1.12,.10]));nearLens.add(mesh(new T.TorusGeometry(.31,.004,5,64),pearl));lenses.add(nearLens);
  // Small translucent contact sheets continue the colour across the outline.
  [[-2.36,1.47,.50,.24],[-1.75,2.12,1.02,.31],[-2.49,-.77,1.09,.32],[-1.89,-2.11,.96,.25],[1.67,1.91,.85,.26],[2.47,.58,.88,.31],[2.26,-1.32,.89,.21],[.22,2.40,1.20,.27],[1.43,-2.03,1.25,.20]].forEach(([x,y,z,r],i)=>{
    const disk=ball([x,y,z],r,[rose,mistBlue,glass,lilac][i%4],[1,1+(i%3)*.11,.075]);
    disk.rotation.set(.16+i*.17,(i%2?1:-1)*.38,i*.71);lenses.add(disk);
  });

  const blooms=layer('08 / BLOSSOMS THROUGH THE SEAM');
  function petal(length,width,seed){const p=[],uv=[],idx=[],rows=18,cols=10;for(let i=0;i<=rows;i++)for(let j=0;j<=cols;j++){const t=i/rows,u=j/cols*2-1,w=width*Math.pow(Math.sin(Math.PI*t),.58)*(1+.06*Math.sin(t*12+seed)),z=length*(.23*Math.sin(t*2.8)+u*u*.16*Math.sin(t*Math.PI))+.006*length*Math.sin(t*18+u*3+seed);p.push(u*w,t*length,z);uv.push(j/cols,t);if(i<rows&&j<cols){const a=i*(cols+1)+j,b=a+cols+1;idx.push(a,b,a+1,b,b+1,a+1);}}const g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute(p,3));g.setAttribute('uv',new T.Float32BufferAttribute(uv,2));g.setIndex(idx);g.computeVertexNormals();return g;}
  const pg=petal(.39,.18,91);
  [[-1.08,.92,1.86,.85],[-1.55,.56,1.60,.75],[-1.27,.15,1.97,1.06],[-1.63,-.14,1.67,.63],[-1.02,-.42,2.11,.68],[-.83,-1.17,1.85,.70],[-1.39,1.23,1.33,.56],[-1.97,.80,.76,.54],[-.76,-.71,-2.12,.78],[-1.16,-.25,-1.88,.63],[-.48,-.91,2.16,.69],[-.66,-.59,2.21,.49],[.96,-.80,1.96,.44]].forEach(([x,y,z,s],i)=>{
    const flower=new T.Group();flower.position.set(x,y,z);flower.scale.setScalar(s);orient(flower,[x*.19,y*.18,z>0?1:-1],i*1.67);
    for(let k=0;k<7;k++){const p=mesh(pg,i%3?pink:pale);p.rotation.set((random()-.5)*.38,0,k*TAU/7);flower.add(p);}
    for(let k=0;k<7;k++){const a=k*TAU/7;flower.add(ball([Math.cos(a)*.05,Math.sin(a)*.05,.10+random()*.025],.014,white));}
    const anchor=v([x*.82,y*.86,z*.86]);blooms.add(tube(new T.QuadraticBezierCurve3(anchor,anchor.clone().lerp(flower.position,.6).add(v([-.05,.08,.07])),flower.position),.010,stem,20,5));blooms.add(flower);
  });
  for(const [p,s,a] of [[[-1.96,1.07,1.16],.54,.8],[[.88,-1.82,1.39],.46,-.5],[[-2.32,-.29,.94],.42,-.8]]){const o=mesh(pg,pale,p);o.scale.setScalar(s);o.rotation.set(.6,.3,a);blooms.add(o);}

  const feathers=layer('09 / SOFT FEATHER CODA');
  function plume(pts,width,count){const spine=curve(pts);feathers.add(tube(spine,.010,fiberDark,72,5));for(let i=2;i<count;i++){const t=i/count,center=spine.getPoint(t),tan=spine.getTangent(t),normal=new T.Vector3().crossVectors(tan,Z).normalize(),w=width*Math.sin(t*Math.PI)**.72;for(const sign of [-1,1]){const len=w*(.65+random()*.43),end=center.clone().addScaledVector(normal,sign*len).addScaledVector(tan,.36*len);end.z+=.10*Math.sin(t*9+sign)+(random()-.5)*.04;const mid=center.clone().lerp(end,.57).addScaledVector(tan,-len*.11);feathers.add(tube(new T.QuadraticBezierCurve3(center,mid,end),.0021+random()*.0017,i%9?fiber:fiberDark,10,3));if(i%2===0){const tip=end.clone().addScaledVector(tan,.06+random()*.09);feathers.add(tube(new T.QuadraticBezierCurve3(center.clone().lerp(end,.3),end,tip),.0018,fiber,7,3));}}}}
  plume([[-1.18,-1.29,1.76],[-.77,-1.91,2.0],[.47,-2.27,1.95],[1.65,-2.18,1.36],[2.35,-2.35,.74]],.41,135);
  plume([[-1.65,1.28,1.21],[-.88,1.79,1.98],[.03,1.84,2.10],[.88,1.57,1.77]],.21,90);
  plume([[.39,-1.69,-1.55],[.99,-.91,-2.17],[1.12,.05,-2.04],[.90,.70,-1.95]],.24,80);

  const details=layer('10 / PEARLS & FIXINGS');
  [[-1.93,-1.1,1.14,.15],[-.66,1.77,1.55,.11],[1.07,-1.57,1.72,.17],[1.72,.86,1.40,.12],[-2.01,1.30,.76,.11],[.51,.91,-2.28,.13],[-1.83,-.68,-1.4,.12]].forEach(([x,y,z,r],i)=>details.add(ball([x,y,z],r,i%3===0?rose:i%3===1?pearl:glass)));
  for(const [p,r,m] of [[[1.47,-.69,1.88],.055,rose],[[-1.7,1.96,.85],.055,violet],[[.06,-2.1,-1.36],.065,lilac]])details.add(ball(p,r,m));
  const papers=layer('11 / PRINTED MEMORY — RECTO & VERSO');
  const paperSpec=[
    [1.48,1.20,[-.69,.42,.7],2.35,-.40,0],[1.26,1.64,[-.82,-.40,.51],2.37,.38,1],
    [1.27,.88,[.68,.51,.67],2.40,.40,2],[1.10,1.5,[.77,-.40,.42],2.40,-.38,0],
    [1.34,1.05,[.07,-.77,.7],2.40,.2,1],[1.12,1.02,[-.36,.90,.20],2.31,-.5,1],
    [1.34,.83,[-.13,.53,.84],2.25,.16,2],
    [.73,1.04,[-.63,.32,.77],2.46,-.68,1],[.93,.52,[.62,-.55,.60],2.45,.65,2],
    [.72,.47,[.82,.24,.52],2.44,-.22,0],
    [1.52,1.58,[-.44,.43,-.81],2.41,-.35,0],[1.50,1.15,[.45,.50,-.74],2.39,.3,1],
    [1.31,1.75,[.36,-.49,-.8],2.42,-.3,2],[1.20,1.2,[-.6,-.41,-.72],2.38,.25,1]
  ];
  paperSpec.forEach(([w,h,n,r,s,k],i)=>{
    const scale=n[2]>0?.68:.86;
    const backing=sheet(w*scale+.012,h*scale+.012,n,r-.010,white,s,310+i,.18);papers.add(backing);
    papers.add(sheet(w*scale,h*scale,n,r,inkPaper[k],s,310+i,.18));
    // Small wire staples actually bridge paper and substrate.
    const pin=orient(new T.Group(),n,s);pin.add(tube(curve([[-w*.25,h*.28,r-.08],[-w*.25,h*.28,r+.05],[-w*.12,h*.28,r+.07],[-w*.12,h*.28,r-.08]]),.009,steel,20,5));papers.add(pin);
  });
  // Back has a distinct open seam and an inset glass window, not another label.
  papers.add(tube(curve([[-.47,.43,-2.18],[-.33,.66,-2.37],[.16,.54,-2.46],[.31,.05,-2.34]]),.015,steel,70,7));

  const florets=layer('12 / PRESSED HYDRANGEA — UNEQUAL CLUSTERS');
  const smallPetal=petal(.21,.088,317);
  // Five unequal clusters: the left seam carries the main bloom; the right
  // and back carry quieter echoes rather than an evenly decorated wreath.
  [[-1.30,.87,2.05,12,.40],[-1.51,-.48,1.91,8,.31],[-.68,-1.35,2.0,6,.25],[1.53,-.37,1.70,5,.22],[-.87,.45,-2.1,7,.31]].forEach(([x,y,z,n,spread],cluster)=>{
    for(let i=0;i<n;i++){
      const a=i*2.399+cluster*.73,r=spread*Math.sqrt((i+.4)/n),f=new T.Group();
      f.position.set(x+Math.cos(a)*r,y+Math.sin(a)*r,z+(random()-.3)*.19);
      f.scale.setScalar(.55+random()*.46);orient(f,[x*.12,y*.13,z>0?1:-1],a);
      for(let k=0;k<5;k++){const p=mesh(smallPetal,(i+cluster)%4===0?pale:pink);p.rotation.set(.05+random()*.18,0,k*TAU/5+.1*random());p.scale.set(1,.90+random()*.18,1);f.add(p);}
      f.add(ball([0,0,.045],.016,pearl));florets.add(f);
    }
  });

  const sleeves=layer('13 / OVERLAPPING ARCHIVAL SLEEVES');
  sleeves.add(ribbon([[-1.98,1.33,.75],[-1.46,1.70,1.86],[-.51,1.56,2.41],[.23,1.10,2.39],[.96,.87,2.17]],.31,glass,2.5));
  sleeves.add(ribbon([[.77,1.12,1.92],[1.44,.99,2.04],[1.82,.10,1.92],[1.37,-.77,2.16],[.37,-1.12,2.45]],.37,mistBlue,2.7));
  sleeves.add(ribbon([[-2.13,-.86,.87],[-1.09,-1.50,2.15],[.01,-1.55,2.46],[1.05,-1.16,2.31]],.23,rose,3.1));
  sleeves.add(ribbon([[-.52,1.61,-1.84],[.62,1.38,-2.14],[1.38,.49,-2.09],[.96,-.57,-2.24]],.32,lilac,2.4));
  for(const [x,y,z,a] of [[-1.91,-1.04,1.44,.7],[1.80,.64,1.48,-.5],[.63,1.93,1.09,.3]]){
    const tab=inlay(.23,.38,[x,y,z],a,inkPaper[2],.10);sleeves.add(tab);
    sleeves.add(ball([x,y+.13,z+.12],.025,steel));
  }

  const dust=layer('14 / PEARL TRACES & FEATHER VEILS');
  for(let i=0;i<58;i++){
    const a=i*2.399,r=1.77+random()*.79;
    const p=[Math.cos(a)*r,Math.sin(a)*r*.94,(i%4===0?-1:1)*(.72+random()*.94)];
    dust.add(ball(p,.018+random()*.027,[pearl,rose,glass,mistBlue][i%4],[1,1.1,1]));
  }
  const vaneMat=mat({color:'#fff6fc',map:maps.feather,transparent:true,opacity:.49,depthWrite:false,alphaTest:.015,roughness:.88,sheen:.65,sheenColor:'#f8e5f0'});
  function featherVeil(pts,width){
    const o=ribbon(pts,width,vaneMat,1.05);o.castShadow=false;dust.add(o);
  }
  featherVeil([[-1.48,-1.48,1.75],[-.70,-2.01,2.03],[.54,-2.24,2.05],[1.67,-2.17,1.50],[2.33,-2.32,.8]],.62);
  featherVeil([[-1.72,1.30,1.24],[-.93,1.77,1.96],[.03,1.86,2.12],[.90,1.60,1.79]],.36);

  // v0.12.3 / two returning paths almost meet at the lens's lower edge.
  // The remaining air is intentional. Do not bridge it or mark the clear centre.
  const duskRose=mat({color:'#e8c4ba',roughness:.32,transmission:.63,thickness:.018,ior:1.26,iridescence:.22,clearcoat:.35});
  const nearA=[[-2.12,-.73,1.43],[-1.49,-1.28,2.18],[-.57,-1.20,2.49],[.05,-.99,2.52],[.13,-.91,2.50]];
  const nearB=[[2.16,-.31,1.42],[1.50,-1.08,2.17],[.76,-1.19,2.46],[.31,-1.01,2.51],[.22,-.90,2.50]];
  sleeves.add(ribbon(nearA,.12,duskRose,1.05),ribbon(nearB,.105,mistBlue,1.15));
  sleeves.add(tube(curve(nearA),.0038,pearl,70,4),tube(curve(nearB),.0033,glass,70,4));
  sleeves.userData.songGesture={edition:'0.12.3',gesture:'two returning paths, separated by a breath',gap:.09};
  // Autumn is a few translucent impressions caught by the evening air.
  // Leaf veins and warm emulsion belong to the sleeve, not a literal street set.
  const autumn=mat({color:'#cfad93',roughness:.61,transmission:.37,thickness:.008,ior:1.24,sheen:.4});
  for(const [x,y,z,s,a] of [[-.68,-1.53,2.43,.71,-.72],[.52,-1.75,2.25,.53,.63],[1.13,1.38,2.02,.46,-.57]]){
    const leaf=new T.Group();leaf.position.set(x,y,z);leaf.rotation.set(.15,-.14,a);leaf.scale.setScalar(s);
    leaf.add(mesh(petal(.41,.095,123),autumn));
    leaf.add(tube(curve([[0,0,.008],[0,.20,.08],[0,.39,.048]]),.003,stem,18,4));
    for(let i=1;i<5;i++)for(const sign of [-1,1])leaf.add(tube(curve([[0,.055*i,.06],[sign*.031,.055*i+.035,.084],[sign*.071,.055*i+.055,.08]]),.0018,pearl,8,3));
    dust.add(leaf);
  }
  // Overlapping, unlettered message slips ride one wind direction above the rim.
  for(let i=0;i<4;i++){
    const slip=inlay(.17+i*.025,.30,[1.00+i*.14,1.22+i*.11,2.23-i*.09],-.32+i*.13,i%2?glass:duskRose,.075);
    sleeves.add(slip);
  }

  // Merge within an authored layer, retaining physically distinct materials.
  root.updateMatrixWorld(true);const originals=new Set();
  for(const g of groups){const inv=g.matrixWorld.clone().invert(),buckets=new Map();g.traverse(o=>{if(!o.isMesh)return;originals.add(o.geometry);const geo=o.geometry.clone();geo.applyMatrix4(inv.clone().multiply(o.matrixWorld));if(!geo.index)geo.setIndex(Array.from({length:geo.attributes.position.count},(_,i)=>i));if(!geo.attributes.uv)geo.setAttribute('uv',new T.Float32BufferAttribute(new Float32Array(geo.attributes.position.count*2),2));const key=o.material.uuid;if(!buckets.has(key))buckets.set(key,{m:o.material,geos:[]});buckets.get(key).geos.push(geo);});g.clear();for(const {m,geos} of buckets.values()){const merged=mergeGeometries(geos,false);geos.forEach(g=>g.dispose());if(!merged)throw new Error('Artwork geometry merge failed');g.add(mesh(merged,m));}}
  originals.forEach(g=>g.dispose());
  const positions=groups.map(g=>g.position.clone());
  root.userData={title:'昨天，今天',english:'Yesterday, Today',version:'0.12.3',layers:groups.length,coreAxes:[3.88,4.01,3.88],labelRadius:.894*1.09,centerTreatment:'text-free memory lens',centerHasText:false,wrapTreatment:'thin lilac and blue cellophane; no corrugated hose',songSemantics:'Nearly meeting return paths; evening warmth, translucent autumn impressions and unlettered message slips. Longing to approach again.',provenance:'Original botanical memory exposure under convex glass; unequal hydrangea clusters, translucent sleeves and feather veils. Outer page title retained. No reference pixels, artist credits, watermark or font file.'};
  return {root,groups,setSeparated(value){const t=T.MathUtils.clamp(Number(value),0,1);groups.forEach((g,i)=>{g.position.copy(positions[i]);if(i){g.position.z+=(i%2?1:-1)*(.11+i*.023)*t;g.position.x+=(i%3-1)*.07*t;}});},dispose(){const gs=new Set(),ms=new Set(),ts=new Set(Object.values(maps));root.traverse(o=>{if(o.geometry)gs.add(o.geometry);if(o.material)ms.add(o.material);});gs.forEach(g=>g.dispose());ms.forEach(m=>m.dispose());ts.forEach(t=>t.dispose());}};
}
