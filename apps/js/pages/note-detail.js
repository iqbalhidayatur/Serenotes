import {

    initTheme

} from "../services/themeService.js";

import {
    scheduleReminderNotification,
    cancelReminderNotification
} from "../services/notificationService.js";

import {
    formatLocationLabel
} from "../services/locationService.js";

initTheme();

import {
    getNoteById,
    createNote,
    deleteNote,
    updateNote
} from "../services/noteService.js";

import {
    getMedia,
    uploadMedia,
    isSupportedMedia,
    deleteMedia
} from "../services/mediaService.js";

import {

    getFoldersByNote,

    getNotesInNote,

    createFolder

}
from "../services/folderService.js";

const mediaSection = document.getElementById("mediaSection");
const reminderSection = document.getElementById("reminderSection");
const voiceCard = document.getElementById("voiceCard");

const toolbarAttachBtn = document.getElementById("toolbarAttachBtn");
const mediaFileInput   = document.getElementById("mediaFileInput");

const params = new URLSearchParams(window.location.search);

const noteId = params.get("id");

if (!noteId) {
    document.querySelector("main").innerHTML = `
        <div class="text-center py-5">
            <i class="bi bi-journal-x" style="font-size:4rem;color:#9ca3af;"></i>
            <h3 class="mt-3">ID Note tidak ditemukan</h3>
            <p class="text-muted">URL tidak mengandung parameter id.</p>
            <a href="dashboard.html" class="btn btn-primary mt-3">Kembali ke Dashboard</a>
        </div>
    `;
    throw new Error("No note ID in URL");
}

const note = getNoteById(noteId);

if (note) {
    updateNote(note.id, {
        lastOpened: new Date().toISOString()
    });
}

const categoryBadge = document.getElementById("categoryBadge");
const noteDate = document.getElementById("noteDate");
const editor =
document.getElementById("editor");

const noteNameDisplay = document.getElementById("noteNameDisplay");
const titleToggle = document.getElementById("titleToggle");
const noteBodyWrap = document.getElementById("noteBodyWrap");

const mediaContainer = document.getElementById("mediaContainer");
const reminderContainer = document.getElementById("reminderContainer");
const deleteBtn = document.getElementById("deleteBtn");

const toolbar =
document.getElementById("editorToolbar");

const slashMenu =
document.getElementById("slashMenu");

const folderList =
document.getElementById(
    "noteFoldersList"
);

const addFolderBtn =
document.getElementById(
    "btnAddFolderInNote"
);

const viewModeBtn = document.getElementById("viewModeBtn");

const tagHeaderBtn  = document.getElementById("tagHeaderBtn");
const tagDropdown   = document.getElementById("tagDropdown");
const tagsContainer = document.getElementById("tagsContainer");
const tagAddInput   = document.getElementById("tagAddInput");
const tagAddBtn     = document.getElementById("tagAddBtn");

let savedSelectionRange = null;



if (!note) {

    document.querySelector("main").innerHTML = `
        <div class="text-center py-5">
            <i class="bi bi-journal-x" style="font-size:4rem;color:#9ca3af;"></i>
            <h3 class="mt-3">Note tidak ditemukan</h3>
            <p class="text-muted small">ID: ${noteId}</p>
            <a href="dashboard.html" class="btn btn-primary mt-3">Kembali ke Dashboard</a>
        </div>
    `;

    throw new Error("Note not found: " + noteId);

}

renderNote();

addFolderBtn?.addEventListener(
    "click",
    createFolderInsideNote
);

const addNoteInNoteBtn = document.getElementById("btnAddNoteInNote");

addNoteInNoteBtn?.addEventListener("click", () => {
    window.location.href = `add-note.html?parentId=${note.id}&parentType=note`;
});

editor.addEventListener("click", (e) => {
    if (e.target.closest(".heading-toggle")) return;

    const clickedBlock = e.target.closest(".editor-block");

    if (!clickedBlock) {
        const lastBlock = editor.lastElementChild;
        if (lastBlock && lastBlock.contentEditable === "true") {
            placeCaretAtEnd(lastBlock);
        } else {
            createNewBlockAfter(editor.lastElementChild);
        }
    }
});

viewModeBtn?.addEventListener("click", toggleViewMode);

tagAddBtn?.addEventListener("click", addTag);
tagAddInput?.addEventListener("keydown", e => {
    if (e.key === "Enter") { e.preventDefault(); addTag(); }
});

tagHeaderBtn?.addEventListener("click", (e) => {
    e.stopPropagation();

    const isOpen = tagDropdown.classList.contains("open");

    if (isOpen) {
        tagDropdown.classList.remove("open");
        return;
    }

    tagDropdown.classList.add("open");

    // Hitung posisi agar tidak keluar layar
    const btnRect      = tagHeaderBtn.getBoundingClientRect();
    const dropWidth    = tagDropdown.offsetWidth;
    const dropHeight   = tagDropdown.offsetHeight;
    const margin       = 12;
    const vw           = window.innerWidth;
    const vh           = window.innerHeight;

    // Default: muncul di bawah tombol, rata kanan
    let top  = btnRect.bottom + 8;
    let left = btnRect.right - dropWidth;

    // Jangan keluar kiri
    if (left < margin) left = margin;

    // Jangan keluar kanan
    if (left + dropWidth > vw - margin) left = vw - dropWidth - margin;

    // Jangan keluar bawah → muncul di atas tombol
    if (top + dropHeight > vh - margin) {
        top = btnRect.top - dropHeight - 8;
    }

    tagDropdown.style.top  = `${top}px`;
    tagDropdown.style.left = `${left}px`;
});

document.addEventListener("click", (e) => {
    if (!tagDropdown?.contains(e.target) && e.target !== tagHeaderBtn) {
        tagDropdown?.classList.remove("open");
    }
});

toolbarAttachBtn?.addEventListener("click", () => {
    mediaFileInput.click();
});

mediaFileInput?.addEventListener("change", async () => {
    const files = Array.from(mediaFileInput.files);
    if (!files.length) return;

    const uploaded = [];
    for (const file of files) {
        if (!isSupportedMedia(file)) {
            alert(`"${file.name}" tidak didukung.`);
            continue;
        }
        try {
            const media = await uploadMedia(file);
            uploaded.push(media);
        } catch (err) {
            alert(`Gagal upload "${file.name}": ${err.message}`);
        }
    }

    if (!uploaded.length) return;

    // Simpan ke note.media
    if (!note.media) note.media = [];
    note.media.push(...uploaded);
    updateNote(note.id, { media: note.media });

    // Insert media block di posisi kursor atau di akhir
    insertMediaBlock(uploaded);
    mediaFileInput.value = "";
});

function addChecklistItem() {
    const text = checklistAddInput.value.trim();
    if (!text) return;
    if (!note.checklist) note.checklist = [];
    note.checklist.push({ id: crypto.randomUUID(), text, checked: false });
    saveChecklist();
    renderChecklist();
    checklistAddInput.value = "";
    checklistAddInput.focus();
}

document.addEventListener(
    "selectionchange",
    showToolbar
);

const slashObserver = new MutationObserver(() => {
    detectSlashFromInput();
});

slashObserver.observe(editor, {
    childList: true,
    subtree: true,
    characterData: true
});

if (deleteBtn) {

deleteBtn.addEventListener("click", () => {

    const confirmDelete = confirm(
        "Delete this note?"
    );

    if (!confirmDelete) return;

    deleteNote(note.id);

    window.location.href = "dashboard.html";

});

}

function renderChildren(){

    folderList.innerHTML = "";

    const folders =
        getFoldersByNote(note.id);

    const notes =
        getNotesInNote(note.id);

    if(
        folders.length===0 &&
        notes.length===0
    ){

        folderList.innerHTML = `

            <div class="text-secondary">

                Empty

            </div>

        `;

        return;

    }

    folders.forEach(folder=>{

        folderList.innerHTML += `

            <div
                class="folder-row"
                data-type="folder"
                data-id="${folder.id}">

                <i
                    class="${folder.icon}"
                    style="color:${folder.color}">
                </i>

                <span>

                    ${folder.name}

                </span>

            </div>

        `;

    });

    notes.forEach(child=>{

        folderList.innerHTML += `

            <div
                class="folder-row"
                data-type="note"
                data-id="${child.id}">

                <i
                    class="bi bi-file-earmark-text">

                </i>

                <span>

                    ${child.noteName}

                </span>

            </div>

        `;

    });

}

folderList.addEventListener("click",(e)=>{

    const row =
    e.target.closest(".folder-row");

    if(!row) return;

    if(row.dataset.type==="folder"){

        window.location.href=
            `category.html?folder=${row.dataset.id}`;

    }

    else{

        window.location.href=
            `note-detail.html?id=${row.dataset.id}`;

    }

});

