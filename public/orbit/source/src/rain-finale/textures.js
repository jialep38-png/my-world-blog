/** Original, deterministic material artwork for 雨终曲. No cover-photo texture.
 * Colour textures are sRGB; the crease normal and roughness maps are linear data.
 */
import * as T from 'three';
import { seededRandom } from '../math.js';

const makeCanvas = (n = 1024) => Object.assign(document.createElement('canvas'), {width:n, height:n});
function tex(c, data = false) {
  const t = new T.CanvasTexture(c); t.colorSpace = data ? T.NoColorSpace : T.SRGBColorSpace;
  t.anisotropy = 8; return t;
}
function grain(c, seed, amount = 15) {
  const ctx=c.getContext('2d'), r=seededRandom(seed), img=ctx.getImageData(0,0,c.width,c.height);
  for(let i=0;i<img.data.length;i+=4){const n=(r()-.5)*amount; for(let j=0;j<3;j++)img.data[i+j]+=n;}
  ctx.putImageData(img,0,0);
}
export function makeRainTextures(glyphs = {}) {
  const paths = new Map(Object.entries(glyphs).map(([ch,d])=>[ch,new Path2D(d)]));
  function glyph(ctx,ch,x,y,sx,sy,color) {
    ctx.save();ctx.fillStyle=color;
    if(paths.has(ch)){ctx.translate(x,y);ctx.scale(sx/100,-sy/100);ctx.fill(paths.get(ch));}
    else{ctx.font=`900 ${sy}px "Songti SC",serif`;ctx.fillText(ch,x,y);}
    ctx.restore();
  }
  function print(seed, dark = false) {
    const c=makeCanvas(),ctx=c.getContext('2d'),r=seededRandom(seed);
    ctx.fillStyle=dark?'#12131c':'#b6b6c0';ctx.fillRect(0,0,1024,1024);
    for(let i=0;i<170;i++){
      const x=r()*1024,y=r()*1024;ctx.fillStyle=dark?'#bcbcd014':'#2b2a3b12';
      ctx.beginPath();ctx.moveTo(x,y);ctx.lineTo(x+r()*270,y-r()*150);ctx.lineTo(x+r()*120,y+r()*100);ctx.fill();
    }
    glyph(ctx,'雨',-70,735,480,920,dark?'#8c8d9b':'#1b1b28');
    glyph(ctx,'终',285,624,430,824,dark?'#494c62':'#292434');
    glyph(ctx,'曲',622,810,408,890,dark?'#ababb4':'#171825');
    // Oblique cut-outs fracture the printed title, not the page's accessible name.
    ctx.strokeStyle=dark?'#101019':'#c6c5ce';
    for(let i=0;i<19;i++){const x=r()*1300;ctx.lineWidth=2+r()*11;ctx.beginPath();ctx.moveTo(x,-20);ctx.lineTo(x-530,1040);ctx.stroke();}
    ctx.save();ctx.translate(145,716);ctx.rotate(-.15);ctx.fillStyle=dark?'#cbcbd4':'#292536';ctx.font='bold 114px Georgia,serif';ctx.fillText('Rain',0,0);ctx.fillText('Finale.',202,121);ctx.restore();
    ctx.fillStyle=dark?'#999fac':'#302c3a';ctx.font='18px monospace';ctx.fillText('OBJECT 003  /  AFTER THE LAST DROP',95,955);
    // Small registration dots are accents, not a colourful central medallion.
    for(const [i,color] of ['#6e8acf','#b892b9','#545d91'].entries()){ctx.fillStyle=color;ctx.beginPath();ctx.arc(732+i*48,826,9,0,Math.PI*2);ctx.fill();}
    for(let i=0;i<3200;i++){ctx.globalAlpha=.12+r()*.3;ctx.fillStyle=i%2?'#d0cfd5':'#171927';ctx.fillRect(r()*1024,r()*1024,.4+r()*2,.4+r()*3);}
    ctx.globalAlpha=1;grain(c,seed+1,19);return tex(c);
  }
  function crease() {
    const n=512,c=makeCanvas(n),normal=makeCanvas(n),rough=makeCanvas(n),h=new Float32Array(n*n),r=seededRandom(71307);
    const axes=Array.from({length:8},()=>({a:r()*6.28,f:9+r()*28,p:r()*6}));
    const ctx=c.getContext('2d'),img=ctx.createImageData(n,n),ni=ctx.createImageData(n,n),ri=ctx.createImageData(n,n);
    for(let y=0;y<n;y++)for(let x=0;x<n;x++){
      const u=x/n,v=y/n;let a=0;
      for(const ax of axes)a+=Math.pow(Math.abs(Math.sin((u*Math.cos(ax.a)+v*Math.sin(ax.a)+.032*Math.sin(v*21+u*11))*ax.f+ax.p)),.32);
      h[y*n+x]=a/8;
      const i=(y*n+x)*4,gr=(r()-.5)*16;
      for(let k=0;k<3;k++){img.data[i+k]=205+a*3+gr;ri.data[i+k]=105+a*13+gr;}
      img.data[i+3]=ri.data[i+3]=255;
    }
    for(let y=0;y<n;y++)for(let x=0;x<n;x++){
      const dx=(h[y*n+(x+1)%n]-h[y*n+(x+n-1)%n])*13,dy=(h[((y+1)%n)*n+x]-h[((y+n-1)%n)*n+x])*13,inv=1/Math.hypot(dx,dy,1),i=(y*n+x)*4;
      ni.data[i]=128-dx*inv*127;ni.data[i+1]=128+dy*inv*127;ni.data[i+2]=128+inv*127;ni.data[i+3]=255;
    }
    ctx.putImageData(img,0,0);normal.getContext('2d').putImageData(ni,0,0);rough.getContext('2d').putImageData(ri,0,0);
    return {silver:tex(c),normal:tex(normal,true),rough:tex(rough,true)};
  }
  function gauze() {
    const c=makeCanvas(512),ctx=c.getContext('2d'),r=seededRandom(710);
    for(let j=0;j<33;j++){
      const p=j*16;
      for(let k=0;k<2;k++){
        ctx.strokeStyle=k?'#aaaabaaf':'#e5e4edee';ctx.lineWidth=k?.5:.85;
        ctx.beginPath();ctx.moveTo(p+k,0);
        for(let y=0;y<=512;y+=8)ctx.lineTo(p+k+Math.sin(y*.12+j)*.35,y);ctx.stroke();
        ctx.beginPath();ctx.moveTo(0,p+k);
        for(let x=0;x<=512;x+=8)ctx.lineTo(x,p+k+Math.sin(x*.15+j)*.35);ctx.stroke();
      }
    }
    for(let i=0;i<240;i++){ctx.fillStyle='#eeeefa90';ctx.fillRect(r()*512,r()*512,.5,1+r()*5);}
    const t=tex(c);t.wrapS=t.wrapT=T.RepeatWrapping;return t;
  }
  function letters() {
    const c=makeCanvas(),ctx=c.getContext('2d');const chars='RAINFINALE雨终曲';
    for(let i=0;i<16;i++){
      const x=i%4*256,y=Math.floor(i/4)*256,ch=chars[i%chars.length];
      if(paths.has(ch))glyph(ctx,ch,x+40,y+212,170,218,'#bec0c9');
      else{ctx.fillStyle='#c6c7cd';ctx.font='bold 216px Georgia,serif';ctx.textAlign='center';ctx.fillText(ch,x+128,y+212);}
      ctx.save();ctx.globalCompositeOperation='destination-out';ctx.lineWidth=5;ctx.beginPath();ctx.moveTo(x+210,y);ctx.lineTo(x+74,y+256);ctx.stroke();ctx.restore();
    }
    grain(c,881,22);return tex(c);
  }
  return {...crease(),label:print(811),blackPrint:print(956,true),gauze:gauze(),letters:letters()};
}
