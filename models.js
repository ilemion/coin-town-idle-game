(function(root){
  'use strict';
  const T=root.THREE,materials=new Map();
  const designs={
    hut:{name:['小木屋','双户小院','花园联排屋','精品住区'],color:'#cf755f',ground:'#89b46b',sizes:[[2.7,2.5],[3.7,3.25],[4.75,4.05],[5.75,4.9]]},
    cafe:{name:['街角咖啡店','花园咖啡馆','玻璃茶屋','精致咖啡会馆'],color:'#8f79a8',ground:'#cdbba0',sizes:[[2.65,2.45],[3.05,2.85],[3.45,3.1],[3.85,3.45]]},
    farm:{name:['家庭农田','谷仓农场','温室农业园','金穗大农庄'],color:'#a95d4d',ground:'#83aa55',sizes:[[3.0,2.8],[5.0,4.1],[6.75,5.45],[8.5,6.75]]},
    mine:{name:['露天矿坑','轨道矿场','钢铁采掘站','重型冶炼基地'],color:'#52616a',ground:'#777a73',sizes:[[3.0,2.7],[4.75,3.75],[6.25,4.95],[7.9,6.15]]},
    bakery:{name:['街角面包屋','双炉工房','精品烘焙坊','大师面包坊'],color:'#d18d58',ground:'#d1b48a',sizes:[[2.7,2.5],[3.5,3.05],[4.45,3.75],[5.5,4.55]]},
    bank:{name:['社区金库','石柱银行','翡翠金融馆','中央金库广场'],color:'#4f978b',ground:'#b9c1ad',sizes:[[2.75,2.5],[3.65,3.05],[4.75,3.9],[5.75,4.85]]},
    tower:{name:['海岸信标','港口灯塔','航海观测站','双港航标区'],color:'#d57766',ground:'#87b5b7',sizes:[[2.8,2.6],[3.8,3.3],[5.0,4.3],[6.45,5.55]]}
  };
  const ids=Object.keys(designs),stages=Object.fromEntries(ids.map(id=>[id,designs[id].name]));
  function material(color){if(!materials.has(color))materials.set(color,new T.MeshStandardMaterial({color,roughness:.92,metalness:0,flatShading:true}));return materials.get(color)}
  function mesh(group,geometry,color,x=0,y=0,z=0){const m=new T.Mesh(geometry,material(color));m.position.set(x,y,z);m.castShadow=true;m.receiveShadow=true;group.add(m);return m}
  function box(group,w,h,d,color,x=0,y=h/2,z=0){return mesh(group,new T.BoxGeometry(w,h,d),color,x,y,z)}
  function cyl(group,top,bottom,height,color,x=0,y=height/2,z=0,sides=10){return mesh(group,new T.CylinderGeometry(top,bottom,height,sides),color,x,y,z)}
  function ball(group,r,color,x=0,y=r,z=0,detail=0){return mesh(group,new T.IcosahedronGeometry(r,detail),color,x,y,z)}
  function torus(group,r,t,color,x=0,y=0,z=0,seg=6,rad=12){return mesh(group,new T.TorusGeometry(r,t,seg,rad),color,x,y,z)}
  function beam(group,start,end,r,color){const a=new T.Vector3(...start),b=new T.Vector3(...end),m=cyl(group,r,r,a.distanceTo(b),color);m.position.copy(a.clone().add(b).multiplyScalar(.5));m.quaternion.setFromUnitVectors(new T.Vector3(0,1,0),b.sub(a).normalize());return m}
  function roof(group,w,h,d,color,y,x=0,z=0){const shape=new T.Shape();shape.moveTo(-w/2,0);shape.lineTo(w/2,0);shape.lineTo(0,h);shape.closePath();const geo=new T.ExtrudeGeometry(shape,{depth:d,bevelEnabled:false});geo.translate(0,0,-d/2);return mesh(group,geo,color,x,y,z)}
  function flag(group,x,y,z,color){cyl(group,.022,.022,.58,'#5a5144',x,y+.29,z,6);box(group,.31,.18,.03,color,x+.155,y+.46,z)}
  function patch(group,x,z,w,d,color){box(group,w,.025,d,color,x,.15,z)}
  function entry(group,x,z,w,color){box(group,w,.11,.28,color,x,.19,z);box(group,w*.66,.09,.28,'#eee2c9',x,.29,z+.13)}
  function window(group,x,y,z,w=.3,h=.37,tint='#a5d6d3'){box(group,w+.09,h+.1,.07,'#685d50',x,y,z);box(group,w,h,.085,tint,x,y,z+.045);box(group,.035,h,.09,'#f8edce',x,y,z+.055)}
  function door(group,x,z,y=.62,w=.43,h=.91,color='#755842'){box(group,w,h,.09,color,x,y,z);box(group,w+.13,.08,.16,'#e8d8b0',x,y+h/2+.06,z);ball(group,.033,'#ead58b',x+w*.3,y,z+.06)}
  function shell(group,x,z,w,d,h,wall,roofColor,roofHeight=.55){box(group,w,h,d,wall,x,.15+h/2,z);roof(group,w+.24,roofHeight,d+.25,roofColor,.15+h,x,z)}
  function flower(group,x,z,color){box(group,.31,.18,.27,'#a67955',x,.24,z);ball(group,.16,'#639957',x,.42,z);ball(group,.06,color,x,.53,z)}
  function fence(group,x,z,w,d,color='#b18c64'){for(const side of [-1,1]){for(let i=0;i<5;i++)box(group,.055,.38,.055,color,x-w/2+i*w/4,.34,z+side*d/2);box(group,w,.05,.05,color,x,.42,z+side*d/2)}}
  function lamp(group,x,z,color='#f6d88a'){cyl(group,.043,.055,.65,'#52605d',x,.48,z,7);box(group,.21,.17,.21,color,x,.87,z);box(group,.24,.05,.24,'#52605d',x,.97,z)}
  function tree(group,x,z,r=.33){cyl(group,.09,.12,.48,'#85694d',x,.43,z,7);ball(group,r,'#5b995e',x,.92,z,1);ball(group,r*.65,'#9bc574',x-.12,1.12,z,0)}
  function plaque(group,x,y,z,color){box(group,.76,.28,.07,color,x,y,z);box(group,.57,.055,.08,'#f2e3bf',x,y,z+.05)}
  function crop(group,x,z,kind=0){box(group,.18,.08,.18,'#70573d',x,.18,z);beam(group,[x,.21,z],[x,.52,z],.018,'#5d924c');ball(group,.09,kind?'#ecc65a':'#7eb75e',x,.55,z)}
  function track(group,x,z,length){for(const offset of [-.22,.22])box(group,.055,.045,length,'#4d5c61',x+offset,.2,z);for(let q=-length/2+.14;q<length/2;q+=.24)box(group,.68,.05,.075,'#745a49',x,.18,z+q)}
  function cart(group,x,z,color='#876e53'){box(group,.66,.34,.5,color,x,.42,z);box(group,.7,.07,.55,'#485860',x,.6,z);for(const dx of [-.23,.23])for(const dz of [-.2,.2]){const w=cyl(group,.1,.1,.06,'#2e3d42',x+dx,.28,z+dz,8);w.rotation.z=Math.PI/2}}
  function crane(group,x,z,height,span){for(const dx of [-span/2,span/2]){beam(group,[x+dx,.16,z],[x+dx*.76,height,z],.06,'#68777b');beam(group,[x+dx*.76,height,z],[x+dx*.7,.16,z],.025,'#899194')}box(group,span+.15,.14,.22,'#a0764c',x,height,z);beam(group,[x,height,z],[x,height-.8,z],.025,'#445761');cyl(group,.13,.18,.16,'#48565c',x,height-.88,z,8)}
  function chimney(group,x,z,height,color){box(group,.3,height,.3,color,x,.16+height/2,z);box(group,.4,.1,.4,'#75594e',x,.2+height,z);ball(group,.18,'#b9bcb8',x,.46+height,z)}
  function glazed(group,x,z,w,d,h){box(group,w,h,d,'#a6ccbe',x,.15+h/2,z);roof(group,w+.15,.45,d+.13,'#cae9df',.15+h,x,z);for(let i=0;i<4;i++)box(group,.04,h,.04,'#f2edda',x-w/2+w*i/3,.15+h/2,z+d/2+.04)}
  function terrace(group,x,z,w,d,color){patch(group,x,z,w,d,color);for(const dx of [-w*.28,w*.28]){cyl(group,.31,.31,.06,'#926e52',x+dx,.42,z,10);cyl(group,.045,.045,.48,'#665a4d',x+dx,.31,z,8);cyl(group,.44,.04,.09,'#f2e4cb',x+dx,.75,z,10)}}
  function plot(group,id,tier){const design=designs[id],[w,d]=design.sizes[tier-1];box(group,w,.14,d,design.ground,0,.07,0);box(group,w-.12,.025,d-.12,tier===1?design.ground:({hut:'#a9c87b',cafe:'#e1d2b5',farm:'#91b85b',mine:'#727a78',bakery:'#e6cb9f',bank:'#cad2bc',tower:'#9ac8c6'}[id]),0,.15,0);for(let i=-w/2+.28;i<w/2-.1;i+=.7)box(group,.06,.018,.06,'#f3e8bd',i,.17,d/2-.16);group.userData.footprint={width:w,depth:d}}
  function hut(group,t){
    if(t===1){
      shell(group,-.13,-.18,1.75,1.42,1.14,'#f0c889','#d4715d',.66);door(group,-.13,.59);window(group,-.72,.85,.57);window(group,.48,.85,.57);chimney(group,.46,-.55,.5,'#835b43');entry(group,-.13,.88,.86,'#cdb98d');flower(group,-1.0,.75,'#ef8f96');
      return;
    }
    // From the second stage onward there are exactly two homes. Later stages renovate them.
    const premium=t===4,renovated=t>=3,xOffset=premium?1.37:renovated?1.12:.85;
    const homeW=premium?1.75:renovated?1.48:1.22,homeD=premium?1.75:renovated?1.58:1.42;
    const homeH=premium?1.75:renovated?1.45:1.05,homeZ=premium?-.68:renovated?-.48:-.32;
    const wall=premium?'#f5e5cb':renovated?'#f5e8d2':'#dfaa78';
    const roofColor=premium?'#805a56':renovated?'#b75d51':'#c47760';
    for(const x of [-xOffset,xOffset]){
      shell(group,x,homeZ,homeW,homeD,homeH,wall,roofColor,premium?.77:renovated?.65:.5);
      const front=homeZ+homeD/2+.055;
      door(group,x,front,premium?.76:.61,premium?.44:.38,premium?1.12:.84,premium?'#66534b':'#7d5947');
      window(group,x-homeW*.32,premium?1.18:.82,front,.27,premium?.48:.34,premium?'#b6ddd6':'#a8d1cf');
      window(group,x+homeW*.32,premium?1.18:.82,front,.27,premium?.48:.34,premium?'#b6ddd6':'#a8d1cf');
      entry(group,x,front+.3,homeW*.63,premium?'#c6bba3':'#cdb98d');
      chimney(group,x+homeW*.32,homeZ-homeD*.24,premium?.8:renovated?.62:.42,premium?'#9a776d':'#9c715f');
      if(renovated){box(group,homeW+.12,.12,homeD+.1,premium?'#9b8878':'#c09875',x,.28,homeZ);box(group,homeW*.53,.08,.27,premium?'#ece4d3':'#e8cfae',x,homeH+.22,front+.01)}
      if(renovated&&!premium){box(group,homeW*.75,.1,.42,'#bd8069',x,1.12,front+.2);for(const dx of [-.42,.42])box(group,.09,.7,.1,'#f9e6c8',x+dx,.69,front+.3);for(const dx of [-homeW*.32,homeW*.32])box(group,.35,.1,.19,'#789a72',x+dx,.53,front+.13)}
      if(premium){for(const dx of [-.42,.42])box(group,.12,.85,.14,'#e6d5bc',x+dx,.68,front+.2);box(group,homeW*.68,.12,.42,'#e9d9bd',x,1.17,front+.23);window(group,x,1.47,front,.31,.29,'#c8e5df')}
    }
    patch(group,0,renovated?1.2:.92,premium?2.45:renovated?1.9:1.3,premium?1.08:.65,premium?'#d9c9ad':renovated?'#d8c39e':'#c9b58c');
    fence(group,0,0,premium?5.35:renovated?4.35:3.35,premium?4.4:renovated?3.6:2.8,premium?'#e6dcc5':'#b18c64');
    for(const x of [-xOffset,xOffset])flower(group,x,renovated?1.5:1.1,premium?'#dd9298':'#f1a08d');
    if(renovated){for(const x of [-1.9,1.9]){tree(group,x,premium?1.35:1.15,premium?.31:.26);lamp(group,x,premium?1.67:1.43)}}
    if(premium){for(const x of [-.65,0,.65])ball(group,.17,'#719d6c',x,.34,1.82);box(group,.72,.2,.72,'#b7ab96',0,.27,1.24);cyl(group,.25,.32,.17,'#d7e3d9',0,.48,1.24,10);ball(group,.15,'#9dc6c6',0,.68,1.24)}
  }
  function cafe(group,t){
    const purple='#8270a4',cream='#f5e7cc',rose='#c78da4';
    shell(group,0,-.25,1.75,1.35,1.12,cream,purple,.24);box(group,1.9,.14,1.55,purple,0,1.36,-.25);door(group,0,.48,.58,.37,.79,'#745d55');window(group,-.58,.78,.47,.35,.5,'#a7d7d8');window(group,.58,.78,.47,.35,.5,'#a7d7d8');plaque(group,0,1.22,.57,rose);terrace(group,.5,.96,.95,.62,'#d5b79c');flower(group,-1.05,.85,'#ecb9bd');
    if(t>=2){box(group,2.45,1.02,.9,cream,0,.66,-.95);box(group,2.55,.11,1.0,rose,0,1.22,-.95);for(const x of [-.88,0,.88])window(group,x,.76,-.46,.3,.39);for(const x of [-.83,.83])flower(group,x,1.21,'#f0b3c7');plaque(group,0,1.45,.63,purple)}
    if(t>=3){glazed(group,0,-1.0,2.24,1.12,1.35);box(group,1.98,.16,1.12,purple,0,1.69,-1.0);for(const x of [-.85,.85]){cyl(group,.12,.16,.62,cream,x,1.96,-.92,8);ball(group,.15,rose,x,2.32,-.92)}terrace(group,.57,1.12,1.45,.74,'#e7d4b7');for(const x of [-1.35,1.35])lamp(group,x,.96,'#ffe9ae')}
    if(t>=4){glazed(group,0,-1.05,2.45,1.27,1.62);cyl(group,.78,.78,.2,purple,0,1.97,-.85,12);cyl(group,0,.7,.5,rose,0,2.28,-.85,12);for(const x of [-1.45,1.45]){box(group,.28,.72,.3,cream,x,.52,-.16);ball(group,.18,purple,x,.97,-.16)}for(const x of [-1.1,-.55,0,.55,1.1])box(group,.14,.07,.5,x%1.1?'#f5e9ce':rose,x,1.49,.76);plaque(group,0,1.54,.91,purple);flower(group,-1.63,1.33,'#f4c2ce');flower(group,1.63,1.33,'#f4c2ce')}
  }
  function farm(group,t){
    const barn='#b45e4d',roofRed='#76533e';
    shell(group,-.67,-.42,1.45,1.4,1.18,barn,roofRed,.72);door(group,-.67,.31,.61,.62,.84,'#744b3a');for(const x of [.4,.85,1.3])for(const z of [.6,1.0])crop(group,x,z,1);fence(group,.25,.12,2.65,2.45);
    if(t>=2){shell(group,-1.25,-.77,1.65,1.72,1.53,barn,'#66513f',.78);cyl(group,.43,.48,1.38,'#d6c39b',1.45,.86,-.85,12);cyl(group,0,.5,.4,'#718c75',1.45,1.76,-.85,10);for(let x=-1.9;x<2.0;x+=.42)for(let z=.7;z<1.72;z+=.4)crop(group,x,z,(Math.floor(x*3)&1));fence(group,0,0,4.65,3.85);cart(group,1.4,.16,'#a97a4a')}
    if(t>=3){for(const x of [-1.65,.2,1.65])glazed(group,x,-1.33,1.12,1.35,1.05);for(let x=-2.9;x<3;x+=.38)for(let z=.45;z<2.25;z+=.42)crop(group,x,z,(Math.floor(x*4)&1));cyl(group,.54,.58,2.1,'#d9cb9f',2.65,1.24,-1.55,12);cyl(group,0,.61,.43,'#728e76',2.65,2.52,-1.55,10);shell(group,-2.4,-1.3,1.45,1.35,1.3,'#a85e4b','#715644',.6);fence(group,0,0,6.35,5.15)}
    if(t>=4){for(const x of [-3.5,-2.7,2.7,3.5])for(const z of [-2.4,-1.5,-.6,.35,1.25,2.2])crop(group,x,z,(Math.floor(z*3)&1));for(const x of [-1.55,.25,1.9])glazed(group,x,-2.12,1.3,1.6,1.32);for(const x of [-2.35,2.35]){cyl(group,.49,.53,2.5,'#d7c9a1',x,1.48,-1.85,12);cyl(group,0,.58,.45,'#779074',x,2.94,-1.85,10)}shell(group,0,.83,2.12,1.55,1.42,barn,roofRed,.75);box(group,1.5,.7,.82,'#c59663',0,.52,2.62);fence(group,0,0,8.15,6.4)}
  }
  function mine(group,t){
    const steel='#53636b',stone='#737d7f',rust='#a0664e';
    for(const [x,z,r] of [[-.68,-.42,.58],[.42,-.6,.65],[.86,.14,.47]])ball(group,r,stone,x,.28+r*.55,z);box(group,.98,.9,.12,'#2f3b40',-.15,.62,.32);roof(group,1.23,.55,.6,steel,1.05,-.15,.34);track(group,-.15,.68,1.35);cart(group,-.15,.75);lamp(group,-1.12,.82,'#e5c780');
    if(t>=2){patch(group,0,0,4.5,3.5,'#696f70');for(const x of [-1.55,1.48])ball(group,.6,'#647175',x,.55,-.85);track(group,-.85,.2,3.2);track(group,.62,.2,3.2);cart(group,.62,.8,steel);crane(group,1.45,-.92,2.55,1.7);box(group,1.23,.8,.8,'#4a5960',-1.38,.57,-1.05);chimney(group,-1.45,-1.08,1.35,rust)}
    if(t>=3){patch(group,0,0,5.95,4.7,'#5d6569');for(const x of [-2.3,2.22]){box(group,1.4,1.12,1.15,steel,x,.74,-1.18);box(group,1.5,.15,1.27,'#414f55',x,1.37,-1.18);chimney(group,x,-1.25,2.4,'#785e54')}crane(group,0,-1.4,3.6,3.8);track(group,-1.35,.25,4.0);track(group,1.15,.25,4.0);for(const x of [-2.15,1.75])cart(group,x,1.3,rust);for(const [x,z] of [[-2.55,.5],[2.5,.5],[-2.5,1.72],[2.48,1.7]])ball(group,.39,'#818d8e',x,.43,z)}
    if(t>=4){patch(group,0,0,7.55,5.9,'#535b60');for(const x of [-3.18,-1.85,1.85,3.18]){box(group,1.1,1.6,1.22,steel,x,.98,-1.8);box(group,1.22,.16,1.32,'#3c4a51',x,1.83,-1.8);chimney(group,x,-1.75,2.8,'#75584d')}crane(group,-1.55,-1.1,4.2,2.7);crane(group,1.65,-1.1,4.5,3.0);for(const x of [-2.5,0,2.5]){track(group,x,.65,4.5);cart(group,x,1.58,steel)}box(group,5.2,.38,.73,'#454f53',0,.42,2.35);for(const x of [-2.45,-1.2,0,1.2,2.45])ball(group,.3,'#8e9694',x,.72,2.34);for(const x of [-3.65,3.65])lamp(group,x,2.55,'#d8c28e')}
  }
  function bakery(group,t){
    const cream='#efd0a5',orange='#c8774f';
    if(t===1){
      shell(group,-.32,-.35,1.55,1.35,1.16,cream,orange,.58);door(group,-.42,.34,.58,.39);window(group,.26,.8,.34,.32,.4,'#f3daab');cyl(group,.38,.43,.62,'#bd8058',.82,.49,-.15,10);ball(group,.37,orange,.82,.86,-.15);chimney(group,.9,-.42,.62,'#9b7156');for(const x of [-.7,-.25,.22])ball(group,.11,'#e6b767',x,.39,1.03);
      return;
    }
    // The second stage adds a second oven. The same pair gains better finishes and equipment.
    const premium=t===4,refined=t>=3,storeW=premium?3.05:refined?2.38:1.35;
    const storeH=premium?1.9:refined?1.53:1.18,storeZ=premium?-1.0:refined?-.8:-.66;
    const ovenX=premium?1.98:refined?1.52:1.05,ovenZ=premium?-.76:refined?-.55:-.55;
    shell(group,0,storeZ,storeW,premium?1.75:refined?1.58:1.36,storeH,premium?'#f7e2be':refined?'#f3d8ac':cream,premium?'#a95c48':refined?'#bb704e':orange,premium?.55:.5);
    const front=storeZ+(premium?1.75:refined?1.58:1.36)/2+.06;
    door(group,0,front,premium?.74:.61,premium?.5:.42,premium?1.05:.86,premium?'#704f42':'#805e4b');
    for(const x of [-storeW*.32,storeW*.32])window(group,x,refined?1.05:.82,front,refined?.4:.27,refined?.65:.38,refined?'#b9d8d2':'#e5c796');
    if(refined){box(group,storeW+.22,.15,.42,premium?'#e6c49b':'#d9a37b',0,1.43,front+.2);for(const x of [-storeW*.38,storeW*.38])box(group,.09,.7,.12,'#f9e7cc',x,.85,front+.12);plaque(group,0,storeH+.06,front+.26,premium?'#844f42':'#a46047')}
    if(premium){box(group,storeW+.26,.12,1.92,'#e9cfa6',0,.3,storeZ);for(const x of [-1.2,-.6,0,.6,1.2])box(group,.055,.19,.16,'#f5dfb7',x,1.47,front+.35);for(const x of [-1.05,1.05])window(group,x,1.52,front,.31,.28,'#c1dfd7');box(group,.72,.47,.32,'#f7e5c9',0,2.15,storeZ+.46);roof(group,.84,.34,.43,'#8e4e40',2.37,0,storeZ+.46);window(group,0,2.18,storeZ+.67,.33,.29,'#aed3ca')}
    for(const x of [-ovenX,ovenX]){
      const radius=premium?.48:refined?.42:.34;
      cyl(group,radius,radius+.04,refined?.8:.68,premium?'#d1ad80':refined?'#c99e72':'#b88762',x,refined?.55:.49,ovenZ,10);
      ball(group,radius,premium?'#8e6151':refined?'#ac7558':orange,x,refined?1.03:.86,ovenZ);
      box(group,.32,.25,.12,'#4e4740',x,.55,ovenZ+radius+.04);
      chimney(group,x,ovenZ-.18,premium?1.35:refined?1.05:.68,premium?'#8d6659':'#a87b5e');
      if(refined){for(const dx of [-.23,.23])beam(group,[x+dx,.85,ovenZ+.29],[x+dx*.6,1.15,ovenZ],.026,premium?'#e5d3bb':'#dfba91')}
    }
    patch(group,0,premium?1.34:refined?1.1:.95,premium?4.3:refined?3.3:2.7,premium?1.2:.75,premium?'#e4d2b3':refined?'#dcb98d':'#cfa77e');
    // One continuous sales counter replaces the growing row of small stalls.
    box(group,premium?3.55:refined?2.6:1.9,.45,.48,premium?'#b98761':'#ae7e58',0,.44,premium?1.28:refined?1.1:.96);
    for(const x of [-.48,0,.48])ball(group,premium?.17:.13,'#f0ca83',x,.76,premium?1.32:refined?1.14:1.0);
    if(refined){for(const x of [-1.9,1.9]){lamp(group,x,premium?1.72:1.4,'#fce1a5');flower(group,x*.83,premium?1.83:1.5,'#e9a28a')}}
    if(premium){for(const x of [-2.35,2.35])tree(group,x,-.35,.25);box(group,3.9,.09,.18,'#eee0c5',0,.23,1.92)}
  }
  function bank(group,t){
    const teal='#4e978c',stone='#e0dfc9',dark='#58736e';
    box(group,1.82,1.14,1.35,stone,0,.72,-.25);roof(group,2.08,.48,1.6,teal,1.29,0,-.25);door(group,0,.46,.58,.5,.8,dark);for(const x of [-.7,.7])window(group,x,.84,.44,.28,.38,'#9ecbc4');entry(group,0,.97,1.16,'#b9bca5');
    if(t>=2){box(group,2.85,1.45,1.82,stone,0,.87,-.34);roof(group,3.02,.6,2.0,teal,1.59,0,-.34);for(const x of [-.95,-.35,.35,.95]){cyl(group,.055,.07,1.07,'#f4ead6',x,.78,.7,9);box(group,.18,.08,.2,'#aec1b4',x,1.34,.7)}box(group,2.8,.14,.65,'#bdc9b5',0,.21,1.17);for(const x of [-1.3,1.3])tree(group,x,1.03,.23)}
    if(t>=3){box(group,3.15,1.95,2.25,stone,0,1.12,-.55);roof(group,3.38,.6,2.43,'#387d78',2.1,0,-.55);for(const x of [-1.62,1.62]){box(group,.92,1.2,1.55,'#d0d9ca',x,.77,-.2);roof(group,1.0,.36,1.65,teal,1.38,x,-.2);door(group,x,.63,.58,.32)}for(const x of [-1.14,-.38,.38,1.14])window(group,x,1.5,.6,.32,.4,'#9ac9c5');box(group,3.9,.13,.74,'#b4c9bb',0,.22,1.47);plaque(group,0,1.92,.64,teal)}
    if(t>=4){for(const x of [-2.05,2.05]){box(group,1.1,1.8,1.75,stone,x,1.05,-.8);roof(group,1.25,.48,1.92,teal,1.97,x,-.8);for(const y of [.65,1.38])window(group,x,y,.1,.33,.36,'#9acac8')}box(group,3.2,2.2,2.3,'#e6e5d0',0,1.25,-.8);roof(group,3.4,.66,2.48,dark,2.36,0,-.8);for(const x of [-1.25,-.42,.42,1.25])cyl(group,.075,.085,1.32,'#f0eee1',x,.88,.68,10);box(group,4.6,.18,1.18,'#a9bfb3',0,.25,1.36);cyl(group,.34,.4,.25,teal,0,.5,1.47,12);ball(group,.16,'#e7c879',0,.76,1.47);for(const x of [-2.5,2.5])lamp(group,x,1.7,'#edf3ce')}
  }
  function tower(group,t){
    const coral='#d67865',white='#efe8d6',sea='#567f89';
    cyl(group,.44,.67,1.62,white,0,.95,-.15,12);for(const y of [.55,1.25])cyl(group,.52,.52,.18,coral,0,y,-.15,12);cyl(group,.55,.55,.14,sea,0,1.86,-.15,12);cyl(group,.28,.28,.48,'#f0d590',0,2.17,-.15,10);cyl(group,0,.52,.52,coral,0,2.64,-.15,12);box(group,.8,.1,.48,'#8a7355',0,.2,1.0);
    if(t>=2){box(group,2.75,.14,.85,'#927b5a',0,.2,1.08);for(const x of [-1.12,1.12]){box(group,.76,.77,.65,white,x,.57,.65);roof(group,.85,.42,.76,coral,.96,x,.65);door(group,x,1.02,.52,.28)}for(const x of [-1.35,1.35])cyl(group,.17,.19,.28,coral,x,.29,1.47,10);cyl(group,.4,.51,1.5,white,0,1.0,-.15,12)}
    if(t>=3){cyl(group,.44,.72,3.35,white,0,1.83,-.65,12);for(const y of [.65,1.45,2.35,3.18])cyl(group,.51,.51,.2,coral,0,y,-.65,12);cyl(group,.7,.7,.14,sea,0,3.55,-.65,12);cyl(group,.32,.32,.48,'#f4d892',0,3.88,-.65,10);cyl(group,0,.56,.46,coral,0,4.3,-.65,12);for(const x of [-1.8,1.8]){box(group,1.08,.98,1.0,white,x,.67,-.7);roof(group,1.22,.48,1.12,sea,1.18,x,-.7)}box(group,4.15,.16,.82,'#8b7759',0,.2,1.57);for(const x of [-1.9,1.9])lamp(group,x,1.65,'#f2deaa')}
    if(t>=4){for(const x of [-2.35,2.35]){cyl(group,.32,.46,2.4,white,x,1.37,-1.25,12);for(const y of [.7,1.55,2.32])cyl(group,.38,.38,.16,coral,x,y,-1.25,12);cyl(group,.42,.42,.12,sea,x,2.63,-1.25,12);cyl(group,0,.41,.4,coral,x,2.9,-1.25,12)}box(group,5.8,.19,1.1,'#8e7957',0,.23,1.82);for(const x of [-2.72,-1.85,1.85,2.72]){box(group,.07,.52,.07,'#e3d4b4',x,.48,2.15);box(group,.25,.08,.13,sea,x,.77,2.15)}for(const x of [-1.2,1.2]){box(group,.62,.31,.35,'#638c91',x,.34,2.16);cyl(group,.19,.23,.18,coral,x,.59,2.16,10)}flag(group,-2.87,.9,1.55,coral);flag(group,2.87,.9,1.55,sea)}
  }
  const builders={hut,cafe,farm,mine,bakery,bank,tower};
  function appearanceLevel(level){const n=Math.max(1,Math.floor(Number(level)||1));return n<=2?1:n<=5?2:n<=7?3:4}
  function representativeLevel(tier){return [1,3,6,8][Math.max(1,Math.min(4,Math.floor(Number(tier)||1)))-1]}
  function footprint(id,level){const tier=appearanceLevel(level),size=designs[id]?.sizes[tier-1];return size?{width:size[0],depth:size[1]}:null}
  function merge(group,id){group.updateMatrixWorld(true);const buckets=new Map();group.traverse(object=>{if(!object.isMesh)return;const color=object.material.color.getHexString();let items=buckets.get(color);if(!items)buckets.set(color,items=[]);let geometry=object.geometry.clone().applyMatrix4(object.matrixWorld);if(geometry.index)geometry=geometry.toNonIndexed();items.push(geometry.attributes.position.array);geometry.dispose()});const result=new T.Group();for(const [color,parts] of buckets){let length=0;for(const p of parts)length+=p.length;const raw=new Float32Array(length);let offset=0;for(const p of parts){raw.set(p,offset);offset+=p.length}const geo=new T.BufferGeometry();geo.setAttribute('position',new T.Float32BufferAttribute(raw,3));geo.computeVertexNormals();const m=new T.Mesh(geo,material('#'+color));m.castShadow=true;m.receiveShadow=true;m.userData.buildingId=id;result.add(m)}group.traverse(object=>{if(object.isMesh)object.geometry.dispose()});return result}
  function create(id,level=1){if(!builders[id])throw new Error('Unknown model '+id);const tier=appearanceLevel(level),group=new T.Group();plot(group,id,tier);builders[id](group,tier);const result=merge(group,id);result.name=id+'-tier'+tier;result.userData.buildingId=id;result.userData.appearanceLevel=tier;result.userData.appearanceName=stages[id][tier-1];result.userData.footprint=footprint(id,level);return result}
  root.TownModels={create,appearanceLevel,representativeLevel,footprint,stages,ids,designs,helpers:{box,cyl,ball,beam,torus,flag,material}};
})(globalThis);
