// ══════════════════════════════════════════════════════════
// syncService.js — Sync localStorage ↔ Google Drive
// ══════════════════════════════════════════════════════════

import { readJSON, writeJSON, uploadMedia as driveUploadMedia, downloadMedia } from "./driveService.js";
import { isLoggedIn, getToken } from "./authService.js";
import { getAllMedia } from "./mediaService.js";
import { getModifiedTime } from "./driveService.js";

// ── Keys localStorage ────────────────────────────────────
const KEY_NOTES        = "serenotes_notes";
const KEY_FOLDERS      = "serenotes_folders";
const KEY_LAST_SYNC    = "sn_last_sync";
const KEY_DIRTY        = "sn_dirty";
const KEY_PULL_DONE    = "sn_pull_done";
const KEY_SYNCED_MEDIA = "sn_synced_media"; // Array ID media yang sukses di-push ke Drive

// ── Status sync ──────────────────────────────────────────
let isSyncing = false;

let dirty = false;

let pendingSync = false;

let pushTimer = null;

let watchTimer = null;

let lastNotesModified = null;

let lastFoldersModified = null;

let syncQueue = null;

let watcherId = null;

// ── Public API ───────────────────────────────────────────

/**
 * Dipanggil setelah login berhasil.
 * Pull data dari Drive dan merge ke localStorage (sekali per session).
 */
export async function pullOnLogin(){

    if(!isLoggedIn()) return;

    try{

        await pullFromDrive();

        localStorage.setItem(KEY_PULL_DONE,"1");

    }

    catch(err){

        console.warn(err);

    }

}

/**
 * Tandai ada perubahan lokal. Debounce push ke Drive selama 5 detik.
 */
export function markDirty() {

    if (!isLoggedIn()) return;

    dirty = true;

    clearTimeout(pushTimer);

    pushTimer = setTimeout(() => {

        syncNow();

    },2000);

}

export async function syncNow() {

    if (!isLoggedIn()) return;

    if (isSyncing) {
        pendingSync = true;
        return;
    }

    isSyncing = true;

    try {

        // kalau ada perubahan lokal, push dulu
        if (dirty) {

            await pushToDrive();

            dirty = false;

        }

        // baru cek apakah device lain mengubah data
        await checkRemoteChanges();

    } finally {

        isSyncing = false;

        if (pendingSync) {

            pendingSync = false;

            syncNow();

        }

    }

}

export function startWatcher(interval = 2000) {

    if (watcherId) return;

    watcherId = setInterval(async () => {

        if (document.hidden) return;

        try {
            await checkRemoteChanges();

            if (hasPendingChanges()) {
                await pushToDrive();
            }

        } catch (e) {
            console.error(e);
        }

    }, interval);

}

export function stopWatcher(){

    clearInterval(watchTimer);

    watchTimer=null;

}

async function checkRemoteChanges(){

    const notesModified =
        await getModifiedTime("notes.json");

    const foldersModified =
        await getModifiedTime("folders.json");

    let changed = false;

    if(
        notesModified &&
        notesModified!==lastNotesModified
    ){

        lastNotesModified = notesModified;

        changed = true;

    }

    if(
        foldersModified &&
        foldersModified!==lastFoldersModified
    ){

        lastFoldersModified = foldersModified;

        changed = true;

    }

    if(changed){

        await pullFromDrive();

    }

}

/**
 * Push data dari localStorage & media baru ke Google Drive.
 */
export async function pushToDrive() {
    if (!isLoggedIn()) return;

    try {
        // 1. Push notes + folders
        const notes   = JSON.parse(localStorage.getItem(KEY_NOTES)   || "[]");
        const folders = JSON.parse(localStorage.getItem(KEY_FOLDERS) || "[]");

        await Promise.all([
            writeJSON("notes.json",   notes),
            writeJSON("folders.json", folders)
        ]);

        // 2. Push media yang belum di-upload ke Drive
        await pushMediaToDrive();

        localStorage.setItem(KEY_LAST_SYNC, new Date().toISOString());
        localStorage.removeItem(KEY_DIRTY);

        console.log("[sync] Push ke Drive berhasil:", new Date().toLocaleTimeString());
        dispatchSyncEvent("push", "success");

    } catch (err) {
        console.warn("[sync] Push gagal:", err.message);
        dispatchSyncEvent("push", "error", err.message);
    }
}

/**
 * Pull data dan media dari Google Drive, lalu gabungkan ke lokal.
 */
export async function pullFromDrive() {

    console.log("========== PULL ==========");

    if (!isLoggedIn()) {
        console.log("NOT LOGIN");
        return;
    }

    console.log("LOGIN OK");

    try {
        const [driveNotes, driveFolders] = await Promise.all([
            readJSON("notes.json"),
            readJSON("folders.json")
        ]);
        
        console.log("driveNotes =", driveNotes);
        console.log("driveFolders =", driveFolders);

        if (driveNotes)   mergeNotes(driveNotes);
        if (driveFolders) mergeFolders(driveFolders);

        // Pull media dari Drive yang dibutuhkan oleh lokal notes
        await pullMediaFromDrive();

        localStorage.setItem(KEY_LAST_SYNC, new Date().toISOString());

        console.log("[sync] Pull dari Drive berhasil:", new Date().toLocaleTimeString());
        dispatchSyncEvent("pull", "success");

        window.dispatchEvent(

            new Event("serenotes-data-changed")

        );
    } catch (err) {
        console.warn("[sync] Pull gagal:", err.message);
        dispatchSyncEvent("pull", "error", err.message);
    }
}

