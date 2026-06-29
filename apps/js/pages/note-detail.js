import {
    getNoteById,
    deleteNote
} from "../services/noteService.js";

import {

    getMedia

} from "../services/mediaService.js";

const checklistSection = document.getElementById("checklistSection");
const mediaSection = document.getElementById("mediaSection");
const reminderSection = document.getElementById("reminderSection");
const voiceCard = document.getElementById("voiceCard");

const params = new URLSearchParams(window.location.search);

const noteId = params.get("id");

const note = getNoteById(noteId);

const categoryBadge = document.getElementById("categoryBadge");
const noteTitle = document.getElementById("noteTitle");
const noteDate = document.getElementById("noteDate");
const noteContent = document.getElementById("noteContent");

const checklistContainer = document.getElementById("checklistContainer");
const mediaContainer = document.getElementById("mediaContainer");
const reminderContainer = document.getElementById("reminderContainer");

const editBtn = document.getElementById("editBtn");
const deleteBtn = document.getElementById("deleteBtn");

if (!note) {

    document.querySelector("main").innerHTML = `
        <div class="text-center py-5">

            <i
                class="bi bi-journal-x"
                style="
                    font-size:4rem;
                    color:#9ca3af;
                "
            ></i>

            <h3 class="mt-3">
                Note not found
            </h3>

        </div>
    `;

    throw new Error("Note not found");

}

renderNote();

editBtn.addEventListener("click", () => {

    window.location.href =
        `add-note.html?id=${note.id}`;

});

deleteBtn.addEventListener("click", () => {

    const confirmDelete = confirm(
        "Delete this note?"
    );

    if (!confirmDelete) return;

    deleteNote(note.id);

    window.location.href = "dashboard.html";

});

async function renderNote() {

    categoryBadge.textContent = note.category;

    noteTitle.textContent = note.title;

    noteContent.textContent = note.content || "";

    noteDate.textContent = formatDate(note.date);

    renderVoiceNote();

    renderChecklist();

    await renderMedia();

    renderReminder();

}

function renderChecklist() {

    checklistContainer.innerHTML = "";

    if (!note.checklist || note.checklist.length === 0) {

        checklistSection.style.display = "none";

        return;

    }

    checklistSection.style.display = "block";

    note.checklist.forEach(item => {

        checklistContainer.innerHTML += `

            <label class="check-item">

                <input
                    type="checkbox"
                    disabled
                    ${item.checked ? "checked" : ""}
                >

                <span>

                    ${item.text}

                </span>

            </label>

        `;

    });

}

async function renderMedia() {

    mediaContainer.innerHTML = "";

    if (!note.media || note.media.length === 0) {

        mediaSection.style.display = "none";

        return;

    }

    mediaSection.style.display = "block";

    for (const media of note.media) {

        const data = await getMedia(media.refId);

        if (!data) continue;

        const url = URL.createObjectURL(data.file);

        if (media.type === "photo" || media.type === "gif") {

            mediaContainer.innerHTML += `

                <div class="attachment-card mb-3">

                    <img
                        src="${url}"
                        class="img-fluid rounded-4 w-100"
                    >

                    <div class="attachment-info">

                        <div>

                            <strong>

                                ${media.filename}

                            </strong>

                            <br>

                            <small>

                                ${formatFileSize(media.size)}

                            </small>

                        </div>

                    </div>

                </div>

            `;

        }

        else if (media.type === "video") {

            mediaContainer.innerHTML += `

                <div class="attachment-card mb-3">

                    <video
                        controls
                        class="w-100 rounded-4"
                    >

                        <source
                            src="${url}"
                            type="${media.mimeType}"
                        >

                    </video>

                    <div class="attachment-info">

                        <strong>

                            ${media.filename}

                        </strong>

                    </div>

                </div>

            `;

        }

        else if (media.type === "voice") {

            mediaContainer.innerHTML += `

                <div class="attachment-card mb-3">

                    <audio
                        controls
                        class="w-100"
                    >

                        <source
                            src="${url}"
                            type="${media.mimeType}"
                        >

                    </audio>

                    <div class="attachment-info">

                        <strong>

                            ${media.filename}

                        </strong>

                    </div>

                </div>

            `;

        }

    }

}

function renderReminder() {

    reminderContainer.innerHTML = "";

    if (
        !note.reminder ||
        !note.reminder.enabled
    ) {

        reminderSection.style.display = "none";

        return;

    }

    reminderSection.style.display = "block";

    reminderContainer.innerHTML = `

        <div class="d-flex align-items-center gap-2">

            <i class="bi bi-bell-fill text-warning"></i>

            <span>

                ${formatDate(note.reminder.datetime)}

            </span>

        </div>

    `;

}

function formatDate(dateString) {

    const date = new Date(dateString);

    return date.toLocaleString("en-US", {

        day: "2-digit",

        month: "short",

        year: "numeric",

        hour: "2-digit",

        minute: "2-digit"

    });

}

function renderVoiceNote() {

    if (!voiceCard) return;

    if (
        !note.media ||
        !note.media.some(media => media.type === "voice")
    ) {

        voiceCard.style.display = "none";

        return;

    }

    voiceCard.style.display = "block";

}

function formatFileSize(bytes) {

    if (bytes < 1024) {

        return bytes + " B";

    }

    if (bytes < 1024 * 1024) {

        return (bytes / 1024).toFixed(1) + " KB";

    }

    return (bytes / (1024 * 1024)).toFixed(1) + " MB";

}