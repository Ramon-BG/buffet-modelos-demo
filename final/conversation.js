import {SERVICES,OCCASIONS,FORMATS,REQUESTS} from './data.js?v=10';
import {dateLabel} from './draft.js?v=10';

export const JOURNEY_KEY='mesa-viva-question-progress-v1';
const KEYS=['request','services','occasion','format','date','guests','place','care','review'];
export const questionPath=state=>['request',...(state.request!=='orientacao'||state.services.length?['services']:[]),'occasion','format','date','guests','place','care','review'];
export function answerLabel(key,state){
 const values={request:REQUESTS[state.request],services:state.services.map(id=>SERVICES[id].name).join(', '),occasion:OCCASIONS[state.occasion],format:FORMATS[state.format],date:state.date?dateLabel(state.date):'',guests:state.guests?state.guests+' convidados':'',place:state.place.trim(),care:[...state.interests,state.note.trim()].filter(Boolean).join(' · ')};
 return values[key]||'A definir';
}
export function createJourney(storage){
 let current='request',editing=false,visited=[];
 try{const saved=JSON.parse(storage?.getItem(JOURNEY_KEY)||'null');if(saved&&KEYS.includes(saved.current)){current=saved.current;editing=!!saved.editing&&current!=='review';visited=Array.isArray(saved.visited)?[...new Set(saved.visited.filter(key=>KEYS.includes(key)&&key!=='review'))]:[];}}catch{}
 function persist(){try{storage?.setItem(JOURNEY_KEY,JSON.stringify({current,editing,visited}));}catch{}}
 return {
  current:()=>current,editing:()=>editing,visited:()=>[...visited],
  reconcile(state){if(!editing&&!questionPath(state).includes(current)){current='occasion';persist();}},
  next(state){if(!visited.includes(current)&&current!=='review')visited.push(current);if(editing){current='review';editing=false;}else{const path=questionPath(state);current=path[Math.min(path.indexOf(current)+1,path.length-1)];}persist();return current;},
  back(state){if(editing){current='review';editing=false;}else{const path=questionPath(state);current=path[Math.max(0,path.indexOf(current)-1)];}persist();return current;},
  edit(key){if(!KEYS.includes(key)||key==='review')return;current=key;editing=true;persist();},
  review(){current='review';editing=false;persist();},
  useChoices(){visited=[...new Set([...visited,'request','services'])];current='occasion';editing=false;persist();},
  reset(){current='request';editing=false;visited=[];try{storage?.removeItem(JOURNEY_KEY);}catch{}}
 };
}

