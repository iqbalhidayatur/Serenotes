import {

    initTheme

} from "../services/themeService.js";

initTheme();

import {
    getChildFolders,
    getBreadcrumb,
    getFolderById,
    createFolder
} from "../services/folderService.js";

import {
    createNote,
    getNoteById,
    getNotesByFolder,
    mergeNote,
    updateNote
} from "../services/noteService.js";

import {
    createReminder
} from "../services/reminderService.js";

import {
    uploadMedia,
    isSupportedMedia
} from "../services/mediaService.js";

import { scheduleReminderNotification, cancelReminderNotification } from "../services/notificationService.js";

// ── State ──────────────────────────────────────────────
const { App: CapApp } = window.Capacitor?.Plugins || {};

if (CapApp) {
    CapApp.addListener("backButton", ({ canGoBack }) => {
        if (canGoBack) window.history.back();
        else window.location.href = "dashboard.html";
    });
}

const params      = new URLSearchParams(window.location.search);
const noteId      = params.get("id");
const urlParentId   = params.get("parentId");
const urlParentType = params.get("parentType");
let editingNote   = null;
let existingMedia = [];
let newAttachments= [];

let selectedFolderId = null;

let currentLocation = {

    parentId: null,

    parentType: null

};

// ── DOM refs ───────────────────────────────────────────
const form               = document.getElementById("noteForm");
const titleInput         = document.getElementById("title");
const contentInput       = document.getElementById("content");
const noteDateInput      = document.getElementById("noteDate");
const folderPickerBtn    = document.getElementById("folderPickerBtn");
const folderPickerLabel  = document.getElementById("folderPickerLabel");
const folderBreadcrumb   = document.getElementById("folderBreadcrumb");
const folderPickerList   = document.getElementById("folderPickerList");
const chooseNoFolderBtn  = document.getElementById("chooseNoFolderBtn");
const chooseThisFolderBtn= document.getElementById("chooseThisFolderBtn");
const newFolderInline    = document.getElementById("newFolderInline");
const newFolderInlineBtn = document.getElementById("newFolderInlineBtn");
const folderPickerModal  = new bootstrap.Modal(
    document.getElementById("folderPickerModal")
);
const reminderSwitch     = document.getElementById("reminderSwitch");
const reminderFields     = document.getElementById("reminderFields");
const reminderDate       = document.getElementById("reminderDate");
const attachmentInput    = document.getElementById("attachment");
const attachmentPreview  = document.getElementById("attachmentPreview");
const noteNameInput =
document.getElementById("noteName");

const noteSelect =
document.getElementById("noteSelect");

const btnNewNote =
document.getElementById("btnNewNote");

const btnCancelNewNote =
document.getElementById("btnCancelNewNote");

// ── Init ───────────────────────────────────────────────
setDefaultDateTime();

if (urlParentId && !noteId) {

    const parentNote = getNoteById(urlParentId);

    selectedFolderId = null;

    currentLocation = {
        parentId: urlParentId,
        parentType: urlParentType || "note"
    };

    if (parentNote) {
        folderPickerLabel.innerHTML = `<i class="bi bi-file-earmark me-2"></i>${parentNote.noteName || parentNote.title || "Note"}`;
        folderPickerBtn.disabled = true;
    }

} else {

    restoreLastContext();

}

if (noteId) {
    editingNote   = getNoteById(noteId);
    existingMedia = [...(editingNote?.media || [])];
}

if (editingNote) {
    loadNote();
    refreshNoteNameUI();
}

// ── Event listeners ────────────────────────────────────
folderPickerBtn    .addEventListener("click", openFolderPicker);
chooseNoFolderBtn  .addEventListener("click", chooseNoFolder);
chooseThisFolderBtn.addEventListener("click", chooseCurrentFolder);
newFolderInlineBtn .addEventListener("click", createInlineFolder);
newFolderInline    .addEventListener("keydown", event=>{
    if (event.key === "Enter") {
        event.preventDefault();
        createInlineFolder();
    }
});
reminderSwitch    .addEventListener("change",  toggleReminder);
form              .addEventListener("submit",  handleSubmit);

// FIX: handleAttachment was referenced but never defined — added here
attachmentInput.addEventListener("change", handleAttachment);

function handleAttachment(event) {
    const files = Array.from(event.target.files);

    files.forEach(file => {
        if (!isSupportedMedia(file)) {
            alert(`"${file.name}" is not supported. Only images, videos, and audio are allowed.`);
            return;
        }
        newAttachments.push(file);
    });

    // Reset input so same file can be re-selected if needed
    attachmentInput.value = "";

    renderAttachmentPreview();
}

