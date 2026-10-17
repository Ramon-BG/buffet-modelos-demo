import {SERVICES,OCCASIONS,FORMATS} from './data.js?v=3';

const hasDraft=state=>state.services.length||state.request!=='orientacao'||state.occasion||state.format||state.date||state.guests||state.place.trim()||state.note.trim()||state.interests.length;
export function describeChange(previous,next,source){
  if(!previous||source==='init')return '';
  if(source==='reset')return 'Pedido recomeçado.';
  if(source==='suggestion')return 'Sugestão incluída no pedido.';
  const added=next.services.filter(key=>!previous.services.includes(key));
  const removed=previous.services.filter(key=>!next.services.includes(key));
  if(added.length===1&&!removed.length)return SERVICES[added[0]].name+' adicionado ao pedido.';
  if(removed.length===1&&!added.length)return SERVICES[removed[0]].name+' removido.';
  if(added.length||removed.length)return 'Serviços do pedido atualizados.';
  if(previous.request!==next.request)return next.request==='completo'?'Pedido alterado para buffet completo.':next.request==='orientacao'?'Você pode contar com orientação.':'Escolha os serviços que quer conhecer.';
  if(previous.occasion!==next.occasion)return next.occasion?'Ocasião: '+OCCASIONS[next.occasion]+'.':'Ocasião deixada em aberto.';
  if(previous.format!==next.format)return next.format?'Formato: '+FORMATS[next.format]+'.':'Formato deixado em aberto.';
  if(previous.guests!==next.guests)return next.guests?next.guests+' convidados no rascunho.':'Convidados a definir.';
  if(previous.date!==next.date)return next.date?'Data do evento atualizada.':'Data deixada em aberto.';
  if(previous.place!==next.place)return 'Local do evento atualizado.';
  if(previous.interests.join('|')!==next.interests.join('|'))return 'Pontos para conversar atualizados.';
  if(previous.note!==next.note)return 'Observações atualizadas.';
  return '';
}

export function setupCompanion(){
  const root=document.querySelector('[data-order-companion]');if(!root)return null;
  const status=root.querySelector('[data-companion-status]'),undo=root.querySelector('[data-companion-undo]'),body=root.querySelector('[data-receipt-body]');
  const folds=[...root.querySelectorAll('[data-receipt-fold]')],count=root.querySelector('[data-companion-count]'),compactCount=root.querySelector('[data-compact-count]');
  const wide=matchMedia('(min-width:1360px)'),reduced=matchMedia('(prefers-reduced-motion: reduce)');
  let collapsed=false;try{collapsed=sessionStorage.getItem('mesa-viva-receipt-collapsed')==='true';}catch{}
  let current,previous,noticeTimer,typingTimer,undoAction;
  function updateLayout(){
    root.dataset.layout=wide.matches?'paper':'compact';
    root.classList.toggle('is-collapsed',collapsed);body.hidden=collapsed;
    root.classList.toggle('is-empty',!current||!hasDraft(current));
    document.body.classList.add('companion-visible');
    folds.forEach(button=>{button.setAttribute('aria-expanded',String(!collapsed));button.setAttribute('aria-label',collapsed?'Expandir notinha do evento':'Recolher notinha do evento');});
  }
  function notify(message,action){
    if(!message||document.querySelector('dialog[open]'))return;clearTimeout(noticeTimer);undoAction=action;
    if(status.textContent!==message)status.textContent=message;
    undo.hidden=!action;root.classList.add('has-update');updateLayout();
    if(!reduced.matches)root.animate([{boxShadow:'0 0 0 3px #214d8355'},{boxShadow:'0 8px 28px #152d3d1c'}],{duration:650,easing:'ease-out'});
    noticeTimer=setTimeout(()=>{root.classList.remove('has-update');undo.hidden=true;undoAction=null;},action?12000:6500);
  }
  folds.forEach(button=>button.addEventListener('click',()=>{collapsed=!collapsed;try{sessionStorage.setItem('mesa-viva-receipt-collapsed',String(collapsed));}catch{}updateLayout();}));
  undo.addEventListener('click',()=>{const action=undoAction;undoAction=null;action?.();notify('Alteração desfeita.');const visibleFold=folds.find(button=>button.getClientRects().length);visibleFold?.focus({preventScroll:true});});
  wide.addEventListener('change',updateLayout);
  return {
    notify,
    update(state,source='action'){
      current=state;const message=describeChange(previous,state,source);previous=state;
      const text=state.services.length+' serviço'+(state.services.length===1?'':'s');
      count.textContent=state.services.length?text:'Suas escolhas, aqui';compactCount.textContent=state.services.length?text:'Vamos planejar?';
      root.querySelector('.receipt-continue').textContent=hasDraft(state)?'Continuar meu pedido →':'Começar meu pedido →';
      root.querySelector('[data-receipt-empty]').hidden=!!state.services.length;
      root.querySelector('[data-receipt-details]').hidden=![state.occasion,state.format,state.date,state.guests,state.place.trim()].some(Boolean);
      updateLayout();clearTimeout(typingTimer);
      if(source==='typing')typingTimer=setTimeout(()=>notify(message),500);else notify(message);
    }
  };
}
