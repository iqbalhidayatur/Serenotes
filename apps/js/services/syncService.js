// ══════════════════════════════════════════════════════════
// syncService.js — Sync localStorage ↔ Google Drive
//
// Strategi:
//   markDirty()  → tandai ada perubahan lokal → debounce push
//   startWatcher → tiap 30 detik cek Drive, pull kalau lebih baru
//   syncNow()    → push jika ada perubahan lokal, lalu pull jika Drive lebih baru
//
// Kenapa mobile berbeda dari web:
//   • Di web, Google session aktif di browser → token selalu fresh
//   • Di Android, token expire 1 jam → perlu auto-refresh via requestToken()
//   • Di mobile, tiap pindah halaman = module reload → variabel in-memory reset
//   • Solusi: semua state pakai localStorage, bukan variabel JS
// ══════════════════════════════════════════════════════════

import {
    readJSON,
    writeJSON,
    getModifiedTime,
    uploadMedia as driveUploadMedia,
    downloadMedia,
    findMediaFile
} from "./driveService.js";
import { isLoggedIn, getToken } from "./authService.js";
import { getAllMedia } from "./mediaService.js";

// ── Keys localStorage (jembatan antar halaman) ───────────
const KEY_NOTES         = "serenotes_notes";
const KEY_FOLDERS       = "serenotes_folders";
const KEY_LAST_SYNC     = "sn_last_sync";
const KEY_LAST_PUSH     = "sn_last_push";   // ISO — kapan terakhir kita push
const KEY_DIRTY         = "sn_dirty";        // "1" = ada perubahan lokal belum di-push
const KEY_SYNCED_MEDIA  = "sn_synced_media";

// ── State in-memory (per halaman) ────────────────────────
let isSyncing  = false;
let syncQueued = false;
let watcherId  = null;
let _debounce  = null;

// ══════════════════════════════════════════════════════════
// Public API
// ══════════════════════════════════════════════════════════

/**
 * Dipanggil tiap kali ada perubahan lokal (dari noteService, folderService, dll).
 * Set flag dirty di localStorage (persist antar halaman), debounce push 1.5 detik.
 */
export function markDirty() {
    if (!isLoggedIn()) return;
    localStorage.setItem(KEY_DIRTY, "1");
    clearTimeout(_debounce);
    _debounce = setTimeout(() => _doPush(), 1500);
}

/**
 * Dipanggil saat masuk dashboard setelah login.
 * Pull dari Drive kalau Drive lebih baru dari last sync.
 */
export async function pullOnLogin() {
    if (!isLoggedIn()) return;
    try {
        await _doPullIfNewer();
    } catch (err) {
        console.warn("[sync] pullOnLogin gagal:", err.message);
    }
}

/**
 * Dipanggil dari tombol sync manual di settings.
 * Push kalau ada dirty, lalu pull kalau Drive lebih baru.
 */
export async function syncNow() {
    if (!isLoggedIn()) return;

    if (isSyncing) {
        syncQueued = true;
        return;
    }

    isSyncing = true;
    try {
        // 1. Push dulu kalau ada perubahan lokal
        if (_isDirty()) {
            await pushToDrive();
        }

        // 2. Cek Drive — pull kalau lebih baru dari last push kita
        await _doPullIfNewer();

    } finally {
        isSyncing = false;
        if (syncQueued) {
            syncQueued = false;
            setTimeout(syncNow, 300);
        }
    }
}

/**
 * Background watcher — tiap interval cek apakah Drive lebih baru.
 * Juga push kalau masih ada dirty yang tertinggal.
 */
export function startWatcher(interval = 30000) {
    if (watcherId) return;
    console.log("[sync] Watcher dimulai, interval:", interval + "ms");

    watcherId = setInterval(async () => {
        if (document.hidden || !isLoggedIn()) return;
        try {
            if (_isDirty()) await _doPush();
            await _doPullIfNewer();
        } catch (err) {
            console.warn("[sync] Watcher error:", err.message);
        }
    }, interval);
}

export function stopWatcher() {
    clearInterval(watcherId);
    watcherId = null;
}

export async function pushToDrive() {
    if (!isLoggedIn()) return;
    await _doPush();
}

