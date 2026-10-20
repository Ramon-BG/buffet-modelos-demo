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
        "Formas de servir",
        "Crepe no cone",
        "Crepe no prato"
      ],
      [
        "Para combinar",
        "Recheios salgados",
        "Recheios doces"
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
        "Uma ideia de composição",
        "Queijos e frios",
        "Pães e acompanhamentos",
        "Frutas e geleias"
      ],
      [
        "Pequenas porções",
        "Batatas e finalizações",
        "Espetos caprese",
        "Outras opções a combinar"
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
        "Cortes a combinar",
        "Espetos",
        "Opções de legumes"
      ],
      [
        "Acompanhamentos",
        "Arroz",
        "Saladas",
        "Farofa"
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
        "Opções curtas",
        "Opções longas"
      ],
      [
        "Para finalizar",
        "Molhos a combinar",
        "Legumes",
        "Complementos"
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
        "Para explorar",
        "Salgados tradicionais",
        "Dadinhos de tapioca"
      ],
      [
        "Outras possibilidades",
        "Mini sanduíches",
        "Mini pizzas"
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
        "Para combinar",
        "Composição da feijoada",
        "Seleção de carnes"
      ],
      [
        "Acompanhamentos",
        "Arroz e couve",
        "Farofa e vinagrete",
        "Laranja e outros complementos"
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
        "Possibilidades",
        "Fondue de queijo",
        "Opções de carne a combinar"
      ],
      [
        "Para finalizar",
        "Fondue de chocolate",
        "Frutas e acompanhamentos"
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
