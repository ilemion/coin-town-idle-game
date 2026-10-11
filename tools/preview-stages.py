from pathlib import Path
import json
import numpy as np
from PIL import Image,ImageDraw,ImageFont
root=Path(__file__).resolve().parents[1]
data=json.loads((root/'models/manifest.json').read_text(encoding='utf-8'))
font=lambda n:ImageFont.truetype('C:/Windows/Fonts/msyh.ttc',n)
image=Image.new('RGB',(1880,2430),'#f4f1e7');draw=ImageDraw.Draw(image)
draw.text((30,22),'金币小镇 · 28 个建筑外观',font=font(36),fill='#435c4c')
draw.text((32,76),'每行对应一种建筑：阶段1（Lv.1–2）、阶段2（Lv.3–5）、阶段3（Lv.6–7）、阶段4（Lv.8+）。',font=font(19),fill='#87947f')
eye=np.array([5.,4.,6.]);eye/=np.linalg.norm(eye)
right=np.cross([0.,1.,0.],eye);right/=np.linalg.norm(right)
up=np.cross(eye,right);light=np.array([-3.,6.,5.]);light/=np.linalg.norm(light)
for i,item in enumerate(data):
    x=20+(i%4)*460;y=118+(i//4)*327
    draw.rounded_rectangle((x,y,x+440,y+311),radius=12,fill='#fcfaf3',outline='#dfdfd0',width=1)
    draw.text((x+14,y+12),f"阶段{item['stage']}  {item['name']}",font=font(17),fill='#516950')
    mats={};current=None
    stem=Path(item['file']).stem
    for line in (root/'models'/f'{stem}.mtl').read_text().splitlines():
        if line.startswith('newmtl '):current=line.split()[1]
        elif line.startswith('Kd '):mats[current]=np.array([float(v) for v in line.split()[1:]])
    vertices=[];faces=[];mat=None
    for line in (root/'models'/item['file']).read_text().splitlines():
        if line.startswith('v '):vertices.append([float(v) for v in line.split()[1:]])
        elif line.startswith('usemtl '):mat=line.split()[1]
        elif line.startswith('f '):faces.append(([int(v.split('/')[0])-1 for v in line.split()[1:]],mat))
    vertices=np.array(vertices);projected=np.stack([vertices@right,-vertices@up],axis=1);span=np.maximum(projected.max(axis=0)-projected.min(axis=0),.001);scale=min(385/span[0],225/span[1]);center=(projected.max(axis=0)+projected.min(axis=0))/2;points=(projected-center)*scale+np.array([x+220,y+180]);depth=vertices@eye
    draw.ellipse((x+105,y+242,x+335,y+282),fill='#e0e4d5')
    for indices,mat in sorted(faces,key=lambda f:float(np.mean(depth[f[0]]))):
        v=vertices[indices];normal=np.cross(v[1]-v[0],v[2]-v[0]);length=np.linalg.norm(normal)
        if length<1e-9:continue
        normal/=length
        if normal@eye<0:continue
        color=tuple(np.clip(mats[mat]*(.59+.41*max(0.,float(normal@light)))*255,0,255).astype(int))
        draw.polygon([tuple(p) for p in points[indices]],fill=color)
image.save(root/'building-stages.png')
print('28-stage model overview generated')
