/* ===== EbruTech Studios — site.js ===== */

const ETS = {
  brand: "EbruTech Studios",
  whatsapp: "905414792972",
  email: "info@ebrutechsystems.com"
};

const NAV = [
  ["index.html","Ana Sayfa"],
  ["tools.html","Araçlar"],
  ["hizmetler.html","Hizmetler"],
  ["hazir-siteler.html","Hazır Siteler"],
  ["fiyatlandirma.html","Fiyatlandırma"],
  ["blog.html","Blog"],
  ["iletisim.html","İletişim"]
];

const ETSlib = {
  wa(msg){return `https://wa.me/${ETS.whatsapp}?text=${encodeURIComponent(msg)}`;},
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

function injectFavicon(){
  if(document.querySelector('link[rel~="icon"]'))return;
  const link=document.createElement('link');
  link.rel='icon';
  link.type='image/svg+xml';
  link.href="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32'%3E%3Crect width='32' height='32' rx='8' fill='%23c8ff2e'/%3E%3Ctext x='16' y='22' text-anchor='middle' font-family='Arial Black,sans-serif' font-size='18' font-weight='900' fill='%2310140a'%3EE%3C/text%3E%3C/svg%3E";
  document.head.appendChild(link);
}

function initWaFloat(){
  const btn=document.createElement('a');
  btn.className='wa-float';
  btn.href=ETSlib.wa('Merhaba, EbruTech Studios hakkında bilgi almak istiyorum.');
  btn.target='_blank';
  btn.rel='noopener noreferrer';
  btn.setAttribute('aria-label','WhatsApp ile iletişim');
  btn.innerHTML=`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="white"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>`;
  document.body.appendChild(btn);
}

function initKvkk(){
  if(localStorage.getItem('ets-kvkk'))return;
  const banner=document.createElement('div');
  banner.className='kvkk-banner';
  banner.innerHTML=`
    <p>Bu site hizmet kalitesini artırmak amacıyla çerezler kullanır. Devam ederek kabul etmiş sayılırsınız.</p>
    <div style="display:flex;gap:10px;flex:none">
      <button class="btn btn-ghost" id="kvkkDeny" style="min-height:38px;padding:8px 16px;font-size:.88rem">Reddet</button>
      <button class="btn btn-primary" id="kvkkAccept" style="min-height:38px;padding:8px 16px;font-size:.88rem">Kabul Et</button>
    </div>`;
  document.body.appendChild(banner);
  document.getElementById('kvkkAccept').addEventListener('click',()=>{
    localStorage.setItem('ets-kvkk','1');
    banner.remove();
  });
  document.getElementById('kvkkDeny').addEventListener('click',()=>banner.remove());
}

function initReveal(){
  const els=document.querySelectorAll(".reveal");
  if(!("IntersectionObserver" in window)){els.forEach(e=>e.classList.add("in"));return;}
  const io=new IntersectionObserver((ents)=>ents.forEach(e=>{if(e.isIntersecting){e.target.classList.add("in");io.unobserve(e.target);}}),{threshold:.12});
  els.forEach(e=>io.observe(e));
}

document.addEventListener("DOMContentLoaded",()=>{
  buildShell();
  initReveal();
  injectFavicon();
  initWaFloat();
  initKvkk();
});
