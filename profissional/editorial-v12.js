(() => {
  if(matchMedia('(prefers-reduced-motion: reduce)').matches)return;
  const hero=document.querySelector('.hero');
  if(hero){
    const enter=(element,delay=0)=>element?.animate([{opacity:0,transform:'translateY(12px)'},{opacity:1,transform:'translateY(0)'}],{duration:650,delay,easing:'cubic-bezier(.22,1,.36,1)',fill:'backwards'});
    enter(hero.querySelector('.hero-copy'));
    hero.querySelectorAll('.hero-photo').forEach((photo,index)=>enter(photo,90+index*110));
  }
})();
