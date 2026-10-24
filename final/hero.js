// Presentation only: changing a photograph never updates the event draft.
export function setupHero(root){
  if(!root)return null;
  const slides=[...root.querySelectorAll('[data-hero-slide]')];
  const buttons=[...root.querySelectorAll('[data-hero-select]')];
  const pause=root.querySelector('[data-hero-pause]'),status=root.querySelector('[data-hero-status]');
  const reduced=matchMedia('(prefers-reduced-motion: reduce)');
  let index=0,playing=!reduced.matches,inView=!('IntersectionObserver'in window),hovered=false,focused=false,timer,revision=0;
  function schedule(){
    clearTimeout(timer);
    pause.hidden=reduced.matches;pause.textContent=playing?'Pausar':'Retomar';pause.setAttribute('aria-pressed',String(!playing));
    if(playing&&inView&&!hovered&&!focused&&!document.hidden&&!reduced.matches)timer=setTimeout(()=>select((index+1)%slides.length,false),7000);
  }
  async function select(next,manual=true){
    if(!Number.isInteger(next)||next<0||next>=slides.length)return;
    if(manual)playing=false;
    const token=++revision,image=slides[next].querySelector('img');
    try{await image?.decode();}catch{}
    if(token!==revision)return;
    // Wait until an image has loaded; a failed slide must not replace the current one.
    if(image?.complete&&image.naturalWidth===0){if(manual)status.textContent='Esta imagem não carregou. Escolha outra opção.';schedule();return;}
    index=next;
    slides.forEach((slide,n)=>{slide.classList.toggle('is-active',n===index);slide.setAttribute('aria-hidden',String(n!==index));});
    buttons.forEach((button,n)=>button.setAttribute('aria-pressed',String(n===index)));
    if(manual)status.textContent=slides[index].dataset.title+' · imagem '+(index+1)+' de '+slides.length+'. Troca automática pausada.';
    schedule();
  }
  buttons.forEach((button,n)=>button.addEventListener('click',()=>select(n)));
  pause.addEventListener('click',()=>{playing=!playing;revision++;schedule();});
  const hoverTarget=root.querySelector('.hero-controls')||root;
  hoverTarget.addEventListener('pointerenter',event=>{if(event.pointerType!=='touch'){hovered=true;schedule();}});
  hoverTarget.addEventListener('pointerleave',()=>{hovered=false;schedule();});
  root.addEventListener('focusin',()=>{focused=true;schedule();});
  root.addEventListener('focusout',()=>queueMicrotask(()=>{focused=root.contains(document.activeElement);schedule();}));
  root.addEventListener('keydown',event=>{
    if(!event.target.closest('.hero-controls'))return;
    if(!['ArrowLeft','ArrowRight','Home','End'].includes(event.key))return;
    event.preventDefault();const next=event.key==='Home'?0:event.key==='End'?slides.length-1:(index+(event.key==='ArrowRight'?1:slides.length-1))%slides.length;
    select(next).then(()=>buttons[index].focus());
  });
  let point;
  const stage=root.querySelector('.hero-stage');
  stage.querySelectorAll('img').forEach(image=>image.draggable=false);
  root.addEventListener('pointerdown',event=>{point=event.target.closest('a,button')?null:{x:event.clientX,y:event.clientY};});
  root.addEventListener('pointercancel',()=>point=null);
  root.addEventListener('pointerup',event=>{if(!point)return;const dx=event.clientX-point.x,dy=event.clientY-point.y;point=null;if(Math.abs(dx)>55&&Math.abs(dx)>Math.abs(dy)*1.4)select((index+(dx<0?1:slides.length-1))%slides.length);});
  document.addEventListener('visibilitychange',schedule);
  reduced.addEventListener('change',()=>{if(reduced.matches){playing=false;revision++;}schedule();});
  if('IntersectionObserver'in window)new IntersectionObserver(entries=>{inView=entries[0].isIntersecting;schedule();},{threshold:.2}).observe(root);
  schedule();return {select,current:()=>index,isPlaying:()=>playing};
}
