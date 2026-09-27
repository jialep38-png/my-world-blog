/** Physical album leaves and river reflections for the 0.13 poem edition.
 * Real curved meshes, exposed verso and stitched edges; never a front-only decal.
 */
import * as T from 'three';
import { fromLatLon, seededRandom } from './math.js';
import { part, mergeStatic } from './garden-models.js';
import { poemTexture } from './poem-reliquary.js';

const R=5.4,Z=new T.Vector3(0,0,1);
const leaves=[
  {lat:20,lon:127,w:1.98,h:2.76,angle:.26,r:5.70,curl:.16},
  {lat:-33,lon:52,w:2.26,h:2.45,angle:-.36,r:5.71,curl:.19},
  {lat:27,lon:-115,w:3.29,h:3.20,angle:.20,r:5.71,curl:.21},
  {lat:-31,lon:-73,w:2.93,h:2.51,angle:-.32,r:5.71,curl:.17},
  {lat:14,lon:9,w:2.36,h:2.80,angle:-.23,r:5.71,curl:.19},
];
function orientation(s){return new T.Quaternion().setFromUnitVectors(Z,new T.Vector3(...fromLatLon(s.lat,s.lon))).multiply(new T.Quaternion().setFromAxisAngle(Z,s.angle));}
const support=leaves.map(s=>({...s,inverse:orientation(s).invert()}));
export function albumSurface(normal){
  let h=0;
  for(const s of support){const p=normal.clone().applyQuaternion(s.inverse);if(p.z>.82&&Math.abs(p.x*R)<s.w*.48&&Math.abs(p.y*R)<s.h*.48)h=Math.max(h,s.r+.075);}
  return h;
}
function filament(points,r,color,extra={}){
  const o=part(new T.TubeGeometry(new T.CatmullRomCurve3(points),Math.max(16,points.length*2),r,5,false),color,[0,0,0],extra);o.castShadow=false;return o;
}
function localPoint(x,y,s,layer=0){
  const u=x/(s.w*.5),v=y/(s.h*.5);
  const curl=s.curl*Math.max(0,u)**5*(.18+.82*Math.max(0,-v)**4);
  return new T.Vector3(x,y,R).normalize().multiplyScalar(s.r+layer*.054+curl+.012*Math.sin(u*4+v*2));
}
export function makePoemAlbum(){
  const root=new T.Group();root.name='opened-album-leaves-and-river-reflections';
  const map=poemTexture('paper'),random=seededRandom(130031);
  for(const [index,s] of leaves.entries()){
    const g=new T.Group();g.name='album-leaf-'+index;g.quaternion.copy(orientation(s));
    for(let layer=0;layer<2;layer++){
      const geo=new T.PlaneGeometry(s.w,s.h,44,48),p=geo.attributes.position;
      for(let i=0;i<p.count;i++){
        let x=p.getX(i),y=p.getY(i),u=x/(s.w*.5),v=y/(s.h*.5);
        x+=Math.sign(u)*(.008*Math.sin(y*81+index)+.01*Math.sin(y*35))*Math.abs(u)**24;
        y+=Math.sign(v)*(.013*Math.sin(x*62+index)+.007*Math.cos(x*39))*Math.abs(v)**24;
        p.setXYZ(i,...localPoint(x+layer*.033,y+layer*.025,s,layer).toArray());
      }
      geo.computeVertexNormals();
      const sheet=part(geo,layer?'#fffbed':'#d9decb',[0,0,0],{map,bumpMap:map,bumpScale:.012,side:T.DoubleSide,roughness:.92,metalness:0});
      sheet.name='deckled-physical-sheet';g.add(sheet);
    }
    // A thin book-edge catches the light; a few fibres break its silhouette.
    const edge=Array.from({length:57},(_,i)=>localPoint(s.w*.5+.033,-s.h*.5+i/56*s.h+.025,s,1));
    g.add(filament(edge,.005,'#f2eddc',{roughness:.92}));
    const threadX=-s.w*.41;
    g.add(filament(Array.from({length:25},(_,i)=>localPoint(threadX,-s.h*.38+i/24*s.h*.76,s,1).multiplyScalar(1.002)),.0055,'#92977d',{roughness:.8}));
    for(let i=0;i<4;i++){
      const y=-s.h*.32+i*s.h*.21;
      g.add(filament([localPoint(threadX-.07,y,s,1),localPoint(threadX,y+.012,s,1).multiplyScalar(1.006),localPoint(threadX+.055,y-.015,s,1)],.004,'#aaa68b',{roughness:.92}));
    }
    for(let i=0;i<8;i++){
      const y=(random()-.5)*s.h;
      g.add(filament([localPoint(s.w*.49,y,s,1),localPoint(s.w*.52,y+.013,s,1)],.002,'#e5e0cb',{roughness:.96}));
    }
    root.add(mergeStatic(g));
  }
  const current=new T.Group();current.name='river-reflected-margins';
  for(let i=0;i<37;i++){
    const y=.02-i/36*.83,center=-.23+.1*Math.sin(y*7),span=.018+random()*.065;
    for(let j=0;j<2;j++){
      const points=Array.from({length:13},(_,k)=>{
        const t=k/12-.5,x=center+Math.sin(i*2.39)*.074+t*span,yy=y+j*.008+Math.cos(t*Math.PI*1.5)*.003;
        return new T.Vector3(x,yy,Math.sqrt(Math.max(.001,1-x*x-yy*yy))).normalize().multiplyScalar(5.439);
      });
      current.add(filament(points,j?.0018:.003,j?'#b4cbc0':'#d0d4be',{roughness:.48,metalness:.1,transparent:true,opacity:j?.31:.57,depthWrite:false}));
    }
  }
  root.add(mergeStatic(current));
  root.userData={edition:'0.16.0',physicalLeaves:10,motifs:['deckled page and exposed verso','thread-bound book edges','continuous moonlit river'],notAFlatCover:true};
  return root;
}
