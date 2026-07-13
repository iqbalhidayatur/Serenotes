// ══════════════════════════════════════════════════════════
// login.js — halaman login Serenotes
// ══════════════════════════════════════════════════════════

import { initAuth, requestToken, fetchUserInfo, isLoggedIn } from "../services/authService.js";
import { pullOnLogin } from "../services/syncService.js";

const btnLogin   = document.getElementById("btnGoogleLogin");
const errorBox   = document.getElementById("loginError");
const errorMsg   = document.getElementById("loginErrorMsg");

// Kalau sudah login, langsung ke dashboard
if (isLoggedIn()) {
    window.location.replace("dashboard.html");
}

// Init Google Identity Services
initAuth().catch(err => {
    showError(err.message);
});

// Klik tombol login
btnLogin.addEventListener("click", async () => {
    hideError();
    setLoading(true);

    try {
        // 1. Minta access token (tampil popup Google)
        const accessToken = await requestToken();

        // 2. Ambil info user (nama, email, foto)
        const user = await fetchUserInfo(accessToken);

        // Simpan nama user supaya kompatibel dengan sistem lama
        localStorage.setItem("serenotes_user", user.name);

        // 3. Pull data dari Drive → merge ke localStorage
        //    (tidak blocking — kalau gagal tetap lanjut ke dashboard)
        await pullOnLogin();

        // 4. Redirect ke dashboard
        window.location.replace("dashboard.html");

    } catch (err) {
        console.error("Login error:", err);
        setLoading(false);

        if (err.message?.includes("popup_closed")) {
            showError("Login dibatalkan. Silakan coba lagi.");
        } else if (err.message?.includes("access_denied")) {
            showError("Akses ditolak. Pastikan kamu mengizinkan akses Google Drive.");
        } else {
            showError("Gagal login. Periksa koneksi internet dan coba lagi.");
        }
    }
});

function setLoading(val) {
    btnLogin.classList.toggle("loading", val);
    const textEl = btnLogin.querySelector(".btn-google-text");
    textEl.textContent = val ? "Masuk" : "Masuk dengan Google";
}

function showError(msg) {
    errorMsg.textContent = msg;
    errorBox.classList.add("show");
}

function hideError() {
    errorBox.classList.remove("show");
}