/* ===== Filo Takip — firebase.js =====
   Kendi bağımsız Firebase projesi (filotakip-355ea).
   Ana site (ebrutech-studios) ile hiçbir kaynağı (Auth, Firestore, Hosting) paylaşmaz.
   ============================================ */
import { initializeApp, deleteApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import {
  getAuth, onAuthStateChanged, signOut, signInWithEmailAndPassword,
  createUserWithEmailAndPassword
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import {
  getFirestore, doc, getDoc, setDoc, updateDoc, deleteDoc, serverTimestamp,
  collection, addDoc, getDocs, query, orderBy, limit, onSnapshot, where
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyBGtBkfJcPczFJ0yUmhBeKH-MNt8EjIx0M",
  authDomain: "filotakip-355ea.firebaseapp.com",
  projectId: "filotakip-355ea",
  storageBucket: "filotakip-355ea.firebasestorage.app",
  messagingSenderId: "407618593375",
  appId: "1:407618593375:web:f6cf6faf8d462b7ba8f1ea"
};

// Bu hesap otomatik olarak yönetici sayılır. Gerekirse kendi e-postanla değiştir.
const ADMIN_EMAIL = "ebrutechstudios@gmail.com";

const app = initializeApp(firebaseConfig, "filo");
const auth = getAuth(app);
const db = getFirestore(app);

window.FiloAuth = {
  app, auth, db,
  user: null,
  role: null, // 'admin' | 'surucu' | null
  ready: false,
  _cbs: [],

  onReady(cb){ if(this.ready) cb(this.user, this.role); else this._cbs.push(cb); },

  loginEmail(email, pass){ return signInWithEmailAndPassword(auth, email, pass); },
  logout(){ return signOut(auth); },

  // Yönetici, kendi oturumunu bozmadan yeni sürücü hesabı oluşturur (ikincil Firebase app instance ile).
  async createSurucuAccount(email, pass){
    const secondary = initializeApp(firebaseConfig, "filo-secondary-" + Date.now());
    const secondaryAuth = getAuth(secondary);
    try{
      const cred = await createUserWithEmailAndPassword(secondaryAuth, email, pass);
      await signOut(secondaryAuth);
      return cred.user.uid;
    } finally {
      try{ await deleteApp(secondary); }catch(e){}
    }
  }
};

window.FiloFirestore = {
  doc, getDoc, setDoc, updateDoc, deleteDoc, serverTimestamp,
  collection, addDoc, getDocs, query, orderBy, limit, onSnapshot, where
};

async function resolveRole(user){
  if(!user) return null;
  if((user.email||"").toLowerCase() === ADMIN_EMAIL) return "admin";
  try{
    const snap = await getDoc(doc(db, "filo_surucular", user.uid));
    return snap.exists() ? "surucu" : null;
  }catch(e){
    console.error("Rol kontrol hatası", e);
    return null;
  }
}

onAuthStateChanged(auth, async (user) => {
  window.FiloAuth.user = user;
  window.FiloAuth.role = await resolveRole(user);
  window.FiloAuth.ready = true;
  window.FiloAuth._cbs.forEach(cb => cb(user, window.FiloAuth.role));
  window.FiloAuth._cbs = [];
  document.dispatchEvent(new CustomEvent("filo-auth", { detail: { user, role: window.FiloAuth.role } }));
});
