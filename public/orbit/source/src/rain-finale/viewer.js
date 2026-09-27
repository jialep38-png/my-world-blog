import * as T from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';
import { ShaderPass } from 'three/addons/postprocessing/ShaderPass.js';
import { seededRandom } from '../math.js';
import { makeRainFinale } from './model.js';
import { createRenderPerformance } from '../render-performance.js?v=0250';

function studio(renderer){
  const c=Object.assign(document.createElement('canvas'),{width:1024,height:512}),ctx=c.getContext('2d');
  const g=ctx.createLinearGradient(0,0,0,512);g.addColorStop(0,'#6d738c');g.addColorStop(.45,'#343947');g.addColorStop(.56,'#090b14');g.addColorStop(1,'#33394b');ctx.fillStyle=g;ctx.fillRect(0,0,1024,512);
  for(const [x,y,w,h,col] of [[95,20,135,215,'#eff1f8'],[585,65,93,220,'#e1e8ff'],[850,70,27,225,'#aebfef'],[310,20,15,160,'#ccdaff'],[704,310,150,28,'#445e9a']]){ctx.fillStyle=col;ctx.fillRect(x,y,w,h);}
  const t=new T.CanvasTexture(c);t.colorSpace=T.SRGBColorSpace;t.mapping=T.EquirectangularReflectionMapping;
  const pmrem=new T.PMREMGenerator(renderer),target=pmrem.fromEquirectangular(t);t.dispose();pmrem.dispose();return target;
}
function atmosphere(){
  const c=Object.assign(document.createElement('canvas'),{width:512,height:512}),ctx=c.getContext('2d');
  const g=ctx.createRadialGradient(256,256,0,256,256,255);g.addColorStop(0,'#35477970');g.addColorStop(.35,'#242d5540');g.addColorStop(1,'#090b1000');ctx.fillStyle=g;ctx.fillRect(0,0,512,512);
  const tex=new T.CanvasTexture(c);tex.colorSpace=T.SRGBColorSpace;
  const m=new T.Mesh(new T.PlaneGeometry(12,12),new T.MeshBasicMaterial({map:tex,transparent:true,depthWrite:false}));m.position.set(-.5,.4,-4);return m;
}

