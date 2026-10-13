(() => {
  const planner=document.querySelector('#descobrir');
  const occasion=planner.querySelector('#planner-occasion');
  const keys={circulando:'coquetel',mesa:'massas',informal:'churrasco'};
  const photo=document.querySelector('#planner-photo');
  function selectedKey(){return keys[planner.querySelector('[name="mood"]:checked').value];}
  function updatePhoto(){
    const key=selectedKey();photo.src=`assets/${flavors[key].image}-480.webp?v=7`;photo.alt=`${flavors[key].service} — fotografia ilustrativa CC0`;
    document.querySelector('#planner-feedback').textContent='';
  }
  function applyOccasion(){
    form.querySelectorAll('[name="occasion"]').forEach(input=>input.checked=input.value===occasion.value);
    refreshMessage();
  }
  occasion.addEventListener('change',applyOccasion);
  form.querySelectorAll('[name="occasion"]').forEach(input=>input.addEventListener('change',()=>occasion.value=input.value));
  planner.querySelectorAll('[name="mood"]').forEach(input=>input.addEventListener('change',updatePhoto));
  document.querySelector('#planner-use').addEventListener('click',()=>{
    const key=selectedKey();
    flavorButtons.find(button=>button.dataset.flavor===key).click();
    if(!document.querySelector('#save-service').textContent.includes('guardado'))document.querySelector('#save-service').click();
    applyOccasion();
    document.querySelector('#planner-feedback').textContent=`Serviço incluído: ${flavors[key].service}.`;
    showStep(0,false);
  });
  updatePhoto();
  if('IntersectionObserver' in window){
    const contact=document.querySelector('.floating-wa');
    new IntersectionObserver(entries=>contact?.classList.toggle('planner-active',entries[0].isIntersecting)).observe(planner);
  }
})();
