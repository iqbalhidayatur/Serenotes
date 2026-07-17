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
import { Capacitor } from "@capacitor/core";

const DRIVE_API   = "https://www.googleapis.com/drive/v3";
const UPLOAD_API  = "https://www.googleapis.com/upload/drive/v3";
const APP_FOLDER  = "Serenotes";
const MEDIA_FOLDER = "media";

const KEY_NOTES = "serenotes_notes";
const KEY_FOLDERS = "serenotes_folders";

// Cache ID folder supaya tidak fetch ulang terus
let appFolderId   = null;
let mediaFolderId = null;

// ── Helper: ambil token, refresh kalau perlu ─────────────
async function token() {
    let t = getToken();
    if (!t) t = await requestToken();
    return t;
}

// ── Helper: silent refresh token (re-signIn tanpa popup) ─
async function refreshToken() {
    const isWeb = Capacitor.getPlatform() === "web";

    if (isWeb) {
        // Di web, requestToken() melakukan full redirect ke Google —
        // tidak bisa dipanggil saat sedang di tengah request Drive.
        // Hapus token dan minta user login ulang secara normal.
        localStorage.removeItem("sn_access_token");
        throw new Error("Sesi habis. Silakan login ulang.");
    }

    // Di mobile (Android/iOS), requestToken() bisa silent re-signIn
    try {
        console.log("[drive] Token expired, mencoba refresh...");
        const t = await requestToken();
        console.log("[drive] Token berhasil di-refresh");
        return t;
    } catch (err) {
        localStorage.removeItem("sn_access_token");
        throw new Error("Sesi habis. Silakan login ulang.");
    }
}

// ── Helper: fetch GET dengan auto-retry on 401 ───────────
async function driveGet(url, params = {}) {
    const q = new URLSearchParams(params).toString();
    const fullUrl = `${DRIVE_API}${url}${q ? "?" + q : ""}`;

    let res = await fetch(fullUrl, {
        headers: { Authorization: `Bearer ${await token()}` }
    });

    if (res.status === 401) {
        const t = await refreshToken();
        res = await fetch(fullUrl, {
            headers: { Authorization: `Bearer ${t}` }
        });
    }

    if (!res.ok) throw new Error(`Drive GET error: ${res.status}`);
    return res.json();
}

// ── Helper: fetch POST dengan auto-retry on 401 ──────────
async function drivePost(url, body, params = {}) {
    const q = new URLSearchParams(params).toString();
    const fullUrl = `${DRIVE_API}${url}${q ? "?" + q : ""}`;
    const bodyStr = JSON.stringify(body);

    let res = await fetch(fullUrl, {
        method: "POST",
        headers: { Authorization: `Bearer ${await token()}`, "Content-Type": "application/json" },
        body: bodyStr
    });

    if (res.status === 401) {
        const t = await refreshToken();
        res = await fetch(fullUrl, {
            method: "POST",
            headers: { Authorization: `Bearer ${t}`, "Content-Type": "application/json" },
            body: bodyStr
        });
    }

    if (!res.ok) throw new Error(`Drive POST error: ${res.status}`);
    return res.json();
}

// ── Helper: raw fetch dengan auth + auto-retry on 401 ───
async function driveFetch(url, options = {}) {
    const makeOpts = (t) => ({
        ...options,
        headers: { ...options.headers, Authorization: `Bearer ${t}` }
    });

    let res = await fetch(url, makeOpts(await token()));

    if (res.status === 401) {
        const t = await refreshToken();
        res = await fetch(url, makeOpts(t));
    }

    return res;
}



// ── Cari atau buat folder di Drive ───────────────────────
async function findOrCreateFolder(name, parentId = null) {
    const cacheKey = parentId
        ? `sn_folder_${parentId}_${name}`
        : `sn_folder_root_${name}`;

    // cek cache
    const cached = sessionStorage.getItem(cacheKey);
    if (cached) {
        return cached;
    }

    let query = [
        `name='${name}'`,
        `mimeType='application/vnd.google-apps.folder'`,
        `trashed=false`
    ];

    if (parentId) {
        query.push(`'${parentId}' in parents`);
    }

    const result = await driveGet("/files", {
        q: query.join(" and "),
        fields: "files(id,name,createdTime)",
        orderBy: "createdTime asc",
        pageSize: 1,
        spaces: "drive"
    });

    if (result.files.length) {
        const id = result.files[0].id;
        sessionStorage.setItem(cacheKey, id);
        return id;
    }

    const folder = await drivePost("/files", {
        name,
        mimeType: "application/vnd.google-apps.folder",
        ...(parentId && {
            parents: [parentId]
        })
    });

    sessionStorage.setItem(cacheKey, folder.id);

    return folder.id;
}

