import {describeChange} from './companion.js?v=14';

// The form has its own summary access. Floating paper never covers its controls.
export function setupOrderContext({companion, store}) {
  const section = document.querySelector('#pedido');
  if (!section || !companion) return;
  const status = document.querySelector('[data-order-feedback]');
  let active = false;
  let previous = store.get();
  function check() {
    const bounds = section.getBoundingClientRect();
    const header = document.querySelector('.site-header')?.getBoundingClientRect().height || 80;
    active = bounds.top < innerHeight * .75 && bounds.bottom > header + 20;
    companion.setContext(active);
  }
  if ('IntersectionObserver' in window) {
    new IntersectionObserver(check, {rootMargin: '-80px 0px -25% 0px', threshold: 0}).observe(section);
  } else {
    let frame;
    window.addEventListener('scroll', () => {
      if (frame) return;
      frame = requestAnimationFrame(() => { frame = null; check(); });
    }, {passive: true});
  }
  window.addEventListener('resize', check);
  window.addEventListener('pageshow', check);
  section.addEventListener('focusin', check);
  store.subscribe((state, source) => {
    const message = describeChange(previous, state, source);
    previous = state;
    if (active && status && source !== 'typing' && message) status.textContent = message;
  });
  check();
}
