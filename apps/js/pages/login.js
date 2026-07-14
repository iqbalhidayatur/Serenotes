// ══════════════════════════════════════════════════════════
// login.js — halaman login Serenotes
// ══════════════════════════════════════════════════════════
import { pullOnLogin } from "../services/syncService.js";

import {
    initAuth,
    requestToken,
    getUser,
    isLoggedIn,
    handleLoginCallback
}
from "../services/authService.js";

const btnLogin   = document.getElementById("btnGoogleLogin");
const errorBox   = document.getElementById("loginError");
const errorMsg   = document.getElementById("loginErrorMsg");

await initAuth();

async function initializeLogin() {
    if (isLoggedIn()) {

    try {
            await pullOnLogin();
        } catch (e) {
            console.error(e);
        }

        window.location.replace("dashboard.html");
        return;
    }

    await initAuth();

    try {
        const handled = await handleLoginCallback();

        if (handled) {
            await pullOnLogin();
            window.location.replace("dashboard.html");
            return;
        }
    } catch (err) {
        console.error(err);
    }
}

initializeLogin();

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
        await requestToken();

        const user = getUser();

        if (!user) {
            throw new Error("User tidak ditemukan.");
        }

        // Simpan nama user supaya kompatibel dengan sistem lama
        localStorage.setItem("serenotes_user", user.name);

        // 3. Pull data dari Drive → merge ke localStorage
        //    (tidak blocking — kalau gagal tetap lanjut ke dashboard)
        await pullOnLogin();

        // 4. Redirect ke dashboard

        startWatcher(2000);

        window.location.replace("dashboard.html");

    } finally {
        setLoading(false);
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