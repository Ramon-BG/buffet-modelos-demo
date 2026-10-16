import {SERVICES,OCCASIONS,FORMATS,REQUESTS,INTERESTS,suggestionFor} from './data.js?v=1';
import {createStore,buildMessage,dateLabel} from './draft.js?v=1';
import {setupCarousel} from './carousel.js?v=1';

const $=(selector,root=document)=>root.querySelector(selector);
const $$=(selector,root=document)=>[...root.querySelectorAll(selector)];
let storage;try{storage=window.sessionStorage;}catch{}
const store=createStore(storage);
let feedbackTimer,undoAction;
function feedback(message,undo){
  const box=$('#feedback');clearTimeout(feedbackTimer);undoAction=undo;
  const host=$$('dialog[open]').at(-1)||document.body;host.append(box);
  $('span',box).textContent=message;$('[data-undo]',box).hidden=!undo;
  box.classList.add('visible');feedbackTimer=setTimeout(()=>{box.classList.remove('visible');undoAction=null;},undo?12000:6500);
}
$('[data-undo]').addEventListener('click',()=>{const action=undoAction;undoAction=null;action?.();const box=$('#feedback');box.classList.remove('visible');box.closest('dialog')?.querySelector('[data-close]')?.focus();});
function element(tag,text,className){const node=document.createElement(tag);if(text!==undefined)node.textContent=text;if(className)node.className=className;return node;}
function row(label,value){const node=element('div');node.append(element('dt',label),element('dd',value));return node;}
function eventRows(state,complete=false){
  const rows=[];if(state.occasion||complete)rows.push(['Ocasião',OCCASIONS[state.occasion]||'A definir']);
  if(state.format)rows.push(['Formato',FORMATS[state.format]]);
  if(state.date||complete)rows.push(['Data',dateLabel(state.date)]);
  if(state.guests||complete)rows.push(['Convidados',state.guests?state.guests+' pessoas':'A definir']);
  if(state.place.trim()||complete)rows.push(['Local',state.place.trim()||'A definir']);
  if(complete&&state.interests.length)rows.push(['A confirmar',state.interests.join(', ')]);
  if(complete&&state.note.trim())rows.push(['Observações',state.note.trim()]);return rows;
}
function renderAddButtons(state){$$('[data-add]').forEach(button=>{
  const key=button.dataset.add;if(!SERVICES[key])return;
  const added=state.services.includes(key);button.classList.toggle('is-added',added);
  button.textContent=added?SERVICES[key].name+' no pedido · Continuar →':'Adicionar '+SERVICES[key].name.toLowerCase()+' ao meu evento';
  button.setAttribute('aria-label',added?SERVICES[key].name+' já está no seu pedido. Continuar pedido.':button.textContent);
});}
function renderSummaries(state){
  $$('[data-summary]').forEach(paper=>{
    $('[data-summary-count]',paper).textContent=state.services.length?state.services.length+' serviço'+(state.services.length>1?'s':'')+' de interesse':'Você pode pedir orientação';
    $('[data-summary-intent]',paper).textContent=REQUESTS[state.request];
    const list=$('[data-summary-services]',paper);list.replaceChildren(...state.services.map(key=>{
      const li=element('li');const button=element('button','Remover');button.type='button';button.dataset.remove=key;button.setAttribute('aria-label','Remover '+SERVICES[key].name+' do pedido');
      li.append(element('span',SERVICES[key].name),button);return li;
    }));
    $('[data-summary-details]',paper).replaceChildren(...eventRows(state).map(([label,value])=>row(label,value)));
  });
  const serviceNames=state.services.map(key=>SERVICES[key].name).join(', ');
  const line=$('[data-inline-summary]');if(line)line.textContent=serviceNames?(state.request==='completo'?'Buffet completo · preferências: ':'Serviços de interesse: ')+serviceNames:REQUESTS[state.request]+'.';
  $('[data-mobile-summary]').textContent=serviceNames||REQUESTS[state.request];renderAddButtons(state);
  const preview=$('#message-preview');if(preview)preview.value=buildMessage(state);
  const review=$('#review-details');if(review){review.replaceChildren(row('Pedido',REQUESTS[state.request]),row('Serviços',serviceNames||'A definir com a equipe'),...eventRows(state,true).map(([label,value])=>row(label,value)));}
}
document.addEventListener('click',event=>{
  const add=event.target.closest('[data-add]');if(add){const key=add.dataset.add;if(store.get().services.includes(key)){location.href=document.body.dataset.page==='home'?'#pedido':'index.html#pedido';return;}store.add([key]);feedback(SERVICES[key].name+' adicionado ao seu pedido.');}
  const remove=event.target.closest('[data-remove]');if(remove){const key=remove.dataset.remove,paper=remove.closest('[data-summary]'),index=$$('[data-remove]',paper).indexOf(remove);store.remove(key);const remaining=$$('[data-remove]',paper),target=remaining[Math.min(index,remaining.length-1)]||$('[data-summary-intent]',paper);if(target.tagName!=='BUTTON')target.tabIndex=-1;target.focus({preventScroll:true});feedback(SERVICES[key].name+' removido.',()=>{const services=[...store.get().services];if(!services.includes(key))services.splice(Math.min(index,services.length),0,key);store.update({services},'restore');});}
  if(event.target.closest('[data-reset]')){const previous=store.reset();step=0;editing=false;showStep(false);feedback('Pedido recomeçado.',()=>store.update(previous,'restore'));}
});

