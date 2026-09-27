import * as T from 'three';
/** A small studio reflection map gives pewter, water and glazed porcelain distinct highlights. */
export function makeCollageLight(renderer){
  const canvas=document.createElement('canvas');canvas.width=512;canvas.height=256;const c=canvas.getContext('2d');
  const sky=c.createLinearGradient(0,0,0,256);sky.addColorStop(0,'#edf0e7');sky.addColorStop(.48,'#b1bcb3');sky.addColorStop(.51,'#89968b');sky.addColorStop(1,'#53635a');c.fillStyle=sky;c.fillRect(0,0,512,256);
  for(const [x,y,w,h] of [[75,35,52,105],[308,55,88,74],[430,30,20,92]]){const glow=c.createRadialGradient(x+w/2,y+h/2,4,x+w/2,y+h/2,80);glow.addColorStop(0,'#fff9e7');glow.addColorStop(.4,'#d9e1d4');glow.addColorStop(1,'#91a49b00');c.fillStyle=glow;c.fillRect(x-50,y-35,w+100,h+70);c.fillStyle='#fff9ec';c.fillRect(x,y,w,h);}
  const texture=new T.CanvasTexture(canvas);texture.mapping=T.EquirectangularReflectionMapping;texture.colorSpace=T.SRGBColorSpace;
  const generator=new T.PMREMGenerator(renderer),target=generator.fromEquirectangular(texture);texture.dispose();generator.dispose();
  return {texture:target.texture,dispose:()=>target.dispose()};
}
