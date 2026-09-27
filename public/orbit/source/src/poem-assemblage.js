/** Open folio edition: an irregular support, released paper and folded cloth.
 * All relief, free edges and voids are geometry shared by the live view and GLB.
 */
import * as T from 'three';
import {poemTexture} from './poem-reliquary.js';
const Z=new T.Vector3(0,0,1);

/** Radial shaping keeps the existing geodesic garden and its objects aligned. */
export function assemblageRadius(n,r){
  // The planet is spherical again. Irregularity belongs to the surface
  // collage, not unequal global axes or deep scoops through the body.
  // This exact radial function also locates the traveller and all landmarks.
  const relief=.045*Math.sin(n.x*4.7+n.y*2.3)*Math.cos(n.z*3.2-n.y);
  const inset=Math.max(0,Math.min(1,(5.94-r)/.47));
  return r+relief-.035*inset;
}

/** Bake the nonlinear support into existing meshes, leaving their UVs intact. */
export function openAssemblage(root){
  root.updateMatrixWorld(true);const inverseRoot=root.matrixWorld.clone().invert();
  const originalGeometries=new Set(),mapped=new Map(),v=new T.Vector3(),n=new T.Vector3();
  root.traverse(o=>{
    if(!o.isMesh)return;
    const transform=inverseRoot.clone().multiply(o.matrixWorld),inverse=transform.clone().invert();
    // Merged flora shares buffers. Clone per transform, not once per material.
    const key=o.geometry.uuid+':'+transform.elements.map(x=>x.toFixed(7)).join(',');
    if(mapped.has(key)){o.geometry=mapped.get(key);return;}
    const old=o.geometry,geo=old.clone(),p=geo.attributes.position;originalGeometries.add(old);
    for(let i=0;i<p.count;i++){
      v.fromBufferAttribute(p,i).applyMatrix4(transform);const r=v.length();
      if(r>.001){n.copy(v).multiplyScalar(1/r);v.multiplyScalar(assemblageRadius(n,r)/r);}
      v.applyMatrix4(inverse);p.setXYZ(i,v.x,v.y,v.z);
    }
    p.needsUpdate=true;geo.computeVertexNormals();geo.computeBoundingBox();geo.computeBoundingSphere();
    o.geometry=geo;mapped.set(key,geo);
  });
  // Original geometries may still belong to templates used outside this root.
  // Do not dispose shared template buffers while the garden builds landmarks.
  root.name='poem-rounded-material-planet';root.userData.silhouette='equal-axis spherical body with shallow paper, river and stone relief';root.userData.bodyAxes=[1,1,1];
  return root;
}
const paper=new T.MeshStandardMaterial({color:'#f4edda',map:poemTexture('paper'),bumpMap:poemTexture('paper'),bumpScale:.023,roughness:.94,side:T.DoubleSide});
const verso=new T.MeshStandardMaterial({color:'#cfc8af',map:poemTexture('paper'),roughness:.97,side:T.DoubleSide});
const silk=new T.MeshStandardMaterial({color:'#dce0d7',map:poemTexture('silver'),bumpMap:poemTexture('silver'),bumpScale:.022,metalness:.24,roughness:.61,side:T.DoubleSide});
const blue=new T.MeshStandardMaterial({color:'#a6bcb7',map:poemTexture('indigo'),bumpMap:poemTexture('indigo'),bumpScale:.016,metalness:.09,roughness:.77,side:T.DoubleSide});
function line(points,r,color,metalness=0){
  const geometry=new T.TubeGeometry(new T.CatmullRomCurve3(points),Math.max(24,points.length*3),r,5,false);
  const m=new T.Mesh(geometry,new T.MeshStandardMaterial({color,roughness:.65,metalness}));m.castShadow=true;return m;
}
function folio({name,at,rotation,width,height,lift,leaves=3,lean=.3,ink=false}){
  const group=new T.Group();group.name=name;group.position.set(...at);group.rotation.set(...rotation);
  // Hinged at a narrow root, sheets fan away from one another towards the edge.
  function point(u,t,k){
    const spread=k*.18,edge=Math.abs(u)**16;
    const x=u*width*.5+lean*t*t+k*(.075+.28*t*t)+.024*Math.sin(t*83+k)*edge;
    const y=height*t+k*.19+.018*Math.sin(u*61+k)*Math.max(t**20,(1-t)**20)+t**14*(.10*Math.sin(u*5.1)-.25*Math.max(0,u-.42));
    const z=lift*t*t*(.60+k*.43)+.10*Math.sin(u*4.2+t*2+k*.2)+spread
      +.38*Math.max(0,u)**5*t**5-.07*u*u;
    return new T.Vector3(x,y,z);
  }
  for(let k=0;k<leaves;k++){
    const geo=new T.PlaneGeometry(width,height,40,64),p=geo.attributes.position;
    for(let i=0;i<p.count;i++){const u=p.getX(i)/(width*.5),t=p.getY(i)/height+.5;const q=point(u,t,k);p.setXYZ(i,q.x,q.y,q.z);}
    geo.computeVertexNormals();const mat=k===leaves-1?(ink?new T.MeshStandardMaterial({color:'#e4e2cf',map:poemTexture('inkwash'),roughness:.97,side:T.DoubleSide}):paper):verso;
    const page=new T.Mesh(geo,mat);page.castShadow=page.receiveShadow=true;group.add(page);
    for(const sign of [-1,1])group.add(line(Array.from({length:45},(_,i)=>point(sign,i/44,k)),.009,k===leaves-1?'#e7dfc8':'#aea68b'));
    group.add(line(Array.from({length:41},(_,i)=>point(-1+i/20,1,k)),.008,'#c7c1a9'));
    // Very faint vermilion rules are on the released page itself.
    if(k===leaves-1)for(const u of [-.63,-.26,.12,.50]){
      const rule=line(Array.from({length:36},(_,i)=>point(u,.09+i/35*.82,k).add(new T.Vector3(0,0,.008))),.0024,'#b78574');rule.castShadow=false;group.add(rule);
    }
  }
  for(let stitch=0;stitch<5;stitch++){
    const x=(stitch-2)*width*.15;group.add(line([new T.Vector3(x-.04,.18,-.025),new T.Vector3(x-.07,.12,.44),new T.Vector3(x+.035,.20,.47),new T.Vector3(x+.05,.25,-.025)],.012,'#837c63'));
  }
  group.add(line([new T.Vector3(-width*.4,.19,.25),new T.Vector3(-width*.65,-.1,.32),new T.Vector3(-width*.75,-.56,.58),new T.Vector3(-width*.61,-.79,.65)],.009,'#b09b70'));
  group.userData={freeLeaves:leaves,hinge:'actual stitched root',edgeGap:leaves*.135};return group;
}
function drape(name,points,width,material){
  const g=new T.Group();g.name=name;
  const curve=new T.CatmullRomCurve3(points.map(p=>new T.Vector3(...p))),geo=new T.PlaneGeometry(2,1,36,110),p=geo.attributes.position;
  const sample=(u,t)=>{
    const center=curve.getPoint(t),tangent=curve.getTangent(t),side=new T.Vector3().crossVectors(tangent,Z).normalize();
    const w=width*(.53+.40*Math.sin(Math.PI*(.12+t*.78))+.07*Math.sin(t*27));
    const fold=.22*Math.abs(Math.sin(u*3.8+t*5+Math.sin(t*11)*.4))+.13*Math.sin(t*14+u*5)*u;
    return center.addScaledVector(side,u*w*.5).add(new T.Vector3(.025*Math.sin(t*71)*Math.abs(u)**12,0,fold));
  };
  for(let i=0;i<p.count;i++){const q=sample(p.getX(i),p.getY(i)+.5);p.setXYZ(i,q.x,q.y,q.z);}
  geo.computeVertexNormals();const fabric=new T.Mesh(geo,material);fabric.castShadow=fabric.receiveShadow=true;g.add(fabric);
  for(const sign of [-1,1])g.add(line(Array.from({length:81},(_,i)=>sample(sign,i/80)),.007,'#a4b4a8',.5));
  for(let i=0;i<14;i++){
    const u=-.95+i*.146,tip=sample(u,1);g.add(line([tip,tip.clone().add(new T.Vector3(.03,-.12,.02)),tip.clone().add(new T.Vector3(.05,-.20-(i%4)*.02,-.03))],.003,'#c0c9bb',.25));
  }
  return g;
}
export function makeReleasedFolios(){
  const root=new T.Group();root.name='released-folios-and-falling-cloth';
  root.add(folio({name:'front-unbound-letter',at:[2.01,1.22,3.48],rotation:[-.23,-.51,-.56],width:2.46,height:3.40,lift:.88,leaves:3,lean:.40}));
  root.add(folio({name:'upper-inkwash-offcut',at:[-1.72,2.61,2.44],rotation:[-.30,.51,.72],width:1.58,height:2.45,lift:.68,leaves:2,lean:-.23,ink:true}));
  root.add(folio({name:'verso-open-study-pages',at:[-1.88,.38,-3.43],rotation:[.10,Math.PI-.21,.35],width:2.60,height:3.77,lift:.9,leaves:3,lean:-.22}));
  root.add(folio({name:'lower-loose-offcut',at:[2.85,-2.48,2.60],rotation:[.33,.50,2.18],width:1.55,height:1.81,lift:.64,leaves:2,lean:.22}));
  root.add(drape('left-silver-cascade',[[-3.1,2.1,2.8],[-4.3,1.2,3.7],[-4.92,.1,3.4],[-4.41,-1.3,3.9],[-4.82,-2.8,2.8],[-3.24,-3.62,3.2]],1.50,silk));
  root.add(drape('rear-indigo-released-edge',[[3.03,2.4,-2.9],[4.51,1.41,-2.09],[5.02,-.31,-1.71],[4.55,-2.47,-2.36],[3.59,-3.14,-3.03]],1.36,blue));
  // One narrow loose strip joins the base to the foreground; no enclosing hoop.
  root.add(drape('silver-turn-under-the-river',[[-.3,-3.58,3.7],[.41,-4.28,4.0],[2.11,-4.92,3.0],[3.65,-4.39,1.6]],.55,silk));
  // Keep the existing ten loose sheets, but shorten their protrusions and
  // seat the hinges against the round body. Avoid turning its outline into
  // an upright stack of pages. The paper geometry itself remains unflattened.
  for(const group of root.children){
    if(group.userData.freeLeaves){
      group.position.normalize().multiplyScalar(5.20);
      group.scale.setScalar(group.name==='front-unbound-letter'?.60:.64);
    }else{
      // The existing drapes were authored around the compressed body. Seat
      // each vertex on the spherical shoulder without anisotropic scaling.
      group.traverse(o=>{if(!o.isMesh)return;const geo=o.geometry.clone(),p=geo.attributes.position,q=new T.Vector3();
        for(let i=0;i<p.count;i++){q.fromBufferAttribute(p,i);const r=q.length();q.multiplyScalar((5.64+.15*Math.tanh((r-5.7)*1.4))/r);p.setXYZ(i,q.x,q.y,q.z);}
        o.geometry.dispose();o.geometry=geo;geo.computeVertexNormals();geo.computeBoundingBox();geo.computeBoundingSphere();
      });
    }
  }
  root.userData={edition:'0.21.0',freeLeaves:10,detachedDrapes:3,structure:'short raised margins over a round planet, rather than oversized protrusions or an ellipsoid'};
  return root;
}
