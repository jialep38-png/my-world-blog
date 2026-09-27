/** 删了一百遍 — authored print, foil and erased-ink materials.
 * Glyphs are paths for this five-character title, never a bundled font.
 * Seeded Canvas artwork; the reference photo is NOT mapped onto the sphere.
 */
import * as T from 'three';
import {seededRandom} from '../math.js';
function canvas(size=1024){const c=document.createElement('canvas');c.width=c.height=size;return c;}
function texture(c,data=false){const t=new T.CanvasTexture(c);t.colorSpace=data?T.NoColorSpace:T.SRGBColorSpace;t.anisotropy=8;return t;}
function paperNoise(c,seed,strength=10){const ctx=c.getContext('2d'),r=seededRandom(seed),im=ctx.getImageData(0,0,c.width,c.height),d=im.data;for(let i=0;i<d.length;i+=4){const n=(r()-.5)*strength;d[i]+=n;d[i+1]+=n;d[i+2]+=n;}ctx.putImageData(im,0,0);}
function wear(ctx,seed,count=1800,light=false){
  const r=seededRandom(seed);ctx.save();
  for(let i=0;i<count;i++){const x=r()*1024,y=r()*1024,rad=.2+Math.pow(r(),6)*4;ctx.globalAlpha=.08+r()*.42;ctx.fillStyle=light?'#efece5':'#29292c';ctx.fillRect(x,y,rad*(1+r()*2),rad);}
  ctx.globalAlpha=.12;ctx.strokeStyle=light?'#e5e3dd':'#48474b';
  for(let i=0;i<31;i++){const x=r()*1024,y=r()*1024;ctx.beginPath();ctx.moveTo(x,y);ctx.lineTo(x+10+r()*170,y-2+r()*4);ctx.lineWidth=.4+r();ctx.stroke();}
  ctx.restore();
}
export function makePressTextures(glyphs={}){
  const paths=new Map(Object.entries(glyphs).map(([c,d])=>[c,new Path2D(d)]));
  function character(ctx,ch,x,y,size,color,width=1){
    ctx.save();ctx.fillStyle=color;
    if(paths.has(ch)){ctx.translate(x,y);ctx.scale(size/100*width,-size/100);ctx.fill(paths.get(ch));}
    else{ctx.font=`900 ${size}px "Songti SC",serif`;ctx.translate(x,y);ctx.scale(width,1);ctx.fillText(ch,0,0);}
    ctx.restore();
  }
  function title(ctx,text,x,y,size,color,width=1,vertical=false){[...text].forEach((ch,i)=>character(ctx,ch,x+(vertical?0:i*size*.94*width),y+(vertical?i*size*.91:0),size,color,width));}
  function press(kind,seed){
    const c=canvas(),ctx=c.getContext('2d'),r=seededRandom(seed);ctx.fillStyle=kind==='black'?'#2b292f':'#e5e4df';ctx.fillRect(0,0,1024,1024);
    if(kind==='black'){
      title(ctx,'删',20,820,880,'#48424c',1.1);title(ctx,'遍',655,450,525,'#696270',.83);
      ctx.save();ctx.translate(85,407);ctx.rotate(-.085);ctx.scale(.57,1);ctx.fillStyle='#e8e7e2';ctx.font='900 194px Georgia,serif';ctx.fillText('A Hundred',0,0);ctx.fillText('Times.',265,174);ctx.restore();
      ctx.fillStyle='#d6d4cf';ctx.font='21px monospace';ctx.fillText('DELETED / ARCHIVE OF THE UNSENT',54,971);
    }else if(kind==='type'){
      ctx.fillStyle='#a19da6';ctx.fillRect(0,0,1024,1024);title(ctx,'删',-125,916,1120,'#2d2831',.93);
      ctx.save();ctx.translate(770,63);ctx.rotate(Math.PI/2);ctx.fillStyle='#e0ddd6';ctx.font='900 134px Impact,sans-serif';ctx.fillText('DELETED 100',0,0);ctx.restore();
    }else if(kind==='news'){
      ctx.fillStyle='#e6e6e0';ctx.fillRect(0,0,1024,1024);ctx.fillStyle='#35343b';ctx.font='italic 89px Georgia,serif';ctx.fillText('A hundred times.',31,124);
      ctx.fillStyle='#323238';ctx.font='900 244px Impact,"Arial Narrow",sans-serif';ctx.fillText('DELETE',16,346);
      for(let col=0;col<3;col++)for(let row=0;row<35;row++){
        ctx.globalAlpha=.30;ctx.fillStyle='#29272d';let x=32+col*330,y=380+row*16;
        for(let word=0;word<6;word++){const w=13+r()*30;ctx.fillRect(x,y,w,3+Number(row%5===0));x+=w+6;}
      }ctx.globalAlpha=1;
      title(ctx,'百',652,999,470,'#6d6872',.82);
    }else if(kind==='diagram'){
      ctx.fillStyle='#e5e3dc';ctx.fillRect(0,0,1024,1024);ctx.strokeStyle='#bcb9b8';ctx.lineWidth=.9;
      for(let i=0;i<30;i++){ctx.beginPath();ctx.moveTo(0,i*38);ctx.lineTo(1024,i*38);ctx.moveTo(i*38,0);ctx.lineTo(i*38,1024);ctx.stroke();}
      ctx.save();ctx.translate(548,527);ctx.rotate(.17);ctx.strokeStyle='#77717b';ctx.lineWidth=2;
      for(let i=0;i<4;i++){ctx.beginPath();ctx.arc(0,0,220+i*30,Math.PI*.15,Math.PI*1.86);ctx.stroke();}ctx.restore();
      ctx.fillStyle='#69636d';ctx.font='390px Georgia,serif';ctx.fillText('100',108,604);ctx.font='25px monospace';ctx.fillText('ERASE / RETURN / STILL HERE',73,966);
    }else if(kind==='fragments'){
      ctx.fillStyle='#d6d6d2';ctx.fillRect(0,0,1024,1024);
      for(let i=0;i<10;i++){ctx.save();ctx.translate(r()*1024,r()*1024);ctx.rotate((r()-.5)*1.2);ctx.fillStyle=['#333238','#efeeea','#8e8992'][i%3];ctx.fillRect(-120,-180,160+r()*310,80+r()*360);title(ctx,'删了一百遍'[i%5],-80,60,170+r()*225,i%3?'#4b4650':'#e9e7e3',.78);ctx.restore();}
    }else if(kind==='wash'){
      ctx.fillStyle='#e3e2dd';ctx.fillRect(0,0,1024,1024);ctx.save();ctx.globalAlpha=.26;
      for(let i=0;i<75;i++){ctx.fillStyle=i%3?'#948ea2':'#cfcad1';ctx.beginPath();ctx.moveTo(r()*1024,r()*1024);for(let j=0;j<4;j++)ctx.lineTo(r()*1024,r()*1024);ctx.closePath();ctx.fill();}ctx.restore();
      title(ctx,'了',500,792,970,'#55525b',.7);
    }
    // The ink is repeatedly revised, rather than a decorative title collage.
    if(['black','news','type'].includes(kind)){
      ctx.save();ctx.translate(0,12);ctx.rotate(-.018);
      const dark=kind==='black';
      for(const [x,y,w,h] of [[72,505,625,28],[194,651,691,21],[46,826,413,35]]){
        ctx.fillStyle=dark?'#dddcd5':'#353139';ctx.globalAlpha=.82;ctx.fillRect(x,y,w,h);
        ctx.globalAlpha=.28;ctx.fillRect(x+7,y-7,w*.83,4);
      }
      ctx.globalAlpha=.85;ctx.strokeStyle=dark?'#ece9e1':'#302c34';ctx.lineWidth=4;
      ctx.strokeRect(56,475,702,97);ctx.beginPath();ctx.moveTo(704,508);ctx.lineTo(804,464);ctx.lineTo(845,493);ctx.stroke();ctx.restore();
    }
    wear(ctx,seed+28,kind==='black'?1600:1100,kind==='black');paperNoise(c,seed+400,10);return texture(c);
  }
  function foil(){
    const c=canvas(),b=canvas(),normal=canvas(),rough=canvas(),ctx=c.getContext('2d'),hctx=b.getContext('2d');
    const base=ctx.createImageData(1024,1024),height=hctx.createImageData(1024,1024),nm=normal.getContext('2d').createImageData(1024,1024),rm=rough.getContext('2d').createImageData(1024,1024),heights=new Float32Array(1024*1024),r=seededRandom(3829);
    const axes=Array.from({length:13},()=>({a:r()*Math.PI*2,f:8+r()*50,p:r()*8,w:.2+r()*.8}));
    for(let y=0;y<1024;y++)for(let x=0;x<1024;x++){
      const u=x/1024,v=y/1024,warp=.08*Math.sin(u*13+v*6)+.036*Math.sin(v*23-u*7);let value=0,total=0;
      for(const a of axes){value+=a.w*Math.pow(Math.abs(Math.sin((u*Math.cos(a.a)+v*Math.sin(a.a)+warp)*a.f+a.p)),.36);total+=a.w;}
      const grain=Math.sin(x*12.989+y*78.233)*43758.5453,noise=grain-Math.floor(grain),h=value/total;heights[y*1024+x]=h;
      const i=(y*1024+x)*4,shade=194+h*52+(noise-.5)*7;
      for(let k=0;k<3;k++){base.data[i+k]=shade;height.data[i+k]=h*255;rm.data[i+k]=128+h*99;}base.data[i+3]=height.data[i+3]=rm.data[i+3]=255;
    }
    for(let y=0;y<1024;y++)for(let x=0;x<1024;x++){
      const dx=(heights[y*1024+(x+1)%1024]-heights[y*1024+(x+1023)%1024])*22,dy=(heights[((y+1)%1024)*1024+x]-heights[((y+1023)%1024)*1024+x])*22,inv=1/Math.hypot(dx,dy,1),i=(y*1024+x)*4;
      nm.data[i]=128-dx*inv*127;nm.data[i+1]=128+dy*inv*127;nm.data[i+2]=128+inv*127;nm.data[i+3]=255;
    }
    ctx.putImageData(base,0,0);hctx.putImageData(height,0,0);normal.getContext('2d').putImageData(nm,0,0);rough.getContext('2d').putImageData(rm,0,0);
    return {foil:texture(c),foilHeight:texture(b,true),foilNormal:texture(normal,true),foilRough:texture(rough,true)};
  }
  function disc(){
    const c=canvas(),ctx=c.getContext('2d');ctx.fillStyle='#45404b';ctx.fillRect(0,0,1024,1024);
    title(ctx,'删',25,687,790,'#69616e',.83);title(ctx,'遍',494,535,598,'#928b96',.85);
    // Off-centre negative crescent and broken rings, not a blank ivory plate.
    ctx.fillStyle='#e0e0d9';ctx.beginPath();ctx.arc(512,550,427,.03,Math.PI*.98);ctx.arc(493,427,366,Math.PI*.98,.03,true);ctx.closePath();ctx.fill();
    ctx.strokeStyle='#eaeae4';ctx.lineWidth=33;ctx.beginPath();ctx.arc(490,490,411,-1.70,2.94);ctx.stroke();
    ctx.strokeStyle='#a3a0a5';ctx.lineWidth=5;ctx.beginPath();ctx.arc(501,520,451,-1.50,2.7);ctx.stroke();
    ctx.save();ctx.translate(122,300);ctx.rotate(-.085);ctx.scale(.62,1);ctx.fillStyle='#e7e4de';ctx.font='bold 140px Georgia,serif';ctx.fillText('A Hundred',0,0);ctx.fillText('Times.',95,145);ctx.restore();
    title(ctx,'删了一百遍',348,778,137,'#2b2831',.73);
    ctx.save();ctx.translate(803,380);ctx.rotate(.08);ctx.fillStyle='#333039';ctx.fillRect(0,0,44,214);ctx.fillStyle='#dcd9dd';ctx.fillRect(11,38,50,116);ctx.restore();
    ctx.fillStyle='#655f69';ctx.font='20px monospace';ctx.fillText('DELETED / 100',410,884);
    ctx.save();ctx.translate(50,485);ctx.rotate(-.055);
    ctx.fillStyle='#deddd5';ctx.fillRect(0,0,792,45);ctx.fillRect(135,63,575,13);
    ctx.globalAlpha=.34;ctx.fillStyle='#4b444e';ctx.font='bold 38px Georgia,serif';ctx.fillText('STILL HERE',90,38);
    ctx.globalAlpha=1;ctx.strokeStyle='#302b35';ctx.lineWidth=9;ctx.beginPath();ctx.moveTo(78,-77);ctx.lineTo(658,-63);ctx.stroke();
    ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(86,-87);ctx.lineTo(713,-77);ctx.stroke();ctx.restore();
    paperNoise(c,631,9);wear(ctx,871,650,false);return texture(c);
  }
  function alphabet(){const c=canvas(),ctx=c.getContext('2d');ctx.fillStyle='#efeeea';ctx.fillRect(0,0,1024,1024);const letters=['07','23','48','77','99','100','01','100','D','E','L','T','X','0','1','M'];for(let i=0;i<16;i++){const x=i%4*256,y=Math.floor(i/4)*256;ctx.fillStyle='#222127';ctx.font='500 86px monospace';ctx.textAlign='center';ctx.fillText(letters[i],x+128,y+152);if(i!==5){ctx.fillRect(x+56,y+118,145,6);ctx.fillRect(x+77,y+132,118,2);}ctx.font='13px monospace';ctx.fillText('PROOF / '+String(i+1).padStart(2,'0'),x+128,y+214);}paperNoise(c,1993,9);return texture(c);}
  function proof(){
    const c=canvas(),ctx=c.getContext('2d');ctx.fillStyle='#deddd4';ctx.fillRect(0,0,1024,1024);
    ctx.strokeStyle='#77717a';ctx.lineWidth=2;
    for(const [x,y] of [[40,40],[984,40],[40,984],[984,984]]){ctx.beginPath();ctx.moveTo(x-20,y);ctx.lineTo(x+20,y);ctx.moveTo(x,y-20);ctx.lineTo(x,y+20);ctx.stroke();}
    ctx.fillStyle='#514b56';ctx.font='22px monospace';ctx.fillText('REVISION / 099 — 100',74,89);
    ctx.font='bold 111px Georgia,serif';ctx.fillStyle='#a5a0a5';ctx.fillText('Unsent.',94,291);ctx.fillStyle='#2a2730';ctx.fillText('Unsent.',83,282);
    for(let i=0;i<7;i++){ctx.fillStyle=i%3===0?'#625c65':'#2b2830';ctx.fillRect(78,340+i*74,800-i%3*126,21+i%2*6);ctx.fillStyle='#c3bfc1';ctx.fillRect(91,367+i*74,507+i%2*180,3);}
    ctx.fillStyle='#eeece4';ctx.fillRect(35,507,886,42);ctx.fillRect(224,664,700,37);
    ctx.strokeStyle='#3a343e';ctx.lineWidth=5;ctx.beginPath();ctx.moveTo(67,474);ctx.lineTo(881,410);ctx.moveTo(703,410);ctx.lineTo(881,410);ctx.lineTo(846,500);ctx.stroke();
    ctx.fillStyle='#655e68';ctx.font='20px monospace';ctx.fillText('THE PREVIOUS LINE REMAINS',73,937);
    paperNoise(c,3801,13);wear(ctx,3814,1000,false);return texture(c);
  }
  function blue(){const c=canvas(512),ctx=c.getContext('2d'),r=seededRandom(121);ctx.fillStyle='#a7b8d480';ctx.fillRect(0,0,512,512);for(let i=0;i<230;i++){ctx.globalAlpha=.08+r()*.19;ctx.strokeStyle=i%4?'#3d62a5':'#d4d5dd';ctx.lineWidth=2+r()*10;const x=r()*512,y=r()*512;ctx.beginPath();ctx.moveTo(x,y);ctx.lineTo(x+30+r()*70,y-40-r()*100);ctx.stroke();}ctx.globalAlpha=1;return texture(c);}
  return {...foil(),blue:blue(),disc:disc(),proof:proof(),letters:alphabet(),black:press('black',51),news:press('news',35),type:press('type',73),diagram:press('diagram',102),fragments:press('fragments',127),wash:press('wash',317)};
}
