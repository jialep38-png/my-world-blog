/** Original sculptural garden assets, v0.4. Local Y is up, the front faces -Z.
 * Static geometry is merged by material; articulated travellers and paper cranes
 * keep their moving parts separate. No external model or image is required.
 */
import * as T from 'three';
import { part, box, ball, cyl, mergeStatic } from './art-models.js';
export { part, box, ball, cyl, mergeStatic };

export const GARDEN_PALETTE=Object.freeze({
  paper:'#eee9d8',paperLight:'#faf5e7',paperShade:'#bfc5b1',ink:'#243733',
  roof:'#344b48',slate:'#6f807b',stone:'#9aa49a',stoneLight:'#c3c8b8',
  moss:'#728951',mossDark:'#435e3d',pine:'#385b46',pineLight:'#56734b',
  bamboo:'#8a9b63',celadon:'#93b6a3',water:'#769d9e',red:'#ad3b2d',
  redLight:'#c5573e',gold:'#c9a772',wood:'#817259',skin:'#e7c8aa'
});
const P=GARDEN_PALETTE,UP=new T.Vector3(0,1,0);

function rod(a,b,r,color,sides=7){
  const start=new T.Vector3(...a),end=new T.Vector3(...b),delta=end.clone().sub(start);
  const result=cyl(r,r,delta.length(),color,start.clone().add(end).multiplyScalar(.5).toArray(),sides);
  result.quaternion.setFromUnitVectors(UP,delta.normalize());return result;
}
function tube(points,r,color,segments=16){
  return part(new T.TubeGeometry(new T.CatmullRomCurve3(points.map(p=>new T.Vector3(...p))),segments,r,5,false),color);
}
function ring(radius,width,color,position=[0,0,0]){
  return part(new T.TorusGeometry(radius,width,6,36),color,position);
}
function fold(vertices,color){
  const geometry=new T.BufferGeometry();geometry.setAttribute('position',new T.Float32BufferAttribute(vertices.flat(),3));geometry.computeVertexNormals();
  return part(geometry,color,[0,0,0],{side:T.DoubleSide,roughness:.91});
}
function horizontalRing(radius,width,color,y){const mesh=ring(radius,width,color,[0,y,0]);mesh.rotation.x=Math.PI/2;return mesh;}
function platform(g,width=.94,depth=.76){
  g.add(box(width,.055,depth,P.slate,[0,.0275,0],.015),box(width-.07,.025,depth-.06,P.stoneLight,[0,.067,0],.013));
  for(let i=0;i<3;i++)g.add(box(.32+i*.065,.027,.11,P.stoneLight,[0,.021-i*.004,-depth/2-.045-i*.09],.01));
}
function lattice(g,x,y,z,width,height,color=P.ink){
  const screen=new T.Group();screen.add(box(width,height,.025,P.celadon,[0,0,.012],.008));
  for(const xx of [-width/2,width/2])screen.add(box(.017,height+.035,.035,color,[xx,0,0],.003));
  for(const yy of [-height/2,height/2])screen.add(box(width+.035,.017,.035,color,[0,yy,0],.003));
  for(let i=1;i<4;i++)screen.add(box(.009,height,.03,color,[-width/2+width*i/4,0,-.014],.002));
  for(let i=1;i<3;i++)screen.add(box(width,.009,.03,color,[0,-height/2+height*i/3,-.014],.002));
  screen.position.set(x,y,z);g.add(screen);
}
function lantern(g,x,y,z,size=.085){
  g.add(cyl(size*.7,size*.7,size*1.65,P.paperLight,[x,y,z],8,{emissive:P.gold,emissiveIntensity:.15}),
    cyl(size*.76,size*.76,.017,P.ink,[x,y+size*.87,z],8),cyl(size*.76,size*.76,.017,P.ink,[x,y-size*.87,z],8),
    rod([x,y+size*.86,z],[x,y+size*1.6,z],.006,P.ink),rod([x,y-size*.86,z],[x,y-size*1.6,z],.007,P.red));
  for(let i=0;i<4;i++){const angle=i*Math.PI/2;g.add(rod([x+Math.cos(angle)*size*.72,y-size*.8,z+Math.sin(angle)*size*.72],[x+Math.cos(angle)*size*.72,y+size*.8,z+Math.sin(angle)*size*.72],.004,P.gold));}
}

/** A shallow hip roof with lifted corners, folded ridges and dark ceramic tiles. */
function pavilionRoof(g,width,depth,base,rise=.21,color=P.roof){
  const outline=[[-1,-1],[0,-1],[1,-1],[1,0],[1,1],[0,1],[-1,1],[-1,0]],vertices=[];
  const point=(i,t)=>{const [x,z]=outline[i%8],corner=Math.abs(x*z);return [x*width/2*t,base+rise*Math.pow(1-t,1.2)+.053*Math.pow(t,5)*(corner+.3),z*depth/2*t];};
  for(let band=0;band<5;band++)for(let side=0;side<8;side++){
    const a=point(side,band/5),b=point(side+1,band/5),c=point(side+1,(band+1)/5),d=point(side,(band+1)/5);
    vertices.push(a,b,d,b,c,d);
  }
  g.add(fold(vertices,color));
  for(let i=0;i<8;i++){
    const a=point(i,1),b=point(i+1,1),mid=a.map((value,index)=>(value+b[index])/2);
    g.add(tube([a,mid,b],.012,P.ink,4));
  }
  for(const i of [0,2,4,6])g.add(tube([point(i,0),point(i,.35),point(i,.72),point(i,1)],.011,P.celadon,12));
  g.add(ball(.025,P.gold,[0,base+rise+.02,0]));
}
function page(g,width,height,position,angle=0,color=P.paperLight){
  const leaf=new T.Group();leaf.add(box(width,height,.018,color,[0,0,0],.004));
  for(let row=0;row<5;row++)leaf.add(box(width*(.48+(row%3)*.1),.009,.004,P.slate,[-width*.06,height*.28-row*height*.115,-.012],.001));
  leaf.position.set(...position);leaf.rotation.y=angle;g.add(leaf);return leaf;
}
function teacup(g,x,y,z,size=.035){
  g.add(cyl(size,size*.64,size*.9,P.celadon,[x,y+size*.45,z],12),cyl(size*.78,size*.78,.003,P.ink,[x,y+size*.91,z],12));
}

