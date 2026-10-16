# Mesa Viva · Versão final de demonstração

Acesse: https://ramon-bg.github.io/buffet-modelos-demo/final/

Inicial, quatro páginas de serviços e créditos. A marca, cidade e cardápios são fictícios. Fotografias ilustrativas; fontes e licenças em creditos.html e assets/OFL-*.txt.

O pedido funciona em uma única aba, com armazenamento temporário no navegador. Não existe banco de dados, cadastro, agenda, pagamento ou reserva. O botão de WhatsApp abre apenas uma simulação local; nenhum dado é transmitido. Os destaques sociais são selecionados manualmente, sem conexão com uma conta do Instagram.

Uma única notinha acompanha a navegação. Em telas largas, ocupa uma lateral reservada depois da abertura; nas outras telas, aparece como barra compacta. Ela confirma as alterações, permite remover e desfazer, pode ser recolhida e mantém os detalhes do evento fechados até a consulta. Os resumos repetidos foram retirados; a conferência completa permanece na revisão do pedido e no resumo aberto por toque.

Os arquivos são estáticos e precisam ser servidos por HTTP para os módulos JavaScript funcionarem. Publique o conteúdo desta pasta em um servidor de arquivos estáticos, como o GitHub Pages. Abrir index.html diretamente pelo explorador de arquivos não executa o fluxo completo.

Arquivos principais: index.html, site.css, receipt.css, app.js, companion.js, data.js, draft.js e carousel.js. O conteúdo dos serviços e das sugestões está em data.js; os textos estruturais permanecem nas páginas HTML. Sem instalação de pacotes ou ferramentas de compilação.

Antes da versão real: validar identidade, textos e cardápios com a cliente; inserir contato e links oficiais; substituir as fotos por registros autorizados quando disponíveis; adaptar a ação de contato; conferir privacidade, domínio, metadados e indexação; medir desempenho e testar em aparelhos reais. O rascunho está intencionalmente bloqueado para indexação.
