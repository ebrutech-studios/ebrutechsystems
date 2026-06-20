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

/* ── Araç sayfası algılama ── */
function getToolKey(){
  const p=location.pathname.split('/').pop();
  const m=p.match(/^tool-(.+)\.html$/);
  return m?m[1]:null;
}

function isToolPage(){ return !!getToolKey(); }
function isToolsIndex(){ return (location.pathname.split('/').pop()||'index.html')==='tools.html'; }

/* ── Sayı formatlama ── */
function fmtCount(n){
  if(n>=1e6) return (n/1e6).toFixed(1).replace('.0','')+' M';
  if(n>=1e3) return (n/1e3).toFixed(1).replace('.0','')+' B';
  return String(n);
}

/* ── ETSFirestore hazır olunca çalıştır ── */
function whenFirestoreReady(cb){
  if(window.ETSFirestore && window.ETSAuth && window.ETSAuth.db) cb();
  else setTimeout(()=>whenFirestoreReady(cb), 80);
}

/* ═══════════════════════════════════════════════
   1. KULLANIM SAYACI
   ═══════════════════════════════════════════════ */

function trackToolUse(){
  const key=getToolKey();
  if(!key) return;
  try{
    let recent=JSON.parse(localStorage.getItem('ets-recent')||'[]');
    const page=location.pathname.split('/').pop();
    const h1=document.querySelector('h1');
    const raw=h1?h1.textContent.trim():'';
    const title=raw.replace(/^[\s\S]{0,4}?([\p{L}])/u,'$1').slice(0,32);
    recent=recent.filter(r=>r.page!==page);
    recent.unshift({page,title,key});
    if(recent.length>6) recent=recent.slice(0,6);
    localStorage.setItem('ets-recent',JSON.stringify(recent));
  }catch(e){}
}

async function initToolCounter(){
  const key=getToolKey();
  if(!key) return;
  whenFirestoreReady(async()=>{
    const F=window.ETSFirestore;
    const db=window.ETSAuth.db;
    const ref=F.doc(db,'toolStats','all');
    try{
      await F.updateDoc(ref,{[key]:F.increment(1)});
    }catch(e){
      try{ await F.setDoc(ref,{[key]:1},{merge:true}); }catch(e2){}
    }
    try{
      const snap=await F.getDoc(ref);
      if(snap.exists()){
        const count=snap.data()[key]||0;
        const el=document.querySelector('.tool-use-badge');
        if(el&&count>0) el.textContent=fmtCount(count)+' kullanım';
      }
    }catch(e){}
  });
}

async function loadToolsPageCounts(){
  if(!isToolsIndex()) return;
  whenFirestoreReady(async()=>{
    const F=window.ETSFirestore;
    const db=window.ETSAuth.db;
    try{
      const snap=await F.getDoc(F.doc(db,'toolStats','all'));
      if(!snap.exists()) return;
      const data=snap.data();
      document.querySelectorAll('[data-key]').forEach(card=>{
        const k=card.dataset.key;
        if(data[k]&&data[k]>0){
          const badge=card.querySelector('.use-count');
          if(badge) badge.textContent=fmtCount(data[k])+' kullanım';
        }
      });
    }catch(e){}
  });
}

/* ═══════════════════════════════════════════════
   2. KULLANICI YORUMLARI
   ═══════════════════════════════════════════════ */

function highlightStars(container,n){
  container.querySelectorAll('span').forEach(s=>{
    s.classList.toggle('on',+s.dataset.star<=n);
  });
}