/** Rounded, perforated scholar stones with pale mineral seams and soft moss. */
export function makeRock(size=1,variant=0){
  const g=new T.Group();g.name='garden-scholar-rock';const phase=variant*.71;
  // The open arch is geometry, so it remains a hole when viewed from behind.
  const archGeometry=new T.TorusGeometry(.148,.075,8,28),position=archGeometry.attributes.position;
  for(let i=0;i<position.count;i++){
    const x=position.getX(i),y=position.getY(i),z=position.getZ(i),a=Math.atan2(y,x);
    const wave=1+.105*Math.sin(a*3+phase)+.055*Math.cos(a*7-phase);
    position.setXYZ(i,x*wave,Math.max(-.205,y*wave*1.30),z*(.80+.09*Math.sin(a*4)));
  }
  archGeometry.computeVertexNormals();const arch=part(archGeometry,P.stone,[.005,.265,0]);arch.rotation.z=.16*Math.sin(phase);g.add(arch);
  const lobes=[[-.12,.083,.005,.13,1.02,.58,.84],[.12,.076,.024,.12,1.06,.63,.83],[-.095,.43,.015,.10,.91,.74,.78],[.075,.477,.027,.10,.84,.68,.79]];
  lobes.forEach(([x,y,z,r,sx,sy,sz],i)=>{
    const geometry=new T.SphereGeometry(r,12,8),p=geometry.attributes.position;
    for(let j=0;j<p.count;j++){
      const px=p.getX(j),py=p.getY(j),pz=p.getZ(j),ripple=1+.065*Math.sin(px*38+phase)*Math.cos(py*33-i)+.035*Math.sin(pz*49+py*21);
      p.setXYZ(j,px*ripple,py*ripple,pz*ripple);
    }
    geometry.computeVertexNormals();const stone=part(geometry,i===2?P.stoneLight:P.stone,[x,y,z]);stone.scale.set(sx,sy,sz);g.add(stone);
  });
  for(const side of [-1,1]){
    g.add(tube([[side*.102,.112,-.055],[side*.183,.185,-.055],[side*.192,.297,-.051],[side*.135,.381,-.056]],.0045,P.stoneLight,12));
    g.add(tube([[side*.125,.138,-.061],[side*.195,.214,-.047],[side*.181,.299,-.057]],.0025,P.slate,9));
  }
  for(let i=0;i<9;i++){
    const angle=i*2.399+phase,r=.08+(i%3)*.044;
    const moss=part(new T.IcosahedronGeometry(.044+(i%2)*.013,0),i%3?P.moss:P.mossDark,[Math.cos(angle)*r,.025+((i+1)%3)*.007,Math.sin(angle)*r*.63]);
    moss.scale.set(1,.24,.79);g.add(moss);
  }
  for(let i=0;i<5;i++)g.add(part(new T.OctahedronGeometry(.008,0),P.paperShade,[-.17+i*.076,.045,-.081-Math.sin(i+phase)*.01]));
  const result=mergeStatic(g);result.scale.setScalar(size);return result;
}
/** Layered cloud pines: curved wood, needle pads, then fine folded needle fans. */
export function makePine(size=1,variant=0){
  const g=new T.Group();g.name='garden-cloud-pine';const lean=(variant%3-1)*.055;
  g.add(tube([[0,0,0],[-.035,.23,.01],[.035+lean,.46,0],[lean,.75,.015]],.034,P.ink));
  g.add(tube([[-.019,.05,-.029],[-.053,.23,-.017],[.019+lean,.44,-.022],[lean-.01,.65,-.018]],.006,P.wood,12));
  for(const angle of [0,2.1,4.4])g.add(rod([0,.07,0],[Math.cos(angle)*.09,.011,Math.sin(angle)*.07],.016,P.ink,6));
  const branches=[[-.23,.40,-.025],[.25,.54,.025],[-.12,.70,.055],[.045,.86,0]];
  branches.forEach(([x,y,z],i)=>{
    g.add(tube([[lean*.7,y-.16,0],[x*.48,y-.048,z*.5],[x,y-.023,z]],.014,P.wood,8));
    for(let j=0;j<3;j++){
      const px=x+(j-1)*.068,py=y+(j%2)*.025,pz=z+Math.sin(j*2+variant)*.048;
      const pad=part(new T.IcosahedronGeometry(.13,1),i%2?P.pineLight:P.pine,[px,py,pz]);
      pad.scale.set(1.06,.23,.80);pad.rotation.y=i+j*.65;g.add(pad);
      const needles=[];
      for(let fan=0;fan<10;fan++){
        const a=fan*2.399+i+j+variant*.4,r=.048+((fan+j)%3)*.025,cx=px+Math.cos(a)*r,cz=pz+Math.sin(a)*r*.75,cy=py+.01+(fan%3)*.004;
        for(let needle=-1;needle<=1;needle++){
          const direction=a+needle*.42,length=.047+(fan%3)*.009;
          needles.push([cx-.004*Math.sin(direction),cy,cz+.004*Math.cos(direction)],[cx+Math.cos(direction)*length,cy+.042+needle*.007,cz+Math.sin(direction)*length],[cx+.004*Math.sin(direction),cy,cz-.004*Math.cos(direction)]);
        }
      }
      g.add(fold(needles,j%2?P.pineLight:P.pine));
    }
  });
  const result=mergeStatic(g);result.scale.setScalar(size);return result;
}

