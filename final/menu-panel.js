import {SERVICES} from './data.js?v=12';

// Progressive enhancement: regular catalogue links remain usable without this panel.
export function setupMenuPanel({store, root = document}) {
  if (root.body.dataset.page !== 'home') return null;
  const keys = Object.keys(SERVICES);
  const dialog = root.createElement('dialog');
  dialog.id = 'menu-panel';
  dialog.className = 'menu-panel';
  dialog.setAttribute('aria-labelledby', 'menu-panel-title');
  dialog.innerHTML = `
    <header class="menu-panel-top">
      <p>À mesa com <strong>Mesa Viva</strong></p>
      <button type="button" class="menu-panel-close" data-menu-close aria-label="Fechar cardápios">Fechar <span aria-hidden="true">×</span></button>
    </header>
    <nav class="menu-panel-nav" aria-label="Escolher um cardápio"></nav>
    <label class="menu-panel-select">Escolha um cardápio<select data-menu-select></select></label>
    <div class="menu-panel-body" data-menu-content>
      <figure class="menu-panel-photo" hidden><img width="640" height="720" alt=""><figcaption>Fotografia ilustrativa</figcaption></figure>
      <div class="menu-panel-copy">
        <p class="eyebrow" data-menu-kicker></p>
        <h2 id="menu-panel-title" tabindex="-1"></h2>
        <p class="menu-panel-description" data-menu-description></p>
        <div class="menu-panel-groups" data-menu-groups></div>
        <p class="menu-panel-note">Cardápio de exemplo. Sabores, quantidades e restrições alimentares serão combinados na conversa.</p>
      </div>
    </div>
    <footer class="menu-panel-footer">
      <div class="menu-panel-order"><span data-menu-count></span><p role="status" aria-live="polite" aria-atomic="true" data-menu-status>Pode combinar mais de uma modalidade.</p></div>
      <button class="button" type="button" data-menu-add></button>
      <button class="text-button menu-panel-done" type="button" data-menu-close>Concluir escolhas</button>
    </footer>`;
  root.body.append(dialog);
  const find = selector => dialog.querySelector(selector);
  const nav = find('.menu-panel-nav');
  const select = find('[data-menu-select]');
  const content = find('[data-menu-content]');
  const title = find('#menu-panel-title');
  const add = find('[data-menu-add]');
  const status = find('[data-menu-status]');
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const mobile = matchMedia('(max-width:760px)');
  let current = keys[0];
  let opener;
  let scrollPosition;
  let closing = false;
  let animation;

  function node(tag, text, className) {
    const item = root.createElement(tag);
    if (text !== undefined) item.textContent = text;
    if (className) item.className = className;
    return item;
  }

  for (const key of keys) {
    const button = node('button', SERVICES[key].name);
    button.type = 'button';
    button.dataset.menuChoice = key;
    button.addEventListener('click', () => showService(key));
    nav.append(button);
    const option = node('option', SERVICES[key].name);
    option.value = key;
    select.append(option);
  }

  function renderSelection(state) {
    const selected = state.services.includes(current);
    add.textContent = selected ? 'Remover do meu evento' : 'Adicionar ao meu evento +';
    add.classList.toggle('is-selected', selected);
    add.setAttribute('aria-pressed', String(selected));
    add.setAttribute('aria-label', (selected ? 'Remover do meu evento: ' : 'Adicionar ao meu evento: ') + SERVICES[current].name);
    find('[data-menu-count]').textContent = state.services.length
      ? state.services.length + (state.services.length === 1 ? ' serviço na sua notinha' : ' serviços na sua notinha')
      : 'Seu evento, do seu jeito';
    for (const button of nav.children) {
      const key = button.dataset.menuChoice;
      button.setAttribute('aria-pressed', String(key === current));
      button.classList.toggle('has-selection', state.services.includes(key));
      button.setAttribute('aria-label', SERVICES[key].name + (state.services.includes(key) ? ', adicionado ao evento' : ''));
    }
    // Status also appears on the three previews after closing the panel.
    root.querySelectorAll('[data-menu-preview]').forEach(link => {
      const selected = state.services.includes(link.dataset.menuPreview);
      link.classList.toggle('is-selected', selected);
      link.querySelector('[data-menu-preview-action]').textContent = selected ? 'No meu evento · Ver cardápio' : 'Ver cardápio';
    });
  }

  function showService(key) {
    if (!keys.includes(key)) return;
    current = key;
    const service = SERVICES[key];
    title.textContent = service.name;
    find('[data-menu-kicker]').textContent = service.kicker;
    find('[data-menu-description]').textContent = service.description;
    const groups = service.menu.map(([heading, ...items]) => {
      const group = node('section');
      const list = node('ul');
      list.append(...items.map(item => node('li', item)));
      group.append(node('h3', heading), list);
      return group;
    });
    find('[data-menu-groups]').replaceChildren(...groups);
    const photo = find('.menu-panel-photo');
    const image = photo.querySelector('img');
    photo.hidden = !service.image;
    content.classList.toggle('has-photo', Boolean(service.image));
    if (service.image) image.src = 'assets/' + service.image + '-960.webp';
    else image.removeAttribute('src');
    select.value = key;
    status.textContent = store.get().services.includes(key)
      ? service.name + ' já está no seu evento.'
      : 'Pode combinar mais de uma modalidade.';
    renderSelection(store.get());
    content.scrollTop = 0;
  }

  function play(frames, duration) {
    animation?.cancel();
    if (reduced.matches || typeof dialog.animate !== 'function') return null;
    animation = dialog.animate(frames, {duration, easing: 'cubic-bezier(.22,1,.36,1)'});
    return animation;
  }

  function open(trigger, key) {
    if (dialog.open) return;
    opener = trigger;
    scrollPosition = {left: window.scrollX, top: window.scrollY};
    showService(key);
    closing = false;
    root.documentElement.classList.add('dialog-open');
    dialog.showModal();
    play([{opacity: 0, transform: mobile.matches ? 'translateY(48px)' : 'translateY(16px) scale(.985)'}, {opacity: 1, transform: 'none'}], 280);
    title.focus({preventScroll: true});
  }

  async function close() {
    if (!dialog.open || closing) return;
    closing = true;
    const exit = play([{opacity: 1, transform: 'none'}, {opacity: 0, transform: mobile.matches ? 'translateY(48px)' : 'translateY(12px) scale(.99)'}], 170);
    if (exit) await exit.finished.catch(() => {});
    dialog.close();
  }

  dialog.querySelectorAll('[data-menu-close]').forEach(button => button.addEventListener('click', close));
  dialog.addEventListener('keydown', event => {
    if (event.key !== 'Tab') return;
    const controls = [...dialog.querySelectorAll('button, select, a[href], input, textarea, [tabindex="0"]')]
      .filter(control => !control.disabled && control.getClientRects().length);
    const first = controls[0];
    const last = controls.at(-1);
    if (event.shiftKey && (root.activeElement === first || root.activeElement === title)) {
      event.preventDefault();
      last?.focus({preventScroll: true});
    } else if (!event.shiftKey && root.activeElement === last) {
      event.preventDefault();
      first?.focus({preventScroll: true});
    }
  });
  dialog.addEventListener('cancel', event => { event.preventDefault(); close(); });
  let backdropStart = false;
  function isBackdrop(event) {
    if (event.target !== dialog) return false;
    const rect = dialog.getBoundingClientRect();
    return event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom;
  }
  dialog.addEventListener('pointerdown', event => { backdropStart = isBackdrop(event); });
  dialog.addEventListener('click', event => { if (backdropStart && isBackdrop(event)) close(); backdropStart = false; });
  dialog.addEventListener('close', () => {
    animation?.cancel();
    closing = false;
    if (!root.querySelector('dialog[open]')) root.documentElement.classList.remove('dialog-open');
    opener?.focus({preventScroll: true});
    if (scrollPosition && (Math.abs(window.scrollY - scrollPosition.top) > 1 || Math.abs(window.scrollX - scrollPosition.left) > 1)) {
      window.scrollTo({...scrollPosition, behavior: 'instant'});
    }
  });
  reduced.addEventListener('change', () => { if (reduced.matches) animation?.cancel(); });
  select.addEventListener('change', () => showService(select.value));
  add.addEventListener('click', () => {
    const selected = store.get().services.includes(current);
    if (selected) store.remove(current);
    else store.add([current], 'menu-panel');
    status.textContent = (selected ? 'Removido do evento: ' : 'Adicionado ao evento: ') + SERVICES[current].name + '.';
  });

  const triggers = root.querySelectorAll('a[href^="cardapios.html"]');
  triggers.forEach(link => {
    link.setAttribute('aria-haspopup', 'dialog');
    link.setAttribute('aria-controls', dialog.id);
    link.addEventListener('click', event => {
      if (event.button !== 0 || event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
      event.preventDefault();
      const linked = link.hash.replace('#servico-', '');
      open(link, keys.includes(linked) ? linked : current);
    });
  });
  store.subscribe(renderSelection);
  showService(current);
  return {open, close};
}
