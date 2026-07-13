import { initTheme, getTheme, toggleTheme } from "../services/themeService.js";
import { clearNotes } from "../services/noteService.js";
import { clearMedia } from "../services/mediaService.js";
import { logout, getUser, isLoggedIn } from "../services/authService.js";
import { pushToDrive, pullFromDrive, getLastSyncTime } from "../services/syncService.js";

initTheme();

const { App: CapApp } = window.Capacitor?.Plugins || {};
if (CapApp) {
    CapApp.addListener("backButton", ({ canGoBack }) => {
        if (canGoBack) window.history.back();
        else window.location.href = "dashboard.html";
    });
}

const backupBtn    = document.getElementById("backupBtn");
const clearDataBtn = document.getElementById("clearDataBtn");
const profileName  = document.getElementById("profileName");
const profileGreet = document.getElementById("profileGreet");
const darkModeToggle = document.getElementById("darkModeToggle");
const logoutBtn    = document.getElementById("logoutBtn");
const syncNowBtn   = document.getElementById("syncNowBtn");
const lastSyncLabel = document.getElementById("lastSyncLabel");
const accountName  = document.getElementById("accountName");
const accountEmail = document.getElementById("accountEmail");

// ── Profile ──────────────────────────────────────────────
const userName = localStorage.getItem("serenotes_user") || "User";
if (profileName)  profileName.textContent  = userName;
if (profileGreet) profileGreet.textContent = `Welcome back, ${userName}! 👋`;

// ── Account info ─────────────────────────────────────────
const user = getUser();
if (user) {
    if (accountName)  accountName.textContent  = user.name  || "-";
    if (accountEmail) accountEmail.textContent = user.email || "-";
} else {
    if (accountName)  accountName.textContent  = "Belum login";
    if (accountEmail) accountEmail.textContent = "Login dengan Google untuk sync";
}

// ── Last sync label ──────────────────────────────────────
function updateLastSyncLabel() {
    const last = getLastSyncTime();
    if (!lastSyncLabel) return;
    if (!last) {
        lastSyncLabel.textContent = "Belum pernah sync";
        return;
    }
    lastSyncLabel.textContent = `Terakhir sync: ${last.toLocaleString("id-ID", {
        day: "numeric", month: "short", hour: "2-digit", minute: "2-digit"
    })}`;
}
updateLastSyncLabel();

// ── Dark mode ────────────────────────────────────────────
darkModeToggle.checked = getTheme() === "dark";
darkModeToggle.addEventListener("change", () => toggleTheme());

// ── Backup ───────────────────────────────────────────────
backupBtn.addEventListener("click", handleBackup);

// ── Sync manual ──────────────────────────────────────────
syncNowBtn?.addEventListener("click", async () => {
    if (!isLoggedIn()) {
        alert("Login dengan Google dulu untuk sync ke Drive.");
        return;
    }

    const icon = syncNowBtn.querySelector("i");
    icon.className = "bi bi-arrow-repeat spin";
    syncNowBtn.disabled = true;
    lastSyncLabel.textContent = "Menyinkronkan...";

    try {
        await pushToDrive();
        updateLastSyncLabel();
    } catch (err) {
        lastSyncLabel.textContent = "Sync gagal. Coba lagi.";
    } finally {
        icon.className = "bi bi-arrow-repeat";
        syncNowBtn.disabled = false;
    }
});

// ── Logout ───────────────────────────────────────────────
logoutBtn?.addEventListener("click", async () => {
    if (!confirm("Yakin ingin logout? Data tetap tersimpan di perangkat ini.")) return;

    // Push dulu sebelum logout supaya data terbaru tersimpan di Drive
    if (isLoggedIn()) {
        try {
            await pushToDrive();
        } catch (_) {}
    }

    logout(); // redirect ke login.html otomatis
});

// ── Clear data ───────────────────────────────────────────
clearDataBtn.addEventListener("click", handleClear);

function handleBackup() {
    const STORAGE_KEY = "serenotes_notes";
    const notes = JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];

    if (!notes.length) {
        alert("No notes to backup.");
        return;
    }

    const blob = new Blob(
        [JSON.stringify(notes, null, 2)],
        { type: "application/json" }
    );
    const url  = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href     = url;
    link.download = `serenotes_backup_${new Date().toISOString().slice(0,10)}.json`;
    link.click();
    URL.revokeObjectURL(url);
}

async function handleClear() {
    const confirmed = confirm("Delete ALL notes permanently? This cannot be undone.");
    if (!confirmed) return;
    clearNotes();
    await clearMedia();
    alert("All data cleared.");
}