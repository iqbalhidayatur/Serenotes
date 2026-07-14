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

    return !!getToken();

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

    const result = await GoogleSignIn.handleRedirectCallback();

    if (!result.accessToken) {
        throw new Error("Access token tidak diterima.");
    }

    localStorage.setItem(
        STORAGE_KEY_TOKEN,
        result.accessToken
    );

    localStorage.setItem(
        STORAGE_KEY_USER,
        JSON.stringify({
            name: result.displayName,
            email: result.email,
            picture: result.imageUrl,
            sub: result.userId
        })
    );

    history.replaceState({}, "", "login.html");

    return true;
}