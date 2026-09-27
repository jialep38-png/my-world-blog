/** Original emulsion studies for v0.12.3. No found photographs or song text.
 * A repeated room exposure is developed, bleached and cut into physical paper.
 * These are authored abstractions, not photographs of an actual relationship.
 */
import * as T from 'three';
import {seededRandom} from './math.js';

export function exposureTexture({chroma=0,night=false,crop=0}={}){
  const c=document.createElement('canvas');c.width=c.height=768;
  const x=c.getContext('2d'),r=seededRandom(1230918);
  x.fillStyle=night?'#637087':'#e6e3dc';x.fillRect(0,0,768,768);
  x.save();x.beginPath();x.rect(31,30,706,650);x.clip();
  const bg=x.createLinearGradient(40,40,670,690);
  bg.addColorStop(0,night?'#070e23':'#233848');bg.addColorStop(.58,night?'#162646':'#91808b');bg.addColorStop(1,night?'#101621':'#ded2c8');
  x.fillStyle=bg;x.fillRect(30,30,708,652);
  // An empty interior, two differently exposed edges, and the light left in it.
  x.fillStyle=night?'#0b1223':'#313641';x.fillRect(112,75,328,367);
  const pane=x.createLinearGradient(130,70,420,465);
  pane.addColorStop(0,night?'#406085':'#8fabbb');pane.addColorStop(1,night?'#172139':'#b3c2ca');
  x.fillStyle=pane;x.fillRect(137,93,279,313);
  x.fillStyle=night?'#111727':'#665e64';x.fillRect(267,89,10,323);x.fillRect(129,244,294,8);
  x.globalAlpha=.75;x.fillStyle=night?'#192437':'#c38982';
  x.beginPath();x.moveTo(138,410);x.lineTo(416,410);x.lineTo(706,652);x.lineTo(354,652);x.closePath();x.fill();
  x.globalAlpha=1;x.fillStyle=night?'#091120':'#74434c';
  x.beginPath();x.moveTo(477,185);x.bezierCurveTo(610,230,491,392,687,444);x.lineTo(705,582);x.bezierCurveTo(457,511,524,315,453,271);x.closePath();x.fill();
  x.strokeStyle=night?'#738298':'#d8caca';x.globalAlpha=.4;x.lineWidth=2;
  x.beginPath();x.moveTo(47,575);x.lineTo(352,533);x.lineTo(725,610);x.stroke();
  if(night){
    // Distant lamps behind a window; uneven spacing and different focal sizes.
    for(const [a,b,s] of [[172,169,4],[208,213,2],[334,188,5],[389,278,2.4],[291,319,2]]){
      const g=x.createRadialGradient(a,b,0,a,b,s*7);g.addColorStop(0,'#fff1dbaa');g.addColorStop(.18,'#bdd1e39a');g.addColorStop(1,'#859cbc00');x.globalAlpha=.85;x.fillStyle=g;x.fillRect(a-s*7,b-s*7,s*14,s*14);
    }
    x.globalAlpha=.20;x.strokeStyle='#bfd0df';
    for(let i=0;i<95;i++){const a=30+r()*710,b=30+r()*600;x.lineWidth=.5+r()*1.7;x.beginPath();x.moveTo(a,b);x.lineTo(a-5-r()*8,b+20+r()*83);x.stroke();}
  }else{
    // Development progressively consumes colour AND detail, rather than adding
    // isolated red/blue decorations. The photograph itself is the same exposure.
    const wash=x.createLinearGradient(260,0,740,0);wash.addColorStop(0,'#e9e7df00');wash.addColorStop(.72,`rgba(234,232,225,${.08+(1-chroma)*.38})`);wash.addColorStop(1,'#eceae3');
    x.globalAlpha=1;x.fillStyle=wash;x.fillRect(25,25,714,658);
  }
  if(crop){x.globalAlpha=.96;x.fillStyle=night?'#111824':'#e6e4dd';x.fillRect(520-crop*50,25,250,665);}
  x.restore();
  const pixels=x.getImageData(0,0,768,768),d=pixels.data;
  for(let i=0;i<d.length;i+=4){const mono=d[i]*.2126+d[i+1]*.7152+d[i+2]*.0722,n=(r()-.5)*10;for(let k=0;k<3;k++)d[i+k]=mono+(d[i+k]-mono)*(night?.78:chroma)+n;}
  x.putImageData(pixels,0,0);
  x.strokeStyle=night?'#485467':'#7c7b79';x.globalAlpha=.45;x.lineWidth=1;
  for(const [a,b,sx,sy] of [[19,18,1,1],[749,18,-1,1],[19,695,1,-1]]){x.beginPath();x.moveTo(a+sx*16,b);x.lineTo(a,b);x.lineTo(a,b+sy*16);x.stroke();}
  const texture=new T.CanvasTexture(c);texture.colorSpace=T.SRGBColorSpace;texture.anisotropy=4;return texture;
}