async function renderNote() {

    categoryBadge.textContent = note.category;

    if (noteNameDisplay) {
        noteNameDisplay.textContent = note.noteName || "";
        noteNameDisplay.addEventListener("input", () => {
            note.noteName = noteNameDisplay.textContent.trim();
            updateNote(note.id, { noteName: note.noteName });
        });
        noteNameDisplay.addEventListener("keydown", (e) => {
            if (e.key === "Enter") {
                e.preventDefault();
                // Fokus ke block pertama editor
                const firstBlock = editor.querySelector(".editor-block");
                if (firstBlock) placeCaret(firstBlock);
            }
        });
    }

    applyTitleCollapsedState(!!note.titleCollapsed);

    renderBlocks();
    
    renderChildren();

    noteDate.textContent = formatDate(note.date);

    renderLocation();

    renderVoiceNote();

    await renderMedia();

    renderReminder();

}

function createFolderInsideNote(){

    const name = prompt(

        "Folder name"

    );

    if(!name) return;

    const folder =
    createFolder(

        name,

        note.id,

        "note"

    );

    if(!folder){

        alert(

            "Folder already exists."

        );

        return;

    }

    renderChildren();

}

function renderBlocks(){

    editor.innerHTML = "";

    if(!note.blocks || note.blocks.length===0){

        note.blocks = [

            {

                id: crypto.randomUUID(),

                type: "section",

                text: note.title || ""

            },

            {

                id: crypto.randomUUID(),

                type: "paragraph",

                text: ""

            }

        ];

    }

    note.blocks.forEach(createBlock);

}

function applyTitleCollapsedState(collapsed) {

    if (!titleToggle || !noteBodyWrap) return;

    titleToggle.classList.toggle("collapsed", collapsed);
    noteBodyWrap.classList.toggle("note-body-hidden", collapsed);
}

titleToggle?.addEventListener("click", (e) => {

    e.preventDefault();
    e.stopPropagation();

    const collapsed = !titleToggle.classList.contains("collapsed");

    applyTitleCollapsedState(collapsed);

    note.titleCollapsed = collapsed;
    updateNote(note.id, { titleCollapsed: collapsed });

});

function renderLocation() {

    const wrap = document.getElementById("locationMetaWrap");
    const label = document.getElementById("noteLocation");

    if (!wrap || !label) return;

    const text = formatLocationLabel(note.location);

    if (!text) {
        wrap.classList.add("d-none");
        return;
    }

    label.textContent = text;
    wrap.classList.remove("d-none");
}

function ensureHeadingToggle(block) {

    block.querySelectorAll(":scope > .heading-toggle").forEach(el => el.remove());

    if (!block.dataset.type.startsWith("heading"))
        return;

    const text = block.textContent.replace(/\u200B/g, "").trim();

    if (text === "")
        return;

    // Simpan posisi caret sebelum insert toggle
    const selection = window.getSelection();
    let savedRange = null;
    if (selection.rangeCount && block.contains(selection.anchorNode)) {
        savedRange = selection.getRangeAt(0).cloneRange();
    }

    const toggle = document.createElement("span");

    toggle.className = "heading-toggle";
    toggle.contentEditable = false;
    toggle.innerHTML = `<i class="bi bi-chevron-down"></i>`;

    toggle.addEventListener("click", e => {
        e.preventDefault();
        e.stopPropagation();
        toggleHeadingSection(block, toggle);
    });

    block.insertBefore(toggle, block.firstChild);

    // Restore posisi caret setelah toggle di-insert
    if (savedRange) {
        selection.removeAllRanges();
        selection.addRange(savedRange);
    }
}

function createBlock(block) {

    const div = document.createElement("div");

    div.dataset.id   = block.id;
    div.dataset.type = block.type;
    div.className    = `editor-block ${block.type}`;

    const tempDiv = document.createElement("div");
    tempDiv.innerHTML = block.text || "";
    tempDiv.querySelectorAll(".heading-toggle").forEach(el => el.remove());
    div.innerHTML = tempDiv.innerHTML;

    // ── Media block ──────────────────────────────────────
    if (block.type === "media") {
        div.contentEditable      = false;
        div.dataset.mediaIds     = block.mediaIds || "[]";
        div.dataset.layout       = block.layout   || "carousel";

        const ids = JSON.parse(block.mediaIds || "[]");

        (async () => {
            const realMedia = [];
            for (const id of ids) {
                const data = await getMedia(id);
                if (data) realMedia.push({
                    refId:    data.id,
                    id:       data.id,
                    filename: data.filename,
                    type:     data.mimeType?.startsWith("image") ? "photo"
                            : data.mimeType?.startsWith("video") ? "video"
                            : "voice",
                    mimeType: data.mimeType
                });
            }
            renderMediaBlock(div, realMedia, div.dataset.layout);
        })();

        div.setAttribute("tabindex", "0");
        div.addEventListener("keydown", (e) => {
            if (e.key === "Enter") {
                e.preventDefault();
                createNewBlockAfter(div);
            }
        });
        div.addEventListener("click", () => {
            div.focus();
        });
        initBlockDrag(div);
        editor.appendChild(div);
        return;
    }

    if (block.type === "note-link") {
        renderNoteLinkBlock(div, block.linkedNoteId);
        initBlockDrag(div);
        editor.appendChild(div);
        return;
    }

    // ── Todo block ───────────────────────────────────────
    if (block.type === "todo") {
        div.contentEditable = false;
        div.innerHTML = `
            <label class="todo-block-label">
                <input type="checkbox" class="todo-checkbox" ${block.checked ? "checked" : ""}>
                <span class="todo-block-text ${block.checked ? "done" : ""}"
                    contenteditable="true"
                    spellcheck="false"
                >${block.text || ""}</span>
            </label>
        `;

        const checkbox = div.querySelector(".todo-checkbox");
        const span     = div.querySelector(".todo-block-text");

        checkbox.addEventListener("change", () => {
            block.checked = checkbox.checked;
            span.classList.toggle("done", checkbox.checked);
            autoSave();
        });

        span.addEventListener("input", autoSave);
        span.addEventListener("keydown", (e) => {
            if (e.key === "Enter") {
                e.preventDefault();
                createNewBlockAfter(div);
            }
            if (e.key === "Backspace" && span.textContent.trim() === "") {
                e.preventDefault();
                const prev = div.previousElementSibling;
                div.remove();
                if (prev) placeCaret(prev);
                autoSave();
            }
        });

        div.addEventListener("keydown", handleBlockKeyDown);
        div.addEventListener("input", () => {
            // Simpan caret dulu sebelum ensureHeadingToggle
            const sel = window.getSelection();
            let savedRange = null;
            if (sel.rangeCount && div.contains(sel.anchorNode)) {
                savedRange = sel.getRangeAt(0).cloneRange();
            }

            ensureHeadingToggle(div);

            if (savedRange) {
                sel.removeAllRanges();
                sel.addRange(savedRange);
            }

            autoSave();
        });

        initBlockDrag(div);
        editor.appendChild(div);
        return;
    }

    // ── Heading block ────────────────────────────────────
    if (block.type === "heading1" || block.type === "heading2" || block.type === "heading3") {
        div.contentEditable = true;
        div.spellcheck      = false;

        // Strip toggle lama yang mungkin tersimpan di text
        const tempDiv = document.createElement("div");
        tempDiv.innerHTML = block.text || "";
        tempDiv.querySelectorAll(".heading-toggle").forEach(el => el.remove());
        div.innerHTML = tempDiv.innerHTML;

        div.contentEditable = true;
        div.spellcheck = false;

        ensureHeadingToggle(div);

        div.addEventListener("keydown", handleBlockKeyDown);
        div.addEventListener("input", autoSave);

        initBlockDrag(div);
        editor.appendChild(div);
        return;

    }

    // ── Default block (paragraph, quote, section, dll) ───
    div.contentEditable = true;
    div.spellcheck      = false;

    div.addEventListener("keydown", handleBlockKeyDown);
    div.addEventListener("input", autoSave);
    initBlockDrag(div);
    editor.appendChild(div);

}

function getHeadingLevel(type) {
    if (type === "heading1") return 1;
    if (type === "heading2") return 2;
    if (type === "heading3") return 3;
    return 0;
}

function toggleHeadingSection(headingBlock, toggleBtn) {
    const level = getHeadingLevel(headingBlock.dataset.type);
    const isCollapsed = toggleBtn.classList.contains("collapsed");

    toggleBtn.classList.toggle("collapsed", !isCollapsed);

    let sibling = headingBlock.nextElementSibling;

    while (sibling) {
        const sibLevel = getHeadingLevel(sibling.dataset.type);

        if (sibLevel > 0 && sibLevel <= level) break;

        sibling.classList.toggle("heading-hidden", !isCollapsed);
        sibling = sibling.nextElementSibling;
    }
}

