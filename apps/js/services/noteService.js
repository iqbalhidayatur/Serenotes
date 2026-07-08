const STORAGE_KEY = "serenotes_notes";

/**
 * Mengambil semua notes.
 */
export function getAllNotes() {

    const notes = JSON.parse(
        localStorage.getItem(STORAGE_KEY) || "[]"
    );

    let changed = false;

    notes.forEach(note => {

        if (!note.noteName) {

            note.noteName = note.title || "";

            changed = true;

        }

        if (!note.blocks) {

            note.blocks = [
                {
                    id: crypto.randomUUID(),
                    type: "paragraph",
                    text: note.content || ""
                }
            ];

            delete note.content;

            changed = true;
        }

        if(note.parentId === undefined){

            note.parentId =
                note.folderId || null;

            note.parentType =
                note.folderId
                    ? "folder"
                    : null;

            changed = true;

        }

    });

    if (changed) {
        saveNotes(notes);
    }

    return notes;

}


export function getChildrenNotes(

    parentId = null,

    parentType = null

){

    return getAllNotes().filter(note =>

        (note.parentId || null) === (parentId || null)

        &&

        (note.parentType || null) === (parentType || null)

    );

}

export function moveNote(

    id,

    parentId,

    parentType

){

    return updateNote(id,{

        folderId: parentId,

        parentId,

        parentType

    });

}
/**
 * Menyimpan semua notes ke LocalStorage.
 */
function saveNotes(notes) {

    localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(notes)
    );

}

export function getNotesByFolder(folderId) {

    return getChildrenNotes(

        folderId,

        "folder"

    );

}

export function getNotesByParent(

    parentId,

    parentType

){

    return getChildrenNotes(

        parentId,

        parentType

    );

}

export function getRootNotes(){

    return getChildrenNotes(

        null,

        null

    );

}

export function mergeNote(targetId, blocks) {

    const notes = getAllNotes();

    const index = notes.findIndex(
        note => note.id === targetId
    );

    if (index === -1) return false;

    notes[index].blocks.push(...blocks);

    notes[index].updatedAt =
        new Date().toISOString();

    saveNotes(notes);

    return true;

}

export function hasNotesInFolder(folderId) {

    return getNotesByFolder(folderId).length > 0;

}

/**
 * Simpan seluruh array notes langsung tanpa menyentuh
 * updatedAt masing-masing note. Dipakai untuk operasi
 * massal seperti migrasi folder.
 */
export function saveAllNotes(notes) {

    saveNotes(notes);

}

/**
 * Membuat note baru.
 */
export function createNote(data) {

    const notes = getAllNotes();

    const now = new Date().toISOString();

    const note = {

    id: crypto.randomUUID(),

    noteName:data.noteName || "",

    title:data.title || "",

    blocks: data.blocks || [
        {
            id: crypto.randomUUID(),
            type: "paragraph",
            text: data.content || ""
        }
    ],

    // folderId: id folder tempat note ini "disimpan di dalam".
    // null = tidak berada di dalam folder manapun (root/tanpa folder).
    folderId: data.folderId ?? data.parentId ?? null,

    parentId: data.parentId ?? data.folderId ?? null,

    parentType: data.parentType ?? "folder",

    // category/subcategory dipertahankan sebagai label tampilan saja
    // (disinkronkan otomatis dari nama folder terpilih), supaya
    // halaman lain yang masih membaca note.category tetap jalan.
    category: data.category || "",

    subcategory: data.subcategory || "",

    tags: data.tags || [],

    date: data.date || now,

    createdAt: now,
    updatedAt: now,
    lastOpened: now,

    isPinned: false,

    isArchived: false,

    reminder: data.reminder || {
        enabled:false,
        datetime:""
    },

    checklist:data.checklist || [],

    media:data.media || [],

    // Lokasi saat note dibuat (device geolocation, dengan izin user).
    // null kalau permission ditolak / tidak tersedia / gagal ditangkap.
    location: data.location || null

};

    notes.unshift(note);

    saveNotes(notes);

    return note;

}

/**
 * Mengambil note berdasarkan ID.
 */
export function getNoteById(id) {

    return getAllNotes().find(note =>
        note.id === id
    );

}

/**
 * Update note.
 */
export function updateNote(id, data) {

    const notes = getAllNotes();

    const index = notes.findIndex(note =>
        note.id === id
    );

    if (index === -1) return false;

    if(data.parentId !== undefined){

        data.folderId = data.parentId;

    }

    notes[index] = {

        ...notes[index],

        ...data,

        updatedAt: new Date().toISOString()

    };

    saveNotes(notes);

    return true;

}

/**
 * Hapus note.
 */
export function deleteNote(id) {

    const notes = getAllNotes().filter(note =>
        note.id !== id
    );

    saveNotes(notes);

}

/**
 * Pin note.
 */
export function pinNote(id) {

    return updateNote(id, {

        isPinned: true

    });

}

/**
 * Unpin note.
 */
export function unpinNote(id) {

    return updateNote(id, {

        isPinned: false

    });

}

/**
 * Archive note.
 */
export function archiveNote(id) {

    return updateNote(id, {

        isArchived: true

    });

}

/**
 * Ambil note berdasarkan kategori.
 */
export function getNotesByCategory(category) {

    return getAllNotes().filter(note =>
        note.category === category
    );

}

/**
 * Recent activity.
 */
export function getRecentActivity(limit = 5) {

    return getAllNotes()

        .sort((a, b) =>
            new Date(b.updatedAt) -
            new Date(a.updatedAt)
        )

        .slice(0, limit);

}

/**
 * Featured note.
 * Prioritas:
 * 1. Note yang di-pin
 * 2. Note terbaru
 */
export function getFeaturedNote() {

    const notes = getAllNotes();

    const pinned = notes.find(note =>
        note.isPinned
    );

    if (pinned) return pinned;

    return notes.sort((a, b) =>
        new Date(b.updatedAt) -
        new Date(a.updatedAt)
    )[0] || null;

}

/**
 * Toggle pin.
 */
export function togglePin(id) {

    const note = getNoteById(id);

    if (!note) return false;

    return updateNote(id, {

        isPinned: !note.isPinned

    });

}

/**
 * Toggle archive.
 */
export function toggleArchive(id) {

    const note = getNoteById(id);

    if (!note) return false;

    return updateNote(id, {

        isArchived: !note.isArchived

    });

}

/**
 * Menghapus seluruh note.
 */
export function clearNotes() {

    localStorage.removeItem(STORAGE_KEY);

}

export function saveUpdatedNote(updatedNote){

    const notes = getAllNotes();

    const index = notes.findIndex(note=>

        note.id === updatedNote.id

    );

    if(index === -1){

        return false;

    }

    updatedNote.updatedAt =
        new Date().toISOString();

    notes[index] = updatedNote;

    localStorage.setItem(

        STORAGE_KEY,

        JSON.stringify(notes)

    );

    return true;

}