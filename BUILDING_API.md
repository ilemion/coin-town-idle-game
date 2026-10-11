# 建筑内部玩法接口

`building-runtime.js` 提供全局接口 `TownBuildings`。主游戏只负责打开、关闭建筑和保存状态；每座建筑可以逐步换成自己的室内地图、角色、生产队列或小游戏。

## 当前接口

- `TownBuildings.get(id)`：读取一座建筑的定义。
- `TownBuildings.register(definition)`：注册或替换建筑定义。
- `TownBuildings.on(event, handler)`：监听 `registered`、`enter`、`leave`、`action` 事件，返回取消监听函数。
- `runtime.enter(id, context)`：进入建筑。`context.level` 小于 1 时会拒绝进入。
- `runtime.leave(context)`：离开当前建筑。
- `runtime.invoke(actionId, payload, context)`：执行当前建筑的功能。
- `runtime.state(id)`：取得该建筑独立状态。
- `runtime.snapshot()`：取得可以写入存档的全部建筑状态。

现有状态会保存在 `coinTownSave.buildingStates`，重开页面后继续使用。

当前七类建筑已经接入基础经营循环：住户与租金、饮品与客流、作物生长、矿车作业、烤炉出炉、金库利息和商船航线。按钮会显示金币费用、等待时间或领取条件；动作完成后会更新独立状态并把收益加入小镇资产。

## 室内 3D 模型接口

`interior-models.js` 提供全局接口 `TownInteriors`，与经营状态分离，后续可以替换成更细的房间、角色或点击设施逻辑：

- `TownInteriors.create(id, level)`：创建对应建筑的室内 `THREE.Group`。`id` 支持 `hut`、`cafe`、`farm`、`mine`、`bakery`、`bank`、`tower`。
- `TownInteriors.orbitBounds(id, level)`：取得房间尺寸、镜头目标点和建议的环绕距离。
- `group.userData.interiorPart`：家具、门窗、灯具、工作台等节点的部件标识，可作为射线点击或镜头聚焦的入口。
- `group.userData.appearanceLevel`：当前建筑所属的四段外观阶段，与主场景的 1–2、3–5、6–7、8+ 规则一致。

主界面已经把 `interiorCanvas` 的拖动旋转、滚轮缩放和触摸拖动接好。新增房间时只需在 `TownInteriors.create` 中添加布局，并在 `TownBuildings.register` 中补上对应经营动作。

## 添加独立功能

功能可使用数组简写：

```js
actions: [
  ['cook', '开始烹饪', ({ state }) => state.meals = (state.meals || 0) + 1]
]
```

也可使用对象形式：

```js
TownBuildings.register({
  id: 'cafe',
  theme: 'cafe',
  room: '月桂餐厅',
  feature: '菜单与客流',
  description: '经营自己的咖啡馆。',
  initialState: { meals: 0, queue: [] },
  metrics: [['已制作餐点', 'meals']],
  actions: [
    {
      id: 'cook',
      label: '开始烹饪',
      run({ state, payload, context, runtime }) {
        state.meals += payload.amount || 1;
      }
    }
  ],
  onEnter({ state, context }) {},
  onLeave({ state, context }) {}
});
```

`context.game` 是当前经济系统，`context.level` 是建筑等级。独立玩法如需影响金币或产量，可在动作回调或事件监听器中调用经济系统，再由主游戏保存。

## 建议的后续文件结构

```text
buildings/
  hut.js       居民、租金与家具
  cafe.js      顾客队列、菜单与桌位
  farm.js      作物周期、田地与仓库
  mine.js      矿层探索、矿车与精炼
  bakery.js    配方、烤炉与商品陈列
  bank.js      金库、保险箱与利息
  tower.js     信标、航线与商船访客
```

这些模块只需调用 `TownBuildings.register(...)`，无需改动存档格式。主界面会根据 `metrics` 和 `actions` 自动生成面板。