async function loadReviews(key){
  const list=document.getElementById('etsReviewsList');
  if(!list) return;
  const F=window.ETSFirestore;
  const db=window.ETSAuth.db;
  try{
    const col=F.collection(db,'toolReviews',key,'reviews');
    const q=F.query(col,F.orderBy('createdAt','desc'),F.limit(12));
    const snap=await F.getDocs(q);
    if(snap.empty){
      list.innerHTML='<p class="reviews-empty">Henüz yorum yok. İlk yorumu sen bırak!</p>';
      return;
    }
    list.innerHTML='';
    snap.forEach(d=>{
      const r=d.data();
      const stars='★'.repeat(r.stars||5)+'☆'.repeat(5-(r.stars||5));
      const dt=r.createdAt&&r.createdAt.toDate?r.createdAt.toDate().toLocaleDateString('tr-TR'):'';
      const div=document.createElement('div');
      div.className='review-card reveal';
      div.innerHTML=`<div class="rc-head"><span class="rc-name">${r.userName||'Anonim'}</span><span class="rc-stars">${stars}</span>${dt?`<span class="rc-date">${dt}</span>`:''}</div>${r.text?`<p class="rc-text">${r.text}</p>`:''}`;
      list.appendChild(div);
    });
    if(typeof initReveal==='function') initReveal();
  }catch(e){
    list.innerHTML='<p class="reviews-empty">Yorumlar yüklenemedi.</p>';
  }
}

function renderReviewForm(key,user){
  const form=document.getElementById('etsReviewForm');
  if(!form) return;
  if(!user){
    form.innerHTML=`<p class="review-login-prompt"><a href="giris.html">Giriş yaparak</a> yorum bırakabilirsiniz.</p>`;
    return;
  }
  let sel=5;
  form.innerHTML=`
<div class="review-write">
  <p style="font-size:.92rem;color:var(--txt-dim);margin-bottom:14px">Değerlendirme yap</p>
  <div class="stars-input" id="etsStars">${[1,2,3,4,5].map(i=>`<span data-star="${i}" class="on">★</span>`).join('')}</div>
  <textarea id="etsReviewText" rows="3" placeholder="Bu araç hakkında düşüncelerinizi paylaşın…"></textarea>
  <button class="btn btn-primary" id="etsSubmitReview">Yorum Gönder</button>
  <p id="etsReviewMsg" style="display:none;color:var(--accent);font-size:.88rem;margin-top:8px"></p>
</div>`;

  const starsEl=document.getElementById('etsStars');
  starsEl.querySelectorAll('span').forEach(s=>{
    s.addEventListener('mouseover',()=>highlightStars(starsEl,+s.dataset.star));
    s.addEventListener('click',()=>{ sel=+s.dataset.star; highlightStars(starsEl,sel); });
    s.addEventListener('mouseout',()=>highlightStars(starsEl,sel));
  });

  document.getElementById('etsSubmitReview').addEventListener('click',async()=>{
    const text=document.getElementById('etsReviewText').value.trim();
    if(!text){ ETSlib.toast('Lütfen bir yorum yazın.'); return; }
    const btn=document.getElementById('etsSubmitReview');
    btn.disabled=true; btn.textContent='Gönderiliyor…';
    try{
      const F=window.ETSFirestore;
      const db=window.ETSAuth.db;
      await F.addDoc(F.collection(db,'toolReviews',key,'reviews'),{
        userId:user.uid,
        userName:user.displayName||user.email.split('@')[0],
        text, stars:sel,
        createdAt:F.serverTimestamp()
      });
      const msg=document.getElementById('etsReviewMsg');
      msg.textContent='Yorumunuz eklendi, teşekkürler!'; msg.style.display='block';
      document.getElementById('etsReviewText').value='';
      btn.textContent='Yorum Gönder'; btn.disabled=false;
      setTimeout(()=>loadReviews(key),800);
    }catch(e){
      ETSlib.toast('Yorum eklenemedi, lütfen tekrar deneyin.');
      btn.disabled=false; btn.textContent='Yorum Gönder';
    }
  });
}

