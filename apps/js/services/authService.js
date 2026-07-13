// ══════════════════════════════════════════════════════════
// authService.js — Google OAuth via Google Identity Services
// ══════════════════════════════════════════════════════════

// ⚠️  Ganti dengan Web Client ID dari Google Cloud Console
// APIs & Services → Credentials → Serenotes Web → Client ID
const CLIENT_ID = "913859729877-itok1j6ibmn5ptcs1iiaeuhu25ftsauv.apps.googleusercontent.com";

const SCOPES = [
    "https://www.googleapis.com/auth/drive.file",
    "profile",
    "email"
].join(" ");

const STORAGE_KEY_TOKEN   = "sn_access_token";
const STORAGE_KEY_EXPIRY  = "sn_token_expiry";
const STORAGE_KEY_USER    = "sn_user";

let tokenClient = null;
let resolveTokenPromise = null;
let rejectTokenPromise  = null;

// ── Init Google Identity Services ───────────────────────
export function initAuth() {
    return new Promise((resolve, reject) => {
        // Tunggu GIS script load
        const check = setInterval(() => {
            if (window.google?.accounts?.oauth2) {
                clearInterval(check);

                tokenClient = window.google.accounts.oauth2.initTokenClient({
                    client_id: CLIENT_ID,
                    scope: SCOPES,
                    callback: (response) => {
                        if (response.error) {
                            rejectTokenPromise?.(new Error(response.error));
                            return;
                        }

                        // Simpan token
                        const expiry = Date.now() + (response.expires_in * 1000);
                        localStorage.setItem(STORAGE_KEY_TOKEN,  response.access_token);
                        localStorage.setItem(STORAGE_KEY_EXPIRY, expiry.toString());

                        resolveTokenPromise?.(response.access_token);
                    }
                });

                resolve();
            }
        }, 100);

        // Timeout 10 detik
        setTimeout(() => {
            clearInterval(check);
            reject(new Error("Google Identity Services gagal load."));
        }, 10000);
    });
}

// ── Request / refresh token ──────────────────────────────
export function requestToken() {
    return new Promise((resolve, reject) => {
        resolveTokenPromise = resolve;
        rejectTokenPromise  = reject;

        // Kalau token masih valid, langsung return
        const token  = localStorage.getItem(STORAGE_KEY_TOKEN);
        const expiry = parseInt(localStorage.getItem(STORAGE_KEY_EXPIRY) || "0");

        if (token && Date.now() < expiry - 60000) {
            resolve(token);
            return;
        }

        // Request token baru — tampil popup Google
        tokenClient.requestAccessToken({ prompt: "consent" });
    });
}

// ── Ambil token yang sudah ada (tanpa popup) ─────────────
export function getToken() {
    const token  = localStorage.getItem(STORAGE_KEY_TOKEN);
    const expiry = parseInt(localStorage.getItem(STORAGE_KEY_EXPIRY) || "0");

    if (token && Date.now() < expiry - 60000) {
        return token;
    }

    return null;
}

// ── Fetch info user dari Google ──────────────────────────
export async function fetchUserInfo(accessToken) {
    const res = await fetch("https://www.googleapis.com/oauth2/v3/userinfo", {
        headers: { Authorization: `Bearer ${accessToken}` }
    });

    if (!res.ok) throw new Error("Gagal ambil info user.");

    const data = await res.json();

    const user = {
        name:    data.name,
        email:   data.email,
        picture: data.picture,
        sub:     data.sub
    };

    localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(user));

    return user;
}

// ── Cek apakah sudah login ───────────────────────────────
export function isLoggedIn() {
    return !!getToken() && !!getUser();
}

// ── Ambil data user yang tersimpan ──────────────────────
export function getUser() {
    const raw = localStorage.getItem(STORAGE_KEY_USER);
    return raw ? JSON.parse(raw) : null;
}

// ── Logout ───────────────────────────────────────────────
export function logout() {
    const token = localStorage.getItem(STORAGE_KEY_TOKEN);

    if (token && window.google?.accounts?.oauth2) {
        window.google.accounts.oauth2.revoke(token);
    }

    localStorage.removeItem(STORAGE_KEY_TOKEN);
    localStorage.removeItem(STORAGE_KEY_EXPIRY);
    localStorage.removeItem(STORAGE_KEY_USER);

    window.location.href = "login.html";
}