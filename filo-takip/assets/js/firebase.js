/* ===== Filo Takip — firebase.js =====
   Firebase Authentication + Firestore.
   Aynı Firebase projesini (ebrutech-studios) kullanır, ayrı koleksiyonlarla izole çalışır:
   filo_surucular, filo_araclar (+ gecmis alt koleksiyonu).
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
  apiKey: "AIzaSyDW6svTvPWWDCwmrfA0V7bG_q_tyRhfoN0",
  authDomain: "ebrutech-studios.firebaseapp.com",
  projectId: "ebrutech-studios",
  storageBucket: "ebrutech-studios.firebasestorage.app",
  messagingSenderId: "436820982742",
  appId: "1:436820982742:web:4b00a78c64b3cb802f4277"
};

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
