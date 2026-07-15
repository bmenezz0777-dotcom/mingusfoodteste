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
- Fotos podem ser enviadas diretamente pelo administrador ao Firebase Storage.
- Horários, pedido mínimo, prazos, bairros e taxas são configuráveis.
- O checkout valida disponibilidade, funcionamento, endereço, pagamento e conexão.
- O painel mostra ticket médio, entrega versus retirada, horários de pico e histórico de caixa.
