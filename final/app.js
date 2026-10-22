import {SERVICES,OCCASIONS,FORMATS,REQUESTS} from './data.js?v=11';
import {createStore,buildMessage,dateLabel} from './draft.js?v=11';
import {setupCompanion} from './companion.js?v=11';
import {setupMotion} from './motion.js?v=11';
import {setupHero} from './hero.js?v=11';
import {setupConversation,JOURNEY_KEY,EDIT_KEY} from './conversation.js?v=11';
import {validateOrder} from './order-rules.js?v=11';

const $=(selector,root=document)=>root.querySelector(selector);
const $$=(selector,root=document)=>[...root.querySelectorAll(selector)];
let storage;try{storage=window.sessionStorage;}catch{}
const store=createStore(storage);
const companion=setupCompanion();
const motion=setupMotion();
setupHero(document.querySelector('[data-hero-carousel]'));
let feedbackTimer,undoAction;
function feedback(message,undo,inReceipt=false){
  if(inReceipt&&!document.querySelector('dialog[open]')&&companion){companion.notify(message,undo);return;}
  const box=$('#feedback');clearTimeout(feedbackTimer);undoAction=undo;
  const host=$$('dialog[open]').at(-1)||document.body;host.append(box);
  $('span',box).textContent=message;$('[data-undo]',box).hidden=!undo;
  box.classList.add('visible');feedbackTimer=setTimeout(()=>{box.classList.remove('visible');undoAction=null;},undo?12000:6500);
}
$('[data-undo]').addEventListener('click',()=>{const action=undoAction;undoAction=null;action?.();const box=$('#feedback');box.classList.remove('visible');box.closest('dialog')?.querySelector('[data-close]')?.focus();});
function element(tag,text,className){const node=document.createElement(tag);if(text!==undefined)node.textContent=text;if(className)node.className=className;return node;}
function row(label,value,editKey){const node=element('div'),details=element('dd');details.append(element('span',value));if(editKey){const edit=element('button','Editar');edit.type='button';edit.dataset.chatEdit=editKey;edit.setAttribute('aria-label','Editar '+label.toLowerCase());details.append(edit);}node.append(element('dt',label),details);return node;}
function eventRows(state,complete=false){
  const rows=[];if(state.occasion||complete)rows.push(['Ocasião',OCCASIONS[state.occasion]||'A definir']);
  if(state.format||complete)rows.push(['Formato',FORMATS[state.format]||'A definir']);
  if(state.date||complete)rows.push(['Data',dateLabel(state.date)]);
  if(state.guests||complete)rows.push(['Convidados',state.guests?state.guests+' pessoas':'A definir']);
  if(state.place.trim()||complete)rows.push(['Local',state.place.trim()||'A definir']);
  if(complete)rows.push(['A confirmar',state.interests.join(', ')||'Nada informado']);
  if(complete)rows.push(['Observações',state.note.trim()||'Nada informado']);return rows;
}
function renderAddButtons(state){$$('[data-add]').forEach(button=>{
 const key=button.dataset.add;if(!SERVICES[key])return;
 const added=state.services.includes(key);button.classList.toggle('is-added',added);
 const compact=button.hasAttribute('data-compact-add');
 button.textContent=compact?(added?'Remover':'Selecionar +'):(added?'Remover do evento':'Adicionar ao evento +');
 button.closest('.catalog-card')?.classList.toggle('is-selected',added);
 button.setAttribute('aria-pressed',String(added));
 button.setAttribute('aria-label',(compact?(added?'Remover':'Selecionar'):(added?'Remover do evento':'Adicionar ao evento'))+': '+SERVICES[key].name);
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
  const review=$('#review-details');if(review){review.replaceChildren(row('Pedido',REQUESTS[state.request],'request'),row('Serviços',serviceNames||'A definir com a equipe','services'),...eventRows(state,true).map(([label,value])=>row(label,value,{'Ocasião':'occasion','Formato':'format','Data':'date','Convidados':'guests','Local':'place','A confirmar':'care','Observações':'care'}[label])));}
}
document.addEventListener('click',event=>{
  const add=event.target.closest('[data-add]');if(add){const key=add.dataset.add;if(store.get().services.includes(key)){store.remove(key);feedback(SERVICES[key].name+' removido.',()=>store.add([key]),true);}else store.add([key]);}
  const remove=event.target.closest('[data-remove]');if(remove){const key=remove.dataset.remove,paper=remove.closest('[data-summary]'),index=$$('[data-remove]',paper).indexOf(remove);store.remove(key);const remaining=$$('[data-remove]',paper),target=remaining[Math.min(index,remaining.length-1)]||paper.closest('[data-order-companion]')?.querySelector('[data-receipt-fold]')||paper.closest('dialog')?.querySelector('[data-close]')||$('[data-summary-intent]',paper);if(target.tagName!=='BUTTON')target.tabIndex=-1;target.focus({preventScroll:true});feedback(SERVICES[key].name+' removido.',()=>{const services=[...store.get().services];if(!services.includes(key))services.splice(Math.min(index,services.length),0,key);store.update({services},'restore');},true);}
  if(event.target.closest('[data-reset]')){try{storage?.removeItem(JOURNEY_KEY);storage?.removeItem(EDIT_KEY);}catch{}const previous=store.reset();feedback('Pedido recomeçado.',()=>store.update(previous,'restore'),true);}
});

// The conversation owns form state; summaries render only the confirmed order.
const form = $('#order-form');
const conversation = setupConversation(form, {store, motion, storage});
store.subscribe((state, source) => {
  renderSummaries(state);
  companion?.update(state, source);
  conversation?.sync(state, source);
});
renderSummaries(store.get());
companion?.update(store.get(), 'init');

function outputIsReady() {
  if (conversation) return conversation.ensureReady();
  const issue = validateOrder(store.get());
  if (!issue) return true;
  feedback('Revise seu pedido antes de continuar. ' + issue.message);
  return false;
}

const menu=$('.menu-toggle'),navigation=$('#navigation');
function closeMenu(){navigation.classList.remove('open');menu.setAttribute('aria-expanded','false');}
menu.addEventListener('click',()=>{const open=menu.getAttribute('aria-expanded')!=='true';menu.setAttribute('aria-expanded',String(open));navigation.classList.toggle('open',open);});
$$('a',navigation).forEach(link=>link.addEventListener('click',closeMenu));
document.addEventListener('keydown',event=>{if(event.key==='Escape'&&navigation.classList.contains('open')){closeMenu();menu.focus();}});
document.addEventListener('click',event=>{if(!event.target.closest('.site-header'))closeMenu();});

// Native dialogs provide Escape, focus containment and focus restoration.
function openDialog(dialog){if(!dialog.open){dialog.showModal();document.documentElement.classList.add('dialog-open');motion.dialog(dialog);}}
$$('dialog').forEach(dialog=>{
  $$('[data-close],[data-close-link]',dialog).forEach(button=>button.addEventListener('click',()=>dialog.close()));
  dialog.addEventListener('click',event=>{if(event.target!==dialog)return;const rect=dialog.getBoundingClientRect();if(event.clientX<rect.left||event.clientX>rect.right||event.clientY<rect.top||event.clientY>rect.bottom)dialog.close();});
  dialog.addEventListener('close',()=>{const box=$('#feedback');if(dialog.contains(box)){document.body.append(box);box.classList.remove('visible');}if(!document.querySelector('dialog[open]'))document.documentElement.classList.remove('dialog-open');});
});
$$('[data-open-summary]').forEach(button=>button.addEventListener('click',()=>openDialog($('#summary-dialog'))));
document.addEventListener('click',event=>{
  if(event.target.closest('[data-social-info]'))openDialog($('#social-dialog'));
  if(event.target.closest('[data-send]')&&outputIsReady()){$('[data-demo-message]').textContent=buildMessage(store.get());openDialog($('#message-dialog'));}
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
    const before=motion.captureGallery(),filter=button.dataset.filter;$$('[data-filter]').forEach(item=>item.setAttribute('aria-pressed',String(item===button)));
    $$('[data-category]',gallery).forEach(item=>item.hidden=filter!=='all'&&item.dataset.category!==filter);
    $('#gallery-status').textContent=visiblePhotos().length+' fotografias disponíveis.';motion.gallery(before);
  }));
  $('[data-photo-prev]').addEventListener('click',()=>showPhoto(galleryIndex-1));$('[data-photo-next]').addEventListener('click',()=>showPhoto(galleryIndex+1));
  galleryDialog.addEventListener('keydown',event=>{if(['ArrowLeft','ArrowRight'].includes(event.key)){event.preventDefault();showPhoto(galleryIndex+(event.key==='ArrowRight'?1:-1));}});
  let startX;$('[data-large-photo]').addEventListener('pointerdown',event=>startX=event.clientX);$('[data-large-photo]').addEventListener('pointerup',event=>{if(startX!==undefined&&Math.abs(event.clientX-startX)>55)showPhoto(galleryIndex+(event.clientX<startX?1:-1));startX=undefined;});
}
async function copyMessage(){
  if(!outputIsReady())return;
  const message=buildMessage(store.get());
  try{await navigator.clipboard.writeText(message);feedback('Mensagem copiada.');}
  catch{const field=$('#message-preview');if(field){conversation?.showReview();field.closest('details').open=true;field.focus();field.select();}feedback('Selecione a mensagem e copie pelo menu do seu dispositivo.');}
}
$$('[data-copy]').forEach(button=>button.addEventListener('click',copyMessage));
$$('[data-download]').forEach(button=>button.addEventListener('click',()=>{
  if(!outputIsReady())return;
  const url=URL.createObjectURL(new Blob([buildMessage(store.get())],{type:'text/plain;charset=utf-8'}));const link=element('a');link.href=url;link.download='meu-evento-mesa-viva.txt';document.body.append(link);link.click();link.remove();setTimeout(()=>URL.revokeObjectURL(url),1500);feedback('Seu pedido foi preparado para baixar.');
}));
window.addEventListener('pageshow',event=>{if(event.persisted){conversation?.restoreProgress(false);store.refresh();}});

// Open the requested menu when arriving from a modality shortcut.
function revealLinkedMenu(){const id=location.hash.slice(1);if(!id.startsWith('servico-'))return;const card=document.getElementById(id),details=card?.querySelector('details');if(details)details.open=true;}
revealLinkedMenu();window.addEventListener('hashchange',revealLinkedMenu);
