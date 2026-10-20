import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {SERVICES} from '../final/data.js?v=6';
import {createStore,sanitize} from '../final/draft.js?v=6';
import {setupHero} from '../final/hero.js';
import {setupCompanion} from '../final/companion.js';

class Node {
 constructor(){this.attrs={};this.events={};this.dataset={};this.hidden=false;this.textContent='';const values=new Set();this.classList={toggle:(key,on)=>on?values.add(key):values.delete(key),add:key=>values.add(key),remove:key=>values.delete(key),contains:key=>values.has(key)};}
 setAttribute(k,v){this.attrs[k]=v;}
 addEventListener(k,fn){this.events[k]=fn;}
 querySelector(k){return this.nodes?.[k]||null;}
 querySelectorAll(k){return this.lists?.[k]||[];}
 contains(){return false;}
 getClientRects(){return [];}
 focus(){}
}
const timers=new Map();let sequence=0;
globalThis.setTimeout=(fn,delay)=>{timers.set(++sequence,{fn,delay});return sequence;};
globalThis.clearTimeout=id=>timers.delete(id);
globalThis.window={};
globalThis.document={hidden:false,activeElement:null,body:new Node(),addEventListener(){},querySelector(){return null;}};
let reduced=false,width=390;
globalThis.matchMedia=query=>({matches:query.includes('reduced')?reduced:width>=1360,addEventListener(){}});
let passed=0;
function test(name,fn){fn();passed++;console.log('PASS '+name);}

test('Seven catalogue options and explicit preservation of legacy drafts',()=>{
 assert.deepEqual(Object.keys(SERVICES),['crepes','ilha','churrasco','massas','salgados','feijoada','fondue']);
 assert.deepEqual(sanitize({services:['feijoada','fondue','ilha','coquetel','unknown']}).services,['feijoada','fondue','ilha','coquetel']);
 assert.equal(Object.keys(SERVICES).includes('coquetel'),false);
});

function hero(){
 const root=new Node(),pause=new Node(),status=new Node();
 const slides=Array.from({length:3},(_,i)=>{const slide=new Node();slide.dataset.title=['Crepes','Montagem','Encontros'][i];slide.nodes={img:{decode:async()=>{},complete:true,naturalWidth:960}};return slide;});
 const buttons=slides.map(()=>new Node()),stage=new Node();stage.lists={img:slides.map(s=>s.nodes.img)};
 root.nodes={'[data-hero-pause]':pause,'[data-hero-status]':status,'.hero-stage':stage};
 root.lists={'[data-hero-slide]':slides,'[data-hero-select]':buttons};
 return {root,pause,status,slides,buttons,api:setupHero(root)};
}
const store=createStore();store.add(['ilha','fondue']);const before=JSON.stringify(store.get());
const h=hero();assert.equal(h.api.isPlaying(),true);assert.ok([...timers.values()].some(t=>t.delay===7000));
await h.api.select(2);
test('Manual hero navigation pauses rotation without changing the event',()=>{
 assert.equal(h.api.current(),2);assert.equal(h.api.isPlaying(),false);assert.equal(h.buttons[2].attrs['aria-pressed'],'true');
 assert.equal(h.slides[0].attrs['aria-hidden'],'true');assert.match(h.status.textContent,/Troca automática pausada/);
 assert.equal(JSON.stringify(store.get()),before);
});
await Promise.all([h.api.select(1),h.api.select(0)]);
test('Latest carousel selection wins during quick navigation',()=>assert.equal(h.api.current(),0));
reduced=true;const quiet=hero();
test('Reduced motion starts the hero stopped and hides automatic rotation',()=>{assert.equal(quiet.api.isPlaying(),false);assert.equal(quiet.pause.hidden,true);});

function receipt(saved){
 const memory=new Map(saved===undefined?[]:[['mesa-viva-receipt-collapsed',saved]]);
 globalThis.sessionStorage={getItem:k=>memory.has(k)?memory.get(k):null,setItem:(k,v)=>memory.set(k,v)};
 const root=new Node(),fold=new Node(),body=new Node(),label=new Node();fold.nodes={'[data-fold-label]':label};
 const selectors=['[data-companion-status]','[data-companion-undo]','[data-companion-count]','[data-compact-count]','.receipt-continue','[data-receipt-empty]','[data-receipt-details]'];
 root.nodes=Object.fromEntries(selectors.map(k=>[k,new Node()]));root.nodes['[data-receipt-body]']=body;root.lists={'[data-receipt-fold]':[fold]};
 document.querySelector=k=>k==='[data-order-companion]'?root:null;
 const api=setupCompanion();api.update(store.get(),'init');return {root,fold,body,label,memory};
}
const mobile=receipt();
test('Mobile summary starts collapsed and its visible control operates the same body',()=>{
 assert.equal(mobile.body.hidden,true);assert.equal(mobile.label.textContent,'Mostrar resumo');assert.equal(mobile.fold.attrs['aria-expanded'],'false');
 mobile.fold.events.click();assert.equal(mobile.body.hidden,false);assert.equal(mobile.label.textContent,'Ocultar resumo');
 mobile.fold.events.click();assert.equal(mobile.body.hidden,true);assert.equal(JSON.stringify(store.get()),before);
});
const restored=receipt('false');
test('An explicit expanded preference survives navigation on mobile',()=>assert.equal(restored.body.hidden,false));
width=1440;const desktop=receipt();
test('Desktop starts with the receipt available beside the opening',()=>assert.equal(desktop.body.hidden,false));

const html=readFileSync(new URL('../final/index.html',import.meta.url),'utf8');
test('Home exposes all seven services directly and separates the hero controls',()=>{
 assert.equal((html.match(/class="catalog-card"/g)||[]).length,7);
 assert.equal((html.match(/data-hero-select=/g)||[]).length,3);
 assert.equal((html.match(/data-order-companion/g)||[]).length,1);
 assert.equal((html.match(/<section[^>]+id="planejar"/g)||[]).length,0);
 assert.equal((html.match(/data-service-tab=/g)||[]).length,0);
});
console.log(passed+' presentation checks passed.');
