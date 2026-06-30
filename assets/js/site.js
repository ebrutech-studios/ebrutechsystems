/* ===== EbruTech Studios — site.js ===== */

const ETS = {
  brand: "EbruTech Studios",
  whatsapp: "905313814971",
  email: "info@ebrutechsystems.com"
};

const MAX_REVIEW_LENGTH = 500;

const NAV = [
  ["index.html","Ana Sayfa"],
  ["tools.html","Araçlar"],
  ["hizmetler.html","Hizmetler"],
  ["hazir-siteler.html","Hazır Siteler"],
  ["magaza.html","Mağaza"],
  ["fiyatlandirma.html","Fiyatlandırma"],
  ["blog.html","Blog"],
  ["iletisim.html","İletişim"]
];

/* ── Araç metadata + ilişki haritası ── */
const TOOL_META = {
  converter:   {name:'Format Dönüştürücü',   ico:'🖼️', href:'tool-converter.html',   free:true},
  compressor:  {name:'Resim Sıkıştırıcı',    ico:'⚡', href:'tool-compressor.html',  free:true},
  resizer:     {name:'Boyutlandırıcı',        ico:'📏', href:'tool-resizer.html',      free:true},
  crop:        {name:'Resim Kırpma',          ico:'✂️', href:'tool-crop.html',         free:true},
  rotate:      {name:'Döndürme & Çevirme',   ico:'🔄', href:'tool-rotate.html',       free:true},
  watermark:   {name:'Watermark Ekle',        ico:'💧', href:'tool-watermark.html',    free:true},
  qr:          {name:'QR Kod Üretici',        ico:'🔳', href:'tool-qr.html',           free:true},
  palette:     {name:'Renk Paleti Çıkarıcı', ico:'🎨', href:'tool-palette.html',      free:true},
  social:      {name:'Sosyal Medya Boyut',    ico:'📱', href:'tool-social.html',       free:true},
  json:        {name:'JSON Formatlayıcı',     ico:'{}', href:'tool-json.html',         free:true},
  base64:      {name:'Base64 Encode/Decode',  ico:'🔐', href:'tool-base64.html',       free:true},
  color:       {name:'Renk Kodu Dönüştür',   ico:'🌈', href:'tool-color.html',        free:true},
  password:    {name:'Şifre Üreticisi',       ico:'🔑', href:'tool-password.html',     free:true},
  pdf:         {name:'PDF Birleştirici',       ico:'📄', href:'tool-pdf.html',          free:true},
  'img2pdf':   {name:'Resimden PDF',          ico:'🖼️', href:'tool-img2pdf.html',      free:true},
  cv:          {name:'CV Oluşturucu',         ico:'📋', href:'tool-cv.html',           free:true},
  wordcount:   {name:'Kelime Sayıcı',         ico:'🔢', href:'tool-wordcount.html',    free:true},
  textcase:    {name:'Büyük/Küçük Harf',     ico:'Aa', href:'tool-textcase.html',     free:true},
  age:         {name:'Yaş Hesaplama',         ico:'🎂', href:'tool-age.html',          free:true},
  vat:         {name:'KDV Hesaplama',         ico:'💰', href:'tool-vat.html',          free:true},
  loan:        {name:'Kredi Hesaplama',       ico:'🏦', href:'tool-loan.html',         free:true},
  unit:        {name:'Birim Dönüştürücü',    ico:'📐', href:'tool-unit.html',         free:true},
  batch:       {name:'Toplu İşlem',           ico:'🗂️', href:'tool-batch.html',        free:false},
  bgremove:    {name:'Arka Plan Kaldırıcı',  ico:'✂️', href:'tool-bgremove.html',     free:false},
  'pdf2img':   {name:"PDF'den Resme",         ico:'📄', href:'tool-pdf2img.html',      free:false},
  pdforganize: {name:'PDF Sayfa Düzenle',    ico:'📑', href:'tool-pdforganize.html',  free:false},
  invoice:     {name:'Fatura Oluşturucu',    ico:'🧾', href:'tool-invoice.html',      free:false},
  qrmenu:      {name:'QR Menü Oluşturucu',  ico:'📱', href:'tool-qrmenu.html',       free:false},
  barcode:     {name:'Barkod Üreticisi',     ico:'▥',  href:'tool-barcode.html',      free:false},
  timer:       {name:'Kronometre & Sayaç',   ico:'⏱️', href:'tool-timer.html',        free:true},
  percentage:  {name:'Yüzde Hesaplama',      ico:'%',  href:'tool-percentage.html',   free:true},
  slug:        {name:'URL Slug Oluşturucu',  ico:'🔗', href:'tool-slug.html',         free:true},
  lorem:       {name:'Lorem Ipsum Üretici',  ico:'📝', href:'tool-lorem.html',        free:true},
  diff:        {name:'Metin Karşılaştırma',  ico:'⚖️', href:'tool-diff.html',         free:true},
  number:      {name:'Sayı → Türkçe Yazıyla',ico:'🔡', href:'tool-number.html',       free:true},
  bmi:         {name:'VKİ / BMI Hesaplama', ico:'⚖️', href:'tool-bmi.html',          free:true},
  hash:        {name:'Hash Üretici',         ico:'🔒', href:'tool-hash.html',         free:true},
  gradient:    {name:'CSS Gradient Üretici', ico:'🌈', href:'tool-gradient.html',     free:true},
  regex:       {name:'Regex Test Aracı',     ico:'.*',  href:'tool-regex.html',        free:true},
  timestamp:   {name:'Timestamp Dönüştürücü',ico:'⏰', href:'tool-timestamp.html',    free:true},
};





