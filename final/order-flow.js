import { SERVICES, OCCASIONS, FORMATS, REQUESTS, INTERESTS } from './data.js?v=11';
import { dateLabel } from './draft.js?v=11';

export const JOURNEY_KEY = 'mesa-viva-question-progress-v1';
export const EDIT_KEY = 'mesa-viva-pending-edit-v1';
export const QUESTION_LABELS = {
  request: 'Tipo de pedido', services: 'Cardápios', occasion: 'Ocasião',
  format: 'Como receber', date: 'Data', guests: 'Convidados', place: 'Local',
  care: 'Cuidados e observações'
};
export const QUESTION_FIELDS = {
  request: ['request'], services: ['services'], occasion: ['occasion'],
  format: ['format'], date: ['date'], guests: ['guests'], place: ['place'],
  care: ['interests', 'note']
};
const QUESTIONS = [...Object.keys(QUESTION_FIELDS), 'review'];
const isQuestion = key => Object.hasOwn(QUESTION_FIELDS, key);

export function questionPath(state) {
  const services = state.request !== 'orientacao' || state.services.length ? ['services'] : [];
  return ['request', ...services, 'occasion', 'format', 'date', 'guests', 'place', 'care', 'review'];
}

export function answerLabel(key, state) {
  const values = {
    request: REQUESTS[state.request],
    services: state.services.map(id => SERVICES[id].name).join(', '),
    occasion: OCCASIONS[state.occasion], format: FORMATS[state.format],
    date: state.date ? dateLabel(state.date) : '',
    guests: state.guests ? state.guests + ' convidados' : '',
    place: state.place.trim(),
    care: [...state.interests, state.note.trim()].filter(Boolean).join(' · ')
  };
  return values[key] || 'A definir';
}

function readJSON(storage, key) {
  try { return JSON.parse(storage?.getItem(key) || 'null'); } catch { return null; }
}

function writeJSON(storage, key, value) {
  try { storage?.setItem(key, JSON.stringify(value)); } catch { /* Storage can be denied. */ }
}

function remove(storage, key) {
  try { storage?.removeItem(key); } catch { /* The in-memory flow still works. */ }
}

export function createJourney(storage) {
  const saved = readJSON(storage, JOURNEY_KEY);
  let current = QUESTIONS.includes(saved?.current) ? saved.current : 'request';
  let editing = Boolean(saved?.editing) && current !== 'review';
  let visited = Array.isArray(saved?.visited) ? [...new Set(saved.visited.filter(isQuestion))] : [];
  const persist = () => writeJSON(storage, JOURNEY_KEY, { current, editing, visited });
  const mark = key => { if (isQuestion(key) && !visited.includes(key)) visited.push(key); };

  return {
    current: () => current,
    editing: () => editing,
    visited: () => [...visited],
    reconcile(state) {
      if (!editing && !questionPath(state).includes(current)) { current = 'occasion'; persist(); }
    },
    next(state) {
      mark(current);
      if (editing) { current = 'review'; editing = false; }
      else {
        const path = questionPath(state);
        current = path[Math.min(path.indexOf(current) + 1, path.length - 1)];
      }
      persist();
      return current;
    },
    back(state) {
      if (editing) { current = 'review'; editing = false; }
      else {
        const path = questionPath(state);
        current = path[Math.max(0, path.indexOf(current) - 1)];
      }
      persist();
      return current;
    },
    edit(key) {
      if (!isQuestion(key)) return;
      current = key; editing = true; persist();
    },
    review() { current = 'review'; editing = false; persist(); },
    useChoices() {
      mark('request'); mark('services');
      current = 'occasion'; editing = false; persist();
    },
    skipDetails() { mark(current); current = 'review'; editing = false; persist(); },
    reset() { current = 'request'; editing = false; visited = []; remove(storage, JOURNEY_KEY); }
  };
}

function fieldsFor(state, question) {
  return Object.fromEntries(QUESTION_FIELDS[question].map(key => [key, Array.isArray(state[key]) ? [...state[key]] : state[key]]));
}

function safePatch(value) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return {};
  const result = {};
  const enums = { request: REQUESTS, occasion: OCCASIONS, format: FORMATS };
  for (const [key, max] of Object.entries({ date: 10, guests: 20, place: 120, note: 600 })) {
    if (typeof value[key] === 'string') result[key] = value[key].slice(0, max);
  }
  for (const [key, options] of Object.entries(enums)) {
    if ((value[key] === '' && key !== 'request') || Object.hasOwn(options, value[key])) result[key] = value[key];
  }
  if (Array.isArray(value.services)) result.services = [...new Set(value.services.filter(key => Object.hasOwn(SERVICES, key)))];
  if (Array.isArray(value.interests)) result.interests = [...new Set(value.interests.filter(key => INTERESTS.includes(key)))];
  return result;
}

// This buffer never mutates the canonical order. Commit only its owned fields.
export function createEditSession(storage) {
  const saved = readJSON(storage, EDIT_KEY);
  let question = isQuestion(saved?.question) ? saved.question : null;
  let patch = question ? safePatch(saved.patch) : {};
  const persist = () => writeJSON(storage, EDIT_KEY, { question, patch });
  return {
    active: () => question !== null,
    question: () => question,
    patch: () => safePatch(patch),
    view: state => ({ ...state, ...safePatch(patch) }),
    begin(key, state) { if (!isQuestion(key)) return; question = key; patch = fieldsFor(state, key); persist(); },
    update(values) { patch = { ...patch, ...safePatch(values) }; persist(); },
    move(key, state) {
      if (!isQuestion(key)) return;
      patch = { ...fieldsFor({ ...state, ...patch }, key), ...patch };
      question = key; persist();
    },
    clear() { question = null; patch = {}; remove(storage, EDIT_KEY); }
  };
}
