import {

    initTheme

} from "../services/themeService.js";

import {
    getFlatFolderList,
    getDescendantFolderIds
} from "../services/folderService.js";

import { rescheduleAllReminders, setupNotificationListener } from "../services/notificationService.js";

// Init notifikasi saat app dibuka
setupNotificationListener();
rescheduleAllReminders();

initTheme();

import { getAllNotes, deleteNote, togglePin } from "../services/noteService.js";

// Back button handler — pakai Capacitor global, bukan ES module import
const { App: CapApp } = window.Capacitor?.Plugins || {};

let backPressedOnce = false;
let backPressTimer  = null;

if (CapApp) {
    CapApp.addListener("backButton", () => {
        if (backPressedOnce) {
            clearTimeout(backPressTimer);
            CapApp.exitApp();
            return;
        }

        backPressedOnce = true;
        showExitToast();

        backPressTimer = setTimeout(() => {
            backPressedOnce = false;
        }, 2000);
    });
}

function showExitToast() {
    const existing = document.getElementById("exitToast");
    if (existing) existing.remove();

    const toast = document.createElement("div");
    toast.id = "exitToast";
    toast.textContent = "Press back again to exit";
    toast.style.cssText = `
        position: fixed;
        bottom: 90px;
        left: 50%;
        transform: translateX(-50%);
        background: rgba(0,0,0,0.75);
        color: #fff;
        padding: 10px 20px;
        border-radius: 20px;
        font-size: 14px;
        z-index: 9999;
        pointer-events: none;
        animation: fadeInOut 2s forwards;
    `;

    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 2000);
}

const notesContainer = document.getElementById("notesContainer");
const filterFolder = document.getElementById("filterFolder");
const applyFilter = document.getElementById("applyFilter");
const resetFilter = document.getElementById("resetFilter");

const filterTag = document.getElementById("filterTag");

const startDate = document.getElementById("filterStartDate");
const endDate = document.getElementById("filterEndDate");
// Show greeting if name is set, but do NOT force redirect
const userName = localStorage.getItem("serenotes_user");
const userNameEl = document.getElementById("headerGreeting");

const overlay = document.getElementById("filterOverlay");
const popup = document.getElementById("filterPopup");

const openBtn = document.getElementById("btnFilter");
const closeBtn = document.getElementById("closeFilter");

const recentContainer =
document.getElementById("recentContainer");

function closePopup(){
    overlay.classList.remove("show");
    popup.classList.remove("show");
}

if (userNameEl && userName) {
    userNameEl.textContent = `Hi, ${userName} 👋`;
}

renderRecentNotes();
renderNotes();

openBtn.addEventListener("click", () => {
    overlay.classList.add("show");
    popup.classList.add("show");
});

closeBtn.addEventListener("click", closePopup);
overlay.addEventListener("click", closePopup);

document.addEventListener("click", (event) => {
    // Klik tombol delete
    const deleteBtn = event.target.closest(".btn-delete-note");
    if (deleteBtn) {
        event.stopPropagation();
        const id    = deleteBtn.dataset.id;
        const title = deleteBtn.dataset.title;
        showDeleteModal(id, title);
        return;
    }

    // Klik star — toggle pin
    const starBtn = event.target.closest(".btn-star-note");
    if (starBtn) {
        event.stopPropagation();
        togglePin(starBtn.dataset.id);
        renderRecentNotes();
        renderNotes();
        return;
    }

    // Klik card → navigasi ke detail
    const card = event.target.closest(".note-card");
    if (!card) return;
    window.location.href = `note-detail.html?id=${card.dataset.id}`;
});

function renderNotes(notes = getAllNotes()) {

    notes = notes.sort((a, b) => {
        if (a.isPinned && !b.isPinned) return -1;
        if (!a.isPinned && b.isPinned) return 1;
        return new Date(b.date) - new Date(a.date);
    });

    notesContainer.innerHTML = "";

    if (notes.length === 0) {
        notesContainer.innerHTML = `
            <div class="text-center py-5">
                <i class="bi bi-journal-x" style="font-size:4rem;color:var(--text-primary);"></i>
                <h4 class="mt-3">No Notes Yet</h4>
                <p>Create your first note.</p>
            </div>
        `;
        return;
    }

    notes.forEach(note => {
        notesContainer.innerHTML += createCard(note);
    });
}

function createCard(note) {
    return `
        <div class="row notes p-2 rounded-4 mb-3 note-card" data-id="${note.id}">
            <div class="top-card d-flex justify-content-between align-items-center w-100 pt-2">
                <div class="category-card d-flex justify-content-center align-items-center rounded-pill px-3">
                    <h5 class="pt-2">${note.category}</h5>
                </div>
                <div class="toggle-card d-flex gap-2 align-items-center">
                    <button class="btn-star-note" data-id="${note.id}" title="Pin note">
                        <i class="bi ${note.isPinned ? 'bi-pin-fill text-danger' : 'bi-pin-fill text-secondary'}"></i>
                    </button>
                    <button
                        class="btn-delete-note"
                        data-id="${note.id}"
                        data-title="${(note.title || '').replace(/"/g, '&quot;')}"
                        title="Delete note"
                    >
                        <i class="bi bi-trash3"></i>
                    </button>
                </div>
            </div>
            <div class="card-content pt-3">
                <h4>${note.title ? note.title : (note.content || "").substring(0, 30) + "..."}</h4>
                <p>${truncate(note.content)}</p>
            </div>
            <div class="card-date pb-2">
                <i class="bi bi-clock"></i>
                <span>${formatDate(note.date)}</span>
                ${note.reminder?.enabled && !note.reminder?.completed ? `
                    <span class="ms-2 text-warning" title="Reminder: ${formatDate(note.reminder.datetime)}">
                        <i class="bi bi-bell-fill"></i>
                        <small>${formatDate(note.reminder.datetime)}</small>
                    </span>
                ` : ""}
            </div>
        </div>
    `;
}

