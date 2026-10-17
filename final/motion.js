export function setupMotion(){
  const reduced=matchMedia('(prefers-reduced-motion: reduce)'),running=new Map();
  function play(node,frames,options={}){
    if(!node||reduced.matches||typeof node.animate!=='function')return;
    running.get(node)?.cancel();
    const animation=node.animate(frames,{duration:520,easing:'cubic-bezier(.22,1,.36,1)',...options});
    running.set(node,animation);
    const clear=()=>{if(running.get(node)===animation)running.delete(node);};
    animation.finished.then(clear,clear);return animation;
  }
  reduced.addEventListener('change',()=>{if(reduced.matches){running.forEach(animation=>animation.cancel());running.clear();}});
  const rise=[{opacity:.45,transform:'translateY(16px)'},{opacity:1,transform:'none'}];
  document.querySelectorAll('.hero-copy>.eyebrow,.hero-copy>h1,.hero-copy>.lead,.hero-actions,.hero-note,.hero-photos>figure,.detail-hero>div,.detail-hero>img').forEach((node,index)=>{
    if(node.getBoundingClientRect().top>=innerHeight)return;
    const frames=node.matches('h1')?[{transform:'translateY(12px)'},{transform:'none'}]:rise;
    play(node,frames,{duration:760,delay:Math.min(index,5)*60});
  });
  if('IntersectionObserver'in window){
    const observer=new IntersectionObserver(entries=>{
      entries.filter(entry=>entry.isIntersecting).forEach((entry,index)=>{
        observer.unobserve(entry.target);
        if(!entry.target.contains(document.activeElement))play(entry.target,rise,{duration:650,delay:Math.min(index,3)*65});
      });
    },{threshold:.12,rootMargin:'0px 0px -24px 0px'});
    document.querySelectorAll('.visit-main .section-head,.steps>li,.gallery-grid>li,.social-grid>button,.related-grid>a,.menu-columns>div,.confirm-list').forEach(node=>observer.observe(node));
  }
  let suggestionKey;
  document.querySelectorAll('#duvidas details').forEach(details=>details.addEventListener('toggle',()=>{
    if(details.open)play(details.querySelector('p'),[{opacity:.45,transform:'translateY(-5px)'},{opacity:1,transform:'none'}],{duration:300});
  }));
  return {
    step(panel){play(panel,[{opacity:.6,transform:'translateX(9px)'},{opacity:1,transform:'none'}],{duration:320});},
    dialog(dialog){play(dialog,[{opacity:.6,transform:'translateY(8px) scale(.99)'},{opacity:1,transform:'none'}],{duration:240});},
    suggestion(key){
      const changed=suggestionKey!==undefined&&suggestionKey!==key;suggestionKey=key;if(!changed)return;
      play(document.querySelector('#suggestion-title')?.parentElement,rise,{duration:380});
      const image=document.querySelector('#suggestion-photo');
      image?.decode().then(()=>{if(suggestionKey===key)play(image,[{opacity:.35,transform:'scale(1.025)'},{opacity:1,transform:'none'}],{duration:500});}).catch(()=>{});
    },
    captureGallery(){return new Map([...document.querySelectorAll('.gallery-grid>li:not([hidden])')].map(node=>[node,node.getBoundingClientRect()]));},
    gallery(before){
      document.querySelectorAll('.gallery-grid>li:not([hidden])').forEach((node,index)=>{
        const old=before.get(node),next=node.getBoundingClientRect();
        const from=old?{transform:`translate(${old.left-next.left}px,${old.top-next.top}px)`}:{opacity:.25,transform:'scale(.97)'};
        play(node,[from,{opacity:1,transform:'none'}],{duration:440,delay:Math.min(index,3)*35});
      });
    }
  };
}
