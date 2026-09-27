/** Shared render policy for the four sculpture viewers and the poem world. */
const finite=(value,fallback)=>Number.isFinite(Number(value))?Number(value):fallback;
const now=()=>globalThis.performance?.now?.()??Date.now();

export function chooseRenderDpr({
  devicePixelRatio=1,width=1024,build=false,reference=false,maxDpr=1.5,
  mobileMaxDpr=maxDpr,adaptiveMobileMaxDpr=Math.min(mobileMaxDpr,1.25),buildDpr=maxDpr,
  saveData=false,deviceMemory=8,hardwareConcurrency=8
}={}){
  const native=Math.max(1,finite(devicePixelRatio,1));
  if(build)return Math.min(native,buildDpr);
  const compact=finite(width,1024)<600;
  let cap=compact?(reference?mobileMaxDpr:adaptiveMobileMaxDpr):maxDpr;
  if(!reference&&saveData)cap=Math.min(cap,compact?1.1:1.25);
  else if(!reference&&compact&&(finite(deviceMemory,8)<=4||finite(hardwareConcurrency,8)<=4))cap=Math.min(cap,1.1);
  return Math.max(1,Math.min(native,cap));
}

export function createRenderPerformance({
  canvas,renderer,build=false,maxDpr=1.5,mobileMaxDpr=maxDpr,
  adaptiveMobileMaxDpr=Math.min(mobileMaxDpr,1.25),buildDpr=maxDpr,
  interactionScale=.60,restoreDelay=180,diagnosticInterval=180,shadowInterval=120,
  onChange=()=>{}
}={}){
  if(!canvas||!renderer)throw new Error('canvas and renderer are required');
  const query=typeof location==='object'?new URLSearchParams(location.search):new URLSearchParams();
  const reference=!build&&query.get('renderQuality')==='reference';
  const connection=typeof navigator==='object'?navigator.connection:null;
  const environment={
    devicePixelRatio:typeof devicePixelRatio==='number'?devicePixelRatio:1,
    saveData:Boolean(connection?.saveData),
    deviceMemory:typeof navigator==='object'?navigator.deviceMemory:8,
    hardwareConcurrency:typeof navigator==='object'?navigator.hardwareConcurrency:8
  };
  let mode=build?'build':reference?'reference':'adaptive',lowPower=false,dpr=1,baseDpr=1,width=0,height=0;
  let restoreTimer=0,shadowDirty=true,lastShadow=-Infinity,lastDiagnostics=-Infinity,disposed=false;
  renderer.shadowMap.autoUpdate=build||reference;

  function desiredBase(cssWidth){
    return chooseRenderDpr({...environment,width:cssWidth,build,reference,maxDpr,mobileMaxDpr,adaptiveMobileMaxDpr,buildDpr});
  }
  function desiredDpr(cssWidth){
    baseDpr=desiredBase(cssWidth);
    if(lowPower)return 1;
    return mode==='interactive'?Math.max(1,baseDpr*interactionScale):baseDpr;
  }
  function publish(){
    Object.assign(canvas.dataset,{renderDpr:dpr.toFixed(3),renderWidth:String(canvas.width),renderHeight:String(canvas.height),qualityMode:lowPower?'low-power':mode,shadowMode:renderer.shadowMap.autoUpdate?'continuous':'cached'});
  }
  function resize(cssWidth,cssHeight,resizeAuxiliary){
    cssWidth=Math.max(1,Math.round(finite(cssWidth,1)));cssHeight=Math.max(1,Math.round(finite(cssHeight,1)));
    const nextDpr=desiredDpr(cssWidth),changed=width!==cssWidth||height!==cssHeight||Math.abs(nextDpr-dpr)>1e-4;
    if(changed){width=cssWidth;height=cssHeight;dpr=nextDpr;renderer.setPixelRatio(dpr);renderer.setSize(width,height,false);resizeAuxiliary?.(width,height,dpr);}
    publish();return changed;
  }
  function requestMode(next){
    if(disposed||build||reference||mode===next)return false;
    mode=next;onChange();return true;
  }
  function restore(){restoreTimer=0;requestMode('adaptive');}
  function beginInteraction(){
    if(build||reference||disposed)return false;
    clearTimeout(restoreTimer);restoreTimer=0;return requestMode('interactive');
  }
  function endInteraction(){
    if(build||reference||disposed||mode!=='interactive')return;
    clearTimeout(restoreTimer);restoreTimer=setTimeout(restore,restoreDelay);
  }
  function noteInteraction(){beginInteraction();endInteraction();}
  function setLowPower(value){value=Boolean(value);if(lowPower===value)return false;lowPower=value;onChange();return true;}
  function invalidateShadow(){shadowDirty=true;}
  function beforeRender(time=now(),dynamicShadow=false){
    if(renderer.shadowMap.autoUpdate)return;
    if(dynamicShadow&&time-lastShadow>=shadowInterval){shadowDirty=true;lastShadow=time;}
    if(shadowDirty){renderer.shadowMap.needsUpdate=true;shadowDirty=false;}
  }
  function shouldWriteDiagnostics(time=now(),force=false){
    if(force||build||reference||time-lastDiagnostics>=diagnosticInterval){lastDiagnostics=time;return true;}
    return false;
  }
  function dispose(){disposed=true;clearTimeout(restoreTimer);}
  publish();
  return {get dpr(){return dpr;},get mode(){return lowPower?'low-power':mode;},get reference(){return reference;},resize,beginInteraction,endInteraction,noteInteraction,setLowPower,invalidateShadow,beforeRender,shouldWriteDiagnostics,publish,dispose};
}
