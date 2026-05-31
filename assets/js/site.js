/* ===== EbruTech Studios — site.js =====
   Tek kaynaktan header/footer enjeksiyonu + Firebase Pro durumu.
   ================================================ */

const ETS = {
  brand: "EbruTech Studios",
  whatsapp: "905414792972",
  email: "info@ebrutechsystems.com"
};

const NAV = [
  ["index.html","Ana Sayfa"],
  ["tools.html","Araçlar"],
  ["hizmetler.html","Hizmetler"],
  ["fiyatlandirma.html","Fiyatlandırma"],
  ["iletisim.html","İletişim"]
];

const ETSlib = {
  wa(msg){return `https://wa.me/${ETS.whatsapp}?text=${encodeURIComponent(msg)}`;},
  // Pro durumu artık Firebase'den gelir (firebase.js içinde window.ETSAuth)
  isPro(){ return !!(window.ETSAuth && window.ETSAuth.isPro); },
  toast(msg){
    let t=document.querySelector(".toast");
    if(!t){t=document.createElement("div");t.className="toast";document.body.appendChild(t);}
    t.textContent=msg;t.classList.add("show");
    clearTimeout(this._tt);this._tt=setTimeout(()=>t.classList.remove("show"),2600);
  }
};

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
      <a href="giris.html" class="nav-cta" id="navAuth">Giriş Yap</a>
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
        <a href="tools.html">Tüm Araçlar</a><a href="fiyatlandirma.html">Pro Üyelik</a><a href="giris.html">Giriş / Hesap</a></div>
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

  const burger=document.querySelector(".burger");
  const menu=document.querySelector(".nav-links");
  burger.addEventListener("click",()=>menu.classList.toggle("open"));
  menu.querySelectorAll("a").forEach(a=>a.addEventListener("click",()=>menu.classList.remove("open")));

  // Firebase hazır olunca navbar'ı güncelle
  document.addEventListener("ets-auth",(e)=>{
    const navAuth=document.getElementById("navAuth");
    if(!navAuth)return;
    if(e.detail.user){
      const name=e.detail.user.displayName||e.detail.user.email.split("@")[0];
      navAuth.textContent=e.detail.isPro?("★ "+name):name;
      navAuth.href="giris.html";
    }else{
      navAuth.textContent="Giriş Yap";navAuth.href="giris.html";
    }
  });
}

function initReveal(){
  const els=document.querySelectorAll(".reveal");
  if(!("IntersectionObserver" in window)){els.forEach(e=>e.classList.add("in"));return;}
  const io=new IntersectionObserver((ents)=>ents.forEach(e=>{if(e.isIntersecting){e.target.classList.add("in");io.unobserve(e.target);}}),{threshold:.12});
  els.forEach(e=>io.observe(e));
}

document.addEventListener("DOMContentLoaded",()=>{buildShell();initReveal();});
