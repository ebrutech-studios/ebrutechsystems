import {
  load,
  save,
  uid,
  safe,
  exportData,
  importData,
  reset,
} from "./store.js";
import { modules, nav } from "./config.js";
import {
  AdComponent,
  injectInlineAds,
  initAds,
  setAdsSuspended,
} from "./ads.js";
let state = load(),
  view = document.body.dataset.view || "dashboard",
  editing = null,
  filter = "all",
  query = "";
const $ = (s) => document.querySelector(s),
  esc = (s) =>
    String(s ?? "").replace(
      /[&<>"']/g,
      (c) =>
        ({
          "&": "&amp;",
          "<": "&lt;",
          ">": "&gt;",
          '"': "&quot;",
          "'": "&#39;",
        })[c],
    );
const today = () => new Date().toISOString().slice(0, 10),
  days = (d) => {
    if (!d) return null;
    const x = new Date(`${d}T12:00:00`),
      n = new Date();
    n.setHours(12, 0, 0, 0);
    return Math.ceil((x - n) / 86400000);
  },
  money = (n, c = state.settings.currency) =>
    new Intl.NumberFormat("tr-TR", {
      style: "currency",
      currency: c || "TRY",
      maximumFractionDigits: 2,
    }).format(Number(n) || 0);
function applyTheme() {
  const t =
    state.settings.theme === "system"
      ? matchMedia("(prefers-color-scheme:dark)").matches
        ? "dark"
        : "light"
      : state.settings.theme;
  document.documentElement.dataset.theme = t;
}
function shell() {
  const active = (v) => (v === view ? "active" : "");
  $("#sideNav").innerHTML = nav
    .map(
      (n) =>
        `<a class="${active(n[3])}" href="${n[0]}"><span>${n[1]}</span>${n[2]}</a>`,
    )
    .join("");
  $("#mobileNav").innerHTML = nav
    .filter((_, i) => [0, 1, 2, 4, 10].includes(i))
    .map(
      (n) =>
        `<a class="${active(n[3])}" href="${n[0]}"><span>${n[1]}</span>${n[2]}</a>`,
    )
    .join("");
  $("#pageName").textContent =
    view === "dashboard"
      ? "Bugünün özeti"
      : view === "settings"
        ? "Ayarlar"
        : modules[view]?.title || "EbruLife";
  $("#themeToggle").onclick = () => {
    state.settings.theme =
      document.documentElement.dataset.theme === "dark" ? "light" : "dark";
    save(state);
    applyTheme();
  };
  markRecent();
}
function markRecent() {
  if (["dashboard", "settings"].includes(view)) return;
  state.recent = [view, ...state.recent.filter((x) => x !== view)].slice(0, 5);
  save(state);
}
function toast(msg) {
  const t = $("#toast");
  t.textContent = msg;
  t.classList.add("show");
  setTimeout(() => t.classList.remove("show"), 2300);
}
function empty(label) {
  return `<div class="empty"><b>Henüz kayıt yok</b>${esc(label)} ekleyerek başlayın.</div>`;
}
function recordTitle(r) {
  return r.title || r.description || "Kayıt";
}
function meta(r) {
  if (view === "tasks")
    return `${r.category || "Genel"} · ${r.date || "Tarihsiz"} ${r.time || ""}`;
  if (view === "goals")
    return `${r.type || ""} · ${days(r.target) ?? "—"} gün kaldı`;
  if (view === "habits")
    return `${r.category || "Özel"} · Hedef ${r.target || 7} gün`;
  if (view === "subscriptions")
    return `${money(r.amount, r.currency)} · ${r.period || ""} · ${r.nextDate || ""}`;
  if (view === "events")
    return `${r.type || ""} · ${r.date || ""} · ${eventDays(r)} gün`;
  if (view === "warranties")
    return `${r.brand || ""} ${r.model || ""} · ${days(r.expiry) ?? "—"} gün`;
  if (view === "vehicles")
    return `${r.plate || ""} · ${Number(r.km || 0).toLocaleString("tr-TR")} km`;
  if (view === "notes") return `${r.category || "Genel"} · ${r.updated || ""}`;
  if (view === "budget") return `${r.type} · ${r.category} · ${r.date}`;
  return "";
}
function eventDays(r) {
  if (!r.date) return 0;
  let d = new Date(`${r.date}T12:00:00`);
  if (r.annual) {
    const n = new Date();
    d.setFullYear(n.getFullYear());
    if (d < n) d.setFullYear(n.getFullYear() + 1);
  }
  return Math.max(0, days(d.toISOString().slice(0, 10)));
}
function streak(history = []) {
  const set = new Set(history),
    cursor = new Date(),
    runs = [];
  let run = 0;
  for (let i = 0; i < 370; i++) {
    const k = cursor.toISOString().slice(0, 10);
    if (set.has(k)) run++;
    else if (run) {
      runs.push(run);
      run = 0;
    }
    cursor.setDate(cursor.getDate() - 1);
  }
  if (run) runs.push(run);
  return {
    current: set.has(today()) ? runs[0] || 0 : 0,
    longest: Math.max(0, ...runs),
  };
}
function stats() {
  const arr = state[view] || [];
  if (view === "tasks")
    return [
      ["Toplam", arr.length],
      ["Bugün", arr.filter((x) => x.date === today() && !x.done).length],
      ["Tamamlanan", arr.filter((x) => x.done).length],
    ];
  if (view === "goals")
    return [
      ["Aktif", arr.filter((x) => Number(x.progress) < 100).length],
      ["Tamamlanan", arr.filter((x) => Number(x.progress) >= 100).length],
      [
        "Ortalama",
        `${arr.length ? Math.round(arr.reduce((a, b) => a + Number(b.progress || 0), 0) / arr.length) : 0}%`,
      ],
    ];
  if (view === "habits") {
    const ds = today();
    return [
      ["Alışkanlık", arr.length],
      ["Bugün", arr.filter((x) => (x.history || []).includes(ds)).length],
      [
        "Bu hafta",
        arr.reduce(
          (a, x) => a + (x.history || []).filter((d) => days(d) >= -6).length,
          0,
        ),
      ],
    ];
  }
  if (view === "subscriptions") {
    const active = arr.filter((x) => !x.cancelled);
    return [
      ["Aktif", active.length],
      [
        "Aylık",
        money(
          active.reduce(
            (a, x) =>
              a + Number(x.amount || 0) * (x.period === "Yıllık" ? 1 / 12 : 1),
            0,
          ),
        ),
      ],
      [
        "Yıllık",
        money(
          active.reduce(
            (a, x) =>
              a + Number(x.amount || 0) * (x.period === "Yıllık" ? 1 : 12),
            0,
          ),
        ),
      ],
    ];
  }
  if (view === "budget") {
    const month = today().slice(0, 7),
      cur = arr.filter((x) => (x.date || "").startsWith(month)),
      inc = cur
        .filter((x) => x.type === "Gelir")
        .reduce((a, x) => a + Number(x.amount), 0),
      out = cur
        .filter((x) => x.type === "Gider")
        .reduce((a, x) => a + Number(x.amount), 0);
    return [
      ["Aylık gelir", money(inc)],
      ["Aylık gider", money(out)],
      ["Kalan", money(inc - out)],
    ];
  }
  return [
    ["Toplam", arr.length],
    [
      "Yaklaşan",
      arr.filter((x) => {
        const d = days(x.expiry || x.inspection || x.nextDate || x.date);
        return d !== null && d >= 0 && d <= 30;
      }).length,
    ],
    [
      "Bu ay",
      arr.filter((x) =>
        (x.date || x.updated || "").startsWith(today().slice(0, 7)),
      ).length,
    ],
  ];
}
function renderModule() {
  const m = modules[view],
    arr = state[view];
  document.title = `${m.title} — EbruLife`;
  $("#content").classList.add("has-ad-rail");
  $("#content").innerHTML =
    `<div class="heading"><div><h1>${m.icon} ${m.title}</h1><p>${m.desc}</p></div><button class="btn" id="addBtn">+ ${m.add}</button></div><div class="grid g3" id="stats"></div>${view === "budget" ? budgetChart(arr) : ""}<div class="toolbar"><input id="search" type="search" placeholder="Kayıtlarda ara…" aria-label="Kayıtlarda ara"><select id="filter" aria-label="Kayıt filtresi"><option value="all">Tümü</option>${view === "tasks" ? '<option value="today">Bugün</option><option value="upcoming">Yaklaşan</option><option value="done">Tamamlanan</option>' : ""}${view === "goals" ? '<option value="active">Aktif</option><option value="done">Tamamlanan</option>' : ""}</select></div><div class="list" id="records"></div>${cta(view)}<section class="card content-copy"><h2>${m.title} nasıl verimli kullanılır?</h2><p>${m.copy}</p><p>En iyi sonuç için kayıtlarınızı düzenli güncelleyin, gereksiz öğeleri silin ve haftalık kısa bir gözden geçirme rutini oluşturun. Uygulama karar vermenizin yerini almaz; bilgileri görünür kılarak kendi planınızı daha bilinçli yönetmenize yardımcı olur. Tarih, tutar ve açıklamaların doğruluğunu kaydetmeden önce kontrol edin. Ortak kullanılan cihazlarda kişisel içerik bırakmayın. Tarayıcı depolaması eşitleme hizmeti değildir; cihaz değiştirmeden veya tarayıcı verilerini temizlemeden önce Ayarlar sayfasından JSON yedeği indirin. Yedek dosyası tüm modüllerdeki kişisel kayıtları içerebileceği için onu güvenli bir konumda saklayın.</p><h2>Sık sorulan sorular</h2><h3>Verilerim nerede saklanıyor?</h3><p>Kayıtlar bu cihazdaki tarayıcı depolamasında tutulur, EbruTech sunucularına gönderilmez. Tarayıcı verilerini temizlerseniz kayıtlar kaybolabilir.</p><h3>Ücretsiz kullanabilir miyim?</h3><p>Evet. EbruLife’ın ilk sürümü ücretsizdir ve giriş zorunluluğu yoktur. Ayarlar bölümünden düzenli JSON yedeği almanız önerilir.</p><h3>Telefon ve bilgisayar arasında otomatik eşitlenir mi?</h3><p>İlk sürümde hesap ve bulut eşitleme bulunmaz. Veriyi taşımak için bir cihazdan JSON yedeği alıp diğer cihazda içe aktarabilirsiniz.</p></section>${AdComponent.FooterAd()}${AdComponent.SidebarAd()}`;
  $("#stats").innerHTML = stats()
    .map(
      (x) =>
        `<div class="card metric"><span>${x[0]}</span><strong>${x[1]}</strong></div>`,
    )
    .join("");
  $("#addBtn").onclick = () => openForm();
  $("#search").oninput = (e) => {
    query = e.target.value.toLocaleLowerCase("tr-TR");
    renderRecords();
  };
  $("#filter").onchange = (e) => {
    filter = e.target.value;
    renderRecords();
  };
  renderRecords();
  initAds();
}
function budgetChart(arr) {
  const month = today().slice(0, 7),
    expenses = arr.filter(
      (x) => x.type === "Gider" && (x.date || "").startsWith(month),
    ),
    groups = {};
  expenses.forEach(
    (x) =>
      (groups[x.category] = (groups[x.category] || 0) + Number(x.amount || 0)),
  );
  const max = Math.max(1, ...Object.values(groups));
  return `<section class="card" style="margin-top:16px"><h2>Bu ay gider dağılımı</h2>${
    Object.keys(groups).length
      ? Object.entries(groups)
          .sort((a, b) => b[1] - a[1])
          .map(
            ([k, v]) =>
              `<div style="margin-top:12px"><div class="meta" style="display:flex;justify-content:space-between"><span>${esc(k)}</span><b>${money(v)}</b></div><div class="budget-bar"><i style="width:${Math.round((v / max) * 100)}%"></i></div></div>`,
          )
          .join("")
      : '<p class="empty">Grafik için bu aya gider ekleyin.</p>'
  }</section>`;
}
function filtered() {
  let a = [...(state[view] || [])];
  if (query)
    a = a.filter((r) =>
      JSON.stringify(r).toLocaleLowerCase("tr-TR").includes(query),
    );
  if (view === "tasks") {
    if (filter === "today") a = a.filter((x) => x.date === today() && !x.done);
    if (filter === "upcoming") a = a.filter((x) => x.date > today() && !x.done);
    if (filter === "done") a = a.filter((x) => x.done);
  }
  if (view === "goals") {
    if (filter === "active") a = a.filter((x) => Number(x.progress) < 100);
    if (filter === "done") a = a.filter((x) => Number(x.progress) >= 100);
  }
  if (view === "events") a.sort((a, b) => eventDays(a) - eventDays(b));
  if (view === "notes") a.sort((a, b) => Number(b.pinned) - Number(a.pinned));
  return a;
}
function renderRecords() {
  const root = $("#records"),
    arr = filtered();
  if (!arr.length) {
    root.innerHTML = empty(modules[view].add);
    return;
  }
  const records = arr.map((r) => {
    let extra = "";
    if (view === "goals")
      extra = `<div class="progress"><i style="width:${Math.min(100, Math.max(0, Number(r.progress) || 0))}%"></i></div>`;
    if (view === "habits") {
      const s = streak(r.history);
      extra = `${habitWeek(r)}<div class="meta" style="margin-top:7px">Devam serisi: ${s.current} gün · En uzun: ${s.longest} gün · Başarı: %${Math.round(((r.history || []).filter((d) => days(d) >= -29 && days(d) <= 0).length / 30) * 100)}</div>`;
    }
    if (view === "notes")
      extra = `<p>${esc((r.content || "").slice(0, 180))}</p>`;
    return `<article class="item" data-id="${r.id}"><div class="item-main"><h3>${r.pinned ? "📌 " : ""}${esc(recordTitle(r))}</h3><div class="meta">${esc(meta(r))}</div>${extra}</div><div class="actions">${view === "tasks" ? `<button class="btn small secondary" data-act="toggle">${r.done ? "Geri al" : "Tamamla"}</button>` : ""}${view === "habits" ? '<button class="btn small secondary" data-act="habit">Bugün</button>' : ""}${view === "subscriptions" ? `<button class="btn small secondary" data-act="cancel">${r.cancelled ? "Aktifleştir" : "İptal"}</button>` : ""}<button class="btn small secondary" data-act="edit">Düzenle</button><button class="btn small danger" data-act="delete">Sil</button></div></article>`;
  });
  root.innerHTML = injectInlineAds(records);
  root
    .querySelectorAll("[data-act]")
    .forEach(
      (b) =>
        (b.onclick = () =>
          action(b.closest("[data-id]").dataset.id, b.dataset.act)),
    );
  initAds();
}
function habitWeek(r) {
  const hist = r.history || [],
    cells = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const k = d.toISOString().slice(0, 10);
    cells.push(
      `<span class="habit-day ${hist.includes(k) ? "done" : ""}">${d.toLocaleDateString("tr-TR", { weekday: "narrow" })}</span>`,
    );
  }
  return `<div class="habit-week">${cells.join("")}</div>`;
}
function action(id, act) {
  const arr = state[view],
    r = arr.find((x) => x.id === id);
  if (!r) return;
  if (act === "delete") {
    if (!confirm("Bu kaydı silmek istediğinize emin misiniz?")) return;
    state[view] = arr.filter((x) => x.id !== id);
  } else if (act === "edit") {
    openForm(r);
    return;
  } else if (act === "toggle") r.done = !r.done;
  else if (act === "cancel") r.cancelled = !r.cancelled;
  else if (act === "habit") {
    r.history = r.history || [];
    r.history = r.history.includes(today())
      ? r.history.filter((x) => x !== today())
      : [...r.history, today()];
  }
  save(state);
  renderModule();
  toast("Değişiklik kaydedildi.");
}
function openForm(record = null) {
  editing = record?.id || null;
  const m = modules[view],
    form = $("#recordForm"),
    modal = $("#recordModal");
  $("#modalTitle").textContent = record ? `${m.title} kaydını düzenle` : m.add;
  form.innerHTML =
    m.fields.map((f) => fieldHtml(f, record?.[f[0]])).join("") +
    '<div class="form-actions"><button type="button" class="btn secondary" id="cancelForm">Vazgeç</button><button class="btn">Kaydet</button></div>';
  $("#cancelForm").onclick = () => modal.close();
  form.onsubmit = submitForm;
  setAdsSuspended(true);
  modal.showModal();
}
function fieldHtml(f, val) {
  const [name, label, type, required, opts] = f,
    req = required ? "required" : "";
  if (type === "textarea")
    return `<div class="field full"><label for="f-${name}">${label}</label><textarea id="f-${name}" name="${name}" ${req} maxlength="5000">${esc(val)}</textarea></div>`;
  if (type === "select")
    return `<div class="field"><label for="f-${name}">${label}</label><select id="f-${name}" name="${name}" ${req}>${opts
      .split("|")
      .map((o) => `<option ${val === o ? "selected" : ""}>${o}</option>`)
      .join("")}</select></div>`;
  if (type === "checkbox")
    return `<div class="field"><label class="check"><input type="checkbox" name="${name}" ${val ? "checked" : ""}> ${label}</label></div>`;
  const limits = type === "number" ? 'min="0" step="0.01"' : "";
  return `<div class="field"><label for="f-${name}">${label}</label><input id="f-${name}" name="${name}" type="${type}" value="${esc(val)}" ${req} ${limits} maxlength="250"></div>`;
}
function submitForm(e) {
  e.preventDefault();
  const fd = new FormData(e.target),
    m = modules[view],
    obj = { id: editing || uid(), created: new Date().toISOString() };
  for (const f of m.fields)
    obj[f[0]] =
      f[2] === "checkbox"
        ? fd.has(f[0])
        : safe(fd.get(f[0]), f[2] === "textarea" ? 5000 : 250);
  if (view === "goals") {
    obj.progress = Math.min(100, Number(obj.progress));
    if (obj.start && obj.target && obj.target < obj.start) {
      alert("Hedef tarihi başlangıç tarihinden önce olamaz.");
      return;
    }
  }
  if (
    view === "warranties" &&
    obj.purchaseDate &&
    obj.expiry < obj.purchaseDate
  ) {
    alert("Garanti bitişi satın alma tarihinden önce olamaz.");
    return;
  }
  if (view === "notes") obj.updated = today();
  if (view === "habits")
    obj.history = state[view].find((x) => x.id === editing)?.history || [];
  const idx = state[view].findIndex((x) => x.id === editing);
  if (idx >= 0)
    ((obj.created = state[view][idx].created), (state[view][idx] = obj));
  else state[view].unshift(obj);
  save(state);
  $("#recordModal").close();
  renderModule();
  toast("Kayıt güvenle cihazınıza kaydedildi.");
}
function cta(v) {
  const map = {
      vehicles: [
        "Profesyonel filo yönetimi mi gerekiyor?",
        "İşletmenize özel filo takip sistemi için EbruTech çözümlerini inceleyin.",
        "../hizmetler.html",
      ],
      budget: [
        "Daha kapsamlı finans ekranı mı arıyorsunuz?",
        "İşletmenize özel raporlama ve takip sistemi geliştirebiliriz.",
        "../hizmetler.html",
      ],
      warranties: [
        "İşletmenize özel envanter sistemi",
        "Ürün, garanti ve belge süreçlerinize özel takip paneli yaptırın.",
        "../hizmetler.html",
      ],
    },
    x = map[v] || [
      "İhtiyacınıza özel takip sistemi",
      "EbruTech, işletmeniz için web ve mobil takip uygulamaları geliştirir.",
      "../hizmetler.html",
    ];
  return `<aside class="card cta" style="margin-top:24px"><h2>${x[0]}</h2><p>${x[1]}</p><a class="btn secondary" href="${x[2]}">EbruTech hizmetlerini incele →</a></aside>`;
}
function dashboard() {
  const name = state.settings.name ? `, ${esc(state.settings.name)}` : "",
    tasks = state.tasks.filter((x) => !x.done && x.date === today()),
    events = [...state.events]
      .sort((a, b) => eventDays(a) - eventDays(b))
      .slice(0, 3),
    subs = state.subscriptions
      .filter((x) => !x.cancelled && days(x.nextDate) >= 0)
      .sort((a, b) => days(a.nextDate) - days(b.nextDate))
      .slice(0, 3),
    goals = state.goals.filter((x) => Number(x.progress) < 100).slice(0, 3),
    quotes = [
      "Küçük adımlar, büyük değişimlerin başlangıcıdır.",
      "Bugünün planı yarının rahatlığıdır.",
      "Mükemmel olmak yerine devam etmeyi seç.",
    ],
    q = quotes[new Date().getDate() % quotes.length];
  $("#content").classList.add("has-ad-rail");
  $("#content").innerHTML =
    `<div class="heading"><div><h1>Merhaba${name} 👋</h1><p>${new Date().toLocaleDateString("tr-TR", { weekday: "long", day: "numeric", month: "long" })} · Hayatını tek yerden düzenle.</p></div><button class="btn" id="quickTask">+ Hızlı görev</button></div><div class="grid g4"><div class="card metric"><span>Bugünkü görev</span><strong>${tasks.length}</strong></div><div class="card metric"><span>Aktif hedef</span><strong>${goals.length}</strong></div><div class="card metric"><span>Yaklaşan özel gün</span><strong>${events.length}</strong></div><div class="card metric"><span>Aktif abonelik</span><strong>${state.subscriptions.filter((x) => !x.cancelled).length}</strong></div></div>${AdComponent.TopBanner()}<div class="grid g2" style="margin-top:16px"><section class="card"><h2>Bugünkü görevler</h2>${mini(tasks, "Bugün için görev yok.")}</section><section class="card"><h2>Yaklaşan özel günler</h2>${mini(events, "Yaklaşan özel gün yok.", (r) => `${eventDays(r)} gün`)}</section><section class="card"><h2>Aktif hedefler</h2>${mini(goals, "Aktif hedef yok.", (r) => `%${r.progress || 0}`)}</section><section class="card"><h2>Yaklaşan ödemeler</h2>${mini(subs, "Yaklaşan ödeme yok.", (r) => money(r.amount, r.currency))}</section></div><section class="card cta"><h2>“${q}”</h2><p>Verileriniz bu cihazda kalır. Kayıpları önlemek için Ayarlar bölümünden düzenli yedek alın.</p><div class="actions"><a class="btn secondary" href="ayarlar.html">Yedekleme ve ayarlar</a><a class="btn secondary" href="../hizmetler.html">Özel sistem yaptır</a></div></section>${AdComponent.FooterAd()}${AdComponent.SidebarAd()}`;
  $("#quickTask").onclick = () => (location.href = "gorevler.html");
  initAds();
}
function mini(arr, msg, side = () => "") {
  return arr.length
    ? `<div class="list">${arr.map((r) => `<div class="item"><div class="item-main"><h3>${esc(recordTitle(r))}</h3><div class="meta">${esc(metaForAny(r))}</div></div><span class="pill">${esc(side(r))}</span></div>`).join("")}</div>`
    : `<p class="empty">${msg}</p>`;
}
function metaForAny(r) {
  return r.date || r.target || r.nextDate || r.type || "";
}
function settings() {
  document.title = "Ayarlar ve Veri Yönetimi — EbruLife";
  $("#content").classList.add("has-ad-rail");
  $("#content").innerHTML =
    `<div class="heading"><div><h1>⚙ Ayarlar</h1><p>Görünüm, tercihler ve cihazınızdaki verileri yönetin.</p></div></div><div class="grid g2"><form id="settingsForm" class="card"><h2>Kişisel tercihler</h2><div class="form-grid"><div class="field full"><label for="name">Adınız</label><input id="name" name="name" maxlength="60" value="${esc(state.settings.name)}"></div><div class="field"><label for="theme">Tema</label><select id="theme" name="theme"><option value="system">Sistem</option><option value="light">Açık</option><option value="dark">Koyu</option></select></div><div class="field"><label for="currency">Para birimi</label><select id="currency" name="currency"><option>TRY</option><option>USD</option><option>EUR</option></select></div><div class="field"><label for="weekStart">Hafta başlangıcı</label><select id="weekStart" name="weekStart"><option value="monday">Pazartesi</option><option value="sunday">Pazar</option></select></div><div class="field"><label class="check"><input type="checkbox" name="notifications" ${state.settings.notifications ? "checked" : ""}> Bildirim tercihi (arayüz)</label></div></div><div class="form-actions"><button class="btn">Ayarları Kaydet</button></div></form><section class="card"><h2>Veri yönetimi</h2><div class="notice">Tüm kayıtlar bu tarayıcıda saklanır. Tarayıcı verileri temizlenirse kayıtlar kaybolabilir. Düzenli JSON yedeği alın.</div><div class="actions" style="margin-top:18px"><button class="btn secondary" id="exportBtn">JSON Dışa Aktar</button><label class="btn secondary" for="importFile">JSON İçe Aktar</label><input id="importFile" type="file" accept=".json,application/json" hidden><button class="btn danger" id="resetBtn">Tüm Verileri Temizle</button></div></section></div><section class="card content-copy"><h2>Gizlilik ve yedekleme</h2><p>EbruLife ilk sürümde hesap açmadan çalışır. Görevleriniz, notlarınız, bütçe kayıtlarınız ve diğer kişisel verileriniz EbruTech sunucularına gönderilmez. Bu yaklaşım gizliliği artırırken yedekleme sorumluluğunu size bırakır. Tarayıcı geçmişini veya site verilerini temizlemek, gizli mod kullanmak ya da cihaz değiştirmek kayıtların kaybolmasına neden olabilir.</p><p>JSON dışa aktarma düğmesi tüm EbruLife verilerinin okunabilir bir yedeğini oluşturur. Bu dosya kişisel bilgi içerebilir; güvenli bir klasörde saklayın ve herkese açık alanlarda paylaşmayın. İçe aktarma mevcut verilerin yerini alır ve işlem öncesinde onay ister.</p></section>`;
  $("#content").insertAdjacentHTML(
    "beforeend",
    `${AdComponent.FooterAd()}${AdComponent.SidebarAd()}`,
  );
  initAds();
  $("#theme").value = state.settings.theme;
  $("#currency").value = state.settings.currency;
  $("#weekStart").value = state.settings.weekStart;
  $("#settingsForm").onsubmit = (e) => {
    e.preventDefault();
    const f = new FormData(e.target);
    state.settings = {
      ...state.settings,
      name: safe(f.get("name"), 60),
      theme: f.get("theme"),
      currency: f.get("currency"),
      weekStart: f.get("weekStart"),
      notifications: f.has("notifications"),
    };
    save(state);
    applyTheme();
    toast("Ayarlar kaydedildi.");
  };
  $("#exportBtn").onclick = () => exportData(state);
  $("#importFile").onchange = async (e) => {
    if (
      !confirm(
        "İçe aktarma mevcut verilerin üzerine yazacak. Devam edilsin mi?",
      )
    )
      return;
    e.target.disabled = true;
    try {
      state = await importData(e.target.files[0]);
      save(state);
      applyTheme();
      toast("Yedek içe aktarıldı.");
      setTimeout(() => location.reload(), 700);
    } catch (err) {
      alert(err.message);
    } finally {
      e.target.disabled = false;
    }
  };
  $("#resetBtn").onclick = () => {
    if (
      confirm("Tüm EbruLife verileri kalıcı olarak silinecek. Emin misiniz?")
    ) {
      reset();
      location.reload();
    }
  };
}
function injectSchema() {
  const page =
      view === "dashboard"
        ? "Kontrol Paneli"
        : view === "settings"
          ? "Ayarlar"
          : modules[view]?.title || "EbruLife",
    s = document.createElement("script");
  s.type = "application/ld+json";
  s.textContent = JSON.stringify({
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        name: "EbruTech Systems",
        url: "https://ebrutechsystems.com",
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          {
            "@type": "ListItem",
            position: 1,
            name: "EbruLife",
            item: "https://life.ebrutechsystems.com/",
          },
          { "@type": "ListItem", position: 2, name: page, item: location.href },
        ],
      },
      {
        "@type": "FAQPage",
        mainEntity: [
          {
            "@type": "Question",
            name: "EbruLife ücretsiz mi?",
            acceptedAnswer: {
              "@type": "Answer",
              text: "Evet, EbruLife ilk sürümde ücretsizdir.",
            },
          },
          {
            "@type": "Question",
            name: "Veriler nerede saklanır?",
            acceptedAnswer: {
              "@type": "Answer",
              text: "Veriler kullanıcının tarayıcısında saklanır.",
            },
          },
        ],
      },
    ],
  });
  document.head.appendChild(s);
}
applyTheme();
shell();
injectSchema();
if (view === "dashboard") dashboard();
else if (view === "settings") settings();
else renderModule();
const recordModal = $("#recordModal");
recordModal?.addEventListener("close", () => setAdsSuspended(false));
recordModal?.addEventListener("cancel", () => setAdsSuspended(false));
recordModal?.addEventListener("click", (e) => {
  if (e.target === recordModal) recordModal.close();
});
if ("serviceWorker" in navigator)
  navigator.serviceWorker.register("./service-worker.js").catch(() => {});
