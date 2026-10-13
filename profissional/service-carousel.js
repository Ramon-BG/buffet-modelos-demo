(() => {
  const panel = document.querySelector('#flavor-panel');
  if (!panel || !flavorButtons.length) return;
  const previous = document.querySelector('#service-previous');
  const next = document.querySelector('#service-next');
  const position = document.querySelector('#service-position');
  const originalSelect = selectFlavor;
  let direction = 1;
  const hoverPointer = window.matchMedia('(hover: hover) and (pointer: fine)');
  let hoverTimer;
  function cancelHover() { clearTimeout(hoverTimer); }
  flavorButtons.forEach(button => {
    button.addEventListener('pointerenter', event => {
      cancelHover();
      if (event.pointerType !== 'mouse' || !hoverPointer.matches || button.dataset.flavor === selectedFlavor) return;
      hoverTimer = setTimeout(() => {
        if (!hoverPointer.matches) return;
        const current = flavorButtons.findIndex(item => item.dataset.flavor === selectedFlavor);
        direction = flavorButtons.indexOf(button) > current ? 1 : -1;
        // Usa o mesmo caminho do clique para sincronizar foto, detalhes e preferências.
        button.click();
      }, 180);
    });
    ['pointerleave', 'pointerdown', 'keydown', 'click'].forEach(type => button.addEventListener(type, cancelHover));
  });
  hoverPointer.addEventListener('change', cancelHover);
  function updatePosition() {
    const index = flavorButtons.findIndex(button => button.dataset.flavor === selectedFlavor);
    position.textContent = `${String(index + 1).padStart(2, '0')} / ${String(flavorButtons.length).padStart(2, '0')} · ${flavors[selectedFlavor].service}`;
    previous.setAttribute('aria-label', `Ver ${flavors[flavorButtons[(index + flavorButtons.length - 1) % flavorButtons.length].dataset.flavor].service}`);
    next.setAttribute('aria-label', `Ver ${flavors[flavorButtons[(index + 1) % flavorButtons.length].dataset.flavor].service}`);
  }
  selectFlavor = function(button, focus = false) {
    originalSelect(button, focus);
    updatePosition();
    refreshMessage();
    if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      panel.animate([{opacity:.65, transform:`translateX(${direction * 10}px)`}, {opacity:1, transform:'translateX(0)'}], {duration:180, easing:'ease-out'});
    }
  };
  function move(offset) {
    cancelHover();
    const current = flavorButtons.findIndex(button => button.dataset.flavor === selectedFlavor);
    direction = offset;
    flavorButtons[(current + offset + flavorButtons.length) % flavorButtons.length].click();
  }
  previous.addEventListener('click', () => move(-1));
  next.addEventListener('click', () => move(1));
  panel.addEventListener('keydown', event => {
    if (event.target !== panel) return;
    if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
      event.preventDefault(); move(event.key === 'ArrowLeft' ? -1 : 1);
    }
  });
  const visual = panel.querySelector('.flavor-visual');
  let pointer;
  visual.addEventListener('pointerdown', event => {
    pointer = {x:event.clientX, y:event.clientY};
    visual.setPointerCapture(event.pointerId);
  });
  visual.addEventListener('pointercancel', () => pointer = null);
  visual.addEventListener('pointerup', event => {
    if (!pointer) return;
    const dx = event.clientX - pointer.x, dy = event.clientY - pointer.y;
    pointer = null;
    if (Math.abs(dx) > 55 && Math.abs(dx) > Math.abs(dy) * 1.4) move(dx < 0 ? 1 : -1);
  });
  panel.querySelector('img').draggable = false;
  if ('IntersectionObserver' in window) {
    const contact = document.querySelector('.floating-wa');
    new IntersectionObserver(entries => {
      contact?.classList.toggle('carousel-active', entries[0].isIntersecting);
    }).observe(document.querySelector('#sabores'));
  }
  updatePosition();
})();