function handleBlockKeyDown(e){

    if(e.key==="Enter"){

        e.preventDefault();

        createNewBlockAfter(e.target);

    }

    if(e.key==="Backspace"){

        const block = e.target;

        if(block.innerText.trim()!==""){

            return;

        }

        if(editor.children.length===1){

            return;

        }

        e.preventDefault();

        const previous = block.previousElementSibling;

        block.remove();

        placeCaret(previous);

        autoSave();

    }

    if (e.key === "ArrowUp") {

        if (!isCaretAtStart(e.target)) return;

        const previous = e.target.previousElementSibling;

        if (!previous) return;

        e.preventDefault();

        placeCaretAtEnd(previous);

    }

    if (e.key === "ArrowDown") {

        if (!isCaretAtEnd(e.target)) return;

        const next = e.target.nextElementSibling;

        if (!next) return;

        e.preventDefault();

        placeCaret(next);

    }

    if(e.ctrlKey && e.key==="b"){

        e.preventDefault();

        toggleInlineStyle("strong");

    }

    if(e.ctrlKey && e.key==="i"){

        e.preventDefault();

        toggleInlineStyle("em");

    }

    if(e.ctrlKey && e.key==="u"){

        e.preventDefault();

        toggleInlineStyle("u");

    }

}

function toggleInlineStyle(tag){

    const range =
    getEditorSelectionRange() ||
    savedSelectionRange;

    if(!range || range.collapsed){

        return;

    }

    const selection = window.getSelection();
    const activeRange = range.cloneRange();
    const styledElement =
    getSelectedInlineStyleElement(activeRange, tag);

    if(styledElement){

        const restoredRange =
        unwrapInlineStyle(styledElement);

        selection.removeAllRanges();
        selection.addRange(restoredRange);

        savedSelectionRange = restoredRange.cloneRange();

        autoSave();
        updateToolbarState();

        return;

    }

    const wrapper =
    document.createElement(tag);

    const contents =
    activeRange.extractContents();

    wrapper.appendChild(contents);

    activeRange.insertNode(wrapper);

    activeRange.selectNodeContents(wrapper);

    selection.removeAllRanges();
    selection.addRange(activeRange);

    savedSelectionRange = activeRange.cloneRange();

    autoSave();
    updateToolbarState();

}

function resolveBoundaryElement(container, offset, fromEnd){

    let node;

    if(container.nodeType === Node.TEXT_NODE){

        node = container;

    }else{

        node = fromEnd
        ? (container.childNodes[offset - 1] || container.childNodes[offset] || container)
        : (container.childNodes[offset] || container.childNodes[offset - 1] || container);

    }

    // Turun ke node terdalam (leaf) supaya tag bersarang
    // seperti <em><u>teks</u></em> tetap terdeteksi walau
    // boundary range menunjuk ke elemen pembungkusnya.
    while(
        node &&
        node.nodeType === Node.ELEMENT_NODE &&
        node.childNodes.length
    ){

        node = fromEnd ? node.lastChild : node.firstChild;

    }

    return getElementFromNode(node);

}

function getSelectedInlineStyleElement(range, tag){

    const startElement =
    resolveBoundaryElement(range.startContainer, range.startOffset, false);

    const endElement =
    resolveBoundaryElement(range.endContainer, range.endOffset, true);

    if(!startElement || !endElement){

        return null;

    }

    const startStyled =
    startElement.closest(tag);

    const endStyled =
    endElement.closest(tag);

    if(
        startStyled &&
        startStyled === endStyled &&
        editor.contains(startStyled)
    ){

        return startStyled;

    }

    return null;

}

function unwrapInlineStyle(element){

    const range = document.createRange();
    const firstNode = element.firstChild;
    const lastNode = element.lastChild;
    const parent = element.parentNode;

    if(!parent){

        return range;

    }

    while(element.firstChild){

        parent.insertBefore(
            element.firstChild,
            element
        );

    }

    parent.removeChild(element);

    if(firstNode && lastNode){

        range.setStartBefore(firstNode);
        range.setEndAfter(lastNode);

    }else{

        range.selectNodeContents(parent);

    }

    return range;

}

function isCaretAtStart(element) {

    const selection = window.getSelection();

    if (!selection.rangeCount) return false;

    const range = selection.getRangeAt(0);

    return (
        range.startOffset === 0 &&
        range.endOffset === 0
    );

}

function isCaretAtEnd(element) {

    const selection = window.getSelection();

    if (!selection.rangeCount) return false;

    const range = selection.getRangeAt(0);

    return (
        range.startOffset === element.textContent.length &&
        range.endOffset === element.textContent.length
    );

}

function placeCaretAtEnd(element) {

    element.focus();

    const range = document.createRange();

    range.selectNodeContents(element);

    range.collapse(false);

    const selection = window.getSelection();

    selection.removeAllRanges();

    selection.addRange(range);

}

function createNewBlockAfter(currentBlock){

    const block = document.createElement("div");

    block.className = "editor-block";

    block.dataset.id = crypto.randomUUID();

    const currentType =
    currentBlock.dataset.type;

    block.dataset.type =
    currentType.startsWith("heading")
        ? "paragraph"
        : currentType;

    block.className =
    `editor-block ${block.dataset.type}`;

    block.contentEditable = true;

    block.spellcheck = false;

    block.innerHTML = "";

    block.addEventListener("keydown", handleBlockKeyDown);

    block.addEventListener("input", autoSave);

    initBlockDrag(block);

    currentBlock.after(block);

    placeCaret(block);

    autoSave();

}

function applyBlockType(block, type) {

    if (type === "note-link") {
        createNoteLinkBlock(block);
        return;
    }
    if (!block) return;


    // Toggle: kalau type yang diklik sudah aktif, balik ke paragraph
    const nextType = block.dataset.type === type ? "paragraph" : type;

    block.dataset.type = nextType;
    block.className = `editor-block ${nextType}`;

    ensureHeadingToggle(block);

    autoSave();
    updateToolbarState();

}

function createNoteLinkBlock(block) {

    const name = prompt("Note name", "Untitled");

    // User cancel → block dikembalikan jadi paragraph kosong
    if (name === null) {
        block.dataset.type = "paragraph";
        block.className = "editor-block paragraph";
        autoSave();
        return;
    }

    const childNote = createNote({
        noteName: name.trim() || "Untitled",
        parentId: note.id,
        parentType: "note",
        category: note.category || ""
    });

    renderNoteLinkBlock(block, childNote.id);

    renderChildren(); // biar konsisten dengan list "Sub-pages" di bawah

    autoSave();

}

function renderNoteLinkBlock(div, linkedNoteId) {

    const linked = getNoteById(linkedNoteId);

    div.dataset.type = "note-link";
    div.className = "editor-block note-link";
    div.dataset.linkedNoteId = linkedNoteId;
    div.contentEditable = false;

    div.innerHTML = `
        <i class="bi bi-file-earmark-text"></i>
        <span class="note-link-name">${linked?.noteName || "Untitled"}</span>
    `;

    div.setAttribute("tabindex", "0");

    div.addEventListener("click", () => {
        window.location.href = `note-detail.html?id=${linkedNoteId}`;
    });

    div.addEventListener("keydown", (e) => {
        if (e.key === "Enter") {
            e.preventDefault();
            window.location.href = `note-detail.html?id=${linkedNoteId}`;
        }
    });

}

function placeCaret(element){

    element.focus();

    const range = document.createRange();

    range.selectNodeContents(element);

    range.collapse(true);

    const selection = window.getSelection();

    selection.removeAllRanges();

    selection.addRange(range);

}

function detectSlash(e){

    if(e.key !== "/"){

        slashMenu.classList.remove("show");

        return;

    }

    requestAnimationFrame(() => {

        const block = e.target;

        const text = block.innerText;

        const selection = window.getSelection();

        if(!selection.rangeCount){

            slashMenu.classList.remove("show");

            return;

        }

        const caretPos = selection.getRangeAt(0).startOffset;

        const beforeCaret = text.substring(0, caretPos);

        const lastSlash = beforeCaret.lastIndexOf("/");

        if(lastSlash === -1){

            slashMenu.classList.remove("show");

            return;

        }

        const beforeSlash = beforeCaret.substring(0, lastSlash);

        const validTrigger =

            beforeSlash.length === 0 ||

            /\s$/.test(beforeSlash);

        if(!validTrigger){

            slashMenu.classList.remove("show");

            return;

        }

        showSlashMenu(block);

    });

}

