import { SERVICES } from './data.js?v=12';
import { validateQuestion, validateOrder, normalizeAnswers } from './order-rules.js?v=12';
import { createJourney, createEditSession, questionPath, answerLabel, QUESTION_FIELDS, QUESTION_LABELS, JOURNEY_KEY } from './order-flow.js?v=12';
export { JOURNEY_KEY, EDIT_KEY, createJourney, createEditSession, questionPath, answerLabel } from './order-flow.js?v=12';

export function setupConversation(form, { store, motion, storage }) {
  if (!form) return null;
  const find = selector => form.querySelector(selector);
  const all = selector => [...form.querySelectorAll(selector)];
  const controls = {
    next: find('[data-chat-next]'), back: find('[data-chat-back]'),
    skip: find('[data-chat-skip]'), fast: find('[data-chat-skip-details]'),
    useChoices: find('[data-chat-use-choices]'), error: find('#form-error')
  };
  let journey;
  let editor;

  function restoreSession(preserveOnDenied = false) {
    if (preserveOnDenied) {
      if (!storage) return;
      try { storage.getItem(JOURNEY_KEY); } catch { return; }
    }
    journey = createJourney(storage);
    editor = createEditSession(storage);
    if (editor.active()) journey.edit(editor.question());
    else if (journey.editing()) journey.review();
  }

  function viewState() {
    return editor.active() ? editor.view(store.get()) : store.get();
  }

  function readQuestion(question = journey.current()) {
    return Object.fromEntries(QUESTION_FIELDS[question].map(name => {
      const value = ['services', 'interests'].includes(name)
        ? all('input[name="' + name + '"]:checked').map(input => input.value)
        : form.elements.namedItem(name).value;
      return [name, value];
    }));
  }

  function clearError() {
    controls.error.hidden = true;
    all('[aria-invalid]').forEach(input => {
      input.removeAttribute('aria-invalid');
      input.removeAttribute('aria-describedby');
    });
  }

  function showError(issue) {
    controls.error.textContent = issue.message;
    controls.error.hidden = false;
    const control = find('[name="' + issue.field + '"]');
    if (control) {
      control.setAttribute('aria-invalid', 'true');
      control.setAttribute('aria-describedby', 'form-error');
      control.focus();
    }
  }

  function questionIssue(state) {
    const question = journey.current();
    const input = ['date', 'guests', 'place'].includes(question) ? form.elements.namedItem(question) : null;
    if (input && !input.validity.valid) {
      return {
        question, field: question,
        message: question === 'guests'
          ? 'Informe uma quantidade inteira entre 1 e 100.000, ou deixe em aberto.'
          : 'Confira a resposta ou deixe em aberto.'
      };
    }
    return validateQuestion(question, state);
  }

  function syncFields(state) {
    for (const name of Object.keys(state)) {
      if (['services', 'interests', 'request'].includes(name)) {
        all('input[name="' + name + '"]').forEach(input => {
          input.checked = Array.isArray(state[name]) ? state[name].includes(input.value) : state[name] === input.value;
        });
      } else {
        const input = form.elements.namedItem(name);
        if (input) input.value = state[name];
      }
    }
    find('[data-legacy-service]').hidden = !state.services.includes('coquetel');
    const choices = find('#service-choices');
    choices.hidden = false;
    choices.querySelector('legend').textContent = state.request === 'servicos'
      ? 'Quais serviços quer conhecer?' : 'Tem alguma preferência? (opcional)';
    find('#request-hint').textContent = state.request === 'completo'
      ? 'Sua preferência ajuda a preparar uma solução completa. Cardápio, equipe e estrutura serão combinados na conversa.'
      : 'Pode combinar mais de uma modalidade no mesmo evento.';
  }

  function renderHistory() {
    const state = store.get();
    const list = find('[data-chat-history-list]');
    list.replaceChildren();
    journey.visited().forEach(key => {
      const item = document.createElement('li');
      const label = document.createElement('span');
      const value = document.createElement('span');
      const edit = document.createElement('button');
      label.textContent = QUESTION_LABELS[key];
      value.textContent = answerLabel(key, state);
      edit.type = 'button';
      edit.textContent = 'Editar';
      edit.dataset.chatEdit = key;
      edit.setAttribute('aria-label', 'Editar ' + QUESTION_LABELS[key].toLowerCase());
      item.append(label, value, edit);
      list.append(item);
    });
    find('[data-chat-history-count]').textContent = String(journey.visited().length);
    find('[data-chat-history]').hidden = !journey.visited().length || editor.active();
    const lastKey = journey.visited().filter(key => key !== journey.current()).at(-1);
    const bubble = find('[data-chat-last]');
    bubble.hidden = !lastKey || journey.current() === 'review' || editor.active();
    if (lastKey) {
      bubble.querySelector('small').textContent = QUESTION_LABELS[lastKey] + ' · sua resposta';
      find('[data-chat-last-value]').textContent = answerLabel(lastKey, state);
    }
  }

  function render(focus = false, sync = true) {
    const state = viewState();
    journey.reconcile(state);
    const question = journey.current();
    const reviewing = question === 'review';
    const editing = editor.active();
    const path = questionPath(state);
    const position = path.indexOf(question);
    const total = path.length - 1;
    if (sync) syncFields(state);
    all('[data-question]').forEach(panel => panel.hidden = panel.dataset.question !== question);
    find('[data-chat-progress]').textContent = reviewing ? 'Confira antes de continuar'
      : editing ? 'Editar resposta' : 'Pergunta ' + (position + 1) + ' de ' + total;
    const progress = find('[data-chat-progress-bar]');
    progress.max = total;
    progress.value = reviewing ? total : Math.max(0, position);
    find('.chat-navigation').hidden = reviewing;
    find('[data-chat-edit-note]').hidden = !editing;
    controls.back.hidden = question === 'request' && !editing;
    controls.back.textContent = editing ? 'Cancelar edição' : '← Voltar';
    const optional = !['request', 'services', 'review'].includes(question)
      || question === 'services' && state.request !== 'servicos';
    controls.skip.hidden = editing || !optional || answerLabel(question, state) !== 'A definir';
    controls.skip.textContent = 'Pular por enquanto';
    controls.next.textContent = editing ? 'Salvar alterações →'
      : question === 'care' ? 'Revisar meu pedido →' : 'Continuar →';
    controls.useChoices.hidden = editing || question !== 'request' || !state.services.length || state.request !== 'servicos';
    controls.next.hidden = !controls.useChoices.hidden;
    controls.fast.hidden = editing || !['occasion', 'format', 'date', 'guests', 'place', 'care'].includes(question);
    find('[data-chat-existing]').hidden = editing || !state.services.length;
    find('[data-chat-existing-value]').textContent = state.services.map(id => SERVICES[id].name).join(', ');
    clearError();
    renderHistory();
    if (focus) {
      const panel = find('[data-question="' + question + '"]');
      const bubble = find('[data-chat-last]');
      const anchor = reviewing ? panel : bubble.hidden ? form : bubble;
      motion?.step(panel);
      panel.querySelector('h3').focus({ preventScroll: true });
      anchor.scrollIntoView({ block: 'start', behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth' });
    }
  }

  function beginEdit(question) {
    if (!Object.hasOwn(QUESTION_FIELDS, question)) return;
    editor.begin(question, store.get());
    journey.edit(question);
    render(true);
  }

  function requireValidOrder() {
    const issue = validateOrder(store.get());
    if (!issue) return true;
    beginEdit(issue.question);
    showError(issue);
    return false;
  }

  function submitQuestion() {
    const patch = readQuestion();
    const candidate = { ...viewState(), ...patch };
    const issue = questionIssue(candidate);
    if (issue) { showError(issue); return; }
    if (editor.active()) {
      editor.update(normalizeAnswers(patch));
      const orderIssue = validateOrder(editor.view(store.get()));
      if (orderIssue) {
        // Keep a request change uncommitted while asking for its required services.
        editor.move(orderIssue.question, store.get());
        journey.edit(orderIssue.question);
        render(true);
        showError(orderIssue);
        return;
      }
      const changes = normalizeAnswers(editor.patch());
      editor.clear();
      journey.review();
      store.update(changes, 'edit');
    } else {
      store.update(normalizeAnswers(patch), 'form');
      journey.next(store.get());
    }
    render(true);
  }

  function handleAnswer(event) {
    if (!event.target.name || journey.current() === 'review') return;
    if (!QUESTION_FIELDS[journey.current()].includes(event.target.name)) return;
    clearError();
    const patch = readQuestion();
    if (editor.active()) {
      editor.update(patch);
      render(false, false);
    } else {
      // Invalid raw input cannot erase the last valid canonical answer.
      const issue = questionIssue({ ...store.get(), ...patch });
      if (!issue || journey.current() === 'services') store.update(normalizeAnswers(patch), 'typing');
      else render(false, false);
    }
  }

  form.addEventListener('submit', event => { event.preventDefault(); submitQuestion(); });
  form.addEventListener('input', event => {
    if (['date', 'guests', 'place', 'note'].includes(event.target.name)) handleAnswer(event);
  });
  form.addEventListener('change', event => {
    if (['checkbox', 'radio', 'select-one'].includes(event.target.type)) handleAnswer(event);
  });
  form.addEventListener('click', event => {
    const edit = event.target.closest('[data-chat-edit]');
    if (edit) beginEdit(edit.dataset.chatEdit);
  });
  controls.back.addEventListener('click', () => {
    if (editor.active()) { editor.clear(); journey.review(); }
    else journey.back(store.get());
    render(true);
  });
  controls.skip.addEventListener('click', () => { journey.next(store.get()); render(true); });
  controls.fast.addEventListener('click', () => {
    if (requireValidOrder()) { journey.skipDetails(); render(true); }
  });
  controls.useChoices.addEventListener('click', () => { journey.useChoices(); render(true); });
  restoreSession();
  render();
  if (store.restored) find('#draft-restored').hidden = false;

  return {
    sync(state, source) {
      if (source === 'reset') { editor.clear(); journey.reset(); find('#draft-restored').hidden = true; }
      render(false, source !== 'typing');
    },
    restoreProgress(renderNow = true) { restoreSession(true); if (renderNow) render(); },
    showReview(focus = false) { editor.clear(); journey.review(); render(focus); },
    ensureReady() {
      if (editor.active()) { render(true); return false; }
      return requireValidOrder();
    }
  };
}