function truncate(text) {
    if (!text) return "";
    return text.length > 120 ? text.substring(0, 120) + "..." : text;
}

function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleString("en-US", {
        day: "2-digit", month: "short", year: "numeric",
        hour: "2-digit", minute: "2-digit"
    });
}

function showDeleteModal(id, title) {
    // Hapus modal lama kalau ada
    document.getElementById("deleteNoteModal")?.remove();

    const modal = document.createElement("div");
    modal.id = "deleteNoteModal";
    modal.innerHTML = `
        <div class="modal-backdrop-custom"></div>
        <div class="modal-sheet">
            <div class="modal-sheet-handle"></div>
            <i class="bi bi-trash3 modal-sheet-icon"></i>
            <h5>Delete Note?</h5>
            <p>"${title || "This note"}" will be permanently deleted.</p>
            <button id="confirmDelete" class="btn btn-danger w-100 rounded-4 mb-2">Delete</button>
            <button id="cancelDelete" class="btn btn-light w-100 rounded-4">Cancel</button>
        </div>
    `;
    document.body.appendChild(modal);

    // Animasi masuk
    requestAnimationFrame(() => modal.classList.add("show"));

    function closeModal() {
        modal.classList.remove("show");
        setTimeout(() => modal.remove(), 300);
    }

    document.getElementById("confirmDelete").addEventListener("click", () => {
        deleteNote(id);
        closeModal();
        renderRecentNotes();
        renderNotes();
    });

    document.getElementById("cancelDelete").addEventListener("click", closeModal);
    modal.querySelector(".modal-backdrop-custom").addEventListener("click", closeModal);
}

renderFilterFolders();

function renderFilterFolders(){

    const folders = getFlatFolderList();

    filterFolder.innerHTML = `
        <option value="">All Folders</option>
    `;

    folders.forEach(folder=>{

        filterFolder.innerHTML += `
            <option value="${folder.id}">
                ${"— ".repeat(folder.depth)}${folder.name}
            </option>
        `;

    });

}

function renderFilterTags() {
    if (!filterTag) return;
    const allTags = [...new Set(
        getAllNotes().flatMap(n => n.tags || [])
    )].sort();

    filterTag.innerHTML = `<option value="">All Tags</option>`;
    allTags.forEach(tag => {
        filterTag.innerHTML += `<option value="${tag}">#${tag}</option>`;
    });
}

renderFilterTags();

applyFilter.addEventListener("click", () => {

    let notes = getAllNotes();

    if (filterFolder.value) {

        // Termasuk note di dalam subfolder-subfolder-nya juga,
        // persis seperti membuka folder di Notion.
        const includedIds = [
            filterFolder.value,
            ...getDescendantFolderIds(filterFolder.value)
        ];

        notes = notes.filter(note =>
            includedIds.includes(note.folderId)
        );

    }

    if (startDate.value) {
        notes = notes.filter(note =>
            new Date(note.date) >= new Date(startDate.value)
        );
    }

    if (endDate.value) {
        const end = new Date(endDate.value);
        end.setHours(23, 59, 59, 999);

        notes = notes.filter(note =>
            new Date(note.date) <= end
        );
    }

    if (filterTag.value) {
        notes = notes.filter(note =>
            (note.tags || []).includes(filterTag.value)
        );
    }

    notes.sort((a, b) => {
        if (a.isPinned && !b.isPinned) return -1;
        if (!a.isPinned && b.isPinned) return 1;
        return new Date(b.date) - new Date(a.date);
    });

    renderNotes(notes);

    closePopup();
});

resetFilter.addEventListener("click", ()=>{

    startDate.value = "";
    endDate.value = "";

    filterFolder.value = "";

    if (filterTag) filterTag.value = "";

    renderNotes();

    closePopup();

});

function renderRecentNotes() {

    const notes = getAllNotes()
        .sort((a, b) =>
            new Date(b.lastOpened || b.updatedAt || b.date) -
            new Date(a.lastOpened || a.updatedAt || a.date)
        )
        .slice(0, 7);

    recentContainer.innerHTML = "";

    notes.forEach(note => {

        recentContainer.innerHTML += `
            <div class="recent-card note-card" data-id="${note.id}">

                <span class="recent-category">
                    ${note.category}
                </span>

                <div class="recent-title">
                    ${note.title}
                </div>

                <div class="recent-date">
                    ${formatDate(note.lastOpened || note.updatedAt || note.date)}
                </div>

            </div>
        `;

    });

}