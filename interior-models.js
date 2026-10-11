(function(root){
  'use strict';
  const T=root.THREE;
  if(!T) throw new Error('TownInteriors requires THREE');
  const materials=new Map();
  const rooms={
    hut:{name:'叮当小屋 · 室内',accent:'#cf755f',wall:'#f0e3c8',trim:'#94694a',floor:'#b77c50',light:'#ffd998',size:[7,5.8,3.7]},
    cafe:{name:'月桂餐厅 · 室内',accent:'#8670a4',wall:'#ead7bd',trim:'#735b61',floor:'#ad7957',light:'#ffe2a8',size:[7.4,6.1,3.8]},
    farm:{name:'谷仓农场 · 室内',accent:'#a95d4d',wall:'#d7c495',trim:'#735840',floor:'#99714d',light:'#ffe19e',size:[8.2,6.5,4.1]},
    mine:{name:'矿井控制室 · 室内',accent:'#52616a',wall:'#747e80',trim:'#3c494d',floor:'#555f61',light:'#e6c278',size:[8.4,6.4,4.2]},
    bakery:{name:'烘焙工房 · 室内',accent:'#c8774f',wall:'#f0d2a6',trim:'#8a5a45',floor:'#ba8259',light:'#ffe0a1',size:[7.8,6,3.9]},
    bank:{name:'金库大厅 · 室内',accent:'#4f978b',wall:'#d7dbc9',trim:'#546e67',floor:'#a8966f',light:'#fff1ae',size:[8.1,6.3,4.1]},
    tower:{name:'灯塔观景台 · 室内',accent:'#d57766',wall:'#dbe6d8',trim:'#647d78',floor:'#7f9da0',light:'#fff0ad',size:[7.4,6,4.8]}
  };
  const ids=Object.keys(rooms);

  function appearanceLevel(level){
    if(root.TownModels&&typeof root.TownModels.appearanceLevel==='function')return root.TownModels.appearanceLevel(level);
    const n=Math.max(1,Math.floor(Number(level)||1));return n<=2?1:n<=5?2:n<=7?3:4;
  }
  function mat(color,rough=.88,metal=0){
    const key=[color,rough,metal].join('|');
    if(!materials.has(key))materials.set(key,new T.MeshStandardMaterial({color,roughness:rough,metalness:metal,flatShading:true}));
    return materials.get(key);
  }
  function mesh(group,geometry,color,x=0,y=0,z=0,opts={}){
    const object=new T.Mesh(geometry,mat(color,opts.roughness??.88,opts.metalness??0));
    object.position.set(x,y,z);object.castShadow=opts.castShadow!==false;object.receiveShadow=opts.receiveShadow!==false;
    object.userData.interiorPart=opts.part||'prop';group.add(object);return object;
  }
  function box(g,w,h,d,color,x=0,y=h/2,z=0,o){return mesh(g,new T.BoxGeometry(w,h,d),color,x,y,z,o)}
  function cyl(g,top,bottom,h,color,x=0,y=h/2,z=0,radial=10,o){return mesh(g,new T.CylinderGeometry(top,bottom,h,radial),color,x,y,z,o)}
  function ball(g,r,color,x=0,y=r,z=0,detail=0,o){return mesh(g,new T.IcosahedronGeometry(r,detail),color,x,y,z,o)}
  function torus(g,r,t,color,x=0,y=0,z=0,radial=6,tubular=12,o){return mesh(g,new T.TorusGeometry(r,t,radial,tubular),color,x,y,z,o)}
  function beam(g,a,b,r,color,o){
    const start=new T.Vector3(...a),end=new T.Vector3(...b),delta=end.clone().sub(start),m=cyl(g,r,r,delta.length(),color,0,0,0,8,o);
    m.position.copy(start.clone().add(end).multiplyScalar(.5));m.quaternion.setFromUnitVectors(new T.Vector3(0,1,0),delta.normalize());return m;
  }
  function roof(g,w,h,d,color,y,x=0,z=0,o){return box(g,w,h,d,color,x,y,z,{...(o||{}),part:(o&&o.part)||'roof'})}
  function materialStrip(g,x,y,z,w,h,d,color){box(g,w,h,d,color,x,y,z,{part:'trim'})}
  function tileFloor(g,w,d,color,accent){
    box(g,w,.12,d,color,0,.06,0,{part:'floor'});
    for(let x=-w/2+.22;x<w/2-.1;x+=.58)box(g,.028,.014,d-.2,accent,x,.128,0,{part:'floor-line'});
    for(let z=-d/2+.22;z<d/2-.1;z+=.58)box(g,w-.2,.014,.028,accent,0,.13,z,{part:'floor-line'});
    box(g,w+.08,.06,.08,accent,0,.15,-d/2-.01,{part:'threshold'});
  }
  function roomShell(g,id){
    const r=rooms[id], [w,d,h]=r.size;
    tileFloor(g,w,d,r.floor,id==='mine'?'#414c4f':'#d9bd8a');
    box(g,w,.12,.14,r.trim,0,h*.5,-d/2,{part:'back-wall'});
    box(g,.14,h,d,r.wall,-w/2, h/2,0,{part:'side-wall'});
    box(g,.14,h,d,r.wall,w/2, h/2,0,{part:'side-wall'});
    for(const x of [-w/2+.3,w/2-.3])beam(g,[x,.15,-d/2+.08],[x,h,-d/2+.08],.065,r.trim,{part:'wall-frame'});
    for(const x of [-w/2+.3,0,w/2-.3])beam(g,[x,h-.07,-d/2+.08],[x,h-.07,d/2-.08],.055,r.trim,{part:'ceiling-frame'});
    const light=new T.PointLight(r.light,.7,Math.max(w,d)*1.45);light.position.set(0,h-0.34,.35);light.castShadow=true;light.userData.interiorPart='warm-light';g.add(light);
    const pendant=cyl(g,.07,.1,.14,r.accent,0,h-.34,.35,8,{part:'lamp'});ball(g,.19,r.light,0,h-.47,.35,0,{part:'lamp'});pendant.userData.interiorPart='lamp';
    g.userData.room={width:w,depth:d,height:h,theme:id,openFront:true};
    return r;
  }
  function windowPane(g,x,y,z,w,h,frame,tint){
    box(g,w+.1,h+.1,.055,frame,x,y,z,{part:'window-frame'});box(g,w,h,.065,tint,x,y,z+.035,{part:'window-glass'});
    box(g,.035,h,.075,frame,x,y,z+.06,{part:'window-mullion'});box(g,w,.035,.075,frame,x,y,z+.06,{part:'window-mullion'});
  }
  function door(g,x,z,w,h,color,frame){
    box(g,w,h,.09,frame,x,.15+h/2,z,{part:'door-frame'});box(g,w-.1,h-.1,.12,color,x,.15+h/2,z+.06,{part:'door'});ball(g,.035,'#f5dc91',x+w*.28,.15+h/2,z+.11,0,{part:'door-handle'});
  }
  function shelf(g,x,y,z,w,d,color,items){
    box(g,w,.11,d,color,x,y,z,{part:'shelf'});for(let i=0;i<items;i++)box(g,.055,.75,.055,color,x-w/2+.15+i*(w-.3)/Math.max(1,items-1),y+.42,z,{part:'shelf-post'});
  }
  function table(g,x,z,w,d,color,top='#ead7b1'){
    box(g,w,.1,d,top,x,.85,z,{part:'table'});for(const dx of [-w*.38,w*.38])for(const dz of [-d*.35,d*.35])box(g,.09,.76,.09,color,x+dx,.45,z+dz,{part:'table-leg'});
  }
  function stool(g,x,z,color,seat='#d39d61'){
    cyl(g,.16,.18,.11,seat,x,.73,z,8,{part:'stool'});cyl(g,.045,.055,.63,color,x,.37,z,8,{part:'stool-leg'});
  }
  function plant(g,x,z,leaf='#73a667',pot='#a9684b'){
    cyl(g,.17,.2,.18,pot,x,.24,z,8,{part:'plant-pot'});cyl(g,.03,.04,.34,'#5b8155',x,.48,z,7,{part:'plant-stem'});ball(g,.18,leaf,x,.68,z,0,{part:'plant-leaf'});ball(g,.14,leaf,x-.12,.59,z+.04,0,{part:'plant-leaf'});
  }
  function lamp(g,x,z,color='#f7dda1'){
    cyl(g,.035,.05,.62,'#53605c',x,.47,z,8,{part:'floor-lamp'});box(g,.2,.15,.2,color,x,.85,z,{part:'floor-lamp'});box(g,.24,.05,.24,'#46534f',x,.96,z,{part:'floor-lamp'});
  }
  function rug(g,x,z,w,d,color,trim){box(g,w,.025,d,color,x,.145,z,{part:'rug'});box(g,w,.032,.045,trim,x,.16,z-d/2,{part:'rug-trim'});box(g,w,.032,.045,trim,x,.16,z+d/2,{part:'rug-trim'})}
  function cabinet(g,x,z,w,h,d,color,handle='#dfca8f'){
    box(g,w,h,d,color,x,.15+h/2,z,{part:'cabinet'});for(let y=.42;y<h-.15;y+=.45)box(g,w*.7,.025,.025,handle,x,.15+y,z+d/2+.015,{part:'cabinet-detail'});for(const y of [.15+h*.35,.15+h*.7])ball(g,.03,handle,x,.15+y,z+d/2+.05,0,{part:'cabinet-handle'});
  }
  function sign(g,x,y,z,w,color,detail){box(g,w,.26,.06,color,x,y,z,{part:'sign'});box(g,w*.6,.045,.075,detail,x,y,z+.04,{part:'sign-detail'})}
  function crate(g,x,z,w=.38,d=.38,color='#a8784e'){box(g,w,.35,d,color,x,.33,z,{part:'crate'});box(g,w+.02,.045,.045,'#d4aa70',x,.48,z,{part:'crate-band'});box(g,.045,.4,d+.02,'#7e593f',x,.33,z,{part:'crate-corner'})}
  function pipe(g,a,b,r,color='#8d9b9a'){return beam(g,a,b,r,color,{part:'pipe'})}
  function track(g,x,z,length){for(const offset of [-.22,.22])box(g,.055,.045,length,'#39484d',x+offset,.2,z,{part:'rail'});for(let q=-length/2+.14;q<length/2;q+=.24)box(g,.68,.05,.075,'#765b46',x,.18,z+q,{part:'sleeper'})}
  function cart(g,x,z,color='#78624e'){box(g,.72,.32,.5,color,x,.43,z,{part:'mine-cart'});box(g,.76,.07,.55,'#46545a',x,.61,z,{part:'mine-cart-rim'});for(const dx of [-.25,.25]){const wheel=cyl(g,.1,.1,.06,'#2d3a3e',x+dx,.27,z-.22,8,{part:'mine-cart-wheel'});wheel.rotation.z=Math.PI/2;}}

  function hut(g,t){
    const r=rooms.hut;
    windowPane(g,-2.55,2.15,-2.86,1.12,.8,'#8b6147','#b5d6ce');windowPane(g,2.55,2.15,-2.86,1.12,.8,'#8b6147','#b5d6ce');
    door(g,0,-2.91,1.08,1.9,'#79523d','#5d483e');rug(g,0,-.4,2.35,1.35,'#cf876f','#f3d4ac');
    const bedX=t>=3?-1.58:-1.35;box(g,1.55,.34,2.18,'#8e6048',bedX,.39,.52,{part:'bed'});box(g,1.4,.2,1.2,t>=3?'#e8d5b4':'#d9bc9e',bedX,.67,.85,{part:'bed-cover'});box(g,1.35,.18,.38,'#f6e6c4',bedX,.78,-.21,{part:'pillow'});
    cabinet(g,2.15,-.84,.72,1.2,.52,'#8a6048');table(g,-.12,.5,1.28,.85,'#73533f');for(const x of [-.55,.55])stool(g,x,.5,'#76543e');
    box(g,.75,.65,.16,'#8f5e42',-.16,-2.72,.8,{part:'hearth'});box(g,.48,.34,.18,'#413e3a',-.16,-2.63,.9,{part:'hearth-fire'});for(const x of [-.21,.02])ball(g,.08,'#ed9c56',x,-2.53,.91,0,{part:'hearth-fire'});
    shelf(g,1.9,1.32,-2.83,.85,.2,'#835b42',3);plant(g,-2.35,-1.82,t>=3?'#6fa36a':'#77a45d','#aa6e4c');
    if(t>=2){box(g,1.48,.06,2.3,'#ad774e',-1.58,.17,.52,{part:'bed-platform'});box(g,.64,.8,.18,'#d8ba8e',-2.15,.56,.5,{part:'nightstand'});lamp(g,-2.15,.51,'#f3d18e');plant(g,2.3,1.2,'#78a96b');}
    if(t>=3){windowPane(g,0,2.35,-2.89,1.25,.78,'#8b6147','#aed9d5');box(g,.1,1.9,.18,'#bd845a',-2.72,.98,-.2,{part:'curtain-rail'});box(g,.08,1.22,.1,'#d7a68b',-2.65,1.43,-.27,{part:'curtain'});box(g,.08,1.22,.1,'#d7a68b',-2.79,1.43,-.27,{part:'curtain'});}
    if(t>=4){rug(g,0,1.52,2.55,1.02,'#b67868','#e8c39b');table(g,0,1.45,1.72,.72,'#765645','#d5b48a');for(const x of [-.55,.55])stool(g,x,1.45,'#765645');box(g,2.2,.12,.25,'#c9a478',0,2.72,-2.8,{part:'beam'});for(const x of [-.9,0,.9])box(g,.13,.72,.13,'#9a694d',x,2.43,-2.72,{part:'beam'});}
    g.userData.roomFeature=t>=4?'花园套房':'居民起居室';
  }
  function cafe(g,t){
    windowPane(g,-2.55,2.2,-3.02,1.34,1.05,'#735d65','#aed8d1');windowPane(g,2.55,2.2,-3.02,1.34,1.05,'#735d65','#aed8d1');
    door(g,0,-3.08,1.1,1.95,'#6f5a59','#59494d');sign(g,0,3.1,-3.12,2.35,'#8270a4','#f3e2bd');
    box(g,3.25,.92,.68,'#8b5a47',0,.64,-2.08,{part:'counter'});box(g,3.05,.1,.74,'#ddba84',0,1.14,-2.08,{part:'counter-top'});stool(g,-1.0,-1.18,'#755244');stool(g,-.35,-1.18,'#755244');
    box(g,.58,.58,.4,'#526e70',.85,-2.1,1.2,{part:'espresso-machine'});cyl(g,.2,.2,.12,'#d1ac70',.85,1.53,-2.1,10,{part:'espresso-machine'});for(const x of [.45,.9,1.35])ball(g,.1,'#e5bc79',x,1.3,-2.08,0,{part:'cup'});
    table(g,-1.65,.15,.95,.72,'#785546');table(g,1.72,.15,.95,.72,'#785546');for(const x of [-1.65,1.72])for(const z of [-.45,.74])stool(g,x,z,'#755244');
    shelf(g,-2.5,1.24,-2.86,1.26,.22,'#70565b',4);shelf(g,2.5,1.24,-2.86,1.26,.22,'#70565b',4);for(const x of [-2.7,-2.3,2.3,2.7])ball(g,.11,'#d59f62',x,1.65,-2.82,0,{part:'jar'});
    plant(g,-2.55,1.82,'#6b9b71','#a86e4f');lamp(g,2.75,-.68,'#ffe4a5');rug(g,0,.58,4.4,1.1,'#9c7085','#d8b08d');
    if(t>=2){box(g,2.5,.08,1.35,'#bd9064',0,.18,-.65,{part:'bar-platform'});for(const x of [-.85,0,.85]){table(g,x,1.42,.65,.55,'#795a4c');stool(g,x,1.42,'#755244')}}
    if(t>=3){for(const x of [-1.82,1.82]){box(g,.56,.65,.32,'#e5d4b1',x,.56,-2.1,{part:'display'});box(g,.48,.08,.36,'#7e655d',x,.9,-2.1,{part:'display'});for(const z of [-2.18,-2.02])ball(g,.1,'#d28d67',x,.99,z,0,{part:'pastry'})}box(g,4.9,.11,.18,'#dbc5a0',0,2.86,-3.1,{part:'beam'});}
    if(t>=4){torus(g,.62,.08,'#cba774',0,1.82,.12,8,16,{part:'ceiling-lamp'});for(const a of [0,Math.PI/2,Math.PI,Math.PI*1.5])beam(g,[0,1.82,.12],[Math.cos(a)*.62,1.82,.12+Math.sin(a)*.62],.035,'#cba774',{part:'ceiling-lamp'});plant(g,2.65,1.86,'#6d9d72','#a86e4f');}
    g.userData.roomFeature=t>=4?'精品咖啡厅':'咖啡经营区';
  }
  function farm(g,t){
    const soil='#70543c',green='#6c9b56';windowPane(g,0,2.4,-3.22,1.5,1.1,'#735840','#b8d6b5');door(g,-2.55,-3.29,1.05,1.95,'#7c513d','#5d4436');
    box(g,1.8,.12,1.28,'#a6754e',0,.2,.95,{part:'workbench'});for(const x of [-.58,0,.58])box(g,.12,.55,.12,'#805c43',x,.48,.95,{part:'tool-rack'});for(const x of [-.58,0,.58])box(g,.08,.36,.05,'#c08a56',x,.76,.92,{part:'tool'});
    for(let x=-2.65;x<=2.65;x+=.78)for(let z=-1.8;z<=.1;z+=.72){box(g,.58,.06,.47,soil,x,.18,z,{part:'soil-bed'});for(let i=-1;i<=1;i++)ball(g,.08,green,x+i*.16,.36,z,0,{part:'crop'});}
    box(g,1.18,1.55,1.1,'#a65e4e',2.08,.92,.62,{part:'barn'});roof(g,1.4,.55,1.28,'#76503e',1.72,2.08,.62);door(g,2.08,1.21,.58,1.0,'#754b3a','#5f4335');
    // A plain front door keeps the barn readable from every orbit angle.
    shelf(g,-2.55,1.4,-2.98,1.2,.22,'#735840',4);for(const x of [-2.85,-2.45,-2.05])crate(g,x,-2.68,.28,.28,'#aa764c');plant(g,2.5,-1.82,'#6e9e59','#9f6b4a');
    if(t>=2){cyl(g,.43,.48,1.3,'#b8c1a0',2.08,1.15,-1.65,12,{part:'water-tank'});cyl(g,.48,.48,.1,'#748f83',2.08,1.85,-1.65,12,{part:'water-tank'});pipe(g,[2.08,1.82,-1.65],[2.08,.9,-1.65],.035,'#647b70');for(const x of [-2.8,-1.4,0,1.4])box(g,.05,1.5,.05,'#8c744e',x,.9,1.9,{part:'fence'});}
    if(t>=3){box(g,3.2,.07,1.2,'#9c754e',0,.18,2.12,{part:'loft'});for(const x of [-1.15,0,1.15])crate(g,x,2.15,.46,.42,'#a9794e');beam(g,[-3.2,3.35,-3.08],[3.2,3.35,-3.08],.07,'#6f5940',{part:'beam'});}
    if(t>=4){box(g,2.05,.08,1.8,'#b28a58',-.25,.18,1.25,{part:'seed-table'});for(const x of [-.82,0,.82])cyl(g,.14,.18,.24,'#9a6b49',-.25+x,.34,1.25,8,{part:'seed-pot'});for(const x of [-2.6,2.6])lamp(g,x,1.45,'#ffe3a0');}
    g.userData.roomFeature=t>=4?'农产加工间':'农场管理与仓储';
  }
  function mine(g,t){
    const steel='#4e5e64',dark='#344248',ore='#87969a';
    box(g,6.3,.12,4.85,'#5e6868',0,.06,.05,{part:'stone-floor'});for(let z=-2.1;z<2.25;z+=.52){box(g,.055,.014,4.5,'#424e51',0,.13,z,{part:'floor-line'})}
    for(const x of [-2.75,2.75]){beam(g,[x,.16,-2.75],[x,3.65,-2.75],.11,dark,{part:'support'});beam(g,[x,.16,-2.75],[x,3.65,2.3],.09,steel,{part:'support'});}
    beam(g,[-2.8,3.48,-2.7],[2.8,3.48,-2.7],.12,dark,{part:'beam'});door(g,0,-2.79,1.0,1.86,'#344248','#27343a');
    pipe(g,[-2.55,2.7,-2.6],[2.3,2.7,-2.6],.06,'#9b6a50');pipe(g,[2.3,2.7,-2.6],[2.3,1.2,-2.6],.06,'#9b6a50');
    track(g,0,1.32,4.85);crate(g,-1.72,-.55,.62,.58,'#87664c');crate(g,-.92,-.55,.62,.58,'#87664c');
    cart(g,.85,1.18,steel);cyl(g,.28,.32,.6,'#59676a',1.85,.55,1.05,8,{part:'drill'});torus(g,.32,.07,'#b48755',1.85,1.03,1.05,8,12,{part:'drill'});for(const [x,z] of [[-2.25,.55],[-1.75,.64],[2.08,.52],[2.48,.65]])ball(g,.3,ore,x,.34,z,0,{part:'ore'});
    lamp(g,-2.35,.75,'#e6c278');lamp(g,2.35,.75,'#e6c278');
    if(t>=2){box(g,1.32,.86,.86,steel,-1.55,.6,-1.42,{part:'control-console'});box(g,1.1,.09,.62,'#a9b6ae',-1.55,1.07,-1.42,{part:'control-console'});for(const x of [-1.85,-1.55,-1.25])ball(g,.08,'#e3bb68',x,1.22,-1.42,0,{part:'indicator'});for(const x of [-2.2,-1.4])crate(g,x,-2.0,.58,.55,'#785946');}
    if(t>=3){for(const x of [-1.5,-.5,.5,1.5])pipe(g,[x,1.5,-2.65],[x,2.85,-2.65],.045,'#75878a');cyl(g,.5,.55,1.15,'#69787a',2.0,.76,-1.25,10,{part:'separator'});cyl(g,.34,.4,.18,'#c39154',2.0,1.42,-1.25,10,{part:'separator'});}
    if(t>=4){box(g,2.9,.08,1.1,'#35454a',0,.2,-1.9,{part:'ore-table'});for(const x of [-1.1,-.55,0,.55,1.1])ball(g,.18,x%1?'#a0ada8':'#d09a55',x,.42,-1.9,0,{part:'ore-display'});for(const x of [-2.6,2.6])torus(g,.34,.06,'#d0a45a',x,2.8,-2.6,8,12,{part:'warning-light'});}
    g.userData.roomFeature=t>=4?'深层采掘控制室':'矿井作业区';
  }
  function bakery(g,t){
    windowPane(g,-2.55,2.18,-3.02,1.35,1.0,'#8a5a45','#e3c6a1');windowPane(g,2.55,2.18,-3.02,1.35,1.0,'#8a5a45','#e3c6a1');door(g,0,-3.08,1.08,1.9,'#805442','#64443a');sign(g,0,3.02,-3.12,2.1,'#c8774f','#ffe0ae');
    box(g,3.25,.86,.64,'#a86e4b',0,.61,-1.95,{part:'counter'});box(g,3.05,.11,.7,'#e2bf87',0,1.1,-1.95,{part:'counter-top'});for(const x of [-1.12,-.56,0,.56,1.12])ball(g,.12,'#ecc57e',x,1.29,-1.94,0,{part:'bread-display'});
    table(g,0,.22,2.45,.95,'#8c5e43','#d7aa78');for(const x of [-.82,0,.82])stool(g,x,.22,'#76513d');shelf(g,-2.55,1.28,-2.84,1.3,.24,'#895c43',5);shelf(g,2.55,1.28,-2.84,1.3,.24,'#895c43',5);for(const x of [-2.85,-2.4,2.4,2.85])ball(g,.11,'#d89163',x,1.66,-2.78,0,{part:'jar'});
    const ovenXs=t>=3?[-1.5,1.5]:[-1.08,1.08];for(const x of ovenXs){box(g,.92,.72,.78,'#b9805d',x,.54,.78,{part:'oven'});cyl(g,.43,.43,.15,t>=3?'#8e5d4d':'#a96d4f',x,1.0,.78,10,{part:'oven-mouth'});ball(g,.22,'#f29c54',x,1.02,.85,0,{part:'oven-fire'});}
    // Vent stacks stay simple and readable from every orbit angle.
    for(const x of ovenXs){pipe(g,[x,.95,.78],[x,2.75,.78],.045,'#8c6558');cyl(g,.12,.14,.08,'#6d524a',x,2.8,.78,8,{part:'vent-cap'});}
    rug(g,0,1.58,4.35,.8,'#c88d68','#efd2a1');plant(g,-2.62,1.75,'#74a06a','#ad704f');
    if(t>=2){for(const x of [-1.08,1.08]){box(g,.64,.1,.28,'#e4c08b',x,.18,.78,{part:'oven-hearth'});ball(g,.12,'#ef9e57',x,.97,.84,0,{part:'oven-fire'});}}
    if(t>=3){box(g,3.4,.12,.18,'#f1d6ad',0,2.85,-3.12,{part:'beam'});for(const x of [-1.7,1.7])lamp(g,x,-.15,'#ffe0a5');box(g,3.7,.08,.9,'#dbb788',0,.2,1.75,{part:'cooling-rack'});for(const x of [-1.35,-.45,.45,1.35])box(g,.08,.72,.08,'#a56a4f',x,.59,1.75,{part:'cooling-rack'});}
    if(t>=4){for(const x of [-1.95,1.95]){cabinet(g,x,1.15,.78,1.3,.55,'#c78b63','#efd19a');ball(g,.16,'#eebf79',x,.83,1.48,0,{part:'cake'});}torus(g,.72,.07,'#d7b16f',0,3.18,.72,8,16,{part:'ceiling-lamp'});}
    g.userData.roomFeature=t>=4?'大师烘焙工房':'烘焙生产与陈列区';
  }
  function bank(g,t){
    windowPane(g,-2.75,2.45,-3.18,1.32,1.2,'#536e67','#b9d8ce');windowPane(g,2.75,2.45,-3.18,1.32,1.2,'#536e67','#b9d8ce');door(g,0,-3.25,1.15,2.0,'#536e67','#435e59');sign(g,0,3.15,-3.29,2.2,'#4f978b','#e7dca8');
    box(g,4.1,.9,.68,'#718d7f',0,.64,-1.82,{part:'service-counter'});box(g,3.9,.12,.76,'#d6bc7e',0,1.18,-1.82,{part:'service-counter-top'});for(const x of [-1.45,-.72,0,.72,1.45])box(g,.06,.62,.06,'#f5e5b7',x,1.54,-1.82,{part:'counter-post'});
    for(const x of [-1.75,0,1.75])table(g,x,.2,1.1,.66,'#6f8171','#d9c58c');for(const x of [-1.75,0,1.75])for(const z of [-.25,.65])stool(g,x,z,'#536f67');
    box(g,2.2,1.62,.45,'#4e645f',0,.96,1.85,{part:'vault-room'});box(g,1.52,1.2,.1,'#b9a76c',0,.8,1.98,{part:'vault-door'});torus(g,.46,.08,'#e0ca79',0,.82,2.06,8,16,{part:'vault-wheel'});for(const a of [0,Math.PI/2,Math.PI,Math.PI*1.5])ball(g,.045,'#e0ca79',Math.cos(a)*.34,.82,2.07+Math.sin(a)*.34,0,{part:'vault-wheel'});
    shelf(g,-2.62,1.26,-2.98,1.3,.24,'#546e67',5);shelf(g,2.62,1.26,-2.98,1.3,.24,'#546e67',5);for(const x of [-2.9,-2.45,2.45,2.9])box(g,.2,.22,.2,'#d8be76',x,1.6,-2.84,{part:'ledger'});
    lamp(g,-2.6,-.35,'#fff0ae');lamp(g,2.6,-.35,'#fff0ae');rug(g,0,.96,4.7,1.02,'#779d8e','#d8c988');
    if(t>=2){for(const x of [-1.7,-.85,0,.85,1.7]){box(g,.48,.42,.34,'#879d8e',x,.42,1.26,{part:'safe-deposit'});box(g,.34,.035,.04,'#e1c97b',x,.62,1.45,{part:'safe-deposit'})}}
    if(t>=3){torus(g,.6,.07,'#d5b866',0,3.13,-.1,8,16,{part:'chandelier'});for(const a of [0,Math.PI/2,Math.PI,Math.PI*1.5])ball(g,.1,'#ffedaf',Math.cos(a)*.6,2.96,-.1+Math.sin(a)*.6,0,{part:'chandelier'});box(g,3.2,.08,.9,'#cbb979',0,.2,1.15,{part:'security-desk'});}
    if(t>=4){for(const x of [-2.42,2.42])cabinet(g,x,.98,.75,1.55,.48,'#668578','#dfc880');for(const x of [-2.8,-2.2,2.2,2.8])plant(g,x,1.72,'#6f9b75','#8c674b');}
    g.userData.roomFeature=t>=4?'中央金库大厅':'金融服务与保管区';
  }
  function tower(g,t){
    const sea='#5d8790',white='#e7e2cf',coral='#d57766';
    for(const x of [-2.6,2.6])windowPane(g,x,2.65,-3.02,1.15,1.2,'#647d78','#94c5cb');door(g,0,-3.08,1.02,1.86,'#71847d','#536b69');sign(g,0,3.14,-3.12,2.35,coral,'#f5e8c5');
    box(g,2.3,.12,2.1,white,0,.18,.5,{part:'observatory-platform'});cyl(g,1.05,1.05,.12,coral,0,.3,.5,12,{part:'compass'});for(const a of [0,Math.PI/2,Math.PI,Math.PI*1.5])beam(g,[0,.36,.5],[Math.cos(a)*1.05,.36,.5+Math.sin(a)*1.05],.035,sea,{part:'compass'});
    table(g,0,.5,1.7,.72,'#725943','#d7bd8b');for(const x of [-.58,.58])stool(g,x,.5,'#63756d');box(g,.62,.22,.4,sea,0,1.04,.5,{part:'chart-table'});for(const x of [-.2,0,.2])box(g,.1,.02,.38,'#dbbe79',x,1.16,.5,{part:'map'});
    const legX=-1.72;beam(g,[legX,.18,-1.4],[legX,2.65,-1.4],.11,sea,{part:'stair'});for(let i=0;i<7;i++)box(g,.9,.08,.24,white,legX+.26*i,-.01+.23*i,-1.4,{part:'stair-step'});
    cyl(g,.14,.16,.95,sea,1.82,.58,-1.25,10,{part:'telescope-stand'});const scope=box(g,.24,.9,.24,'#7d6860',1.82,1.25,-1.25,{part:'telescope'});scope.rotation.z=Math.PI/4;ball(g,.18,coral,2.14,1.57,-.93,0,{part:'telescope-lens'});
    shelf(g,-2.6,1.32,-2.84,1.2,.22,sea,4);for(const x of [-2.9,-2.5,-2.1])box(g,.11,.45,.2,'#c2ae77',x,1.58,-2.78,{part:'logbook'});plant(g,2.62,1.7,'#73a184','#9c6e50');
    if(t>=2){cyl(g,.26,.3,.15,sea,0,1.96,.5,12,{part:'beacon-console'});ball(g,.16,'#f2d47e',0,2.1,.5,0,{part:'beacon-console'});for(const x of [-1.2,1.2])lamp(g,x,.85,'#ffdda0');}
    if(t>=3){for(const a of [0,Math.PI/2,Math.PI,Math.PI*1.5])beam(g,[0,2.96,0],[Math.cos(a)*2.72,2.96,Math.sin(a)*2.72],.06,coral,{part:'ceiling-beam'});torus(g,.62,.07,coral,0,3.12,0,8,16,{part:'ceiling-lamp'});}
    if(t>=4){box(g,4.4,.08,.26,white,0,3.45,-2.98,{part:'balcony-rail'});for(const x of [-2.1,-1.05,0,1.05,2.1])box(g,.07,.58,.07,sea,x,3.72,-2.98,{part:'balcony-rail'});for(const x of [-2.55,2.55])lamp(g,x,1.9,'#fff0ad');}
    g.userData.roomFeature=t>=4?'航海观测台':'灯塔值守室';
  }

  const builders={hut,cafe,farm,mine,bakery,bank,tower};
  function create(id,level=1,options={}){
    if(!builders[id])throw new Error('Unknown interior: '+id);
    const tier=appearanceLevel(level),g=new T.Group(),room=roomShell(g,id);
    g.name=id+'-interior-tier'+tier;g.userData.interiorId=id;g.userData.level=Number(level)||1;g.userData.appearanceLevel=tier;g.userData.roomName=room.name;g.userData.theme=id;g.userData.orbit=orbitBounds(id,level);
    builders[id](g,tier,options);return g;
  }
  function orbitBounds(id,level=1){
    const r=rooms[id]||rooms.hut,[w,d,h]=r.size;
    return {width:w,depth:d,height:h,radius:Math.max(w,d)*.94,target:[0,h*.48,0],minDistance:Math.max(w,d)*.72,maxDistance:Math.max(w,d)*2.9,minPolar:.18,maxPolar:1.48,azimuth:[-Math.PI,Math.PI]};
  }
  root.TownInteriors={version:1,ids,rooms,create,orbitBounds,appearanceLevel,helpers:{box,cyl,ball,beam,torus,mat,windowPane,door,shelf,table,stool}};
})(globalThis);
