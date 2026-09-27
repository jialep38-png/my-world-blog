/** Original printmaking for Yesterday, Today. No photographs or font assets. */
import * as T from 'three';
import { seededRandom } from '../math.js';
const canvas=(n=1024)=>{const c=document.createElement('canvas');c.width=c.height=n;return c;};
function texture(c,data=false){const t=new T.CanvasTexture(c);t.colorSpace=data?T.NoColorSpace:T.SRGBColorSpace;t.anisotropy=4;return t;}
function grain(c,seed,amount){const x=c.getContext('2d'),r=seededRandom(seed),im=x.getImageData(0,0,c.width,c.height);for(let i=0;i<im.data.length;i+=4){const v=(r()-.5)*amount;for(let k=0;k<3;k++)im.data[i+k]+=v;}x.putImageData(im,0,0);}

export function makeYesterdayTextures(){
  // The user's correction concerns the INNER label, not the page title.
  // This plate contains no letters. Convex glass and separate curled inlays
  // sit over an original, photogram-like botanical exposure.
  function memoryPlate(){
    const c=canvas(),x=c.getContext('2d'),r=seededRandom(920184);
    const ground=x.createLinearGradient(140,1024,850,0);
    ground.addColorStop(0,'#854a89');ground.addColorStop(.3,'#d280b1');
    ground.addColorStop(.57,'#daa4c3');ground.addColorStop(.77,'#9a9ccf');ground.addColorStop(1,'#786fba');
    x.fillStyle=ground;x.fillRect(0,0,1024,1024);
    for(const [px,py,rad,color] of [[700,230,310,'#fff2db'],[240,460,260,'#efbcde'],[760,740,350,'#a8b6e8']]){
      const g=x.createRadialGradient(px,py,0,px,py,rad);g.addColorStop(0,color+'b8');g.addColorStop(1,color+'00');x.fillStyle=g;x.fillRect(0,0,1024,1024);
    }
    // Two interrupted exposures share a horizon; the seam continues into
    // actual paper fragments above the plate instead of becoming a new logo.
    x.save();x.beginPath();x.moveTo(0,80);x.lineTo(396,24);x.lineTo(605,805);x.lineTo(130,1024);x.lineTo(0,1024);x.closePath();x.clip();
    x.fillStyle='#544d85';x.globalAlpha=.24;x.fillRect(0,0,1024,1024);
    for(let j=0;j<8;j++){
      x.beginPath();x.moveTo(-60,590+j*47);
      for(let k=0;k<=14;k++)x.lineTo(k*90,555+j*45+Math.sin(k*.49+j)*35+r()*18);
      x.lineTo(1150,1100);x.lineTo(-60,1100);x.closePath();x.fillStyle=j%2?'#efb6d1':'#5f538c';x.globalAlpha=.12;x.fill();
    }
    x.restore();
    const botanical=(px,py,length,angle,depth)=>{
      if(!depth)return;
      const qx=px+Math.sin(angle)*length,qy=py-Math.cos(angle)*length;
      x.strokeStyle='#463459';x.lineWidth=depth*1.3;x.beginPath();x.moveTo(px,py);x.quadraticCurveTo(px+12,py-length*.55,qx,qy);x.stroke();
      for(let k=1;k<=3;k++){
        const t=k/4,lx=px+(qx-px)*t,ly=py+(qy-py)*t;x.save();x.translate(lx,ly);x.rotate(angle+(k%2?.67:-.85));
        x.fillStyle=k%2?'#f5d0da':'#5b416a';x.beginPath();x.ellipse(0,-length*.07,length*.031,length*.103,-.3,0,Math.PI*2);x.fill();x.restore();
      }
      botanical(qx,qy,length*.69,angle-.45,depth-1);botanical(qx,qy,length*.62,angle+.63,depth-1);
    };
    x.save();x.globalAlpha=.58;botanical(100,1010,278,.43,5);x.globalAlpha=.28;botanical(505,1090,253,-.19,5);x.restore();
    // A blue-violet exposure crosses the warm frame; curved glass is kept
    // clear enough for these tonal boundaries to remain visible at distance.
    x.save();x.beginPath();x.moveTo(630,80);x.lineTo(950,150);x.lineTo(1024,610);x.lineTo(510,502);x.closePath();x.clip();
    const exposure=x.createLinearGradient(650,140,780,690);exposure.addColorStop(0,'#7775ad');exposure.addColorStop(.52,'#c3b6e0');exposure.addColorStop(1,'#d797c0');
    x.globalAlpha=.43;x.fillStyle=exposure;x.fillRect(480,0,550,720);
    x.globalAlpha=.46;botanical(900,800,232,-.18,4);x.restore();
    for(let i=0;i<13;i++){
      const px=390+r()*390,py=470+r()*435;
      x.save();x.translate(px,py);x.rotate(r()*6.28);x.globalAlpha=.08+r()*.12;x.fillStyle=i%3?'#ffede7':'#ef9dc8';
      x.beginPath();x.moveTo(0,45);x.bezierCurveTo(-80,-5,-72,-118,0,-109);x.bezierCurveTo(60,-121,85,-2,0,45);x.fill();x.restore();
    }
    // Pressed blossoms in the emulsion, distinct from the real flowers that
    // overlap the glass. They give the clear centre something to preserve.
    for(const [px,py,s] of [[650,625,1],[727,705,.77],[583,750,.80],[686,842,.60]]){
      x.save();x.translate(px,py);x.rotate((px-py)*.013);
      for(let k=0;k<5;k++){
        x.save();x.rotate(k*Math.PI*2/5);x.globalAlpha=.32;
        const tint=x.createRadialGradient(0,-28*s,2,0,-48*s,55*s);
        tint.addColorStop(0,'#b88ebfcc');tint.addColorStop(.7,'#fbe4efd0');tint.addColorStop(1,'#f8dfed00');
        x.fillStyle=tint;x.beginPath();x.ellipse(0,-41*s,30*s,49*s,0,0,Math.PI*2);x.fill();x.restore();
      }
      x.restore();
    }
    x.strokeStyle='#ead7da';x.globalAlpha=.14;x.lineWidth=1;
    for(let py=2;py<1024;py+=4){x.beginPath();x.moveTo(0,py);x.lineTo(1024,py);x.stroke();}
    x.globalAlpha=.32;x.strokeStyle='#f8e8e0';x.lineWidth=2;x.beginPath();x.moveTo(395,40);x.lineTo(608,813);x.stroke();x.globalAlpha=1;
    grain(c,210,18);return texture(c);
  }
  const memory=memoryPlate();

  function paper(seed,mode=0){
    const c=canvas(),x=c.getContext('2d'),r=seededRandom(seed);
    x.fillStyle=mode===2?'#d5c4d9':'#e8dfd4';x.fillRect(0,0,1024,1024);
    // Original botanical impressions, laid over interrupted horizon plates.
    const sky=x.createLinearGradient(0,130,0,800);sky.addColorStop(0,mode===1?'#a59bbf':'#bdaac2');sky.addColorStop(.52,'#ddd0d9');sky.addColorStop(1,'#8d7d93');x.fillStyle=sky;x.fillRect(48,78,928,777);
    x.save();x.beginPath();x.rect(48,78,928,777);x.clip();
    for(let i=0;i<9;i++){x.fillStyle=i%2?'#4f425d':'#a993b0';x.globalAlpha=.16+r()*.22;x.fillRect(20,460+i*41,990,8+r()*27);}
    function branch(px,py,len,a,depth){if(!depth)return;const qx=px+Math.sin(a)*len,qy=py-Math.cos(a)*len;x.strokeStyle='#463c4c';x.globalAlpha=.52+depth*.065;x.lineWidth=depth*1.9;x.beginPath();x.moveTo(px,py);x.quadraticCurveTo(px-9,py-len*.48,qx,qy);x.stroke();for(let k=0;k<4;k++){const t=.3+k*.19,lx=px+(qx-px)*t,ly=py+(qy-py)*t;x.save();x.translate(lx,ly);x.rotate(a+(k%2?1:-1)*.7);x.fillStyle='#443449';x.beginPath();x.ellipse(0,-len*.075,len*.034,len*.105,0,0,Math.PI*2);x.fill();x.restore();}branch(qx,qy,len*.66,a-.34-r()*.3,depth-1);branch(qx,qy,len*.69,a+.32+r()*.28,depth-1);}
    branch(285+mode*129,970,258,.08+mode*.14,5);x.restore();x.globalAlpha=1;
    // A small displaced ink pass reads as an imperfect print, not random text.
    x.strokeStyle='#735367';x.lineWidth=mode===2?17:3;x.strokeRect(53,83,918,767);
    // Registration marks, never stray words or musician credits.
    x.lineWidth=1;x.beginPath();x.moveTo(52,918);x.lineTo(104,918);x.moveTo(78,905);x.lineTo(78,931);x.stroke();
    x.strokeStyle='#f5e8dc';x.globalAlpha=.16;x.lineWidth=1;for(let yy=84;yy<850;yy+=4){x.beginPath();x.moveTo(54,yy);x.lineTo(972,yy);x.stroke();}x.globalAlpha=1;
    for(let i=0;i<2800;i++){x.fillStyle=i%2?'#f3eadd':'#857a85';x.globalAlpha=.05+r()*.19;x.fillRect(r()*1024,r()*1024,.4+r()*2,.4+r()*2);}x.globalAlpha=1;grain(c,seed+5,25);return texture(c);
  }
  function folds(){const c=canvas(512),x=c.getContext('2d'),im=x.createImageData(512,512),r=seededRandom(62);for(let y=0;y<512;y++)for(let a=0;a<512;a++){const u=a/512,v=y/512;const f=Math.sin(u*51+Math.sin(v*16)*1.2)*.23+Math.sin(u*121-v*85)*.12+Math.sin(u*353+v*117)*.04;const k=(y*512+a)*4;im.data[k]=im.data[k+1]=im.data[k+2]=130+f*110+(r()-.5)*12;im.data[k+3]=255;}x.putImageData(im,0,0);return texture(c,true);}
  function membrane(){const c=canvas(),x=c.getContext('2d'),g=x.createLinearGradient(0,1024,1024,0);g.addColorStop(0,'#b7abd8');g.addColorStop(.3,'#e4cddd');g.addColorStop(.57,'#faf1f0');g.addColorStop(.77,'#cbd8ed');g.addColorStop(1,'#eabed6');x.fillStyle=g;x.fillRect(0,0,1024,1024);grain(c,38,9);return texture(c);}
  function petal(){const c=canvas(512),x=c.getContext('2d'),g=x.createLinearGradient(0,512,0,0);g.addColorStop(0,'#c780a7');g.addColorStop(.27,'#e9abc9');g.addColorStop(.72,'#f9d8e5');g.addColorStop(1,'#fff2f2');x.fillStyle=g;x.fillRect(0,0,512,512);x.strokeStyle='#fff7f2';x.lineWidth=.8;for(let i=0;i<45;i++){x.globalAlpha=.12;x.beginPath();x.moveTo(256,530);x.quadraticCurveTo(i*9,255,i*13,-20);x.stroke();}x.globalAlpha=1;grain(c,173,9);return texture(c);}
  function feather(){
    const c=canvas(512),x=c.getContext('2d'),r=seededRandom(120918);
    x.clearRect(0,0,512,512);
    // Individual softly tapered barbs, with empty spaces, not a solid plastic
    // feather silhouette. Actual filament geometry is retained above this veil.
    for(let i=0;i<235;i++){
      const y=8+i*2.1,t=y/512,w=220*Math.pow(Math.sin(Math.PI*t),.72);
      for(const sign of [-1,1]){
        const length=w*(.7+r()*.3),edge=256+sign*length;
        const g=x.createLinearGradient(256,y,edge,y-20);
        g.addColorStop(0,'#fff6fde0');g.addColorStop(.52,'#f8e4f0a8');g.addColorStop(1,'#fcecf400');
        x.strokeStyle=g;x.lineWidth=.7+r()*1.4;x.beginPath();x.moveTo(256,y);
        x.bezierCurveTo(256+sign*length*.38,y-3,edge,y-21-r()*18,edge,y-30-r()*16);x.stroke();
      }
    }
    return texture(c);
  }
  const rough=canvas(512),rx=rough.getContext('2d');rx.fillStyle='#e9e9e9';rx.fillRect(0,0,512,512);grain(rough,37,46);
  return {memory,membrane:membrane(),folds:folds(),petal:petal(),feather:feather(),paperA:paper(231),paperB:paper(913,1),paperC:paper(563,2),paperGrain:texture(rough,true)};
}