function initToolReviews(){
  if(!isToolPage()) return;
  const key=getToolKey();

  const sec=document.createElement('section');
  sec.className='tool-reviews-section';
  sec.innerHTML=`
<div class="wrap">
  <div class="section-head reveal">
    <span class="eyebrow">Değerlendirmeler</span>
    <h2>Kullanıcı yorumları</h2>
  </div>
  <div id="etsReviewForm" class="review-form"></div>
  <div id="etsReviewsList" class="reviews-list"><p class="reviews-empty">Yükleniyor…</p></div>
</div>`;

  const foot=document.querySelector('.site-foot');
  if(foot) foot.before(sec);
  else document.body.appendChild(sec);

  whenFirestoreReady(()=>{
    loadReviews(key);
    window.ETSAuth.onReady((user)=>renderReviewForm(key,user));
  });
}

/* ═══════════════════════════════════════════════
   3. SON KULLANILAN ARAÇLAR (tools.html)
   ═══════════════════════════════════════════════ */

function initRecentTools(){
  if(!isToolsIndex()) return;
  let recent;
  try{ recent=JSON.parse(localStorage.getItem('ets-recent')||'[]'); }
  catch(e){ return; }
  if(!recent.length) return;

  const wrap=document.querySelector('.tool-search-wrap');
  if(!wrap) return;

  const div=document.createElement('div');
  div.className='recent-tools reveal';
  div.innerHTML=`<span class="recent-label">Son kullandıklarınız:</span>`+
    recent.slice(0,5).map(r=>`<a href="${r.page}" class="recent-chip">${r.title||r.key}</a>`).join('');
  wrap.before(div);
}

/* ═══════════════════════════════════════════════
   4. ARAÇ SAYACI BADGE — hero inject
   ═══════════════════════════════════════════════ */

function injectToolBadge(){
  if(!isToolPage()) return;
  const lead=document.querySelector('.hero .lead, .tool-shell .lead');
  if(!lead) return;
  const badge=document.createElement('div');
  badge.className='tool-use-badge-wrap';
  badge.innerHTML=`<span class="tool-use-badge">— kullanım</span>`;
  lead.after(badge);
}

/* ═══════════════════════════════════════════════
   SHELL (Header + Footer)
   ═══════════════════════════════════════════════ */

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
    if(!navAuth) return;
    if(e.detail.user){
      const name=e.detail.user.displayName||e.detail.user.email.split("@")[0];
      navAuth.textContent=e.detail.isPro?("★ "+name):name;
      navAuth.href="giris.html";
    }else{
      navAuth.textContent="Giriş Yap"; navAuth.href="giris.html";
    }
  });
}

function injectFavicon(){
  if(document.querySelector('link[rel~="icon"]')) return;
  const link=document.createElement('link');
  link.rel='icon'; link.type='image/svg+xml';
  link.href="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32'%3E%3Crect width='32' height='32' rx='8' fill='%23c8ff2e'/%3E%3Ctext x='16' y='22' text-anchor='middle' font-family='Arial Black,sans-serif' font-size='18' font-weight='900' fill='%2310140a'%3EE%3C/text%3E%3C/svg%3E";
  document.head.appendChild(link);
}

function initWaFloat(){
  const btn=document.createElement('a');
  btn.className='wa-float';
  btn.href=ETSlib.wa('Merhaba, EbruTech Studios hakkında bilgi almak istiyorum.');
  btn.target='_blank'; btn.rel='noopener noreferrer';
  btn.setAttribute('aria-label','WhatsApp ile iletişim');
  btn.innerHTML=`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="white"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>`;
  document.body.appendChild(btn);
}

function initKvkk(){
  if(localStorage.getItem('ets-kvkk')) return;
  const banner=document.createElement('div');
  banner.className='kvkk-banner';
  banner.innerHTML=`
    <p>Bu site hizmet kalitesini artırmak amacıyla çerezler kullanır. Devam ederek kabul etmiş sayılırsınız.</p>
    <div style="display:flex;gap:10px;flex:none">
      <button class="btn btn-ghost" id="kvkkDeny" style="min-height:38px;padding:8px 16px;font-size:.88rem">Reddet</button>
      <button class="btn btn-primary" id="kvkkAccept" style="min-height:38px;padding:8px 16px;font-size:.88rem">Kabul Et</button>
    </div>`;
  document.body.appendChild(banner);
  document.getElementById('kvkkAccept').addEventListener('click',()=>{ localStorage.setItem('ets-kvkk','1'); banner.remove(); });
  document.getElementById('kvkkDeny').addEventListener('click',()=>banner.remove());
}

