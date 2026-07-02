let db, fs, map, markers = {};
let vehicles = [];
let drivers = [];
let pickedCoord = null;

function fmtTime(ts){
  if(!ts) return "—";
  const d = ts.toDate ? ts.toDate() : new Date(ts);
  return d.toLocaleString("tr-TR", { day:"2-digit", month:"2-digit", year:"numeric", hour:"2-digit", minute:"2-digit" });
}

function fmtKonum(sonKonum){
  if(!sonKonum) return "Henüz konum girilmedi";
  const yer = sonKonum.adres || `${sonKonum.lat?.toFixed(5)}, ${sonKonum.lng?.toFixed(5)}`;
  return `${yer} · ${fmtTime(sonKonum.zaman)}`;
}

function ensureMap(){
  if(map) return map;
  map = L.map("filoMap").setView([39.0, 35.0], 6);
  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution: '&copy; OpenStreetMap katkıda bulunanlar',
    maxZoom: 18
  }).addTo(map);
  map.on("click", (e) => {
    pickedCoord = { lat: e.latlng.lat, lng: e.latlng.lng };
    document.getElementById("lCoordInfo").textContent =
      `Seçili koordinat: ${pickedCoord.lat.toFixed(5)}, ${pickedCoord.lng.toFixed(5)}`;
  });
  return map;
}

function updateMarkers(){
  ensureMap();
  const seen = new Set();
  vehicles.forEach(v => {
    if(!v.sonKonum || v.sonKonum.lat == null) return;
    seen.add(v.id);
    const pos = [v.sonKonum.lat, v.sonKonum.lng];
    if(markers[v.id]){
      markers[v.id].setLatLng(pos);
      markers[v.id].setPopupContent(`<strong>${v.plaka}</strong><br>${fmtKonum(v.sonKonum)}`);
    } else {
      markers[v.id] = L.marker(pos).addTo(map).bindPopup(`<strong>${v.plaka}</strong><br>${fmtKonum(v.sonKonum)}`);
    }
  });
  Object.keys(markers).forEach(id => {
    if(!seen.has(id)){ map.removeLayer(markers[id]); delete markers[id]; }
  });
}

function renderVehicleSelect(){
  const sel = document.getElementById("lVehicle");
  const current = sel.value;
  sel.innerHTML = '<option value="">Araç seçin</option>' +
    vehicles.map(v => `<option value="${v.id}">${v.plaka}</option>`).join("");
  if(vehicles.some(v => v.id === current)) sel.value = current;
}

function renderVehicles(){
  const body = document.getElementById("vehicleBody");
  renderVehicleSelect();
  if(!vehicles.length){ body.innerHTML = '<tr><td colspan="6" class="empty">Henüz araç eklenmedi.</td></tr>'; updateMarkers(); return; }
  body.innerHTML = vehicles.map(v => {
    const driverOptions = ['<option value="">Atanmadı</option>']
      .concat(drivers.map(d => `<option value="${d.id}" ${d.id===v.surucuUid?"selected":""}>${d.ad}</option>`)).join("");
    const durumOptions = ["aktif","molada","pasif"].map(s =>
      `<option value="${s}" ${v.durum===s?"selected":""}>${s}</option>`).join("");
    return `<tr data-id="${v.id}">
      <td>${v.plaka}</td>
      <td>${[v.marka,v.model].filter(Boolean).join(" ") || "—"}</td>
      <td><select class="assignDriver" data-id="${v.id}">${driverOptions}</select></td>
      <td><select class="setDurum" data-id="${v.id}">${durumOptions}</select></td>
      <td>${fmtKonum(v.sonKonum)}</td>
      <td>
        <button class="btn btn-ghost histBtn" data-id="${v.id}" data-plaka="${v.plaka}" type="button">Geçmiş</button>
        <button class="btn btn-danger delVehicleBtn" data-id="${v.id}" type="button">Sil</button>
      </td>
    </tr>`;
  }).join("");
  updateMarkers();
}