// ── Render ─────────────────────────────────────────────
function renderAttachmentPreview() {
    attachmentPreview.innerHTML = "";

    existingMedia.forEach((media, index) => {
        attachmentPreview.innerHTML += `
            <div class="attachment-item">
                <div class="attachment-info">
                    <i class="${getIcon(media.mimeType)}"></i>
                    <div>
                        <div class="attachment-name">${media.filename}</div>
                        <div class="attachment-size">${formatFileSize(media.size)}</div>
                    </div>
                </div>
                <button class="btn-remove" type="button" data-existing="${index}">
                    <i class="bi bi-x"></i>
                </button>
            </div>
        `;
    });

    newAttachments.forEach((file, index) => {
        attachmentPreview.innerHTML += `
            <div class="attachment-item">
                <div class="attachment-info">
                    <i class="${getIcon(file.type)}"></i>
                    <div>
                        <div class="attachment-name">${file.name}</div>
                        <div class="attachment-size">${formatFileSize(file.size)}</div>
                    </div>
                </div>
                <button class="btn-remove" type="button" data-new="${index}">
                    <i class="bi bi-x"></i>
                </button>
            </div>
        `;
    });

    bindAttachmentEvents();
}

function bindAttachmentEvents() {
    attachmentPreview.querySelectorAll(".btn-remove").forEach(button => {
        button.addEventListener("click", () => {
            const existingIdx = button.dataset.existing;
            const newIdx      = button.dataset.new;

            if (existingIdx !== undefined) {
                existingMedia.splice(Number(existingIdx), 1);
            }
            if (newIdx !== undefined) {
                newAttachments.splice(Number(newIdx), 1);
            }

            renderAttachmentPreview();
        });
    });
}

// ── Folder picker ────────────────────────────────────────
function openFolderPicker() {
    const current = selectedFolderId
        ? getFolderById(selectedFolderId)
        : null;

    currentLocation = current
        ? { parentId: current.id, parentType: "folder" }
        : { parentId: null, parentType: null };

    renderFolderPicker();
    folderPickerModal.show();
}

function restoreLastContext(){

    const last = getLastContext();

    if(!last) return;

    const note = getNoteById(last.noteId);

    if(!note){

        localStorage.removeItem(
            "serenotes_last_context"
        );

        return;

    }

    selectedFolderId = last.folderId;

    const folder = getFolderById(selectedFolderId);

    currentLocation = {

        parentId: selectedFolderId,

        parentType: folder
            ? folder.parentType
            : null

    };

    updateFolderPickerLabel();

    refreshNoteNameUI();

    requestAnimationFrame(() => {

        noteSelect.value = last.noteId;

    });

}

function refreshNoteNameUI() {

    noteSelect.innerHTML = "";

    if (!selectedFolderId) {

        noteNameInput.classList.remove("d-none");

        noteSelect.classList.add("d-none");

        btnNewNote.classList.add("d-none");

        btnCancelNewNote.classList.add("d-none");

        return;

    }

    const notes =
        getNotesByFolder(selectedFolderId);

    if (notes.length === 0) {

        noteNameInput.classList.remove("d-none");

        noteSelect.classList.add("d-none");

        btnNewNote.classList.add("d-none");

        btnCancelNewNote.classList.add("d-none");

        return;

    }

    notes.forEach(note => {

        noteSelect.innerHTML += `

            <option value="${note.id}">

                ${note.noteName}

            </option>

        `;

    });

    noteNameInput.classList.add("d-none");

    noteSelect.classList.remove("d-none");

    btnNewNote.classList.remove("d-none");

    btnCancelNewNote.classList.add("d-none");

}

btnNewNote.addEventListener("click", () => {

    noteSelect.classList.add("d-none");

    btnNewNote.classList.add("d-none");

    noteNameInput.classList.remove("d-none");

    btnCancelNewNote.classList.remove("d-none");

    noteNameInput.value = "";

    noteNameInput.focus();

    saveLastContext(

    selectedFolderId,

    null

);

});

btnCancelNewNote.addEventListener("click", () => {

    noteNameInput.classList.add("d-none");

    btnCancelNewNote.classList.add("d-none");

    noteSelect.classList.remove("d-none");

    btnNewNote.classList.remove("d-none");

});

