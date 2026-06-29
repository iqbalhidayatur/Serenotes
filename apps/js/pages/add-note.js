import {
    getCategories,
    getSubcategories,
    addCategory,
    addSubcategory
} from "../services/categoryService.js";

import {
    createNote,
    getNoteById,
    updateNote
} from "../services/noteService.js";

import {
    createReminder
} from "../services/reminderService.js";

import {
    uploadMedia,
    isSupportedMedia
} from "../services/mediaService.js";

// ── State ──────────────────────────────────────────────
const params      = new URLSearchParams(window.location.search);
const noteId      = params.get("id");
let editingNote   = null;
let existingMedia = [];
let newAttachments= [];

// ── DOM refs ───────────────────────────────────────────
const form               = document.getElementById("noteForm");
const titleInput         = document.getElementById("title");
const contentInput       = document.getElementById("content");
const noteDateInput      = document.getElementById("noteDate");
const categorySelect     = document.getElementById("category");
const subcategorySelect  = document.getElementById("subcategory");
const newCategoryInput   = document.getElementById("newCategory");
const newSubcategoryInput= document.getElementById("newSubcategory");
const reminderSwitch     = document.getElementById("reminderSwitch");
const reminderFields     = document.getElementById("reminderFields");
const reminderDate       = document.getElementById("reminderDate");
const attachmentInput    = document.getElementById("attachment");
const attachmentPreview  = document.getElementById("attachmentPreview");

// ── Init ───────────────────────────────────────────────
renderCategories();
setDefaultDateTime();

if (noteId) {
    editingNote   = getNoteById(noteId);
    existingMedia = [...(editingNote?.media || [])];
}

if (editingNote) {
    loadNote();
}

// ── Event listeners ────────────────────────────────────
categorySelect    .addEventListener("change",  handleCategoryChange);
subcategorySelect .addEventListener("change",  handleSubcategoryChange);
newCategoryInput  .addEventListener("keydown", saveNewCategory);
newSubcategoryInput.addEventListener("keydown",saveNewSubcategory);
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

// ── Categories ─────────────────────────────────────────
function renderCategories(selected = null) {
    const categories = getCategories();

    categorySelect.innerHTML = "";

    categories.forEach(category => {
        const opt = document.createElement("option");
        opt.value            = category.id;
        opt.dataset.name     = category.name;
        opt.textContent      = category.name;
        categorySelect.appendChild(opt);
    });

    const customOpt = document.createElement("option");
    customOpt.value       = "custom";
    customOpt.textContent = "+ Add New Category";
    categorySelect.appendChild(customOpt);

    const activeId = selected || (categories[0]?.id ?? null);
    if (activeId) {
        categorySelect.value = activeId;
        renderSubcategories(activeId);
    }
}

function renderSubcategories(categoryId) {
    const subcategories = getSubcategories(categoryId);

    subcategorySelect.innerHTML = "";

    subcategories.forEach(subcategory => {
        const opt = document.createElement("option");
        opt.value       = subcategory.name;
        opt.textContent = subcategory.name;
        subcategorySelect.appendChild(opt);
    });

    const customOpt = document.createElement("option");
    customOpt.value       = "custom";
    customOpt.textContent = "+ Add New Subcategory";
    subcategorySelect.appendChild(customOpt);
}

function handleCategoryChange() {
    if (categorySelect.value === "custom") {
        newCategoryInput.classList.remove("d-none");
        subcategorySelect.classList.add("d-none");
        newSubcategoryInput.classList.remove("d-none");
        subcategorySelect.innerHTML = "";
        return;
    }

    newCategoryInput.classList.add("d-none");
    subcategorySelect.classList.remove("d-none");
    newSubcategoryInput.classList.add("d-none");

    renderSubcategories(categorySelect.value);
}

function handleSubcategoryChange() {
    if (subcategorySelect.value === "custom") {
        newSubcategoryInput.classList.remove("d-none");
        return;
    }
    newSubcategoryInput.classList.add("d-none");
}

function saveNewCategory(event) {
    if (event.key !== "Enter") return;
    event.preventDefault();

    const value = newCategoryInput.value.trim();
    if (!value) return;

    if (!addCategory(value)) {
        alert("Category already exists.");
        return;
    }

    const category = getCategories().find(item => item.name === value);

    renderCategories(category.id);

    newCategoryInput.value = "";
    newCategoryInput.classList.add("d-none");
    subcategorySelect.classList.remove("d-none");

    subcategorySelect.innerHTML = "";
    const opt = document.createElement("option");
    opt.value       = "custom";
    opt.textContent = "+ Add New Subcategory";
    subcategorySelect.appendChild(opt);
    subcategorySelect.value = "custom";
    newSubcategoryInput.classList.remove("d-none");
}

function saveNewSubcategory(event) {
    if (event.key !== "Enter") return;
    event.preventDefault();

    const value = newSubcategoryInput.value.trim();
    if (!value) return;

    if (!addSubcategory(categorySelect.value, value)) {
        alert("Subcategory already exists.");
        return;
    }

    renderSubcategories(categorySelect.value);

    subcategorySelect.value = value;
    newSubcategoryInput.value = "";
    newSubcategoryInput.classList.add("d-none");
}

// ── Reminder ───────────────────────────────────────────
function toggleReminder() {
    if (reminderSwitch.checked) {
        reminderFields.classList.remove("d-none");
        reminderDate.value = noteDateInput.value;
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

    titleInput.value    = editingNote.title   || "";
    contentInput.value  = editingNote.content || "";
    noteDateInput.value = editingNote.date.substring(0, 16);

    const categories = getCategories();
    const category   = categories.find(item => item.name === editingNote.category);

    if (category) {
        categorySelect.value = category.id;
        renderSubcategories(category.id);
        subcategorySelect.value = editingNote.subcategory;
    }

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

    // FIX: safely read category name from selected option's data-name attribute
    const selectedOption  = categorySelect.selectedOptions[0];
    const categoryName    = selectedOption?.dataset.name || selectedOption?.textContent?.trim() || "";

    const noteData = {
        title:      titleInput.value.trim(),
        content:    contentInput.value.trim(),
        category:   categoryName,
        subcategory:subcategorySelect.value === "custom" ? "" : subcategorySelect.value,
        date:       noteDateInput.value,
        reminder:   reminderSwitch.checked
                        ? createReminder(reminderDate.value || noteDateInput.value)
                        : { enabled: false, datetime: "", completed: false, notified: false },
        checklist:  editingNote?.checklist || [],
        media:      uploadedMedia,
        tags:       editingNote?.tags || []
    };

    if (editingNote) {
        updateNote(editingNote.id, noteData);
    } else {
        createNote(noteData);
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