function renderDrivers(){
  const body = document.getElementById("driverBody");
  if(!drivers.length){ body.innerHTML = '<tr><td colspan="3" class="empty">Henüz sürücü eklenmedi.</td></tr>'; return; }
  body.innerHTML = drivers.map(d => `<tr data-id="${d.id}">
    <td>${d.ad}</td><td>${d.telefon||"—"}</td>
    <td><button class="btn btn-danger delDriverBtn" data-id="${d.id}" type="button">Sil</button></td>
  </tr>`).join("");
  renderVehicles();
}

function listenVehicles(){
  const { collection, onSnapshot, query, orderBy } = fs;
  onSnapshot(query(collection(db, "filo_araclar"), orderBy("olusturulma", "desc")), (snap) => {
    vehicles = snap.docs.map(d => ({ id: d.id, ...d.data() }));
    renderVehicles();
  }, (err) => console.error("Araç listesi hatası", err));
}

function listenDrivers(){
  const { collection, onSnapshot } = fs;
  onSnapshot(collection(db, "filo_surucular"), (snap) => {
    drivers = snap.docs.map(d => ({ id: d.id, ...d.data() }));
    renderDrivers();
  }, (err) => console.error("Sürücü listesi hatası", err));
}

async function openHistory(vehicleId, plaka){
  const { collection, getDocs, query, orderBy, limit } = fs;
  document.getElementById("historyTitle").textContent = `Konum geçmişi — ${plaka}`;
  document.getElementById("historyPanel").hidden = false;
  const body = document.getElementById("historyBody");
  body.innerHTML = '<tr><td colspan="4" class="empty">Yükleniyor…</td></tr>';
  const snap = await getDocs(query(collection(db, "filo_araclar", vehicleId, "gecmis"), orderBy("zaman", "desc"), limit(30)));
  if(snap.empty){ body.innerHTML = '<tr><td colspan="4" class="empty">Kayıt yok.</td></tr>'; return; }
  body.innerHTML = snap.docs.map(d => {
    const g = d.data();
    const yer = g.adres || `${g.lat?.toFixed(5)}, ${g.lng?.toFixed(5)}`;
    return `<tr><td>${fmtTime(g.zaman)}</td><td>${yer}</td><td>${g.not||"—"}</td><td>${g.durum||"—"}</td></tr>`;
  }).join("");
}

