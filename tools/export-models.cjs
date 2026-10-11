const fs=require('fs'),path=require('path');
global.THREE=require('../vendor/three.min.js');require('../models.js');
const out=path.resolve(__dirname,'../models');fs.mkdirSync(out,{recursive:true});
for(const file of fs.readdirSync(out))if(/-lv[1-9][0-9]*\.(obj|mtl)$/.test(file))fs.unlinkSync(path.join(out,file));
const metadata=[];
for(const id of TownModels.ids)for(let stage=1;stage<=4;stage++){
  const asset=id+'-lv'+stage,group=TownModels.create(id,TownModels.representativeLevel(stage));group.updateMatrixWorld(true);
  let obj='# Coin Town original 3D model\nmtllib '+asset+'.mtl\n',mtl='',offset=1,part=0;const materials=new Map();
  group.traverse(mesh=>{if(!mesh.isMesh)return;const geo=mesh.geometry.clone().applyMatrix4(mesh.matrixWorld);if(!geo.attributes.normal)geo.computeVertexNormals();const p=geo.attributes.position,n=geo.attributes.normal,c=mesh.material.color;const key=c.getHexString();if(!materials.has(key)){const name='material_'+materials.size;materials.set(key,name);const srgb=c.clone().convertLinearToSRGB();mtl+='newmtl '+name+'\nKd '+[srgb.r,srgb.g,srgb.b].map(v=>v.toFixed(5)).join(' ')+'\nKa 0.2 0.2 0.2\nKs 0.04 0.04 0.04\nNs 10\n\n'}obj+='g '+id+'_'+part+++'\nusemtl '+materials.get(key)+'\n';for(let i=0;i<p.count;i++){const values=[p.getX(i),p.getY(i),p.getZ(i),n.getX(i),n.getY(i),n.getZ(i)];if(values.some(v=>!Number.isFinite(v)))throw new Error('Non-finite vertex '+id);obj+='v '+values.slice(0,3).map(v=>v.toFixed(6)).join(' ')+'\n';}for(let i=0;i<n.count;i++)obj+='vn '+[n.getX(i),n.getY(i),n.getZ(i)].map(v=>v.toFixed(6)).join(' ')+'\n';const indices=geo.index?Array.from(geo.index.array):Array.from({length:p.count},(_,i)=>i);for(let i=0;i<indices.length;i+=3)obj+='f '+indices.slice(i,i+3).map(v=>(v+offset)+'//'+(v+offset)).join(' ')+'\n';offset+=p.count;geo.dispose()});
  const bounds=new THREE.Box3().setFromObject(group),size=bounds.getSize(new THREE.Vector3());
  fs.writeFileSync(path.join(out,asset+'.obj'),obj);fs.writeFileSync(path.join(out,asset+'.mtl'),mtl);metadata.push({id,stage,levelRange:['1–2','3–5','6–7','8+'][stage-1],name:TownModels.stages[id][stage-1],file:asset+'.obj',footprint:TownModels.footprint(id,TownModels.representativeLevel(stage)),meshes:part,vertices:offset-1,size:size.toArray()});
  if(stage===1){fs.writeFileSync(path.join(out,id+'.obj'),obj);fs.writeFileSync(path.join(out,id+'.mtl'),mtl)}
}
fs.writeFileSync(path.join(out,'manifest.json'),JSON.stringify(metadata,null,2));console.log(JSON.stringify(metadata,null,2));