function initReveal(){
  const els=document.querySelectorAll(".reveal");
  if(!("IntersectionObserver" in window)){ els.forEach(e=>e.classList.add("in")); return; }
  const io=new IntersectionObserver((ents)=>ents.forEach(e=>{
    if(e.isIntersecting){ e.target.classList.add("in"); io.unobserve(e.target); }
  }),{threshold:.12});
  els.forEach(e=>io.observe(e));
}

/* ═══════════════════════════════════════════════
   5. SCROLL PROGRESS BAR
   ═══════════════════════════════════════════════ */
function initScrollProgress(){
  const bar=document.createElement('div');
  bar.id='ets-progress';
  document.body.prepend(bar);
  window.addEventListener('scroll',()=>{
    const total=document.body.scrollHeight-innerHeight;
    if(total<=0) return;
    bar.style.width=(scrollY/total*100)+'%';
  },{passive:true});
}

/* ═══════════════════════════════════════════════
   6. ANIMATED COUNTERS
   ═══════════════════════════════════════════════ */
function initCounters(){
  const els=document.querySelectorAll('[data-count]');
  if(!els.length) return;
  const io=new IntersectionObserver((entries)=>{
    entries.forEach(e=>{
      if(!e.isIntersecting) return;
      const el=e.target;
      const target=+el.dataset.count;
      const suffix=el.dataset.suffix||'';
      if(target===0){el.textContent='0'+suffix; io.unobserve(el); return;}
      const steps=50; let i=0;
      const timer=setInterval(()=>{
        i++;
        const p=1-Math.pow(1-i/steps,3);
        el.textContent=Math.round(target*p)+suffix;
        if(i>=steps){el.textContent=target+suffix;clearInterval(timer);}
      },20);
      io.unobserve(el);
    });
  },{threshold:.6});
  els.forEach(el=>io.observe(el));
}

/* ═══════════════════════════════════════════════
   7. BREADCRUMB (araç sayfaları)
   ═══════════════════════════════════════════════ */
function initBreadcrumb(){
  if(!isToolPage()) return;
  const h1=document.querySelector('h1');
  const title=h1?h1.textContent.trim().replace(/\s+/g,' ').slice(0,44):'Araç';
  const nav=document.createElement('nav');
  nav.className='breadcrumb';
  nav.setAttribute('aria-label','Gezinti yolu');
  nav.innerHTML=`<div class="wrap"><a href="index.html">Ana Sayfa</a><span aria-hidden="true"> / </span><a href="tools.html">Araçlar</a><span aria-hidden="true"> / </span><span aria-current="page">${title}</span></div>`;
  const head=document.querySelector('.site-head');
  if(head) head.after(nav);
}

/* ═══════════════════════════════════════════════
   8. FAQ ACCORDION
   ═══════════════════════════════════════════════ */
function initFaq(){
  document.querySelectorAll('.faq-item').forEach(item=>{
    const q=item.querySelector('.faq-q');
    if(!q) return;
    q.addEventListener('click',()=>{
      const wasOpen=item.classList.contains('open');
      document.querySelectorAll('.faq-item').forEach(i=>i.classList.remove('open'));
      if(!wasOpen) item.classList.add('open');
    });
  });
}

document.addEventListener("DOMContentLoaded",()=>{
  buildShell();
  initReveal();
  injectFavicon();
  initWaFloat();
  initKvkk();
  injectToolBadge();
  trackToolUse();
  initToolCounter();
  initToolReviews();
  initRecentTools();
  loadToolsPageCounts();
  initScrollProgress();
  initCounters();
  initBreadcrumb();
  initFaq();
});
