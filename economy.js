(function(root){
  'use strict';
  const defs=[
    {id:'hut',name:'叮当小屋',icon:'⌂',base:10,rate:1,description:'红屋顶木屋 · 庭院社区',position:[-8.5,4]},
    {id:'cafe',name:'月桂咖啡馆',icon:'☕',base:60,rate:6,description:'紫色咖啡馆 · 精巧玻璃茶屋',position:[0,4]},
    {id:'farm',name:'金穗农场',icon:'♧',base:300,rate:30,description:'谷仓、农田、温室 · 横向扩张',position:[-8.5,-4]},
    {id:'mine',name:'琥珀矿洞',icon:'⛏',base:1600,rate:150,description:'钢架、轨道、烟囱 · 工业矿场',position:[8.5,-4]},
    {id:'bakery',name:'云朵面包坊',icon:'♨',base:8000,rate:760,description:'砖红烤炉 · 烘焙街市',position:[0,-4]},
    {id:'bank',name:'翡翠金库',icon:'▥',base:42000,rate:3900,description:'翡翠屋顶 · 石柱金融馆',position:[8.5,4]},
    {id:'tower',name:'月光灯塔',icon:'♜',base:220000,rate:21000,description:'珊瑚灯塔 · 双港码头',position:[0,-12.4]}
  ];
  const LIMIT=1e15;
  const denominations=[100000,10000,1000,100,10,1];
  function splitCoins(amount){let remaining=Number.isFinite(amount)?Math.min(LIMIT,Math.max(0,Math.floor(amount))):0;const result=[];for(const value of denominations){const count=Math.floor(remaining/value);if(count){result.push({value,count});remaining-=value*count}}return result}
  class Economy{
    constructor(saved,now=Date.now()){
      const valid=saved&&typeof saved==='object';
      const balance=valid&&Number.isFinite(saved.coins)?Math.min(LIMIT,Math.max(0,saved.coins)):0;
      this.coins=Math.floor(balance);this.remainders={};this.production={};
      this.levels={};for(const b of defs)this.levels[b.id]=Math.min(100,Math.max(0,Math.floor(Number(saved?.levels?.[b.id])||0)));
      for(const b of defs){const r=saved?.remainders?.[b.id];this.remainders[b.id]=Number.isFinite(r)&&r>=0&&r<1?r:0;this.production[b.id]=0}
      if(!saved?.remainders)this.remainders.hut=balance-this.coins;
      if(Object.values(this.levels).every(v=>v===0))this.levels.hut=1;
      this.last=valid&&Number.isFinite(saved.last)?Math.min(now,Math.max(0,saved.last)):now;
    }
    rate(){return defs.reduce((n,b)=>n+b.rate*this.levels[b.id],0)}
    price(id){const b=defs.find(b=>b.id===id);return b?Math.floor(b.base*Math.pow(1.48,this.levels[id])):Infinity}
    advance(now=Date.now()){const seconds=Math.min(28800000,Math.max(0,now-this.last))/1000;let earned=0;for(const b of defs){const raw=this.remainders[b.id]+seconds*b.rate*this.levels[b.id],whole=Math.floor(raw+1e-8),paid=Math.min(LIMIT-this.coins,whole);this.remainders[b.id]=Math.max(0,raw-whole);this.coins+=paid;this.production[b.id]+=paid;earned+=paid}this.last=now;return earned}
    collect(now=Date.now()){this.advance(now);this.coins=Math.min(LIMIT,this.coins+1)}
    buy(id,now=Date.now()){this.advance(now);if(!(id in this.levels)||this.levels[id]>=100)return false;const p=this.price(id);if(this.coins<p)return false;this.coins-=p;this.levels[id]++;return true}
    drainProduction(){const batches=[];for(const b of defs){const amount=this.production[b.id];if(amount)batches.push({id:b.id,amount,coins:splitCoins(amount)});this.production[b.id]=0}return batches}
    snapshot(){return {version:4,coins:this.coins,levels:{...this.levels},remainders:{...this.remainders},last:this.last}}
  }
  root.TownEconomy={defs,Economy,splitCoins,denominations};
})(globalThis);
