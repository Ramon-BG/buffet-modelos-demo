(() => {
  const professional=document.body.classList.contains('profissional');
  const form=document.querySelector('#quote-form');
  const stages=[...form.querySelectorAll('.form-stage')];
  const next=document.querySelector('#form-next'),back=document.querySelector('#form-back'),save=document.querySelector('#return-review');
  const checked=()=>[...form.querySelectorAll('[name="services"]:checked')].map(input=>input.value);
  const names=()=>checked().map(key=>flavors[key].service);
  const mode=()=>form.querySelector('[name="request"]:checked').value;
  const labels={completo:'Buffet completo',servicos:'Serviços escolhidos',orientacao:'Preciso de orientação'};
  let step=0,editing=false;
  const reduced=matchMedia('(prefers-reduced-motion: reduce)');
  const facts={crepe:['Preparo no local','Aniversários e encontros em casa','Recheios, equipe e equipamentos'],massas:['Mesa ou estação de massas','Almoços e jantares à mesa','Massas, molhos e acompanhamentos'],churrasco:['Grelha e serviço no evento','Encontros informais','Cortes e espaço para preparo'],coquetel:['Aperitivos e reposição','Recepções com convidados circulando','Cardápio e atendimento']};
  function animate(element){if(!reduced.matches)element.animate([{opacity:.65},{opacity:1}],{duration:250,easing:'ease-out'});}
  function message(){
    const data=new FormData(form),lines=['Olá, Mesa Viva! Gostaria de pedir um orçamento.','O que procuro: '+labels[mode()]+'.'];
    if(names().length)lines.push((mode()==='servicos'?'Serviços de interesse: ':'Preferências para conversar: ')+names().join(', '));
    if(mode()==='completo')lines.push('Gostaria de conversar sobre cardápio, equipe e estrutura. Inclusões a confirmar.');
    if(data.get('occasion'))lines.push('Ocasião: '+data.get('occasion'));
    if(data.get('date'))lines.push('Data: '+data.get('date').split('-').reverse().join('/'));
    if(data.get('guests'))lines.push('Convidados: aproximadamente '+data.get('guests'));
    if(data.get('place')?.trim())lines.push('Local: '+data.get('place').trim());
    const interests=data.getAll('interest');if(interests.length)lines.push('Pontos para conversar: '+interests.join(', '));
    if(data.get('note')?.trim())lines.push('Observação: '+data.get('note').trim());
    lines.push('Podem me informar as opções e a disponibilidade?');return lines.join('\n');
  }
  function updateReview(){
    const data=new FormData(form),list=document.querySelector('#review-details');list.replaceChildren();
    const rows=[['Pedido',labels[mode()]],['Serviços',names().join(', ')||'A combinar'],['Ocasião',data.get('occasion')||'A definir'],['Data',data.get('date')?data.get('date').split('-').reverse().join('/'):'A definir'],['Convidados',data.get('guests')||'A definir'],['Local',data.get('place')?.trim()||'A definir']];
    if(data.getAll('interest').length)rows.push(['Pontos para conversar',data.getAll('interest').join(', ')]);
    if(data.get('note')?.trim())rows.push(['Observações',data.get('note').trim()]);
    rows.forEach(([label,value])=>{const row=document.createElement('div'),dt=document.createElement('dt'),dd=document.createElement('dd');dt.textContent=label;dd.textContent=value;row.append(dt,dd);list.append(row);});
    document.querySelector('#message-preview').value=message();
    document.querySelector('#whatsapp-send').href='https://wa.me/0000000000?text='+encodeURIComponent(message());
    document.querySelector('#copy-feedback').textContent='';
  }
  function refresh(){
    const values=checked(),chosen=values.includes(selectedFlavor);
    const cta=document.querySelector('#flavor-cta');cta.textContent=chosen?'✓ '+flavors[selectedFlavor].service+' incluído':'Adicionar '+flavors[selectedFlavor].service.toLowerCase()+' ao meu evento +';cta.disabled=chosen;
    document.querySelector('#remove-current').hidden=!chosen;
    document.querySelector('#service-picker').hidden=mode()==='orientacao';
    document.querySelector('.service-options legend').textContent=mode()==='completo'?'Tem serviços em mente? (opcional)':'Quais serviços você quer conhecer?';
    const note=document.querySelector('#request-note');
    note.textContent=mode()==='completo'?'Uma solução completa será combinada com a equipe. Suas preferências ajudam na conversa; cardápio, utensílios e atendimento precisam de confirmação.':mode()==='orientacao'?(names().length?'Preferências já incluídas: '+names().join(', ')+'. A equipe pode ajudar a rever essas opções.':'Podemos começar pela ocasião, sem um cardápio definido.'):names().length?'No seu pedido: '+names().join(', ')+'.':'Marque as opções que gostaria de incluir na conversa.';
    document.querySelector('#basket-text').textContent=names().length?names().join(' · '):mode()==='completo'?'Buffet completo · detalhes a combinar':'Você pode escolher serviços ou pedir orientação.';
    const detail=document.querySelector('#service-detail-link');if(detail)detail.href=(selectedFlavor==='crepe'?'crepes':selectedFlavor)+'.html';
    const mini=document.querySelector('#compact-request');if(mini)mini.textContent='Meu evento · '+(names().length?names().length+' serviço'+(names().length>1?'s':''):labels[mode()]);
    document.querySelector('#choice-error').hidden=true;
    updateReview();updatePlanner();
  }
  function setStage(index,focus=true){
    step=index;stages.forEach((stage,i)=>stage.hidden=i!==index);
    form.querySelectorAll('.form-progress li').forEach((item,i)=>{item.classList.toggle('current',i===index);item.classList.toggle('done',i<index);if(i===index)item.setAttribute('aria-current','step');else item.removeAttribute('aria-current');});
    document.querySelector('#form-counter').textContent=editing?'EDITANDO SEU PEDIDO':'ETAPA '+(index+1)+' DE 3';
    next.hidden=index===2||editing;back.hidden=index===0||editing;save.hidden=!editing;
    next.textContent=index===0?'Continuar: meu evento →':'Revisar meu pedido →';
    refresh();
    if(focus){form.scrollIntoView({behavior:reduced.matches?'instant':'smooth',block:'start'});stages[index].querySelector('h3').focus({preventScroll:true});}
    animate(stages[index]);
  }
  function valid(){
    if(step===0&&mode()==='servicos'&&!checked().length){document.querySelector('#choice-error').hidden=false;form.querySelector('[name="services"]').focus();return false;}
    const invalid=[...stages[step].querySelectorAll('input,textarea')].find(x=>!x.checkValidity());if(invalid){invalid.reportValidity();return false;}return true;
  }
  next.addEventListener('click',()=>{if(valid())setStage(Math.min(2,step+1));});
  back.addEventListener('click',()=>setStage(Math.max(0,step-1)));
  save.addEventListener('click',()=>{if(valid()){editing=false;setStage(2);}});
  document.querySelector('#edit-request').addEventListener('click',()=>{editing=true;setStage(0);});
  document.querySelector('#edit-event').addEventListener('click',()=>{editing=true;setStage(1);});
  form.addEventListener('input',refresh);form.addEventListener('change',refresh);form.addEventListener('submit',e=>e.preventDefault());
  function addService(key){
    form.querySelector('[name="request"][value="servicos"]').checked=true;
    form.querySelector('[name="services"][value="'+key+'"]').checked=true;
    refresh();
  }
  document.querySelector('#flavor-cta').addEventListener('click',()=>{addService(selectedFlavor);document.querySelector('#service-feedback').textContent=flavors[selectedFlavor].service+' incluído. Continue explorando ou avance para o pedido.';});
  document.querySelector('#remove-current').addEventListener('click',()=>{form.querySelector('[name="services"][value="'+selectedFlavor+'"]').checked=false;refresh();document.querySelector('#service-feedback').textContent=flavors[selectedFlavor].service+' removido do pedido.';});
  form.querySelectorAll('[name="request"]').forEach(input=>input.addEventListener('change',refresh));
  const originalSelect=selectFlavor;
  const carouselPhoto=document.querySelector('#flavor-photo');
  const carouselVisual=carouselPhoto.parentElement;
  let slideRevision=0,slideAnimations=[],outgoingPhoto=null;
  function clearSlide(){
    slideAnimations.forEach(animation=>animation.cancel());slideAnimations=[];
    outgoingPhoto?.remove();outgoingPhoto=null;
  }
  selectFlavor=function(button,focus=false){
    const before=selectedFlavor,nextKey=button.dataset.flavor;
    if(before===nextKey){if(focus)button.focus();return;}
    // Mantém a foto anterior visível até a próxima imagem estar pronta.
    const previousPhoto=(outgoingPhoto&&!carouselPhoto.complete?outgoingPhoto:carouselPhoto).cloneNode();
    const revision=++slideRevision;
    clearSlide();
    originalSelect(button,focus);
    document.querySelector('#service-feedback').textContent='';renderFacts();refresh();
    if(reduced.matches)return;
    previousPhoto.removeAttribute('id');previousPhoto.alt='';previousPhoto.setAttribute('aria-hidden','true');
    previousPhoto.className='carousel-outgoing';previousPhoto.removeAttribute('loading');
    outgoingPhoto=previousPhoto;carouselVisual.append(previousPhoto);
    let delta=flavorButtons.findIndex(b=>b.dataset.flavor===nextKey)-flavorButtons.findIndex(b=>b.dataset.flavor===before);
    if(Math.abs(delta)>flavorButtons.length/2)delta=-delta;
    const direction=delta>=0?1:-1;
    const ready=carouselPhoto.decode?carouselPhoto.decode():Promise.resolve();
    ready.then(()=>{
      if(revision!==slideRevision||reduced.matches){if(revision===slideRevision)clearSlide();return;}
      const options={duration:560,easing:'cubic-bezier(.22,.68,.18,1)',fill:'none'};
      const incoming=carouselPhoto.animate([{transform:`translateX(${direction*100}%)`},{transform:'translateX(0)'}],options);
      const outgoing=previousPhoto.animate([{transform:'translateX(0)'},{transform:`translateX(${-direction*100}%)`}],options);
      slideAnimations=[incoming,outgoing];
      animate(document.querySelector('.flavor-content'));
      outgoing.finished.then(()=>{if(revision===slideRevision)clearSlide();}).catch(()=>{});
    }).catch(()=>{if(revision===slideRevision)clearSlide();});
  };
  reduced.addEventListener('change',()=>{if(reduced.matches){slideRevision++;clearSlide();}});
  function renderFacts(){
    const list=document.querySelector('#service-facts');list.replaceChildren();
    facts[selectedFlavor].slice(0,professional?3:2).forEach((value,i)=>{const row=document.createElement('div'),dt=document.createElement('dt'),dd=document.createElement('dd');dt.textContent=['Formato','Combina com','O que confirmar'][i];dd.textContent=value;row.append(dt,dd);list.append(row);});
  }
  // Um carrossel, com seleção manual permanente e pausa para leitura.
  const showcase=document.querySelector('.service-showcase'),toggle=document.querySelector('#carousel-toggle');
  let playing=!reduced.matches,visible=false,timer=null;
  const updateTimer=()=>{
    clearInterval(timer);timer=null;
    toggle.textContent=playing?'Pausar troca automática Ⅱ':'Continuar carrossel ▶';toggle.setAttribute('aria-label',playing?'Pausar troca automática':'Continuar carrossel');
    showcase.setAttribute('aria-live','off');
    const readingFocus=showcase.contains(document.activeElement)&&document.activeElement!==toggle;
    if(playing&&visible&&!document.hidden&&!showcase.matches(':hover')&&!readingFocus)timer=setInterval(()=>{const current=flavorButtons.findIndex(b=>b.dataset.flavor===selectedFlavor);selectFlavor(flavorButtons[(current+1)%flavorButtons.length]);},8000);
  };
  function manual(){playing=false;updateTimer();}
  flavorButtons.forEach(button=>{button.addEventListener('click',manual);button.addEventListener('keydown',event=>{if(['ArrowLeft','ArrowRight','Home','End','Enter',' '].includes(event.key))manual();});});
  toggle.addEventListener('click',()=>{playing=!playing;updateTimer();});
  showcase.addEventListener('pointerenter',()=>{clearInterval(timer);timer=null;});showcase.addEventListener('pointerleave',updateTimer);
  showcase.addEventListener('focusin',()=>{clearInterval(timer);timer=null;});showcase.addEventListener('focusout',()=>queueMicrotask(updateTimer));
  document.addEventListener('visibilitychange',updateTimer);reduced.addEventListener('change',()=>{if(reduced.matches)playing=false;updateTimer();});
  if('IntersectionObserver' in window)new IntersectionObserver(entries=>{visible=entries[0].isIntersecting;updateTimer();},{threshold:.3}).observe(showcase);
  const photo=document.querySelector('.flavor-visual');let pointer;
  photo.style.touchAction='pan-y';photo.querySelector('img').draggable=false;
  photo.addEventListener('pointerdown',event=>{pointer={x:event.clientX,y:event.clientY};manual();});
  photo.addEventListener('pointercancel',()=>pointer=null);
  photo.addEventListener('pointerup',event=>{if(!pointer)return;const dx=event.clientX-pointer.x,dy=event.clientY-pointer.y;pointer=null;if(Math.abs(dx)>55&&Math.abs(dx)>Math.abs(dy)*1.4){const current=flavorButtons.findIndex(b=>b.dataset.flavor===selectedFlavor);selectFlavor(flavorButtons[(current+(dx<0?1:-1)+flavorButtons.length)%flavorButtons.length]);}});
  // A orientação e o formulário usam as mesmas escolhas.
  const planner=document.querySelector('#descobrir'),plannerKeys={circulando:'coquetel',mesa:'massas',informal:'churrasco'};
  function plannerKey(){return plannerKeys[planner?.querySelector('[name="mood"]:checked')?.value];}
  function updatePlanner(){
    if(!planner)return;const key=plannerKey();
    const selected=checked().includes(key),button=document.querySelector('#planner-use');
    button.textContent=selected?'✓ '+flavors[key].service+' incluído':'Adicionar '+flavors[key].service.toLowerCase()+' ao meu evento +';button.disabled=selected;
    document.querySelector('#planner-occasion').value=form.querySelector('[name="occasion"]:checked').value;
  }
  if(planner){
    const descriptions={circulando:'Coquetel é uma opção para receber com aperitivos e convidados circulando.',mesa:'Massas são uma opção para uma refeição compartilhada à mesa.',informal:'Churrasco é uma opção para encontros informais. Estrutura e preparo precisam ser combinados.'};
    const continuation=document.createElement('a');continuation.href='#orcamento';continuation.className='planner-continue';continuation.textContent='Continuar meu pedido →';document.querySelector('#planner-use').after(continuation);
    const recommendation=()=>{const key=plannerKey(),mood=planner.querySelector('[name="mood"]:checked').value;document.querySelector('#finder-service').textContent=flavors[key].service;document.querySelector('#finder-text').textContent=descriptions[mood];document.querySelector('#planner-photo').src='assets/'+flavors[key].image+'-480.webp?v=10';document.querySelector('#planner-photo').alt=flavors[key].service+' — fotografia ilustrativa CC0';document.querySelector('#finder-cta').textContent='Conhecer '+flavors[key].service.toLowerCase()+' ↗';document.querySelector('#planner-feedback').textContent='';updatePlanner();animate(document.querySelector('.planner-recommendation'));};
    planner.querySelectorAll('[name="mood"]').forEach(input=>input.addEventListener('change',recommendation));
    document.querySelector('#planner-occasion').addEventListener('change',event=>{form.querySelectorAll('[name="occasion"]').forEach(x=>x.checked=x.value===event.target.value);refresh();});
    document.querySelector('#planner-use').addEventListener('click',()=>{addService(plannerKey());document.querySelector('#planner-feedback').textContent='Incluído no mesmo pedido. Você pode escolher outras opções.';});
    document.querySelector('#finder-cta').addEventListener('click',()=>{manual();selectFlavor(flavorButtons.find(b=>b.dataset.flavor===plannerKey()));});recommendation();
  }
  // Redes sociais: exemplos locais e claramente identificados.
  const highlight=document.querySelector('#highlight-dialog');
  const stories={eventos:['Eventos','mesa','Uma seleção de montagens e ambientes. Na versão final, este espaço recebe registros aprovados do buffet.'],cardapios:['Cardápios','coquetel','Um espaço para apresentar sabores e formatos disponíveis. Fotos e cardápios serão confirmados com a cliente.'],bastidores:['Bastidores','crepe','Aqui poderão entrar registros reais do preparo e da equipe. A fotografia atual é apenas uma referência.'],relatos:['Depoimentos','servico','Este espaço está reservado para relatos reais, publicados com autorização. Nenhum depoimento fictício foi criado.']};
  document.querySelectorAll('[data-highlight]').forEach(button=>button.addEventListener('click',()=>{const [title,image,text]=stories[button.dataset.highlight];document.querySelector('#highlight-title').textContent=title;document.querySelector('#highlight-description').textContent=text;document.querySelector('#highlight-photo').src='assets/'+image+'-480.webp?v=10';highlight.showModal();}));
  document.querySelector('#highlight-close').addEventListener('click',()=>highlight.close());document.querySelector('#highlight-instagram').addEventListener('click',()=>highlight.close());
  document.querySelector('#copy-request').addEventListener('click',async()=>{try{await navigator.clipboard.writeText(message());document.querySelector('#copy-feedback').textContent='Mensagem copiada.';}catch{document.querySelector('.message-disclosure').open=true;const field=document.querySelector('#message-preview');field.focus();field.select();document.querySelector('#copy-feedback').textContent='Selecione e copie a mensagem acima.';}});
  document.querySelector('#download-request')?.addEventListener('click',()=>{const url=URL.createObjectURL(new Blob([message()+'\n\nPedido de demonstração. Não representa contratação.'],{type:'text/plain;charset=utf-8'}));const link=document.createElement('a');link.href=url;link.download='meu-evento-demonstracao.txt';link.click();setTimeout(()=>URL.revokeObjectURL(url),1000);});
  const filters=[...document.querySelectorAll('[data-filter]')];
  filters.forEach(button=>button.addEventListener('click',()=>{filters.forEach(x=>x.setAttribute('aria-pressed',String(x===button)));photos.forEach(x=>x.hidden=button.dataset.filter!=='all'&&x.dataset.category!==button.dataset.filter);document.querySelector('.gallery-grid').classList.toggle('filtered',button.dataset.filter!=='all');document.querySelector('#gallery-count').textContent=photos.filter(x=>!x.hidden).length+' fotografias exibidas.';}));
  if(filters.length){const original=displayPhoto;displayPhoto=function(index){const direction=index<photoIndex?-1:1;let target=(index+photos.length)%photos.length,tries=0;while(photos[target].hidden&&tries++<photos.length)target=(target+direction+photos.length)%photos.length;original(target);const shown=photos.filter(x=>!x.hidden);document.querySelector('#photo-counter').textContent=(shown.indexOf(photos[photoIndex])+1)+' de '+shown.length;};}
  let galleryTouch;
  dialog.addEventListener('touchstart',event=>{galleryTouch={x:event.changedTouches[0].clientX,y:event.changedTouches[0].clientY};},{passive:true});
  dialog.addEventListener('touchend',event=>{if(!galleryTouch)return;const dx=event.changedTouches[0].clientX-galleryTouch.x,dy=event.changedTouches[0].clientY-galleryTouch.y;galleryTouch=null;if(Math.abs(dx)>60&&Math.abs(dx)>Math.abs(dy)*1.5)displayPhoto(photoIndex+(dx<0?1:-1));},{passive:true});
  const contact=document.querySelector('.floating-wa');
  if('IntersectionObserver' in window){
    const occupied=new Map();
    const observer=new IntersectionObserver(entries=>{entries.forEach(e=>occupied.set(e.target.id,e.isIntersecting));contact.classList.toggle('flow-hidden',[...occupied.values()].some(Boolean));},{rootMargin:'-100px 0px -60px 0px'});
    ['inicio','sabores','descobrir','galeria','redes','orcamento'].forEach(id=>{const section=document.getElementById(id);if(section)observer.observe(section);});
  }
  const navLinks=[...document.querySelectorAll('#navegacao a')];let pending=false;
  addEventListener('scroll',()=>{if(pending)return;pending=true;requestAnimationFrame(()=>{pending=false;const active=[...document.querySelectorAll('main section[id]')].filter(x=>x.getBoundingClientRect().top<160).at(-1);navLinks.forEach(x=>{if(x.hash==='#'+active?.id)x.setAttribute('aria-current','location');else x.removeAttribute('aria-current');});});},{passive:true});
  renderFacts();refresh();setStage(0,false);updateTimer();
  const key=new URLSearchParams(location.search).get('servico');if(key){const normalized=key==='crepes'?'crepe':key;if(Object.hasOwn(flavors,normalized)){manual();selectFlavor(flavorButtons.find(b=>b.dataset.flavor===normalized));addService(normalized);}}
})();
