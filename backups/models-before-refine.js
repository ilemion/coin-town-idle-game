(function(root){
  'use strict';
  const T=root.THREE, palette=new Map();
  function material(color){if(!palette.has(color))palette.set(color,new T.MeshStandardMaterial({color,roughness:.78,flatShading:true}));return palette.get(color)}
  function mesh(g,geometry,color,x=0,y=0,z=0){const m=new T.Mesh(geometry,material(color));m.position.set(x,y,z);m.castShadow=true;m.receiveShadow=true;g.add(m);return m}
  const box=(g,w,h,d,c,x=0,y=h/2,z=0)=>mesh(g,new T.BoxGeometry(w,h,d),c,x,y,z);
  const cyl=(g,r1,r2,h,c,x=0,y=h/2,z=0,n=12)=>mesh(g,new T.CylinderGeometry(r1,r2,h,n),c,x,y,z);
  const ball=(g,r,c,x,y,z)=>mesh(g,new T.IcosahedronGeometry(r,1),c,x,y,z);
  function roof(g,w,h,d,c,y,x=0,z=0){const shape=new T.Shape();shape.moveTo(-w/2,0);shape.lineTo(w/2,0);shape.lineTo(0,h);shape.closePath();const geo=new T.ExtrudeGeometry(shape,{depth:d,bevelEnabled:false});geo.translate(0,0,-d/2);return mesh(g,geo,c,x,y,z)}
  function beam(g,a,b,r,color){const from=new T.Vector3(...a),to=new T.Vector3(...b),m=cyl(g,r,r,from.distanceTo(to),color);m.position.copy(from.add(to).multiplyScalar(.5));m.quaternion.setFromUnitVectors(new T.Vector3(0,1,0),new T.Vector3(...b).sub(new T.Vector3(...a)).normalize());return m}
  function torus(g,r,t,c,x,y,z){return mesh(g,new T.TorusGeometry(r,t,6,20),c,x,y,z)}
  function windowFront(g,x,y,z,w=.36,h=.4){box(g,w+.09,h+.09,.06,'#795841',x,y,z);box(g,w,h,.07,'#a4e6ed',x,y,z+.02);box(g,.035,h,.08,'#fff2cb',x,y,z+.05);box(g,w,.035,.08,'#fff2cb',x,y,z+.05)}
  function base(name){const g=new T.Group();g.name=name;box(g,2.6,.12,2.35,'#dad1ad',0,.06,0);return g}
  function plant(g,x,z){cyl(g,.14,.1,.2,'#ce8563',x,.19,z);ball(g,.18,'#659957',x,.39,z)}
  function hut(){const g=base('hut');box(g,1.7,1.3,1.55,'#f0c78a',0,.78,0);box(g,1.75,.12,1.6,'#9d754c',0,.19,0);roof(g,2.02,.79,1.9,'#db7558',1.43);box(g,.3,.79,.33,'#955640',.47,1.95,-.25);box(g,.39,.12,.4,'#cf9571',.47,2.36,-.25);box(g,.45,.85,.08,'#76533e',0,.55,.81);ball(g,.035,'#e9c166',.13,.51,.88);windowFront(g,-.56,.95,.82);windowFront(g,.56,.95,.82);windowFront(g,0,.95,-.84);const sw=windowFront;const side=new T.Group();sw(side,0,.93,.87);side.rotation.y=Math.PI/2;g.add(side);box(g,.7,.14,.38,'#c3ae86',0,.17,1);plant(g,-.98,.75);plant(g,.98,.75);return g}
  function cafe(){const g=base('cafe');box(g,1.95,1.36,1.5,'#f4e1af',0,.8,-.15);box(g,2.17,.19,1.76,'#8273ab',0,1.54,-.15);box(g,1.8,.8,.08,'#76b9c6',0,.83,.63);box(g,.08,1.1,.1,'#826954',.24,.68,.7);box(g,.7,.11,.18,'#a77b55',-.5,.52,.76);for(let i=0;i<8;i++){const aw=box(g,.26,.075,.7,i%2?'#f7eccb':'#bb7995',-.91+i*.26,1.32,.91);aw.rotation.x=.2;box(g,.26,.18,.06,i%2?'#f7eccb':'#bb7995',-.91+i*.26,1.16,1.25)}const cup=cyl(g,.28,.2,.34,'#fff1d4',0,1.84,-.1);torus(g,.15,.045,'#fff1d4',.3,1.84,-.1);cyl(g,.245,.245,.015,'#694632',0,2.02,-.1);cyl(g,.33,.33,.07,'#936f52',1.04,.63,1.03);cyl(g,.05,.07,.5,'#5c5341',1.04,.34,1.03);for(const x of [.66,1.4]){cyl(g,.15,.15,.06,'#8273ab',x,.32,.96);cyl(g,.04,.04,.2,'#66583f',x,.19,.96)}windowFront(g,0,.93,-.94);return g}
  function farm(){const g=base('farm');box(g,1.45,1.37,1.55,'#bb6250',-.35,.81,-.12);roof(g,1.78,.9,1.89,'#886745',1.5,-.35,-.12);box(g,.74,.95,.06,'#754a37',-.35,.65,.69);for(const x of [-.77,.07])box(g,.055,1.04,.1,'#f3ddaa',x,.68,.75);beam(g,[-.69,.22,.77],[-.01,1.06,.77],.025,'#f3ddaa');beam(g,[-.69,1.06,.77],[-.01,.22,.77],.025,'#f3ddaa');cyl(g,.37,.38,1.7,'#d1d3bf',.89,.97,-.29);cyl(g,0,.44,.42,'#849b98',.89,2.03,-.29);for(const y of [.5,1.15,1.7]){const ring=torus(g,.39,.025,'#92a4a0',.89,y,-.29);ring.rotation.x=Math.PI/2}for(let x=-1.03;x<=.25;x+=.24)for(let z=.97;z<=1.28;z+=.24){box(g,.16,.07,.18,'#997047',x,.17,z);beam(g,[x,.19,z],[x,.5,z],.012,'#a29a43');ball(g,.064,'#e6c166',x,.5,z)}return g}
  function mine(){const g=base('mine');for(const [x,y,z,r] of [[-.7,.61,-.25,.7],[.6,.7,-.3,.82],[0,1.12,-.54,.77],[-.4,.45,.32,.52],[.72,.37,.25,.5]])ball(g,r,'#87939a',x,y,z);box(g,.98,1.02,.1,'#283c45',0,.66,.49);for(const x of [-.59,.59])box(g,.14,1.17,.17,'#916b43',x,.7,.59);box(g,1.4,.17,.2,'#b08a56',0,1.29,.6);for(const x of [-.24,.24])box(g,.065,.045,1.5,'#687b80',x,.21,.64);for(let z=.15;z<1.44;z+=.22)box(g,.74,.055,.1,'#88694b',0,.17,z);box(g,.72,.38,.58,'#977754',0,.53,1.07);box(g,.56,.06,.45,'#53656c',0,.75,1.07);for(const x of [-.4,.4])for(const z of [.89,1.27]){const w=cyl(g,.11,.11,.07,'#3e535e',x,.31,z);w.rotation.z=Math.PI/2}for(const [x,z] of [[-.97,.58],[.91,.48]]){const crystal=cyl(g,0,.15,.51,'#6bcece',x,.4,z,5);crystal.rotation.z=x*.3}return g}
  function bakery(){const g=base('bakery');box(g,1.42,1.25,1.47,'#e9caa1',-.38,.74,-.15);roof(g,1.73,.65,1.79,'#dba75b',1.36,-.38,-.15);windowFront(g,-.69,.82,.62,.4,.5);box(g,.39,.8,.08,'#886547',-.13,.52,.63);cyl(g,.5,.56,.7,'#c7956c',.79,.49,.21);const dome=mesh(g,new T.SphereGeometry(.54,14,8,0,Math.PI*2,0,Math.PI/2),'#c87e52',.79,.84,.21);box(g,.33,.43,.1,'#4c3b34',.79,.43,.76);box(g,.24,1.05,.25,'#a57554',.92,1.39,.02);box(g,.32,.11,.32,'#d5a277',.92,1.96,.02);box(g,1.2,.13,.42,'#9f7550',-.37,.59,1.03);for(const x of [-.75,-.38,0]){const bread=ball(g,.17,'#e6b86e',x,.75,1.03);bread.scale.set(1.05,.65,.6)}const breadSign=torus(g,.2,.09,'#e9bb70',-.38,1.75,.8);breadSign.scale.set(1.4,.7,.5);return g}
  function bank(){const g=base('bank');for(let i=0;i<3;i++)box(g,2.12-i*.11,.1,1.8-i*.1,'#ddd7bb',0,.14+i*.1,.2);box(g,1.83,1.25,1.25,'#e6ddbb',0,1,-.22);box(g,.52,.8,.09,'#647b77',0,.78,.44);const vault=torus(g,.16,.035,'#d4bb78',0,.82,.51);for(const x of [-.75,-.25,.25,.75]){cyl(g,.065,.09,1.03,'#f6f0d8',x,.91,.7);cyl(g,.12,.12,.1,'#d3ccab',x,.37,.7);cyl(g,.13,.13,.12,'#efe8d0',x,1.47,.7)}box(g,2.1,.17,1.76,'#e3d7b3',0,1.6,0);roof(g,2.12,.62,1.81,'#64a995',1.69);const coin=cyl(g,.16,.16,.05,'#e6bf63',0,1.98,.94,20);coin.rotation.x=Math.PI/2;return g}
  function tower(){const g=base('tower');cyl(g,.72,.88,.24,'#b9b99b',0,.24,0);for(let i=0;i<5;i++)cyl(g,.38-i*.032,.413-i*.032,.4,i%2?'#df8067':'#f7edd5',0,.57+i*.4,0,16);cyl(g,.59,.59,.13,'#6f8580',0,2.55,0);for(let i=0;i<10;i++){const a=i*Math.PI/5;box(g,.025,.3,.025,'#7a8980',Math.cos(a)*.53,2.77,Math.sin(a)*.53)}const rail=torus(g,.54,.018,'#697e77',0,2.93,0);rail.rotation.x=Math.PI/2;cyl(g,.29,.29,.46,'#f0cd79',0,2.85,0);for(let i=0;i<4;i++){const a=i*Math.PI/2;box(g,.04,.49,.04,'#796f55',Math.cos(a)*.29,2.86,Math.sin(a)*.29)}cyl(g,0,.49,.48,'#d6745d',0,3.29,0);ball(g,.065,'#e9c570',0,3.57,0);box(g,.23,.4,.04,'#7c6951',0,.52,.42);for(const [x,z] of [[.7,.5],[-.6,-.5],[.6,-.5]])ball(g,.2,'#929c92',x,.26,z);return g}
  const factories={hut,cafe,farm,mine,bakery,bank,tower};
  const stages={
    hut:['乡间小屋','庭院住宅','双层宅邸','双翼庄园','单塔城堡','双塔城堡','金顶王宫'],
    cafe:['街角小店','露台咖啡馆','双层咖啡楼','咖啡商业街','咖啡钟塔','双塔会馆','皇家咖啡宫'],
    farm:['小型谷仓','标准农场','三仓粮站','风车农场','立体农庄','温室园区','金穗农业城'],
    mine:['小型矿洞','轨道矿场','提升机矿井','龙门起重矿场','精炼工厂','巨钻采矿站','水晶能源城'],
    bakery:['街角面包屋','庭院面包坊','双层烘焙楼','双炉烘焙园','面包钟塔','双塔甜点馆','皇家烘焙宫'],
    bank:['小型金库','石柱银行','双层银行','双翼金融馆','金库钟塔','双塔金融中心','皇家黄金宫'],
    tower:['海岸信标','标准灯塔','双层观景塔','双塔灯站','空中连桥塔','三塔天文台','日冕航标城']
  };
  const appearanceLevel=level=>Math.max(1,Math.min(7,Math.floor(Number(level)||1)));
  function fence(g,z=1.13,color='#eadbc0'){for(const x of [-1.13,-.75,.75,1.13])box(g,.07,.48,.07,color,x,.38,z);for(const x of [-.95,.95])for(const y of [.31,.49])box(g,.47,.05,.06,color,x,y,z)}
  function flag(g,x,y,z,color='#eab553'){cyl(g,.018,.018,.52,'#8b8060',x,y+.26,z);box(g,.3,.19,.025,color,x+.14,y+.4,z)}
  function planter(g,x,y,z){box(g,.5,.16,.19,'#ab805e',x,y,z);for(const dx of [-.15,0,.15])ball(g,.105,'#779b58',x+dx,y+.12,z);ball(g,.055,'#e8a2a1',x,y+.21,z)}
  function clock(g,x,y,z){const disk=cyl(g,.15,.15,.05,'#f6edc9',x,y,z,16);disk.rotation.x=Math.PI/2;beam(g,[x,y,z+.03],[x,y+.095,z+.03],.012,'#796345');beam(g,[x,y,z+.04],[x+.08,y-.035,z+.04],.012,'#796345')}
  function cap(g,x,y,z,color='#deb557'){cyl(g,0,.35,.43,color,x,y+.21,z,8);ball(g,.05,'#eac778',x,y+.46,z)}
  function upgradeAppearance(g,id,l){
    if(id==='hut'){
      if(l>=2){fence(g);planter(g,0,.34,-.94)}
      if(l>=3){for(const x of [-.4,.4])box(g,.065,1.17,.065,'#e5d0a8',x,.72,1.02);roof(g,1.1,.25,.6,'#cc7956',1.32,0,1)}
      if(l>=4){box(g,.59,.39,.52,'#f5d89c',-.43,1.91,.44);roof(g,.76,.31,.65,'#db7558',2.12,-.43,.44);windowFront(g,-.43,1.95,.72,.25,.22)}
      if(l>=5){for(const x of [-1.02,1.02]){box(g,.44,.78,1.12,'#efc894',x,.59,-.12);roof(g,.59,.27,1.3,'#b26c4d',1,x,-.12)}}
      if(l>=6){box(g,.53,.88,.6,'#f4ddaa',0,2.31,-.48);roof(g,.74,.37,.8,'#78a193',2.78,0,-.48);clock(g,0,2.47,-.16)}
      if(l>=7){cap(g,0,3.14,-.48);for(const x of [-1.02,1.02])flag(g,x,1.27,-.22);box(g,1.9,.07,.07,'#e0b65e',0,1.48,.92)}
    }else if(id==='cafe'){
      if(l>=2){planter(g,-.69,.25,1.27);planter(g,.07,.25,1.27);fence(g,-1.06,'#a3b19a')}
      if(l>=3){cyl(g,.018,.025,1.5,'#887653',1.02,.91,.95);cyl(g,0,.55,.24,'#b695bf',1.02,1.76,.95,8)}
      if(l>=4){for(const x of [-.78,.78])planter(g,x,1.71,-.58);for(const x of [-.9,.9])box(g,.03,.38,.03,'#dccfb0',x,1.81,-.92);box(g,1.8,.035,.035,'#dccfb0',0,1.99,-.92)}
      if(l>=5){box(g,1.35,.9,.75,'#e5cba5',0,2.08,-.52);box(g,1.51,.14,.95,'#7d75a5',0,2.59,-.52);windowFront(g,-.36,2.15,-.1,.36,.45);windowFront(g,.36,2.15,-.1,.36,.45)}
      if(l>=6){box(g,1.72,.11,.55,'#a08a67',0,1.99,.12);for(const x of [-.8,-.4,0,.4,.8])box(g,.03,.32,.03,'#f5dbab',x,2.2,.4);box(g,1.7,.04,.04,'#f5dbab',0,2.37,.4)}
      if(l>=7){cyl(g,.32,.22,.38,'#e4b755',0,2.89,-.52);torus(g,.17,.043,'#e4b755',.33,2.9,-.52);for(const x of [-.58,.58])cap(g,x,2.68,-.52,'#b29ac5')}
    }else if(id==='farm'){
      if(l>=2){fence(g);for(const x of [-1.07,-.75])box(g,.22,.26,.3,'#d9b867',x,.31,-1)}
      if(l>=3){cyl(g,.27,.3,1.22,'#c6c5ac',1.01,.73,.66);cyl(g,0,.35,.3,'#819b87',1.01,1.49,.66)}
      if(l>=4){cyl(g,.12,.2,1.22,'#d7c19a',-.38,2.6,.2,8);const rotor=new T.Group();rotor.position.set(-.38,3.24,.43);for(let i=0;i<4;i++){const blade=box(rotor,.15,.61,.06,'#f6e3af',0,.35,0);const arm=new T.Group();rotor.remove(blade);arm.add(blade);arm.rotation.z=i*Math.PI/2;rotor.add(arm)}g.add(rotor);ball(g,.1,'#a88851',-.38,3.24,.5)}
      if(l>=5){torus(g,.33,.07,'#8f7453',-.72,.69,1.37);for(let i=0;i<6;i++){const a=i*Math.PI/3;beam(g,[-.72,.69,1.37],[-.72+Math.cos(a)*.31,.69+Math.sin(a)*.31,1.37],.025,'#b59a66')}}
      if(l>=6){box(g,.74,.61,.78,'#a6ccc0',1.36,.53,-.85);roof(g,.83,.33,.9,'#8db5a9',.85,1.36,-.85);for(const x of [1.1,1.36,1.62])box(g,.03,.66,.81,'#efe4bf',x,.56,-.85)}
      if(l>=7){flag(g,.89,2.25,-.29);for(const x of [-.62,-.36,-.1]){beam(g,[x,1.96,.96],[x,2.37,.96],.018,'#e6bd51');ball(g,.08,'#f4d575',x,2.35,.96)}}
    }else if(id==='mine'){
      if(l>=2){for(const x of [-.75,.75]){beam(g,[x,.2,.78],[x,1.5,.78],.035,'#6c6c59');ball(g,.13,'#f5d17b',x,1.49,.78)}}
      if(l>=3){for(const [x,y,z] of [[-.86,.7,-.45],[.75,1.28,-.45],[-.34,1.88,-.65]]){const c=cyl(g,0,.18,.68,'#77c7ca',x,y,z,5);c.rotation.z=.22}}
      if(l>=4){for(const x of [-.42,.42])beam(g,[x,1.6,-.7],[x*.7,2.86,-.7],.065,'#9d7c51');box(g,1.04,.17,.67,'#bd995e',0,2.89,-.7);const w=torus(g,.29,.055,'#676d62',0,2.84,-.34);beam(g,[0,2.63,-.34],[0,1.08,-.34],.018,'#666a61')}
      if(l>=5){for(const x of [.88,1.17])box(g,.04,.04,1.35,'#6c8888',x,.17,.27);box(g,.43,.27,.5,'#ac8151',1.01,.41,.44);for(const z of [.26,.62]){const w=cyl(g,.075,.075,.035,'#4c6268',.77,.24,z);w.rotation.z=Math.PI/2}}
      if(l>=6){box(g,.47,.78,.65,'#ac9274',-1.04,.56,-.5);cyl(g,.095,.11,1.45,'#7c7669',-1.05,1.29,-.6);box(g,.57,.09,.73,'#806e56',-1.04,.99,-.5)}
      if(l>=7){const c=cyl(g,0,.31,1.4,'#997ac9',.68,2.21,-.68,6);c.rotation.z=-.24;for(const x of [-.55,0,.55])box(g,.16,.11,.13,'#edc667',x,1.43,.72)}
    }else if(id==='bakery'){
      if(l>=2){planter(g,-.42,.26,1.35);planter(g,.7,.26,1.12);fence(g,-1.04)}
      if(l>=3){for(let i=0;i<5;i++){const a=box(g,.24,.055,.52,i%2?'#f7e2b1':'#cc8d66',-.86+i*.24,1.2,.92);a.rotation.x=.18}}
      if(l>=4){cyl(g,.32,.35,.48,'#d4a477',-1.04,.39,1.02);mesh(g,new T.SphereGeometry(.34,12,6,0,Math.PI*2,0,Math.PI/2),'#c87e52',-1.04,.62,1.02);cyl(g,.07,.09,.95,'#a77558',-1.16,1,1);box(g,.17,.24,.05,'#715047',-1.04,.36,1.34)}
      if(l>=5){box(g,.43,.73,.47,'#e5c6a0',-.38,2.08,-.36);roof(g,.61,.3,.64,'#cc9056',2.47,-.38,-.36);clock(g,-.38,2.2,-.1)}
      if(l>=6){box(g,.74,.51,.55,'#f0dcb5',.1,1.76,.21);roof(g,.89,.28,.7,'#ba815a',2.04,.1,.21);windowFront(g,.1,1.77,.53,.36,.3)}
      if(l>=7){cap(g,-.38,2.77,-.36);for(const x of [-.85,-.38,.09]){const t=torus(g,.12,.05,'#ecca7c',x,1.36,1.11);t.scale.y=.7}flag(g,.93,2.02,.02,'#e3b55c')}
    }else if(id==='bank'){
      if(l>=2){for(const x of [-1.06,1.06]){cyl(g,.13,.19,.35,'#d0b96e',x,.3,1);ball(g,.17,'#77966c',x,.63,1)}}
      if(l>=3){for(const x of [-1.09,1.09]){box(g,.34,1.83,.44,'#d5caa5',x,1.12,-.5);cap(g,x,2.06,-.5,'#80a999')}}
      if(l>=4){cyl(g,.42,.49,.4,'#e7d9ad',0,2.45,-.25);mesh(g,new T.SphereGeometry(.48,16,8,0,Math.PI*2,0,Math.PI/2),'#6da995',0,2.64,-.25)}
      if(l>=5){for(const x of [-1.03,1.03]){box(g,.42,.88,1.02,'#e2d7b8',x,.61,.05);roof(g,.6,.26,1.22,'#64a995',1.1,x,.05)}}
      if(l>=6){box(g,.44,.56,.4,'#e8d8ac',0,3.12,-.25);clock(g,0,3.16,-.025);cap(g,0,3.41,-.25,'#76a38b')}
      if(l>=7){for(const x of [-1.05,1.05]){cyl(g,.07,.12,.75,'#d8b05d',x,1.65,.63);ball(g,.15,'#ebc96f',x,2.1,.63)}box(g,2.1,.06,.09,'#e0b75c',0,1.74,.92);flag(g,0,3.9,-.25)}
    }else if(id==='tower'){
      if(l>=2){for(let i=0;i<12;i++){const a=i*Math.PI/6;box(g,.04,.32,.04,'#f3e1b9',Math.cos(a)*.82,.45,Math.sin(a)*.82)}const r=torus(g,.82,.035,'#f3e1b9',0,.6,0);r.rotation.x=Math.PI/2}
      if(l>=3){box(g,.67,.12,.93,'#b2986b',0,.21,.94);for(const x of [-.3,.3])box(g,.06,.63,.06,'#9b855c',x,.42,1.31)}
      if(l>=4){cyl(g,.62,.62,.11,'#6d9290',0,1.63,0);const r=torus(g,.59,.03,'#b9bdab',0,1.94,0);r.rotation.x=Math.PI/2;for(let i=0;i<8;i++){const a=i*Math.PI/4;box(g,.024,.31,.024,'#b9bdab',Math.cos(a)*.59,1.79,Math.sin(a)*.59)}}
      if(l>=5){for(const x of [-.61,.61]){beam(g,[x,.3,-.48],[x,2.26,-.48],.025,'#887e5f');for(let i=0;i<3;i++)box(g,.24,.13,.024,['#e89a79','#edcc76','#84aeb6'][i],x+.11,2.13-i*.25,-.48)}}
      if(l>=6){const orbit=torus(g,.68,.028,'#e3bd69',0,3.11,0);orbit.rotation.x=.8;const orbit2=torus(g,.63,.025,'#a6bcc1',0,3.11,0);orbit2.rotation.y=.9;ball(g,.13,'#d3ddc8',.69,3.13,0)}
      if(l>=7){for(let i=0;i<8;i++){const a=i*Math.PI/4;beam(g,[Math.cos(a)*.48,3.52,Math.sin(a)*.48],[Math.cos(a)*.75,3.76,Math.sin(a)*.75],.027,'#e4bc62');ball(g,.065,'#f0d987',Math.cos(a)*.75,3.76,Math.sin(a)*.75)}cyl(g,0,.15,.52,'#e6c671',0,3.85,0)}
    }
  }
  function tierArchitecture(id,l){
    const g=base(id),gold='#e7bc57',stone='#e9d8b4';
    function source(scale,y=0){const body=factories[id](),pad=body.children[0];body.remove(pad);pad.geometry.dispose();body.scale.setScalar(scale);body.position.y=y;g.add(body);return body}
    function pavilion(x,z,h,w,color,kind=id){box(g,w,h,w*.94,stone,x,.12+h/2,z);if(kind==='bank'){cyl(g,w*.5,w*.5,.15,'#789a8f',x,h+.2,z);mesh(g,new T.SphereGeometry(w*.51,12,6,0,Math.PI*2,0,Math.PI/2),color,x,h+.27,z)}else if(kind==='bakery'){cyl(g,w*.45,w*.5,.2,color,x,h+.19,z);mesh(g,new T.SphereGeometry(w*.5,12,6,0,Math.PI*2,0,Math.PI/2),color,x,h+.29,z)}else if(kind==='cafe'){box(g,w*1.12,.15,w*1.1,color,x,h+.2,z);for(const dx of [-w*.35,w*.35])plant(g,x+dx,z+w*.27)}else roof(g,w*1.18,w*.45,w*1.12,color,h+.12,x,z);for(let y=.55;y<h;y+=.63)windowFront(g,x,y,z+w*.48,w*.48,.29)}
    function lantern(x,z,h,r,color){cyl(g,r*.7,r,h,stone,x,h/2+.12,z,12);cyl(g,r*1.28,r*1.28,.13,color,x,h+.18,z);cyl(g,r*.75,r*.75,.4,'#f3d683',x,h+.44,z);for(let i=0;i<6;i++){const a=i*Math.PI/3;box(g,.025,.42,.025,'#677d74',x+Math.cos(a)*r*.85,h+.44,z+Math.sin(a)*r*.85)}cyl(g,0,r*1.32,.45,color,x,h+.89,z,12);return h+1.12}
    if(['hut','cafe','bakery','bank'].includes(id)){
      const colors={hut:'#cf7558',cafe:'#8773ac',bakery:'#d9a151',bank:'#60988a'},color=l===7?gold:colors[id];
      const scale=[0,.64,.86,.86,.88,.9,.92,.94][l],raise=[0,0,0,.78,.95,1.38,1.56,1.75][l],body=source(scale,raise);
      if(l>=2){box(g,2.38,.16,2.1,'#c9b58e',0,.18,0);for(const x of [-1.04,1.04])plant(g,x,1.02)}
      if(l>=3){box(g,1.8,raise,1.5,stone,0,.12+raise/2,0);for(const x of [-.6,0,.6])windowFront(g,x,.12+raise*.5,.79,.36,.39);box(g,1.94,.13,1.63,color,0,raise+.11,0)}
      if(l>=4){pavilion(-1.02,.17,1.38,.68,color);pavilion(1.02,.17,1.38,.68,color);box(g,2.7,.13,.45,'#c5b18a',0,.17,1.12)}
      if(l>=5){pavilion(1.04,-.35,3.04,.63,color);clock(g,1.04,2.72,.0)}
      if(l>=6){pavilion(-1.04,-.35,3.47,.66,color);clock(g,-1.04,3.12,.02);box(g,2.5,.16,.39,'#c9b186',0,2.42,.7);for(let i=0;i<9;i++)box(g,.025,.28,.025,'#e7d9b7',-1.12+i*.28,2.6,.86);box(g,2.5,.04,.04,'#e7d9b7',0,2.76,.86)}
      if(l>=7){body.traverse(o=>{if(o.isMesh&&['db7558','8273ab','dba75b','64a995'].includes(o.material.color.getHexString()))o.material=material(gold)});const top=id==='hut'?4.02:id==='bank'?3.95:3.68;cyl(g,.3,.4,.55,'#ecdcb2',0,top+.1,-.2);cyl(g,0,.53,.8,gold,0,top+.76,-.2,8);ball(g,.11,gold,0,top+1.21,-.2);for(const x of [-1.04,1.04])flag(g,x,3.91,-.35,gold);box(g,2.64,.12,.12,gold,0,1.73,.98)}
    }else if(id==='farm'){
      const lift=l>=5?.7:0;source(l===1?.59:l===2?.83:.89,lift);
      if(l>=2)fence(g,1.18);
      if(l>=3){for(const z of [-.7,.64]){cyl(g,.31,.34,1.7,'#b9c5ad',1.17,.98,z);cyl(g,0,.39,.4,'#72958b',1.17,2.03,z)}}
      if(l>=4){cyl(g,.16,.27,1.1,stone,-.44,2.34+lift,.3,8);const rotor=new T.Group();rotor.position.set(-.44,3.02+lift,.54);for(let i=0;i<4;i++){const arm=new T.Group();box(arm,.22,.84,.07,'#f4dd99',0,.45,0);arm.rotation.z=i*Math.PI/2;rotor.add(arm)}g.add(rotor);ball(g,.13,'#92764b',-.44,3.02+lift,.6)}
      if(l>=5){box(g,1.68,.73,1.4,'#d0b17c',-.3,.48,0);for(const x of [-.81,-.3,.21])windowFront(g,x,.48,.74,.3,.34);torus(g,.39,.09,'#8f7852',-.68,.66,1.21)}
      if(l>=6){box(g,.84,.96,1.48,'#88beb5',-1.05,.62,.05);roof(g,.97,.35,1.64,'#a7d3c3',1.1,-1.05,.05);for(const z of [-.51,0,.51])box(g,.9,.055,.055,'#eee1b6',-1.05,.86,z);cyl(g,.4,.43,2.3,'#ddd2a9',1.2,1.3,-.78);cyl(g,0,.53,.6,'#74a28c',1.2,2.75,-.78)}
      if(l>=7){cyl(g,0,.55,.65,gold,1.2,3.06,-.78);for(const x of [-.82,-.52,-.22]){beam(g,[x,2.3,1.02],[x,3.02,1.02],.035,gold);ball(g,.14,gold,x,3.0,1.02)}flag(g,1.2,3.42,-.78);box(g,2.58,.12,.17,gold,0,1.63,.97)}
    }else if(id==='mine'){
      source(l===1?.6:l===2?.84:.96);
      if(l>=2){for(const x of [-1.07,1.07]){beam(g,[x,.12,.83],[x,1.48,.83],.05,'#777a63');ball(g,.15,'#efd08a',x,1.51,.83)}}
      if(l>=3){for(const x of [-.6,.6])beam(g,[x,.19,-.65],[x*.65,2.7,-.65],.09,'#9f825a');box(g,1.3,.23,.7,'#d0a65f',0,2.8,-.65);torus(g,.35,.07,'#617779',0,2.73,-.22);beam(g,[0,2.73,-.22],[0,.8,-.22],.025,'#5c6767')}
      if(l>=4){for(const x of [-1.22,1.22])box(g,.14,2.37,.17,'#819390',x,1.35,.27);box(g,2.83,.29,.35,'#dcaa5c',0,2.66,.27);box(g,.52,.28,.62,'#697f82',.78,2.94,.27);beam(g,[.8,2.54,.27],[.8,1.27,.27],.025,'#58636a');torus(g,.14,.04,'#58636a',.8,1.23,.27)}
      if(l>=5){box(g,.71,1.08,.83,'#b5a07d',-1.05,.71,-.38);for(const z of [-.62,-.2]){cyl(g,.12,.16,2.56,'#899286',-1.05,1.6,z);cyl(g,.19,.19,.12,'#bd9562',-1.05,2.92,z)}}
      if(l>=6){cyl(g,.2,.39,1.55,'#789da3',.12,3.54,-.65,8);for(const y of [3.04,3.35,3.67,3.99]){const r=torus(g,.37-(y-3)*.14,.06,'#b3c5be',.12,y,-.65);r.rotation.x=Math.PI/2}cyl(g,0,.2,.54,'#c3d5cb',.12,4.58,-.65,8)}
      if(l>=7){for(const x of [-.8,.92]){const crystal=cyl(g,0,.29,1.74,'#ac86d5',x,3.49,.1,6);crystal.rotation.z=-x*.18}const halo=torus(g,1.03,.075,gold,0,3.63,0);halo.rotation.x=Math.PI/2;for(const x of [-.72,0,.72])box(g,.24,.17,.2,gold,x,1.45,.92)}
    }else if(id==='tower'){
      if(l===1){cyl(g,.42,.61,1.32,'#bca57b',0,.82,0,8);lantern(0,0,1.46,.32,'#b97756')}
      else if(l===2){source(.91)}
      else{
        const h=l<5?2.64:3.13;for(let i=0;i<6;i++)cyl(g,.32-i*.02,.35-i*.02,h/6,i%2?'#db8269':'#f1e2be',0,.17+h/12+i*h/6,0,16);lantern(0,0,h+.19,.37,l===7?gold:'#bd715a');
        for(const y of [1.14,2.11]){cyl(g,.69,.69,.14,'#799991',0,y,0);const r=torus(g,.65,.035,stone,0,y+.35,0);r.rotation.x=Math.PI/2;for(let i=0;i<10;i++){const a=i*Math.PI/5;box(g,.025,.34,.025,stone,Math.cos(a)*.64,y+.19,Math.sin(a)*.64)}}
        if(l>=4)lantern(-.94,.14,l>=5?2.35:1.67,.24,'#76a49e');
        if(l>=5){box(g,1.22,.15,.45,'#b4ac88',-.52,2.52,.16);for(let i=0;i<6;i++)box(g,.025,.32,.025,stone,-1.03+i*.19,2.72,.39);box(g,1.22,.04,.04,stone,-.52,2.91,.39)}
        if(l>=6){lantern(.96,.16,2.84,.27,'#768dae');const globe=torus(g,.72,.04,'#d4c28f',0,3.85,0);globe.rotation.x=.7;const r=torus(g,.72,.04,'#90aeb3',0,3.85,0);r.rotation.y=.8}
        if(l>=7){for(let i=0;i<10;i++){const a=i*Math.PI/5;beam(g,[Math.cos(a)*.4,4.62,Math.sin(a)*.4],[Math.cos(a)*.94,4.94,Math.sin(a)*.94],.04,gold);ball(g,.09,gold,Math.cos(a)*.94,4.94,Math.sin(a)*.94)}cyl(g,0,.26,.75,gold,0,5.08,0,8)}
      }
    }
    for(let i=0;i<l;i++)box(g,.12,.11,.06,l===7?gold:'#cfb179',-.48+i*.16,.22,1.21);
    return g;
  }
  function create(id,level=1){if(!factories[id])throw new Error('Unknown model '+id);const stage=appearanceLevel(level),g=tierArchitecture(id,stage);g.name=id+'-lv'+stage;g.userData.buildingId=id;g.userData.appearanceLevel=stage;g.userData.appearanceName=stages[id][stage-1];g.traverse(obj=>{if(obj.isMesh)obj.userData.buildingId=id});return g}
  root.TownModels={create,appearanceLevel,stages,ids:Object.keys(factories),helpers:{box,cyl,ball,beam,material}};
})(globalThis);