function renderFolderPicker() {
    // Breadcrumb
    const path = getBreadcrumb(
        currentLocation.parentId
    );

    folderBreadcrumb.innerHTML = `
        <li class="breadcrumb-item">
            <a href="#" data-nav="root">
                <i class="bi bi-house"></i>
            </a>
        </li>
        ${path.map(folder => `
            <li class="breadcrumb-item">
                <a href="#" data-nav="${folder.id}">
                    ${folder.name}
                </a>
            </li>
        `).join("")}
    `;

    folderBreadcrumb.querySelectorAll("[data-nav]").forEach(link => {
        link.addEventListener("click", event => {
            event.preventDefault();
            if (link.dataset.nav === "root") {
                currentLocation = { parentId: null, parentType: null };
            } else {
                const folder = getFolderById(link.dataset.nav);
                if (!folder) return;
                currentLocation = { parentId: folder.id, parentType: "folder" };
            }
            renderFolderPicker();
        });
    });

    // Daftar subfolder di level ini
    const children = getChildFolders(
    currentLocation.parentId,
    currentLocation.parentType
)

    folderPickerList.innerHTML = children.length
        ? children.map(folder => `
            <button
                type="button"
                class="folder-picker-item"
                data-id="${folder.id}"
            >
                <i class="${folder.icon || "bi bi-folder"}" style="color:${folder.color || "#4F46E5"}"></i>
                <span>${folder.name}</span>
                <i class="bi bi-chevron-right ms-auto"></i>
            </button>
        `).join("")
        : `<div class="text-muted small py-2">No subfolders here.</div>`;

    folderPickerList.querySelectorAll("[data-id]").forEach(item => {
        item.addEventListener("click", () => {
            const folder = getFolderById(item.dataset.id);
            if (!folder) return;

            currentLocation = {
                parentId: folder.id,
                parentType: "folder"
            };

            renderFolderPicker();
        });
    });

    newFolderInline.value = "";
}

function createInlineFolder() {
    const value = newFolderInline.value.trim();
    if (!value) return;

    const folder =
    createFolder(
        value,
        currentLocation.parentId,
        currentLocation.parentType
    )

    if (!folder) {
        alert("A folder with that name already exists here.");
        return;
    }

    // Langsung masuk ke folder baru yang dibuat
    currentLocation = {
        parentId: folder.id,
        parentType: "folder"
    };

    renderFolderPicker();
}

function chooseNoFolder() {
    selectedFolderId = null;
    currentLocation = {
        parentId: null,
        parentType: null
    };
    updateFolderPickerLabel();
    folderPickerModal.hide();
    refreshNoteNameUI();
}

function chooseCurrentFolder(){

    selectedFolderId = currentLocation.parentId;

    updateFolderPickerLabel();

    refreshNoteNameUI();

    folderPickerModal.hide();

}

function updateFolderPickerLabel() {
    if (!selectedFolderId) {
        folderPickerLabel.innerHTML =
            `<i class="bi bi-file-earmark me-2"></i>No Folder`;
        return;
    }

    const path = getBreadcrumb(selectedFolderId);
    const pathText = path.map(folder => folder.name).join(" / ");

    folderPickerLabel.innerHTML =
        `<i class="bi bi-folder2-open me-2"></i>${pathText}`;
}

// ── Reminder ───────────────────────────────────────────
function toggleReminder() {
    if (reminderSwitch.checked) {
        reminderFields.classList.remove("d-none");
        // Set default ke waktu note + 1 jam kalau belum diisi
        if (!reminderDate.value) {
            const defaultTime = noteDateInput.value
                ? new Date(new Date(noteDateInput.value).getTime() + 60 * 60 * 1000)
                : new Date(Date.now() + 60 * 60 * 1000);
            const pad = n => String(n).padStart(2, "0");
            reminderDate.value = `${defaultTime.getFullYear()}-${pad(defaultTime.getMonth()+1)}-${pad(defaultTime.getDate())}T${pad(defaultTime.getHours())}:${pad(defaultTime.getMinutes())}`;
        }
    } else {
        reminderFields.classList.add("d-none");
        reminderDate.value = "";
    }
}

// ── Date ───────────────────────────────────────────────
function setDefaultDateTime() {
    const now    = new Date();
    const pad    = n => String(n).padStart(2, "0");
    noteDateInput.value =
        `${now.getFullYear()}-${pad(now.getMonth()+1)}-${pad(now.getDate())}T${pad(now.getHours())}:${pad(now.getMinutes())}`;
}

// ── Load existing note (edit mode) ─────────────────────
function loadNote() {
    document.title = "Edit Note | Serenotes";
    document.getElementById("pageTitle").textContent    = "Edit Note";
    document.getElementById("headerSaveBtn").textContent= "Update";
    document.getElementById("bottomSaveBtn").textContent= "Update Note";

    noteNameInput.value = editingNote.noteName || "";
    titleInput.value    = editingNote.title   || "";
    contentInput.value =
        editingNote.blocks
            ?.map(block => block.text)
            .join("\n\n") || "";
    noteDateInput.value = editingNote.date.substring(0, 16);

    selectedFolderId = editingNote.folderId || null;
    updateFolderPickerLabel();

    const folder = getFolderById(selectedFolderId);

    currentLocation = {

        parentId: selectedFolderId,

        parentType: folder
            ? folder.parentType
            : null

    };

    if (editingNote.reminder?.enabled) {
        reminderSwitch.checked = true;
        reminderFields.classList.remove("d-none");
        reminderDate.value = editingNote.reminder.datetime.substring(0, 16);
    }

    renderAttachmentPreview();
}