function wireEvents(){
  document.getElementById("vehicleBody").addEventListener("change", async (e) => {
    const { doc, updateDoc } = fs;
    if(e.target.classList.contains("assignDriver")){
      const id = e.target.dataset.id;
      const surucuUid = e.target.value || null;
      const surucuAdi = surucuUid ? (drivers.find(d => d.id === surucuUid)?.ad || null) : null;
      await updateDoc(doc(db, "filo_araclar", id), { surucuUid, surucuAdi });
    }
    if(e.target.classList.contains("setDurum")){
      const id = e.target.dataset.id;
      await updateDoc(doc(db, "filo_araclar", id), { durum: e.target.value });
    }
  });

  document.getElementById("vehicleBody").addEventListener("click", async (e) => {
    const { doc, deleteDoc } = fs;
    if(e.target.classList.contains("histBtn")){
      openHistory(e.target.dataset.id, e.target.dataset.plaka);
    }
    if(e.target.classList.contains("delVehicleBtn")){
      if(confirm("Bu aracı silmek istediğinize emin misiniz?")){
        await deleteDoc(doc(db, "filo_araclar", e.target.dataset.id));
      }
    }
  });

  document.getElementById("driverBody").addEventListener("click", async (e) => {
    const { doc, deleteDoc } = fs;
    if(e.target.classList.contains("delDriverBtn")){
      if(confirm("Bu sürücü kaydını silmek istediğinize emin misiniz? (Giriş hesabı Firebase Authentication'da kalır, Firebase Console'dan ayrıca silinmeli.)")){
        await deleteDoc(doc(db, "filo_surucular", e.target.dataset.id));
      }
    }
  });

  document.getElementById("closeHistory").addEventListener("click", () => {
    document.getElementById("historyPanel").hidden = true;
  });

  document.getElementById("vehicleForm").addEventListener("submit", async (e) => {
    e.preventDefault();
    const { collection, addDoc, serverTimestamp } = fs;
    await addDoc(collection(db, "filo_araclar"), {
      plaka: document.getElementById("vPlaka").value.trim(),
      marka: document.getElementById("vMarka").value.trim(),
      model: document.getElementById("vModel").value.trim(),
      surucuUid: null, surucuAdi: null,
      durum: "pasif", sonKonum: null,
      olusturulma: serverTimestamp()
    });
    e.target.reset();
  });

  document.getElementById("driverForm").addEventListener("submit", async (e) => {
    e.preventDefault();
    const msg = document.getElementById("driverMsg");
    msg.hidden = true;
    const ad = document.getElementById("dAd").value.trim();
    const telefon = document.getElementById("dTel").value.trim();
    const email = document.getElementById("dEmail").value.trim();
    const pass = document.getElementById("dPass").value;
    const btn = e.target.querySelector("button");
    btn.disabled = true;
    try{
      const uid = await window.FiloAuth.createSurucuAccount(email, pass);
      const { doc, setDoc, serverTimestamp } = fs;
      await setDoc(doc(db, "filo_surucular", uid), {
        ad, telefon, email, aktif: true, olusturulma: serverTimestamp()
      });
      e.target.reset();
    }catch(err){
      const map = {
        "auth/email-already-in-use": "Bu e-posta zaten kayıtlı.",
        "auth/weak-password": "Şifre en az 6 karakter olmalı.",
        "auth/invalid-email": "Geçersiz e-posta adresi."
      };
      msg.textContent = map[err.code] || "Sürücü hesabı oluşturulamadı.";
      msg.hidden = false;
    } finally {
      btn.disabled = false;
    }
  });

  document.getElementById("locationForm").addEventListener("submit", async (e) => {
    e.preventDefault();
    const vehicleId = document.getElementById("lVehicle").value;
    if(!vehicleId){ alert("Lütfen bir araç seçin."); return; }
    const adres = document.getElementById("lAdres").value.trim();
    const not = document.getElementById("lNot").value.trim();
    const durum = document.getElementById("lDurum").value;
    if(!adres && !pickedCoord){ alert("Adres yazın veya haritadan bir nokta seçin."); return; }

    const { doc, updateDoc, collection, addDoc, serverTimestamp } = fs;
    const sonKonum = {
      adres: adres || null,
      lat: pickedCoord ? pickedCoord.lat : null,
      lng: pickedCoord ? pickedCoord.lng : null,
      not: not || null,
      guncelleyen: "admin",
      zaman: serverTimestamp()
    };
    await updateDoc(doc(db, "filo_araclar", vehicleId), { sonKonum, durum });
    await addDoc(collection(db, "filo_araclar", vehicleId, "gecmis"), { ...sonKonum, durum });

    e.target.reset();
    pickedCoord = null;
    document.getElementById("lCoordInfo").textContent = "Haritada bir noktaya tıklayarak koordinat seçebilirsiniz (opsiyonel).";
  });

  document.getElementById("logoutBtn").addEventListener("click", () => window.FiloAuth.logout());
}

window.FiloAuth.onReady((user, role) => {
  document.getElementById("loadingState").hidden = true;
  if(!user){ location.replace("giris.html"); return; }
  if(role !== "admin"){ document.getElementById("deniedState").hidden = false; return; }

  db = window.FiloAuth.db; fs = window.FiloFirestore;
  document.getElementById("userBox").hidden = false;
  document.getElementById("userLabel").textContent = user.email;
  document.getElementById("adminApp").hidden = false;

  wireEvents();
  listenDrivers();
  listenVehicles();
});
