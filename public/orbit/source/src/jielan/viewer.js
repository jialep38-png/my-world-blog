import * as T from 'three';
import {OrbitControls} from 'three/addons/controls/OrbitControls.js';
import {makeJielan} from './model.js?v=0240';
import {createRenderPerformance} from '../render-performance.js?v=0250';

function studio(renderer){
  const c=document.createElement('canvas');c.width=512;c.height=256;const x=c.getContext('2d');
  const g=x.createLinearGradient(0,0,0,256);g.addColorStop(0,'#eeeade');g.addColorStop(.46,'#767b72');g.addColorStop(.6,'#393d3c');g.addColorStop(1,'#99958b');x.fillStyle=g;x.fillRect(0,0,512,256);
  for(const [a,b,r] of [[95,55,105],[337,65,94],[475,105,55]]){const soft=x.createRadialGradient(a,b,0,a,b,r);soft.addColorStop(0,'#fff9ec');soft.addColorStop(.45,'#f0eadcc9');soft.addColorStop(1,'#f0eadc00');x.fillStyle=soft;x.fillRect(a-r,b-r,r*2,r*2);}
  const t=new T.CanvasTexture(c);t.colorSpace=T.SRGBColorSpace;t.mapping=T.EquirectangularReflectionMapping;const pm=new T.PMREMGenerator(renderer),e=pm.fromEquirectangular(t);t.dispose();pm.dispose();return e;
}
export function createJielanViewer(canvas,{onReady=()=>{},onError=()=>{}}={}){
  const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches,build=new URLSearchParams(location.search).get('build')==='1';
  const renderer=new T.WebGLRenderer({canvas,alpha:true,antialias:true,preserveDrawingBuffer:build,powerPreference:'low-power'});
  renderer.outputColorSpace=T.SRGBColorSpace;renderer.setClearColor('#f3f0e7',0);renderer.toneMapping=T.ACESFilmicToneMapping;renderer.toneMappingExposure=1.16;
  renderer.shadowMap.enabled=true;renderer.shadowMap.type=T.PCFSoftShadowMap;
  const scene=new T.Scene(),camera=new T.PerspectiveCamera(33,1,.1,60),world=makeJielan();scene.add(world.root);
  const env=studio(renderer);scene.environment=env.texture;scene.environmentIntensity=.38;scene.add(new T.HemisphereLight('#f8f1df','#64634e',.30));
  const key=new T.DirectionalLight('#fff5e4',2.55);key.position.set(-6,7,4);key.castShadow=true;key.shadow.mapSize.set(build?2048:1024,build?2048:1024);key.shadow.radius=3.5;Object.assign(key.shadow.camera,{left:-4,right:4,top:4,bottom:-4,near:1,far:24});key.shadow.normalBias=.008;key.shadow.bias=-.00012;scene.add(key);
  const fill=new T.DirectionalLight('#e8ede4',.60);fill.position.set(5,3,-5);scene.add(fill);
  const front=new T.DirectionalLight('#ffe8cc',.08);front.position.set(2,-3,6);scene.add(front);
  const controls=new OrbitControls(camera,canvas);controls.enablePan=false;controls.enableDamping=!reduced;controls.dampingFactor=.1;controls.minDistance=build?.7:1.5;controls.maxDistance=38;controls.rotateSpeed=.6;
  const box=new T.Box3().setFromObject(world.root),center=new T.Vector3().fromArray(world.root.userData.bodyCenter||box.getCenter(new T.Vector3()).toArray()),size=box.getSize(new T.Vector3());
  const clay=new T.MeshStandardMaterial({color:'#c6c2b4',roughness:.92,side:T.DoubleSide});
  let raf=0,disposed=false,lost=false,suspended=false,turn=false,inView=true,separated=false,assetsReady=false,amount=0,last=performance.now(),frames=0,light='studio',view='front',detail=null,fitDistance=0;
  const abort=new AbortController();
  const renderPolicy=createRenderPerformance({canvas,renderer,build,maxDpr:1.65,mobileMaxDpr:1.3,buildDpr:2,onChange:()=>{resize();invalidate();}});
  function metrics(now,force=false){frames++;if(!renderPolicy.shouldWriteDiagnostics(now,force))return;Object.assign(canvas.dataset,{ready:String(assetsReady),title:'芥兰',version:'0.24.0',solidCore:String(world.root.userData.solidCore),bodyAxes:world.root.userData.bodyAxes.join(','),bodyRadius:String(world.root.userData.bodyRadius),frames:String(frames),layers:String(world.groups.length),drawCalls:String(renderer.info.render.calls),triangles:String(renderer.info.render.triangles),autoRotate:String(turn),separated:String(separated),separation:amount.toFixed(3),light,view,detail:detail||'',camera:camera.position.toArray().map(n=>n.toFixed(4)).join(','),bounds:size.toArray().join(','),leafCount:String(world.root.userData.leafCount),modelMeshes:String(world.root.userData.meshCount),modelTriangles:String(world.root.userData.triangleCount),artRevision:String(world.root.userData.artRevision),worldRotation:world.root.rotation.y.toFixed(6),inView:String(inView),visibleSurface:String(visibleSurface()),suspended:String(suspended),study:String(scene.overrideMaterial===clay),fitCacheEntries:String(fitCache.size)});}
  function invalidate(){if(!raf&&!disposed&&!lost&&!suspended&&!document.hidden)raf=requestAnimationFrame(render);}
  // IntersectionObserver can retain the old scrolled-page intersection when
  // a canvas is reparented into a top-layer dialog. An open immersive dialog
  // is an explicit visible viewing surface, not an offscreen gallery element.
  function visibleSurface(){return inView||Boolean(canvas.closest('.exhibit-immersive[open]'));}
  function render(now){raf=0;if(disposed||lost||suspended||document.hidden)return;const dt=Math.min(Math.max((now-last)/1000,.001),.1);last=now;const visible=visibleSurface(),rotating=turn&&visible;if(rotating)world.root.rotation.y+=dt*.105;const goal=Number(separated),prior=amount;amount=reduced?goal:T.MathUtils.damp(amount,goal,9,dt);if(Math.abs(amount-goal)<.001)amount=goal;const separating=amount!==prior;if(separating)world.setSeparated(amount);const controlsChanged=controls.update();if(controlsChanged)renderPolicy.noteInteraction();renderPolicy.beforeRender(now,rotating||separating);renderer.render(scene,camera);metrics(now);if(rotating||amount!==goal||controlsChanged)invalidate();}
  // Fit the complete three-dimensional bounds in camera space. Unlike a
  // width/height-only fit this accounts for the crown, tails and near-side
  // orbit. Preserve a visitor's relative zoom on resize/fullscreen changes.
  const fitCache=new Map();
  function frame(preserveZoom=true){
    if(detail){camera.updateProjectionMatrix();return;}
    const ratio=preserveZoom&&fitDistance?camera.position.distanceTo(controls.target)/fitDistance:1;
    const dir=camera.position.clone().sub(controls.target).normalize(),right=new T.Vector3().crossVectors(camera.up,dir).normalize(),up=new T.Vector3().crossVectors(dir,right).normalize();
    const tan=Math.tan(T.MathUtils.degToRad(33)*.5);
    // Fit actual vertices, not imaginary corners of the wide orbit AABB.
    // This retains complete tips/tails at every preset while giving the
    // material body more space on narrow screens. Only runs on framing.
    world.root.updateMatrixWorld(true);const p=new T.Vector3(),cacheable=!build&&!renderPolicy.reference;
    const cacheKey=cacheable?[camera.aspect,...dir.toArray(),...up.toArray(),...controls.target.toArray(),...world.root.matrixWorld.elements,amount].join('|'):'';
    let distance=cacheable?fitCache.get(cacheKey):undefined;
    if(distance===undefined){distance=0;world.root.traverse(o=>{if(!o.isMesh||!o.visible)return;const a=o.geometry.attributes.position;for(let i=0;i<a.count;i++){p.fromBufferAttribute(a,i).applyMatrix4(o.matrixWorld).sub(controls.target);const near=p.dot(dir);distance=Math.max(distance,near+Math.abs(p.dot(up))*1.11/tan,near+Math.abs(p.dot(right))*1.11/(tan*camera.aspect));}});if(cacheable){fitCache.set(cacheKey,distance);if(fitCache.size>24)fitCache.delete(fitCache.keys().next().value);}}
    fitDistance=Math.max(distance,3);camera.fov=33;camera.position.copy(controls.target).addScaledVector(dir,fitDistance*ratio);camera.updateProjectionMatrix();
  }
  function stopInertia(){const damping=controls.enableDamping;controls.enableDamping=false;controls.update();controls.enableDamping=damping;}
  function setView(name){stopInertia();view=['front','side','back'].includes(name)?name:'front';detail=null;turn=false;world.root.rotation.set(0,0,0);controls.target.copy(center);const p=view==='back'?[-1.3,.55,-13]:view==='side'?[13,.55,.35]:[.45,1.35,13];camera.position.copy(center).add(V(p));frame(false);controls.update();renderPolicy.invalidateShadow();invalidate();}
  function resize(){const b=canvas.getBoundingClientRect();if(!b.width||!b.height)return;const changed=renderPolicy.resize(b.width,b.height),aspect=b.width/b.height,aspectChanged=Math.abs(camera.aspect-aspect)>=1e-6;if(!changed&&!aspectChanged)return;camera.aspect=aspect;if(aspectChanged||!fitDistance){frame();controls.update();}invalidate();}
  controls.addEventListener('change',invalidate);controls.addEventListener('start',()=>renderPolicy.beginInteraction());controls.addEventListener('end',()=>{renderPolicy.endInteraction();invalidate();});
  const sizes=new ResizeObserver(resize);sizes.observe(canvas);const visibility=new IntersectionObserver(([e])=>{inView=e.isIntersecting;if(inView)invalidate();});visibility.observe(canvas);
  document.addEventListener('visibilitychange',()=>{if(document.hidden){cancelAnimationFrame(raf);raf=0;}else{last=performance.now();invalidate();}},{signal:abort.signal});
  canvas.addEventListener('webglcontextlost',e=>{e.preventDefault();lost=true;cancelAnimationFrame(raf);raf=0;controls.enabled=false;onError(new Error('WebGL context lost'));},{signal:abort.signal});
  canvas.addEventListener('webglcontextrestored',()=>{if(disposed)return;lost=false;controls.enabled=true;last=performance.now();renderPolicy.invalidateShadow();onReady();invalidate();},{signal:abort.signal});
  canvas.addEventListener('keydown',e=>{if(!['ArrowLeft','ArrowRight','ArrowUp','ArrowDown'].includes(e.code))return;e.preventDefault();renderPolicy.noteInteraction();const s=new T.Spherical().setFromVector3(camera.position.clone().sub(controls.target));s.theta+=(e.code==='ArrowRight'?.13:0)-(e.code==='ArrowLeft'?.13:0);s.phi+=(e.code==='ArrowDown'?.13:0)-(e.code==='ArrowUp'?.13:0);s.makeSafe();camera.position.setFromSpherical(s).add(controls.target);controls.update();invalidate();},{signal:abort.signal});
  setView('front');resize();renderPolicy.beforeRender(performance.now());renderer.render(scene,camera);metrics(performance.now(),true);
  let reflectionTarget=null;
  const ready=world.ready.then(()=>{
    if(disposed)throw new Error('Viewer disposed while loading');
    // A small local probe reflects the actual surrounding leaves and fibres in
    // the clear glass. It is generated once after textures load, never fetched.
    reflectionTarget=new T.WebGLCubeRenderTarget(128,{type:T.HalfFloatType,generateMipmaps:true,minFilter:T.LinearMipmapLinearFilter});
    const probe=new T.CubeCamera(.025,24,reflectionTarget),hidden=[],glassMaterials=new Set(),priorBackground=scene.background;
    world.root.traverse(o=>{if(!o.isMesh)return;for(const mat of [].concat(o.material)){if(mat.transparent||mat.transmission>0){if(o.visible){hidden.push(o);o.visible=false;}}if(/specimenGlass|glassEdge|silver|amber/.test(mat.name))glassMaterials.add(mat);}});
    probe.position.set(.57,-.65,1.95);scene.background=new T.Color('#eeebdf');scene.add(probe);
    try{probe.update(renderer,scene);}finally{scene.remove(probe);scene.background=priorBackground;hidden.forEach(o=>o.visible=true);}
    glassMaterials.forEach(mat=>{mat.envMap=reflectionTarget.texture;mat.envMapIntensity=1.25;mat.needsUpdate=true;});
    assetsReady=true;renderPolicy.invalidateShadow();renderPolicy.beforeRender(performance.now());renderer.render(scene,camera);metrics(performance.now(),true);onReady();invalidate();
  });
  ready.catch(onError);
  return {
    ready,
    setTurn(value){turn=Boolean(value);last=performance.now();invalidate();},
    setSeparated(value){separated=Boolean(value);last=performance.now();invalidate();},
    setLight(cool){light=cool?'cool':'studio';key.color.set(cool?'#e4ecff':'#fff5e4');scene.environmentIntensity=cool?.54:.38;renderPolicy.invalidateShadow();invalidate();},
    setView,
    reset(){separated=false;amount=0;world.setSeparated(0);scene.overrideMaterial=null;light='studio';key.color.set('#fff5e4');scene.environmentIntensity=.38;renderPolicy.invalidateShadow();setView('front');},
    setDetail(name){stopInertia();detail=['leaves','linen','glass'].includes(name)?name:'leaves';turn=false;world.root.rotation.set(0,0,0);const targets=world.root.userData.detailTargets;const offsets={leaves:[-.55,.35,3.0],linen:[-.25,.35,2.50],glass:[.3,.25,2.4]};controls.target.fromArray(targets[detail]);camera.position.copy(controls.target).add(V(offsets[detail]));camera.fov=33;camera.updateProjectionMatrix();controls.update();renderPolicy.invalidateShadow();invalidate();},
    setStudy(value){scene.overrideMaterial=value?clay:null;invalidate();},
    suspend(value){suspended=Boolean(value);if(suspended){cancelAnimationFrame(raf);raf=0;}else{last=performance.now();invalidate();}},
    async capture({background=false}={}){await ready;if(lost||disposed)throw new Error('Renderer unavailable');renderPolicy.invalidateShadow();renderPolicy.beforeRender(performance.now());renderer.render(scene,camera);let target=canvas;if(background){target=document.createElement('canvas');target.width=canvas.width;target.height=canvas.height;const ctx=target.getContext('2d');ctx.fillStyle='#f3f0e7';ctx.fillRect(0,0,target.width,target.height);ctx.drawImage(canvas,0,0);}return new Promise((resolve,reject)=>target.toBlob(b=>b?resolve(b):reject(new Error('Capture failed')),'image/png'));},
    async exportGLB(){await ready;const {GLTFExporter}=await import('three/addons/exporters/GLTFExporter.js');const rotation=world.root.rotation.clone();try{world.root.rotation.set(0,0,0);world.setSeparated(0);world.root.updateMatrixWorld(true);return await new GLTFExporter().parseAsync(world.root,{binary:true,onlyVisible:true,maxTextureSize:1536});}finally{world.root.rotation.copy(rotation);world.setSeparated(amount);invalidate();}},
    stats(){return {...canvas.dataset};},
    dispose(){if(disposed)return;disposed=true;cancelAnimationFrame(raf);abort.abort();sizes.disconnect();visibility.disconnect();renderPolicy.dispose();controls.dispose();world.dispose();clay.dispose();key.shadow.dispose();reflectionTarget?.dispose();env.dispose();scene.clear();renderer.dispose();}
  };
}
function V(p){return new T.Vector3(...p);}
