import {SERVICES,OCCASIONS,FORMATS} from './data.js?v=7';

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
  const status=root.querySelector('[data-companion-status]'),undo=root.querySelector('[data-companion-undo]'),body=root.querySelector('[data-receipt-body]'),reveal=root.querySelector('[data-receipt-reveal]');
  const folds=[...root.querySelectorAll('[data-receipt-fold]')],count=root.querySelector('[data-companion-count]'),compactCount=root.querySelector('[data-compact-count]');
  const wide=matchMedia('(min-width:1360px)'),reduced=matchMedia('(prefers-reduced-motion: reduce)');
  let preference=null;try{preference=sessionStorage.getItem('mesa-viva-receipt-collapsed');}catch{}
  let collapsed=preference===null?true:preference==='true';
  let current,previous,noticeTimer,typingTimer,undoAction;
  function updateLayout(){
    root.dataset.layout=wide.matches?'paper':'compact';
    root.classList.toggle('is-collapsed',collapsed);body.hidden=false;
    // Grid interpolation animates both directions, including a quick reversal.
    // Inert removes closing/closed content from keyboard and accessibility access.
    reveal.inert=collapsed;reveal.setAttribute('aria-hidden',String(collapsed));
    document.body.classList.toggle('receipt-collapsed',collapsed);
    root.classList.toggle('is-empty',!current||!hasDraft(current));
    document.body.classList.add('companion-visible');
    folds.forEach(button=>{button.setAttribute('aria-expanded',String(!collapsed));button.setAttribute('aria-label',collapsed?'Abrir Meu evento':'Fechar Meu evento');const label=button.querySelector('[data-fold-label]');if(label)label.textContent=collapsed?'Ver resumo':'Fechar';});
  }
  function setCollapsed(value){collapsed=value;preference=String(collapsed);try{sessionStorage.setItem('mesa-viva-receipt-collapsed',preference);}catch{}updateLayout();}
  function notify(message,action){
    if(!message||document.querySelector('dialog[open]'))return;clearTimeout(noticeTimer);undoAction=action;
    if(status.textContent!==message)status.textContent=message;
    undo.hidden=!action;root.classList.add('has-update');updateLayout();
    if(!reduced.matches&&typeof status.animate==='function')status.animate([{opacity:.35,transform:'translateY(-3px)'},{opacity:1,transform:'none'}],{duration:300,easing:'ease-out'});
    noticeTimer=setTimeout(()=>{root.classList.remove('has-update');undo.hidden=true;undoAction=null;},action?12000:6500);
  }
  folds.forEach(button=>button.addEventListener('click',()=>setCollapsed(!collapsed)));
  root.addEventListener('keydown',event=>{if(event.key==='Escape'&&!collapsed){event.preventDefault();setCollapsed(true);folds[0]?.focus({preventScroll:true});}});
  root.querySelector('.receipt-continue').addEventListener('click',()=>setCollapsed(true));
  undo.addEventListener('click',()=>{const action=undoAction;undoAction=null;action?.();notify('Alteração desfeita.');const visibleFold=folds.find(button=>button.getClientRects().length);visibleFold?.focus({preventScroll:true});});
  wide.addEventListener('change',updateLayout);
  return {
    notify,
    update(state,source='action'){
      const added=previous&&source!=='init'?state.services.filter(key=>!previous.services.includes(key)):[];
      const countChanged=previous&&previous.services.length!==state.services.length;
      current=state;const message=describeChange(previous,state,source);previous=state;
      const text=state.services.length+' serviço'+(state.services.length===1?'':'s');
      count.textContent=text;compactCount.textContent=state.services.length?text:'Vamos planejar?';
      root.querySelector('.receipt-continue').textContent=hasDraft(state)?'Continuar meu pedido →':'Começar meu pedido →';
      root.querySelector('[data-receipt-empty]').hidden=!!state.services.length;
      root.querySelector('[data-receipt-details]').hidden=![state.occasion,state.format,state.date,state.guests,state.place.trim()].some(Boolean);
      updateLayout();clearTimeout(typingTimer);
      if(!reduced.matches&&!document.querySelector('dialog[open]')){
        added.forEach(key=>{
          const line=root.querySelector('[data-remove="'+key+'"]')?.closest('li');
          if(line?.getClientRects().length)line.animate([{clipPath:'inset(0 0 100% 0)',transform:'translateY(-6px)',backgroundColor:'#1e3a9c1f'},{clipPath:'inset(0)',transform:'none',backgroundColor:'transparent'}],{duration:450,easing:'cubic-bezier(.2,.7,.2,1)'});
        });
        if(countChanged)[count,compactCount].filter(node=>node.getClientRects().length).forEach(node=>node.animate([{transform:'scale(1.12)'},{transform:'none'}],{duration:320,easing:'ease-out'}));
      }
      if(source==='typing')typingTimer=setTimeout(()=>notify(message),500);else notify(message);
    }
  };
}