// ── Pastikan folder Serenotes & media sudah ada ──────────
async function ensureFolders() {

    if (appFolderId && mediaFolderId) {
        return;
    }

    appFolderId ??= await findOrCreateFolder(APP_FOLDER);

    mediaFolderId ??= await findOrCreateFolder(
        MEDIA_FOLDER,
        appFolderId
    );

}

// ── Cari file JSON di folder Serenotes ───────────────────
const fileCache = new Map();

async function findFile(filename) {
    await ensureFolders();

    if (fileCache.has(filename)) {
        return fileCache.get(filename);
    }

    const cacheKey = `sn_file_${filename}`;
    const cachedId = sessionStorage.getItem(cacheKey);

    if (cachedId) {
        const file = {
            id: cachedId,
            name: filename
        };

        fileCache.set(filename, file);
        return file;
    }

    const result = await driveGet("/files", {
        q: [
            `name='${filename}'`,
            `'${appFolderId}' in parents`,
            `trashed=false`
        ].join(" and "),
        fields: "files(id,name,modifiedTime)",
        orderBy: "modifiedTime desc",
        pageSize: 1,
        spaces: "drive"
    });

    if (!result.files.length) {
        return null;
    }

    const file = result.files[0];

    fileCache.set(filename, file);
    sessionStorage.setItem(cacheKey, file.id);

    return file;
}

const mediaCache = new Map();

export async function findMediaFile(filename) {
    await ensureFolders();

    const res = await driveGet("/files", {
        q: `name='${filename}' and '${mediaFolderId}' in parents and trashed=false`,
        fields: "files(id,name,mimeType)"
    });

    return res.files[0] ?? null;
}

// ── Baca file JSON dari Drive ────────────────────────────
const modifiedCache = new Map();

export async function readJSON(filename) {

    const file = await findFile(filename);

    if (!file) return null;

    const res = await driveFetch(`${DRIVE_API}/files/${file.id}?alt=media`);
    console.log("readJSON", filename, file);

    if (!res.ok) {
        throw new Error(`Read ${filename} gagal (${res.status})`);
    }

    return await res.json();

}

// ── Tulis / update file JSON ke Drive ───────────────────
export async function writeJSON(filename, data) {

    await ensureFolders();

    let file = await findFile(filename);

    const blob = new Blob(
        [
            JSON.stringify(data, null, 2)
        ],
        {
            type: "application/json"
        }
    );

    if (file) {

        const res = await driveFetch(
            `${UPLOAD_API}/files/${file.id}?uploadType=media`,
            {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: blob
            }
        );

        if (!res.ok) {
            throw new Error("Update gagal.");
        }

        modifiedCache.delete(file.id);

        return await res.json();
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

        const res = await driveFetch(`${UPLOAD_API}/files?uploadType=multipart`, {
            method: "POST",
            body: form
        });
        if (!res.ok) throw new Error(`Gagal buat ${filename}`);
        return res.json();
    }
}

// ── Upload media file (foto/video/audio) ke Drive ────────
export async function uploadMedia(fileBlob, filename, mimeType) {

    await ensureFolders();

    const existing = await findMediaFile(filename);

    if (existing) {

        return existing;

    }

    const metadata = {
        name: filename,
        parents: [mediaFolderId],
        mimeType
    };

    const form = new FormData();

    form.append(
        "metadata",
        new Blob(
            [JSON.stringify(metadata)],
            {
                type: "application/json"
            }
        )
    );

    form.append("file", fileBlob);

    const res = await driveFetch(
        `${UPLOAD_API}/files?uploadType=multipart`,
        { method: "POST", body: form }
    );

    if (!res.ok) {
        throw new Error("Upload media gagal.");
    }

    const uploaded = await res.json();

    mediaCache.set(filename, uploaded);

    return uploaded;
}

// ── Download media file dari Drive ───────────────────────
export async function downloadMedia(fileId) {

    const res = await driveFetch(`${DRIVE_API}/files/${fileId}?alt=media`);

    if (!res.ok) {

        throw new Error(
            `Download media gagal (${res.status})`
        );

    }

    return await res.blob();

}

// ── Hapus file dari Drive ────────────────────────────────
export async function deleteFile(fileId) {

    const res = await driveFetch(
        `${DRIVE_API}/files/${fileId}`,
        { method: "DELETE" }
    );

    if (!res.ok && res.status !== 404) {

        throw new Error(
            `Delete gagal (${res.status})`
        );

    }

    for (const [key, value] of mediaCache.entries()) {
        if (value.id === fileId) {
            mediaCache.delete(key);
            break;
        }
    }

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

export async function getModifiedTime(filename) {

    const file = await findFile(filename);

    if (!file) {
        return null;
    }

    const meta = await driveGet(
        `/files/${file.id}`,
        {
            fields: "modifiedTime"
        }
    );

    return meta.modifiedTime;

}