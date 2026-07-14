(() => {
  'use strict';
  const ORDER_KEY='mingus_v3_orders', LAST_KEY='mingus_v3_last';
  const read=(key,fallback=[])=>{try{return JSON.parse(localStorage.getItem(key))??fallback}catch{return fallback}};
  const emit=(key,value)=>window.dispatchEvent(new CustomEvent('mingos:storage',{detail:{key,value}}));
  function saveOrders(orders){localStorage.setItem(ORDER_KEY,JSON.stringify(orders));emit(ORDER_KEY,orders)}
  function findOrder(id){return read(ORDER_KEY).find(order=>String(order.id)===String(id))||null}
  function updateStatus(id,status){const allowed=['received','preparing','delivering','completed'];if(!allowed.includes(status))return null;let updated=null;const orders=read(ORDER_KEY).map(order=>{if(String(order.id)!==String(id))return order;updated={...order,status,updatedAt:new Date().toISOString()};return updated});if(!updated)return null;saveOrders(orders);const last=read(LAST_KEY,null);if(last&&String(last.id)===String(id))localStorage.setItem(LAST_KEY,JSON.stringify(updated));return updated}
  window.addEventListener('storage',event=>{if(event.key===ORDER_KEY)emit(ORDER_KEY,read(ORDER_KEY))});
  window.MingosSync={ORDER_KEY,LAST_KEY,read,saveOrders,findOrder,updateStatus};
})();
