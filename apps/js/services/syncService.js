// ══════════════════════════════════════════════════════════
// syncService.js — Sync localStorage ↔ Google Drive
// ══════════════════════════════════════════════════════════
//
// Strategi:
//   - localStorage = sumber utama (selalu dipakai, offline-first)
//   - Google Drive = backup + sync antar device
//   - Tidak ada perubahan di noteService / folderService / mediaService
//
// Flow:
//   Login      → pull Drive → merge ke localStorage (sekali saja)
//   Write      → localStorage dulu (sync), lalu push Drive (async background)
//   Manual     → syncService.pushToDrive() / syncService.pullFromDrive()

import { readJSON, writeJSON, uploadMedia as driveUploadMedia, downloadMedia } from "./driveService.js";
import { isLoggedIn, getToken } from "./authService.js";

// ── Keys localStorage ────────────────────────────────────
const KEY_NOTES     = "serenotes_notes";
const KEY_FOLDERS   = "serenotes_folders";
const KEY_LAST_SYNC = "sn_last_sync";
const KEY_DIRTY     = "sn_dirty";        // ada perubahan yang belum di-push
const KEY_PULL_DONE = "sn_pull_done";    // sudah pull dari Drive setelah login

// ── Status sync ──────────────────────────────────────────
let isSyncing = false;
let syncQueue = null;   // pending sync timer

// ── Public API ───────────────────────────────────────────

/**
 * Dipanggil setelah login berhasil.
 * Pull data dari Drive dan merge ke localStorage.
 * Hanya dilakukan sekali per session.
 */
export async function pullOnLogin() {
    if (!isLoggedIn()) return;
    if (localStorage.getItem(KEY_PULL_DONE) === "1") return;

    try {
        await pullFromDrive();
        localStorage.setItem(KEY_PULL_DONE, "1");
    } catch (err) {
        console.warn("[sync] Pull on login gagal:", err.message);
    }
}

/**
 * Tandai ada perubahan (dipanggil setiap kali data berubah).
 * Push ke Drive secara debounced (5 detik setelah perubahan terakhir).
 */
export function markDirty() {
    if (!isLoggedIn()) return;

    localStorage.setItem(KEY_DIRTY, "1");

    // Debounce — tunggu 5 detik setelah perubahan terakhir baru push
    clearTimeout(syncQueue);
    syncQueue = setTimeout(() => {
        pushToDrive().catch(err =>
            console.warn("[sync] Auto-push gagal:", err.message)
        );
    }, 5000);
}

/**
 * Push data dari localStorage ke Google Drive.
 * Dipanggil otomatis (debounced) atau manual.
 */
export async function pushToDrive() {
    if (!isLoggedIn() || isSyncing) return;
    isSyncing = true;

    try {
        const notes   = JSON.parse(localStorage.getItem(KEY_NOTES)   || "[]");
        const folders = JSON.parse(localStorage.getItem(KEY_FOLDERS) || "[]");

        await Promise.all([
            writeJSON("notes.json",   notes),
            writeJSON("folders.json", folders)
        ]);

        localStorage.setItem(KEY_LAST_SYNC, new Date().toISOString());
        localStorage.removeItem(KEY_DIRTY);

        console.log("[sync] Push ke Drive berhasil:", new Date().toLocaleTimeString());
        dispatchSyncEvent("push", "success");

    } catch (err) {
        console.warn("[sync] Push gagal:", err.message);
        dispatchSyncEvent("push", "error", err.message);
    } finally {
        isSyncing = false;
    }
}

/**
 * Pull data dari Google Drive dan merge ke localStorage.
 * Merge strategy: Drive wins untuk data yang lebih baru (by updatedAt).
 */
export async function pullFromDrive() {
    if (!isLoggedIn() || isSyncing) return;
    isSyncing = true;

    try {
        const [driveNotes, driveFolders] = await Promise.all([
            readJSON("notes.json"),
            readJSON("folders.json")
        ]);

        if (driveNotes)   mergeNotes(driveNotes);
        if (driveFolders) mergeFolders(driveFolders);

        localStorage.setItem(KEY_LAST_SYNC, new Date().toISOString());

        console.log("[sync] Pull dari Drive berhasil:", new Date().toLocaleTimeString());
        dispatchSyncEvent("pull", "success");

    } catch (err) {
        console.warn("[sync] Pull gagal:", err.message);
        dispatchSyncEvent("pull", "error", err.message);
    } finally {
        isSyncing = false;
    }
}

/**
 * Merge notes dari Drive ke localStorage.
 * - Note baru di Drive → tambah ke local
 * - Note lebih baru di Drive → update local
 * - Note hanya di local → pertahankan
 */
function mergeNotes(driveNotes) {
    const localNotes  = JSON.parse(localStorage.getItem(KEY_NOTES) || "[]");
    const localMap    = new Map(localNotes.map(n => [n.id, n]));

    for (const driveNote of driveNotes) {
        const localNote = localMap.get(driveNote.id);

        if (!localNote) {
            // Note baru dari Drive
            localMap.set(driveNote.id, driveNote);
        } else {
            // Bandingkan updatedAt — ambil yang lebih baru
            const driveTime = new Date(driveNote.updatedAt || 0).getTime();
            const localTime = new Date(localNote.updatedAt || 0).getTime();

            if (driveTime > localTime) {
                localMap.set(driveNote.id, driveNote);
            }
        }
    }

    const merged = Array.from(localMap.values())
        .sort((a, b) => new Date(b.updatedAt || 0) - new Date(a.updatedAt || 0));

    localStorage.setItem(KEY_NOTES, JSON.stringify(merged));
}

/**
 * Merge folders dari Drive ke localStorage.
 * Sama seperti mergeNotes tapi untuk folders.
 */
function mergeFolders(driveFolders) {
    const localFolders = JSON.parse(localStorage.getItem(KEY_FOLDERS) || "[]");
    const localMap     = new Map(localFolders.map(f => [f.id, f]));

    for (const driveFolder of driveFolders) {
        const localFolder = localMap.get(driveFolder.id);

        if (!localFolder) {
            localMap.set(driveFolder.id, driveFolder);
        } else {
            const driveTime = new Date(driveFolder.updatedAt || 0).getTime();
            const localTime = new Date(localFolder.updatedAt || 0).getTime();

            if (driveTime > localTime) {
                localMap.set(driveFolder.id, driveFolder);
            }
        }
    }

    localStorage.setItem(KEY_FOLDERS, JSON.stringify(Array.from(localMap.values())));
}

/**
 * Cek apakah ada perubahan yang belum di-push ke Drive.
 */
export function hasPendingChanges() {
    return localStorage.getItem(KEY_DIRTY) === "1";
}

/**
 * Waktu terakhir sync berhasil.
 */
export function getLastSyncTime() {
    const raw = localStorage.getItem(KEY_LAST_SYNC);
    return raw ? new Date(raw) : null;
}

/**
 * Reset pull flag — paksa pull ulang dari Drive.
 */
export function resetPullFlag() {
    localStorage.removeItem(KEY_PULL_DONE);
}

// ── Helper: dispatch custom event untuk UI ────────────────
function dispatchSyncEvent(type, status, message = "") {
    window.dispatchEvent(new CustomEvent("serenotes-sync", {
        detail: { type, status, message, time: new Date().toISOString() }
    }));
}