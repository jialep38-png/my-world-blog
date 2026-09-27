import * as T from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { makeCrossover } from './model.js';
import { createRenderPerformance } from '../render-performance.js?v=0250';

function studioEnvironment(renderer){
  const canvas=document.createElement('canvas');canvas.width=1024;canvas.height=512;const c=canvas.getContext('2d');
  const fill=c.createLinearGradient(0,0,0,512);fill.addColorStop(0,'#f1f1f3');fill.addColorStop(.45,'#73727d');fill.addColorStop(.51,'#24222a');fill.addColorStop(1,'#666471');c.fillStyle=fill;c.fillRect(0,0,1024,512);
  for(const [x,y,w,h] of [[70,25,155,220],[535,55,190,175],[882,23,46,250]]){c.fillStyle='#fffefd';c.fillRect(x,y,w,h);}
  const tex=new T.CanvasTexture(canvas);tex.colorSpace=T.SRGBColorSpace;tex.mapping=T.EquirectangularReflectionMapping;
  const pmrem=new T.PMREMGenerator(renderer),target=pmrem.fromEquirectangular(tex);tex.dispose();pmrem.dispose();return target;
}

export function createCrossoverViewer(canvas,{onReady=()=>{},onError=()=>{},glyphs={}}={}){
  const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
  const build=new URLSearchParams(location.search).get('build')==='1';
  const renderer=new T.WebGLRenderer({canvas,alpha:true,antialias:true,powerPreference:'low-power',preserveDrawingBuffer:false});
  renderer.setClearColor(0xe4e3e0,0);renderer.outputColorSpace=T.SRGBColorSpace;
  renderer.toneMapping=T.ACESFilmicToneMapping;renderer.toneMappingExposure=.95;renderer.shadowMap.enabled=true;renderer.shadowMap.type=T.PCFSoftShadowMap;
  const scene=new T.Scene(),camera=new T.PerspectiveCamera(38,1,.1,80);camera.position.set(.0,.24,16.6);
  const world=makeCrossover({glyphs});scene.add(world.root);
  const environment=studioEnvironment(renderer);scene.environment=environment.texture;scene.environmentIntensity=1.0;
  const ambient=new T.HemisphereLight('#f0eff3','#35333b',1.20);scene.add(ambient);
  const key=new T.DirectionalLight('#fffaf4',3.7);key.position.set(-6,8,10);key.castShadow=true;key.shadow.mapSize.set(2048,2048);key.shadow.camera.left=-6;key.shadow.camera.right=6;key.shadow.camera.top=6;key.shadow.camera.bottom=-6;key.shadow.camera.near=1;key.shadow.camera.far=30;key.shadow.normalBias=.013;scene.add(key);
  const rim=new T.DirectionalLight('#dce3f5',1.45);rim.position.set(6,-1,-4);scene.add(rim);
  const control=new OrbitControls(camera,canvas);control.target.set(0,.15,0);control.enablePan=false;control.enableDamping=!reduced;control.dampingFactor=.09;control.minDistance=10;control.maxDistance=25;control.rotateSpeed=.62;
  let frame=0,disposed=false,lost=false,suspended=false,turn=false,separated=false,separation=0,cold=false,inView=true,renderCount=0,frameTime=performance.now(),detailFov=null;
  const signal=new AbortController();
  const renderPolicy=createRenderPerformance({canvas,renderer,build,maxDpr:1.7,mobileMaxDpr:1.7,adaptiveMobileMaxDpr:1.25,buildDpr:1.7,onChange:()=>{resize();invalidate();}});
  function visibleSurface(){return inView||Boolean(canvas.closest('.exhibit-immersive[open]'));}
  function resize(){const r=canvas.getBoundingClientRect();if(!r.width||!r.height)return;const changed=renderPolicy.resize(r.width,r.height),aspect=r.width/r.height,fov=detailFov??(aspect<.83?48:38);if(!changed&&Math.abs(camera.aspect-aspect)<1e-6&&camera.fov===fov)return;camera.aspect=aspect;camera.fov=fov;camera.updateProjectionMatrix();invalidate();}
  function metrics(now,force=false){renderCount++;if(!renderPolicy.shouldWriteDiagnostics(now,force))return;canvas.dataset.ready='true';canvas.dataset.title='删了一百遍';canvas.dataset.frames=String(renderCount);canvas.dataset.triangles=String(renderer.info.render.triangles);canvas.dataset.drawCalls=String(renderer.info.render.calls);canvas.dataset.layers=String(world.root.userData.layers);canvas.dataset.autoRotate=String(turn);canvas.dataset.separated=String(separated);canvas.dataset.separation=separation.toFixed(3);canvas.dataset.light=cold?'cool':'studio';canvas.dataset.camera=camera.position.toArray().map(n=>n.toFixed(4)).join(',');}
  function render(now){frame=0;if(disposed||lost||suspended||document.hidden)return;const dt=Math.min((now-frameTime)/1000,.2);frameTime=now;
    const rotating=turn&&visibleSurface();if(rotating)world.root.rotation.y+=dt*.13;
    const goal=Number(separated),prior=separation;separation=reduced?goal:T.MathUtils.damp(separation,goal,8,dt);if(Math.abs(separation-goal)<.002)separation=goal;const separating=separation!==prior;if(separating)world.setSeparated(separation);
    const controlsChanged=control.update();if(controlsChanged)renderPolicy.noteInteraction();renderPolicy.beforeRender(now,rotating||separating);renderer.render(scene,camera);metrics(now);
    if(rotating||separation!==goal||controlsChanged)invalidate(false);
  }
  function invalidate(){if(disposed||lost||suspended)return;if(!frame&&!document.hidden){frameTime=performance.now();frame=requestAnimationFrame(render);}}
  control.addEventListener('change',()=>invalidate());control.addEventListener('start',()=>renderPolicy.beginInteraction());control.addEventListener('end',()=>{renderPolicy.endInteraction();invalidate();});
  const sizeObserver=new ResizeObserver(resize);sizeObserver.observe(canvas);
  const visibility=new IntersectionObserver(([e])=>{inView=e.isIntersecting;if(inView)invalidate();});visibility.observe(canvas);
  document.addEventListener('visibilitychange',()=>{if(document.hidden){cancelAnimationFrame(frame);frame=0;}else invalidate();},{signal:signal.signal});
  canvas.addEventListener('webglcontextlost',e=>{e.preventDefault();lost=true;cancelAnimationFrame(frame);frame=0;control.enabled=false;onError('三维画面暂时不可用，已保留概念实景图。');},{signal:signal.signal});
  canvas.addEventListener('keydown',e=>{
    if(!['ArrowLeft','ArrowRight','ArrowUp','ArrowDown'].includes(e.code))return;e.preventDefault();
    renderPolicy.noteInteraction();const spherical=new T.Spherical().setFromVector3(camera.position.clone().sub(control.target));
    if(e.code==='ArrowLeft')spherical.theta-=.14;if(e.code==='ArrowRight')spherical.theta+=.14;
    if(e.code==='ArrowUp')spherical.phi-=.14;if(e.code==='ArrowDown')spherical.phi+=.14;spherical.makeSafe();camera.position.setFromSpherical(spherical).add(control.target);control.update();invalidate();
  },{signal:signal.signal});
  resize();renderPolicy.beforeRender(performance.now());renderer.render(scene,camera);metrics(performance.now(),true);onReady();
  return {
    setTurn(value){turn=Boolean(value);invalidate();},
    setSeparated(value){separated=Boolean(value);invalidate();},
    setLight(value){cold=Boolean(value);key.color.set(cold?'#d6e2ff':'#fffaf4');rim.color.set(cold?'#ffd9d9':'#dce3f5');scene.environmentIntensity=cold?1.18:1.0;renderPolicy.invalidateShadow();invalidate();},
    setView(kind){world.root.rotation.set(0,0,0);turn=false;detailFov=null;control.minDistance=10;control.target.set(0,.15,0);camera.position.set(...(kind==='back'?[0,.24,-16.6]:kind==='side'?[16.6,1.1,.35]:[0,.24,16.6]));resize();control.update();renderPolicy.invalidateShadow();invalidate();},
    setDetail(kind){
      const views={disc:{target:[.1,-.25,3.36],position:[1.8,1.25,8.0],fov:28},wire:{target:[1.75,1.3,2.93],position:[6.1,3.0,6.6],fov:26},proof:{target:[-.2,-1.10,3.40],position:[-3.2,-2.7,6.8],fov:27}};
      const view=views[kind];if(!view)throw new Error('Unknown material study');turn=false;world.root.rotation.set(0,0,0);control.minDistance=1;control.target.set(...view.target);camera.position.set(...view.position);detailFov=view.fov;resize();control.update();renderPolicy.invalidateShadow();invalidate();
    },
    suspend(value){suspended=Boolean(value);if(suspended){cancelAnimationFrame(frame);frame=0;}else invalidate();},
    async exportGLB(){const {GLTFExporter}=await import('three/addons/exporters/GLTFExporter.js');const rotation=world.root.rotation.clone();try{world.root.rotation.set(0,0,0);world.setSeparated(0);world.root.updateMatrixWorld(true);return await new GLTFExporter().parseAsync(world.root,{binary:true,onlyVisible:true,maxTextureSize:1024});}finally{world.root.rotation.copy(rotation);world.setSeparated(separation);invalidate();}},
    async capture({background=false}={}){if(disposed||lost)throw new Error('Renderer unavailable');renderPolicy.invalidateShadow();renderPolicy.beforeRender(performance.now());renderer.render(scene,camera);let output=canvas;if(background){output=document.createElement('canvas');output.width=canvas.width;output.height=canvas.height;const ctx=output.getContext('2d');ctx.fillStyle='#e4e3e0';ctx.fillRect(0,0,output.width,output.height);ctx.drawImage(canvas,0,0);}return await new Promise((resolve,reject)=>output.toBlob(b=>b?resolve(b):reject(new Error('Image export failed')),'image/png'));},
    stats(){return {...canvas.dataset,sceneVersion:world.root.userData.sceneVersion,cameraTarget:control.target.toArray(),cameraFov:camera.fov};},
    dispose(){disposed=true;cancelAnimationFrame(frame);signal.abort();sizeObserver.disconnect();visibility.disconnect();renderPolicy.dispose();control.dispose();world.dispose();environment.dispose();renderer.dispose();}
  };
}
