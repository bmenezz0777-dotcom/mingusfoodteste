(() => {
  'use strict';
  const ORDER_KEY='mingus_v3_orders',LAST_KEY='mingus_v3_last';
  const read=(key,fallback=[])=>{try{return JSON.parse(localStorage.getItem(key))??fallback}catch{return fallback}};
  const writeLocal=(key,value)=>localStorage.setItem(key,JSON.stringify(value));
  const emit=(key,value)=>window.dispatchEvent(new CustomEvent('mingos:storage',{detail:{key,value}}));
  function waitFirebase(timeout=12000){if(window.MingosFirebase)return Promise.resolve(window.MingosFirebase);return new Promise((resolve,reject)=>{const timer=setTimeout(()=>reject(new Error('Não foi possível conectar ao Firebase.')),timeout);window.addEventListener('mingos:firebase-ready',()=>{clearTimeout(timer);resolve(window.MingosFirebase)},{once:true})})}
  function saveOrdersLocal(orders){writeLocal(ORDER_KEY,orders);emit(ORDER_KEY,orders)}
  function findOrder(id){return read(ORDER_KEY).find(order=>String(order.id)===String(id))||null}
  async function createOrder(order){const firebase=await waitFirebase(),saved=await firebase.createOrder(order),orders=read(ORDER_KEY,[]).filter(item=>item.id!==saved.id);saveOrdersLocal([saved,...orders]);writeLocal(LAST_KEY,saved);return saved}
  async function updateStatus(id,status){const firebase=await waitFirebase(),updated=await firebase.updateOrderStatus(id,status),orders=read(ORDER_KEY,[]).map(order=>order.id===id?updated:order);saveOrdersLocal(orders);const last=read(LAST_KEY,null);if(last?.id===id)writeLocal(LAST_KEY,updated);return updated}
  async function watchOrder(id,callback){const firebase=await waitFirebase();return firebase.watchOrder(id,order=>{const orders=read(ORDER_KEY,[]).filter(item=>item.id!==order.id);saveOrdersLocal([order,...orders]);writeLocal(LAST_KEY,order);callback(order)},error=>console.error('Mingos tracking:',error))}
  async function adminLogin(email,password){return(await waitFirebase()).adminLogin(email,password)}
  async function watchAdminOrders(callback){const firebase=await waitFirebase();return firebase.watchOrders(orders=>{saveOrdersLocal(orders);callback(orders)},error=>console.error('Mingos admin:',error))}
  window.MingosSync={ORDER_KEY,LAST_KEY,read,waitFirebase,createOrder,updateStatus,watchOrder,adminLogin,watchAdminOrders,findOrder,saveOrders:saveOrdersLocal};
})();
