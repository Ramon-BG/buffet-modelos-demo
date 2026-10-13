(() => {
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const contact = document.querySelector('.floating-wa');
  const shortlist = document.querySelector('#open-shortlist');
  const count = document.querySelector('#saved-count');
  const gallery = document.querySelector('.gallery-grid');
  const navLinks = [...document.querySelectorAll('.header nav a[href^="#"]')];
  const sections = [...document.querySelectorAll('main section[id]')];
  const syncShortlist = () => shortlist.classList.toggle('empty', Number(count.textContent) === 0);
  new MutationObserver(syncShortlist).observe(count, {childList:true,subtree:true,characterData:true});
  syncShortlist();
  // As escolhas ficam acessíveis no formulário durante o preenchimento.
  const occupied = new Map();
  const quietSections = ['inicio','descobrir','orcamento'];
  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => occupied.set(entry.target.id,entry.isIntersecting));
      contact.classList.toggle('context-hidden',[...occupied.values()].some(Boolean));
      shortlist.classList.toggle('context-hidden',occupied.get('orcamento') === true);
    }, {rootMargin:'-100px 0px -80px 0px'});
    quietSections.forEach(id=>observer.observe(document.getElementById(id)));
  }
  let scheduled = false;
  function updateNavigation() {
    scheduled = false;
    const active = sections.filter(section=>section.getBoundingClientRect().top<=160).at(-1);
    const id = active?.id === 'descobrir' ? 'sabores' : active?.id;
    navLinks.forEach(link=>{
      if(link.hash === '#'+id) link.setAttribute('aria-current','location');
      else link.removeAttribute('aria-current');
    });
  }
  addEventListener('scroll',()=>{if(!scheduled){scheduled=true;requestAnimationFrame(updateNavigation);}}, {passive:true});
  updateNavigation();
  document.querySelectorAll('.gallery-filters button').forEach(button=>button.addEventListener('click',()=>{
    gallery.classList.toggle('filtered',button.dataset.filter!=='all');
    if(!reduced.matches) gallery.animate([{opacity:.5,transform:'translateY(6px)'},{opacity:1,transform:'none'}],{duration:220,easing:'ease-out'});
  }));
  document.querySelectorAll('[name="mood"]').forEach(input=>input.addEventListener('change',()=>{
    if(!reduced.matches) document.querySelector('.planner-recommendation').animate([{opacity:.65},{opacity:1}],{duration:230,easing:'ease-out'});
  }));
  // A sugestão tem uma continuação explícita, além do aviso de inclusão.
  const use = document.querySelector('#planner-use');
  const continuation = document.createElement('a');
  continuation.href='#orcamento';continuation.textContent='Continuar meu pedido →';
  continuation.className='text-link planner-continue';continuation.hidden=true;
  use.insertAdjacentElement('afterend',continuation);
  use.addEventListener('click',()=>continuation.hidden=false);
  document.querySelectorAll('[name="mood"]').forEach(input=>input.addEventListener('change',()=>continuation.hidden=true));
})();
