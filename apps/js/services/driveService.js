// ══════════════════════════════════════════════════════════
// driveService.js — Google Drive sebagai database Serenotes
// ══════════════════════════════════════════════════════════
// Struktur folder di Drive:
//   My Drive/
//   └── Serenotes/
//       ├── notes.json
//       ├── folders.json
//       └── media/
//           ├── [uuid].jpg
//           └── [uuid].mp4

import { getToken, requestToken } from "./authService.js";

const DRIVE_API   = "https://www.googleapis.com/drive/v3";
const UPLOAD_API  = "https://www.googleapis.com/upload/drive/v3";
const APP_FOLDER  = "Serenotes";
const MEDIA_FOLDER = "media";

// Cache ID folder supaya tidak fetch ulang terus
let appFolderId   = null;
let mediaFolderId = null;

// ── Helper: ambil token (auto-refresh kalau perlu) ───────
async function token() {
    let t = getToken();
    if (!t) t = await requestToken();
    return t;
}

// ── Helper: fetch wrapper dengan auth header ─────────────
async function driveGet(url, params = {}) {
    const q = new URLSearchParams(params).toString();
    const res = await fetch(`${DRIVE_API}${url}${q ? "?" + q : ""}`, {
        headers: { Authorization: `Bearer ${await token()}` }
    });
    if (!res.ok) throw new Error(`Drive GET error: ${res.status}`);
    return res.json();
}

async function drivePost(url, body, params = {}) {
    const q = new URLSearchParams(params).toString();
    const res = await fetch(`${DRIVE_API}${url}${q ? "?" + q : ""}`, {
        method: "POST",
        headers: {
            Authorization: `Bearer ${await token()}`,
            "Content-Type": "application/json"
        },
        body: JSON.stringify(body)
    });
    if (!res.ok) throw new Error(`Drive POST error: ${res.status}`);
    return res.json();
}

// ── Cari atau buat folder di Drive ───────────────────────
async function findOrCreateFolder(name, parentId = null) {
    const t = await token();

    // Cari dulu
    let query = `name='${name}' and mimeType='application/vnd.google-apps.folder' and trashed=false`;
    if (parentId) query += ` and '${parentId}' in parents`;

    const search = await driveGet("/files", {
        q: query,
        fields: "files(id, name)",
        spaces: "drive"
    });

    if (search.files.length > 0) {
        return search.files[0].id;
    }

    // Buat baru kalau belum ada
    const body = {
        name,
        mimeType: "application/vnd.google-apps.folder",
        ...(parentId ? { parents: [parentId] } : {})
    };

    const folder = await drivePost("/files", body);
    return folder.id;
}

// ── Pastikan folder Serenotes & media sudah ada ──────────
async function ensureFolders() {
    if (!appFolderId) {
        appFolderId = await findOrCreateFolder(APP_FOLDER);
    }
    if (!mediaFolderId) {
        mediaFolderId = await findOrCreateFolder(MEDIA_FOLDER, appFolderId);
    }
}

// ── Cari file JSON di folder Serenotes ───────────────────
async function findFile(filename) {
    await ensureFolders();

    const res = await driveGet("/files", {
        q: `name='${filename}' and '${appFolderId}' in parents and trashed=false`,
        fields: "files(id, name, modifiedTime)",
        spaces: "drive"
    });

    return res.files.length > 0 ? res.files[0] : null;
}

// ── Baca file JSON dari Drive ────────────────────────────
export async function readJSON(filename) {
    const file = await findFile(filename);
    if (!file) return null;

    const res = await fetch(`${DRIVE_API}/files/${file.id}?alt=media`, {
        headers: { Authorization: `Bearer ${await token()}` }
    });

    if (!res.ok) return null;
    return res.json();
}

// ── Tulis / update file JSON ke Drive ───────────────────
export async function writeJSON(filename, data) {
    await ensureFolders();

    const content  = JSON.stringify(data, null, 2);
    const blob     = new Blob([content], { type: "application/json" });
    const existing = await findFile(filename);

    const t = await token();

    if (existing) {
        // Update file yang sudah ada
        const res = await fetch(`${UPLOAD_API}/files/${existing.id}?uploadType=media`, {
            method: "PATCH",
            headers: {
                Authorization: `Bearer ${t}`,
                "Content-Type": "application/json"
            },
            body: blob
        });
        if (!res.ok) throw new Error(`Gagal update ${filename}`);
        return res.json();
    } else {
        // Buat file baru dengan metadata
        const metadata = {
            name: filename,
            parents: [appFolderId],
            mimeType: "application/json"
        };

        const form = new FormData();
        form.append("metadata", new Blob([JSON.stringify(metadata)], { type: "application/json" }));
        form.append("file", blob);

        const res = await fetch(`${UPLOAD_API}/files?uploadType=multipart`, {
            method: "POST",
            headers: { Authorization: `Bearer ${t}` },
            body: form
        });
        if (!res.ok) throw new Error(`Gagal buat ${filename}`);
        return res.json();
    }
}

// ── Upload media file (foto/video/audio) ke Drive ────────
export async function uploadMedia(fileBlob, filename, mimeType) {
    await ensureFolders();

    const t = await token();

    const metadata = {
        name: filename,
        parents: [mediaFolderId],
        mimeType
    };

    const form = new FormData();
    form.append("metadata", new Blob([JSON.stringify(metadata)], { type: "application/json" }));
    form.append("file", fileBlob);

    const res = await fetch(`${UPLOAD_API}/files?uploadType=multipart`, {
        method: "POST",
        headers: { Authorization: `Bearer ${t}` },
        body: form
    });

    if (!res.ok) throw new Error("Gagal upload media");
    return res.json();
}

// ── Download media file dari Drive ───────────────────────
export async function downloadMedia(fileId) {
    const res = await fetch(`${DRIVE_API}/files/${fileId}?alt=media`, {
        headers: { Authorization: `Bearer ${await token()}` }
    });
    if (!res.ok) throw new Error("Gagal download media");
    return res.blob();
}

// ── Hapus file dari Drive ────────────────────────────────
export async function deleteFile(fileId) {
    const res = await fetch(`${DRIVE_API}/files/${fileId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${await token()}` }
    });
    if (!res.ok && res.status !== 404) throw new Error("Gagal hapus file");
}

// ── Sync: load semua data dari Drive ke localStorage ─────
export async function syncFromDrive() {
    const [notes, folders] = await Promise.all([
        readJSON("notes.json"),
        readJSON("folders.json")
    ]);

    if (notes)   localStorage.setItem("serenotes_notes",   JSON.stringify(notes));
    if (folders) localStorage.setItem("serenotes_folders", JSON.stringify(folders));

    return { notes, folders };
}

// ── Sync: push semua data dari localStorage ke Drive ─────
export async function syncToDrive() {
    const notes   = JSON.parse(localStorage.getItem("serenotes_notes")   || "[]");
    const folders = JSON.parse(localStorage.getItem("serenotes_folders") || "[]");

    await Promise.all([
        writeJSON("notes.json",   notes),
        writeJSON("folders.json", folders)
    ]);
}