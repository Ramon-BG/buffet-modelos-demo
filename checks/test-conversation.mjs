import assert from 'node:assert/strict';
import {createJourney,questionPath,answerLabel,JOURNEY_KEY} from '../final/conversation.js';
import {createStore} from '../final/draft.js';
let passed=0;const test=(name,fn)=>{fn();passed++;console.log('PASS '+name);};
const state=createStore().get();
test('The route follows the request without selecting services automatically',()=>{
 assert.equal(questionPath(state).includes('services'),false);
 assert.equal(questionPath({...state,request:'completo'}).includes('services'),true);
 assert.equal(questionPath({...state,services:['crepes']}).includes('services'),true);
 assert.deepEqual(state.services,[]);
});
test('Back, skipped questions and edits leave the event data intact',()=>{
 const store=createStore();store.add(['crepes','massas']);store.update({guests:'90',place:'Cidade Exemplo'});
 const before=JSON.stringify(store.get()),flow=createJourney();
 flow.next(store.get());assert.equal(flow.current(),'services');
 flow.next(store.get());assert.equal(flow.current(),'date');
 flow.back(store.get());assert.equal(flow.current(),'services');
 flow.review();flow.edit('guests');assert.equal(flow.current(),'guests');assert.equal(flow.editing(),true);
 flow.next(store.get());assert.equal(flow.current(),'review');assert.equal(JSON.stringify(store.get()),before);
});
test('Existing menu selections can continue straight to event questions',()=>{
 const flow=createJourney();flow.useChoices();assert.equal(flow.current(),'date');assert.deepEqual(flow.visited(),['request','services']);
});
test('Progress resumes across pages; malformed or denied storage is harmless',()=>{
 const memory=new Map(),storage={getItem:k=>memory.get(k),setItem:(k,v)=>memory.set(k,v),removeItem:k=>memory.delete(k)};
 const first=createJourney(storage);first.next(state);first.next(state);assert.equal(createJourney(storage).current(),'guests');
 first.reset();assert.equal(memory.has(JOURNEY_KEY),false);
 memory.set(JOURNEY_KEY,'{"current":"foreign","visited":["unknown"]}');assert.equal(createJourney(storage).current(),'request');
 memory.set(JOURNEY_KEY,'bad');assert.equal(createJourney(storage).current(),'request');
 const denied={getItem(){throw Error();},setItem(){throw Error();},removeItem(){throw Error();}};
 const isolated=createJourney(denied);isolated.next(state);isolated.reset();assert.equal(isolated.current(),'request');
});
test('Optional unanswered fields and legacy services remain understandable',()=>{
 assert.equal(answerLabel('date',state),'A definir');
 assert.match(answerLabel('services',{...state,services:['coquetel','fondue']}),/Fondue/);
 const flow=createJourney();flow.review();flow.edit('services');flow.next(state);assert.equal(flow.current(),'review');
});
test('A new quick journey has exactly three optional event details',()=>{
 const flow=createJourney();
 assert.equal(flow.pace(),'quick');
 assert.deepEqual(questionPath(state,flow.pace()),['request','date','guests','place','review']);
 assert.deepEqual(questionPath({...state,request:'servicos',services:['crepes']},flow.pace()),['request','services','date','guests','place','review']);
});

test('Switching pace keeps confirmed choices and allows editing omitted details',()=>{
 const store=createStore();store.add(['crepes']);store.update({occasion:'casamento',note:'Sem lactose',guests:'80'});
 const before=structuredClone(store.get()),flow=createJourney();flow.useChoices();
 flow.setPace('guided',store.get());assert.equal(flow.current(),'date');
 assert.ok(questionPath(store.get(),flow.pace()).includes('care'));
 flow.back(store.get());assert.equal(flow.current(),'format');
 flow.setPace('quick',store.get());assert.equal(flow.current(),'date');
 flow.edit('occasion');flow.reconcile(store.get());assert.equal(flow.current(),'occasion');
 flow.setPace('guided',store.get());assert.equal(flow.pace(),'quick');
 flow.next(store.get());assert.equal(flow.current(),'review');
 assert.deepEqual(store.get(),before);
});

test('Old journeys retain the guided route and new pace survives a reload',()=>{
 const memory=new Map(),storage={getItem:k=>memory.get(k),setItem:(k,v)=>memory.set(k,v),removeItem:k=>memory.delete(k)};
 memory.set(JOURNEY_KEY,JSON.stringify({current:'format',visited:['request','occasion']}));
 const old=createJourney(storage);assert.equal(old.pace(),'guided');old.reconcile(state);assert.equal(old.current(),'format');
 old.setPace('quick',state);assert.equal(createJourney(storage).pace(),'quick');assert.equal(createJourney(storage).current(),'date');
 old.reset();assert.equal(createJourney(storage).pace(),'quick');
});
console.log(passed+' conversation checks passed.');
