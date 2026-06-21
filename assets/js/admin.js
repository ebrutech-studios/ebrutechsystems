import {
  collection, deleteField, doc, getDocs, limit, orderBy, query,
  runTransaction, serverTimestamp, Timestamp, where
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

const ADMIN_EMAIL = "ebrutechstudios@gmail.com";
const $ = id => document.getElementById(id);
const state = { selected: null, busy: false };
const db = window.ETSAuth.db;

function message(text, type = "info") {
  const el = $("adminMessage");
  el.textContent = text;
  el.className = `admin-message ${type}`;
  el.hidden = !text;
}

function setBusy(busy) {
  state.busy = busy;
  document.querySelectorAll("#adminApp button").forEach(button => button.disabled = busy);
  if (!busy) {
    $("grantMonthly").disabled = !state.selected;
    $("grantYearly").disabled = !state.selected;
    $("revokePro").disabled = !state.selected || !state.selected.isPro;
  }
}

function toDate(value) {
  if (!value) return null;
  if (typeof value.toDate === "function") return value.toDate();
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

function addMonths(date, months) {
  const result = new Date(date);
  const day = result.getUTCDate();
  result.setUTCDate(1);
  result.setUTCMonth(result.getUTCMonth() + months);
  const last = new Date(Date.UTC(result.getUTCFullYear(), result.getUTCMonth() + 1, 0)).getUTCDate();
  result.setUTCDate(Math.min(day, last));
  return result;
}

function validEmail(value) {
  const email = String(value || "").trim().toLowerCase();
  if (!email || email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw new Error("Geçerli bir kullanıcı e-postası gerekli.");
  return email;
}

async function requireAdmin() {
  const user = window.ETSAuth.user;
  if (!user) throw new Error("Yönetici oturumu gerekli.");
  const token = await user.getIdTokenResult();
  if (!token.claims.email_verified || String(token.claims.email || "").toLowerCase() !== ADMIN_EMAIL) throw new Error("Bu hesap yönetici değil.");
  return user;
}

function publicUser(id, data = {}) {
  const until = toDate(data.proUntil);
  return {
    uid: id,
    email: data.email || "",
    displayName: data.displayName || "",
    createdAt: data.authCreatedAt || null,
    lastSignInAt: data.lastSignInAt || null,
    isPro: data.pro === true || !!(until && until.getTime() > Date.now()),
    permanent: data.pro === true,
    plan: data.plan || null,
    proUntil: until ? until.toISOString() : null
  };
}

async function lookupUser(email) {
  const snap = await getDocs(query(collection(db, "users"), where("email", "==", validEmail(email)), limit(2)));
  if (snap.empty) throw new Error("Kullanıcı bulunamadı. Kullanıcının siteye en az bir kez giriş yapmış olması gerekir.");
  if (snap.size > 1) throw new Error("Aynı e-postaya ait birden fazla profil bulundu.");
  const userDoc = snap.docs[0];
  return publicUser(userDoc.id, userDoc.data());
}

async function loadHistory() {
  const snap = await getDocs(query(collection(db, "adminAudit"), orderBy("createdAt", "desc"), limit(25)));
  renderHistory(snap.docs.map(item => {
    const data = item.data();
    return {
      action: data.action,
      plan: data.plan || null,
      targetEmail: data.targetEmail || "",
      adminEmail: data.adminEmail || "",
      newProUntil: toDate(data.newProUntil)?.toISOString() || null,
      createdAt: toDate(data.createdAt)?.toISOString() || null
    };
  }));
}

async function changePro(months) {
  const admin = await requireAdmin();
  const target = state.selected;
  if (!target) throw new Error("Önce bir kullanıcı bulun.");
  const userRef = doc(db, "users", target.uid);
  const auditRef = doc(collection(db, "adminAudit"));
  await runTransaction(db, async transaction => {
    const snap = await transaction.get(userRef);
    if (!snap.exists()) throw new Error("Kullanıcı profili bulunamadı.");
    const previous = snap.data();
    const previousUntil = toDate(previous.proUntil);
    let newUntil = null;
    if (months === 0) {
      transaction.set(userRef, { pro: false, proUntil: deleteField(), plan: deleteField(), updatedAt: serverTimestamp(), updatedBy: admin.email }, { merge: true });
    } else {
      const now = new Date();
      const base = previousUntil && previousUntil > now ? previousUntil : now;
      newUntil = addMonths(base, months);
      transaction.set(userRef, { pro: false, proUntil: Timestamp.fromDate(newUntil), plan: months === 1 ? "monthly" : "yearly", updatedAt: serverTimestamp(), updatedBy: admin.email }, { merge: true });
    }
    transaction.set(auditRef, {
      action: months === 0 ? "revoke" : "grant",
      plan: months === 1 ? "monthly" : months === 12 ? "yearly" : null,
      targetUid: target.uid,
      targetEmail: target.email,
      previousProUntil: previousUntil ? Timestamp.fromDate(previousUntil) : null,
      newProUntil: newUntil ? Timestamp.fromDate(newUntil) : null,
      adminUid: admin.uid,
      adminEmail: admin.email,
      createdAt: serverTimestamp()
    });
  });
  return lookupUser(target.email);
}

function formatDate(value, includeTime = false) {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleString("tr-TR", includeTime ? { dateStyle: "medium", timeStyle: "short" } : { dateStyle: "long" });
}

function renderUser(user) {
  state.selected = user;
  $("adminUserCard").hidden = false;
  $("userName").textContent = user.displayName || "İsimsiz kullanıcı";
  $("userEmail").textContent = user.email;
  $("userUid").textContent = user.uid;
  $("userCreated").textContent = formatDate(user.createdAt, true);
  $("userLastLogin").textContent = formatDate(user.lastSignInAt, true);
  $("userPlan").textContent = user.permanent ? "Kalıcı Pro" : user.plan === "yearly" ? "Yıllık Pro" : user.plan === "monthly" ? "Aylık Pro" : "Ücretsiz";
  $("userUntil").textContent = user.permanent ? "Süresiz" : formatDate(user.proUntil);
  const badge = $("userStatus");
  badge.textContent = user.isPro ? "PRO AKTİF" : "ÜCRETSİZ";
  badge.className = `admin-status ${user.isPro ? "active" : "free"}`;
}

function renderHistory(items) {
  const list = $("adminHistory");
  list.replaceChildren();
  if (!items.length) {
    const empty = document.createElement("p");
    empty.className = "admin-empty";
    empty.textContent = "Henüz yönetim işlemi yok.";
    list.appendChild(empty);
    return;
  }
  items.forEach(item => {
    const row = document.createElement("div");
    row.className = "admin-history-row";
    const info = document.createElement("div");
    const title = document.createElement("strong");
    title.textContent = item.targetEmail;
    const detail = document.createElement("span");
    detail.textContent = item.action === "revoke" ? "Pro iptal edildi" : `${item.plan === "yearly" ? "Yıllık" : "Aylık"} Pro → ${formatDate(item.newProUntil)}`;
    info.append(title, detail);
    const meta = document.createElement("small");
    meta.textContent = `${formatDate(item.createdAt, true)} · ${item.adminEmail}`;
    row.append(info, meta);
    list.appendChild(row);
  });
}

async function lookup() {
  const email = $("adminEmail").value.trim();
  setBusy(true);
  message("Kullanıcı aranıyor…");
  try { renderUser(await lookupUser(email)); message("Kullanıcı bulundu.", "success"); }
  catch (error) { state.selected = null; $("adminUserCard").hidden = true; message(error.message, "error"); }
  finally { setBusy(false); }
}

async function change(months, label) {
  if (!state.selected || state.busy) return;
  if (!confirm(`${state.selected.email} kullanıcısı için ${label} işlemi uygulansın mı?`)) return;
  setBusy(true);
  message("Üyelik güncelleniyor…");
  try { renderUser(await changePro(months)); await loadHistory(); message(`${state.selected.email} için ${label} işlemi tamamlandı.`, "success"); }
  catch (error) { message(error.message, "error"); }
  finally { setBusy(false); }
}

$("adminSearch").addEventListener("submit", event => { event.preventDefault(); lookup(); });
$("grantMonthly").addEventListener("click", () => change(1, "1 ay Pro tanımlama"));
$("grantYearly").addEventListener("click", () => change(12, "1 yıl Pro tanımlama"));
$("revokePro").addEventListener("click", () => change(0, "Pro iptal"));
$("adminLogout").addEventListener("click", async () => { await window.ETSAuth.logout(); location.href = "giris.html"; });

window.ETSAuth.onReady(async user => {
  $("adminLoading").hidden = true;
  if (!user) { $("adminLoginRequired").hidden = false; return; }
  try {
    await requireAdmin();
    $("adminIdentity").textContent = user.email;
    $("adminApp").hidden = false;
    setBusy(false);
    await loadHistory();
  } catch (error) { $("adminDenied").hidden = false; $("adminDeniedText").textContent = error.message; }
});
