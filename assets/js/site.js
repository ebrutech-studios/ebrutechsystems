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
        <a href="mailto:${ETS.email}">${ETS.email}</a>
        <div class="social-links">
          <a href="https://instagram.com/ebrutechstudios" target="_blank" rel="noopener noreferrer" class="social-link" aria-label="Instagram">
            <svg viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/></svg>
          </a>
          <a href="https://linkedin.com/company/ebrutech-studios" target="_blank" rel="noopener noreferrer" class="social-link" aria-label="LinkedIn">
            <svg viewBox="0 0 24 24"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
          </a>
          <a href="https://github.com/ebrutech-studios" target="_blank" rel="noopener noreferrer" class="social-link" aria-label="GitHub">
            <svg viewBox="0 0 24 24"><path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"/></svg>
          </a>
        </div>
      </div>
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

/* ═══════════════════════════════════════════════
   9. BACK TO TOP
   ═══════════════════════════════════════════════ */
function initBackToTop(){
  const btn=document.createElement('button');
  btn.id='backToTop';
  btn.setAttribute('aria-label','Sayfanın başına dön');
  btn.innerHTML='↑';
  document.body.appendChild(btn);
  window.addEventListener('scroll',()=>{
    btn.classList.toggle('visible',scrollY>480);
  },{passive:true});
  btn.addEventListener('click',()=>window.scrollTo({top:0,behavior:'smooth'}));
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
  initBackToTop();
});
