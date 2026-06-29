const STORAGE_KEY = "serenotes_notes";

/**
 * Mengambil semua notes.
 */
export function getAllNotes() {

    const notes = localStorage.getItem(STORAGE_KEY);

    return notes ? JSON.parse(notes) : [];

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

/**
 * Membuat note baru.
 */
export function createNote(data) {

    const notes = getAllNotes();

    const now = new Date().toISOString();

    const note = {

        id: crypto.randomUUID(),

        title: data.title || "",

        content: data.content || "",

        category: data.category || "",

        subcategory: data.subcategory || "",

        tags: data.tags || [],

        date: data.date || now,

        updatedAt: now,

        isPinned: false,

        isArchived: false,

        reminder: data.reminder || {

            enabled: false,

            datetime: ""

        },

        checklist: data.checklist || [],

        media: data.media || []

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