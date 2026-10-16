export const SERVICES = {
  crepes: {name:'Crepes',image:'crepe',kicker:'Preparados na hora',title:'Crepes, entre uma conversa e outra.',description:'Uma estação de preparo no evento, com recheios doces e salgados a combinar.',format:'Preparo no local',check:'Recheios, equipamentos e duração do atendimento.',menu:[['Salgados','Frango com requeijão','Queijos','Legumes'],['Doces','Chocolate e frutas','Doce de leite','Banana com canela']],needs:['Espaço para a estação','Ponto de energia, conforme os equipamentos','Condições de preparo e atendimento']},
  massas: {name:'Massas',image:'massas',kicker:'Uma refeição para compartilhar',title:'À mesa, com tempo para ficar.',description:'Uma refeição ou estação de massas, com molhos e acompanhamentos definidos na conversa.',format:'Refeição ou estação de massas',check:'Tipos de massa, molhos e forma de servir.',menu:[['Massas','Massas curtas','Massas longas','Opção recheada'],['Molhos e acompanhamentos','Molho de tomate','Molho branco','Legumes e finalizações']],needs:['Área de finalização e serviço','Equipamentos e temperatura de atendimento','Apoio para servir os convidados']},
  churrasco: {name:'Churrasco',image:'churrasco',kicker:'O encontro é na brasa',title:'Churrasco para reunir a turma.',description:'Preparo na brasa, com cortes, acompanhamentos e estrutura combinados para o local.',format:'Preparo e serviço no evento',check:'Cortes, acompanhamentos e espaço para a grelha.',menu:[['Na grelha','Cortes a combinar','Espetos','Opções de legumes'],['Acompanhamentos','Arroz','Saladas','Farofa']],needs:['Área apropriada e ventilada','Grelha ou churrasqueira a combinar','Condições de segurança e montagem']},
  coquetel: {name:'Coquetel',image:'coquetel',kicker:'Para receber, sem pressa',title:'Um aperitivo, mais uma conversa.',description:'Aperitivos para convidados circulando, com opções e reposição definidas com a equipe.',format:'Aperitivos e pequenas porções',check:'Cardápio, reposição e equipe de atendimento.',menu:[['Aperitivos','Mini sanduíches','Porções frias','Salgados'],['Para completar','Opções quentes','Opções vegetarianas','Pequenas sobremesas']],needs:['Ponto de apoio para montagem','Conservação e reposição dos alimentos','Circulação da equipe no ambiente']}
};
export const OCCASIONS={aniversario:'Aniversário',casamento:'Casamento ou noivado',empresa:'Evento de empresa',casa:'Encontro em casa',formatura:'Formatura',outra:'Outra ocasião'};
export const FORMATS={circulando:'Pessoas circulando',mesa:'Todo mundo à mesa',informal:'Encontro informal'};
export const REQUESTS={orientacao:'Preciso de orientação',servicos:'Quero escolher os serviços',completo:'Quero um buffet completo'};
export const INTERESTS=['Opções vegetarianas','Restrições alimentares','Estrutura e utensílios'];
export const SUGGESTIONS={
  circulando:{services:['coquetel'],image:'coquetel',text:'Aperitivos são uma opção para receber os convidados enquanto circulam e conversam.'},
  mesa:{services:['massas'],image:'massas',text:'Uma refeição de massas pode ser um ponto de partida para reunir os convidados à mesa.'},
  informal:{services:['churrasco'],image:'churrasco',text:'Churrasco pode combinar com um encontro informal. O espaço de preparo precisa ser avaliado.'}
};
export function suggestionFor(occasion,format){
  const base=SUGGESTIONS[format];if(!base)return null;
  if(occasion==='casamento'&&format==='mesa')return {services:['coquetel','massas'],image:'massas',text:'Uma possibilidade é receber com aperitivos e servir massas na refeição. A combinação será confirmada com a equipe.'};
  if(occasion==='aniversario'&&format==='informal')return {services:['churrasco','crepes'],image:'churrasco',text:'Churrasco e crepes podem compor momentos diferentes da festa. Equipe, estrutura e horários precisam ser combinados.'};
  return base;
}
