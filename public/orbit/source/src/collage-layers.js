/** Curved, layered physical collage. Generated imagery is used only as material texture. */
import * as T from 'three';
import { fromLatLon, seededRandom } from './math.js';
import { part, ball, mergeStatic } from './garden-models.js';
const R=5.4,Z=new T.Vector3(0,0,1),atlasUrl=new URL('../assets/textures/collage-atlas.webp',import.meta.url).href;
// Composed folios on every hemisphere. The rear is a second composition, not filler.
const FOLIOS=[
  [18,69,3.80,3.92,-.27],[20,127,2.16,2.98,.26],[-33,52,2.52,2.76,-.36],
  [27,-115,3.66,3.55,.20],[-31,-73,3.22,2.85,-.32],[22,-48,2.14,3.18,-.39],
  [-15,176,2.57,3.25,.31],[14,9,2.67,3.11,-.23],[-47,133,2.55,2.16,.45],
  [62,52,2.68,2.10,.22],[-61,-147,2.70,2.18,-.24]
];
const supportLayers=FOLIOS.map(([lat,lon,w,h,angle])=>({w:w+.20,h:h+.20,height:6.04,inverse:new T.Quaternion().setFromUnitVectors(Z,new T.Vector3(...fromLatLon(lat,lon))).multiply(new T.Quaternion().setFromAxisAngle(Z,angle)).invert()}));
export function collageSurface(n){let height=0;for(const layer of supportLayers){const v=n.clone().applyQuaternion(layer.inverse);if(v.z>.8&&Math.abs(v.x*R)<layer.w/2&&Math.abs(v.y*R)<layer.h/2)height=Math.max(height,layer.height);}return height;}
let atlas=null;
function atlasResource(){
  if(atlas)return atlas;
  let settle;
  const resource={materials:new Set(),variants:new Set(),loaded:false,failed:false};
  resource.ready=new Promise(resolve=>{settle=resolve;});
  resource.texture=new T.TextureLoader().load(atlasUrl,()=>{
    resource.loaded=true;for(const variant of resource.variants)variant.needsUpdate=true;settle(true);
  },undefined,()=>{
    resource.failed=true;
    for(const material of resource.materials){material.map=null;material.bumpMap=null;material.needsUpdate=true;}
    settle(false);
  });
  atlas=resource;return resource;
}
function atlasMap(kind){
  const resource=atlasResource(),texture=new T.Texture();
  // One decoded Source / GPU image, different UV transforms for the quadrants.
  texture.source=resource.texture.source;resource.variants.add(texture);
  texture.colorSpace=T.SRGBColorSpace;texture.anisotropy=4;
  if(resource.loaded)texture.needsUpdate=true;
  const xy={paper:[0,.5],stone:[.5,.5],foil:[0,0],moss:[.5,0]}[kind];texture.repeat.set(.486,.486);texture.offset.set(xy[0]+.007,xy[1]+.007);return texture;
}
const cached=new Map();
function material(kind,color='#ffffff'){
  const key=kind+color;if(cached.has(key))return cached.get(key);
  const map=atlasMap(kind),m=new T.MeshStandardMaterial({color,map,bumpMap:map,bumpScale:kind==='paper'?.015:.026,roughness:kind==='foil'?.3:.94,metalness:kind==='foil'?.67:0,side:T.DoubleSide});
  const resource=atlasResource();resource.materials.add(m);if(resource.failed){m.map=null;m.bumpMap=null;}
  if(kind==='moss'){m.emissive.set('#506b32');m.emissiveIntensity=.35;}
  cached.set(key,m);return m;
}
function orient(root,lat,lon,angle=0){root.quaternion.setFromUnitVectors(Z,new T.Vector3(...fromLatLon(lat,lon)));root.rotateZ(angle);}
function patch(w,h,radius,kind,seed,ragged=true){
  const random=seededRandom(seed),geo=new T.PlaneGeometry(w,h,36,42),pos=geo.attributes.position;
  const nx=37,ny=43,left=Array.from({length:ny},()=>random()*.035),right=Array.from({length:ny},()=>random()*.035),top=Array.from({length:nx},()=>random()*.026),bottom=Array.from({length:nx},()=>random()*.026);
  for(let i=0;i<pos.count;i++){
    const row=Math.floor(i/nx),col=i%nx;let x=pos.getX(i),y=pos.getY(i);
    if(ragged){x+=col<3?left[row]*(1-col/3)*2.7:col>33?-right[row]*(col-33)/3*2.7:0;y+=row<3?-top[col]*(1-row/3)*2.5:row>39?bottom[col]*(row-39)/3*2.5:0;}
    const foldedCorner=kind==='paper'?.40*Math.pow(Math.max(0,x/(w/2)),7)*Math.pow(Math.max(0,y/(h/2)+.12),3):0;
    const n=new T.Vector3(x,y,R).normalize(),curl=(kind==='paper'?.014:kind==='foil'?.075:.018)*Math.sin(x*6+seed)*Math.sin(y*7)+foldedCorner;
    pos.setXYZ(i,...n.multiplyScalar(radius+curl).toArray());
  }geo.computeVertexNormals();const m=new T.Mesh(geo,material(kind));m.castShadow=true;m.receiveShadow=true;return m;
}
function inkText(text,width=1.2,height=1.7){
  const canvas=document.createElement('canvas');canvas.width=512;canvas.height=768;const c=canvas.getContext('2d');c.clearRect(0,0,512,768);c.fillStyle='#35413aec';c.font='124px "Songti SC", "STSong", serif';c.textAlign='center';
  [...text].forEach((ch,i)=>c.fillText(ch,270+(i%2)*8,140+i*153));
  const texture=new T.CanvasTexture(canvas);texture.colorSpace=T.SRGBColorSpace;
  const geo=new T.PlaneGeometry(width,height,12,16),p=geo.attributes.position;for(let i=0;i<p.count;i++){const n=new T.Vector3(p.getX(i),p.getY(i),R).normalize();p.setXYZ(i,...n.multiplyScalar(6.01).toArray());}geo.computeVertexNormals();
  return new T.Mesh(geo,new T.MeshBasicMaterial({map:texture,transparent:true,depthWrite:false,side:T.DoubleSide,polygonOffset:true,polygonOffsetFactor:-1}));
}
function curve(points,r,color,extra={}){return part(new T.TubeGeometry(new T.CatmullRomCurve3(points),points.length*2,r,4,false),color,[0,0,0],extra);}
export function makeCollageLayers(){
  const root=new T.Group();root.name='layered-paper-foil-and-lace';let patchCount=0;
  function sheet(lat,lon,w,h,angle,kind,radius,seed){const m=patch(w,h,radius,kind,seed);orient(m,lat,lon,angle);root.add(m);patchCount++;return m;}
  // Strata show through between the papers; irregular edges reveal the layer below.
  for(const [i,a] of FOLIOS.entries()){
    const [lat,lon,w,h,angle]=a;
    sheet(lat,lon,w+.54,h+.41,angle-.073,'foil',5.525,40+i);
    sheet(lat+.7,lon+.3,w+.25,h+.23,angle+.057,'stone',5.66,80+i);
    // Exposed parchment verso: a thin warm lip under each original manuscript.
    sheet(lat-.75,lon-.65,w+.12,h+.11,angle-.030,'paper',5.80,120+i);
  }
  const papers=FOLIOS;
  for(const [i,a] of papers.entries()){
    const [lat,lon,w,h,angle]=a;sheet(lat,lon,w,h,angle,'paper',5.98,11+i);
    const rules=new T.Group();
    for(let x=-w*.35;x<w*.4;x+=.43){const pts=[];for(let j=0;j<=30;j++){const y=-h*.4+j/30*h*.8;pts.push(new T.Vector3(x,y,R).normalize().multiplyScalar(6.003));}rules.add(curve(pts,.003,'#a65e53'));}
    orient(rules,lat,lon,angle);root.add(mergeStatic(rules));
  }
  const poem=inkText('思念',.57,1.05);orient(poem,24,65,-.24);root.add(poem);
  const verse=inkText('一首诗',.52,1.18);orient(verse,-19,-107,.35);root.add(verse);
  // Fine red manuscript rules float only a few millimeters above the paper surface.
  // Wider-spaced manuscript rules belong to each paper, not to a single oversized front rectangle.
  // Embroidered wire mesh uses tiny crossings and bead accents instead of a solid ring.
  const lace=new T.Group();
  for(const [lat,lon,angle] of [[51,120,-.3],[-46,75,.25],[7,-118,.5],[43,-66,-.22],[-39,-128,.31],[12,173,-.36]]){
    const panel=new T.Group();
    for(const slope of [-1,1])for(let row=-13;row<=13;row++){
      const pts=[];for(let j=0;j<=24;j++){const x=-1.55+j/24*3.1,y=row*.092+slope*x*.20;if(Math.abs(y)>.28)continue;pts.push(new T.Vector3(x,y,R).normalize().multiplyScalar(5.69+.02*Math.sin(x*8+row)));}
      if(pts.length>2)panel.add(curve(pts,.0055,'#c6cfc0',{roughness:.32,metalness:.5}));
    }
    for(let i=0;i<19;i++){const x=-1.45+i*.16,y=Math.sin(i*2.3)*.14,p=new T.Vector3(x,y,R).normalize().multiplyScalar(5.72);panel.add(ball(.023,i%3?'#92aa9b':'#b89599',p.toArray()));}
    orient(panel,lat,lon,angle);lace.add(panel);
  }root.add(mergeStatic(lace));
  root.userData={patchCount,edition:'0.17.0',folioCount:FOLIOS.length,coverage:'front, sides, rear, crown and underside; physical folded layers'};return root;
}
export function texturedStoneMaterial(){return material('stone','#bdc5bc');}
export function attachStoneTexture(m){m.map=atlasMap('stone');atlasResource().materials.add(m);if(atlasResource().failed)m.map=null;return m;}
export function mossMaterial(){return material('moss','#a9b393');}
export function collageTextureReady(){return atlasResource().ready;}
export function clearCollageMaterialCache(){cached.clear();atlas=null;}