/** A folded, gently cupped leaf; shared construction keeps each leaflet tiny. */
function leaflet(g,start,end,width,color){
  const a=new T.Vector3(...start),b=new T.Vector3(...end),delta=b.clone().sub(a),side=new T.Vector3(-delta.z,0,delta.x).normalize().multiplyScalar(width);
  const mid=a.clone().lerp(b,.43),ridge=mid.clone();ridge.y+=width*.43;
  g.add(fold([a.toArray(),mid.clone().add(side).toArray(),ridge.toArray(),a.toArray(),ridge.toArray(),mid.clone().sub(side).toArray(),b.toArray(),ridge.toArray(),mid.clone().add(side).toArray(),b.toArray(),mid.clone().sub(side).toArray(),ridge.toArray()],color));
}

/** Seven arched fronds with alternating paired pinnae, suitable for moss banks. */
export function makeFern(size=1,variant=0){
  const g=new T.Group();g.name='garden-fern';
  for(let frond=0;frond<7;frond++){
    const angle=frond*2.399+variant*.62,length=.22+(frond%3)*.07,dx=Math.cos(angle),dz=Math.sin(angle);
    const point=t=>[dx*length*t*t,.018+length*(1.20*t-.72*t*t),dz*length*t*t];
    g.add(tube([point(0),point(.32),point(.67),point(1)],.0035,P.bamboo,8));
    for(let pair=0;pair<7;pair++){
      const t=.18+pair*.112,p=point(t),span=length*.27*Math.sin(Math.PI*(.10+t*.89));
      for(const side of [-1,1]){
        const end=[p[0]+dx*.024-dz*side*span,p[1]+.013-span*.18,p[2]+dz*.024+dx*side*span];
        leaflet(g,p,end,span*.23,(pair+frond)%3?P.pineLight:P.moss);
      }
    }
    leaflet(g,point(.90),point(1.11),.011,P.pineLight);
  }
  const result=mergeStatic(g);result.scale.setScalar(size);return result;
}

/** Slender waterside reeds with ribbon leaves and warm, dry seed heads. */
export function makeReeds(size=1,variant=0){
  const g=new T.Group();g.name='garden-reeds';
  for(let stem=0;stem<7;stem++){
    const angle=stem*2.399+variant*.47,r=.024+(stem%3)*.029,x=Math.cos(angle)*r,z=Math.sin(angle)*r,h=.35+(stem%4)*.064,lean=Math.sin(stem+variant)*.055;
    g.add(tube([[x,0,z],[x+lean*.18,h*.4,z],[x+lean,h,z+.016]],.004,P.bamboo,7));
    for(let leaf=0;leaf<2;leaf++){
      const y=h*(.24+leaf*.23),side=(stem+leaf)%2?1:-1;
      leaflet(g,[x+lean*y/h,y,z],[x+side*(.10+leaf*.035),y+.11-leaf*.075,z+Math.cos(angle)*.048],.012,P.pineLight);
    }
    if(stem%3!==1){
      const head=part(new T.SphereGeometry(.018,6,5),stem%2?P.gold:P.paperShade,[x+lean,h+.027,z+.016]);head.scale.set(1,2.7,1);head.rotation.z=-lean;g.add(head);
      g.add(rod([x+lean,h+.044,z+.016],[x+lean*1.12,h+.109,z+.016],.0018,P.wood,4));
    }
  }
  const result=mergeStatic(g);result.scale.setScalar(size);return result;
}

/** Low meadows of cupped five-petal flowers, with small folded basal leaves. */
export function makeFlowerCluster(size=1,variant=0){
  const g=new T.Group();g.name='garden-meadow-flowers';
  const petals=[P.paperLight,'#d9b9a7','#b85f50'];
  for(let bloom=0;bloom<7;bloom++){
    const angle=bloom*2.399+variant*.43,r=.025+Math.sqrt(bloom)*.038,x=Math.cos(angle)*r,z=Math.sin(angle)*r,y=.10+(bloom%3)*.043;
    g.add(rod([x,.008,z],[x,y,z],.0035,P.pineLight,5));
    for(const side of [-1,1])leaflet(g,[x,y*.30,z],[x+side*.057,y*.48,z+.029],.016,side>0?P.moss:P.pineLight);
    for(let petal=0;petal<5;petal++){
      const a=petal*Math.PI*.4+bloom*.19,dx=Math.cos(a),dz=Math.sin(a),color=petals[(variant+(bloom%4===0?1:0))%petals.length];
      const inner=[x+dx*.006,y+.002,z+dz*.006],mid=[x+dx*.028,y-.002,z+dz*.028],tip=[x+dx*.045,y+.012,z+dz*.045];
      g.add(fold([inner,[mid[0]-dz*.017,mid[1]+.005,mid[2]+dx*.017],mid,inner,mid,[mid[0]+dz*.017,mid[1]+.005,mid[2]-dx*.017],tip,mid,[mid[0]-dz*.017,mid[1]+.005,mid[2]+dx*.017],tip,[mid[0]+dz*.017,mid[1]+.005,mid[2]-dx*.017],mid],color));
    }
    const center=part(new T.OctahedronGeometry(.009),bloom%2?P.gold:P.red,[x,y+.008,z]);center.scale.y=.65;g.add(center);
  }
  const result=mergeStatic(g);result.scale.setScalar(size);return result;
}

