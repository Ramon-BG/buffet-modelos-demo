(() => {
  const data = {
    crepe: {format:'Preparo no local',occasion:'Aniversários e encontros em casa',check:'Recheios, equipe, duração e equipamentos'},
    massas: {format:'Mesa ou estação de massas',occasion:'Almoços e jantares com convidados à mesa',check:'Tipos de massa, molhos e acompanhamentos'},
    churrasco: {format:'Grelha e serviço no evento',occasion:'Encontros informais e confraternizações',check:'Cortes, acompanhamentos e espaço para preparo'},
    coquetel: {format:'Aperitivos para convidados circulando',occasion:'Recepções e eventos de empresa',check:'Opções de aperitivos, reposição e atendimento'}
  };
  const info = document.querySelector('#service-facts');
  function updateFacts() {
    const item = data[selectedFlavor];
    info.replaceChildren();
    for (const [label,value] of [['Formato de exemplo',item.format],['Ocasião sugerida',item.occasion],['O que confirmar',item.check]]) {
      const row=document.createElement('div'),dt=document.createElement('dt'),dd=document.createElement('dd');
      dt.textContent=label;dd.textContent=value;row.append(dt,dd);info.append(row);
    }
  }
  const previousSelect = selectFlavor;
  selectFlavor = function(button,focus=false) {previousSelect(button,focus);updateFacts();};
  updateFacts();
  if (!document.body.classList.contains('profissional')) return;
  const summary=document.querySelector('#event-overview');
  const disclosure=summary.querySelector('details');
  const mobile=window.matchMedia('(max-width:760px)');
  disclosure.open=!mobile.matches;
  mobile.addEventListener('change',event=>disclosure.open=!event.matches);
  const values=[['occasion','Ocasião'],['services','Serviços'],['date','Data'],['guests','Convidados'],['place','Local']];
  const list=summary.querySelector('dl');
  const outputs={};
  for (const [key,label] of values) {
    const row=document.createElement('div'),dt=document.createElement('dt'),dd=document.createElement('dd');
    dt.textContent=label;dd.textContent='A definir';outputs[key]=dd;row.append(dt,dd);list.append(row);
  }
  const current=document.querySelector('#brief-step');
  function renderSummary() {
    const fields=new FormData(form);
    const chosen=[...document.querySelectorAll('#chosen-list li span')].map(item=>item.textContent);
    const services=[...new Set([...chosen,fields.get('service')].filter(Boolean))];
    outputs.occasion.textContent=fields.get('occasion')||'A definir';
    outputs.services.textContent=services.join(', ')||'Quero uma sugestão';
    summary.querySelector('summary').textContent=services.length?`Ver resumo · ${services.length} ${services.length===1?'serviço':'serviços'}`:'Ver resumo do evento';
    outputs.date.textContent=fields.get('date')?fields.get('date').split('-').reverse().join('/'):'A definir';
    outputs.guests.textContent=fields.get('guests')?`${fields.get('guests')} convidados`:'A definir';
    outputs.place.textContent=fields.get('place')?.trim()||'A definir';
    current.textContent=['1 · Escolhas do evento','2 · Detalhes do evento','3 · Revisão da mensagem'][currentStep];
    summary.querySelector('#copy-brief').textContent='Copiar meu resumo';
    document.querySelector('#brief-feedback').textContent='';
  }
  const originalRefresh=refreshMessage;
  refreshMessage=function(){originalRefresh();renderSummary();};
  form.addEventListener('input',renderSummary);
  form.addEventListener('change',renderSummary);
  new MutationObserver(renderSummary).observe(document.querySelector('#chosen-list'),{childList:true,subtree:true});
  document.querySelector('#brief-edit-event').addEventListener('click',()=>showStep(0));
  document.querySelector('#brief-edit-details').addEventListener('click',()=>showStep(1));
  document.querySelector('#copy-brief').addEventListener('click',async event=>{
    const button=event.currentTarget;
    const text=message()+'\n\nResumo de demonstração. Não é reserva nem orçamento confirmado.';
    try {await navigator.clipboard.writeText(text);button.textContent='Resumo copiado';document.querySelector('#brief-feedback').textContent='Você pode colar o resumo onde preferir.';}
    catch {showStep(2);document.querySelector('#message-preview').focus();document.querySelector('#message-preview').select();document.querySelector('#brief-feedback').textContent='Selecione e copie a mensagem exibida no formulário.';}
  });
  const originalSave=refreshMessage;
  document.querySelector('#save-service').addEventListener('click',()=>{
    document.querySelector('#service-feedback').textContent=document.querySelector('#save-service').textContent.includes('guardado')?'Serviço adicionado ao seu pedido.':'Serviço retirado das preferências.';
    originalSave();
  });
  document.querySelector('.quote-copy h2').insertAdjacentElement('afterend',summary);
  renderSummary();
})();