export function createRainViewer(canvas,{glyphs={},onReady=()=>{},onError=()=>{}}={}){
  const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
  const build=new URLSearchParams(location.search).get('build')==='1';
  const renderer=new T.WebGLRenderer({canvas,antialias:true,powerPreference:'low-power',preserveDrawingBuffer:false});
  renderer.setClearColor('#090b10');renderer.outputColorSpace=T.SRGBColorSpace;
  renderer.toneMapping=T.ACESFilmicToneMapping;renderer.toneMappingExposure=.92;
  renderer.shadowMap.enabled=true;renderer.shadowMap.type=T.PCFSoftShadowMap;renderer.info.autoReset=false;
  const scene=new T.Scene(),camera=new T.PerspectiveCamera(35,1,.1,70);camera.position.set(0,.22,13.2);
  const world=makeRainFinale({glyphs});scene.add(world.root);
  const env=studio(renderer);scene.environment=env.texture;scene.environmentIntensity=.88;
  const haze=atmosphere();scene.add(haze);
  const ambient=new T.HemisphereLight('#a6b1db','#171727',.95);scene.add(ambient);
  const key=new T.DirectionalLight('#e2e8ff',2.55);key.position.set(-5,7,9);key.castShadow=true;key.shadow.mapSize.set(2048,2048);Object.assign(key.shadow.camera,{left:-5,right:5,top:5,bottom:-5,near:1,far:30});key.shadow.normalBias=.018;key.shadow.bias=-.0001;scene.add(key);
  const rim=new T.DirectionalLight('#b2c0df',.95);rim.position.set(5,2,-5);scene.add(rim);
  const fill=new T.DirectionalLight('#b6bdde',.90);fill.position.set(1,-3,7);scene.add(fill);
  const blue=new T.PointLight('#124cff',16,10,2);blue.position.set(-2.1,.2,3.9);scene.add(blue);
  const ice=new T.PointLight('#2589ff',8,9,2);ice.position.set(-1.4,-1.5,3.5);scene.add(ice);
  const composer=new EffectComposer(renderer),renderPass=new RenderPass(scene,camera),bloom=new UnrealBloomPass(new T.Vector2(800,800),.38,.33,2.0),output=new OutputPass();composer.addPass(renderPass);composer.addPass(bloom);composer.addPass(output);
  // A restrained print grade is part of the live viewer, including screenshots:
  // charcoal blacks, cool silver highlights and fixed fine grain, no flicker.
  const grade=new ShaderPass({uniforms:{tDiffuse:{value:null}},vertexShader:'varying vec2 vUv; void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}',fragmentShader:'uniform sampler2D tDiffuse; varying vec2 vUv; void main(){vec3 c=texture2D(tDiffuse,vUv).rgb;vec3 black=vec3(.055,.070,.10);c=max((c-black)/(vec3(1.)-black),vec3(0.));float vignette=1.-.11*pow(length((vUv-.5)*1.4),2.);float grain=(fract(sin(dot(gl_FragCoord.xy,vec2(12.9898,78.233)))*43758.5453)-.5)*.006;c=c*vignette+grain;gl_FragColor=vec4(clamp(c,0.,1.),1.);}'});composer.addPass(grade);
  const control=new OrbitControls(camera,canvas);control.target.set(0,.1,0);control.enablePan=false;control.enableDamping=!reduced;control.dampingFactor=.09;control.rotateSpeed=.57;control.minDistance=8.0;control.maxDistance=22;
  const random=seededRandom(307),rainPositions=new Float32Array(96*6),rainSeeds=[];
  for(let i=0;i<96;i++)rainSeeds.push({x:(random()-.5)*15,y:(random()-.5)*12,z:-4+random()*8,length:.13+random()*.45,speed:.35+random()*.45});
  const rainGeo=new T.BufferGeometry();rainGeo.setAttribute('position',new T.BufferAttribute(rainPositions,3));
  const rain=new T.LineSegments(rainGeo,new T.LineBasicMaterial({color:'#7b8ba9',transparent:true,opacity:.3,depthWrite:false}));rain.visible=false;scene.add(rain);
  let animationTime=0,turn=false,raining=false,separated=false,separation=0,lightMode='blue',frame=0,last=performance.now(),disposed=false,lost=false,suspended=false,inView=true,renderCount=0,detailFov=null;
  const signals=new AbortController();
  const geometryStats={triangles:0,meshes:0};world.root.traverse(o=>{if(o.isMesh){geometryStats.meshes++;geometryStats.triangles+=(o.geometry.index?.count||o.geometry.attributes.position.count)/3;}});
  const renderPolicy=createRenderPerformance({canvas,renderer,build,maxDpr:1.5,mobileMaxDpr:1.5,adaptiveMobileMaxDpr:1.2,buildDpr:1.5,onChange:()=>{resize();invalidate();}});
  function visibleSurface(){return inView||Boolean(canvas.closest('.exhibit-immersive[open]'));}
  function updateRain(time){
    rainSeeds.forEach((s,i)=>{
      const y=((s.y-time*s.speed+60)%12)-6,x=s.x-(6-y)*.30,k=i*6;
      rainPositions.set([x,y,s.z,x-s.length*.32,y-s.length,s.z],k);
    });rainGeo.attributes.position.needsUpdate=true;
  }
  function draw(now=performance.now(),force=false){renderer.info.reset();renderPolicy.beforeRender(now,turn&&visibleSurface()||separation!==Number(separated));composer.render();renderCount++;if(!renderPolicy.shouldWriteDiagnostics(now,force))return;canvas.dataset.ready='true';canvas.dataset.title='雨终曲';canvas.dataset.frames=String(renderCount);canvas.dataset.layers=String(world.root.userData.layers);canvas.dataset.triangles=String(geometryStats.triangles);canvas.dataset.meshes=String(geometryStats.meshes);canvas.dataset.drawCalls=String(renderer.info.render.calls);canvas.dataset.camera=camera.position.toArray().map(x=>x.toFixed(4)).join(',');canvas.dataset.autoRotate=String(turn);canvas.dataset.rain=String(raining);canvas.dataset.separated=String(separated);canvas.dataset.light=lightMode;canvas.dataset.rotation=world.root.rotation.y.toFixed(5);}
  function invalidate(){if(!frame&&!disposed&&!lost&&!suspended&&!document.hidden)frame=requestAnimationFrame(render);}
  function render(now){
    frame=0;if(disposed||lost||suspended||document.hidden)return;
    const dt=Math.min((now-last)/1000,.07);last=now;
    const visible=visibleSurface(),rotating=turn&&visible;if(rotating)world.root.rotation.y+=dt*.105;
    if(raining&&visible){animationTime+=dt;updateRain(animationTime);}
    const target=Number(separated),prior=separation;separation=reduced?target:T.MathUtils.damp(separation,target,7,dt);if(Math.abs(separation-target)<.002)separation=target;const separating=separation!==prior;if(separating)world.setSeparated(separation);
    const controlsChanged=control.update();if(controlsChanged)renderPolicy.noteInteraction();draw(now);
    if(((turn||raining)&&visible)||separation!==target||controlsChanged)invalidate();
  }
  function resize(){const r=canvas.getBoundingClientRect();if(!r.width||!r.height)return;const changed=renderPolicy.resize(r.width,r.height,(w,h,dpr)=>{composer.setPixelRatio(dpr);composer.setSize(w,h);}),aspect=r.width/r.height,fov=detailFov??(aspect<.85?49:35);if(!changed&&Math.abs(camera.aspect-aspect)<1e-6&&camera.fov===fov)return;camera.aspect=aspect;camera.fov=fov;camera.updateProjectionMatrix();invalidate();}
  control.addEventListener('change',invalidate);control.addEventListener('start',()=>{renderPolicy.beginInteraction();last=performance.now();});control.addEventListener('end',()=>{renderPolicy.endInteraction();invalidate();});
  const resizeObserver=new ResizeObserver(resize);resizeObserver.observe(canvas);
  const visibility=new IntersectionObserver(([entry])=>{inView=entry.isIntersecting;if(inView){last=performance.now();invalidate();}});visibility.observe(canvas);
  document.addEventListener('visibilitychange',()=>{if(document.hidden){cancelAnimationFrame(frame);frame=0;}else{last=performance.now();invalidate();}},{signal:signals.signal});
  canvas.addEventListener('webglcontextlost',e=>{e.preventDefault();lost=true;cancelAnimationFrame(frame);frame=0;control.enabled=false;onError();},{signal:signals.signal});
  canvas.addEventListener('keydown',e=>{
    if(!['ArrowLeft','ArrowRight','ArrowUp','ArrowDown','Equal','Minus'].includes(e.code))return;e.preventDefault();
    renderPolicy.noteInteraction();const s=new T.Spherical().setFromVector3(camera.position.clone().sub(control.target));
    if(e.code==='ArrowLeft')s.theta-=.14;if(e.code==='ArrowRight')s.theta+=.14;if(e.code==='ArrowUp')s.phi-=.14;if(e.code==='ArrowDown')s.phi+=.14;
    if(e.code==='Equal')s.radius=Math.max(control.minDistance,s.radius-.7);if(e.code==='Minus')s.radius=Math.min(control.maxDistance,s.radius+.7);
    s.makeSafe();camera.position.setFromSpherical(s).add(control.target);control.update();invalidate();
  },{signal:signals.signal});
  updateRain(0);resize();draw(performance.now(),true);onReady();
  return {
    setTurn(value){turn=Boolean(value);last=performance.now();invalidate();},
    setRain(value){raining=Boolean(value);rain.visible=raining;last=performance.now();invalidate();},
    setSeparated(value){separated=Boolean(value);last=performance.now();invalidate();},
    setLight(value){lightMode=value==='silver'?'silver':'blue';const silver=lightMode==='silver';blue.intensity=silver?3:16;ice.intensity=silver?2:8;key.color.set(silver?'#f0eeed':'#e2e8ff');rim.color.set(silver?'#acb4c9':'#b2c0df');scene.environmentIntensity=silver?1.02:.88;bloom.strength=silver?.20:.38;renderPolicy.invalidateShadow();invalidate();},
    setView(kind){turn=false;world.root.rotation.set(0,0,0);detailFov=null;control.minDistance=8;control.target.set(0,.1,0);camera.position.set(...(kind==='back'?[0,.22,-13.2]:kind==='side'?[13.2,.7,.2]:kind==='detail'?[-2.0,.2,8.1]:[0,.22,13.2]));resize();control.update();renderPolicy.invalidateShadow();invalidate();},
    setDetail(kind){
      const views={light:{target:[-1.6,-.1,2.4],position:[-5.2,.85,7.4],fov:28},veil:{target:[1.75,.67,2.20],position:[5.7,2.4,6.7],fov:27},coda:{target:[.26,-2.45,1.9],position:[1.9,-4.3,6.4],fov:27}};
      const view=views[kind];if(!view)throw new Error('Unknown rain study');turn=false;world.root.rotation.set(0,0,0);control.minDistance=1;control.target.set(...view.target);camera.position.set(...view.position);detailFov=view.fov;resize();control.update();renderPolicy.invalidateShadow();invalidate();
    },
    suspend(value){suspended=Boolean(value);if(suspended){cancelAnimationFrame(frame);frame=0;}else{last=performance.now();invalidate();}},
    async capture(){if(disposed||lost)throw new Error('Viewer unavailable');renderPolicy.invalidateShadow();draw(performance.now(),true);return new Promise((resolve,reject)=>canvas.toBlob(b=>b?resolve(b):reject(new Error('PNG capture failed')),'image/png'));},
    async exportGLB(){
      const {GLTFExporter}=await import('three/addons/exporters/GLTFExporter.js'),rotation=world.root.rotation.clone();
      try{world.root.rotation.set(0,0,0);world.setSeparated(0);world.root.updateMatrixWorld(true);return await new GLTFExporter().parseAsync(world.root,{binary:true,onlyVisible:true,maxTextureSize:1024});}
      finally{world.root.rotation.copy(rotation);world.setSeparated(separation);invalidate();}
    },
    stats(){return {...canvas.dataset,sceneVersion:world.root.userData.sceneVersion,cameraTarget:control.target.toArray(),cameraFov:camera.fov};},
    dispose(){disposed=true;cancelAnimationFrame(frame);signals.abort();resizeObserver.disconnect();visibility.disconnect();renderPolicy.dispose();control.dispose();world.dispose();env.dispose();haze.geometry.dispose();haze.material.map.dispose();haze.material.dispose();rainGeo.dispose();rain.material.dispose();bloom.dispose();output.dispose();grade.dispose();composer.dispose();renderer.dispose();}
  };
}
