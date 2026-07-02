const form = document.getElementById("loginForm");
const msg = document.getElementById("loginMsg");

function showError(text){
  msg.textContent = text;
  msg.hidden = false;
}

window.FiloAuth.onReady((user, role) => {
  if(user && role){
    location.replace(role === "admin" ? "admin.html" : "surucu.html");
  }
});

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  msg.hidden = true;
  const email = document.getElementById("email").value.trim();
  const pass = document.getElementById("pass").value;
  const btn = form.querySelector("button");
  btn.disabled = true;
  try{
    await window.FiloAuth.loginEmail(email, pass);
    // onAuthStateChanged tetiklenecek, onReady callback yönlendirecek
  }catch(err){
    const map = {
      "auth/invalid-credential": "E-posta veya şifre hatalı.",
      "auth/user-not-found": "E-posta veya şifre hatalı.",
      "auth/wrong-password": "E-posta veya şifre hatalı.",
      "auth/too-many-requests": "Çok fazla deneme yapıldı, bir süre sonra tekrar deneyin."
    };
    showError(map[err.code] || "Giriş yapılamadı. Tekrar deneyin.");
    btn.disabled = false;
  }
});

document.addEventListener("filo-auth", (e) => {
  if(e.detail.user && e.detail.role){
    location.replace(e.detail.role === "admin" ? "admin.html" : "surucu.html");
  } else if(e.detail.user && !e.detail.role){
    showError("Bu hesabın filo takip erişimi yok.");
    window.FiloAuth.logout();
  }
});
