// ══════════════════════════════════════════════════════════
// login.js — halaman login Serenotes
// ══════════════════════════════════════════════════════════

// BUG FIX #6: startWatcher dipanggil di bawah tapi tidak pernah diimport.
import { pullOnLogin, startWatcher } from "../services/syncService.js";

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

// BUG FIX #7: initAuth() dipanggil 3 kali (di sini, di dalam initializeLogin(),
// dan lagi di bawah). Cukup satu kali di awal, sisanya dihapus.
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

    // Tangani redirect callback OAuth (mode web)
    try {
        const handled = await handleLoginCallback();

        if (handled) {
            await pullOnLogin();
            window.location.replace("dashboard.html");
            return;
        }
    } catch (err) {
        console.error(err);
        showError(err.message);
    }
}

// Jalankan init; kalau sudah login akan redirect ke dashboard
initializeLogin();

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

        // 2. Pull data dari Drive → merge ke localStorage
        await pullOnLogin();

        // 3. Mulai background watcher sebelum redirect
        startWatcher(30000);

        // 4. Redirect ke dashboard
        window.location.replace("dashboard.html");

    } catch (err) {
        showError(err.message);
    } finally {
        setLoading(false);
    }
});

function setLoading(val) {
    btnLogin.classList.toggle("loading", val);
    const textEl = btnLogin.querySelector(".btn-google-text");
    textEl.textContent = val ? "Masuk..." : "Masuk dengan Google";
}

function showError(msg) {
    errorMsg.textContent = msg;
    errorBox.classList.add("show");
}

function hideError() {
    errorBox.classList.remove("show");
}