/** A trio of tilted lotus seed pods, with recessed dark seeds and dry leaves. */
export function makeSeedPod(size=1,variant=0){
  const g=new T.Group();g.name='garden-lotus-seed-pods';
  for(let seed=0;seed<3;seed++){
    const x=(seed-1)*.087,z=Math.sin(seed*2+variant)*.05,h=.21+seed*.068,lean=(seed-1)*.044;
    g.add(tube([[x,0,z],[x-lean*.3,h*.50,z+.012],[x+lean,h,z]],.005,P.wood,8));
    const head=new T.Group();head.add(cyl(.057,.025,.042,P.bamboo,[0,0,0],10),cyl(.054,.054,.004,P.paperShade,[0,.023,0],10));
    for(let spot=0;spot<7;spot++){
      const a=spot*2.399,r=spot===0?0:.029;
      head.add(cyl(.0055,.0048,.003,P.ink,[Math.cos(a)*r,.026,Math.sin(a)*r],6));
    }
    head.position.set(x+lean,h,z);head.rotation.set(.18*Math.sin(seed+variant),0,(seed-1)*.28);g.add(head);
    if(seed!==1)leaflet(g,[x,h*.39,z],[x+Math.cos(seed+variant)*.13,h*.27,z+.09],.034,P.paperShade);
  }
  const result=mergeStatic(g);result.scale.setScalar(size);return result;
}
/** Bamboo stalks carry narrow folded leaves, rather than broad sphere foliage. */
export function makeBamboo(size=1,variant=0){
  const g=new T.Group();g.name='garden-bamboo';
  for(let i=0;i<3;i++){
    const x=(i-1)*.092,z=(i%2)*.07,h=.68+((i+variant)%3)*.115,lean=(i-1)*.09;
    g.add(rod([x,0,z],[x+lean,h,z+.018],.013,i%2?P.bamboo:P.pineLight));
    for(let joint=1;joint<5;joint++){
      const yy=h*joint/5,xx=x+lean*joint/5;g.add(cyl(.016,.016,.012,P.paperShade,[xx,yy,z+.018*joint/5],7));
      if(joint<2)continue;
      for(const side of [-1,1]){
        const end=[xx+side*.16,yy+.05,z-.025];g.add(rod([xx,yy,z],end,.004,P.pine));
        for(let l=0;l<3;l++){
          const lx=xx+side*(.04+l*.038),ly=yy+.02+l*.012;
          g.add(fold([[lx,ly,z],[lx+side*.11,ly+.035-(l%2)*.065,z-.045],[lx+side*.055,ly+.025,z+.005]],l%2?P.pine:P.pineLight));
        }
      }
    }
  }
  const result=mergeStatic(g);result.scale.setScalar(size);return result;
}

/** A celadon, quatrefoil inkstone from the paper-and-ink collage vocabulary. */
export function makeInkstone(size=1){
  const g=new T.Group();g.name='celadon-inkstone';
  const contour=(scale,y)=>Array.from({length:65},(_,i)=>{const a=i*Math.PI/32,r=(.21+.035*Math.cos(a*4))*scale;return [Math.cos(a)*r,y,Math.sin(a)*r];});
  const shape=new T.Shape(contour(1,0).map(([x,,z])=>new T.Vector2(x,z)));
  const base=part(new T.ExtrudeGeometry(shape,{depth:.04,bevelEnabled:true,bevelThickness:.01,bevelSize:.012,bevelSegments:2}),P.celadon);base.rotation.x=-Math.PI/2;base.position.y=.01;g.add(base);
  const inner=new T.Shape(contour(.78,0).map(([x,,z])=>new T.Vector2(x,z)));
  const ink=part(new T.ShapeGeometry(inner),P.ink,[0,.068,0],{side:T.DoubleSide,roughness:.35});ink.rotation.x=-Math.PI/2;g.add(ink);
  g.add(tube(contour(.92,.081),.012,P.paperShade,64),tube(contour(1.06,.043),.009,P.slate,64));
  const result=mergeStatic(g);result.scale.setScalar(size);return result;
}
export function makeBrush(size=1){
  const g=new T.Group();g.name='bamboo-writing-brush';
  g.add(cyl(.018,.021,.59,P.bamboo,[0,.52,0],10),cyl(.023,.023,.054,P.gold,[0,.20,0],10),cyl(.022,.022,.038,P.ink,[0,.82,0],10),
    part(new T.ConeGeometry(.024,.17,10),P.paper,[0,.095,0]));
  // The brush point faces down, toward the paper.
  g.children[g.children.length-1].rotation.z=Math.PI;
  const tip=part(new T.ConeGeometry(.013,.085,10),P.ink,[0,.05,0]);tip.rotation.z=Math.PI;g.add(tip);
  const loop=ring(.034,.005,P.red,[0,.873,0]);g.add(loop);
  for(const y of [.38,.64])g.add(cyl(.021,.021,.011,P.paperShade,[0,y,0],10));
  const result=mergeStatic(g);result.scale.setScalar(size);return result;
}
export function makePlumBranch(size=1,variant=0){
  const g=new T.Group();g.name='plum-blossom-branch';
  g.add(tube([[0,0,0],[.05,.21,0],[-.04,.41,.02],[.07,.67,.01]],.019,P.wood));
  const twigs=[[-.16,.31,.045],[.18,.47,.02],[-.12,.61,-.03],[.13,.79,.01]];
  twigs.forEach(([x,y,z],i)=>{
    g.add(tube([[i%2?.02:-.015,y-.15,0],[x*.55,y-.04,z],[x,y,z]],.008,P.wood,9));
    for(let bloom=0;bloom<3;bloom++){
      const xx=x+(bloom-1)*.04,yy=y+(bloom%2)*.028,zz=z+bloom*.01;
      for(let petal=0;petal<5;petal++){const angle=petal*Math.PI*.4;g.add(ball(.016,(i+variant)%3?'#d9b9a7':'#ead2bf',[xx+Math.cos(angle)*.016,yy+Math.sin(angle)*.016,zz],[1,1,.48]));}
      g.add(ball(.008,P.red,[xx,yy,zz-.01]));
    }
  });
  const result=mergeStatic(g);result.scale.setScalar(size);return result;
}
export const makePlum=makePlumBranch;
export function makeOrchid(size=1,variant=0){
  const g=new T.Group();g.name='orchid-grass';
  for(let i=0;i<7;i++){
    const a=(i/7)*Math.PI*2+variant*.7,length=.39+(i%3)*.12,side=new T.Vector3(Math.cos(a),0,Math.sin(a)),points=[];
    for(let step=0;step<=12;step++){
      const t=step/12,center=side.clone().multiplyScalar(length*t*t*.8);center.y=length*Math.sin(t*Math.PI*.72);
      const width=.014*Math.sin(t*Math.PI),perp=new T.Vector3(-side.z,0,side.x).multiplyScalar(width);points.push([center.clone().add(perp).toArray(),center.clone().sub(perp).toArray()]);
    }
    const vertices=[];for(let j=0;j<12;j++)vertices.push(points[j][0],points[j][1],points[j+1][0],points[j][1],points[j+1][1],points[j+1][0]);g.add(fold(vertices,i%2?P.pine:P.pineLight));
  }
  const result=mergeStatic(g);result.scale.setScalar(size);return result;
}

