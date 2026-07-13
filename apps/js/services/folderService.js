import {
    getAllNotes,
    saveAllNotes,
    deleteNote
} from "./noteService.js";

const STORAGE_KEY     = "serenotes_folders";
const OLD_CATEGORY_KEY = "serenotes_categories";

const DEFAULT_FOLDERS = [
    { name: "Work",     icon: "bi bi-briefcase", color: "#4F46E5" },
    { name: "Personal", icon: "bi bi-house",     color: "#2563EB" },
    { name: "Ideas",    icon: "bi bi-lightbulb", color: "#10B981" },
    { name: "Archive",  icon: "bi bi-archive",   color: "#6B7280" }
];

initializeFolders();

// ── Init & migration ────────────────────────────────────
function initializeFolders(){

    // Sudah pernah di-setup sebelumnya, tidak perlu migrasi lagi.
    if(localStorage.getItem(STORAGE_KEY)){
        return;
    }

    const folders = [];
    const nameToFolderId = new Map();
    const now = new Date().toISOString();

    const oldRaw = localStorage.getItem(OLD_CATEGORY_KEY);
    let oldCategories = [];

    if(oldRaw){

        try{
            oldCategories = JSON.parse(oldRaw) || [];
        }catch(err){
            oldCategories = [];
        }

    }

    if(oldCategories.length){

        // Migrasi: setiap category lama -> folder root,
        // setiap subcategory lama -> folder anak di dalamnya.
        oldCategories.forEach(category=>{

            const folderId = category.id || crypto.randomUUID();

            folders.push({
                id: folderId,
                name: category.name,
                icon: category.icon || "bi bi-folder",
                color: category.color || "#4F46E5",

                parentId: null,

                parentType: null,

                createdAt: now,
                updatedAt: now
            });

            // NOTE: old migration only deals with folder structure here.
            // Notes are migrated in the separate section below.
            // (Previous code incorrectly referenced an undefined `note`.)

            (category.subcategories || []).forEach(sub=>{

                const subId = sub.id || crypto.randomUUID();

                folders.push({
                    id: subId,
                    name: sub.name,
                    icon: "bi bi-folder",
                    color: category.color || "#4F46E5",

                    parentId: folderId,

                    parentType: "folder",

                    createdAt: now,
                    updatedAt: now
                });

                nameToFolderId.set(
                    `${category.name}>>${sub.name}`,
                    subId
                );

            });

        });

    }else{

        // Instalasi baru, tidak ada data lama sama sekali.
        // Seed folder default supaya tidak kosong melompong.
        DEFAULT_FOLDERS.forEach(def=>{

            const id = crypto.randomUUID();

            folders.push({
                id,
                name: def.name,
                icon: def.icon,
                color: def.color,

                parentId: null,

                parentType: null,

                createdAt: now,
                updatedAt: now
            });

            nameToFolderId.set(def.name, id);

        });

    }

    saveFolders(folders);

    // Migrasi note lama (category/subcategory string) ke folderId.
    const notes = getAllNotes();
    let notesChanged = false;

    notes.forEach(note=>{

        if(note.folderId){
            return;
        }

        let folderId = null;

        if(note.category){

            const comboKey = `${note.category}>>${note.subcategory}`;

            if(note.subcategory && nameToFolderId.has(comboKey)){

                folderId = nameToFolderId.get(comboKey);

            }else if(nameToFolderId.has(note.category)){

                folderId = nameToFolderId.get(note.category);

            }

        }

        note.folderId = folderId;
        notesChanged = true;

    });

    if(notesChanged){
        saveAllNotes(notes);
    }

}

export function getNotesInParent(

    parentId,

    parentType

){

    return getAllNotes().filter(note =>

        (note.parentId || null) === (parentId || null)

        &&

        (note.parentType || null) === (parentType || null)

    );

}

// ── Basic storage ────────────────────────────────────────
export function getNotesInNote(parentNoteId) {
    return getAllNotes().filter(note =>
        (note.parentId || null) === (parentNoteId || null)
        && note.parentType === "note"
    );
}

export function getAllFolders(){

    const folders = JSON.parse(

        localStorage.getItem(STORAGE_KEY)

    ) || [];

    let changed = false;

    folders.forEach(folder=>{

        if(folder.parentType === undefined){

            folder.parentType =

                folder.parentId

                    ? "folder"

                    : null;

            changed = true;

        }

    });

    if(changed){

        saveFolders(folders);

    }

    return folders;

}

// ── Sync hook ────────────────────────────────────────────
function notifyDirty() {
    try {
        import("./syncService.js").then(m => m.markDirty()).catch(() => {});
    } catch (_) {}
}

export function saveFolders(folders){

    localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(folders)
    );

    notifyDirty();

}

export function getFolderById(id){

    if(!id) return null;

    return getAllFolders().find(folder=>
        folder.id === id
    ) || null;

}

// ── CRUD ──────────────────────────────────────────────────
export function createFolder(
    name,
    parentId = null,
    parentType = null,
    icon = "bi bi-folder",
    color = "var(--icon)"
){

    const trimmed = name.trim();

    if(!trimmed) return null;

    const folders = getAllFolders();

    const exists = folders.some(folder =>

        (folder.parentId || null) === (parentId || null)

        &&

        (folder.parentType || null) === (parentType || null)

        &&

        folder.name.toLowerCase() === trimmed.toLowerCase()

    );

    if(exists) return null;

    const now = new Date().toISOString();

    const folder = {
        id: crypto.randomUUID(),
        name: trimmed,
        icon,
        color,

        parentId: parentId || null,

        parentType,

        createdAt: now,
        updatedAt: now
    };

    folders.push(folder);
    saveFolders(folders);

    return folder;

}

