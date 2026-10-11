from pathlib import Path
import numpy as np
from PIL import Image, ImageDraw, ImageFont

ROOT=Path(__file__).resolve().parents[1]
items=[('hut','叮当小屋','红屋顶 · 庭院 · 花圃'),('cafe','月桂咖啡馆','淡紫色 · 露台 · 茶屋'),('farm','金穗农场','红棕谷仓 · 麦田 · 粮仓'),('mine','琥珀矿洞','冷灰岩石 · 铁轨 · 矿车'),('bakery','云朵面包坊','橙陶色 · 烤炉 · 面包摊'),('bank','翡翠金库','翡翠屋顶 · 石柱 · 金库'),('tower','月光灯塔','珊瑚红 · 海蓝 · 港口')]
font_path='C:/Windows/Fonts/msyh.ttc'
def font(size):return ImageFont.truetype(font_path,size)
image=Image.new('RGB',(1600,1000),'#f4f1e7');draw=ImageDraw.Draw(image)
draw.text((45,28),'金币小镇 / 建筑模型总览',font=font(37),fill='#435c4c')
draw.text((46,86),'七栋独立三维模型 · 由导出的 OBJ 网格生成预览',font=font(17),fill='#87947f')
eye=np.array([5.,4.,6.]);eye/=np.linalg.norm(eye)
right=np.cross(np.array([0.,1.,0.]),eye);right/=np.linalg.norm(right)
up=np.cross(eye,right)
light=np.array([-3.,6.,5.]);light/=np.linalg.norm(light)
for idx,(key,name,desc) in enumerate(items):
    x=30+(idx%4)*393;y=132+(idx//4)*417
    draw.rounded_rectangle((x,y,x+373,y+396),radius=19,fill='#fcfaf3',outline='#dfdfd0',width=2)
    draw.text((x+22,y+18),f'{idx+1:02}  {name}',font=font(22),fill='#4d6252')
    mats={};current=None
    for line in (ROOT/'models'/f'{key}.mtl').read_text().splitlines():
        if line.startswith('newmtl '):current=line.split()[1]
        elif line.startswith('Kd '):mats[current]=np.array([float(v) for v in line.split()[1:]])
    vertices=[];faces=[];material=None
    for line in (ROOT/'models'/f'{key}.obj').read_text().splitlines():
        if line.startswith('v '):vertices.append([float(v) for v in line.split()[1:]])
        elif line.startswith('usemtl '):material=line.split()[1]
        elif line.startswith('f '):faces.append(([int(v.split('/')[0])-1 for v in line.split()[1:]],material))
    vertices=np.array(vertices);points=np.stack([vertices@right,-vertices@up],axis=1)*77+np.array([x+186,y+292])
    depth=vertices@eye
    draw.ellipse((x+85,y+267,x+286,y+322),fill='#e0e4d5')
    for indices,mat in sorted(faces,key=lambda f:float(np.mean(depth[f[0]]))):
        v=vertices[indices];normal=np.cross(v[1]-v[0],v[2]-v[0]);length=np.linalg.norm(normal)
        if length<1e-9:continue
        normal/=length
        if normal@eye<0:continue
        shade=.59+.41*max(0.,float(normal@light))
        color=tuple(np.clip(mats[mat]*shade*255,0,255).astype(int))
        draw.polygon([tuple(p) for p in points[indices]],fill=color)
    draw.text((x+22,y+349),desc,font=font(15),fill='#92a087')
draw.text((1228,634),'独立模型文件',font=font(25),fill='#526d5c')
draw.text((1228,691),'OBJ + MTL\n\n可旋转、可缩放\n\n每栋建筑独立结构与材质',font=font(18),fill='#889b85')
image.save(ROOT/'models-overview.png')
print(ROOT/'models-overview.png')
