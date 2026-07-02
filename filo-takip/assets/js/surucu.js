let db, fs, map, marker, currentVehicleId = null;
let pickedCoord = null;

function fmtTime(ts){
  if(!ts) return "—";
  const d = ts.toDate ? ts.toDate() : new Date(ts);
  return d.toLocaleString("tr-TR", { day:"2-digit", month:"2-digit", year:"numeric", hour:"2-digit", minute:"2-digit" });
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
    if(marker) marker.setLatLng([pickedCoord.lat, pickedCoord.lng]);
    else marker = L.marker([pickedCoord.lat, pickedCoord.lng]).addTo(map);
  });
  return map;
}

function renderVehicle(v){
  document.getElementById("vehiclePlaka").textContent = v.plaka;
  document.getElementById("vehicleInfo").textContent =
    [v.marka, v.model].filter(Boolean).join(" ") || "Aracınıza ait bilgiler";
  ensureMap();
  if(v.sonKonum && v.sonKonum.lat != null){
    const pos = [v.sonKonum.lat, v.sonKonum.lng];
    map.setView(pos, 13);
    if(marker) marker.setLatLng(pos);
    else marker = L.marker(pos).addTo(map);
  }
}

async function loadHistory(vehicleId, uid){
  const { collection, getDocs, query, orderBy, limit } = fs;
  const body = document.getElementById("historyBody");
  const snap = await getDocs(query(collection(db, "filo_araclar", vehicleId, "gecmis"), orderBy("zaman", "desc"), limit(15)));
  if(snap.empty){ body.innerHTML = '<tr><td colspan="3" class="empty">Kayıt yok.</td></tr>'; return; }
  body.innerHTML = snap.docs.map(d => {
    const g = d.data();
    const yer = g.adres || (g.lat != null ? `${g.lat.toFixed(5)}, ${g.lng.toFixed(5)}` : "—");
    return `<tr><td>${fmtTime(g.zaman)}</td><td>${yer}</td><td>${g.durum||"—"}</td></tr>`;
  }).join("");
}

function wireForm(uid){
  document.getElementById("locationForm").addEventListener("submit", async (e) => {
    e.preventDefault();
    if(!currentVehicleId) return;
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
      guncelleyen: uid,
      zaman: serverTimestamp()
    };
    const btn = e.target.querySelector("button");
    btn.disabled = true;
    try{
      await updateDoc(doc(db, "filo_araclar", currentVehicleId), { sonKonum, durum });
      await addDoc(collection(db, "filo_araclar", currentVehicleId, "gecmis"), { ...sonKonum, durum });
      e.target.reset();
      pickedCoord = null;
      document.getElementById("lCoordInfo").textContent = "Haritada bir noktaya tıklayarak koordinat seçebilirsiniz (opsiyonel).";
      loadHistory(currentVehicleId, uid);
    }catch(err){
      console.error("Konum kaydedilemedi", err);
      alert("Konum kaydedilemedi, tekrar deneyin.");
    } finally {
      btn.disabled = false;
    }
  });

  document.getElementById("logoutBtn").addEventListener("click", () => window.FiloAuth.logout());
}

window.FiloAuth.onReady(async (user, role) => {
  document.getElementById("loadingState").hidden = true;
  if(!user){ location.replace("giris.html"); return; }
  if(role !== "surucu"){ document.getElementById("deniedState").hidden = false; return; }

  db = window.FiloAuth.db; fs = window.FiloFirestore;
  document.getElementById("userBox").hidden = false;
  document.getElementById("userLabel").textContent = user.email;

  const { collection, query, where, onSnapshot } = fs;
  onSnapshot(query(collection(db, "filo_araclar"), where("surucuUid", "==", user.uid)), (snap) => {
    if(snap.empty){ document.getElementById("noVehicleState").hidden = false; document.getElementById("surucuApp").hidden = true; return; }
    document.getElementById("noVehicleState").hidden = true;
    const v = { id: snap.docs[0].id, ...snap.docs[0].data() };
    currentVehicleId = v.id;
    document.getElementById("surucuApp").hidden = false;
    renderVehicle(v);
    loadHistory(v.id, user.uid);
  }, (err) => console.error("Araç bilgisi alınamadı", err));

  wireForm(user.uid);
});