const LABELS={request:'Tipo de pedido',services:'Cardápios',occasion:'Ocasião',format:'Como receber',date:'Data',guests:'Convidados',place:'Local',care:'Cuidados e observações'};
export function setupConversation(form,{getState,motion,storage}){
 if(!form)return null;
 const $=selector=>form.querySelector(selector),$$=selector=>[...form.querySelectorAll(selector)];
 let journey=createJourney(storage);
 const next=$('[data-chat-next]'),back=$('[data-chat-back]'),skip=$('[data-chat-skip]'),error=$('#form-error');
 const fields={date:'date',guests:'guests',place:'place'};
 function meaningful(key,state){return answerLabel(key,state)!=='A definir';}
 function renderHistory(state){
  const list=$('[data-chat-history-list]');list.replaceChildren();
  journey.visited().forEach(key=>{const item=document.createElement('li'),label=document.createElement('span'),value=document.createElement('span'),edit=document.createElement('button');label.textContent=LABELS[key];value.textContent=answerLabel(key,state);edit.type='button';edit.textContent='Editar';edit.dataset.chatEdit=key;edit.setAttribute('aria-label','Editar '+LABELS[key].toLowerCase());item.append(label,value,edit);list.append(item);});
  $('[data-chat-history-count]').textContent=String(journey.visited().length);
  $('[data-chat-history]').hidden=!journey.visited().length;
  const last=journey.visited().filter(key=>key!==journey.current()).at(-1),bubble=$('[data-chat-last]');bubble.hidden=!last||journey.current()==='review'||journey.editing();
  if(last){bubble.querySelector('small').textContent=LABELS[last]+' · sua resposta';$('[data-chat-last-value]').textContent=answerLabel(last,state);}
 }
 function render(focus=false){
  const state=getState();journey.reconcile(state);const key=journey.current(),path=questionPath(state),review=key==='review';
  $$('[data-question]').forEach(panel=>panel.hidden=panel.dataset.question!==key);
  const index=path.indexOf(key),total=path.length-1;
  $('[data-chat-progress]').textContent=review?'Confira antes de continuar':journey.editing()?'Editar resposta':'Pergunta '+(index+1)+' de '+total;
  $('[data-chat-progress-bar]').value=review?total:Math.max(0,index);$('[data-chat-progress-bar]').max=total;
  $('.chat-navigation').hidden=review;
  back.hidden=key==='request'&&!journey.editing();back.textContent=journey.editing()?'← Voltar à revisão':'← Voltar';
  skip.hidden=review||key==='request'||(key==='services'&&state.request==='servicos');
  skip.textContent=meaningful(key,state)?'Manter resposta':'Pular por enquanto';
  next.textContent=journey.editing()?'Salvar e revisar →':key==='care'?'Revisar meu pedido →':'Responder e continuar →';
  const use=$('[data-chat-use-choices]');use.hidden=key!=='request'||!state.services.length||state.request!=='servicos';
  next.hidden=!use.hidden;
  $('[data-chat-existing]').hidden=!state.services.length;
  $('[data-chat-existing-value]').textContent=state.services.map(id=>SERVICES[id].name).join(', ');
  error.hidden=true;renderHistory(state);
  if(focus){const panel=$('[data-question="'+key+'"]'),heading=panel.querySelector('h3'),last=$('[data-chat-last]'),anchor=review?panel:!last.hidden?last:form;motion?.step(panel);heading.focus({preventScroll:true});anchor.scrollIntoView({block:'start',behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth'});}
 }
 function valid(){
  const key=journey.current(),state=getState();let message='',control;
  $$('[aria-invalid]').forEach(input=>{input.removeAttribute('aria-invalid');input.removeAttribute('aria-describedby');});
  if(key==='services'&&state.request==='servicos'&&!state.services.length){message='Escolha ao menos um cardápio. Para decidir depois, volte e selecione “Preciso de orientação”.';control=$('input[name=services]');}
  if(fields[key]){const input=form.elements.namedItem(fields[key]);if(!input.validity.valid){control=input;message=key==='guests'?'Informe uma quantidade inteira de convidados, maior que zero, ou pule esta pergunta.':'Confira a resposta ou deixe em aberto.';}}
  if(!message)return true;
  error.textContent=message;error.hidden=false;control?.setAttribute('aria-invalid','true');control?.setAttribute('aria-describedby','form-error');control?.focus();return false;
 }
 form.addEventListener('submit',event=>{event.preventDefault();if(valid()){journey.next(getState());render(true);}});
 back.addEventListener('click',()=>{journey.back(getState());render(true);});
 skip.addEventListener('click',()=>{const name=fields[journey.current()];if(name&&!form.elements.namedItem(name).validity.valid)form.elements.namedItem(name).value=getState()[name];journey.next(getState());render(true);});
 $('[data-chat-use-choices]').addEventListener('click',()=>{journey.useChoices();render(true);});
 form.addEventListener('click',event=>{const edit=event.target.closest('[data-chat-edit]');if(edit){journey.edit(edit.dataset.chatEdit);render(true);}});
 render();
 return {sync(state,source){if(source==='reset')journey.reset();renderHistory(state);if(source!=='typing')render();else skip.textContent=meaningful(journey.current(),state)?'Manter resposta':'Pular por enquanto';},restoreProgress(){journey=createJourney(storage);render();},showReview(focus=false){journey.review();render(focus);}};
}