export function emulsionPaper(w,h,map,{curl=.10,night=false}={}){
  const g=new T.PlaneGeometry(w,h,28,22),p=g.attributes.position;
  for(let i=0;i<p.count;i++){
    const a=p.getX(i),b=p.getY(i),u=a/w*2,v=b/h*2;
    p.setXYZ(i,a+Math.abs(v)**18*.008*Math.sin(u*49),b+Math.abs(u)**18*.012*Math.sin(v*35),curl*(.24*u*u+Math.max(0,u)**4)+.009*Math.sin(v*5+u*2));
  }
  g.computeVertexNormals();
  const m=new T.MeshPhysicalMaterial({map,side:T.DoubleSide,roughness:night?.61:.86,metalness:night?.025:0,clearcoat:night?.22:.08,clearcoatRoughness:night?.38:.4});
  const mesh=new T.Mesh(g,m);mesh.castShadow=mesh.receiveShadow=true;return mesh;
}

export function quietHaloTexture(){
  const c=document.createElement('canvas');c.width=c.height=256;const x=c.getContext('2d');
  const g=x.createRadialGradient(128,128,12,128,128,126);g.addColorStop(0,'#fff6de38');g.addColorStop(.44,'#fffae522');g.addColorStop(1,'#fff9df00');
  x.fillStyle=g;x.fillRect(0,0,256,256);const t=new T.CanvasTexture(c);t.colorSpace=T.SRGBColorSpace;return t;
}

export function paperImpressionTexture(moon=false){
  const c=document.createElement('canvas');c.width=c.height=512;const x=c.getContext('2d'),r=seededRandom(moon?12331:12332);
  const wash=x.createLinearGradient(0,35,512,430);wash.addColorStop(0,moon?'#b8bfa9':'#dad7c4');wash.addColorStop(.57,moon?'#c9ccb7':'#e1ddc9');wash.addColorStop(1,moon?'#909e90':'#c7c5b0');
  x.fillStyle=wash;x.fillRect(0,0,512,512);
  x.save();x.filter='blur(24px)';
  for(let i=0;i<26;i++){x.globalAlpha=.018+r()*.026;x.fillStyle=i%2?'#617968':'#fff9df';x.beginPath();x.ellipse(r()*512,r()*512,25+r()*95,15+r()*65,r()*3,0,Math.PI*2);x.fill();}
  x.restore();const pixels=x.getImageData(0,0,512,512),d=pixels.data;
  for(let y=0;y<512;y++)for(let a=0;a<512;a++){
    const i=(y*512+a)*4,n=(r()-.5)*11+Math.sin(a*.73+y*.03)*1.3;for(let k=0;k<3;k++)d[i+k]+=n;
    if(moon){const radius=Math.hypot(a-256,y-256)/256;d[i+3]=255*Math.max(0,Math.min(1,(1-radius)/.08));}
  }
  x.putImageData(pixels,0,0);const t=new T.CanvasTexture(c);t.colorSpace=T.SRGBColorSpace;return t;
}
