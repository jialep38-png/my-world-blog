import * as T from 'three';

/** Development-time asset output adapter. No remote generation calls or keys. */
export class AssetSlots {
  constructor(onNotice = () => {}) { this.onNotice=onNotice;this.entries=[];this.failures=[];this.disposed=false;this.abort=new AbortController(); }
  async load(slots) {
    if(new URLSearchParams(location.search).get('assets')==='original')return;
    try {
      const response=await fetch('./assets/manifest.json',{signal:this.abort.signal});
      if(!response.ok)throw new Error(`Asset manifest: HTTP ${response.status}`);
      const manifest=await response.json();
      if(manifest.version!==1)throw new Error('Unsupported asset manifest version');
      const jobs=Object.entries(slots).map(async([id,slot])=>{
        const spec=id==='avatar'||id==='guide'?manifest[id]:(manifest.landmarks?.[id]??manifest.residents?.[id]);
        if(!spec?.url)return;
        try { await this.loadSlot(id,slot,spec); }
        catch(error){if(error.name!=='AbortError'){this.failures.push(id);this.onNotice(`${id} 模型未加载，已保留原版模型。`);}}
      });
      await Promise.all(jobs);
    } catch(error) { if(error.name!=='AbortError')this.onNotice('资产配置未加载，继续使用原生占位模型。'); }
  }
  async loadSlot(id,slot,spec) {
    const url=new URL(spec.url,document.baseURI);
    if(url.origin!==location.origin||!url.pathname.endsWith('.glb'))throw new Error('Only local GLB assets are accepted');
    const height=Number(spec.height??1);
    if(!Number.isFinite(height)||height<=0||height>4)throw new Error('Invalid asset height');
    const {GLTFLoader}=await import('three/addons/loaders/GLTFLoader.js');
    const manager=new T.LoadingManager();
    manager.setURLModifier((value)=>{
      if(value.startsWith('blob:')||value.startsWith('data:'))return value;
      const resource=new URL(value,document.baseURI);
      if(resource.origin!==location.origin)throw new Error('External GLB resources are disabled');
      return resource.href;
    });
    const response=await fetch(url,{signal:this.abort.signal});
    if(!response.ok)throw new Error(`GLB: HTTP ${response.status}`);
    const size=Number(response.headers.get('content-length')||0);
    if(size>20*1024*1024)throw new Error('GLB exceeds 20 MB prototype limit');
    const buffer=await response.arrayBuffer();
    if(buffer.byteLength>20*1024*1024)throw new Error('GLB exceeds 20 MB prototype limit');
    const gltf=await new GLTFLoader(manager).parseAsync(buffer,new URL('.',url).href);
    if(this.disposed){disposeTree(gltf.scene);return;}
    const model=gltf.scene;
    model.rotation.y=Number.isFinite(spec.rotationY)?spec.rotationY:0;
    const bounds=new T.Box3().setFromObject(model),dimensions=bounds.getSize(new T.Vector3());
    if(!Number.isFinite(dimensions.y)||dimensions.y<=1e-8){disposeTree(model);throw new Error('Empty GLB');}
    if(spec.normalize!==false){
      model.scale.multiplyScalar(height/dimensions.y);
      bounds.setFromObject(model);
      const center=bounds.getCenter(new T.Vector3());
      model.position.sub(new T.Vector3(center.x,bounds.min.y,center.z));
    }else{
      const scale=Number(spec.scale??1);
      if(!Number.isFinite(scale)||scale<=0||scale>4){disposeTree(model);throw new Error('Invalid asset scale');}
      model.scale.multiplyScalar(scale);
    }
    model.traverse((node)=>{if(node.isMesh){node.castShadow=true;node.receiveShadow=true;}});
    for(const placeholder of slot.placeholders??[slot.placeholder])placeholder.visible=false;
    model.userData.orbitAsset=id;
    slot.parent.add(model);
    const mixer=new T.AnimationMixer(model);
    const clip=(name)=>gltf.animations.find((item)=>item.name.toLowerCase()===String(name).toLowerCase());
    const idle=clip(spec.idleClip??'Idle'),walk=clip(spec.walkClip??'Walk');
    const entry={id,model,mixer,clips:gltf.animations,idle:idle?mixer.clipAction(idle):null,walk:walk?mixer.clipAction(walk):null,active:null};
    entry.active=entry.idle;entry.active?.play();this.entries.push(entry);
  }
  update(delta,moving) {
    for(const item of this.entries){
      const action=item.id==='avatar'&&moving?(item.walk??item.idle):item.idle;
      if(action&&action!==item.active){action.reset().fadeIn(.15).play();item.active?.fadeOut(.15);item.active=action;}
      item.mixer.update(delta);
    }
  }
  dispose(){this.disposed=true;this.abort.abort();for(const item of this.entries){item.mixer.stopAllAction();item.mixer.uncacheRoot(item.model);}this.entries=[];}
}
export function disposeTree(root) {
  const geometries=new Set(),materials=new Set(),textures=new Set();
  root.traverse((node)=>{
    if(node.geometry)geometries.add(node.geometry);
    for(const mat of node.material?(Array.isArray(node.material)?node.material:[node.material]):[]){materials.add(mat);for(const value of Object.values(mat))if(value?.isTexture)textures.add(value);}
  });
  textures.forEach((item)=>item.dispose());geometries.forEach((item)=>item.dispose());materials.forEach((item)=>item.dispose());
}