/* ── Araç başlangıç sayaçları (gerçek kullanım bu sayıya eklenir) ── */
const TOOL_BASE = {
  converter:    3247,
  compressor:   4183,
  resizer:      2156,
  crop:         1634,
  rotate:       1089,
  watermark:     876,
  qr:           2743,
  palette:       712,
  social:        934,
  batch:         387,
  bgremove:      521,
  json:         1891,
  base64:       1432,
  color:        1678,
  password:     3012,
  pdf:          1934,
  'img2pdf':    1123,
  cv:           2218,
  wordcount:    1589,
  textcase:      834,
  age:          2134,
  vat:          1823,
  loan:         1567,
  unit:         1012,
  timer:         743,
  percentage:   1389,
  slug:          623,
  lorem:         845,
  diff:          578,
  number:        734,
  bmi:          1289,
  hash:          934,
  gradient:     1067,
  regex:         812,
  timestamp:     645,
  'pdf2img':     267,
  pdforganize:   212,
  invoice:       389,
  qrmenu:        312,
  barcode:       345,
};

function baseCount(key){ return TOOL_BASE[key]||0; }

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
        const total=(snap.data()[key]||0)+baseCount(key);
        const el=document.querySelector('.tool-use-badge');
        if(el&&total>0) el.textContent=fmtCount(total)+' kullanım';
      }
    }catch(e){}
  });
}

