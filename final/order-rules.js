import { REQUESTS, SERVICES } from './data.js?v=12';

const MAX_GUESTS = 100000;

export function normalizeGuestCount(value) {
  const text = String(value ?? '').trim();
  if (!text) return '';
  if (!/^\+?\d+(?:\.\d*)?(?:e[+-]?\d+)?$/i.test(text)) return null;
  const count = Number(text);
  return Number.isInteger(count) && count > 0 && count <= MAX_GUESTS ? String(count) : null;
}

function issue(question, field, message) {
  return { question, field, message };
}

export function validateQuestion(question, state) {
  if (question === 'request' && !Object.hasOwn(REQUESTS, state.request)) {
    return issue('request', 'request', 'Escolha como prefere começar.');
  }
  if (question === 'services' && state.request === 'servicos' && !state.services.length) {
    return issue('services', 'services', 'Escolha ao menos um cardápio. Se preferir decidir depois, escolha “Preciso de orientação”.');
  }
  if (question === 'services' && state.services.some(key => !Object.hasOwn(SERVICES, key))) {
    return issue('services', 'services', 'Confira os cardápios selecionados.');
  }
  if (question === 'guests' && normalizeGuestCount(state.guests) === null) {
    return issue('guests', 'guests', 'Informe uma quantidade inteira entre 1 e 100.000, ou deixe em aberto.');
  }
  if (question === 'date' && state.date) {
    const parsed = new Date(state.date + 'T12:00:00Z');
    if (!/^\d{4}-\d{2}-\d{2}$/.test(state.date) || Number.isNaN(parsed.getTime()) || parsed.toISOString().slice(0, 10) !== state.date) {
      return issue('date', 'date', 'Confira a data ou deixe em aberto.');
    }
  }
  if (question === 'place' && state.place.length > 120) {
    return issue('place', 'place', 'Use até 120 caracteres para o local.');
  }
  if (question === 'care' && state.note.length > 600) {
    return issue('care', 'note', 'Use até 600 caracteres para as observações.');
  }
  return null;
}

export function validateOrder(state) {
  for (const question of ['request', 'services', 'date', 'guests', 'place', 'care']) {
    const result = validateQuestion(question, state);
    if (result) return result;
  }
  return null;
}

export function normalizeAnswers(patch) {
  const result = { ...patch };
  if (Object.hasOwn(result, 'guests')) {
    const count = normalizeGuestCount(result.guests);
    if (count !== null) result.guests = count;
  }
  return result;
}
