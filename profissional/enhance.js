const reducedMotion=window.matchMedia('(prefers-reduced-motion: reduce)').matches;
if('IntersectionObserver' in window && !reducedMotion){
  document.body.classList.add('motion-ready');
  const revealObserver=new IntersectionObserver(entries=>entries.forEach(entry=>{if(entry.isIntersecting){entry.target.classList.add('visible');revealObserver.unobserve(entry.target);}}),{threshold:.06});
  document.querySelectorAll('.section,.hosting,.occasion-bar').forEach(el=>{el.classList.add('reveal');revealObserver.observe(el);});
}
const sectionLinks=[...document.querySelectorAll('#navegacao a')];
if('IntersectionObserver' in window){const sectionObserver=new IntersectionObserver(entries=>{for(const entry of entries)if(entry.isIntersecting){sectionLinks.forEach(link=>{if(link.hash==='#'+entry.target.id)link.setAttribute('aria-current','location');else link.removeAttribute('aria-current');});}},{rootMargin:'-20% 0px -50% 0px'});document.querySelectorAll('main section[id]').forEach(el=>sectionObserver.observe(el));}
if(!reducedMotion){
  document.querySelector('#flavor-photo')?.addEventListener('load',event=>event.target.animate([{opacity:.45},{opacity:1}],{duration:220}));
  document.querySelectorAll('#form-next,#form-back').forEach(button=>button.addEventListener('click',()=>document.querySelector('.form-stage:not([hidden])')?.animate([{opacity:0,transform:'translateY(6px)'},{opacity:1,transform:'translateY(0)'}],{duration:200})));
}
let galleryTouch;
const galleryDialog=document.querySelector('#photo-dialog');
galleryDialog?.addEventListener('touchstart',event=>{galleryTouch={x:event.changedTouches[0].clientX,y:event.changedTouches[0].clientY};},{passive:true});
galleryDialog?.addEventListener('touchend',event=>{if(!galleryTouch)return;const dx=event.changedTouches[0].clientX-galleryTouch.x,dy=event.changedTouches[0].clientY-galleryTouch.y;if(Math.abs(dx)>60&&Math.abs(dx)>Math.abs(dy)*1.5)displayPhoto(photoIndex+(dx<0?1:-1));galleryTouch=null;},{passive:true});
if(document.body.classList.contains('profissional')){
  const suggestions={circulando:{key:'coquetel',text:'Explore coquetel e pergunte sobre o atendimento para convidados circulando.'},mesa:{key:'massas',text:'Explore massas como ponto de partida para uma refeição à mesa.'},informal:{key:'churrasco',text:'Explore churrasco e converse sobre o espaço e a estrutura necessários.'}};
  let suggestionKey='coquetel';
  document.querySelectorAll('[name="mood"]').forEach(input=>input.addEventListener('change',()=>{const suggestion=suggestions[input.value];suggestionKey=suggestion.key;document.querySelector('#finder-service').textContent=flavors[suggestionKey].service;document.querySelector('#finder-text').textContent=suggestion.text;document.querySelector('#finder-cta').textContent=`Explorar ${flavors[suggestionKey].service.toLowerCase()} ↗`;}));
  document.querySelector('#finder-cta').addEventListener('click',()=>selectFlavor(flavorButtons.find(button=>button.dataset.flavor===suggestionKey)));
  const details={crepe:'crepes',massas:'massas',churrasco:'churrasco',coquetel:'coquetel'};
  let savedServices=[];
  try{const saved=JSON.parse(sessionStorage.getItem('buffet-demo-services')||'[]');if(Array.isArray(saved))savedServices=saved.filter(value=>Object.hasOwn(flavors,value));}catch{}
  const savedDialog=document.querySelector('#shortlist-dialog');
  function refreshSaved(){
    document.querySelector('#saved-count').textContent=savedServices.length;
    const savedButton=document.querySelector('#save-service');savedButton.textContent=savedServices.includes(selectedFlavor)?'♥ Serviço guardado':'♡ Guardar este serviço';
    document.querySelector('#service-detail-link').href=details[selectedFlavor]+'.html';
    const container=document.querySelector('#shortlist-items');container.replaceChildren();
    if(!savedServices.length){const p=document.createElement('p');p.textContent='Explore os serviços e guarde os que quiser levar para a conversa.';container.append(p);}
    else{const list=document.createElement('ul');savedServices.forEach(key=>{const li=document.createElement('li'),name=document.createElement('span'),remove=document.createElement('button');name.textContent=flavors[key].service;remove.type='button';remove.textContent='Remover';remove.setAttribute('aria-label',`Remover ${flavors[key].service}`);remove.addEventListener('click',()=>{savedServices=savedServices.filter(value=>value!==key);if(form.querySelector('[name="service"]').value===flavors[key].service)form.querySelector('[name="service"]').value='';refreshSaved();});li.append(name,remove);list.append(li);});container.append(list);}
    document.querySelector('#shortlist-download').disabled=!savedServices.length;
    const text='Olá! Gostaria de conversar sobre estes serviços: '+savedServices.map(key=>flavors[key].service).join(', ')+'.';
    document.querySelector('#shortlist-whatsapp').href='#orcamento';
    const chosen=document.querySelector('#chosen-services'),chosenList=document.querySelector('#chosen-list');chosen.hidden=!savedServices.length;chosenList.replaceChildren();savedServices.forEach(key=>{const li=document.createElement('li'),span=document.createElement('span'),button=document.createElement('button');span.textContent=flavors[key].service;button.type='button';button.textContent='Remover';button.setAttribute('aria-label','Remover '+flavors[key].service+' do pedido');button.addEventListener('click',()=>{savedServices=savedServices.filter(value=>value!==key);if(form.querySelector('[name="service"]').value===flavors[key].service)form.querySelector('[name="service"]').value='';refreshSaved();});li.append(span,button);chosenList.append(li);});refreshMessage();
    try{sessionStorage.setItem('buffet-demo-services',JSON.stringify(savedServices));}catch{}
  }
  document.querySelector('#save-service').addEventListener('click',()=>{if(savedServices.includes(selectedFlavor))savedServices=savedServices.filter(key=>key!==selectedFlavor);else savedServices.push(selectedFlavor);refreshSaved();});
  flavorButtons.forEach(button=>{button.addEventListener('click',refreshSaved);button.addEventListener('keydown',()=>queueMicrotask(refreshSaved));});
  document.querySelector('#finder-cta').addEventListener('click',refreshSaved);
  document.querySelector('#open-shortlist').addEventListener('click',()=>{refreshSaved();savedDialog.showModal();});
  document.querySelector('#close-shortlist').addEventListener('click',()=>savedDialog.close());
  document.querySelector('.service-tools').append(document.querySelector('#open-shortlist'));
  document.querySelector('#shortlist-whatsapp').removeAttribute('target');
  document.querySelector('#shortlist-whatsapp').addEventListener('click',event=>{event.preventDefault();savedDialog.close();showStep(0);});
  document.querySelector('#shortlist-clear').addEventListener('click',()=>{savedServices=[];form.querySelector('[name="service"]').value='';refreshSaved();});
  document.querySelector('#shortlist-download').addEventListener('click',()=>{const text='MINHA SELEÇÃO — DEMONSTRAÇÃO\n\n'+savedServices.map(key=>'- '+flavors[key].service).join('\n')+'\n\nPreferências para conversar. Não é reserva nem contratação.';const url=URL.createObjectURL(new Blob([text],{type:'text/plain;charset=utf-8'})),link=document.createElement('a');link.href=url;link.download='minha-selecao-demo.txt';link.click();setTimeout(()=>URL.revokeObjectURL(url),1000);});
  refreshSaved();
  const initialKey=new URLSearchParams(location.search).get('servico');const key=initialKey==='crepes'?'crepe':initialKey;if(Object.hasOwn(flavors,key)){selectFlavor(flavorButtons.find(button=>button.dataset.flavor===key));form.querySelector('[name="service"]').value=flavors[key].service;refreshMessage();refreshSaved();}
  const originalMessage=message;
  message=function(){const data=new FormData(form);const interests=data.getAll('interest');const selected=[...new Set([...savedServices.map(key=>flavors[key].service),data.get('service')].filter(Boolean))];let lines=originalMessage().split('\n');if(selected.length){lines=lines.filter(line=>!line.startsWith('Serviço: '));lines.splice(1,0,'Serviços de interesse: '+selected.join(', '));lines=lines.map(line=>line==='Gostaria de sugestões de cardápio e informações de disponibilidade.'?'Podem me informar as opções e a disponibilidade?':line);}return lines.join('\n')+(interests.length?'\nPontos para conversar: '+interests.join(', '):'');};
  refreshSaved();
  form.addEventListener('change',refreshMessage);
  const filters=[...document.querySelectorAll('[data-filter]')];
  filters.forEach(button=>button.addEventListener('click',()=>{filters.forEach(item=>item.setAttribute('aria-pressed',String(item===button)));photos.forEach(photo=>photo.hidden=button.dataset.filter!=='all'&&photo.dataset.category!==button.dataset.filter);document.querySelector('#gallery-count').textContent=`${photos.filter(photo=>!photo.hidden).length} fotografias exibidas.`;}));
  const originalDisplayPhoto=displayPhoto;
  displayPhoto=function(index){const direction=index<photoIndex?-1:1;let visibleIndex=(index+photos.length)%photos.length;let tries=0;while(photos[visibleIndex].hidden&&tries++<photos.length)visibleIndex=(visibleIndex+direction+photos.length)%photos.length;originalDisplayPhoto(visibleIndex);const visiblePhotos=photos.filter(photo=>!photo.hidden);document.querySelector('#photo-counter').textContent=(visiblePhotos.indexOf(photos[photoIndex])+1)+' de '+visiblePhotos.length;};
  let ticking=false;window.addEventListener('scroll',()=>{if(ticking)return;ticking=true;requestAnimationFrame(()=>{const max=document.documentElement.scrollHeight-innerHeight;document.querySelector('.reading-progress').style.width=(max>0?scrollY/max*100:0)+'%';ticking=false;});},{passive:true});
}
