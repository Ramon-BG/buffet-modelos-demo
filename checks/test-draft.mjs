import assert from 'node:assert/strict';
import {emptyDraft,sanitize,buildMessage,createStore,STORAGE_KEY} from '../final/draft.js';
import {suggestionFor} from '../final/data.js';
import {describeChange} from '../final/companion.js';
let passed=0;
function test(name,fn){fn();passed++;console.log('PASS '+name);}
test('Invalid cached data cannot break a new request',()=>{
  for(const value of [null,[],false,25,'bad'])assert.deepEqual(sanitize(value),emptyDraft());
  const state=sanitize({services:['massas','bad','massas',{}],request:'bad',interests:['x','Restrições alimentares','Restrições alimentares'],note:{},occasion:'bad'});
  assert.deepEqual(state.services,['massas']);assert.equal(state.request,'orientacao');assert.equal(state.note,'');assert.deepEqual(state.interests,['Restrições alimentares']);
});
test('Dates and quantities are meaningful when provided',()=>{
  for(const date of ['2026-02-31','2026-13-01','bad','2026-02-29'])assert.equal(sanitize({date}).date,'');
  assert.equal(sanitize({date:'2028-02-29'}).date,'2028-02-29');
  for(const guests of ['-1','0','2.5','100001','abc'])assert.equal(sanitize({guests}).guests,'');
  assert.equal(sanitize({guests:250}).guests,'250');
});
test('Complete buffet is intent, not automatic inclusion of everything',()=>{
  const store=createStore();store.update({request:'completo'});assert.deepEqual(store.get().services,[]);
  store.add(['massas']);store.add(['massas','coquetel']);assert.equal(store.get().request,'completo');assert.deepEqual(store.get().services,['massas','coquetel']);
  store.remove('massas');assert.deepEqual(store.get().services,['coquetel']);
});
test('Recommendations add combinations without removing previous choices',()=>{
  const store=createStore();store.add(['crepes']);store.add(suggestionFor('casamento','mesa').services);
  assert.deepEqual(store.get().services,['crepes','ilha','massas']);assert.equal(suggestionFor('',''),null);
});
test('Navigation, reset and undo keep one draft',()=>{
  const memory=new Map(),storage={getItem:k=>memory.get(k),setItem:(k,v)=>memory.set(k,v),removeItem:k=>memory.delete(k)};
  const first=createStore(storage);first.add(['massas']);first.update({occasion:'casamento',guests:'120',date:'2026-12-22',note:'Detalhes da festa'});
  const next=createStore(storage);assert.equal(next.restored,true);assert.deepEqual(next.get(),first.get());const old=next.reset();assert.equal(memory.has(STORAGE_KEY),false);next.update(old);assert.deepEqual(next.get(),first.get());
  next.add(['coquetel']);first.refresh();assert.deepEqual(first.get().services,['massas','coquetel']);
  storage.setItem(STORAGE_KEY,'{invalid');assert.deepEqual(createStore(storage).get(),emptyDraft());
});
test('Denied storage is harmless and output describes the current state',()=>{
  const storage={getItem(){throw Error('denied');},setItem(){throw Error('denied');},removeItem(){throw Error('denied');}};
  const store=createStore(storage);store.update({request:'completo',date:'2026-12-20',place:' Cidade Exemplo ',note:'  Área coberta  ',interests:['Estrutura e utensílios']});store.add(['massas']);
  const message=buildMessage(store.get());assert.match(message,/Preferências para conversar: Massas/);assert.match(message,/20\/12\/2026/);assert.match(message,/Local: Cidade Exemplo\n/);assert.match(message,/Cardápio, equipe e estrutura a confirmar/);assert.doesNotMatch(message,/Convidados:/);store.reset();
});
test('Receipt feedback reflects additions, removals and edited details',()=>{
  const store=createStore();let previous=store.get();let source;
  store.subscribe((state,origin)=>source=origin);
  store.add(['crepes','massas'],'suggestion');assert.equal(source,'suggestion');
  assert.match(describeChange(previous,store.get(),source),/Sugestão incluída/);
  previous=store.get();store.remove('crepes');assert.match(describeChange(previous,store.get()),/Crepe francês removido/);
  previous=store.get();store.update({guests:'120'},'typing');assert.equal(describeChange(previous,store.get(),source),'120 convidados no rascunho.');
  assert.equal(describeChange(previous,previous),'');assert.equal(describeChange(null,store.get(),'init'),'');
  previous=store.get();store.reset();assert.equal(describeChange(previous,store.get(),source),'Pedido recomeçado.');
});
console.log(passed+' meaningful checks passed.');
