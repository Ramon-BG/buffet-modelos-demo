# Mesa Viva — cardápios e pedido guiado

Modelo fictício de buffet. Revisão iniciada em 20/10 e concluída em 21/10/2026.

## Experiência

- Abertura fotográfica preservada: três fotos de fundo, texto estável, seleção direta, pausa, teclado e gesto. Movimento reduzido inicia sem troca automática.
- Inicial curta: visão das sete modalidades, acesso aos cardápios e pedido. Cardápios completos em cardapios.html; galeria em galeria.html. Ambas ligadas no cabeçalho.
- Sete cardápios em linhas compactas, expansíveis: crepe francês, ilha gastronômica, churrasco, massas, salgados, feijoada e fondue. Mais de uma modalidade pode integrar o mesmo evento.
- Uma notinha acompanha o mesmo rascunho entre as páginas. Meu evento abre/fecha com transição; começa recolhida salvo preferência da aba. Conteúdo fechado fica fora do teclado e da leitura assistiva; Escape recolhe.
- Pedido em conversa guiada, uma pergunta por vez. Voltar preserva respostas; perguntas opcionais podem ficar em aberto. Histórico recolhível e revisão permitem editar qualquer resposta. Quem já escolheu cardápios pode usar essas escolhas e seguir.
- A posição da conversa também é retomada. Recomeçar limpa pedido e progresso, inclusive ao retornar pelo histórico do navegador. Buffet completo indica intenção e não inclui automaticamente todos os serviços.
- Introdução do pedido e título das dúvidas ficam acima dos respectivos conteúdos, sem colunas concorrentes. Cópia, download e simulação da mensagem continuam disponíveis na revisão.

## Conteúdo e limites

Mesa Viva, cidade, descrições e sabores são exemplos. Não há preços de buffet, depoimentos inventados, disponibilidade confirmada ou contato real. Não foram buscadas novas fotos. As existentes são ilustrativas e mantêm os créditos; salgados, feijoada e fondue têm espaços editoriais para fotografias futuras.

Lora e Source Sans 3 são fontes locais com licenças em assets/. WhatsApp é simulação local; nenhum pedido é transmitido. Não há painel administrativo, banco de dados, agenda ou pagamentos. Rascunho e progresso ficam no sessionStorage da mesma aba. A chave do rascunho foi preservada; coquetel permanece compatível com pedidos antigos sem ser oferecido como oitava modalidade.

## Arquivos e prévia

Sirva a pasta por HTTP, por exemplo `python -m http.server 8765`. Abrir index.html pelo explorador não executa corretamente os módulos.

data.js contém os serviços; draft.js mantém o estado único; conversation.js controla as perguntas e o progresso; companion.js apresenta a notinha; app.js integra os fluxos; hero.js controla as fotos. Os testes ficam em checks/ no repositório.

## Verificação

22 verificações programáticas: sete do rascunho, dez de apresentação e cinco da navegação da conversa. Doze páginas auditadas para links, âncoras, imagens e bloqueio de indexação; JavaScript conferido na sintaxe.

No navegador: seleção de modalidades, continuidade entre cardápios, galeria e pedido, voltar, pular, validação de convidados, edição na revisão e no histórico, perguntas deixadas em aberto, mensagem simulada e recomeço do pedido entre páginas. Sem rolagem lateral nas larguras solicitadas de 320, 390, 768, 1280 e 1676 pixels. Aparelhos físicos e métricas de campo não foram medidos.

Endereço do modelo: https://ramon-bg.github.io/buffet-modelos-demo/final/. A confirmação da publicação e os registros detalhados ficam nos relatórios locais outputs/site-final-publicacao.json e outputs/site-final-ui-ux-verificacao.json.