async function loadToolsPageCounts(){
  if(!isToolsIndex()) return;
  // Önce seed sayıları anında göster
  document.querySelectorAll('[data-key]').forEach(card=>{
    const k=card.dataset.key;
    const base=baseCount(k);
    if(base>0){
      const badge=card.querySelector('.use-count');
      if(badge) badge.textContent=fmtCount(base)+' kullanım';
    }
  });
  // Firestore yüklenince gerçek sayıyı üstüne ekle
  whenFirestoreReady(async()=>{
    const F=window.ETSFirestore;
    const db=window.ETSAuth.db;
    try{
      const snap=await F.getDoc(F.doc(db,'toolStats','all'));
      const data=snap.exists()?snap.data():{};
      document.querySelectorAll('[data-key]').forEach(card=>{
        const k=card.dataset.key;
        const total=(data[k]||0)+baseCount(k);
        if(total>0){
          const badge=card.querySelector('.use-count');
          if(badge) badge.textContent=fmtCount(total)+' kullanım';
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
      const rating=Math.min(5,Math.max(1,Number.parseInt(r.stars,10)||5));
      const stars='★'.repeat(rating)+'☆'.repeat(5-rating);
      const dt=r.createdAt&&r.createdAt.toDate?r.createdAt.toDate().toLocaleDateString('tr-TR'):'';
      const div=document.createElement('div');
      div.className='review-card reveal';
      const head=document.createElement('div');
      head.className='rc-head';

      const name=document.createElement('span');
      name.className='rc-name';
      name.textContent=String(r.userName||'Anonim').slice(0,80);
      head.appendChild(name);

      const starsEl=document.createElement('span');
      starsEl.className='rc-stars';
      starsEl.textContent=stars;
      starsEl.setAttribute('aria-label',`${rating} / 5 yıldız`);
      head.appendChild(starsEl);

      if(dt){
        const date=document.createElement('span');
        date.className='rc-date';
        date.textContent=dt;
        head.appendChild(date);
      }
      div.appendChild(head);

      if(r.text){
        const text=document.createElement('p');
        text.className='rc-text';
        text.textContent=String(r.text).slice(0,MAX_REVIEW_LENGTH);
        div.appendChild(text);
      }
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
  <textarea id="etsReviewText" rows="3" maxlength="${MAX_REVIEW_LENGTH}" aria-label="Araç yorumunuz" placeholder="Bu araç hakkında düşüncelerinizi paylaşın…"></textarea>
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
    if(text.length>MAX_REVIEW_LENGTH){ ETSlib.toast(`Yorum en fazla ${MAX_REVIEW_LENGTH} karakter olabilir.`); return; }
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
  const label=document.createElement('span');
  label.className='recent-label';
  label.textContent='Son kullandıklarınız:';
  div.appendChild(label);
  recent.slice(0,5).forEach(r=>{
    const meta=TOOL_META[r&&r.key];
    if(!meta) return;
    const link=document.createElement('a');
    link.href=meta.href;
    link.className='recent-chip';
    link.textContent=String(r.title||meta.name).slice(0,40);
    div.appendChild(link);
  });
  if(div.children.length===1) return;
  wrap.before(div);
}

/* ═══════════════════════════════════════════════
   4. ARAÇ SAYACI BADGE — hero inject
   ═══════════════════════════════════════════════ */

function injectToolBadge(){
  if(!isToolPage()) return;
  const key=getToolKey();
  const lead=document.querySelector('.hero .lead, .tool-shell .lead');
  if(!lead) return;
  const base=baseCount(key);
  const badge=document.createElement('div');
  badge.className='tool-use-badge-wrap';
  badge.innerHTML=`<span class="tool-use-badge">${base>0?fmtCount(base)+' kullanım':'— kullanım'}</span>`;
  lead.after(badge);
}

/* ═══════════════════════════════════════════════
   SHELL (Header + Footer)
   ═══════════════════════════════════════════════ */

function buildShell(){
  const here=(location.pathname.split("/").pop()||"index.html");
  const isToolP=here.startsWith('tool-');
  const links=NAV.map(([h,l])=>`<a href="${h}" class="${(h===here||(isToolP&&h==='tools.html'))?'active':''}">${l}</a>`).join("");

  document.body.insertAdjacentHTML("afterbegin",`
  <header class="site-head"><div class="wrap"><nav class="nav">
    <a class="brand" href="index.html">
      <span class="logo"><img src="assets/logo-mark.png" alt="" aria-hidden="true"></span>
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
          <span class="logo"><img src="assets/logo-mark.png" alt="" aria-hidden="true"></span><span>EbruTech Studios</span></a>
        <p style="color:var(--txt-dim);font-size:.9rem">Tarayıcıda çalışan profesyonel görsel araçlar ve KOBİ'lere özel tasarım & yazılım çözümleri.</p>
      </div>
      <div class="col"><h5>Ürün</h5>
        <a href="tools.html">Tüm Araçlar</a><a href="fiyatlandirma.html">Pro Üyelik</a><a href="giris.html">Giriş / Hesap</a></div>
      <div class="col"><h5>Stüdyo</h5>
        <a href="hizmetler.html">Hizmetler</a><a href="fiyatlandirma.html">Paketler</a><a href="hakkimizda.html">Hakkımızda</a><a href="iletisim.html">İletişim</a></div>
      <div class="col"><h5>Yasal</h5>
        <a href="gizlilik.html">Gizlilik & KVKK</a><a href="kosullar.html">Kullanım Koşulları</a></div>
      <div class="col"><h5>İletişim</h5>
        <a href="${ETSlib.wa('Merhaba EbruTech Studios')}" target="_blank" rel="noopener noreferrer">WhatsApp</a>
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
    <div class="foot-newsletter">
      <div class="foot-newsletter-inner">
        <div>
          <strong style="font-size:.95rem;color:var(--txt)">Yeni araç ve rehberlerden haberdar ol</strong>
          <p style="color:var(--txt-dim);font-size:.84rem;margin:4px 0 0">Sadece WhatsApp. Spam yok, istediğinde çıkabilirsin.</p>
        </div>
        <a id="footer-wa-newsletter" href="#" target="_blank" rel="noopener noreferrer" class="btn btn-wa" style="white-space:nowrap;flex-shrink:0">
          <svg viewBox="0 0 24 24" fill="currentColor" width="16" height="16" style="margin-right:6px;flex-shrink:0"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
          WhatsApp'a Katıl
        </a>
      </div>
    </div>
    <div class="foot-bottom">
      <span>© 2026 EbruTech Studios — Tüm hakları saklıdır.</span>
      <span><a href="gizlilik.html" style="color:var(--txt-faint)">Gizlilik</a> · <a href="kosullar.html" style="color:var(--txt-faint)">Koşullar</a> · Akın Bolcan · Ebru Bolcan</span>
    </div>
  </div></footer>`);

  const nlBtn=document.getElementById('footer-wa-newsletter');
  if(nlBtn) nlBtn.href=ETSlib.wa('Merhaba! EbruTech Studios yeni araç ve rehberlerinden haberdar olmak istiyorum. Beni listeye ekler misiniz?');

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
  link.rel='icon';
  link.href='/favicon.ico';
  document.head.appendChild(link);
}

function hardenNewTabLinks(){
  document.querySelectorAll('a[target="_blank"]').forEach(link=>{
    const rel=new Set((link.getAttribute('rel')||'').split(/\s+/).filter(Boolean));
    rel.add('noopener');
    rel.add('noreferrer');
    link.setAttribute('rel',[...rel].join(' '));
  });
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
    <p>Bu site hizmet kalitesini artırmak amacıyla çerezler kullanır. Devam ederek kabul etmiş sayılırsınız. <a href="gizlilik.html" style="color:var(--accent)">Gizlilik Politikası</a></p>
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
   9. BENZER ARAÇLAR
   ═══════════════════════════════════════════════ */
function initRelatedTools(){
  if(!isToolPage()) return;
  const key=getToolKey();
  const related=((window.TOOL_RELATED||{})[key]||[]).filter(k=>TOOL_META[k]&&k!==key).slice(0,4);
  if(!related.length) return;

  const sec=document.createElement('section');
  sec.className='related-tools-section';
  sec.innerHTML=`<div class="wrap">
    <div class="section-head" style="margin-bottom:22px">
      <span class="eyebrow">Benzer Araçlar</span>
      <h2>Bunu da deneyebilirsiniz</h2>
    </div>
    <div class="grid g-4">
      ${related.map(k=>{
        const t=TOOL_META[k];
        return `<a class="card tool-card reveal" href="${t.href}">
          <span class="ico">${t.ico}</span>
          <h3>${t.name}</h3>
          <div class="tags"><span class="tag ${t.free?'tag-ok':'tag-pro'}">${t.free?'Ücretsiz':'Pro'}</span></div>
        </a>`;
      }).join('')}
    </div>
  </div>`;

  const reviews=document.querySelector('.tool-reviews-section');
  const foot=document.querySelector('.site-foot');
  if(reviews) reviews.before(sec);
  else if(foot) foot.before(sec);
  else document.body.appendChild(sec);

  initReveal();
}

/* ═══════════════════════════════════════════════
   10. PROMO BAR
   ═══════════════════════════════════════════════ */
function initPromoBar(){
  if(localStorage.getItem('ets-promo-v3')) return;
  const bar=document.createElement('div');
  bar.className='promo-bar';
  bar.innerHTML=`<span>🆕 ${Object.keys(TOOL_META).length} online araç — görsel, PDF, geliştirici ve hesaplama araçları!</span><a href="tools.html">Tüm Araçlar →</a><button class="promo-close" aria-label="Duyuruyu kapat">×</button>`;
  document.body.prepend(bar);
  bar.querySelector('.promo-close').addEventListener('click',()=>{
    localStorage.setItem('ets-promo-v3','1');
    bar.remove();
  });
}

/* ═══════════════════════════════════════════════
   11. BACK TO TOP
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

/* ═══════════════════════════════════════════════
   13. ARAÇ SAYFASI: ADIMLAR + SSS + JSON-LD
   ═══════════════════════════════════════════════ */
function initToolPage(){
  if(!isToolPage()) return;
  const key=getToolKey();
  const d=(window.TOOL_PAGE_DATA||{})[key];
  if(!d) return;

  const howSec=document.createElement('section');
  howSec.className='tool-how-section';
  howSec.innerHTML=`<div class="wrap"><div class="section-head reveal"><span class="eyebrow">Nasıl Kullanılır</span><h2>3 adımda hazır</h2></div><div class="tool-steps">${
    d.steps.map(s=>`<div class="tool-step reveal"><div class="tool-step-ico">${s.ico}</div><div><h4>${s.t}</h4><p>${s.d}</p></div></div>`).join('')
  }</div></div>`;
  const hero=document.querySelector('.hero');
  if(hero) hero.after(howSec);

  if(d.faq&&d.faq.length){
    const faqSec=document.createElement('section');
    faqSec.className='tool-faq-section';
    faqSec.innerHTML=`<div class="wrap" style="max-width:720px"><div class="section-head reveal"><span class="eyebrow">Sık Sorulan Sorular</span><h2>Merak edilenler</h2></div><div class="faq-list">${
      d.faq.map(([q,a])=>`<div class="faq-item reveal"><button class="faq-q">${q}</button><div class="faq-a">${a}</div></div>`).join('')
    }</div></div>`;
    const foot=document.querySelector('.site-foot');
    if(foot) foot.before(faqSec);
    initFaq();
  }

  const h1=document.querySelector('h1');
  const title=h1?h1.textContent.trim():'';
  const url='https://ebrutechsystems.com/'+location.pathname.split('/').pop();
  const ld=document.createElement('script');
  ld.type='application/ld+json';
  ld.textContent=JSON.stringify([
    {"@context":"https://schema.org","@type":"BreadcrumbList","itemListElement":[
      {"@type":"ListItem","position":1,"name":"Ana Sayfa","item":"https://ebrutechsystems.com/"},
      {"@type":"ListItem","position":2,"name":"Araçlar","item":"https://ebrutechsystems.com/tools.html"},
      {"@type":"ListItem","position":3,"name":title,"item":url}
    ]},
    {"@context":"https://schema.org","@type":"HowTo","name":title+" Nasıl Kullanılır","step":
      d.steps.map((s,i)=>({"@type":"HowToStep","position":i+1,"name":s.t,"text":s.d}))
    }
  ]);
  document.head.appendChild(ld);
  initReveal();
}

/* ═══════════════════════════════════════════════
   FAVORİLER
   ═══════════════════════════════════════════════ */
function initFavorites(){
  const onIndex=isToolsIndex();
  const onTool=isToolPage();
  if(!onIndex&&!onTool) return;

  let favs=[];
  try{ favs=JSON.parse(localStorage.getItem('ets-favs')||'[]'); }catch(e){}

  function isFav(k){ return favs.includes(k); }
  function toggleFav(k){
    const i=favs.indexOf(k);
    if(i>=0) favs.splice(i,1); else favs.push(k);
    localStorage.setItem('ets-favs',JSON.stringify(favs));
    return favs.includes(k);
  }

  if(onIndex){
    document.querySelectorAll('[data-key]').forEach(card=>{
      const k=card.dataset.key;
      const btn=document.createElement('button');
      btn.className='fav-btn'+(isFav(k)?' active':'');
      btn.setAttribute('aria-label','Favorilere ekle/çıkar');
      btn.innerHTML='♥';
      btn.addEventListener('click',(e)=>{
        e.preventDefault(); e.stopPropagation();
        btn.classList.toggle('active',toggleFav(k));
        renderFavSection();
      });
      card.appendChild(btn);
    });
    renderFavSection();
  }

  if(onTool){
    const k=getToolKey();
    const anchor=document.querySelector('.tool-use-badge-wrap')||document.querySelector('.hero .lead');
    if(anchor){
      const btn=document.createElement('button');
      btn.className='fav-btn-hero'+(isFav(k)?' active':'');
      btn.innerHTML=(isFav(k)?'♥ Favorilerde':'♡ Favorilere ekle');
      btn.addEventListener('click',()=>{
        const a=toggleFav(k);
        btn.classList.toggle('active',a);
        btn.innerHTML=a?'♥ Favorilerde':'♡ Favorilere ekle';
      });
      anchor.after(btn);
    }
  }

  function renderFavSection(){
    const existing=document.querySelector('.fav-tools-wrap');
    if(!favs.length){ if(existing) existing.remove(); return; }
    const sec=document.createElement('div');
    sec.className='fav-tools-wrap';
    sec.innerHTML=`<span class="eyebrow" style="display:block;margin-bottom:10px">Favorilerim</span><div class="fav-list">${
      favs.map(k=>{const t=TOOL_META[k];return t?`<a href="${t.href}" class="fav-chip">${t.ico} ${t.name}</a>`:''}).filter(Boolean).join('')
    }</div>`;
    const recent=document.querySelector('.recent-tools');
    const search=document.querySelector('.tool-search-wrap');
    if(existing) existing.replaceWith(sec);
    else if(recent) recent.before(sec);
    else if(search) search.before(sec);
  }
}

/* ═══════════════════════════════════════════════
   13. PRO UPSELL MODAL
   ═══════════════════════════════════════════════ */
function initProModal(){
  const PRO_FEATURES=[
    'Toplu (batch) görsel işleme — sınırsız',
    'Watermark\'sız yüksek çözünürlük çıktısı',
    'Arka Plan Kaldırıcı (AI destekli)',
    'PDF sayfa düzenleme ve dönüştürme',
    'Fatura, barkod ve QR menü araçları',
    'Öncelikli WhatsApp desteği'
  ];

  const overlay=document.createElement('div');
  overlay.className='pro-modal-overlay';
  overlay.setAttribute('role','dialog');
  overlay.setAttribute('aria-modal','true');
  overlay.innerHTML=`
<div class="pro-modal" id="proModalBox">
  <button class="pro-modal-close" id="proModalClose" aria-label="Kapat">✕</button>
  <div class="pro-modal-badge">⭐ Pro Özellik</div>
  <h2>Bu araç Pro üyelere özel</h2>
  <div class="pro-modal-tool-name" id="proModalToolName"></div>
  <ul class="pro-modal-features">${PRO_FEATURES.map(f=>`<li>${f}</li>`).join('')}</ul>
  <div class="pro-modal-price-box">
    <strong>149₺</strong><span>/ ay</span>
    <div style="font-size:.78rem;color:var(--txt-faint);margin-top:4px">veya 1.490₺/yıl · 2 ay bedava</div>
  </div>
  <div class="pro-modal-actions">
    <a id="proModalWa" href="#" target="_blank" rel="noopener noreferrer" class="btn btn-wa" style="justify-content:center">WhatsApp'tan Pro Al →</a>
    <a href="fiyatlandirma.html" class="btn btn-ghost" style="justify-content:center">Planları Karşılaştır</a>
  </div>
</div>`;
  document.body.appendChild(overlay);

  function open(toolName,toolIco){
    const nameEl=document.getElementById('proModalToolName');
    if(nameEl) nameEl.innerHTML=(toolIco||'🔒')+' <span>'+toolName+'</span>';
    const waEl=document.getElementById('proModalWa');
    if(waEl) waEl.href=ETSlib.wa('Merhaba! Pro üyelik hakkında bilgi almak istiyorum. Araç: '+toolName);
    overlay.classList.add('open');
    document.body.style.overflow='hidden';
    setTimeout(()=>document.getElementById('proModalClose')&&document.getElementById('proModalClose').focus(),50);
  }
  function close(){
    overlay.classList.remove('open');
    document.body.style.overflow='';
  }
  document.getElementById('proModalClose').addEventListener('click',close);
  overlay.addEventListener('click',function(e){if(e.target===overlay) close();});
  document.addEventListener('keydown',function(e){if(e.key==='Escape'&&overlay.classList.contains('open')) close();});

  document.querySelectorAll('.card.locked, [data-pro="true"]').forEach(card=>{
    card.addEventListener('click',function(e){
      e.preventDefault();
      const title=card.querySelector('h3');
      const ico=card.querySelector('.ico');
      open(title?title.textContent:'Pro Araç', ico?ico.textContent:'🔒');
    });
  });
}

function initRecentToolsFooter(){
  let recent;
  try{ recent=JSON.parse(localStorage.getItem('ets-recent')||'[]'); }
  catch(e){ return; }
  const chips = recent.slice(0,5).filter(r => TOOL_META[r&&r.key]);
  if(!chips.length) return;

  const footer=document.querySelector('.site-foot');
  if(!footer) return;

  const strip=document.createElement('div');
  strip.style.cssText='border-top:1px solid var(--border);padding:14px 0;background:var(--bg)';
  const inner=document.createElement('div');
  inner.className='wrap';
  inner.style.cssText='display:flex;align-items:center;gap:10px;flex-wrap:wrap';

  const lbl=document.createElement('span');
  lbl.style.cssText='color:var(--txt-faint);font-size:.8rem;font-weight:600;white-space:nowrap';
  lbl.textContent='Son kullandıklarınız:';
  inner.appendChild(lbl);

  chips.forEach(r=>{
    const meta=TOOL_META[r.key];
    const a=document.createElement('a');
    a.href=meta.href;
    a.className='recent-chip';
    a.textContent=(meta.ico||'')+'  '+(r.title||meta.name).slice(0,30);
    inner.appendChild(a);
  });
  strip.appendChild(inner);
  footer.before(strip);
}

function disablePwaShell(){
  if('serviceWorker' in navigator){
    navigator.serviceWorker.getRegistrations()
      .then(regs=>Promise.all(regs.map(reg=>reg.unregister())))
      .catch(()=>{});
  }
  if(window.caches&&caches.keys){
    caches.keys()
      .then(keys=>Promise.all(keys.filter(key=>key.indexOf('ets-')===0).map(key=>caches.delete(key))))
      .catch(()=>{});
  }
}

document.addEventListener("DOMContentLoaded",()=>{
  buildShell();
  hardenNewTabLinks();
  initReveal();
  injectFavicon();
  initWaFloat();
  initKvkk();
  initProModal();
  injectToolBadge();
  trackToolUse();
  initToolCounter();
  initToolReviews();
  initRecentTools();
  initRecentToolsFooter();
  disablePwaShell();
  loadToolsPageCounts();
  initScrollProgress();
  initCounters();
  initBreadcrumb();
  initFaq();
  initBackToTop();
  initPromoBar();
  initFavorites();
  initPopularTools();
  if(isToolPage()){
    const s=document.createElement('script');
    s.src='assets/js/tool-data.js';
    s.onload=()=>{ initRelatedTools(); initToolPage(); };
    document.head.appendChild(s);
  }
});

/* ═══════════════════════════════════════════════
   12. POPÜLER ARAÇLAR (tools.html)
   ═══════════════════════════════════════════════ */
function initPopularTools(){
  if(!isToolsIndex()) return;
  function renderPopular(data){
    const sorted=Object.keys(TOOL_META)
      .map(k=>([k,(data[k]||0)+baseCount(k)]))
      .sort((a,b)=>b[1]-a[1])
      .slice(0,6);
    if(sorted.length<3) return;
    const sec=document.createElement('div');
    sec.className='popular-tools-wrap reveal';
    sec.innerHTML=`<div class="popular-tools-header"><span class="eyebrow">Bu ay</span><h3>En çok kullanılan araçlar</h3></div><div class="popular-tools-list">${
      sorted.map(([k,count],i)=>{
        const t=TOOL_META[k];
        return `<a href="${t.href}" class="popular-tool-item"><span class="pop-rank">${i+1}</span><span class="pop-ico">${t.ico}</span><span class="pop-name">${t.name}</span><span class="pop-count">${fmtCount(count)} kullanım</span></a>`;
      }).join('')
    }</div>`;
    const search=document.querySelector('.tool-search-wrap');
    const existing=document.querySelector('.popular-tools-wrap');
    if(existing) existing.replaceWith(sec);
    else if(search) search.before(sec);
    if(typeof initReveal==='function') initReveal();
  }
  // Seed sayılarıyla hemen göster
  renderPopular({});
  // Firestore yüklenince gerçek sayılarla güncelle
  whenFirestoreReady(async()=>{
    const F=window.ETSFirestore;
    const db=window.ETSAuth.db;
    try{
      const snap=await F.getDoc(F.doc(db,'toolStats','all'));
      renderPopular(snap.exists()?snap.data():{});
    }catch(e){}
  });
}
