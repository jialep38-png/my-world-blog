import * as T from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { makeYesterdayToday } from './model.js';
import { createRenderPerformance } from '../render-performance.js?v=0250';

function studio(renderer){
  const c=document.createElement('canvas');c.width=1024;c.height=512;const x=c.getContext('2d');
  const g=x.createLinearGradient(0,0,0,512);g.addColorStop(0,'#fbf3ef');g.addColorStop(.37,'#a29aad');g.addColorStop(.55,'#494252');g.addColorStop(1,'#9b8999');x.fillStyle=g;x.fillRect(0,0,1024,512);
  for(const [a,b,w,h] of [[100,24,180,175],[510,45,128,228],[855,0,40,286]]){x.fillStyle='#fffaf7';x.fillRect(a,b,w,h);}
  x.fillStyle='#da94b5';x.fillRect(320,160,60,170);x.fillStyle='#b6b7dd';x.fillRect(750,230,72,130);
  const t=new T.CanvasTexture(c);t.colorSpace=T.SRGBColorSpace;t.mapping=T.EquirectangularReflectionMapping;
  const pm=new T.PMREMGenerator(renderer),target=pm.fromEquirectangular(t);pm.dispose();t.dispose();return target;
}

export function createYesterdayViewer(canvas,{onReady=()=>{},onError=()=>{}}={}){
  const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
  const build=new URLSearchParams(location.search).get('build')==='1';
  const renderer=new T.WebGLRenderer({canvas,alpha:true,antialias:true,powerPreference:'low-power'});
  renderer.outputColorSpace=T.SRGBColorSpace;
  renderer.setClearColor('#f2eee7',0);renderer.toneMapping=T.ACESFilmicToneMapping;renderer.toneMappingExposure=1.02;
  renderer.shadowMap.enabled=true;renderer.shadowMap.type=T.PCFSoftShadowMap;
  const scene=new T.Scene(),camera=new T.PerspectiveCamera(33,1,.1,60);camera.position.set(1.45,.86,13.15);
  const world=makeYesterdayToday();scene.add(world.root);
  const env=studio(renderer);scene.environment=env.texture;scene.environmentIntensity=.78;
  scene.add(new T.HemisphereLight('#faf1e8','#53465e',.86));
  const key=new T.DirectionalLight('#fff1e3',2.95);key.position.set(-5,7,9);key.castShadow=true;
  key.shadow.mapSize.set(build?2048:1024,build?2048:1024);Object.assign(key.shadow.camera,{left:-5,right:5,top:5,bottom:-5,near:1,far:28});key.shadow.normalBias=.02;key.shadow.bias=-.00015;scene.add(key);
  const fill=new T.DirectionalLight('#c6c3ef',1.05);fill.position.set(6,3,-5);scene.add(fill);
  const front=new T.DirectionalLight('#fce7f1',.45);front.position.set(2,-2,8);scene.add(front);
  const controls=new OrbitControls(camera,canvas);controls.target.set(0,.06,0);controls.enablePan=false;controls.enableDamping=!reduced;controls.dampingFactor=.09;controls.minDistance=build?1.5:5;controls.maxDistance=23;controls.rotateSpeed=.58;
  const clay=new T.MeshStandardMaterial({color:'#c6beb8',roughness:.94,side:T.DoubleSide});
  let raf=0,last=performance.now(),frames=0,disposed=false,lost=false,suspended=false,inView=true,turn=false,separated=false,amount=0,light='studio';
  const abort=new AbortController();
  const renderPolicy=createRenderPerformance({canvas,renderer,build,maxDpr:1.65,mobileMaxDpr:1.3,buildDpr:2,onChange:()=>{resize();invalidate();}});
  function visibleSurface(){return inView||Boolean(canvas.closest('.exhibit-immersive[open]'));}
  function metrics(now,force=false){frames++;if(!renderPolicy.shouldWriteDiagnostics(now,force))return;Object.assign(canvas.dataset,{ready:'true',title:'昨天，今天',version:world.root.userData.version,wrapTreatment:world.root.userData.wrapTreatment,centerTreatment:world.root.userData.centerTreatment,centerHasText:String(world.root.userData.centerHasText),frames:String(frames),layers:String(world.groups.length),drawCalls:String(renderer.info.render.calls),triangles:String(renderer.info.render.triangles),autoRotate:String(turn),separated:String(separated),separation:amount.toFixed(3),light,camera:camera.position.toArray().map(n=>n.toFixed(4)).join(','),coreAxes:world.root.userData.coreAxes.join(','),labelRadius:String(world.root.userData.labelRadius)});}
  function invalidate(){if(!raf&&!disposed&&!lost&&!suspended&&!document.hidden)raf=requestAnimationFrame(render);}
  function render(now){
    raf=0;if(disposed||lost||suspended||document.hidden)return;
    const dt=Math.min(Math.max((now-last)/1000,.001),.1);last=now;
    const rotating=turn&&visibleSurface();if(rotating)world.root.rotation.y+=dt*.105;
    const goal=Number(separated),prior=amount;amount=reduced?goal:T.MathUtils.damp(amount,goal,9,dt);if(Math.abs(amount-goal)<.001)amount=goal;const separating=amount!==prior;if(separating)world.setSeparated(amount);
    const controlsChanged=controls.update();if(controlsChanged)renderPolicy.noteInteraction();renderPolicy.beforeRender(now,rotating||separating);renderer.render(scene,camera);metrics(now);
    if(rotating||amount!==goal||controlsChanged)invalidate();
  }
  function frame(){camera.fov=T.MathUtils.radToDeg(2*Math.atan(Math.max(7.35,6.7/camera.aspect)/(2*13.33)));camera.updateProjectionMatrix();}
  function resize(){const b=canvas.getBoundingClientRect();if(!b.width||!b.height)return;const changed=renderPolicy.resize(b.width,b.height),aspect=b.width/b.height;if(!changed&&Math.abs(camera.aspect-aspect)<1e-6)return;camera.aspect=aspect;frame();invalidate();}
  controls.addEventListener('change',invalidate);controls.addEventListener('start',()=>renderPolicy.beginInteraction());controls.addEventListener('end',()=>{renderPolicy.endInteraction();invalidate();});
  const sizes=new ResizeObserver(resize);sizes.observe(canvas);
  const visibility=new IntersectionObserver(([e])=>{inView=e.isIntersecting;if(inView){last=performance.now();invalidate();}});visibility.observe(canvas);
  document.addEventListener('visibilitychange',()=>{if(document.hidden){cancelAnimationFrame(raf);raf=0;}else{last=performance.now();invalidate();}},{signal:abort.signal});
  canvas.addEventListener('webglcontextlost',e=>{e.preventDefault();lost=true;cancelAnimationFrame(raf);raf=0;controls.enabled=false;onError();},{signal:abort.signal});
  canvas.addEventListener('keydown',e=>{
    if(!['ArrowLeft','ArrowRight','ArrowUp','ArrowDown'].includes(e.code))return;e.preventDefault();
    renderPolicy.noteInteraction();const s=new T.Spherical().setFromVector3(camera.position.clone().sub(controls.target));
    s.theta+=(e.code==='ArrowRight'?.13:0)-(e.code==='ArrowLeft'?.13:0);s.phi+=(e.code==='ArrowDown'?.13:0)-(e.code==='ArrowUp'?.13:0);s.makeSafe();camera.position.setFromSpherical(s).add(controls.target);controls.update();invalidate();
  },{signal:abort.signal});
  resize();renderPolicy.beforeRender(performance.now());renderer.render(scene,camera);metrics(performance.now(),true);onReady();
  return {
    setTurn(value){turn=Boolean(value);last=performance.now();invalidate();},
    setSeparated(value){separated=Boolean(value);last=performance.now();invalidate();},
    setLight(cool){light=cool?'cool':'studio';key.color.set(cool?'#dde4ff':'#fff1e3');fill.color.set(cool?'#ecc4dc':'#c6c3ef');scene.environmentIntensity=cool?.91:.78;renderPolicy.invalidateShadow();invalidate();},
    setView(view){turn=false;world.root.rotation.set(0,0,0);controls.target.set(0,.06,0);camera.position.set(...(view==='back'?[-2.4,1.45,-13.1]:view==='side'?[13.25,1.1,.5]:[1.45,.86,13.15]));frame();controls.update();renderPolicy.invalidateShadow();invalidate();},
    setDetail(name){turn=false;world.root.rotation.set(0,0,0);const views={record:[[-.24,.06,2.05],[.63,.49,6.65]],conduit:[[.97,1.02,1.79],[2.8,2.48,5.38]],feather:[[-.30,-1.47,1.78],[.45,-.85,5.23]]};const [target,position]=views[name]||views.record;controls.target.set(...target);camera.position.set(...position);camera.fov=33;camera.updateProjectionMatrix();controls.update();renderPolicy.invalidateShadow();invalidate();},
    setStudy(value){scene.overrideMaterial=value?clay:null;invalidate();},
    suspend(value){suspended=Boolean(value);if(suspended){cancelAnimationFrame(raf);raf=0;}else{last=performance.now();invalidate();}},
    async capture({background=false}={}){
      if(lost||disposed)throw new Error('Renderer unavailable');renderPolicy.invalidateShadow();renderPolicy.beforeRender(performance.now());renderer.render(scene,camera);let target=canvas;
      if(background){target=document.createElement('canvas');target.width=canvas.width;target.height=canvas.height;const ctx=target.getContext('2d');ctx.fillStyle='#f2eee7';ctx.fillRect(0,0,target.width,target.height);ctx.drawImage(canvas,0,0);}
      return new Promise((resolve,reject)=>target.toBlob(b=>b?resolve(b):reject(new Error('Capture failed')),'image/png'));
    },
    async exportGLB(){
      const {GLTFExporter}=await import('three/addons/exporters/GLTFExporter.js');const rotation=world.root.rotation.clone();
      try{world.root.rotation.set(0,0,0);world.setSeparated(0);world.root.updateMatrixWorld(true);return await new GLTFExporter().parseAsync(world.root,{binary:true,onlyVisible:true,maxTextureSize:1024});}
      finally{world.root.rotation.copy(rotation);world.setSeparated(amount);invalidate();}
    },
    stats(){return {...canvas.dataset};},
    dispose(){disposed=true;cancelAnimationFrame(raf);abort.abort();sizes.disconnect();visibility.disconnect();renderPolicy.dispose();controls.dispose();world.dispose();clay.dispose();env.dispose();renderer.dispose();}
  };
}
