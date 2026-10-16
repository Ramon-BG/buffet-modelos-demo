import {SERVICES,OCCASIONS,FORMATS,REQUESTS,INTERESTS} from './data.js?v=1';
export const STORAGE_KEY='mesa-viva-final-draft-v1';
export const emptyDraft=()=>({request:'orientacao',services:[],occasion:'',format:'',date:'',guests:'',place:'',note:'',interests:[]});
const pick=(value,source,fallback='')=>Object.hasOwn(source,value)?value:fallback;
const text=(value,max)=>typeof value==='string'?value.slice(0,max):'';
export function sanitize(value){
  if(!value||typeof value!=='object'||Array.isArray(value))return emptyDraft();
  const services=Array.isArray(value.services)?[...new Set(value.services.filter(s=>typeof s==='string'&&Object.hasOwn(SERVICES,s)))]:[];
  let date=text(value.date,10);
  const parsed=new Date(date+'T12:00:00Z');
  if(!/^\d{4}-\d{2}-\d{2}$/.test(date)||Number.isNaN(parsed.getTime())||parsed.toISOString().slice(0,10)!==date)date='';
  const guests=/^[1-9]\d{0,5}$/.test(String(value.guests||''))&&Number(value.guests)<=100000?String(value.guests):'';
  return {request:pick(value.request,REQUESTS,'orientacao'),services,occasion:pick(value.occasion,OCCASIONS),format:pick(value.format,FORMATS),date,guests,place:text(value.place,120),note:text(value.note,600),interests:Array.isArray(value.interests)?[...new Set(value.interests.filter(i=>INTERESTS.includes(i)))]:[]};
}
export const dateLabel=value=>value?value.split('-').reverse().join('/'):'A definir';
export function buildMessage(state){
  const lines=['Olá, Mesa Viva! Gostaria de pedir um orçamento.','O que procuro: '+REQUESTS[state.request]+'.'];
  if(state.services.length)lines.push((state.request==='completo'?'Preferências para conversar: ':'Serviços de interesse: ')+state.services.map(key=>SERVICES[key].name).join(', '));
  if(state.request==='completo')lines.push('Quero conversar sobre uma solução completa. Cardápio, equipe e estrutura a confirmar.');
  if(state.occasion)lines.push('Ocasião: '+OCCASIONS[state.occasion]);
  if(state.format)lines.push('Jeito de receber: '+FORMATS[state.format]);
  if(state.date)lines.push('Data: '+dateLabel(state.date));
  if(state.guests)lines.push('Convidados: aproximadamente '+state.guests);
  if(state.place.trim())lines.push('Local: '+state.place.trim());
  if(state.interests.length)lines.push('Pontos para conversar: '+state.interests.join(', '));
  if(state.note.trim())lines.push('Observações: '+state.note.trim());
  lines.push('Podem me informar as opções e a disponibilidade?');return lines.join('\n');
}
export function createStore(storage){
  let state=emptyDraft(),restored=false;
  try{const raw=storage?.getItem(STORAGE_KEY);if(raw){state=sanitize(JSON.parse(raw));restored=true;}}catch{}
  const listeners=new Set();
  function update(patch,source='action'){
    state=sanitize({...state,...patch});
    try{storage?.setItem(STORAGE_KEY,JSON.stringify(state));}catch{}
    listeners.forEach(listener=>listener(state,source));return state;
  }
  return {get:()=>state,restored,update,subscribe:listener=>listeners.add(listener),
    refresh(){if(!storage)return;try{const raw=storage.getItem(STORAGE_KEY);state=raw?sanitize(JSON.parse(raw)):emptyDraft();listeners.forEach(fn=>fn(state,'restore'));}catch{}},
    add(keys){const services=[...new Set([...state.services,...keys])];return update({services,request:state.request==='completo'?'completo':'servicos'});},
    remove(key){return update({services:state.services.filter(s=>s!==key)});},
    reset(){const old=state;state=emptyDraft();try{storage?.removeItem(STORAGE_KEY);}catch{}listeners.forEach(fn=>fn(state,'reset'));return old;}
  };
}
