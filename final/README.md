# Mesa Viva — cardápios e apresentação

Modelo fictício de buffet. Revisão de 20/10/2026, baseada na hierarquia dos modelos simples, no pedido único da versão final e na organização do catálogo enviado.

## Experiência

- Abertura com três fotografias existentes ao fundo de toda a seção, texto e CTA estáveis. Dissolução de 900 ms, intervalo de 7 segundos, seleção direta, pausa, teclado e gesto. Foco, controles sob o ponteiro, aba oculta e saída da área visível pausam a rotação. Movimento reduzido inicia sem troca automática.
- Sete modalidades: crepe francês, ilha gastronômica, churrasco, massas, salgados, feijoada e fondue. Cada cardápio pode ser expandido na inicial e tem uma página com detalhes. Exemplos de sabores não representam o cardápio contratado.
- Uma notinha acompanha o mesmo rascunho em todas as páginas. O botão “Meu evento” abre/fecha a lista com transição, sem apagar escolhas. Começa recolhida em todas as telas, salvo preferência da aba. Conteúdo fechado fica fora do teclado e da leitura assistiva; Escape recolhe e devolve o foco ao botão.
- Seleção e remoção no catálogo, remoção/desfazer no resumo, pedido em três etapas, edição antes da revisão, cópia e download. Buffet completo é intenção, não inclusão automática de todos os serviços.
- O cabeçalho usa a largura da tela e dá acesso aos cardápios, à galeria e ao pedido. A explicação do processo fica junto do formulário. A galeria tem página própria, filtros, ampliação e navegação por teclado.

## Conteúdo e limites

Mesa Viva, cidade, descrições e composições são exemplos. Não há preços de buffet, depoimentos inventados, disponibilidade confirmada, Instagram conectado ou contato real.

Não foram buscadas novas fotos. As existentes são ilustrativas e mantêm os créditos. Salgados, feijoada e fondue usam espaços editoriais “Foto a definir”. Lora e Source Sans 3 são locais e têm licenças em assets/. A Lora foi obtida do Google Fonts, com SIL OFL do repositório oficial.

O WhatsApp continua como simulação local; nenhum pedido é transmitido. Não há painel administrativo, banco de dados, agenda ou pagamentos. A chave de armazenamento da aba permanece a mesma; a opção legada coquetel é preservada em pedidos anteriores sem aparecer como oitavo serviço do catálogo.

## Arquivos e prévia

Sirva esta pasta por HTTP, por exemplo `python -m http.server 8765`. Abrir index.html pelo explorador não executa os módulos JavaScript corretamente.

data.js contém serviços; hero.js controla apenas as fotos; draft.js mantém estado único; app.js integra os fluxos; companion.js apresenta o resumo. HTMLs contêm o catálogo e os detalhes estáticos. site.css, receipt.css e motion.css organizam apresentação, resumo e movimento.

## Verificação

17 testes programáticos passaram, incluindo sete serviços, legado, armazenamento indisponível, seleção aditiva, mensagem, resumo recolhido, preferência restaurada, fechamento por Escape, galeria separada e independência do carrossel. Onze HTMLs passaram na auditoria de links, âncoras, imagens e bloqueio de indexação. JavaScript passou na verificação de sintaxe.

Além dos testes com DOM mínimo, houve conferência no navegador: abertura, expansão dos cardápios, seleção combinada, resumo, remover/desfazer, navegação entre páginas, filtros/ampliação, revisão, edição dos serviços e convidados e simulação da mensagem. Sem rolagem lateral nas larguras solicitadas de 320, 390, 768, 1280 e 1676 pixels. O navegador reserva 15 pixels para a barra; a largura útil foi registrada separadamente. Conferência em aparelhos físicos e métricas de campo permanecem pendentes.

Endereço do modelo: https://ramon-bg.github.io/buffet-modelos-demo/final/. A confirmação da revisão publicada e da entrega dos arquivos públicos fica em outputs/site-final-publicacao.json no projeto de trabalho.
