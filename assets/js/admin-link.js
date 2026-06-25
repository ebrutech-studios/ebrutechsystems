const ADMIN_EMAIL = "ebrutechstudios@gmail.com";

window.ETSAuth.onReady(async user => {
  const link = document.getElementById("adminPanelLink");
  if (!link || !user) return;
  try {
    const token = await user.getIdTokenResult();
    if (token.claims.email_verified && String(token.claims.email || "").toLowerCase() === ADMIN_EMAIL) link.classList.remove("hidden");
  } catch (_) {
    link.classList.add("hidden");
  }
});