function detectSlashFromInput() {
    const selection = window.getSelection();
    
    if (!selection.rangeCount) {
        slashMenu.classList.remove("show");
        return;
    }

    const anchorNode = selection.anchorNode;

    const block = anchorNode?.nodeType === Node.TEXT_NODE
        ? anchorNode.parentElement?.closest(".editor-block")
        : anchorNode?.closest?.(".editor-block");

    if (!block || block.contentEditable !== "true") {
        slashMenu.classList.remove("show");
        return;
    }

    const range    = selection.getRangeAt(0);
    const preRange = document.createRange();
    preRange.selectNodeContents(block);
    preRange.setEnd(range.startContainer, range.startOffset);
    const beforeCaret = preRange.toString();

    const lastSlash = beforeCaret.lastIndexOf("/");

    if (lastSlash === -1) {
        slashMenu.classList.remove("show");
        return;
    }

    const beforeSlash = beforeCaret.substring(0, lastSlash);
    const afterSlash  = beforeCaret.substring(lastSlash + 1);

    const validTrigger = beforeSlash.length === 0 || /\s$/.test(beforeSlash);

    if (!validTrigger || /\S/.test(afterSlash)) {
        slashMenu.classList.remove("show");
        return;
    }

    showSlashMenu(block);
}

function showSlashMenu(block) {

    slashMenu.classList.add("show");

    const rect        = block.getBoundingClientRect();
    const menuWidth   = slashMenu.offsetWidth  || 220;
    const menuHeight  = slashMenu.offsetHeight || 200;
    const margin      = 12;
    const vw          = window.innerWidth;
    const vh          = window.innerHeight;

    let left = rect.left;
    let top  = rect.bottom + 8;

    // Jangan keluar kanan
    if (left + menuWidth > vw - margin) {
        left = vw - menuWidth - margin;
    }

    // Jangan keluar kiri
    if (left < margin) left = margin;

    // Jangan keluar bawah → flip ke atas block
    if (top + menuHeight > vh - margin) {
        top = rect.top - menuHeight - 8;
    }

    // Jangan keluar atas
    if (top < margin) top = margin;

    slashMenu.style.left = `${left}px`;
    slashMenu.style.top  = `${top}px`;

}

function removeSlashTrigger(block){

    if(!block) return;

    const text = block.innerText;

    const slashIndex = text.lastIndexOf("/");

    if(slashIndex === -1){
        return;
    }

    block.innerText =
        text.substring(0, slashIndex) +
        text.substring(slashIndex + 1);

    placeCaretAtEnd(block);

}

slashMenu.addEventListener("click",(e)=>{

    const button =
    e.target.closest("button");

    if(!button) return;

    const type =
    button.dataset.type;

    const activeBlock =
    window.getSelection()
    .anchorNode
    .parentElement
    .closest(".editor-block");

    removeSlashTrigger(activeBlock);

    applyBlockType(
        activeBlock,
        type
    );

    slashMenu.classList.remove("show");

    autoSave();

});

function showToolbar() {

    const selection = window.getSelection();
    const range = getEditorSelectionRange();

    if (
        selection.rangeCount === 0 ||
        selection.toString().trim() === "" ||
        !range
    ) {
        toolbar.classList.remove("show");
        return;
    }

    savedSelectionRange = range.cloneRange();

    toolbar.classList.add("show");
    updateToolbarState();

}

// ── Toolbar tracks keyboard via visualViewport ───────────
(function initToolbarKeyboardTracking() {
    const vv = window.visualViewport;
    if (!vv) return;

    function updateToolbarBottom() {
        // Jarak antara bawah visualViewport dan bawah layout viewport
        // = tinggi keyboard (kira-kira)
        const keyboardHeight = Math.max(
            0,
            window.innerHeight - (vv.height + vv.offsetTop)
        );
        toolbar.style.bottom = keyboardHeight > 10
            ? `${keyboardHeight}px`
            : "0px";
    }

    vv.addEventListener("resize", updateToolbarBottom);
    vv.addEventListener("scroll", updateToolbarBottom);
})();

toolbar.addEventListener("mousedown",(e)=>{

    e.preventDefault();

});

toolbar.addEventListener("click",(e)=>{

    const button =
    e.target.closest("button");

    if(!button) return;

    if(button.dataset.command){

        switch(button.dataset.command){

            case "bold":

                toggleInlineStyle("strong");

                break;

            case "italic":

                toggleInlineStyle("em");

                break;

            case "underline":

                toggleInlineStyle("u");

                break;

            case "strikethrough":

                toggleInlineStyle("s");

                break;

            case "fontSize":

                button.classList.toggle("active");
                openFontSizeDropdown(button);
                return;

            case "fontFamily":

                button.classList.toggle("active");
                openFontFamilyDropdown(button);
                return;

        }

    }

    if(button.dataset.heading){

        const block =
        getCurrentBlock();

        applyBlockType(
            block,
            button.dataset.heading
        );

    }

    autoSave();

});

function getEditorSelectionRange(){

    const selection = window.getSelection();

    if(!selection.rangeCount){

        return null;

    }

    const range = selection.getRangeAt(0);
    const container = range.commonAncestorContainer;
    const element =
    container.nodeType === Node.ELEMENT_NODE
    ? container
    : container.parentElement;

    if(!element || !editor.contains(element)){

        return null;

    }

    return range;

}

function getElementFromNode(node){

    if(!node) return null;

    return node.nodeType === Node.ELEMENT_NODE
    ? node
    : node.parentElement;

}

function getCurrentBlock(){

    const range =
    getEditorSelectionRange() ||
    savedSelectionRange;

    if(!range){

        return null;

    }

    const container = range.commonAncestorContainer;
    const element =
    container.nodeType === Node.ELEMENT_NODE
    ? container
    : container.parentElement;

    return element?.closest(".editor-block") || null;

}

function updateToolbarState(){

    const range =
    getEditorSelectionRange() ||
    savedSelectionRange;

    const block = getCurrentBlock();

    toolbar.querySelectorAll("button")
    .forEach(button => {

        let active = false;

        if(button.dataset.command){

            const tag =
            getTagForCommand(button.dataset.command);

            active =
            Boolean(
                tag &&
                range &&
                getSelectedInlineStyleElement(range, tag)
            );

        }

        if(button.dataset.heading){

            active =
            block?.dataset.type === button.dataset.heading;

        }

        button.classList.toggle("active", active);

    });

}

function getTagForCommand(command){

    switch(command){

        case "bold":
            return "strong";

        case "italic":
            return "em";

        case "underline":
            return "u";

        case "strikethrough":
            return "s";

        default:
            return null;

    }

}

// ── Apply span-based inline style (font size / font family) ──
function applyInlineSpanStyle(prop, value) {

    const range = getEditorSelectionRange() || savedSelectionRange;
    if (!range || range.collapsed) return;

    const selection = window.getSelection();

    // Cek apakah selection sudah punya span dengan prop yang sama
    // Kalau iya, hapus dulu supaya toggle / replace bersih
    const ancestor = range.commonAncestorContainer;
    const el = ancestor.nodeType === Node.ELEMENT_NODE
        ? ancestor : ancestor.parentElement;
    const existingSpan = el?.closest(`span[data-style-${prop}]`);
    if (existingSpan && existingSpan.style[prop] === value) {
        // Toggle off — unwrap span ini
        const parent = existingSpan.parentNode;
        while (existingSpan.firstChild) {
            parent.insertBefore(existingSpan.firstChild, existingSpan);
        }
        parent.removeChild(existingSpan);
        autoSave();
        return;
    }

    const span = document.createElement("span");
    span.style[prop] = value;
    span.dataset[`style${prop.charAt(0).toUpperCase() + prop.slice(1)}`] = value;

    const contents = range.extractContents();
    span.appendChild(contents);
    range.insertNode(span);

    const newRange = document.createRange();
    newRange.selectNodeContents(span);
    selection.removeAllRanges();
    selection.addRange(newRange);
    savedSelectionRange = newRange.cloneRange();

    autoSave();
    updateToolbarState();
}

