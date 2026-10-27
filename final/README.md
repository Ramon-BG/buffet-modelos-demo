# Mesa Viva — apresentação e pedido

Modelo fictício de buffet. Revisão de experiência e desenvolvimento de 23/10/2026.

## Experiência

- Abertura com mesas e pratos finalizados, seleção de fotografia, pausa e movimento reduzido. Marca Mesa Viva e fotografias ilustrativas preservadas.
- Três prévias compactas abrem um painel com sete cardápios combináveis. Links diretos e o catálogo HTML continuam disponíveis sem JavaScript; a galeria permanece em página própria.
- Após escolher cardápios, o painel oferece revisão direta do pedido. Fechar mantém o ponto e o foco de origem; revisar conduz explicitamente ao pedido.
- Caminho rápido: três detalhes opcionais (data, convidados e local), depois de definir o tipo de pedido e as modalidades quando necessário. O visitante pode revisar antes de preencher esses detalhes.
- Caminho guiado: mantém ocasião, formato e cuidados. O controle de troca de roteiro fica compacto durante as perguntas. Trocar o roteiro preserva respostas; jornadas anteriores continuam no percurso original.
- Uma única notinha representa o pedido confirmado. Durante o formulário, o acesso ao resumo fica dentro da seção em todas as larguras; o papel flutuante fica inerte e oculto. O resumo abre em diálogo com conteúdo rolável e fechamento visível. Ao sair da seção, a preferência de abertura anterior é preservada.
- A revisão destaca os detalhes essenciais e os valores preenchidos. Campos adicionais vazios ficam em “Adicionar outros detalhes”; respostas já preenchidas não são ocultadas.
- Edição temporária com salvar/cancelar. Um dado inválido não apaga o anterior; alterar o tipo de pedido e seus serviços obrigatórios é confirmado em conjunto. Simular, copiar e baixar compartilham a validação.
- Mudanças de fotografia no painel aguardam a imagem correta, evitando exibir uma foto de outra modalidade durante o carregamento.

## Organização

- data.js: conteúdo e modalidades.
- order-rules.js: validação comum e normalização.
- draft.js: pedido confirmado, sanitização, armazenamento e mensagem.
- order-flow.js: percurso rápido/guiado, histórico e edição temporária por campos.
- conversation.js: campos, foco, navegação e confirmação/cancelamento.
- companion.js: apresentação da notinha; order-context.js: integração do resumo com o formulário.
- menu-panel.js: consulta dos cardápios e seleção compartilhada; app.js: integração das páginas e saídas.
- hero.js e motion.js: apresentação e movimento independentes das escolhas.
- experience.css: refinamentos do percurso e resumo, sem novas dependências.

Uma edição salva apenas os campos que possui. Mudanças feitas em outras partes do pedido são preservadas. Armazenamento bloqueado ou corrompido não impede o funcionamento em memória.

## Executar e verificar

Sem dependências de produção ou build. Sirva por HTTP e abra /final/ no checkout, ou / se estiver servindo apenas esta pasta. Módulos não devem ser abertos com file://.

No checkout, execute `npm test` ou `node checks/run.mjs` com Node.js instalado. São quatro suítes e 37 verificações: sete do pedido, onze de apresentação, oito de percurso e onze de edição/validação. Não é necessário instalar pacotes.

Conferência de navegador: revisão direta com múltiplos cardápios; rápido e guiado; troca de roteiro; conservação de respostas; validação e cancelamento; detalhes adicionais; resumo com sete serviços; controles visíveis e ausência de rolagem horizontal em larguras solicitadas de 320, 390, 768, 1280 e 1676 pixels, incluindo altura de 568 pixels. Auditoria de 12 HTMLs e sintaxe dos módulos. Publicação registrada nos relatórios locais do projeto.

## Conteúdo e limites

Nome, cidade, sabores e composições são exemplos. Não há avaliações inventadas, preços ou disponibilidade confirmada. Não foram adicionadas fotografias da cliente; créditos e licenças foram preservados. Salgados, feijoada e fondue continuam sem fotografias específicas.

WhatsApp é simulação local. Não há painel administrativo, agenda, reservas, pagamentos ou persistência em servidor. Rascunho, percurso e edição usam sessionStorage na mesma aba. As chaves existentes são preservadas; coquetel continua compatível com rascunhos antigos sem ser oferecido como oitava modalidade. Noindex é intencional para a demonstração.

Apresentação e fluxos foram verificados no navegador; aparelhos físicos, métricas de campo e testes com clientes reais permanecem pendentes. A revisão não atribui nota automática de qualidade ou de conversão.

Execução: sirva o repositório por HTTP e abra /final/. GitHub Pages desativado; consulte o README da raiz.
