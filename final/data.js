export const SERVICES = {
  "crepes": {
    "name": "Crepe francês",
    "image": "crepe",
    "kicker": "No cone ou no prato",
    "title": "Crepes, preparados no encontro.",
    "description": "Duas formas de servir: no cone, para circular, ou no prato, para aproveitar à mesa.",
    "format": "Crepe no cone ou no prato",
    "check": "Recheios doces e salgados, formato e tempo de atendimento.",
    "menu": [
      [
        "Salgados",
        "Frango com requeijão",
        "Presunto e queijo",
        "Queijo, tomate e manjericão"
      ],
      [
        "Doces",
        "Chocolate com morango",
        "Doce de leite",
        "Banana com canela"
      ]
    ],
    "needs": [
      "Formato de serviço",
      "Opções de recheio",
      "Estrutura e duração do atendimento"
    ]
  },
  "ilha": {
    "name": "Ilha gastronômica",
    "image": "mesa",
    "kicker": "Para compartilhar",
    "title": "Uma mesa que convida a ficar.",
    "description": "Queijos, pães, frutas e pequenas porções em uma proposta para compartilhar.",
    "format": "Mesa de sabores e pequenas porções",
    "check": "Seleção de itens, montagem e reposição.",
    "menu": [
      [
        "Na mesa",
        "Queijos e frios",
        "Pães e torradas",
        "Geleias, patês e frutas"
      ],
      [
        "Pequenas porções",
        "Batatas com creme de queijo",
        "Espetos caprese"
      ]
    ],
    "needs": [
      "Composição da mesa",
      "Conservação e reposição",
      "Espaço de montagem"
    ]
  },
  "churrasco": {
    "name": "Churrasco",
    "image": "churrasco",
    "kicker": "O encontro é na brasa",
    "title": "Churrasco para reunir.",
    "description": "Cortes e acompanhamentos para uma refeição descontraída, com estrutura a combinar.",
    "format": "Preparo e serviço no evento",
    "check": "Cortes, acompanhamentos e espaço de preparo.",
    "menu": [
      [
        "Na brasa",
        "Carne bovina",
        "Frango e linguiça",
        "Legumes grelhados"
      ],
      [
        "Acompanhamentos",
        "Arroz e farofa",
        "Vinagrete",
        "Saladas"
      ]
    ],
    "needs": [
      "Cortes e acompanhamentos",
      "Área de preparo apropriada",
      "Montagem e tempo de serviço"
    ]
  },
  "massas": {
    "name": "Massas",
    "image": "massas",
    "kicker": "Uma refeição com calma",
    "title": "Massas do seu jeito.",
    "description": "Uma estação de finalização, com massas, molhos e complementos escolhidos na conversa.",
    "format": "Estação de massas",
    "check": "Tipos de massa, molhos e complementos.",
    "menu": [
      [
        "Massas",
        "Penne",
        "Espaguete"
      ],
      [
        "Molhos e finalizações",
        "Tomate e manjericão",
        "Molho branco",
        "Pesto, queijo e legumes"
      ]
    ],
    "needs": [
      "Seleção de massas e molhos",
      "Forma de finalizar e servir",
      "Equipamentos e espaço de apoio"
    ]
  },
  "salgados": {
    "name": "Salgados",
    "image": null,
    "kicker": "Entre uma conversa e outra",
    "title": "Pequenos sabores para o encontro.",
    "description": "Salgados e pequenas porções para receber, com variedade e forma de servir a combinar.",
    "format": "Salgados e pequenas porções",
    "check": "Variedade, quantidades e forma de servir.",
    "menu": [
      [
        "Clássicos",
        "Coxinha",
        "Bolinho de queijo",
        "Dadinhos de tapioca"
      ],
      [
        "Mini porções",
        "Mini hambúrguer",
        "Mini hot dog",
        "Mini pizza"
      ]
    ],
    "needs": [
      "Seleção e quantidades",
      "Conservação e reposição",
      "Formato do atendimento"
    ]
  },
  "feijoada": {
    "name": "Feijoada",
    "image": null,
    "kicker": "Uma mesa brasileira",
    "title": "Feijoada para compartilhar.",
    "description": "Uma refeição com acompanhamentos, em uma composição definida para o seu evento.",
    "format": "Refeição com acompanhamentos",
    "check": "Versão da feijoada, acompanhamentos e serviço.",
    "menu": [
      [
        "Feijoada",
        "Versão tradicional",
        "Composição mais leve, a combinar"
      ],
      [
        "Acompanhamentos",
        "Arroz, farofa e couve",
        "Vinagrete e banana",
        "Laranja"
      ]
    ],
    "needs": [
      "Composição e acompanhamentos",
      "Preferências dos convidados",
      "Estrutura para manter e servir"
    ]
  },
  "fondue": {
    "name": "Fondue",
    "image": null,
    "kicker": "Um encontro acolhedor",
    "title": "Fondue para aproveitar sem pressa.",
    "description": "Queijos, acompanhamentos e opções doces para uma proposta de encontro acolhedora.",
    "format": "Fondue e acompanhamentos",
    "check": "Tipos de fondue, acompanhamentos e equipamentos.",
    "menu": [
      [
        "Para compartilhar",
        "Queijos com pães e batatas",
        "Carnes com molhos"
      ],
      [
        "Para finalizar",
        "Chocolate com frutas",
        "Acompanhamentos doces"
      ]
    ],
    "needs": [
      "Composição e sequência de serviço",
      "Equipamentos e espaço",
      "Preferências e restrições alimentares"
    ]
  }
};
// Preserve previous drafts without offering an unconfirmed eighth service.
Object.defineProperty(SERVICES,"coquetel",{value:{"name": "Coquetel (rascunho anterior)", "image": "coquetel", "description": "Opção preservada apenas para pedidos iniciados na versão anterior.", "menu": [], "needs": []},enumerable:false});
export const OCCASIONS={aniversario:'Aniversário',casamento:'Casamento ou noivado',empresa:'Evento de empresa',casa:'Encontro em casa',formatura:'Formatura',outra:'Outra ocasião'};
export const FORMATS={circulando:'Pessoas circulando',mesa:'Todo mundo à mesa',informal:'Encontro informal'};
export const REQUESTS={orientacao:'Preciso de orientação',servicos:'Quero escolher os serviços',completo:'Quero um buffet completo'};
export const INTERESTS=['Opções vegetarianas','Restrições alimentares','Estrutura e utensílios'];
export const SUGGESTIONS={
 circulando:{services:['ilha'],image:'mesa',text:'Uma ilha gastronômica pode receber os convidados enquanto circulam e conversam.'},
 mesa:{services:['massas'],image:'massas',text:'Massas podem ser um ponto de partida para uma refeição à mesa.'},
 informal:{services:['churrasco'],image:'churrasco',text:'Churrasco pode combinar com um encontro informal. A estrutura será combinada.'}
};
export function suggestionFor(occasion,format){
 const base=SUGGESTIONS[format];if(!base)return null;
 if(occasion==='casamento'&&format==='mesa')return {services:['ilha','massas'],image:'massas',text:'Uma possibilidade é receber com uma ilha gastronômica e servir massas na refeição.'};
 if(occasion==='aniversario'&&format==='informal')return {services:['churrasco','crepes'],image:'churrasco',text:'Churrasco e crepes podem compor momentos diferentes. Equipe e horários a confirmar.'};
 return base;
}