export async function pullFromDrive() {
    if (!isLoggedIn()) return;
    await _doPull();
}

export function getLastSyncTime() {
    const raw = localStorage.getItem(KEY_LAST_SYNC);
    return raw ? new Date(raw) : null;
}

// Kompatibilitas — tidak dipakai lagi tapi masih diimport di beberapa tempat
export function hasPendingChanges() { return _isDirty(); }
export function resetPullFlag() {}

// ══════════════════════════════════════════════════════════
// Internal — Push
// ══════════════════════════════════════════════════════════

async function _doPush() {
    try {
        const notes   = JSON.parse(localStorage.getItem(KEY_NOTES)   || "[]");
        const folders = JSON.parse(localStorage.getItem(KEY_FOLDERS) || "[]");

        await Promise.all([
            writeJSON("notes.json",   notes),
            writeJSON("folders.json", folders)
        ]);

        await _pushMedia();

        const now = new Date().toISOString();
        localStorage.setItem(KEY_LAST_SYNC, now);
        localStorage.setItem(KEY_LAST_PUSH, now);  // catat waktu push
        localStorage.removeItem(KEY_DIRTY);

        console.log("[sync] ✅ Push berhasil:", new Date().toLocaleTimeString());
        _dispatch("push", "success");

    } catch (err) {
        console.warn("[sync] ❌ Push gagal:", err.message);
        _dispatch("push", "error", err.message);
        throw err;
    }
}

// ══════════════════════════════════════════════════════════
// Internal — Pull (hanya jika Drive lebih baru)
// ══════════════════════════════════════════════════════════

async function _doPullIfNewer() {
    // Ambil modifiedTime file notes.json di Drive
    const driveTime = await getModifiedTime("notes.json");

    if (!driveTime) {
        // File belum ada di Drive → tidak ada yang di-pull
        console.log("[sync] notes.json belum ada di Drive");
        return;
    }

    // Bandingkan dengan kapan kita terakhir push
    // (bukan updatedAt note, karena updatedAt note selalu < waktu push)
    const lastPush = localStorage.getItem(KEY_LAST_PUSH);
    const lastSync = localStorage.getItem(KEY_LAST_SYNC);

    // Referensi waktu lokal: pakai last push kalau ada, fallback ke last sync
    const localRef = lastPush || lastSync;

    const driveMs = new Date(driveTime).getTime();
    const localMs = localRef ? new Date(localRef).getTime() : 0;

    const TOLERANCE = 5000; // 5 detik toleransi clock skew

    console.log("[sync] driveTime:", driveTime, "| localRef:", localRef,
        "| selisih:", Math.round((driveMs - localMs) / 1000) + "s");

    if (driveMs - localMs > TOLERANCE) {
        console.log("[sync] Drive lebih baru → pull");
        await _doPull();
    } else {
        console.log("[sync] Sudah sinkron, skip pull");
    }
}

async function _doPull() {
    try {
        const [driveNotes, driveFolders] = await Promise.all([
            readJSON("notes.json"),
            readJSON("folders.json")
        ]);

        if (driveNotes)   _mergeNotes(driveNotes);
        if (driveFolders) _mergeFolders(driveFolders);

        await _pullMedia();

        const now = new Date().toISOString();
        localStorage.setItem(KEY_LAST_SYNC, now);
        // Update last push juga supaya watcher tidak langsung pull lagi
        localStorage.setItem(KEY_LAST_PUSH, now);

        console.log("[sync] ✅ Pull berhasil:", new Date().toLocaleTimeString());
        _dispatch("pull", "success");

        window.dispatchEvent(new Event("serenotes-data-changed"));

    } catch (err) {
        console.warn("[sync] ❌ Pull gagal:", err.message);
        _dispatch("pull", "error", err.message);
        throw err;
    }
}

// ══════════════════════════════════════════════════════════
// Internal — Media
// ══════════════════════════════════════════════════════════

