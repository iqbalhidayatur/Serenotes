import { getAllNotes, deleteNote } from "../services/noteService.js";

const notesContainer = document.getElementById("notesContainer");

// Show greeting if name is set, but do NOT force redirect
const userName = localStorage.getItem("serenotes_user");
const userNameEl = document.getElementById("headerGreeting");
if (userNameEl && userName) {
    userNameEl.textContent = `Hi, ${userName} 👋`;
}

renderNotes();

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

    // Klik card → navigasi ke detail
    const card = event.target.closest(".note-card");
    if (!card) return;
    window.location.href = `note-detail.html?id=${card.dataset.id}`;
});

function renderNotes() {
    const notes = getAllNotes();
    notesContainer.innerHTML = "";

    if (notes.length === 0) {
        notesContainer.innerHTML = `
            <div class="text-center py-5">
                <i class="bi bi-journal-x" style="font-size:4rem;color:#b6b6b6;"></i>
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
        <div class="row notes border border-dark-subtle p-2 rounded-4 mb-3 note-card" data-id="${note.id}">
            <div class="top-card d-flex justify-content-between align-items-center w-100 pt-2">
                <div class="category-card d-flex justify-content-center align-items-center rounded-pill px-3">
                    <h5>${note.category}</h5>
                </div>
                <div class="toggle-card d-flex gap-2 align-items-center">
                    ${note.isPinned
                        ? `<i class="bi bi-star-fill text-warning"></i>`
                        : `<i class="bi bi-star"></i>`}
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
        renderNotes();
    });

    document.getElementById("cancelDelete").addEventListener("click", closeModal);
    modal.querySelector(".modal-backdrop-custom").addEventListener("click", closeModal);
}