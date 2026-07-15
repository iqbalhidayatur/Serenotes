import { GoogleSignIn } from "@capawesome/capacitor-google-sign-in";

const CLIENT_ID =
"913859729877-itok1j6ibmn5ptcs1iiaeuhu25ftsauv.apps.googleusercontent.com";

const STORAGE_KEY_TOKEN = "sn_access_token";
const STORAGE_KEY_USER = "sn_user";

let initialized = false;

const SCOPES = [
    "email",
    "profile",
    "https://www.googleapis.com/auth/drive.file"
];

export async function initAuth() {

    if (initialized) return;

    await GoogleSignIn.initialize({
        clientId: CLIENT_ID,
        scopes: SCOPES,
        ...(Capacitor.getPlatform() === "web"
            ? { redirectUrl: window.location.origin + "/login.html" }
            : {})
    });

    initialized = true;

}

// ── Request / refresh token ──────────────────────────────
export async function requestToken(force = false) {
    const result = await GoogleSignIn.signIn();

    // Di Android, authorize() bisa butuh intent terpisah (hasResolution=true).
    // Kalau itu terjadi, signIn() resolve duluan tapi accessToken masih null.
    // Jangan simpan null — isLoggedIn() akan true tapi semua request Drive 401.
    if (!result.accessToken) {
        throw new Error("Access token tidak diterima dari Google. Coba login lagi.");
    }

    localStorage.setItem(STORAGE_KEY_TOKEN, result.accessToken);

    localStorage.setItem(
        STORAGE_KEY_USER,
        JSON.stringify({
            name: result.displayName,
            email: result.email,
            picture: result.imageUrl,
            sub: result.userId
        })
    );

    return result.accessToken;
}

// ── Ambil token yang sudah ada (tanpa popup) ─────────────
export function getToken() {
    return localStorage.getItem(STORAGE_KEY_TOKEN);
}

// ── Fetch info user dari Google ──────────────────────────
export function fetchUserInfo() {
    return getUser();
}

// ── Cek apakah sudah login ───────────────────────────────
export function isLoggedIn() {
    const t = getToken();
    // Guard string "null" yang bisa tersimpan dari bug lama (result.accessToken = null)
    return !!t && t !== "null";
}

// ── Ambil data user yang tersimpan ──────────────────────
export function getUser() {

    const raw =
        localStorage.getItem(STORAGE_KEY_USER);

    return raw ? JSON.parse(raw) : null;

}

// ── Logout ───────────────────────────────────────────────
export async function logout() {

    await GoogleSignIn.signOut();

    localStorage.removeItem(STORAGE_KEY_TOKEN);
    localStorage.removeItem(STORAGE_KEY_USER);

    location.replace("login.html");

}

export async function handleLoginCallback() {

    if (!window.location.hash.includes("access_token")) {
        return false;
    }

    // Parse hash langsung — tidak pakai plugin Capacitor karena
    // GoogleSignIn.handleRedirectCallback() tidak reliable di web build.
    const params = new URLSearchParams(window.location.hash.slice(1));
    const accessToken = params.get("access_token");

    if (!accessToken) {
        throw new Error("Access token tidak ditemukan di URL.");
    }

    // Simpan token
    localStorage.setItem(STORAGE_KEY_TOKEN, accessToken);

    // Ambil info user dari id_token (JWT) kalau ada, atau fetch dari Google
    const idToken = params.get("id_token");
    if (idToken) {
        try {
            // Decode payload JWT (bagian tengah, base64url)
            const payload = JSON.parse(
                atob(idToken.split(".")[1].replace(/-/g, "+").replace(/_/g, "/"))
            );
            localStorage.setItem(STORAGE_KEY_USER, JSON.stringify({
                name:    payload.name    || "",
                email:   payload.email   || "",
                picture: payload.picture || "",
                sub:     payload.sub     || ""
            }));
        } catch (_) {
            // Fallback: fetch userinfo dari Google API
            await _fetchAndSaveUserInfo(accessToken);
        }
    } else {
        await _fetchAndSaveUserInfo(accessToken);
    }

    // Bersihkan hash dari URL
    history.replaceState({}, "", "login.html");

    return true;
}

async function _fetchAndSaveUserInfo(accessToken) {
    const res = await fetch("https://www.googleapis.com/oauth2/v3/userinfo", {
        headers: { Authorization: `Bearer ${accessToken}` }
    });
    if (!res.ok) throw new Error("Gagal ambil info user.");
    const u = await res.json();
    localStorage.setItem(STORAGE_KEY_USER, JSON.stringify({
        name:    u.name    || "",
        email:   u.email   || "",
        picture: u.picture || "",
        sub:     u.sub     || ""
    }));
}