export function renameFolder(id, newName){

    const trimmed = newName.trim();

    if(!trimmed) return false;

    const folders = getAllFolders();
    const folder = folders.find(item => item.id === id);

    if(!folder) return false;

    const duplicate = folders.some(item =>

        item.id !== id &&

        (item.parentId || null) === (folder.parentId || null)

        &&

        (item.parentType || null) === (folder.parentType || null)

        &&

        item.name.toLowerCase() === trimmed.toLowerCase()

    );

    if(duplicate) return false;

    folder.name = trimmed;
    folder.updatedAt = new Date().toISOString();

    saveFolders(folders);

    return true;

}

export function updateFolderStyle(id, icon, color){

    const folders = getAllFolders();
    const folder = folders.find(item => item.id === id);

    if(!folder) return false;

    if(icon)  folder.icon  = icon;
    if(color) folder.color = color;

    folder.updatedAt = new Date().toISOString();

    saveFolders(folders);

    return true;

}

/**
 * Pindahkan folder ke parent lain. Mencegah folder
 * dipindah ke dalam dirinya sendiri atau ke dalam
 * salah satu anak turunannya sendiri (siklus).
 */
export function moveFolder(

    id,

    newParentId,

    parentType = null

){

    if(id === newParentId) return false;

    const descendantIds = getDescendantFolderIds(id);

    if(newParentId && descendantIds.includes(newParentId)){
        return false;
    }

    const folders = getAllFolders();
    const folder = folders.find(item => item.id === id);

    if(!folder) return false;

    folder.parentId = newParentId || null;

    folder.parentType = parentType;
    folder.updatedAt = new Date().toISOString();

    saveFolders(folders);

    return true;

}

/**
 * Hapus folder beserta seluruh subfolder & note di
 * dalamnya (cascade), persis seperti menghapus page
 * di Notion akan ikut menghapus semua sub-page-nya.
 */
export function deleteFolder(id){

    const descendantIds = getDescendantFolderIds(id);
    const allIds = [id, ...descendantIds];

    const notes = getAllNotes();

    const notesToDelete = notes.filter(note=>
        allIds.includes(note.folderId)
    );

    notesToDelete.forEach(note=>
        deleteNote(note.id)
    );

    const remainingFolders = getAllFolders().filter(folder=>
        !allIds.includes(folder.id)
    );

    saveFolders(remainingFolders);

    return {
        deletedFolders: allIds.length,
        deletedNotes: notesToDelete.length
    };

}

// ── Tree helpers ──────────────────────────────────────────
export function getChildFolders(

    parentId = null,

    parentType = null

){

    return getAllFolders()
        .filter(folder =>

            (folder.parentId || null) === (parentId || null)

            &&

            (folder.parentType || null) === (parentType || null)

        )
        .filter(folder => folder && typeof folder.name === "string")
        .sort((a, b) =>
            (a.name || "").localeCompare(b.name || "")
        );

}

export function getFoldersByNote(noteId){

    return getChildFolders(

        noteId,

        "note"

    );

}

export function getDescendantFolderIds(folderId){

    const all = getAllFolders();
    const result = [];
    const stack = [folderId];

    while(stack.length){

        const current = stack.pop();

        all
            .filter(folder =>

                folder.parentId === current &&

                folder.parentType === "folder"

            )
            .forEach(child=>{

                result.push(child.id);
                stack.push(child.id);

            });

    }

    return result;

}

/**
 * Breadcrumb dari root sampai folder yang dimaksud (inklusif).
 */
export function getBreadcrumb(folderId){

    const path = [];
    let current = folderId ? getFolderById(folderId) : null;

    while(current){

        path.unshift(current);

        if(

            current.parentType !== "folder"

        ){

            break;

        }

        current = current.parentId

            ? getFolderById(
                current.parentId
            )

            : null;

    }

    return path;

}

/**
 * Daftar semua folder dalam bentuk flat, lengkap dengan
 * depth-nya, urut secara hierarkis. Berguna untuk dropdown
 * / folder picker.
 */
export function getFlatFolderList(){

    const result = [];

    function walk(

        parentId,

        parentType,

        depth

    ){

        getChildFolders(

            parentId,

            parentType

        )

        .forEach(folder=>{

            result.push({

                ...folder,

                depth

            });

            walk(

                folder.id,

                "folder",

                depth+1

            );

        });

    }

    walk(

        null,

        null,

        0

    );

    return result;

}

export function getFlatFoldersByNote(noteId){

    const result = [];

    function walk(parentId, depth){

        getChildFolders(

            parentId,

            parentId === noteId

                ? "note"

                : "folder"

        )

        .forEach(folder=>{

            result.push({

                ...folder,

                depth

            });

            walk(

                folder.id,

                depth+1

            );

        });

    }

    walk(noteId,0);

    return result;

}

export function isFolderInsideNote(folderId){

    const folder =
        getFolderById(folderId);

    if(!folder){

        return false;

    }

    return folder.parentType === "note";

}

// ── Notes in folder ─────────────────────────────────────────
export function getNotesInFolder(folderId = null){

    return getAllNotes().filter(note=>

        (note.parentId || null) === (folderId || null)

        &&

        (note.parentType || null) === "folder"

    );

}

export function getFolderNoteCount(folderId, recursive = true){

    const ids = recursive
        ? [folderId, ...getDescendantFolderIds(folderId)]
        : [folderId];

    return getAllNotes().filter(note =>

        ids.includes(note.parentId)

        &&

        note.parentType === "folder"

    ).length;

}

export function getFolderStats(){

    const folders = getAllFolders();
    const notes = getAllNotes();

    return {
        totalNotes: notes.length,
        totalFolders: folders.length,
        text: `${notes.length} notes across ${folders.length} folders`
    };

}