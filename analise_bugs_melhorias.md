# Análise de Bugs e Oportunidades de Melhoria — Mingos Food

Este documento apresenta uma análise técnica e de experiência do usuário (UX) realizada nos arquivos do projeto **Mingos (Pastel & Açaí)** localizados em `C:\Users\PC\Documents\MingusFood\mingus_html_completo`.

Abaixo, os bugs identificados no código-fonte são detalhados e categorizados por gravidade, seguidos de 30 propostas de melhoria para modernizar o sistema.

---

## 🐛 Bugs Identificados no Sistema

### 1. Concorrência e Sobrescrita de Dados (Crítico)
* **Arquivo:** [admin.js](file:///C:/Users/PC/Documents/MingusFood/mingus_html_completo/admin.js#L44)
* **Código:** `if(o.unreadAdmin)firebase.saveDocument('orders',o.id,{...o,unreadAdmin:false})`
* **Causa:** O método `saveDocument` chama o `setDoc` do Firestore sem a opção `{merge: true}`. Isso significa que ele **sobrescreve completamente** o documento do pedido no banco de dados com a versão local da memória (`o`). 
* **Impacto:** Se o cliente atualizar o status do pedido (ex: cancelar antes do aceite, ou confirmar a entrega) ou enviar uma nova mensagem no chat *durante o intervalo* em que o admin está com a tela aberta, a gravação do admin irá reverter as alterações do cliente de forma silenciosa, causando perda de integridade de dados.
* **Correção:** Substituir por uma atualização parcial utilizando `updateDoc`:
  ```javascript
  // No firebase-service.js, criar uma função de atualização específica ou expor o updateDoc:
  async function markOrderAsRead(id) {
    await updateDoc(doc(db, 'orders', String(id)), { unreadAdmin: false, updatedAt: new Date().toISOString() });
  }
  ```

---

### 2. Vazamento de Listeners do Firestore no Painel Admin (Médio)
* **Arquivo:** [admin.js](file:///C:/Users/PC/Documents/MingusFood/mingus_html_completo/admin.js#L44)
* **Código:** `window._adminChatStop=firebase.watchMessages(...)`
* **Causa:** Toda vez que o administrador abre os detalhes de um pedido, uma conexão em tempo real (`onSnapshot`) é aberta para ouvir as mensagens daquele chat. No entanto, quando o modal é fechado (ao clicar no `×` ou no overlay), a função de desinscrição (`window._adminChatStop?.()`) **nunca é chamada**.
* **Impacto:** Conexões em tempo real permanecem ativas em segundo plano. Se o administrador gerenciar 50 pedidos no dia, haverá 50 conexões consumindo memória no navegador e cota de leitura (billing) do Firestore desnecessariamente.
* **Correção:** No ouvinte de fechamento de modal em `admin.js`, chamar `window._adminChatStop?.()` e definir a variável como `null`.

---

### 3. Vazamento de Listeners no Painel do Cliente (Médio)
* **Arquivo:** [tracking.js](file:///C:/Users/PC/Documents/MingusFood/mingus_html_completo/tracking.js#L11-L12)
* **Causa:** A função `show()` inicia a escuta em tempo real do pedido (`watchOrder`) e das mensagens (`watchMessages`). Porém, ao voltar para o cardápio (função `hide()`), as funções de desinscrição `unsubscribeOrder` e `unsubscribeMessages` **não são executadas**.
* **Impacto:** Se o cliente navegar entre o cardápio e o rastreamento múltiplas vezes, o navegador acumulará listeners ativos consumindo internet e memória.
* **Correção:** Atualizar a função `hide()` para desinscrever as escutas:
  ```javascript
  function hide() {
    clearInterval(expiryTimer);
    unsubscribeOrder?.();
    unsubscribeMessages?.();
    unsubscribeOrder = null;
    unsubscribeMessages = null;
    $('#tracking-view').classList.add('hidden');
    document.querySelector('main').classList.remove('hidden');
  }
  ```

---

### 4. Travamento por Temporal Dead Zone (TDZ) no Login/Cadastro (Médio)
* **Arquivo:** [firebase-service.js](file:///C:/Users/PC/Documents/MingusFood/mingus_html_completo/firebase-service.js#L13)
* **Código:** `const stop=onAuthStateChanged(auth,user=>{stop();resolve(user)})`
* **Causa:** Se o Firebase resolver o estado de autenticação de forma síncrona (como quando as credenciais já estão salvas em cache local), a função de retorno (`callback`) será executada antes de terminar a atribuição da constante `stop`. Isso gera um erro de execução: `ReferenceError: Cannot access 'stop' before initialization`.
* **Impacto:** O login ou cadastro de usuários pode travar no carregamento inicial da página em certas circunstâncias.
* **Correção:** Mudar para `let`:
  ```javascript
  let stop;
  stop = onAuthStateChanged(auth, user => {
    if (stop) stop();
    resolve(user);
  });
  ```

---

### 5. Poluição de Seletores na Validação de Campos do Checkout (Baixo)
* **Arquivo:** [app.js](file:///C:/Users/PC/Documents/MingusFood/mingus_html_completo/app.js#L148)
* **Código:** `document.querySelectorAll('[name]').forEach(el=>el.classList.toggle('field-error',invalid.includes(el.name)))`
* **Causa:** O seletor busca **todos** os elementos do site inteiro que possuem o atributo `name`. Como o formulário de Cadastro (`#signup-form`) e o formulário do Clube (`#club-form`) possuem inputs com os mesmos nomes (ex: `name` e `phone`), esses formulários ocultos recebem a classe de erro visual `field-error` indevidamente.
* **Impacto:** Se o usuário tentar abrir a conta ou clube após um erro de checkout, os campos desses modais estarão marcados incorretamente em vermelho.
* **Correção:** Limitar o seletor apenas ao formulário de checkout:
  ```javascript
  document.querySelectorAll('#checkout-form [name]').forEach(...)
  ```

---

### 6. WhatsApp Hardcoded com DDD de Fora do RS (Médio)
* **Arquivo:** [app.js](file:///C:/Users/PC/Documents/MingusFood/mingus_html_completo/app.js#L151)
* **Código:** `link.href='https://wa.me/5545991375964?text='...`
* **Causa:** O telefone para onde o pedido é enviado via WhatsApp é estático: `5545991375964` (DDD 45 — Oeste do Paraná). No entanto, o restaurante fica em Tramandaí/RS (onde o DDD correto é 51).
* **Impacto:** O cliente enviará a confirmação do pedido para um número errado ou inexistente, atrapalhando a logística se a loja depender dessa notificação rápida.
* **Correção:** Substituir pelo telefone correto e, idealmente, torná-lo parametrizável nas configurações.

---

### 7. Dependência de Fuso Horário Local no Fechamento/Abertura de Loja (Médio)
* **Arquivo:** [app.js](file:///C:/Users/PC/Documents/MingusFood/mingus_html_completo/app.js#L69)
* **Código:** `const now=new Date()`
* **Causa:** O site verifica se a loja está aberta comparando os horários configurados com a hora do dispositivo do usuário.
* **Impacto:** Se o cliente estiver com o relógio desregulado ou acessar o site em outro fuso horário (ex: turistas ou pessoas fora do horário de Brasília), a loja aparecerá fechada mesmo estando aberta (ou vice-versa).
* **Correção:** Obter a hora correspondente ao fuso horário de Brasília/São Paulo:
  ```javascript
  const now = new Date(new Date().toLocaleString("en-US", { timeZone: "America/Sao_Paulo" }));
  ```

---

### 8. Wizard de Açaí Totalmente Estático / Hardcoded (Médio)
* **Arquivo:** [app.js](file:///C:/Users/PC/Documents/MingusFood/mingus_html_completo/app.js#L126)
* **Causa:** As opções de adicionais gratuitos (`free`) e premium (`paid`) estão fixadas no código do arquivo JS do cliente, em vez de lerem o campo `opts` (opções) configurado no banco de dados para os produtos de Açaí (`a300`, `a500`, etc.).
* **Impacto:** Se o dono do restaurante mudar o preço da Nutella ou remover o Kiwi do cardápio pelo painel admin, as mudanças não surtirão efeito no Wizard de açaí do cliente, gerando divergência de preços e de estoque.
* **Correção:** Fazer a renderização ler e parsear a propriedade `.opts` do produto dinamicamente.

---

### 9. Falha de Geolocalização nos Gráficos e Relatórios (Baixo)
* **Arquivo:** [admin.js](file:///C:/Users/PC/Documents/MingusFood/mingus_html_completo/admin.js#L30)
* **Causa:** A geração do gráfico de horários de pico utiliza `new Date(o.createdAt).getHours()`. 
* **Impacto:** O gráfico no painel administrativo apresentará dados distorcidos se o administrador acessar o painel a partir de outra região geográfica.
* **Correção:** Converter as datas para o fuso correto no momento do agrupamento.

---

### 10. Desativação Indesejada de Rolagem no Carrinho (Mobile UX - Baixo)
* **Arquivo:** [app.js](file:///C:/Users/PC/Documents/MingusFood/mingus_html_completo/app.js#L112)
* **Código:** `content.addEventListener('pointerdown',event=>{ ... content.setPointerCapture(event.pointerId) })`
* **Causa:** Chamar `setPointerCapture` logo no início do toque (`pointerdown`) bloqueia todo o comportamento de rolagem nativa do navegador na vertical dentro da sacola em dispositivos touch.
* **Impacto:** Usuários de smartphone enfrentam dificuldade para rolar a lista de itens da sacola para cima/baixo caso toquem em cima de um item.
* **Correção:** Detectar primeiro a direção do movimento. Se a variação vertical (Y) for maior que a horizontal (X), não capturar o ponteiro e permitir a rolagem nativa.

---

### 11. Limpeza de Pedidos deixa Mensagens Órfãs no Banco de Dados (Médio)
* **Arquivo:** [firebase-service.js](file:///C:/Users/PC/Documents/MingusFood/mingus_html_completo/firebase-service.js#L30)
* **Causa:** O Firestore não exclui subcoleções de forma automática quando o documento pai é excluído. A rotina `clearOrders` deleta o pedido em `/orders/{orderId}`, mas deixa a subcoleção `/orders/{orderId}/messages` salva.
* **Impacto:** Acúmulo de lixo eletrônico no banco de dados ao longo do tempo, gerando custos de armazenamento desnecessários.
* **Correção:** Excluir os documentos da subcoleção de mensagens antes de apagar o documento principal do pedido.

---

### 12. Risco de Crash e IDOR no ID de Pedidos Colididos (Médio)
* **Arquivo:** [firebase-service.js](file:///C:/Users/PC/Documents/MingusFood/mingus_html_completo/firebase-service.js#L20)
* **Causa:** A ID do pedido é gerada no cliente usando `ord-${Date.now()}`. Se houver colisão de milissegundo ou envio duplicado, a rotina faz um `getDoc` para ver se existe. Se existir, ela retorna os dados daquele ID. Contudo, devido às regras de segurança do Firestore, se o pedido existente pertencer a outro usuário, o `getDoc` falha por "Permission Denied".
* **Impacto:** O pedido falha em ser criado, frustrando o cliente. Adicionalmente, caso as regras estivessem frouxas, haveria vazamento de dados de outros usuários.
* **Correção:** Utilizar o gerador de IDs criptográficos nativos do SDK do Firestore (`doc(collection(db, 'orders')).id`) que evita colisões de forma absoluta.

---

### 13. Exclusão de Açaís e Pastéis com Banco Vazio (Médio)
* **Arquivo:** [admin.js](file:///C:/Users/PC/Documents/MingusFood/mingus_html_completo/admin.js#L20)
* **Causa:** Se a coleção de produtos no Firestore estiver vazia (primeiro setup do app), o script do admin apenas insere as bebidas (`beverageSeeds`). Como o cliente substitui a lista local de produtos pela do Firestore assim que detecta qualquer registro, os Açaís e Pastéis padrão somem da tela.
* **Impacto:** A loja fica vazia, sem açaí nem pastel, até que o admin cadastre tudo manualmente.
* **Correção:** Seedar todos os produtos padrão (`defaults`) no primeiro carregamento do admin caso a coleção de produtos esteja vazia.

---

### 14. Falta de Validação de Valor de Troco no Dinheiro (Baixo)
* **Arquivo:** [app.js](file:///C:/Users/PC/Documents/MingusFood/mingus_html_completo/app.js#L148)
* **Causa:** A variável `paid` é convertida para número, mas se o usuário digitar texto ou caracteres inválidos (ex: `"cinquenta"`), a conversão retorna `NaN`. O sistema ignora a verificação e envia o texto puro para o admin.
* **Impacto:** No painel do admin, os cálculos matemáticos de troco quebram (ficam exibindo `NaN` ou R$ 0,00), confundindo o entregador.
* **Correção:** Validar com expressão regular se o valor inserido em troco é de fato numérico antes de prosseguir.

---

### 15. Crash Potencial no Painel de Chamada do Motoboy (Baixo)
* **Arquivo:** [admin.js](file:///C:/Users/PC/Documents/MingusFood/mingus_html_completo/admin.js#L43)
* **Causa:** Se o pedido (`o`) passado para a função `motoboy()` estiver indefinido (por exemplo, após exclusão de pedidos na limpeza automática), o script tenta acessar `o.payment` e lança uma exceção que trava a interface do administrador.
* **Correção:** Adicionar verificação inicial `if (!o) return;`.

---

## 🚀 30 Melhorias Propostas

### Sincronização e Contas
1. **Sincronização de Histórico na Nuvem:** Fazer a busca de histórico de pedidos diretamente no Firestore com base no `ownerUid` do cliente logado, permitindo que ele veja seus pedidos passados em múltiplos aparelhos.
2. **Login com Redes Sociais:** Implementar login social rápido (Google e Apple) para acelerar a autenticação no momento da compra.
3. **Múltiplos Endereços Salvos:** Permitir que o cliente salve mais de um endereço em sua conta (ex: "Casa", "Trabalho", "Praia") e escolha no checkout.

### Gestão do Cardápio (Menu)
4. **Edição Completa de Adicionais no Admin:** Desenvolver interface para gerenciar a lista de complementos e preços dos opcionais (`opts`) das categorias de Pastéis e Açaís no painel de administração.
5. **Estoque e Esgotamento de Ingredientes:** Permitir que o administrador pause temporariamente um ingrediente específico (ex: pausar "Morango") sem precisar remover ou editar o produto inteiro.
6. **Programação de Produtos por Horário:** Adicionar controle para exibir produtos apenas em períodos específicos (ex: combos de almoço indisponíveis à noite).
7. **Pesquisa Inteligente e Tags:** Expandir a busca de produtos para indexar tags (ex: digitar "vegano" ou "sem lactose" e filtrar resultados correspondentes).

### Regras de Negócio e Precificação
8. **Configuração de Cupons no Banco de Dados:** Migrar o cupom de desconto `MINGOS10` da estrutura estática do código para uma coleção `/coupons` no Firestore, viabilizando a criação e edição dinâmica de promoções.
9. **Taxa de Entrega Dinâmica por Quilometragem:** Integrar com API de mapas para calcular a taxa de entrega real com base na distância da rota, complementando a precificação fixa por bairros.
10. **Frete Grátis Flexível:** Adicionar configuração no admin para definir regras de entrega gratuita específicas por bairro.
11. **Taxa de Serviço Variável para Eventos:** Adicionar suporte a taxas extras customizáveis (ex: taxa noturna ou taxa de embalagem especial).

### Experiência de Compra (UX/UI)
12. **Upsell Inteligente e Recomendação:** Exibir sugestões personalizadas no checkout com base no que está no carrinho (ex: se comprou pastéis salgados, oferecer um pastel de doce de leite como sobremesa).
13. **Barra de Progresso com Múltiplos Prêmios:** Ajustar a barra de progresso da sacola para exibir marcos cumulativos claros (ex: primeiro marco: Frete Grátis; segundo marco: Mini Churros de brinde) sem que a barra dê passos para trás.
14. **Máscara e Validação de Telefone:** Aplicar máscara visual automática nos campos de WhatsApp para garantir o padrão com DDD, minimizando erros no envio da mensagem.
15. **Cupom de Primeira Compra:** Aplicar desconto de boas-vienas automaticamente para novos usuários que acabaram de criar uma conta.

### Ferramentas Administrativas
16. **Impressão Térmica Otimizada (KDS):** Adicionar um botão no painel admin para imprimir o pedido formatado especificamente para impressoras de cupom térmico (58mm/80mm) para envio à cozinha.
17. **Fechamento de Caixa Avançado:** Permitir filtrar o histórico de caixa por operadores de caixa, turnos ou formas de pagamento (Pix, Cartão, Dinheiro).
18. **Programação Horária Diferenciada:** Configurar funcionamento automático por dia da semana (ex: fechar mais tarde nas sextas e sábados).
19. **Gráficos Financeiros Abrangentes:** Implementar gráficos de desempenho financeiro anual/mensal e divisão de faturamento por formas de pagamento.

### Notificações e Rastreabilidade
20. **Notificações de Atualização por Som:** Inserir alertas sonoros no celular do cliente quando o pedido progredir de status.
21. **Alertas Sonoros Persistentes no Admin:** Configurar o som de novos pedidos no painel admin para tocar repetidamente (em loop) até que o administrador tome uma ação de aceite ou recusa, evitando que novos pedidos passem despercebidos.
22. **Push Notifications (FCM):** Integrar com Firebase Cloud Messaging para alertar os clientes sobre o progresso do pedido mesmo com a aba do navegador fechada.
23. **Notificação de Atraso Automática:** Enviar alerta no WhatsApp do cliente se o tempo estimado expirar e o pedido ainda não tiver saído da cozinha.

### Desempenho e Tecnologia
24. **Upload de Imagens para Nuvem:** Substituir o armazenamento de fotos Base64 no banco de dados Firestore por upload real de arquivos para o Firebase Storage ou Cloudinary, reduzindo o consumo de banda de internet e espaço de banco.
25. **Cache de Imagens Local:** Implementar Service Workers (PWA) avançados para fazer cache persistente offline das imagens de produtos, tornando o carregamento do cardápio instantâneo.
26. **Busca de Endereço Automática por CEP:** Integrar com o serviço gratuito ViaCEP para preencher os campos de rua, bairro e cidade a partir do CEP inserido.

### Acessibilidade e Estética
27. **Ajustes de Contraste e Acessibilidade:** Elevar o contraste de cores das fontes roxas e douradas para estarem em conformidade com as diretrizes WCAG.
28. **Modo Escuro (Dark Mode):** Disponibilizar o Modo Escuro no painel do cliente e painel administrativo, diminuindo o cansaço visual.
29. **Links Compartilháveis de Produtos:** Gerar URLs exclusivas para cada item do menu, permitindo compartilhar ofertas específicas.
30. **Mensagem Automatizada de Feedback:** Enviar uma mensagem de agradecimento com link de avaliação de satisfação 1 hora após a conclusão da entrega do pedido.
