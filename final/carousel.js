import {SERVICES} from './data.js?v=14';
export function setupCarousel(root,onView){
  if(!root)return null;
  const keys=Object.keys(SERVICES),tabs=[...root.querySelectorAll('[role="tab"]')],photo=root.querySelector('[data-service-photo]'),visual=photo.parentElement,content=root.querySelector('[data-service-content]'),toggle=root.querySelector('[data-carousel-toggle]');
  const reduced=matchMedia('(prefers-reduced-motion: reduce)');let key=keys[0],playing=!reduced.matches,inView=false,timer,revision=0,layer,animations=[];
  function clear(){animations.forEach(a=>a.cancel());animations=[];layer?.remove();layer=null;}
  function updateTimer(){
    clearInterval(timer);
    toggle.textContent=playing?'Pausar troca automática':'Retomar troca automática';
    toggle.setAttribute('aria-pressed',String(!playing));
    const focused=root.contains(document.activeElement)&&document.activeElement!==toggle;
    if(playing&&inView&&!document.hidden&&!root.matches(':hover')&&!focused)timer=setInterval(()=>select(keys[(keys.indexOf(key)+1)%keys.length],false),8000);
  }
  function select(next,manual=true,focus=false){
    if(!SERVICES[next])return;
    if(manual){playing=false;updateTimer();}
    if(next===key){if(focus)tabs[keys.indexOf(next)].focus();return;}
    const old=key,ghost=(layer&&!photo.complete?layer:photo).cloneNode();const token=++revision;clear();key=next;
    const data=SERVICES[key];tabs.forEach(t=>{const on=t.dataset.serviceTab===key;t.setAttribute('aria-selected',String(on));t.tabIndex=on?0:-1;});
    root.querySelector('[role="tabpanel"]').setAttribute('aria-labelledby','tab-'+key);
    root.querySelector('[data-service-title]').textContent=data.title;root.querySelector('[data-service-description]').textContent=data.description;root.querySelector('[data-service-kicker]').textContent=data.kicker;root.querySelector('[data-service-check]').textContent=data.check;
    root.querySelector('[data-service-detail]').href=key+'.html';
    photo.src='assets/'+data.image+'-960.webp';photo.alt=data.name+' — imagem ilustrativa';
    onView(key);if(focus)tabs[keys.indexOf(key)].focus();
    if(reduced.matches)return;
    ghost.removeAttribute('id');ghost.removeAttribute('data-service-photo');ghost.removeAttribute('srcset');ghost.alt='';ghost.setAttribute('aria-hidden','true');ghost.className='slide-out';layer=ghost;visual.append(ghost);
    let delta=keys.indexOf(next)-keys.indexOf(old);if(Math.abs(delta)>keys.length/2)delta=-delta;const direction=delta>=0?1:-1;
    photo.decode().then(()=>{
      if(token!==revision)return;if(reduced.matches){clear();return;}
      const options={duration:650,easing:'cubic-bezier(.33,1,.68,1)'};
      const a=photo.animate([{transform:`translateX(${direction*100}%)`},{transform:'translateX(0)'}],options),b=ghost.animate([{transform:'translateX(0)'},{transform:`translateX(${-direction*100}%)`}],options);
      animations=[a,b];content.animate([{opacity:.75,transform:'translateY(6px)'},{opacity:1,transform:'none'}],{duration:350,easing:'ease-out'});
      b.finished.then(()=>{if(token===revision)clear();}).catch(()=>{});
    }).catch(()=>{if(token===revision)clear();});
  }
  tabs.forEach((tab,index)=>{tab.addEventListener('click',()=>select(tab.dataset.serviceTab));tab.addEventListener('keydown',event=>{let next;if(event.key==='ArrowRight')next=(index+1)%keys.length;if(event.key==='ArrowLeft')next=(index+keys.length-1)%keys.length;if(event.key==='Home')next=0;if(event.key==='End')next=keys.length-1;if(next!==undefined){event.preventDefault();select(keys[next],true,true);}});});
  toggle.addEventListener('click',()=>{playing=!playing;updateTimer();});
  root.addEventListener('pointerenter',()=>clearInterval(timer));root.addEventListener('pointerleave',updateTimer);root.addEventListener('focusin',()=>clearInterval(timer));root.addEventListener('focusout',()=>queueMicrotask(updateTimer));document.addEventListener('visibilitychange',updateTimer);
  reduced.addEventListener('change',()=>{if(reduced.matches){playing=false;revision++;clear();}updateTimer();});
  if('IntersectionObserver'in window)new IntersectionObserver(entries=>{inView=entries[0].isIntersecting;updateTimer();},{threshold:.25}).observe(root);
  let point;photo.draggable=false;visual.addEventListener('pointerdown',event=>{point={x:event.clientX,y:event.clientY};});visual.addEventListener('pointercancel',()=>point=null);visual.addEventListener('pointerup',event=>{if(!point)return;const dx=event.clientX-point.x,dy=event.clientY-point.y;point=null;if(Math.abs(dx)>55&&Math.abs(dx)>Math.abs(dy)*1.4)select(keys[(keys.indexOf(key)+(dx<0?1:keys.length-1))%keys.length]);});
  updateTimer();onView(key);return {select,current:()=>key};
}