// ── Toolbar dropdown: font size ───────────────────────────
function openFontSizeDropdown(anchorBtn) {
    closeToolbarDropdowns();

    const presets = [8, 10, 12, 14, 16, 18, 20, 24, 28, 32, 36, 48, 64, 72];

    const dd = document.createElement("div");
    dd.className = "toolbar-dropdown font-size-dropdown";
    dd.id = "toolbarDropdown";

    // ── Input manual ──────────────────────────────────────
    const inputRow = document.createElement("div");
    inputRow.className = "fs-input-row";

    const input = document.createElement("input");
    input.type        = "number";
    input.min         = "1";
    input.max         = "200";
    input.placeholder = "px";
    input.className   = "fs-input";

    // Cek font size aktif di selection saat ini
    const range = getEditorSelectionRange() || savedSelectionRange;
    if (range) {
        const el = range.commonAncestorContainer.nodeType === Node.TEXT_NODE
            ? range.commonAncestorContainer.parentElement
            : range.commonAncestorContainer;
        const current = el?.closest("[data-style-font-size]")?.style.fontSize;
        if (current) input.value = parseInt(current);
    }

    const applyBtn = document.createElement("button");
    applyBtn.className   = "fs-apply-btn";
    applyBtn.textContent = "OK";
    applyBtn.addEventListener("mousedown", e => {
        e.preventDefault();
        const val = parseInt(input.value);
        if (val > 0 && val <= 200) {
            applyInlineSpanStyle("fontSize", `${val}px`);
        }
        closeToolbarDropdowns();
        anchorBtn.classList.remove("active");
    });

    input.addEventListener("keydown", e => {
        if (e.key === "Enter") {
            e.preventDefault();
            applyBtn.dispatchEvent(new MouseEvent("mousedown"));
        }
        if (e.key === "Escape") {
            closeToolbarDropdowns();
        }
    });

    inputRow.appendChild(input);
    inputRow.appendChild(applyBtn);
    dd.appendChild(inputRow);

    // ── Divider ───────────────────────────────────────────
    const divider = document.createElement("div");
    divider.className = "fs-divider";
    dd.appendChild(divider);

    // ── Preset list ───────────────────────────────────────
    const list = document.createElement("div");
    list.className = "fs-list";

    presets.forEach(size => {
        const btn = document.createElement("button");
        btn.innerHTML = `<span style="font-size:${size}px;line-height:1.3">${size}</span><span class="fs-unit">px</span>`;
        btn.addEventListener("mousedown", e => {
            e.preventDefault();
            applyInlineSpanStyle("fontSize", `${size}px`);
            closeToolbarDropdowns();
            anchorBtn.classList.remove("active");
        });
        list.appendChild(btn);
    });

    dd.appendChild(list);
    document.body.appendChild(dd);
    positionDropdownAboveBtn(dd, anchorBtn);

    // Fokus input setelah posisi dihitung
    requestAnimationFrame(() => requestAnimationFrame(() => {
        input.focus();
        input.select();
    }));
}

// ── Toolbar dropdown: font family ─────────────────────────
function openFontFamilyDropdown(anchorBtn) {
    closeToolbarDropdowns();

    const fonts = [
        { label: "Default",    value: "" },
        { label: "Poppins",    value: "'Poppins', sans-serif" },
        { label: "Serif",      value: "Georgia, serif" },
        { label: "Mono",       value: "'Courier New', monospace" },
        { label: "Rounded",    value: "'Nunito', sans-serif" },
    ];

    const dd = buildToolbarDropdown(
        fonts.map(f => ({
            label: `<span style="font-family:${f.value || "inherit"}">${f.label}</span>`,
            value: f.value,
            action: () => {
                if (f.value) applyInlineSpanStyle("fontFamily", f.value);
            }
        })),
        anchorBtn
    );

    document.body.appendChild(dd);
    positionDropdownAboveBtn(dd, anchorBtn);
}

function buildToolbarDropdown(items, anchorBtn) {
    const dd = document.createElement("div");
    dd.className = "toolbar-dropdown";
    dd.id = "toolbarDropdown";

    items.forEach(item => {
        const btn = document.createElement("button");
        btn.innerHTML = item.label;
        btn.addEventListener("mousedown", e => {
            e.preventDefault();
            item.action();
            closeToolbarDropdowns();
            anchorBtn.classList.remove("active");
        });
        dd.appendChild(btn);
    });

    return dd;
}

function positionDropdownAboveBtn(dd, anchorBtn) {
    // Posisi sementara agar bisa ukur tinggi
    dd.style.visibility = "hidden";
    dd.style.position   = "fixed";
    dd.style.left       = "0";
    dd.style.top        = "0";
    document.body.appendChild(dd);

    requestAnimationFrame(() => {
        const btnRect  = anchorBtn.getBoundingClientRect();
        const tbRect   = toolbar.getBoundingClientRect();
        const ddHeight = dd.offsetHeight;
        const ddWidth  = dd.offsetWidth;
        const margin   = 8;

        let top  = tbRect.top - ddHeight - margin;
        let left = btnRect.left;

        // Jangan keluar sisi kanan layar
        if (left + ddWidth > window.innerWidth - margin) {
            left = window.innerWidth - ddWidth - margin;
        }
        if (left < margin) left = margin;
        if (top < margin) top = margin;

        dd.style.top        = `${top}px`;
        dd.style.left       = `${left}px`;
        dd.style.visibility = "visible";
    });
}

function closeToolbarDropdowns() {
    document.getElementById("toolbarDropdown")?.remove();
}

// Tutup dropdown saat klik di luar
document.addEventListener("mousedown", e => {
    const dd = document.getElementById("toolbarDropdown");
    if (dd && !dd.contains(e.target) &&
        !e.target.closest("[data-dropdown]")) {
        closeToolbarDropdowns();
    }
});

function autoSave() {

    const blocks = [];

    editor.querySelectorAll(".editor-block").forEach(block => {

        if (block.dataset.type === "todo") {

            const checkbox = block.querySelector(".todo-checkbox");
            const span     = block.querySelector(".todo-block-text");

            blocks.push({
                id:      block.dataset.id,
                type:    "todo",
                text:    span ? span.innerHTML : "",
                checked: checkbox ? checkbox.checked : false
            });

        } else if (block.dataset.type === "media") {

            blocks.push({
                id:       block.dataset.id,
                type:     "media",
                text:     "",
                mediaIds: block.dataset.mediaIds || "[]",
                layout:   block.dataset.layout   || "carousel"
            });

        } else if (block.dataset.type === "note-link") {
            blocks.push({
                id: block.dataset.id,
                type: "note-link",
                text: "",
                linkedNoteId: block.dataset.linkedNoteId || ""
            });
        }else {
            const clone = block.cloneNode(true);
            clone.querySelectorAll(".heading-toggle").forEach(el => el.remove());
            blocks.push({
                id:   block.dataset.id,
                type: block.dataset.type,
                text: clone.innerHTML
            });
        }

    });

    updateNote(note.id, {
        title:  note.title || "",
        blocks
    });

}

// ── Drag & Drop Blocks ─────────────────────────────────
let dragSrcBlock  = null;
let dragGhost     = null;
let longPressTimer = null;
const LONG_PRESS_MS = 500;

function initBlockDrag(blockEl) {
    let startX = 0;
    let startY = 0;
    let isDragging = false;

    // ── Touch ──────────────────────────────────────────
    blockEl.addEventListener("touchstart", (e) => {
        const touch = e.touches[0];
        startX = touch.clientX;
        startY = touch.clientY;

        longPressTimer = setTimeout(() => {
            isDragging = true;
            startDrag(blockEl, touch.clientX, touch.clientY);
        }, LONG_PRESS_MS);
    }, { passive: true });

    blockEl.addEventListener("touchmove", (e) => {
        const touch = e.touches[0];
        const dx = Math.abs(touch.clientX - startX);
        const dy = Math.abs(touch.clientY - startY);

        // Kalau gerak sebelum long press selesai → cancel
        if (!isDragging && (dx > 8 || dy > 8)) {
            clearTimeout(longPressTimer);
            return;
        }

        if (!isDragging) return;

        e.preventDefault();
        moveGhost(touch.clientX, touch.clientY);
        highlightDropTarget(touch.clientX, touch.clientY);
    }, { passive: false });

    blockEl.addEventListener("touchend", (e) => {
        clearTimeout(longPressTimer);
        if (!isDragging) return;
        isDragging = false;

        const touch = e.changedTouches[0];
        dropBlock(touch.clientX, touch.clientY);
        endDrag();
    });

    blockEl.addEventListener("touchcancel", () => {
        clearTimeout(longPressTimer);
        isDragging = false;
        endDrag();
    });

    // ── Mouse ──────────────────────────────────────────
    blockEl.addEventListener("mousedown", (e) => {
        if (e.target.closest("button, input, a, [contenteditable]")) return;

        startX = e.clientX;
        startY = e.clientY;

        longPressTimer = setTimeout(() => {
            isDragging = true;
            startDrag(blockEl, e.clientX, e.clientY);

            // Pasang listener ke document setelah drag dimulai
            document.addEventListener("mousemove", onMouseMove);
            document.addEventListener("mouseup", onMouseUp);
        }, LONG_PRESS_MS);
    });

    blockEl.addEventListener("mousemove", (e) => {
        // Cancel long press kalau mouse bergerak sebelum timer selesai
        if (!isDragging) {
            const dx = Math.abs(e.clientX - startX);
            const dy = Math.abs(e.clientY - startY);
            if (dx > 8 || dy > 8) clearTimeout(longPressTimer);
        }
    });

    blockEl.addEventListener("mouseup", () => {
        clearTimeout(longPressTimer);
    });

    function onMouseMove(e) {
        if (!isDragging) return;
        moveGhost(e.clientX, e.clientY);
        highlightDropTarget(e.clientX, e.clientY);
    }

    function onMouseUp(e) {
        document.removeEventListener("mousemove", onMouseMove);
        document.removeEventListener("mouseup", onMouseUp);

        if (!isDragging) return;
        isDragging = false;
        dropBlock(e.clientX, e.clientY);
        endDrag();
    }
}

