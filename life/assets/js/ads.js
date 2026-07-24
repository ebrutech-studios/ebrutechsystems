const CLIENT = "ca-pub-1633221257137505";
// AdSense panelinde oluşturulan birim kimlikleri yalnızca burada tanımlanır.
const SLOTS = {
  top: "",
  inline: "",
  sidebar: "",
  footer: "",
};
const TYPES = {
  top: { className: "ad-top", format: "auto", label: "İçerik sonrası reklam" },
  inline: {
    className: "ad-inline",
    format: "fluid",
    label: "Liste içi reklam",
  },
  sidebar: { className: "ad-sidebar", format: "auto", label: "Kenar reklamı" },
  footer: {
    className: "ad-footer",
    format: "auto",
    label: "Sayfa sonu reklamı",
  },
};
let observer;
let scriptPromise;

const slotFor = (type) => SLOTS[type]?.trim() || "";

function shell(type) {
  const config = TYPES[type];
  return `<aside class="ad-shell ${config.className}" data-ad-type="${type}" data-ad-state="waiting" aria-label="${config.label}" role="complementary"><span class="ad-label" aria-hidden="true">Reklam</span><div class="ad-skeleton" aria-hidden="true"></div></aside>`;
}

function loadScript() {
  if (scriptPromise) return scriptPromise;
  scriptPromise = new Promise((resolve, reject) => {
    const existing = document.querySelector("script[data-ebrulife-adsense]");
    if (existing) {
      if (existing.dataset.loaded === "true") resolve();
      else {
        existing.addEventListener("load", resolve, { once: true });
        existing.addEventListener("error", reject, { once: true });
      }
      return;
    }
    if (!document.querySelector("link[data-ebrulife-ad-preconnect]")) {
      const preconnect = document.createElement("link");
      preconnect.rel = "preconnect";
      preconnect.href = "https://pagead2.googlesyndication.com";
      preconnect.crossOrigin = "anonymous";
      preconnect.dataset.ebrulifeAdPreconnect = "true";
      document.head.appendChild(preconnect);
    }
    const script = document.createElement("script");
    script.async = true;
    script.defer = true;
    script.crossOrigin = "anonymous";
    script.dataset.ebrulifeAdsense = "true";
    script.src = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${CLIENT}`;
    script.onload = () => {
      script.dataset.loaded = "true";
      resolve();
    };
    script.onerror = reject;
    document.head.appendChild(script);
  });
  return scriptPromise;
}

async function requestAd(container) {
  if (
    container.dataset.adState !== "waiting" ||
    document.documentElement.classList.contains("ads-suspended")
  )
    return;
  const type = container.dataset.adType,
    slot = slotFor(type);
  if (!/^\d+$/.test(slot)) {
    container.dataset.adState = "unconfigured";
    return;
  }
  container.dataset.adState = "loading";
  try {
    await loadScript();
    if (document.documentElement.classList.contains("ads-suspended")) {
      container.dataset.adState = "waiting";
      return;
    }
    const unit = document.createElement("ins");
    unit.className = "adsbygoogle";
    unit.dataset.adClient = CLIENT;
    unit.dataset.adSlot = slot;
    unit.dataset.adFormat = TYPES[type].format;
    unit.dataset.fullWidthResponsive = "true";
    container.appendChild(unit);
    (window.adsbygoogle = window.adsbygoogle || []).push({});
    container.dataset.adState = "loaded";
  } catch (error) {
    container.dataset.adState = "blocked";
    showAdBlockNotice();
    console.info("EbruLife reklamı yüklenemedi.", error);
  }
}

function showAdBlockNotice() {
  if (document.querySelector("#adSupportNotice")) return;
  const notice = document.createElement("aside");
  notice.id = "adSupportNotice";
  notice.className = "ad-support-notice";
  notice.setAttribute("role", "status");
  notice.innerHTML =
    '<strong>Bu proje ücretsizdir.</strong><span>Reklamlar geliştirmeyi destekler.</span><button type="button" aria-label="Bilgiyi kapat">×</button>';
  notice.querySelector("button").onclick = () => notice.remove();
  document.body.appendChild(notice);
}

export const AdComponent = {
  TopBanner: () => shell("top"),
  InlineAd: () => shell("inline"),
  SidebarAd: () => `<div class="desktop-ad-rail">${shell("sidebar")}</div>`,
  FooterAd: () => shell("footer"),
};

export function injectInlineAds(records, every = 6) {
  return records
    .map(
      (record, index) =>
        record +
        ((index + 1) % every === 0 && index < records.length - 1
          ? AdComponent.InlineAd()
          : ""),
    )
    .join("");
}

export function setAdsSuspended(suspended) {
  document.documentElement.classList.toggle("ads-suspended", suspended);
  document
    .querySelectorAll(".ad-shell")
    .forEach((ad) =>
      ad.setAttribute("aria-hidden", suspended ? "true" : "false"),
    );
  if (!suspended)
    document
      .querySelectorAll('.ad-shell[data-ad-state="waiting"]')
      .forEach((ad) => observer?.observe(ad));
}

export function initAds() {
  observer?.disconnect();
  observer =
    "IntersectionObserver" in window
      ? new IntersectionObserver(
          (entries) =>
            entries.forEach((entry) => {
              if (entry.isIntersecting) {
                observer.unobserve(entry.target);
                requestAd(entry.target);
              }
            }),
          { rootMargin: "300px 0px" },
        )
      : null;
  document
    .querySelectorAll(".ad-shell")
    .forEach((ad) => (observer ? observer.observe(ad) : requestAd(ad)));
}
