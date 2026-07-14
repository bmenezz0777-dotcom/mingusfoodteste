(() => {
  'use strict';
  const steps=[['received','📝','Pedido recebido'],['preparing','👨‍🍳','Em preparo'],['delivering','🛵','Saiu para entrega'],['completed','✅','Entregue']];
  const $=selector=>document.querySelector(selector);let activeOrderId=null;
  function render(order){if(!order)return;activeOrderId=order.id;const current=Math.max(0,steps.findIndex(([status])=>status===order.status));$('#tracking-code').textContent=`Pedido #${order.code||order.id} • Atualizado automaticamente`;$('#tracking-stepper').innerHTML=steps.map(([status,icon,label],index)=>{const done=index<=current,active=index===current;return `<div class="tracking-step ${done?'is-done':''} ${active?'is-active':''}"><div class="tracking-rail"><span>${icon}</span>${index<steps.length-1?'<i></i>':''}</div><div><b>${label}</b><p>${active?(status==='preparing'?'Estamos preparando tudo com carinho.':'Esta é a etapa atual do seu pedido.'):done?'Etapa concluída.':'Aguardando.'}</p></div></div>`}).join('');$('#confirm-delivery-open').classList.toggle('hidden',order.status!=='delivering')}
  function show(order){if(!order)return;render(order);document.querySelector('main').classList.add('hidden');$('#tracking-view').classList.remove('hidden');window.scrollTo({top:0,behavior:'smooth'})}
  function hide(){$('#tracking-view').classList.add('hidden');document.querySelector('main').classList.remove('hidden')}
  function refresh(){if(!activeOrderId)return;const order=window.MingosSync.findOrder(activeOrderId);if(order)render(order)}
  window.addEventListener('mingos:storage',event=>{if(event.detail.key===window.MingosSync.ORDER_KEY)refresh()});
  document.addEventListener('click',event=>{if(event.target.closest('#tracking-back'))hide();if(event.target.closest('#confirm-delivery-open')){document.querySelector('#overlay').classList.remove('hidden');$('#delivery-confirm-modal').classList.remove('hidden')}if(event.target.closest('#delivery-confirm-modal [data-close]')){$('#delivery-confirm-modal').classList.add('hidden');document.querySelector('#overlay').classList.add('hidden')}if(event.target.closest('#confirm-delivery')){const order=window.MingosSync.updateStatus(activeOrderId,'completed');$('#delivery-confirm-modal').classList.add('hidden');document.querySelector('#overlay').classList.add('hidden');if(order)render(order)}});
  window.MingosTracking={show,hide,render};
})();