// ── Submit ─────────────────────────────────────────────
async function handleSubmit(event) {
    event.preventDefault();

    // Upload new attachments
    const uploadedMedia = [...existingMedia];

    for (const file of newAttachments) {
        try {
            const media = await uploadMedia(file);
            uploadedMedia.push(media);
        } catch (err) {
            alert(`Failed to upload "${file.name}": ${err.message}`);
            return;
        }
    }

    // Nama folder terpilih (leaf) dipakai sebagai label
    // category lama, supaya halaman lain (calendar, search,
    // reminder, badge di note-detail) tetap tampil normal.
    const selectedFolder = selectedFolderId
        ? getFolderById(selectedFolderId)
        : null;

    const noteName = noteNameInput.classList.contains("d-none")
    ? getNoteById(noteSelect.value)?.noteName || ""
    : noteNameInput.value.trim();

    // Buat media blocks dari uploaded media
    const mediaBlocks = uploadedMedia.map(media => ({
        id:       crypto.randomUUID(),
        type:     "media",
        text:     "",
        mediaIds: JSON.stringify([media.refId || media.id])
    }));

    const noteData = {
        noteName: noteName,
        title:      titleInput.value.trim(),
        blocks: [
            {
                id: crypto.randomUUID(),
                type: "section",
                text: titleInput.value.trim()
            },
            {
                id: crypto.randomUUID(),
                type: "paragraph",
                text: contentInput.value.trim()
            },
            ...mediaBlocks
        ],
        folderId:    selectedFolderId ?? null,
        parentId:    selectedFolderId ?? currentLocation.parentId ?? null,
        parentType:  selectedFolderId
                        ? "folder"
                        : (currentLocation.parentType ?? null),
        category:   selectedFolder?.name || "",
        subcategory:"",
        date:       noteDateInput.value,
        reminder: (() => {
            if (reminderSwitch.checked && reminderDate.value) {
                return {
                    enabled:   true,
                    datetime:  reminderDate.value,
                    completed: false,
                    notified:  false,
                    createdAt: new Date().toISOString()
                };
            }
            return { enabled: false, datetime: "", completed: false, notified: false };
        })(),
        checklist:  editingNote?.checklist || [],
        media:      uploadedMedia,
        tags:       editingNote?.tags || []
    };

    // DEBUG — hapus setelah masalah ditemukan
    console.log("reminderSwitch.checked:", reminderSwitch.checked);
    console.log("reminderDate.value:", reminderDate.value);
    console.log("noteData.reminder:", JSON.stringify(noteData.reminder));

    if (editingNote) {
        updateNote(editingNote.id, noteData);
        saveLastContext(selectedFolderId, editingNote.id);

        // Cancel notif lama, schedule ulang kalau ada reminder baru
        await cancelReminderNotification(editingNote.id);
        if (noteData.reminder?.enabled) {
            await scheduleReminderNotification({
                ...editingNote,
                ...noteData
            });
        }

    // SESUDAH
    } else if (noteNameInput.classList.contains("d-none")) {
        mergeNote(
            noteSelect.value,
            noteData.blocks
        );
        saveLastContext(selectedFolderId, noteSelect.value);

    } else {
        const newNote = createNote(noteData);
        saveLastContext(selectedFolderId, newNote.id);

        // Schedule notifikasi untuk note baru
        if (noteData.reminder?.enabled) {
            await scheduleReminderNotification(newNote);
        }
    }

    window.location.href = "dashboard.html";
}

// ── Helpers ────────────────────────────────────────────
function getIcon(type) {
    if (type.startsWith("image/")) return "bi bi-image";
    if (type.startsWith("video/")) return "bi bi-camera-video";
    if (type.startsWith("audio/")) return "bi bi-mic-fill";
    return "bi bi-paperclip";
}

function formatFileSize(bytes) {
    if (bytes < 1024)        return bytes + " B";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
    return (bytes / (1024 * 1024)).toFixed(1) + " MB";
}

function saveLastContext(folderId, noteId){

    localStorage.setItem(

        "serenotes_last_context",

        JSON.stringify({

            folderId,

            noteId

        })

    );

}

function getLastContext(){

    return JSON.parse(

        localStorage.getItem(

            "serenotes_last_context"

        ) || "null"

    );

}