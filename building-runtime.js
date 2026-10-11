(function(root){
  'use strict';
  const registry=new Map(),listeners=new Map();
  const definitions=[
    {id:'hut',theme:'home',room:'温暖客厅',feature:'居民与租金',description:'邀请居民、布置家具，收取一轮小院租金。',metrics:[['住户','residents'],['舒适度','comfort'],['租金倍率','rentBonus']],actions:[['invite','邀请住户'],['decorate','布置房间'],['collectRent','收取租金']]},
    {id:'cafe',theme:'cafe',room:'月桂餐厅',feature:'菜单与客流',description:'研发饮品并开门营业，客人会把小费带回小镇。',metrics:[['菜单数','recipes'],['座位','seats'],['人气','popularity']],actions:[['developDrink','研发饮品'],['openCafe','开始营业'],['serveGuest','接待顾客']]},
    {id:'farm',theme:'farm',room:'农场管理所',feature:'播种与收获',description:'选择作物、播种田地，成熟后把收成送往小镇商店。',metrics:[['田地','plots'],['作物等级','cropLevel'],['仓库容量','storage']],actions:[['chooseCrop','选择作物'],['plant','播种'],['harvest','收获']]},
    {id:'mine',theme:'mine',room:'矿井控制室',feature:'矿层与矿石',description:'向下勘探、派出矿车，精炼完成后取得矿石收益。',metrics:[['矿井深度','depth'],['矿车','carts'],['稀有度','rarity']],actions:[['explore','勘探矿层'],['dispatchCart','派出矿车'],['refine','精炼矿石']]},
    {id:'bakery',theme:'bakery',room:'烘焙工房',feature:'配方与烤炉',description:'学习配方、等待烤炉出炉，再把面包陈列到橱窗。',metrics:[['配方数','recipes'],['烤炉','ovens'],['香气值','aroma']],actions:[['learnRecipe','学习配方'],['bakeBatch','烘焙一批'],['displayBread','布置橱窗']]},
    {id:'bank',theme:'bank',room:'金库大厅',feature:'金库与利息',description:'扩建金库、整理保险箱，按利息倍率领取一轮存款收益。',metrics:[['金库等级','vaultLevel'],['保险箱','safes'],['利息倍率','interest']],actions:[['upgradeVault','扩建金库'],['manageSafes','管理保险箱'],['settleInterest','结算利息']]},
    {id:'tower',theme:'tower',room:'灯塔观景台',feature:'航线与信标',description:'点亮信标、发现航线，迎接商船为小镇带来访客收益。',metrics:[['信标范围','beaconRange'],['航线','routes'],['访客加成','visitorBonus']],actions:[['lightBeacon','点亮信标'],['discoverRoute','发现航线'],['welcomeShip','迎接商船']]}
  ];
  function initialState(id){const presets={hut:{residents:1,comfort:10,rentBonus:1,furniture:0},cafe:{recipes:1,seats:4,popularity:0,served:0,openUntil:0},farm:{plots:2,cropLevel:1,storage:10,planted:0,crop:'小麦',readyAt:0},mine:{depth:1,carts:1,rarity:1,ore:0,readyAt:0},bakery:{recipes:1,ovens:1,aroma:5,display:0,readyAt:0},bank:{vaultLevel:1,safes:2,interest:1,interestReady:0},tower:{beaconRange:1,routes:0,visitorBonus:0,ships:0}},custom=get(id)?.initialState;return {...(presets[id]||{}),...(typeof custom==='function'?custom():custom||{}),visits:0,lastAction:null}}
  function register(definition){if(!definition?.id)throw new Error('Building definition requires id');registry.set(definition.id,{...definition});emit('registered',{id:definition.id});return definition}
  function get(id){return registry.get(id)||null}
  function on(event,handler){if(!listeners.has(event))listeners.set(event,new Set());listeners.get(event).add(handler);return()=>listeners.get(event)?.delete(handler)}
  function emit(event,payload){for(const fn of listeners.get(event)||[])try{fn(payload)}catch(error){console.error('Building event:',error)}}
  class Runtime{
    constructor(saved){this.states={};this.current=null;for(const id of registry.keys())this.states[id]={...initialState(id),...(saved?.[id]||{})}}
    enter(id,context={}){const def=get(id);if(!def)throw new Error('Unknown building: '+id);if((context.level||0)<1)return {ok:false,reason:'unbuilt'};this.current=id;this.states[id]??=initialState(id);this.states[id].visits++;def.onEnter?.({id,state:this.states[id],context,runtime:this});emit('enter',{id,definition:def,state:this.states[id],context});return {ok:true,definition:def,state:this.states[id]}}
    leave(context={}){if(!this.current)return;const id=this.current,def=get(id);def?.onLeave?.({id,state:this.states[id],context,runtime:this});this.current=null;emit('leave',{id,state:this.states[id],context})}
    invoke(actionId,payload={},context={}){const id=this.current,def=get(id);if(!id||!def)return {ok:false,reason:'closed'};const action=def.actions.find(a=>(Array.isArray(a)?a[0]:a.id)===actionId);if(!action)return {ok:false,reason:'unknown-action'};const state=this.states[id],label=Array.isArray(action)?action[1]:action.label,handler=Array.isArray(action)?action[2]:action.run;state.lastAction=actionId;handler?.({id,state,payload,context,runtime:this});emit('action',{id,actionId,payload,state,context});return {ok:true,id,actionId,label,state}}
    state(id){return this.states[id]||null}
    snapshot(){return JSON.parse(JSON.stringify(this.states))}
  }
  for(const def of definitions)register(def);
  root.TownBuildings={version:1,register,get,on,emit,definitions,Runtime};
})(globalThis);
