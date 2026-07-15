# Mingos — Pastelaria Artesanal & Açaiteria

Interface premium de delivery desenvolvida em HTML5, Tailwind CSS via CDN e JavaScript puro.

## Abrir

Abra `index.html` no navegador. O painel administrativo permanece disponível em `admin.html`.

- Admin: `adm`
- Senha: `adm`

## Experiência do comprador

- Layout mobile-first inspirado em aplicativos nativos.
- Catálogo responsivo com categorias fixas e busca.
- Escolha guiada de açaí em dois passos, com recomendação de tamanho.
- Sacola flutuante e confirmação para finalizar ou continuar comprando.
- Progresso para frete grátis/brinde, tempo estimado e edição direta na sacola.
- Gesto de deslizar para excluir itens no celular.
- Adição rápida para bebidas e personalização explícita para produtos complexos.
- Filtros por intenção: dividir, refrescar ou matar uma fome grande.
- Carrinho lateral com quantidades, cupom `MINGOS10` e resumo completo.
- Entrega ou retirada, pagamento simulado e cálculo de troco.
- Upsell inteligente de bebidas antes do checkout.
- Envio do pedido formatado para o WhatsApp `5545991375964`.
- Confetes na conclusão antes da abertura do WhatsApp.
- Endereço simplificado por bairro, rua, número e cidade, sem CEP.
- Repetição do último pedido salvo em `ultimoPedido`.
- Carrossel de produtos, parallax e cards carro-chefe com tilt 3D.
- Micro-sons gerados no navegador com controle para silenciar.
- Atividade baseada em pedidos locais reais ou dicas claramente identificadas.
- Login demonstrativo e acompanhamento do último pedido.
- Skeleton de carregamento, toasts temporizados, sincronização entre abas e galeria social.
- Microinterações, ripple, animações de entrada e suporte a movimento reduzido.

Produtos, pedidos, funcionamento, bairros, taxas, promoções e histórico são sincronizados pelo Firebase. O LocalStorage serve somente como cache e recuperação local.

## Operação

- Produtos podem ser pausados ou reativados pelo painel.
- Fotos são reduzidas no navegador e salvas junto ao produto no Firestore gratuito.
- Horários, pedido mínimo, prazos, bairros e taxas são configuráveis.
- O checkout valida disponibilidade, funcionamento, endereço, pagamento e conexão.
- O painel mostra ticket médio, entrega versus retirada, horários de pico e histórico de caixa.

## Mingos 4.0

- Cadastro e login reais com Firebase Authentication.
- Conta criada a partir da sessão anônima sem perder o pedido.
- Pedido entra como `pending_acceptance` e precisa ser aceito pela cozinha.
- Admin informa a previsão antes de aceitar ou pode recusar com motivo.
- Acompanhamento com seis etapas, cancelamento antes do aceite e confirmação de entrega.
- Chat em tempo real vinculado ao pedido para cliente e administração.
- Pedidos são validados pelas regras do Firestore e protegidos por usuário autenticado.
- Cabeçalho reorganizado e navegação inferior mobile.
- Montagem de açaí aparece uma única vez no catálogo e a adição não interrompe a compra.

Toda a solução funciona no plano gratuito Spark, sem Cloud Functions e sem necessidade de cadastrar faturamento.

## Controles gratuitos da operação

- Loja aberta, fechada ou cozinha pausada.
- Tele-entrega e retirada controladas separadamente.
- Pix, cartão e dinheiro ativados individualmente.
- Modos de troco normal, valor exato, sem R$ 100 ou sem R$ 200.
- Movimento tranquilo, normal ou intenso com prazos publicados.
- Prazo de dez minutos para aceite, aplicado pela tela conectada do cliente.
- Clube Mingos com nome, WhatsApp e consentimento explícito.
- Aba de contatos no Admin e exportação CSV dos participantes autorizados.
- Nenhum disparo automático de WhatsApp ou recurso pago.