function moonGate(){
  const g=new T.Group();platform(g,.96,.58);
  const wall=new T.Shape();wall.moveTo(-.44,0);wall.lineTo(.44,0);wall.lineTo(.44,.88);wall.lineTo(-.44,.88);wall.closePath();
  const opening=new T.Path();opening.absarc(0,.39,.31,0,Math.PI*2,true);wall.holes.push(opening);
  g.add(part(new T.ExtrudeGeometry(wall,{depth:.15,bevelEnabled:true,bevelThickness:.006,bevelSize:.007,bevelSegments:1,curveSegments:36}),P.paper,[0,.08,-.045]));
  g.add(ring(.318,.025,P.slate,[0,.47,-.053]),box(.98,.046,.27,P.roof,[0,.987,.033],.018),box(.91,.024,.21,P.ink,[0,.947,.032],.004));
  for(const x of [-.405,.405])g.add(box(.038,.85,.022,P.stoneLight,[x,.5,-.068],.006));
  const pine=makePine(.63,2);pine.position.set(-.37,.06,.24);g.add(pine);
  const rock=makeRock(.48,1);rock.position.set(.37,.08,-.17);g.add(rock);
  lantern(g,.29,.72,-.20,.048);return g;
}
function bookPavilion(){
  const g=new T.Group();platform(g,.86,.65);
  // Fanned paper leaves form a sculptural, open book-shaped reading alcove.
  for(const side of [-1,1])for(let leaf=0;leaf<3;leaf++){
    const p=page(g,.36,.67,[side*(.17+leaf*.018),.45,.19+leaf*.019],side*(.24+leaf*.08),leaf===2?P.paperShade:P.paperLight);
    if(leaf===2)p.rotation.z=side*.035;
  }
  g.add(box(.045,.72,.10,P.red,[0,.43,.215],.006),box(.61,.045,.31,P.wood,[0,.35,-.055]));
  for(const x of [-.24,.24])g.add(box(.035,.27,.035,P.ink,[x,.20,-.02],.006));
  for(const side of [-1,1]){const leaf=box(.20,.025,.22,P.paperLight,[side*.094,.397,-.10],.003);leaf.rotation.z=side*.13;g.add(leaf);}
  g.add(box(.06,.28,.01,P.red,[.15,.69,-.06],.002));
  const bamboo=makeBamboo(.6,1);bamboo.position.set(-.43,.06,.15);g.add(bamboo);teacup(g,.24,.378,-.13);return g;
}
function paperCrane(color=P.paperLight){
  const root=new T.Group(),wingL=new T.Group(),wingR=new T.Group();
  root.add(fold([[0,.02,-.13],[-.075,.015,.05],[0,.095,.085],[0,.02,-.13],[0,.095,.085],[.075,.015,.05]],color));
  root.add(fold([[0,.025,-.11],[-.025,.04,-.10],[0,.19,-.22],[0,.025,-.11],[0,.19,-.22],[.025,.04,-.10]],P.paperShade));
  root.add(fold([[0,.19,-.22],[-.008,.177,-.22],[0,.147,-.3],[0,.19,-.22],[0,.147,-.3],[.008,.177,-.22]],P.red));
  root.add(fold([[0,.028,.07],[-.03,.01,.055],[0,.17,.25],[0,.028,.07],[0,.17,.25],[.03,.01,.055]],color));
  for(const [side,wing] of [[-1,wingL],[1,wingR]]){
    wing.add(fold([[0,.03,-.065],[side*.30,.19,.055],[side*.12,-.013,.09]],color));
    wing.add(fold([[0,.03,-.065],[side*.12,-.013,.09],[0,.025,.08]],P.paperShade));
    wing.name=side<0?'wingL':'wingR';root.add(wing);
  }
  return {root,wingL,wingR};
}
function foldingStudio(){
  const g=new T.Group();
  const red=box(.68,.018,.73,P.red,[.08,.028,.04],.003);red.rotation.y=-.17;g.add(red);
  const paper=page(g,.57,.68,[.06,.36,.24],-.12);paper.rotation.x=-.19;paper.rotation.z=.16;
  const ink=makeInkstone(.89);ink.position.set(-.23,.06,-.13);ink.rotation.y=.2;g.add(ink);
  const brush=makeBrush(.94);brush.position.set(.23,.04,-.12);brush.rotation.z=-.55;brush.rotation.x=.16;g.add(brush);
  const crane=paperCrane();crane.root.position.set(.31,.20,-.23);crane.root.scale.setScalar(.63);crane.root.rotation.y=.3;g.add(crane.root);
  const seal=box(.12,.17,.12,P.red,[.32,.10,.13],.013);g.add(seal,box(.13,.025,.13,P.gold,[.32,.188,.13],.006));
  return g;
}
function lanternTower(){
  const g=new T.Group();g.add(cyl(.34,.4,.08,P.slate,[0,.04,0],8),cyl(.29,.33,.04,P.stoneLight,[0,.1,0],8));
  for(let level=0;level<3;level++){
    const y=.16+level*.31,width=.34-level*.045;
    g.add(box(width,.20,width,P.paperLight,[0,y+.10,0],.006));
    for(const x of [-1,1])for(const z of [-1,1])g.add(cyl(.015,.018,.22,P.red,[x*width*.52,y+.11,z*width*.52],8));
    for(let i=-1;i<=1;i++)g.add(box(.011,.14,.016,P.ink,[i*width*.24,y+.11,-width*.52],.001));
    pavilionRoof(g,width+.27,width+.27,y+.23,.11);
  }
  g.add(rod([0,1.15,0],[0,1.29,0],.013,P.gold),ball(.024,P.gold,[0,1.28,0]));
  const rock=makeRock(.56,2);rock.position.set(.35,.02,.05);g.add(rock);return g;
}
function bambooLibrary(){
  const g=new T.Group();
  g.add(box(.81,.035,.51,P.paper,[0,.019,.04],.009));
  const scroll=new T.Group();
  for(let i=0;i<12;i++){
    const angle=(i-5.5)*.105,x=Math.sin(angle)*.70,z=(1-Math.cos(angle))*.70;
    const slat=box(.056,.66+(i%3)*.014,.033,i%3?P.bamboo:P.paperShade,[x,.37,z],.008);slat.rotation.y=-angle;scroll.add(slat);
    for(let line=0;line<4;line++)scroll.add(box(.017,.027,.005,P.pine,[x,.30+line*.065,z-.021],.003));
  }
  for(const y of [.16,.58])scroll.add(tube([[-.37,y,.105],[0,y,0],[.37,y,.105]],.009,P.red));
  scroll.rotation.y=-.12;scroll.position.z=.15;g.add(scroll);
  for(let i=0;i<3;i++){
    const volume=box(.33,.047,.26,[P.paperShade,P.red,P.celadon][i],[.19,.068+i*.053,-.17],.004);volume.rotation.y=i*.13;g.add(volume);
    const edge=box(.26,.03,.269,P.paperLight,[.19,.068+i*.053,-.17],.002);edge.rotation.y=i*.13;g.add(edge);
  }
  const bamboo=makeBamboo(.91,2);bamboo.position.set(-.40,.03,.11);g.add(bamboo);
  const ink=makeInkstone(.44);ink.position.set(-.25,.04,-.25);g.add(ink);return g;
}
function armillaryCourt(){
  const g=new T.Group();g.add(cyl(.44,.49,.07,P.slate,[0,.035,0],24),cyl(.40,.43,.04,P.stoneLight,[0,.09,0],24));
  g.add(cyl(.14,.22,.10,P.ink,[0,.16,0],8),cyl(.07,.105,.31,P.celadon,[0,.36,0],12),cyl(.17,.17,.04,P.gold,[0,.53,0],16));
  const globe=new T.Group();globe.position.y=.79;globe.add(ball(.12,P.celadon));
  const a=ring(.28,.017,P.gold),b=ring(.29,.014,P.ink),c=ring(.285,.015,P.gold),d=ring(.18,.008,P.paperLight);
  a.rotation.y=.55;b.rotation.x=Math.PI/2;c.rotation.y=-.8;c.rotation.x=.6;d.rotation.x=.9;globe.add(a,b,c,d);
  const axis=rod([-.19,-.22,0],[.19,.22,0],.012,P.red);globe.add(axis,ball(.025,P.gold,[-.21,-.25,0]),ball(.025,P.gold,[.21,.25,0]));g.add(globe);
  for(let i=0;i<12;i++){const angle=i*Math.PI/6;const tick=box(.03,.005,.064,P.ink,[Math.cos(angle)*.35,.113,Math.sin(angle)*.35],.002);tick.rotation.y=-angle+Math.PI/2;g.add(tick);}
  const stone=makeRock(.52,3);stone.position.set(-.42,.02,.18);g.add(stone);return g;
}
function letterPavilion(){
  const g=new T.Group();
  const red=box(.73,.027,.59,P.red,[0,.021,.03],.006);red.rotation.y=.12;g.add(red);
  const letter=page(g,.57,.78,[-.05,.46,.19],.08);letter.rotation.z=-.13;
  for(let i=0;i<6;i++)letter.add(box(.006,.65,.004,P.red,[-.25+i*.099,0,-.013],.001));
  const envelope=new T.Group();envelope.add(box(.67,.39,.042,P.paperLight,[0,0,0],.009),
    rod([-.31,.174,-.027],[0,-.012,-.027],.009,P.red),rod([0,-.012,-.027],[.31,.174,-.027],.009,P.red),
    box(.07,.083,.008,P.red,[.229,.097,-.026],.003));
  envelope.position.set(.04,.248,-.065);envelope.rotation.z=.10;envelope.rotation.y=-.11;g.add(envelope);
  g.add(box(.13,.16,.13,P.red,[-.36,.11,-.22],.014),box(.12,.034,.12,P.gold,[-.36,.20,-.22],.004));
  const crane=paperCrane();crane.root.scale.setScalar(.55);crane.root.position.set(.34,.25,-.22);crane.root.rotation.y=-.5;g.add(crane.root);
  const plum=makePlumBranch(.71);plum.position.set(.35,.02,.18);plum.rotation.z=-.3;g.add(plum);return g;
}
function teaHouse(){
  const g=new T.Group();platform(g,1.05,.82);
  for(const x of [-.37,.37])for(const z of [-.26,.28])g.add(cyl(.021,.028,.65,P.ink,[x,.405,z],8));
  // A raised open tea terrace; the viewer can see cups, stools and bamboo screens.
  g.add(box(.76,.027,.60,P.wood,[0,.12,.02],.005));
  for(let i=0;i<9;i++)g.add(box(.072,.008,.59,P.paperShade,[-.32+i*.08,.139,.02],.003));
  lattice(g,0,.49,.28,.65,.36,P.pine);pavilionRoof(g,1.11,.97,.82,.23);
  g.add(cyl(.20,.20,.033,P.ink,[0,.34,-.08],18),cyl(.038,.065,.19,P.wood,[0,.235,-.08],10));
  for(const x of [-.25,.25])g.add(cyl(.085,.08,.035,P.red,[x,.25,-.15],12),cyl(.055,.065,.09,P.ink,[x,.188,-.15],10));
  teacup(g,-.095,.359,-.1);teacup(g,.095,.359,-.1);
  g.add(ball(.05,P.celadon,[0,.397,.02],[1,.8,1]),cyl(.024,.025,.016,P.ink,[0,.446,.02],10),rod([.035,.40,.02],[.084,.424,.015],.009,P.celadon));
  lantern(g,-.34,.69,-.28,.05);const rock=makeRock(.5,0);rock.position.set(.45,.06,.25);g.add(rock);return g;
}