// ── Media push: upload semua media baru ke Drive ─────────
async function pushMediaToDrive() {
    const allMedia = await getAllMedia();
    if (!allMedia.length) return;

    const synced = new Set(
        JSON.parse(localStorage.getItem(KEY_SYNCED_MEDIA) || "[]")
    );

    const toUpload = allMedia.filter(m => !synced.has(m.id));
    if (!toUpload.length) return;

    console.log(`[sync] Upload ${toUpload.length} media ke Drive...`);

    for (const media of toUpload) {
        try {
            const ext      = media.filename.split(".").pop() || "bin";
            const driveName = `${media.id}.${ext}`;

            await driveUploadMedia(media.file, driveName, media.mimeType);

            synced.add(media.id);
            localStorage.setItem(KEY_SYNCED_MEDIA, JSON.stringify([...synced]));

            console.log(`[sync] Media uploaded: ${media.filename}`);
        } catch (err) {
            console.warn(`[sync] Gagal upload media ${media.filename}:`, err.message);
        }
    }
}

// ── Media pull: download media dari Drive yang belum ada di lokal ──
async function pullMediaFromDrive() {
    const notes = JSON.parse(localStorage.getItem(KEY_NOTES) || "[]");
    const neededIds = new Set();

    notes.forEach(note => {
        (note.media || []).forEach(m => {
            if (m.refId) neededIds.add(m.refId);
        });
    });

    if (!neededIds.size) return;

    const localMedia  = await getAllMedia();
    const localIds    = new Set(localMedia.map(m => m.id));
    const missingIds  = [...neededIds].filter(id => !localIds.has(id));

    if (!missingIds.length) return;

    console.log(`[sync] Pull ${missingIds.length} media dari Drive...`);

    const token = getToken();
    if (!token) return;

    for (const mediaId of missingIds) {
        try {
            // Pencarian file diubah menggunakan nama presisi agar tidak salah file
            const searchRes = await fetch(
                `https://www.googleapis.com/drive/v3/files?` +
                `q=name contains '${mediaId}'
                    const driveFile = await findMediaFile(filename);
                    and trashed=false` +
                `&fields=files(id,name,mimeType)&spaces=drive`,
                { headers: { Authorization: `Bearer ${token}` } }
            );

            const searchData = await searchRes.json();
            const driveFile  = searchData.files?.[0];
            if (!driveFile) continue;

            const blob = await downloadMedia(driveFile.id);
            const filename = driveFile.name;
            const file     = new File([blob], filename, { type: driveFile.mimeType });

            await idbSaveWithId(mediaId, file, driveFile.mimeType);
            console.log(`[sync] Media pulled: ${filename}`);
        } catch (err) {
            console.warn(`[sync] Gagal pull media ${mediaId}:`, err.message);
        }
    }
}

// ── Simpan media ke IndexedDB dengan ID spesifik ─────────
function idbSaveWithId(id, file, mimeType) {
    const DB_NAME   = "SerenotesDB";
    const STORE_NAME = "media";

    return new Promise((resolve, reject) => {
        const req = indexedDB.open(DB_NAME);
        req.onsuccess = () => {
            const db = req.result;
            const tx = db.transaction(STORE_NAME, "readwrite");
            tx.objectStore(STORE_NAME).put({
                id,
                file,
                filename:  file.name,
                mimeType:  mimeType || file.type,
                size:      file.size,
                createdAt: new Date().toISOString()
            });
            tx.oncomplete = () => resolve();
            tx.onerror    = () => reject(tx.error);
        };
        req.onerror = () => reject(req.error);
    });
}

// ── Merge helpers ────────────────────────────────────────
function mergeNotes(driveNotes) {
    const localNotes = JSON.parse(localStorage.getItem(KEY_NOTES) || "[]");
    const localMap   = new Map(localNotes.map(n => [n.id, n]));

    for (const driveNote of driveNotes) {
        const localNote = localMap.get(driveNote.id);
        if (!localNote) {
            localMap.set(driveNote.id, driveNote);
        } else {
            const driveTime = new Date(driveNote.updatedAt || 0).getTime();
            const localTime = new Date(localNote.updatedAt || 0).getTime();
            if (driveTime > localTime) localMap.set(driveNote.id, driveNote);
        }
    }

    const merged = Array.from(localMap.values())
        .sort((a, b) => new Date(b.updatedAt || 0) - new Date(a.updatedAt || 0));

    localStorage.setItem(KEY_NOTES, JSON.stringify(merged));
}

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
            if (driveTime > localTime) localMap.set(driveFolder.id, driveFolder);
        }
    }

    localStorage.setItem(KEY_FOLDERS, JSON.stringify(Array.from(localMap.values())));
}

// ── Utils ────────────────────────────────────────────────
export function hasPendingChanges() {
    return localStorage.getItem(KEY_DIRTY) === "1";
}

export function getLastSyncTime() {
    const raw = localStorage.getItem(KEY_LAST_SYNC);
    return raw ? new Date(raw) : null;
}

export function resetPullFlag() {
    localStorage.removeItem(KEY_PULL_DONE);
}

function dispatchSyncEvent(type, status, message = "") {
    window.dispatchEvent(new CustomEvent("serenotes-sync", {
        detail: { type, status, message, time: new Date().toISOString() }
    }));
}