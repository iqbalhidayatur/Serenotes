import { createNote } from "../services/noteService.js";

const btn     = document.getElementById("btnAddNote");
const overlay = document.getElementById("quickNoteOverlay");
const popup   = document.getElementById("quickNotePopup");
const btnEmpty = document.getElementById("btnQuickEmpty");
const btnForm  = document.getElementById("btnQuickForm");

// ── Open / close ────────────────────────────────────────
function openPopup() {
    overlay.classList.add("show");
    popup.classList.add("show");
}

function closePopup() {
    overlay.classList.remove("show");
    popup.classList.remove("show");
}

btn?.addEventListener("click", openPopup);
overlay?.addEventListener("click", closePopup);

// Swipe down to dismiss
let touchStartY = 0;
popup?.addEventListener("touchstart", e => {
    touchStartY = e.touches[0].clientY;
}, { passive: true });
popup?.addEventListener("touchend", e => {
    if (e.changedTouches[0].clientY - touchStartY > 60) closePopup();
}, { passive: true });

// ── Opsi 1: Note kosong ─────────────────────────────────
btnEmpty?.addEventListener("click", () => {
    closePopup();

    const note = createNote({
        noteName: "",
        blocks: [{ id: crypto.randomUUID(), type: "paragraph", text: "" }]
    });

    window.location.href = `note-detail.html?id=${note.id}`;
});

// ── Opsi 2: Form ────────────────────────────────────────
btnForm?.addEventListener("click", () => {
    closePopup();
    window.location.href = "add-note.html";
});