function startDrag(blockEl, x, y) {
    dragSrcBlock = blockEl;
    blockEl.classList.add("dragging");

    // Buat ghost element
    dragGhost = document.createElement("div");
    dragGhost.className = "drag-ghost";
    dragGhost.textContent = blockEl.innerText.trim().substring(0, 50) || "Block";
    document.body.appendChild(dragGhost);
    moveGhost(x, y);

    // Vibrate di mobile
    if (navigator.vibrate) navigator.vibrate(40);
}

function moveGhost(x, y) {
    if (!dragGhost) return;
    dragGhost.style.left = `${x + 12}px`;
    dragGhost.style.top  = `${y - 20}px`;
}

function highlightDropTarget(x, y) {
    // Hapus highlight sebelumnya
    editor.querySelectorAll(".drag-over-top, .drag-over-bottom").forEach(el => {
        el.classList.remove("drag-over-top", "drag-over-bottom");
    });

    const target = getBlockAtPoint(x, y);
    if (!target || target === dragSrcBlock) return;

    const rect   = target.getBoundingClientRect();
    const midY   = rect.top + rect.height / 2;

    if (y < midY) {
        target.classList.add("drag-over-top");
    } else {
        target.classList.add("drag-over-bottom");
    }
}

function getBlockAtPoint(x, y) {
    // Sembunyikan ghost sementara agar tidak jadi target
    if (dragGhost) dragGhost.style.display = "none";
    const el = document.elementFromPoint(x, y);
    if (dragGhost) dragGhost.style.display = "";

    return el?.closest(".editor-block") || null;
}

function dropBlock(x, y) {
    if (!dragSrcBlock) return;

    const target = getBlockAtPoint(x, y);
    if (!target || target === dragSrcBlock) return;

    const rect = target.getBoundingClientRect();
    const midY = rect.top + rect.height / 2;

    if (y < midY) {
        editor.insertBefore(dragSrcBlock, target);
    } else {
        target.after(dragSrcBlock);
    }

    autoSave();
}

function endDrag() {
    dragSrcBlock?.classList.remove("dragging");
    dragSrcBlock = null;

    dragGhost?.remove();
    dragGhost = null;

    editor.querySelectorAll(".drag-over-top, .drag-over-bottom").forEach(el => {
        el.classList.remove("drag-over-top", "drag-over-bottom");
    });
}

function renderChecklist() {
    if (!checklistContainer || !checklistSection) return;

    // Selalu tampil — user bisa tambah item kapan saja
    checklistSection.style.display = "block";

    if (!note.checklist) note.checklist = [];

    checklistContainer.innerHTML = "";

    note.checklist.forEach((item, index) => {
        const row = document.createElement("div");
        row.className = "checklist-item";
        row.innerHTML = `
            <input type="checkbox" ${item.checked ? "checked" : ""} data-index="${index}">
            <span
                class="checklist-item-text ${item.checked ? "done" : ""}"
                contenteditable="true"
                data-index="${index}"
            >${item.text}</span>
            <button class="checklist-item-delete" data-index="${index}">
                <i class="bi bi-x"></i>
            </button>
        `;
        checklistContainer.appendChild(row);
    });

    updateChecklistProgress();
    bindChecklistEvents();
}

function updateChecklistProgress() {
    const total  = note.checklist?.length || 0;
    const done   = note.checklist?.filter(i => i.checked).length || 0;
    const pct    = total === 0 ? 0 : Math.round((done / total) * 100);

    const fill   = document.getElementById("checklistProgressFill");
    const text   = document.getElementById("checklistProgressText");
    const pctEl  = document.getElementById("checklistProgressPct");

    if (fill)  fill.style.width  = pct + "%";
    if (text)  text.textContent  = `${done} / ${total} done`;
    if (pctEl) pctEl.textContent = pct + "%";
}

function bindChecklistEvents() {
    // Toggle checked
    checklistContainer.querySelectorAll("input[type=checkbox]").forEach(cb => {
        cb.addEventListener("change", () => {
            const i = Number(cb.dataset.index);
            note.checklist[i].checked = cb.checked;
            cb.nextElementSibling.classList.toggle("done", cb.checked);
            saveChecklist();
            updateChecklistProgress();
        });
    });

    // Edit text inline
    checklistContainer.querySelectorAll(".checklist-item-text").forEach(span => {
        span.addEventListener("blur", () => {
            const i = Number(span.dataset.index);
            note.checklist[i].text = span.textContent.trim();
            saveChecklist();
        });
        span.addEventListener("keydown", e => {
            if (e.key === "Enter") { e.preventDefault(); span.blur(); }
        });
    });

    // Delete item
    checklistContainer.querySelectorAll(".checklist-item-delete").forEach(btn => {
        btn.addEventListener("click", () => {
            const i = Number(btn.dataset.index);
            note.checklist.splice(i, 1);
            saveChecklist();
            renderChecklist();
        });
    });
}

function saveChecklist() {
    updateNote(note.id, { checklist: note.checklist });
}