const LANDMARK_BUILDERS={home:moonGate,journal:bookPavilion,studio:foldingStudio,lab:lanternTower,library:bambooLibrary,observatory:armillaryCourt,mail:letterPavilion,camp:teaHouse};
export function makeArtLandmark(item){
  const root=new T.Group();root.name=`garden-landmark-${item.id}`;
  const raw=(LANDMARK_BUILDERS[item.id]||moonGate)();raw.name=`building-${item.id}`;
  const building=mergeStatic(raw);root.add(building);
  const ornament=new T.Group();ornament.name=`treasure-${item.id}`;
  ornament.add(box(.065,.08,.02,P.red,[0,0,0],.004),ring(.057,.006,P.gold,[0,.01,0]),rod([0,-.04,0],[0,-.12,0],.005,P.gold));
  ornament.position.set(.52,.32,-.25);root.add(ornament);return {root,building,ornament};
}

export function makeArtAvatar(){
  const root=new T.Group(),visual=new T.Group(),body=new T.Group();
  root.name='traveller';visual.name='traveller-heading';body.name='traveller-body';root.add(visual);visual.add(body);
  const torso=new T.Group();
  torso.add(cyl(.125,.17,.29,P.paperLight,[0,.385,0],12),cyl(.122,.14,.042,P.red,[0,.358,-.002],12));
  const collarL=box(.034,.16,.02,P.paperShade,[-.034,.47,-.11],.007);collarL.rotation.z=-.43;
  const collarR=box(.039,.13,.023,P.paper,[.019,.474,-.117],.007);collarR.rotation.z=.38;torso.add(collarL,collarR);
  torso.add(ball(.16,P.skin,[0,.65,-.005],[1,.99,.92]));
  // Hair is a separate upper cap, so the face stays clear and cannot flicker.
  torso.add(part(new T.SphereGeometry(.165,16,10,0,Math.PI*2,0,Math.PI*.46),P.ink,[0,.68,.003]),ball(.073,P.ink,[0,.838,.015],[1,.86,.95]),cyl(.06,.062,.016,P.red,[0,.81,.015],12));
  const hairpin=rod([-.092,.846,.016],[.105,.846,.016],.007,P.gold);torso.add(hairpin,ball(.018,P.celadon,[.115,.846,.016]));
  for(const x of [-.050,.050])torso.add(ball(.015,P.ink,[x,.66,-.145],[.8,1,.38]),ball(.020,P.redLight,[x*1.6,.62,-.130],[1,.36,.18]));
  torso.add(tube([[-.021,.601,-.146],[0,.596,-.150],[.021,.601,-.146]],.004,P.ink,6));
  torso.add(cyl(.13,.13,.045,P.red,[0,.535,0],12),box(.115,.19,.045,P.paperShade,[0,.43,.13],.02),box(.117,.027,.048,P.ink,[0,.536,.13],.007));
  body.add(mergeStatic(torso));
  const scarf=new T.Group();scarf.position.set(.055,.52,.10);scarf.add(box(.053,.19,.016,P.red,[0,-.084,.036],.004));scarf.rotation.x=-.35;body.add(scarf);
  const legs=[],arms=[];
  for(const [i,side] of [-1,1].entries()){
    const leg=new T.Group();leg.name=i?'legR':'legL';leg.position.set(side*.063,.26,0);
    const pieces=new T.Group();pieces.add(cyl(.047,.042,.185,P.paperShade,[0,-.082,0],8),box(.093,.064,.14,P.ink,[0,-.222,-.021],.021),box(.096,.014,.14,P.paper,[0,-.249,-.022],.005));leg.add(mergeStatic(pieces));body.add(leg);legs.push(leg);
    const arm=new T.Group();arm.name=i?'armR':'armL';arm.position.set(side*.139,.483,0);
    const sleeve=new T.Group();sleeve.add(cyl(.047,.065,.18,P.paperLight,[side*.014,-.071,0],10),cyl(.067,.067,.021,P.paperShade,[side*.014,-.166,0],10),ball(.036,P.skin,[side*.014,-.19,-.006]));
    arm.add(mergeStatic(sleeve));arm.rotation.z=side*.08;body.add(arm);arms.push(arm);
  }
  return {root,visual,body,animate(time,moving,reduced){
    const swing=moving&&!reduced?Math.sin(time*8.5)*.61:0;
    legs[0].rotation.x=swing;legs[1].rotation.x=-swing;arms[0].rotation.x=-swing*.69;arms[1].rotation.x=swing*.69;
    body.position.y=reduced?0:moving?Math.abs(Math.sin(time*8.5))*.015:Math.sin(time*2.1)*.003;
    scarf.rotation.x=-.35+(reduced?0:Math.sin(time*(moving?8.5:2.3))*(moving?.19:.035));
  }};
}

