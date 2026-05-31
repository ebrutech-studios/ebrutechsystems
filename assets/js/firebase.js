/* ===== EbruTech Studios — firebase.js =====
   Firebase Authentication + Firestore Pro kontrolü.
   Tüm sayfalarda site.js'ten ÖNCE yüklenir.
   ============================================ */
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import {
  getAuth, onAuthStateChanged, signOut,
  signInWithEmailAndPassword, createUserWithEmailAndPassword,
  GoogleAuthProvider, signInWithPopup, sendPasswordResetEmail
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import { getFirestore, doc, getDoc } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyDW6svTvPWWDCwmrfA0V7bG_q_tyRhfoN0",
  authDomain: "ebrutech-studios.firebaseapp.com",
  projectId: "ebrutech-studios",
  storageBucket: "ebrutech-studios.firebasestorage.app",
  messagingSenderId: "436820982742",
  appId: "1:436820982742:web:4b00a78c64b3cb802f4277"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// Global erişim için window'a bağla (site.js ve sayfalar kullanır)
window.ETSAuth = {
  auth, db,
  user: null,
  isPro: false,
  ready: false,
  _cbs: [],

  onReady(cb){ if(this.ready) cb(this.user, this.isPro); else this._cbs.push(cb); },

  async _checkPro(uid){
    try{
      const snap = await getDoc(doc(db,"users",uid));
      return snap.exists() && snap.data().pro === true;
    }catch(e){ console.error("Pro kontrol hatası",e); return false; }
  },

  loginEmail(email,pass){ return signInWithEmailAndPassword(auth,email,pass); },
  registerEmail(email,pass){ return createUserWithEmailAndPassword(auth,email,pass); },
  loginGoogle(){ return signInWithPopup(auth,new GoogleAuthProvider()); },
  resetPassword(email){ return sendPasswordResetEmail(auth,email); },
  logout(){ return signOut(auth); }
};

onAuthStateChanged(auth, async (user)=>{
  window.ETSAuth.user = user;
  window.ETSAuth.isPro = user ? await window.ETSAuth._checkPro(user.uid) : false;
  window.ETSAuth.ready = true;
  window.ETSAuth._cbs.forEach(cb=>cb(user, window.ETSAuth.isPro));
  window.ETSAuth._cbs = [];
  document.dispatchEvent(new CustomEvent("ets-auth", {detail:{user, isPro:window.ETSAuth.isPro}}));
});
