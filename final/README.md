# Mesa Viva — apresentação revisada

Modelo fictício de buffet. Revisão de 20/10/2026, baseada na hierarquia dos modelos simples, no pedido único da versão final e na organização do catálogo enviado.

## Experiência

- Abertura com três fotografias existentes, texto e CTA estáveis. Dissolução de 650 ms, intervalo de 7 segundos, seleção direta, pausa, teclado e gesto; pausa por foco, ponteiro, aba oculta ou saída da área visível. Movimento reduzido inicia sem rotação automática.
- Sete modalidades: crepe francês, ilha gastronômica, churrasco, massas, salgados, feijoada e fondue. Catálogo visível, sem segundo carrossel automático. Cada modalidade possui página de detalhes.
- Uma notinha acompanha o mesmo rascunho em todas as páginas. O botão textual mostra/oculta a própria lista e preserva as escolhas. Abaixo de 1360 px, começa recolhida, salvo preferência explícita da aba.
- Seleção e remoção no catálogo, remoção/desfazer no resumo, pedido em três etapas, edição antes da revisão, cópia e download. Buffet completo é intenção, não inclusão automática de todos os serviços.
- Planejador extenso e destaques sociais fictícios saíram da página principal. A galeria mantém filtro, ampliação e navegação.

## Conteúdo e limites

Mesa Viva, cidade, descrições e composições são exemplos. Não há preços de buffet, depoimentos inventados, disponibilidade confirmada, Instagram conectado ou contato real.

Não foram buscadas novas fotos. As existentes são ilustrativas e mantêm os créditos. Salgados, feijoada e fondue usam espaços editoriais “Fotografia a definir”, evitando apresentar outro prato como se fosse o serviço. Fraunces e Source Sans 3 são locais e têm licenças em assets/.

O WhatsApp continua como simulação local; nenhum pedido é transmitido. Não há painel administrativo, banco de dados, agenda ou pagamentos. A chave de armazenamento da aba permanece a mesma; a opção legada coquetel é preservada em pedidos anteriores sem aparecer como oitavo serviço do catálogo.

## Arquivos e prévia

Sirva esta pasta por HTTP, por exemplo `python -m http.server 8765`. Abrir index.html pelo explorador não executa os módulos JavaScript corretamente.

data.js contém serviços; hero.js controla apenas as fotos; draft.js mantém estado único; app.js integra os fluxos; companion.js apresenta o resumo. HTMLs contêm o catálogo e os detalhes estáticos. site.css, receipt.css e motion.css organizam apresentação, resumo e movimento.

## Verificação

15 testes programáticos passaram, incluindo sete serviços, legado, armazenamento indisponível, seleção aditiva, mensagem, resumo recolhido, preferência restaurada e independência do carrossel. Dez HTMLs passaram na auditoria de links, âncoras, imagens e bloqueio de indexação. JavaScript passou na verificação de sintaxe. A inicial respondeu HTTP 200 na prévia local.

O teste de apresentação usa DOM mínimo e não substitui navegador real. Não houve validação visual nesta sessão: nenhum navegador de controle estava disponível. Conferência em aparelhos reais e métricas de campo permanecem pendentes.

A atualização do GitHub não foi concluída: a integração recusou escrita (403) e a autenticação do CLI está inválida. O endereço público pode continuar mostrando a revisão anterior.
