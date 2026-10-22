import assert from 'node:assert/strict';
import { createStore, STORAGE_KEY } from '../final/draft.js';
import { createEditSession, createJourney, EDIT_KEY, JOURNEY_KEY } from '../final/order-flow.js';
import { validateOrder, normalizeAnswers, normalizeGuestCount } from '../final/order-rules.js';

let passed = 0;
const test = (name, run) => { run(); passed++; console.log('PASS ' + name); };
function memoryStorage() {
  const memory = new Map();
  return { memory, storage: { getItem: key => memory.get(key), setItem: (key, value) => memory.set(key, value), removeItem: key => memory.delete(key) } };
}

test('Request and required menus commit together', () => {
  const { storage } = memoryStorage(), store = createStore(storage), edit = createEditSession(storage);
  store.update({ request: 'completo', guests: '80' });
  edit.begin('request', store.get()); edit.update({ request: 'servicos' });
  assert.equal(store.get().request, 'completo');
  assert.equal(validateOrder(edit.view(store.get())).question, 'services');
  edit.move('services', store.get()); edit.update({ services: ['crepes'] });
  assert.deepEqual(edit.patch(), { services: ['crepes'], request: 'servicos' });
  assert.equal(validateOrder(edit.view(store.get())), null);
  store.update(normalizeAnswers(edit.patch()), 'edit'); edit.clear();
  assert.equal(store.get().request, 'servicos'); assert.deepEqual(store.get().services, ['crepes']);
});

test('Invalid temporary guests and cancellation preserve the last confirmed answer', () => {
  const store = createStore(), edit = createEditSession(); store.update({ guests: '80' });
  edit.begin('guests', store.get()); edit.update({ guests: '0' });
  assert.equal(store.get().guests, '80'); assert.equal(validateOrder(edit.view(store.get())).question, 'guests');
  edit.clear(); assert.equal(store.get().guests, '80'); assert.equal(edit.active(), false);
});

test('Cancel a request change after moving to required menus', () => {
  const store = createStore(), edit = createEditSession(); store.update({ request: 'completo' });
  const before = structuredClone(store.get());
  edit.begin('request', store.get()); edit.update({ request: 'servicos' });
  edit.move('services', store.get()); edit.update({ services: ['fondue'] });
  edit.clear(); assert.deepEqual(store.get(), before); assert.deepEqual(edit.patch(), {});
});

test('Saving one question preserves external changes to other fields', () => {
  const store = createStore(), edit = createEditSession(); store.add(['crepes']); store.update({ guests: '80' });
  edit.begin('guests', store.get()); edit.update({ guests: '90' });
  store.add(['massas']); store.remove('crepes'); store.update({ place: 'Cidade Exemplo' });
  store.update(normalizeAnswers(edit.patch()), 'edit'); edit.clear();
  assert.deepEqual(store.get().services, ['massas']); assert.equal(store.get().place, 'Cidade Exemplo'); assert.equal(store.get().guests, '90');
});

test('Care edits own observations and interests as one cancellable answer', () => {
  const store = createStore(), edit = createEditSession(); store.update({ interests: ['Restrições alimentares'], note: 'Original' });
  edit.begin('care', store.get()); edit.update({ interests: [], note: 'Alterado' });
  assert.deepEqual(store.get().interests, ['Restrições alimentares']); assert.equal(store.get().note, 'Original');
  edit.clear(); assert.equal(store.get().note, 'Original');
  edit.begin('care', store.get()); edit.update({ interests: [], note: 'Confirmado' });
  store.update(edit.patch(), 'edit'); edit.clear();
  assert.deepEqual(store.get().interests, []); assert.equal(store.get().note, 'Confirmado');
});

test('Reload restores an invalid buffer separately from the confirmed order', () => {
  const { storage } = memoryStorage(), store = createStore(storage), edit = createEditSession(storage), flow = createJourney(storage);
  store.update({ guests: '90' }); edit.begin('guests', store.get()); edit.update({ guests: '0' }); flow.edit('guests');
  const reloadedStore = createStore(storage), reloadedEdit = createEditSession(storage), reloadedFlow = createJourney(storage);
  assert.equal(reloadedStore.get().guests, '90'); assert.equal(reloadedEdit.view(reloadedStore.get()).guests, '0');
  assert.equal(reloadedFlow.current(), 'guests'); assert.equal(reloadedFlow.editing(), true);
  reloadedEdit.clear(); reloadedFlow.review(); assert.equal(reloadedStore.get().guests, '90');
});

test('Skipping remaining details preserves confirmed answers', () => {
  const store = createStore(), flow = createJourney(); store.add(['crepes']);
  store.update({ occasion: 'casamento', guests: '80', place: 'Centro', note: 'Área coberta' });
  const before = structuredClone(store.get()); flow.useChoices(); flow.skipDetails();
  assert.equal(flow.current(), 'review'); assert.deepEqual(store.get(), before);
});

test('Reset discards pending edits; undo restores only the confirmed order', () => {
  const { storage, memory } = memoryStorage(), store = createStore(storage), edit = createEditSession(storage), flow = createJourney(storage);
  store.update({ guests: '80' }); edit.begin('guests', store.get()); edit.update({ guests: '90' }); flow.edit('guests');
  const confirmed = store.reset(); edit.clear(); flow.reset();
  assert.equal(memory.has(STORAGE_KEY), false); assert.equal(memory.has(EDIT_KEY), false); assert.equal(memory.has(JOURNEY_KEY), false);
  store.update(confirmed, 'restore'); assert.equal(store.get().guests, '80'); assert.equal(edit.active(), false); assert.equal(flow.current(), 'request');
});

test('Malformed and prototype-shaped metadata cannot start a foreign question', () => {
  const { storage, memory } = memoryStorage();
  for (const value of ['bad', 'null', '[]', '{"question":"__proto__","patch":{"guests":"90"}}']) {
    memory.set(EDIT_KEY, value); assert.equal(createEditSession(storage).active(), false);
  }
  memory.set(JOURNEY_KEY, '{"current":"__proto__","visited":["constructor","guests","guests"]}');
  const flow = createJourney(storage); assert.equal(flow.current(), 'request'); assert.deepEqual(flow.visited(), ['guests']);
});

test('Denied storage supports edits and numeric notation without losing confirmed values', () => {
  const storage = { getItem() { throw Error('denied'); }, setItem() { throw Error('denied'); }, removeItem() { throw Error('denied'); } };
  const store = createStore(storage), edit = createEditSession(storage); store.update({ guests: '80' });
  edit.begin('guests', store.get()); edit.update({ guests: '1e2' });
  assert.equal(store.get().guests, '80'); assert.equal(validateOrder(edit.view(store.get())), null);
  store.update(normalizeAnswers(edit.patch()), 'edit'); edit.clear(); assert.equal(store.get().guests, '100');
  for (const invalid of ['0', '-1', '2.5', '1e', '100001']) assert.equal(normalizeGuestCount(invalid), null);
});

test('A restore notification is delivered even when storage is unavailable', () => {
  for (const storage of [undefined, { getItem() { throw Error('denied'); }, setItem() {}, removeItem() {} }]) {
    const store = createStore(storage); store.update({ guests: '80' });
    let received;
    store.subscribe((state, source) => { received = { guests: state.guests, source }; });
    store.refresh(); assert.deepEqual(received, { guests: '80', source: 'restore' });
  }
});

console.log(passed + ' order editing checks passed.');
