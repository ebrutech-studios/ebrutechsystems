/* ===== EbruTech Studios — site.js =====
   Tek kaynaktan header/footer enjeksiyonu.
   Navbar tutarsızlığı sorununu kökten çözer: her sayfada AYNI menü.
   ================================================ */

/* ---- AYARLAR (tek yerden düzenle) ---- */
const ETS = {
  brand: "EbruTech Studios",
  whatsapp: "905414792972",
  email: "info@ebrutechsystems.com",
  // Shopier ürün linkleri — Shopier panelinden ürün oluşturup linki buraya yapıştır
  shopier: {
    pro_monthly:  "https://www.shopier.com/ETS-PRO-AYLIK",
    pro_yearly:   "https://www.shopier.com/ETS-PRO-YILLIK",
    pkg_kartvizit:"https://www.shopier.com/ETS-KARTVIZIT",
    pkg_logo:     "https://www.shopier.com/ETS-LOGO",
    pkg_web:      "https://www.shopier.com/ETS-WEB",
    pkg_sosyal:   "https://www.shopier.com/ETS-SOSYAL"
  },
  // Pro lisans anahtarı doğrulaması (client-side checksum).
  // SATIŞ SONRASI: alıcıya bu kuralla üretilmiş bir kod gönderilir.
  licenseSalt: "ETS2026"
};

/* ---- Navigasyon yapısı (TEK kaynak) ---- */
const NAV = [
  ["index.html","Ana Sayfa"],
  ["tools.html","Araçlar"],
  ["hizmetler.html","Hizmetler"],
  ["fiyatlandirma.html","Fiyatlandırma"],
  ["iletisim.html","İletişim"]
];

const ETSlib = {
  wa(msg){return `https://wa.me/${ETS.whatsapp}?text=${encodeURIComponent(msg)}`;},

  isPro(){ return localStorage.getItem("ets_pro")==="1"; },

  /* Basit checksum lisans doğrulaması (no-backend).
     Kod formatı: ETS-XXXX-XXXX, son blok ilk bloğun salt'lı hash kontrolüdür. */
  validateLicense(code){
    code=(code||"").trim().toUpperCase();
    const m=code.match(/^ETS-([A-Z0-9]{4})-([A-Z0-9]{4})$/);
    if(!m) return false;
    const want=this._hash(m[1]+ETS.licenseSalt);
    return want===m[2];
  },
  _hash(str){
    let h=0; for(let i=0;i<str.length;i++){h=(h*31+str.charCodeAt(i))>>>0;}
    return h.toString(36).toUpperCase().padStart(4,"0").slice(-4);
  },
  activatePro(code){
    if(this.validateLicense(code)){ localStorage.setItem("ets_pro","1"); return true; }
    return false;
  },

  toast(msg){
    let t=document.querySelector(".toast");
    if(!t){t=document.createElement("div");t.className="toast";document.body.appendChild(t);}
    t.textContent=msg;t.classList.add("show");
    clearTimeout(this._tt);this._tt=setTimeout(()=>t.classList.remove("show"),2600);
  }
};

/* ---- Header/Footer enjeksiyonu ---- */
function buildShell(){
  const here=(location.pathname.split("/").pop()||"index.html");
  const links=NAV.map(([h,l])=>`<a href="${h}" class="${h===here?'active':''}">${l}</a>`).join("");

  document.body.insertAdjacentHTML("afterbegin",`
  <header class="site-head"><div class="wrap"><nav class="nav">
    <a class="brand" href="index.html">
      <span class="logo">E</span>
      <span>EbruTech Studios<small>Tasarım + Yazılım</small></span>
    </a>
    <button class="burger" aria-label="Menü">☰</button>
    <div class="nav-links">${links}
      <a href="fiyatlandirma.html" class="nav-cta">Pro'ya Geç</a>
    </div>
  </nav></div></header>`);

  document.body.insertAdjacentHTML("beforeend",`
  <footer class="site-foot"><div class="wrap">
    <div class="foot-grid">
      <div class="col" style="max-width:280px">
        <a class="brand" href="index.html" style="margin-bottom:12px">
          <span class="logo">E</span><span>EbruTech Studios</span></a>
        <p style="color:var(--txt-dim);font-size:.9rem">Tarayıcıda çalışan profesyonel görsel araçlar ve KOBİ'lere özel tasarım & yazılım çözümleri.</p>
      </div>
      <div class="col"><h5>Ürün</h5>
        <a href="tools.html">Tüm Araçlar</a><a href="fiyatlandirma.html">Pro Üyelik</a><a href="pro.html">Lisans Aktivasyon</a></div>
      <div class="col"><h5>Stüdyo</h5>
        <a href="hizmetler.html">Hizmetler</a><a href="fiyatlandirma.html">Paketler</a><a href="iletisim.html">İletişim</a></div>
      <div class="col"><h5>İletişim</h5>
        <a href="${ETSlib.wa('Merhaba EbruTech Studios')}" target="_blank">WhatsApp</a>
        <a href="mailto:${ETS.email}">${ETS.email}</a></div>
    </div>
    <div class="foot-bottom">
      <span>© 2026 EbruTech Studios — Tüm hakları saklıdır.</span>
      <span>Akın Bolcan · Ebru Bolcan</span>
    </div>
  </div></footer>`);

  // mobil menü
  const burger=document.querySelector(".burger");
  const menu=document.querySelector(".nav-links");
  burger.addEventListener("click",()=>menu.classList.toggle("open"));
  menu.querySelectorAll("a").forEach(a=>a.addEventListener("click",()=>menu.classList.remove("open")));
}

/* ---- Scroll reveal ---- */
function initReveal(){
  const els=document.querySelectorAll(".reveal");
  if(!("IntersectionObserver" in window)){els.forEach(e=>e.classList.add("in"));return;}
  const io=new IntersectionObserver((ents)=>ents.forEach(e=>{if(e.isIntersecting){e.target.classList.add("in");io.unobserve(e.target);}}),{threshold:.12});
  els.forEach(e=>io.observe(e));
}

document.addEventListener("DOMContentLoaded",()=>{buildShell();initReveal();});