export function makeArtGuide(variant='sprout'){
  const root=new T.Group(),visual=new T.Group();root.name=`paper-crane-${variant}`;root.add(visual);
  const color=({sprout:P.paperLight,petal:'#ead4c9',ember:'#e5c691',droplet:'#bdcfcc'})[variant]||P.paperLight;
  const crane=paperCrane(color);visual.add(crane.root);crane.root.position.y=.055;
  return {root,visual,animate(time,reduced){
    const flap=reduced?0:Math.sin(time*3.8)*.20;
    crane.wingL.rotation.z=-flap;crane.wingR.rotation.z=flap;
    crane.root.rotation.x=reduced?0:Math.sin(time*1.9)*.04;
  }};
}

/** Matching still-life keepsakes for article and collection cover renders. */
export function makeTreasure(id){
  const g=new T.Group();g.name=`poem-keepsake-${id}`;
  if(id==='home'){
    g.add(ring(.17,.035,P.celadon,[0,.23,0]),box(.33,.04,.13,P.slate,[0,.035,0],.014));
    const plum=makePlumBranch(.51);plum.position.set(-.13,.02,.045);g.add(plum);
  }else if(id==='journal'){
    const sheet=page(g,.28,.42,[0,.24,0],0);g.add(cyl(.025,.025,.32,P.ink,[0,.46,0],10),cyl(.025,.025,.32,P.ink,[0,.025,0],10));
    g.children[1].rotation.z=Math.PI/2;g.children[2].rotation.z=Math.PI/2;
    for(let i=0;i<4;i++)sheet.add(box(.004,.37,.004,P.red,[-.11+i*.07,0,-.013],.001));
  }else if(id==='studio'){
    const ink=makeInkstone(.8),brush=makeBrush(.56);brush.position.set(.10,.02,-.025);brush.rotation.z=-.56;g.add(ink,brush);
  }else if(id==='library'){
    for(let i=0;i<7;i++){const x=(i-3)*.049;g.add(box(.042,.35,.034,i%2?P.bamboo:P.paperShade,[x,.20,Math.abs(i-3)*.012],.006));for(let j=0;j<3;j++)g.add(box(.014,.019,.006,P.ink,[x,.12+j*.071,-.019+Math.abs(i-3)*.012],.002));}
    for(const y of [.075,.33])g.add(rod([-.18,y,.012],[.18,y,.012],.008,P.red));
  }else if(id==='lab'){
    lantern(g,0,.25,0,.14);g.add(cyl(.16,.18,.032,P.slate,[0,.019,0],8));
  }else if(id==='observatory'){
    g.add(ball(.095,P.celadon,[0,.28,0]),ring(.21,.014,P.gold,[0,.28,0]),cyl(.028,.08,.12,P.ink,[0,.065,0],8));
    const orbit=ring(.22,.01,P.ink,[0,.28,0]);orbit.rotation.y=.8;orbit.rotation.x=.65;g.add(orbit);
  }else if(id==='mail'){
    g.add(box(.44,.30,.037,P.paperLight,[0,.17,0],.008),rod([-.20,.30,-.026],[0,.15,-.026],.007,P.red),rod([0,.15,-.026],[.20,.30,-.026],.007,P.red),box(.07,.08,.01,P.red,[.13,.245,-.026],.003));
    const crane=paperCrane();crane.root.scale.setScalar(.42);crane.root.position.set(.14,.40,0);g.add(crane.root);
  }else{
    g.add(cyl(.21,.21,.02,P.slate,[0,.016,0],20),ball(.12,P.celadon,[0,.16,0],[1,.86,1]),cyl(.073,.073,.025,P.ink,[0,.27,0],14),ball(.021,P.gold,[0,.295,0]));
    const handle=ring(.079,.016,P.celadon,[-.115,.17,0]);g.add(handle,tube([[.08,.16,0],[.15,.20,0],[.19,.24,0]],.025,P.celadon));
  }
  return mergeStatic(g);
}
