import {initializeApp} from 'https://www.gstatic.com/firebasejs/12.15.0/firebase-app.js';
import {getAuth,signInAnonymously,signInWithEmailAndPassword,signOut,onAuthStateChanged} from 'https://www.gstatic.com/firebasejs/12.15.0/firebase-auth.js';
import {getFirestore,collection,doc,setDoc,deleteDoc,getDoc,getDocs,onSnapshot,query,where,writeBatch} from 'https://www.gstatic.com/firebasejs/12.15.0/firebase-firestore.js';

const firebaseConfig={apiKey:'AIzaSyBw0mc9z57cvG3ieJWBwUTjJj4FdR7PWxw',authDomain:'mingosfood-b0ef0.firebaseapp.com',projectId:'mingosfood-b0ef0',storageBucket:'mingosfood-b0ef0.firebasestorage.app',messagingSenderId:'927616413219',appId:'1:927616413219:web:6bf3ff605b733288fa0b96'};
const ADMIN_UID='HyAvEp5TLfh414rAykVQTwxWjrS2',app=initializeApp(firebaseConfig),auth=getAuth(app),db=getFirestore(app);
const authReady=new Promise(resolve=>onAuthStateChanged(auth,resolve));
const clean=value=>JSON.parse(JSON.stringify(value));
async function anonymousUser(){let user=await authReady;if(!user)user=(await signInAnonymously(auth)).user;return user}
async function adminLogin(email,password){const result=await signInWithEmailAndPassword(auth,email,password);if(result.user.uid!==ADMIN_UID){await signOut(auth);throw new Error('Esta conta não possui acesso administrativo.')}return result.user}
async function createOrder(order){const user=await anonymousUser(),payload=clean({...order,ownerUid:user.uid,updatedAt:new Date().toISOString()});await setDoc(doc(db,'orders',String(order.id)),payload);return payload}
function watchOrder(id,callback,error){return onSnapshot(doc(db,'orders',String(id)),snapshot=>{if(snapshot.exists())callback({id:snapshot.id,...snapshot.data()})},error)}
function watchOrders(callback,error){return onSnapshot(collection(db,'orders'),snapshot=>callback(snapshot.docs.map(item=>({id:item.id,...item.data()})).sort((a,b)=>new Date(b.createdAt)-new Date(a.createdAt))),error)}
async function updateOrderStatus(id,status){const ref=doc(db,'orders',String(id)),snapshot=await getDoc(ref);if(!snapshot.exists())throw new Error('Pedido não encontrado.');const updated={...snapshot.data(),status,updatedAt:new Date().toISOString()};await setDoc(ref,clean(updated));return{id:String(id),...updated}}
function watchCollection(name,callback,error){return onSnapshot(collection(db,name),snapshot=>callback(snapshot.docs.map(item=>({id:item.id,...item.data()}))),error)}
async function saveDocument(group,id,data){await setDoc(doc(db,group,String(id)),clean(data));return data}
async function removeDocument(group,id){await deleteDoc(doc(db,group,String(id)))}
async function clearOrders(){const snapshot=await getDocs(collection(db,'orders')),batch=writeBatch(db);snapshot.forEach(item=>batch.delete(item.ref));await batch.commit()}
window.MingosFirebase={ADMIN_UID,auth,db,anonymousUser,adminLogin,signOut:()=>signOut(auth),createOrder,watchOrder,watchOrders,updateOrderStatus,watchCollection,saveDocument,removeDocument,clearOrders};
window.dispatchEvent(new CustomEvent('mingos:firebase-ready'));
