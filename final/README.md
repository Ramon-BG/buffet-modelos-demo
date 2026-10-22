# Mesa Viva — versão revisada

Modelo fictício de buffet. Revisão técnica e de experiência de 21/10/2026.

## Experiência

- Abertura fotográfica com texto estável, pausa, seleção direta e movimento reduzido. Marca Mesa Viva e fotografias ilustrativas preservadas.
- Inicial breve com três prévias de comida. Cardápios abrem em um painel na própria página, com sete modalidades combináveis e a mesma notinha. A página completa continua disponível por link direto e sem JavaScript; a galeria permanece separada.
- Cardápios em lista de largura total, sem vazios entre colunas ao expandir. Chevron abre as opções; Selecionar/Remover controla a inclusão no evento.
- A mesma notinha acompanha o pedido entre páginas. Começa recolhida, salvo preferência explícita da aba. Seu conteúdo fechado fica fora do teclado e da leitura assistiva.
- Conversa com voltar, perguntas opcionais e atalho “Revisar com o que já sei”. O atalho preserva respostas confirmadas.
- Edição temporária: a notinha mantém o pedido confirmado enquanto a resposta é alterada. Salvar confirma uma resposta válida; Cancelar mantém a anterior. Alteração de tipo de pedido que exige cardápios só é confirmada com as escolhas necessárias.
- Edição em andamento e progresso podem ser retomados na mesma aba. Recomeçar limpa pedido, progresso e edição temporária. Desfazer recupera o pedido anteriormente confirmado.
- Simular, copiar e baixar usam a mesma regra de validação. Não há envio real.

## Organização

- menu-panel.js e menu-panel.css: consulta dos cardápios na inicial, seleção compartilhada, foco e animação de abertura/fechamento.
- data.js: conteúdo e modalidades.
- order-rules.js: regras comuns e normalização de respostas.
- draft.js: único pedido confirmado, sanitização, armazenamento e mensagem.
- order-flow.js: percurso das perguntas e buffer de edição por campos.
- conversation.js: campos, foco, navegação e confirmação/cancelamento da edição.
- app.js: integração das páginas, resumos e saídas; companion.js: apresentação da notinha.
- hero.js e motion.js: apresentação e movimento, independentes das escolhas.

Uma edição salva apenas os campos que possui, preservando alterações realizadas em outras partes do pedido. Valores inválidos digitados não apagam respostas confirmadas. Armazenamento bloqueado ou corrompido é tratado sem impedir o funcionamento em memória.

## Desenvolvimento

Sem dependências de produção ou etapa de build. Sirva os arquivos por HTTP: `python -m http.server 8765` na pasta do projeto; abra `/final/` no checkout ou `/` se estiver servindo apenas a pasta final. Módulos não devem ser abertos pelo explorador com file://.

No checkout do GitHub, com Node.js instalado: `npm test` ou `node checks/run.mjs`. As quatro suítes executam 33 verificações comportamentais. Não é necessário instalar pacotes. O ZIP local contém o site pronto para servir; os testes estão no repositório.

## Conteúdo e limites

Nome, cidade, sabores e composições são exemplos. Não há avaliações inventadas, preços ou disponibilidade confirmada. Salgados, feijoada e fondue têm espaços editoriais para fotos futuras. Créditos das fotografias e licenças das fontes locais foram preservados.

WhatsApp é simulação local. Não há painel administrativo, agenda, reservas, pagamentos ou persistência em servidor. Rascunho, percurso e edição ficam em sessionStorage na mesma aba. A chave do pedido foi preservada; coquetel continua compatível com rascunhos anteriores sem ser oferecido como oitava modalidade. Noindex é intencional para esta demonstração.

## Verificação

33 verificações programáticas: sete do pedido, dez de apresentação, cinco de percurso e onze de edição/validação. Auditoria dos 12 HTMLs, módulos e sintaxe JavaScript. Limpeza de 51 ramos de seletores obsoletos, conferidos contra HTML e scripts.

Percursos de navegador: resposta inválida sem perda da anterior; salvar/cancelar; tipo de pedido e cardápios confirmados juntos; retomada da edição; seleção e remoção externas preservadas; validação ao simular/copiar/baixar; cuidados cancelados; mensagem atual; cardápios por teclado. Conferência de largura em 320, 390, 768, 1280 e 1676 pixels para pedido e cardápios, sem rolagem lateral observada. Aparelhos físicos e métricas de campo permanecem pendentes.

Publicação: https://ramon-bg.github.io/buffet-modelos-demo/final/. Os relatórios completos e o pacote da revisão ficam nos outputs locais do projeto de trabalho.

## Painel de cardápios — 21/10/2026

A inicial apresenta três fotografias compactas. Os links de cardápios da inicial abrem o mesmo painel com sete modalidades, conteúdo derivado de data.js e seleção ligada ao único pedido confirmado. O total escolhido é visível no rodapé do painel; a notinha e a conversa são atualizadas pela mesma store.

Desktop: janela ampla com navegação por modalidade e fotografia ao lado das opções. Celular: painel inferior com seletor nativo, conteúdo rolável e ações fixas. Em telas baixas, a fotografia fica menor para priorizar a leitura. Modalidades sem fotografia têm composição de texto, sem imagens comerciais inventadas.

Abrir e fechar respeitam movimento reduzido. Fechar, Concluir escolhas e Escape preservam a posição da página e devolvem o foco ao item de origem. O teclado circula dentro do painel. Os links HTML continuam levando ao catálogo completo sem JavaScript ou quando abertos em outra aba; a galeria e os modelos anteriores permanecem disponíveis.

Verificação desta alteração: 33 verificações programáticas, auditoria dos 12 HTMLs e sintaxe dos módulos; consulta das sete modalidades, combinações, remoção, fechamento, retomada, teclado e continuidade no questionário conferidos no navegador. Larguras de 320, 390, 768, 1280 e 1676 pixels, incluindo altura de 568 pixels. Aparelhos físicos não foram testados.