async function _pushMedia() {
    const allMedia = await getAllMedia();
    if (!allMedia.length) return;

    const synced = new Set(JSON.parse(localStorage.getItem(KEY_SYNCED_MEDIA) || "[]"));
    const toUpload = allMedia.filter(m => !synced.has(m.id));
    if (!toUpload.length) return;

    for (const media of toUpload) {
        try {
            const ext = media.filename.split(".").pop() || "bin";
            await driveUploadMedia(media.file, `${media.id}.${ext}`, media.mimeType);
            synced.add(media.id);
            localStorage.setItem(KEY_SYNCED_MEDIA, JSON.stringify([...synced]));
        } catch (err) {
            console.warn("[sync] Gagal upload media:", err.message);
        }
    }
}

async function _pullMedia() {
    const notes = JSON.parse(localStorage.getItem(KEY_NOTES) || "[]");
    const needed = new Set();
    notes.forEach(n => (n.media || []).forEach(m => { if (m.refId) needed.add(m.refId); }));
    if (!needed.size) return;

    const localIds = new Set((await getAllMedia()).map(m => m.id));
    const missing  = [...needed].filter(id => !localIds.has(id));
    if (!missing.length || !getToken()) return;

    const EXTS = ["jpg","jpeg","png","gif","webp","mp4","mov","mp3","aac","pdf","bin"];
    for (const id of missing) {
        try {
            let f = null;
            for (const ext of EXTS) { f = await findMediaFile(`${id}.${ext}`); if (f) break; }
            if (!f) continue;
            const blob = await downloadMedia(f.id);
            await _idbSave(id, new File([blob], f.name, { type: f.mimeType }), f.mimeType);
        } catch (err) {
            console.warn("[sync] Gagal pull media:", err.message);
        }
    }
}

function _idbSave(id, file, mimeType) {
    return new Promise((resolve, reject) => {
        const req = indexedDB.open("SerenotesDB");
        req.onsuccess = () => {
            const tx = req.result.transaction("media", "readwrite");
            tx.objectStore("media").put({ id, file, filename: file.name,
                mimeType: mimeType || file.type, size: file.size,
                createdAt: new Date().toISOString() });
            tx.oncomplete = resolve;
            tx.onerror = () => reject(tx.error);
        };
        req.onerror = () => reject(req.error);
    });
}

// ══════════════════════════════════════════════════════════
// Internal — Merge
// ══════════════════════════════════════════════════════════

function _mergeNotes(driveNotes) {
    const local = JSON.parse(localStorage.getItem(KEY_NOTES) || "[]");
    const map   = new Map(local.map(n => [n.id, n]));
    for (const dn of driveNotes) {
        const ln = map.get(dn.id);
        if (!ln || new Date(dn.updatedAt||0) > new Date(ln.updatedAt||0)) {
            map.set(dn.id, dn);
        }
    }
    localStorage.setItem(KEY_NOTES, JSON.stringify(
        [...map.values()].sort((a,b) => new Date(b.updatedAt||0) - new Date(a.updatedAt||0))
    ));
}

function _mergeFolders(driveFolders) {
    const local = JSON.parse(localStorage.getItem(KEY_FOLDERS) || "[]");
    const map   = new Map(local.map(f => [f.id, f]));
    for (const df of driveFolders) {
        const lf = map.get(df.id);
        if (!lf || new Date(df.updatedAt||0) > new Date(lf.updatedAt||0)) {
            map.set(df.id, df);
        }
    }
    localStorage.setItem(KEY_FOLDERS, JSON.stringify([...map.values()]));
}

// ══════════════════════════════════════════════════════════
// Internal — Utils
// ══════════════════════════════════════════════════════════

function _isDirty() {
    return localStorage.getItem(KEY_DIRTY) === "1";
}

function _dispatch(type, status, message = "") {
    window.dispatchEvent(new CustomEvent("serenotes-sync", {
        detail: { type, status, message, time: new Date().toISOString() }
    }));
}

// Flush sebelum pindah halaman (mobile: visibilitychange sering trigger)
async function _flushOnLeave() {
    if (!isLoggedIn() || !_isDirty()) return;
    clearTimeout(_debounce);
    try { await _doPush(); } catch (_) {}
}

document.addEventListener("visibilitychange", () => {
    if (document.hidden) _flushOnLeave();
});
window.addEventListener("pagehide", () => _flushOnLeave());