// The same draft powers the planner, service pages and request form.
const form=$('#order-form');let step=0,editing=false;
function syncForm(state,source){
  if(!form)return;
  if(source!=='typing'){
    $$('input[name=request]',form).forEach(input=>input.checked=input.value===state.request);
    $$('input[name=services]',form).forEach(input=>input.checked=state.services.includes(input.value));
    for(const key of ['occasion','format','date','guests','place','note'])form.elements.namedItem(key).value=state[key];
    $$('input[name=interests]',form).forEach(input=>input.checked=state.interests.includes(input.value));
  }
  const choices=$('#service-choices');choices.hidden=state.request==='orientacao'&&!state.services.length;
  $('legend',choices).textContent=state.request==='servicos'?'Quais serviços quer conhecer?':'Tem alguma preferência? (opcional)';
  $('#request-hint').textContent=state.request==='completo'?'Buffet completo indica o que você procura. Cardápio, equipe e estrutura serão combinados; não seleciona todos os serviços.':state.request==='orientacao'?'Tudo bem deixar a escolha em aberto. Se já incluiu um serviço, ele segue como preferência para a conversa.':'As opções marcadas fazem parte do mesmo pedido. Você pode escolher mais de uma.';
  if(source==='reset'){$('#draft-restored').hidden=true;}
}
function showStep(focus=true){
  if(!form)return;
  $$('[data-step]',form).forEach(panel=>panel.hidden=Number(panel.dataset.step)!==step);
  $$('.stepmarks li',form).forEach((mark,index)=>{if(index===step)mark.setAttribute('aria-current','step');else mark.removeAttribute('aria-current');});
  $('[data-next]',form).hidden=step===2||editing;
  $('[data-next]',form).textContent=step===0?'Continuar: meu evento →':'Revisar meu pedido →';
  $('[data-back]',form).hidden=step===0||editing||step===2;
  $('[data-save-edit]',form).hidden=!editing;
  $('.form-navigation',form).hidden=step===2;
  $('#form-error').hidden=true;
  if(focus){const heading=$('[data-step="'+step+'"] h3',form);heading.focus({preventScroll:true});heading.scrollIntoView({block:'start',behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth'});}
}
function invalid(message,control){const box=$('#form-error');box.textContent=message;box.hidden=false;(control?.closest('.field')||$('#service-choices')).append(box);if(control){control.setAttribute('aria-invalid','true');control.setAttribute('aria-describedby','form-error');control.focus();}return false;}
function validStep(){
  $$('[aria-invalid]',form).forEach(control=>{control.removeAttribute('aria-invalid');control.removeAttribute('aria-describedby');});
  const state=store.get();
  if(step===0&&state.request==='servicos'&&!state.services.length)return invalid('Escolha pelo menos um serviço ou marque “Preciso de orientação”.',$('input[name=services]',form));
  if(step===1){
    const guests=form.elements.namedItem('guests');const date=form.elements.namedItem('date');
    if(!guests.validity.valid)return invalid('Informe uma quantidade inteira de convidados, maior que zero. Você também pode deixar em branco.',guests);
    if(!date.validity.valid)return invalid('Confira a data informada ou deixe o campo em branco.',date);
  }
  $('#form-error').hidden=true;return true;
}
if(form){
  form.addEventListener('submit',event=>event.preventDefault());
  form.addEventListener('change',event=>{
    const {name,value}=event.target;
    if(name==='request')store.update({request:value});
    if(name==='services')store.update({services:$$('input[name=services]:checked',form).map(input=>input.value)});
    if(name==='interests')store.update({interests:$$('input[name=interests]:checked',form).map(input=>input.value)});
    if(['occasion','format'].includes(name))store.update({[name]:value});
  });
  form.addEventListener('input',event=>{if(['date','guests','place','note'].includes(event.target.name))store.update({[event.target.name]:event.target.value},'typing');$('#form-error').hidden=true;});
  $('[data-next]',form).addEventListener('click',()=>{if(validStep()){step++;showStep();}});
  $('[data-back]',form).addEventListener('click',()=>{step--;showStep();});
  $$('[data-edit]',form).forEach(button=>button.addEventListener('click',()=>{step=Number(button.dataset.edit);editing=true;showStep();}));
  $('[data-save-edit]',form).addEventListener('click',()=>{if(validStep()){step=2;editing=false;showStep();}});
  if(store.restored)$('#draft-restored').hidden=false;
}
const plannerOccasion=$('#planner-occasion');
function syncPlanner(state){if(!plannerOccasion)return;plannerOccasion.value=state.occasion;$$('input[name=planner-format]').forEach(input=>input.checked=input.value===state.format);renderSuggestion();}
function renderSuggestion(){
  if(!plannerOccasion)return;const state=store.get(),suggestion=suggestionFor(state.occasion,state.format),button=$('#apply-suggestion');button.disabled=!suggestion;
  if(!suggestion){$('#suggestion-title').textContent='Qual é o jeito do seu encontro?';$('#suggestion-text').textContent='Escolha um dos formatos para ver uma ideia. A ocasião pode ficar em aberto.';button.textContent='Escolha um formato acima';return;}
  $('#suggestion-title').textContent=suggestion.services.map(key=>SERVICES[key].name).join(' + ');$('#suggestion-text').textContent=suggestion.text;
  $('#suggestion-photo').src='assets/'+suggestion.image+'-480.webp';$('#suggestion-photo').alt=suggestion.services.map(key=>SERVICES[key].name).join(' e ')+' — fotografia ilustrativa';
  button.textContent=suggestion.services.every(key=>state.services.includes(key))?'Esta ideia já está no pedido ✓':'Levar esta ideia ao meu pedido';
}
if(plannerOccasion){
  plannerOccasion.addEventListener('change',()=>store.update({occasion:plannerOccasion.value}));
  $$('input[name=planner-format]').forEach(input=>input.addEventListener('change',()=>store.update({format:input.value})));
  $('#apply-suggestion').addEventListener('click',()=>{const suggestion=suggestionFor(store.get().occasion,store.get().format);if(!suggestion)return;store.add(suggestion.services);feedback('Sugestão incluída. Suas outras escolhas continuam no pedido.');});
}
setupCarousel($('[data-carousel]'),key=>{const button=$('[data-carousel] [data-add]');button.dataset.add=key;renderAddButtons(store.get());});
store.subscribe((state,source)=>{renderSummaries(state);syncForm(state,source);if(source!=='typing')syncPlanner(state);});
renderSummaries(store.get());syncForm(store.get());syncPlanner(store.get());showStep(false);

const menu=$('.menu-toggle'),navigation=$('#navigation');
function closeMenu(){navigation.classList.remove('open');menu.setAttribute('aria-expanded','false');}
menu.addEventListener('click',()=>{const open=menu.getAttribute('aria-expanded')!=='true';menu.setAttribute('aria-expanded',String(open));navigation.classList.toggle('open',open);});
$$('a',navigation).forEach(link=>link.addEventListener('click',closeMenu));
document.addEventListener('keydown',event=>{if(event.key==='Escape'&&navigation.classList.contains('open')){closeMenu();menu.focus();}});
document.addEventListener('click',event=>{if(!event.target.closest('.site-header'))closeMenu();});

// Native dialogs provide Escape, focus containment and focus restoration.
function openDialog(dialog){if(!dialog.open){dialog.showModal();document.body.classList.add('dialog-open');}}
$$('dialog').forEach(dialog=>{
  $$('[data-close],[data-close-link]',dialog).forEach(button=>button.addEventListener('click',()=>dialog.close()));
  dialog.addEventListener('click',event=>{if(event.target!==dialog)return;const rect=dialog.getBoundingClientRect();if(event.clientX<rect.left||event.clientX>rect.right||event.clientY<rect.top||event.clientY>rect.bottom)dialog.close();});
  dialog.addEventListener('close',()=>{const box=$('#feedback');if(dialog.contains(box)){document.body.append(box);box.classList.remove('visible');}if(!document.querySelector('dialog[open]'))document.body.classList.remove('dialog-open');});
});
$('[data-open-summary]').addEventListener('click',()=>openDialog($('#summary-dialog')));
document.addEventListener('click',event=>{
  if(event.target.closest('[data-social-info]'))openDialog($('#social-dialog'));
  if(event.target.closest('[data-send]')){$('[data-demo-message]').textContent=buildMessage(store.get());openDialog($('#message-dialog'));}
});
const stories={eventos:{image:'mesa',title:'Eventos, de perto.',text:'Aqui entram registros reais dos eventos, selecionados com a cliente. Esta fotografia é apenas uma referência de montagem.'},cardapios:{image:'massas',title:'O que pode ir à mesa.',text:'Um espaço para apresentar cardápios e novidades aprovados pela cliente. Os serviços e imagens deste modelo são ilustrativos.'},bastidores:{image:'servico',title:'O cuidado antes do encontro.',text:'Montagem, preparo e atendimento podem ganhar espaço nos destaques. Este exemplo ainda não mostra a equipe real.'},relatos:{image:'aperitivos',title:'Quem já celebrou.',text:'Aqui poderão aparecer relatos de clientes, com autorização. Não há depoimentos fictícios ou avaliações inventadas neste modelo.'}};
$$('[data-story]').forEach(button=>button.addEventListener('click',()=>{const story=stories[button.dataset.story];$('[data-story-image]').src='assets/'+story.image+'-960.webp';$('#story-title').textContent=story.title;$('[data-story-text]').textContent=story.text;openDialog($('#story-dialog'));}));

const gallery=$('.gallery-grid'),galleryDialog=$('#gallery-dialog');let galleryIndex=0,activePhotos=[];
function visiblePhotos(){return gallery?$$('[data-zoom]',gallery).filter(button=>!button.closest('li').hidden):[];}
function showPhoto(index){
  galleryIndex=(index+activePhotos.length)%activePhotos.length;const button=activePhotos[galleryIndex];
  $('[data-large-photo]').src='assets/'+button.dataset.zoom+'-960.webp';$('[data-large-photo]').alt=button.dataset.caption;
  $('#gallery-caption').textContent=button.dataset.caption;$('[data-photo-count]').textContent=(galleryIndex+1)+' de '+activePhotos.length;
}
if(gallery){
  $$('[data-zoom]',gallery).forEach(button=>button.addEventListener('click',()=>{activePhotos=visiblePhotos();showPhoto(activePhotos.indexOf(button));openDialog(galleryDialog);}));
  $$('[data-filter]').forEach(button=>button.addEventListener('click',()=>{
    const filter=button.dataset.filter;$$('[data-filter]').forEach(item=>item.setAttribute('aria-pressed',String(item===button)));
    $$('[data-category]',gallery).forEach(item=>item.hidden=filter!=='all'&&item.dataset.category!==filter);
    $('#gallery-status').textContent=visiblePhotos().length+' fotografias disponíveis.';
  }));
  $('[data-photo-prev]').addEventListener('click',()=>showPhoto(galleryIndex-1));$('[data-photo-next]').addEventListener('click',()=>showPhoto(galleryIndex+1));
  galleryDialog.addEventListener('keydown',event=>{if(['ArrowLeft','ArrowRight'].includes(event.key)){event.preventDefault();showPhoto(galleryIndex+(event.key==='ArrowRight'?1:-1));}});
  let startX;$('[data-large-photo]').addEventListener('pointerdown',event=>startX=event.clientX);$('[data-large-photo]').addEventListener('pointerup',event=>{if(startX!==undefined&&Math.abs(event.clientX-startX)>55)showPhoto(galleryIndex+(event.clientX<startX?1:-1));startX=undefined;});
}
async function copyMessage(){
  const message=buildMessage(store.get());
  try{await navigator.clipboard.writeText(message);feedback('Mensagem copiada.');}
  catch{const field=$('#message-preview');if(field){if(step!==2){step=2;editing=false;showStep(false);}field.closest('details').open=true;field.focus();field.select();}feedback('Selecione a mensagem e copie pelo menu do seu dispositivo.');}
}
$$('[data-copy]').forEach(button=>button.addEventListener('click',copyMessage));
$$('[data-download]').forEach(button=>button.addEventListener('click',()=>{
  const url=URL.createObjectURL(new Blob([buildMessage(store.get())],{type:'text/plain;charset=utf-8'}));const link=element('a');link.href=url;link.download='meu-evento-mesa-viva.txt';document.body.append(link);link.click();link.remove();setTimeout(()=>URL.revokeObjectURL(url),1500);feedback('Seu pedido foi preparado para baixar.');
}));
if('IntersectionObserver'in window){
  const visible=new Map();const observer=new IntersectionObserver(entries=>{entries.forEach(entry=>visible.set(entry.target,entry.isIntersecting));$('[data-mobile-order]').hidden=[...visible.values()].some(Boolean);},{threshold:0});
  $$('[data-hero],#pedido').forEach(node=>observer.observe(node));
}else $('[data-mobile-order]').hidden=false;
window.addEventListener('pageshow',event=>{if(event.persisted)store.refresh();});