async function renderMedia() {

    if(!mediaContainer || !mediaSection) return;

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

    if(!reminderContainer || !reminderSection) return;

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

// ── View Mode ──────────────────────────────────────────
let isReadMode = false;

function toggleViewMode() {
    isReadMode = !isReadMode;

    document.body.classList.toggle("read-mode", isReadMode);

    // Toggle contenteditable semua blok
    editor.querySelectorAll(".editor-block").forEach(block => {
        block.contentEditable = isReadMode ? "false" : "true";
    });

    // Update icon tombol
    const icon = viewModeBtn.querySelector("i");
    if (isReadMode) {
        icon.className = "bi bi-eye-slash";
        viewModeBtn.title = "Switch to Edit mode";
    } else {
        icon.className = "bi bi-eye";
        viewModeBtn.title = "Switch to Read mode";
    }
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

// ── Tags ───────────────────────────────────────────────
function renderTags() {
    if (!tagsContainer) return;
    if (!note.tags) note.tags = [];

    tagsContainer.innerHTML = note.tags.map((tag, i) => `
        <span class="tag-pill">
            #${tag}
            <button class="tag-remove" data-index="${i}" title="Remove tag">
                <i class="bi bi-x"></i>
            </button>
        </span>
    `).join("");

    tagsContainer.querySelectorAll(".tag-remove").forEach(btn => {
        btn.addEventListener("click", () => {
            note.tags.splice(Number(btn.dataset.index), 1);
            saveTags();
            renderTags();
        });
    });
}

function addTag() {
    const raw = tagAddInput.value.trim().toLowerCase().replace(/\s+/g, "-");
    if (!raw) return;
    if (!note.tags) note.tags = [];
    if (note.tags.includes(raw)) {
        tagAddInput.value = "";
        return;
    }
    note.tags.push(raw);
    saveTags();
    renderTags();
    tagAddInput.value = "";
    tagAddInput.focus();
}

function saveTags() {
    updateNote(note.id, { tags: note.tags });
}

// ── Media Block ─────────────────────────────────────────
function insertMediaBlock(mediaItems, layout = "carousel") {
    const blockId = crypto.randomUUID();

    const div = document.createElement("div");
    div.className = "editor-block media";
    div.dataset.id      = blockId;
    div.dataset.type    = "media";
    div.dataset.layout  = layout;
    div.dataset.mediaIds = JSON.stringify(mediaItems.map(m => m.refId));
    div.contentEditable = false;

    div.innerHTML = `<div class="media-carousel-loading">
        <i class="bi bi-hourglass-split"></i> Loading...
    </div>`;

    // Sisipkan setelah block aktif, atau di akhir editor
    const activeBlock = getCurrentBlock();
    if (activeBlock) {
        activeBlock.after(div);
    } else {
        editor.appendChild(div);
    }

    div.setAttribute("tabindex", "0");
    div.addEventListener("keydown", (e) => {
        if (e.key === "Enter") {
            e.preventDefault();
            createNewBlockAfter(div);
        }
    });
    div.addEventListener("click", () => {
        div.focus();
    });
    renderMediaBlock(div, mediaItems, layout);
    autoSave();
}

// ── Media block dispatcher ──────────────────────────────
async function renderMediaBlock(blockEl, mediaItems, layout) {
    layout = layout || blockEl.dataset.layout || "carousel";

    if (!mediaItems || mediaItems.length === 0) {
        blockEl.innerHTML = "";
        return;
    }

    // Load semua URL
    const slides = [];
    for (const media of mediaItems) {
        const data = await getMedia(media.refId || media.id);
        if (!data) continue;
        const url = URL.createObjectURL(data.file);
        slides.push({ media, url, data });
    }

    if (!slides.length) { blockEl.innerHTML = ""; return; }

    if (layout === "row")      { buildRowLayout(blockEl, slides); return; }
    if (layout === "column")   { buildColumnLayout(blockEl, slides); return; }
    if (layout === "grid3")    { buildGrid3Layout(blockEl, slides); return; }
    if (layout === "grid2x2")  { buildGrid2x2Layout(blockEl, slides); return; }
    buildCarouselLayout(blockEl, slides);
}

// Keep old name as alias so nothing else breaks
const renderMediaCarousel = (blockEl, mediaItems) =>
    renderMediaBlock(blockEl, mediaItems, blockEl.dataset.layout || "carousel");

// ── Shared: layout switcher toolbar ─────────────────────
function buildLayoutToolbar(blockEl, slides, activeLayout) {
    const id = blockEl.dataset.id;
    return `
        <div class="media-layout-toolbar" data-block="${id}">
            <button class="media-layout-btn ${activeLayout === "carousel" ? "active" : ""}" data-layout="carousel" title="Carousel">
                <i class="bi bi-layout-sidebar-inset-reverse"></i>
            </button>
            <button class="media-layout-btn ${activeLayout === "row" ? "active" : ""}" data-layout="row" title="Row (scroll horizontal)">
                <i class="bi bi-layout-three-columns"></i>
            </button>
            <button class="media-layout-btn ${activeLayout === "column" ? "active" : ""}" data-layout="column" title="Column">
                <i class="bi bi-layout-split"></i>
            </button>
            <button class="media-layout-btn ${activeLayout === "grid3" ? "active" : ""}" data-layout="grid3" title="Grid 3 kolom">
                <i class="bi bi-grid-3x2-gap"></i>
            </button>
            <button class="media-layout-btn ${activeLayout === "grid2x2" ? "active" : ""}" data-layout="grid2x2" title="Grid 2x2">
                <i class="bi bi-grid-fill"></i>
            </button>
            <button class="media-carousel-del ml-auto" data-block="${id}" title="Hapus block ini">
                <i class="bi bi-trash3"></i>
            </button>
        </div>
    `;
}

function attachLayoutSwitcher(blockEl, slides) {
    // ── Layout switcher buttons ──────────────────────────
    blockEl.querySelectorAll(".media-layout-btn").forEach(btn => {
        btn.addEventListener("click", (e) => {
            e.stopPropagation();
            const newLayout = btn.dataset.layout;
            blockEl.dataset.layout = newLayout;
            renderMediaBlock(blockEl, slides.map(s => s.media), newLayout);
            autoSave();
        });
    });

    blockEl.querySelector(".media-carousel-del")?.addEventListener("click", async (e) => {
        e.stopPropagation();
        if (!confirm("Hapus attachment ini?")) return;
        const ids = JSON.parse(blockEl.dataset.mediaIds || "[]");
        for (const id of ids) {
            await deleteMedia(id);
            note.media = (note.media || []).filter(m => m.refId !== id);
        }
        updateNote(note.id, { media: note.media });
        blockEl.remove();
        autoSave();
    });

    // ── Click-to-preview ────────────────────────────────
    attachPreviewClicks(blockEl, slides);
}

// ── Click-to-preview: pasang ke semua img/video/audio/file di block ──
function attachPreviewClicks(blockEl, slides) {
    // Carousel: klik pada slide area (bukan nav/footer)
    const track = blockEl.querySelector(".media-carousel-track");
    if (track) {
        track.querySelectorAll(".media-carousel-slide").forEach((slide, i) => {
            slide.addEventListener("click", (e) => {
                e.stopPropagation();
                window.openLightbox(slides, i);
            });
            slide.style.cursor = "zoom-in";
        });
    }

    // Row, grid: klik per item
    blockEl.querySelectorAll(
        ".media-row-item, .media-grid-item, .media-column-item"
    ).forEach((item, i) => {
        item.addEventListener("click", (e) => {
            e.stopPropagation();
            window.openLightbox(slides, i);
        });
        item.style.cursor = "zoom-in";
    });
}

// ── Layout 1: Carousel ──────────────────────────────────
function buildCarouselLayout(blockEl, slides) {
    const id    = blockEl.dataset.id;
    const total = slides.length;
    let current = 0;

    blockEl.innerHTML = `
        ${buildLayoutToolbar(blockEl, slides, "carousel")}
        <div class="media-carousel">
            <div class="media-carousel-track" id="track_${id}">
                ${slides.map(({ media, url }) => `
                    <div class="media-carousel-slide">
                        ${getSlideContent(media, url)}
                    </div>
                `).join("")}
            </div>

            ${total > 1 ? `
                <button class="media-carousel-nav prev" id="prev_${id}">
                    <i class="bi bi-chevron-left"></i>
                </button>
                <button class="media-carousel-nav next" id="next_${id}">
                    <i class="bi bi-chevron-right"></i>
                </button>
            ` : ""}

            <div class="media-carousel-footer">
                <span class="media-carousel-filename" id="fname_${id}">
                    ${slides[0].media.filename}
                </span>
                <div class="media-carousel-dots" id="dots_${id}">
                    ${slides.map((_, i) => `
                        <div class="media-carousel-dot ${i === 0 ? "active" : ""}"></div>
                    `).join("")}
                </div>
            </div>
        </div>
    `;

    const track   = blockEl.querySelector(`#track_${id}`);
    const dots    = blockEl.querySelectorAll(".media-carousel-dot");
    const fname   = blockEl.querySelector(`#fname_${id}`);
    const prevBtn = blockEl.querySelector(`#prev_${id}`);
    const nextBtn = blockEl.querySelector(`#next_${id}`);

    function goTo(index) {
        current = index;
        track.style.transform = `translateX(-${current * 100}%)`;
        dots.forEach((d, i) => d.classList.toggle("active", i === current));
        fname.textContent = slides[current].media.filename;
        if (prevBtn) prevBtn.disabled = current === 0;
        if (nextBtn) nextBtn.disabled = current === total - 1;
    }

    prevBtn?.addEventListener("click", () => { if (current > 0) goTo(current - 1); });
    nextBtn?.addEventListener("click", () => { if (current < total - 1) goTo(current + 1); });

    let startX = 0;
    track.addEventListener("touchstart", e => { startX = e.touches[0].clientX; });
    track.addEventListener("touchend",   e => {
        const diff = startX - e.changedTouches[0].clientX;
        if (diff > 40 && current < total - 1) goTo(current + 1);
        if (diff < -40 && current > 0) goTo(current - 1);
    });

    goTo(0);
    attachLayoutSwitcher(blockEl, slides);
}

// ── Layout 2: Row (horizontal scroll) ──────────────────
function buildRowLayout(blockEl, slides) {
    blockEl.innerHTML = `
        ${buildLayoutToolbar(blockEl, slides, "row")}
        <div class="media-row">
            ${slides.map(({ media, url }) => `
                <div class="media-row-item">
                    ${getSlideContent(media, url)}
                    <div class="media-row-filename">${media.filename}</div>
                </div>
            `).join("")}
        </div>
    `;
    attachLayoutSwitcher(blockEl, slides);
}

// ── Layout 3: Column ────────────────────────────────────
function buildColumnLayout(blockEl, slides) {
    blockEl.innerHTML = `
        ${buildLayoutToolbar(blockEl, slides, "column")}
        <div class="media-column">
            ${slides.map(({ media, url }) => `
                <div class="media-column-item">
                    ${getSlideContent(media, url)}
                    <div class="media-column-filename">${media.filename}</div>
                </div>
            `).join("")}
        </div>
    `;
    attachLayoutSwitcher(blockEl, slides);
}

// ── Layout 4: Grid 3x1 (3 kolom, banyak baris) ──────────
function buildGrid3Layout(blockEl, slides) {
    blockEl.innerHTML = `
        ${buildLayoutToolbar(blockEl, slides, "grid3")}
        <div class="media-grid media-grid-3">
            ${slides.map(({ media, url }) => `
                <div class="media-grid-item">
                    ${getSlideContent(media, url)}
                    <div class="media-grid-filename">${media.filename}</div>
                </div>
            `).join("")}
        </div>
    `;
    attachLayoutSwitcher(blockEl, slides);
}

// ── Layout 5: Grid 2x2 ──────────────────────────────────
function buildGrid2x2Layout(blockEl, slides) {
    // Tampilkan max 4 item, sisanya dengan overlay "+N"
    const visible = slides.slice(0, 4);
    const extra   = slides.length - 4;

    blockEl.innerHTML = `
        ${buildLayoutToolbar(blockEl, slides, "grid2x2")}
        <div class="media-grid media-grid-2x2">
            ${visible.map(({ media, url }, i) => `
                <div class="media-grid-item ${i === 3 && extra > 0 ? "has-more" : ""}">
                    ${getSlideContent(media, url)}
                    ${i === 3 && extra > 0 ? `<div class="media-grid-more">+${extra + 1}</div>` : ""}
                    <div class="media-grid-filename">${media.filename}</div>
                </div>
            `).join("")}
        </div>
    `;
    attachLayoutSwitcher(blockEl, slides);
}

// ══════════════════════════════════════════════════════════
// ── Media Preview Lightbox ────────────────────────────────
// ══════════════════════════════════════════════════════════
(function initLightbox() {
    const lb        = document.getElementById("mediaLightbox");
    const backdrop  = lb?.querySelector(".media-lightbox-backdrop");
    const body      = document.getElementById("lightboxBody");
    const title     = document.getElementById("lightboxTitle");
    const counter   = document.getElementById("lightboxCounter");
    const download  = document.getElementById("lightboxDownload");
    const closeBtn  = document.getElementById("lightboxClose");
    const prevBtn   = document.getElementById("lightboxPrev");
    const nextBtn   = document.getElementById("lightboxNext");
    const dotsWrap  = document.getElementById("lightboxDots");

    if (!lb) return;

    let slides  = [];   // [{ media, url }]
    let current = 0;
    let objectURLs = [];

    // ── Open ────────────────────────────────────────────
    window.openLightbox = function(slideList, startIndex = 0) {
        slides    = slideList;
        current   = startIndex;
        objectURLs = slideList.map(s => s.url);

        buildDots();
        showSlide(current);

        lb.classList.add("open");
        document.body.style.overflow = "hidden";
    };

    // ── Close ───────────────────────────────────────────
    function closeLightbox() {
        lb.classList.remove("open");
        document.body.style.overflow = "";
        body.innerHTML = "";
        slides = [];
        objectURLs = [];
    }

    closeBtn?.addEventListener("click", closeLightbox);
    backdrop?.addEventListener("click", closeLightbox);

    // ── Navigation ──────────────────────────────────────
    function showSlide(index) {
        current = Math.max(0, Math.min(index, slides.length - 1));
        const { media, url } = slides[current];

        // Content
        body.innerHTML = getPreviewContent(media, url);

        // Header
        title.textContent   = media.filename;
        counter.textContent = slides.length > 1 ? `${current + 1} / ${slides.length}` : "";
        download.href       = url;
        download.download   = media.filename;

        // Nav buttons
        prevBtn.style.display = (slides.length > 1 && current > 0)               ? "" : "none";
        nextBtn.style.display = (slides.length > 1 && current < slides.length - 1) ? "" : "none";

        // Dots
        dotsWrap.querySelectorAll(".lb-dot").forEach((d, i) =>
            d.classList.toggle("active", i === current)
        );

        // Pinch-zoom reset
        resetZoom();
    }

    prevBtn?.addEventListener("click", () => showSlide(current - 1));
    nextBtn?.addEventListener("click", () => showSlide(current + 1));

    // ── Dots ────────────────────────────────────────────
    function buildDots() {
        dotsWrap.innerHTML = "";
        if (slides.length <= 1) return;
        slides.forEach((_, i) => {
            const d = document.createElement("div");
            d.className = "lb-dot" + (i === 0 ? " active" : "");
            d.addEventListener("click", () => showSlide(i));
            dotsWrap.appendChild(d);
        });
    }

    // ── Keyboard ────────────────────────────────────────
    document.addEventListener("keydown", (e) => {
        if (!lb.classList.contains("open")) return;
        if (e.key === "ArrowLeft")  showSlide(current - 1);
        if (e.key === "ArrowRight") showSlide(current + 1);
        if (e.key === "Escape")     closeLightbox();
    });

    // ── Swipe (touch) ───────────────────────────────────
    let touchStartX = 0, touchStartY = 0;
    body.addEventListener("touchstart", e => {
        touchStartX = e.touches[0].clientX;
        touchStartY = e.touches[0].clientY;
    }, { passive: true });
    body.addEventListener("touchend", e => {
        const dx = touchStartX - e.changedTouches[0].clientX;
        const dy = Math.abs(touchStartY - e.changedTouches[0].clientY);
        if (Math.abs(dx) > 50 && dy < 60) {
            if (dx > 0) showSlide(current + 1);
            else        showSlide(current - 1);
        }
    }, { passive: true });

    // ── Pinch-zoom (images only) ─────────────────────────
    let scale = 1, lastScale = 1;
    let originX = 0, originY = 0;
    let isDragging = false, dragStartX = 0, dragStartY = 0;
    let panX = 0, panY = 0, lastPanX = 0, lastPanY = 0;

    function resetZoom() {
        scale = 1; lastScale = 1;
        panX  = 0; panY  = 0; lastPanX = 0; lastPanY = 0;
        applyTransform();
    }

    function applyTransform() {
        const img = body.querySelector("img");
        if (!img) return;
        img.style.transform       = `translate(${panX}px, ${panY}px) scale(${scale})`;
        img.style.transformOrigin = `${originX}px ${originY}px`;
        img.style.cursor          = scale > 1 ? "grab" : "default";
    }

    body.addEventListener("touchstart", e => {
        if (e.touches.length === 2) {
            const dx = e.touches[1].clientX - e.touches[0].clientX;
            const dy = e.touches[1].clientY - e.touches[0].clientY;
            lastScale = Math.hypot(dx, dy);
            const rect = body.getBoundingClientRect();
            originX = (e.touches[0].clientX + e.touches[1].clientX) / 2 - rect.left;
            originY = (e.touches[0].clientY + e.touches[1].clientY) / 2 - rect.top;
        } else if (e.touches.length === 1 && scale > 1) {
            isDragging = true;
            dragStartX = e.touches[0].clientX - panX;
            dragStartY = e.touches[0].clientY - panY;
        }
    }, { passive: true });

    body.addEventListener("touchmove", e => {
        if (e.touches.length === 2) {
            e.preventDefault();
            const dx = e.touches[1].clientX - e.touches[0].clientX;
            const dy = e.touches[1].clientY - e.touches[0].clientY;
            const newDist = Math.hypot(dx, dy);
            scale = Math.min(5, Math.max(1, scale * (newDist / lastScale)));
            lastScale = newDist;
            applyTransform();
        } else if (isDragging && scale > 1) {
            panX = e.touches[0].clientX - dragStartX;
            panY = e.touches[0].clientY - dragStartY;
            applyTransform();
        }
    }, { passive: false });

    body.addEventListener("touchend", e => {
        if (e.touches.length === 0) {
            isDragging = false;
            if (scale < 1.1) resetZoom();
        }
    }, { passive: true });

    // Double-tap to zoom
    let lastTap = 0;
    body.addEventListener("touchend", e => {
        const img = body.querySelector("img");
        if (!img) return;
        const now = Date.now();
        if (now - lastTap < 300) {
            if (scale > 1) { resetZoom(); }
            else {
                const rect = body.getBoundingClientRect();
                originX = e.changedTouches[0].clientX - rect.left;
                originY = e.changedTouches[0].clientY - rect.top;
                scale = 2.5;
                applyTransform();
            }
        }
        lastTap = now;
    }, { passive: true });

    // ── Content builder ─────────────────────────────────
    function getPreviewContent(media, url) {
        const type = media.type || media.mimeType?.split("/")[0];
        if (type === "photo" || type === "image" || type === "gif") {
            return `<img src="${url}" alt="${media.filename}" draggable="false">`;
        }
        if (type === "video") {
            return `<video controls autoplay playsinline>
                        <source src="${url}" type="${media.mimeType}">
                    </video>`;
        }
        if (type === "voice" || type === "audio") {
            return `<div class="lb-audio-wrap">
                        <i class="bi bi-music-note-beamed lb-audio-icon"></i>
                        <audio controls autoplay>
                            <source src="${url}" type="${media.mimeType}">
                        </audio>
                        <p class="lb-audio-name">${media.filename}</p>
                    </div>`;
        }
        return `<div class="lb-file-wrap">
                    <i class="bi bi-file-earmark lb-file-icon"></i>
                    <p class="lb-file-name">${media.filename}</p>
                </div>`;
    }
})();

function getSlideContent(media, url) {
    const type = media.type || media.mimeType?.split("/")[0];
    if (type === "photo" || type === "image" || type === "gif") {
        return `<img src="${url}" alt="${media.filename}">`;
    }
    if (type === "video") {
        return `<video controls><source src="${url}" type="${media.mimeType}"></video>`;
    }
    if (type === "voice" || type === "audio") {
        return `<audio controls><source src="${url}" type="${media.mimeType}"></audio>`;
    }
    return `
        <div class="media-file-thumb">
            <i class="bi bi-file-earmark"></i>
            <span>${media.filename}</span>
        </div>
    `;
}