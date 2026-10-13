const menuButton = document.querySelector('.menu-toggle');
const navigation = document.querySelector('#navegacao');
function closeMenu() { navigation.classList.remove('open'); menuButton.setAttribute('aria-expanded','false'); }
menuButton.addEventListener('click', () => {
  const open = menuButton.getAttribute('aria-expanded') !== 'true';
  menuButton.setAttribute('aria-expanded',String(open)); navigation.classList.toggle('open',open);
});
navigation.querySelectorAll('a').forEach(link => link.addEventListener('click',closeMenu));
document.addEventListener('keydown', event => { if(event.key === 'Escape' && navigation.classList.contains('open')) {closeMenu();menuButton.focus();} });

const flavors = {
  crepe:{image:'crepe',alt:'Crepe em uma frigideira — imagem ilustrativa',note:'CREPE FRANCÊS · FOTOGRAFIA DE REFERÊNCIA',kicker:'DA CHAPA PARA A FESTA',title:'Crepes preparados para o seu evento.',description:'Neste exemplo, os crepes são preparados no local. Recheios, equipe e tempo de serviço são combinados para cada evento.',question:'Pergunte sobre recheios e formatos de serviço.',service:'Crepes',cta:'Quero crepes no meu evento'},
  massas:{image:'massas',alt:'Espaguete com molho — fotografia ilustrativa CC0',note:'MASSAS · FOTOGRAFIA CC0',kicker:'MASSAS À MESA',title:'Massas para reunir seus convidados.',description:'Mesa e estação de massas são formatos deste exemplo. Tipos de massa, molhos e acompanhamentos são definidos na proposta.',question:'Pergunte quais massas e molhos estão disponíveis.',service:'Massas',cta:'Quero massas no meu evento'},
  churrasco:{image:'churrasco',alt:'Espetos na churrasqueira — fotografia ilustrativa',note:'CHURRASCO · FOTOGRAFIA DE REFERÊNCIA',kicker:'O ENCONTRO É NA BRASA',title:'Churrasco para sua comemoração.',description:'Neste exemplo, o churrasco combina preparo e atendimento no evento. Cortes, acompanhamentos e estrutura são confirmados antes da contratação.',question:'Confirme os cortes, acompanhamentos e a estrutura no local.',service:'Churrasco',cta:'Quero churrasco no meu evento'},
  coquetel:{image:'coquetel',alt:'Miniaturas e aperitivos — fotografia ilustrativa CC0',note:'COQUETEL · FOTOGRAFIA DE REFERÊNCIA',kicker:'ENTRE UMA CONVERSA E OUTRA',title:'Coquetel para receber seus convidados.',description:'Este exemplo apresenta coquetel para celebrações. Conte como será a ocasião para conhecer as opções de serviço.',question:'Pergunte pelas opções de mesa e formato de atendimento.',service:'Coquetel',cta:'Quero coquetel no meu evento'}
};
const flavorButtons = [...document.querySelectorAll('.flavor')];
let selectedFlavor = 'crepe';
function selectFlavor(button, focus=false) {
  selectedFlavor=button.dataset.flavor;
  flavorButtons.forEach(item => { const active=item===button;item.classList.toggle('active',active);item.setAttribute('aria-selected',String(active));item.tabIndex=active?0:-1; });
  const data=flavors[selectedFlavor];
  const photo=document.querySelector('#flavor-photo');photo.src=`assets/${data.image}-960.webp?v=10`;photo.alt=data.alt;
  document.querySelector('#flavor-panel').setAttribute('aria-labelledby',button.id);
  for(const [id,key] of [['flavor-photo-note','note'],['flavor-kicker','kicker'],['flavor-title','title'],['flavor-description','description'],['flavor-question','question']]) document.getElementById(id).textContent=data[key];
  if(focus) button.focus();
}
flavorButtons.forEach((button,index) => {
  button.addEventListener('click',()=>selectFlavor(button));
  button.addEventListener('keydown',event=> {
    let next;
    if(event.key==='ArrowRight') next=(index+1)%flavorButtons.length;
    if(event.key==='ArrowLeft') next=(index+flavorButtons.length-1)%flavorButtons.length;
    if(event.key==='Home') next=0;
    if(event.key==='End') next=flavorButtons.length-1;
    if(next!==undefined) {event.preventDefault();selectFlavor(flavorButtons[next],true);}
  });
});

const dialog=document.querySelector('#photo-dialog');
const photos=[...document.querySelectorAll('.gallery-item')];
let photoIndex=0;
function displayPhoto(index) {
  photoIndex=(index+photos.length)%photos.length;const item=photos[photoIndex];
  const img=document.querySelector('#dialog-photo');img.src=`assets/${item.dataset.image}-960.webp?v=10`;img.alt=item.dataset.caption;
  document.querySelector('#dialog-caption').textContent=item.dataset.caption;
  document.querySelector('#photo-counter').textContent=`${photoIndex+1} de ${photos.length}`;
}
photos.forEach((button,index)=>button.addEventListener('click',()=>{displayPhoto(index);dialog.showModal();}));
dialog.querySelector('.dialog-close').addEventListener('click',()=>dialog.close());
document.querySelector('#photo-prev').addEventListener('click',()=>displayPhoto(photoIndex-1));
document.querySelector('#photo-next').addEventListener('click',()=>displayPhoto(photoIndex+1));
dialog.addEventListener('keydown',event=>{if(event.key==='ArrowRight'){event.preventDefault();displayPhoto(photoIndex+1);}if(event.key==='ArrowLeft'){event.preventDefault();displayPhoto(photoIndex-1);}});
dialog.addEventListener('click',event=> {if(event.target!==dialog)return;const rect=dialog.getBoundingClientRect();if(event.clientX<rect.left||event.clientX>rect.right||event.clientY<rect.top||event.clientY>rect.bottom)dialog.close();});
if('IntersectionObserver' in window) {
  const float=document.querySelector('.floating-wa');
  new IntersectionObserver(entries=>entries.forEach(entry=>{float.classList.toggle('near-form',entry.isIntersecting);float.tabIndex=entry.isIntersecting?-1:0;float.setAttribute('aria-hidden',String(entry.isIntersecting));}),{threshold:0}).observe(document.querySelector('#orcamento'));
}
