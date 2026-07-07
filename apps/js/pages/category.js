import {
    initTheme
} from "../services/themeService.js";

initTheme();

import {
    getChildFolders,
    getBreadcrumb,
    getFolderNoteCount,
    getFolderStats,
    getNotesInParent,
    createFolder,
    renameFolder,
    deleteFolder
} from "../services/folderService.js";

const { App: CapApp } = window.Capacitor?.Plugins || {};

if (CapApp) {
    CapApp.addListener("backButton", ({ canGoBack }) => {
        if (canGoBack) window.history.back();
        else window.location.href = "dashboard.html";
    });
}

const explorerBreadcrumb = document.getElementById("explorerBreadcrumb");
const explorerList       = document.getElementById("explorerList");
const categoryStats      = document.getElementById("categoryStats");
const newFolderInput     = document.getElementById("newFolderInput");
const newFolderBtn       = document.getElementById("newFolderBtn");

// folder yang sedang dibuka (null = root)
let currentFolderId = null;

let currentParentType = null;

init();

function init(){

    currentParentType = null;

    newFolderBtn.addEventListener("click", handleCreateFolder);

    newFolderInput.addEventListener("keydown", event=>{

        if(event.key === "Enter"){
            event.preventDefault();
            handleCreateFolder();
        }

    });

    render();

}

function render(){

    renderStats();
    renderBreadcrumb();
    renderList();
    updateAddNoteLink();

}

function renderStats(){

    const stats = getFolderStats();

    categoryStats.textContent = stats.text;

}

function renderBreadcrumb(){

    const path = getBreadcrumb(currentFolderId);

    explorerBreadcrumb.innerHTML = `

        <a data-nav="root" class="${!path.length ? "current" : ""}">
            <i class="bi bi-house-door-fill"></i> Home
        </a>

        ${path.map((folder, index)=>`

            <span class="sep">/</span>

            <a
                data-nav="${folder.id}"
                class="${index === path.length - 1 ? "current" : ""}"
            >
                ${folder.name}
            </a>

        `).join("")}

    `;

    explorerBreadcrumb.querySelectorAll("[data-nav]").forEach(link=>{

        link.addEventListener("click", ()=>{

            if (link.dataset.nav === "root") {

                currentFolderId = null;
                currentParentType = null;

            } else {

                currentFolderId = link.dataset.nav;
                currentParentType = "folder";

            }

            render();

        });

    });

}

function renderList(){

    const folders = getChildFolders(

        currentFolderId,

        currentParentType

    );
  
    const notes = getNotesInParent(

        currentFolderId,

        currentParentType

    );

    if(!folders.length && !notes.length){

        explorerList.innerHTML = `

            <div class="explorer-empty">
                <i class="bi bi-folder2-open"></i>
                <h5>Empty Folder</h5>
                <p>Create a subfolder above, or add a note here from the Add Note form.</p>
            </div>

        `;

        return;

    }

    const folderRows = folders.map(folder=>{

        const count = getFolderNoteCount(folder.id, true);

        const childFolders = getChildFolders(
            folder.id,
            "folder"
        ).length;

        return `

            <div class="explorer-row" data-type="folder" data-id="${folder.id}">

                <div
                    class="explorer-row-icon"
                    style="background:${folder.color}22;color:${folder.color}"
                >
                    <i class="${folder.icon || "bi bi-folder-fill"}"></i>
                </div>

                <div class="explorer-row-body">
                    <div class="explorer-row-title">${folder.name}</div>
                    <div class="explorer-row-meta">

                        ${childFolders} folders • ${count} notes

                    </div>
                </div>

                <div class="explorer-row-actions">

                    <button type="button" data-action="rename" data-id="${folder.id}">
                        <i class="bi bi-pencil"></i>
                    </button>

                    <button type="button" data-action="delete" data-id="${folder.id}">
                        <i class="bi bi-trash"></i>
                    </button>

                </div>

                <i class="bi bi-chevron-right"></i>

            </div>

        `;

    }).join("");

    const noteRows = notes.map(note=>`

        <div class="explorer-row" data-type="note" data-id="${note.id}">

            <div class="explorer-row-icon" style="background:var(--primary-light);color:var(--primary)">
                <i class="bi bi-file-earmark-text-fill"></i>
            </div>

            <div class="explorer-row-body">
                <div class="explorer-row-title">
                    ${note.title ? note.title : getPreview(note.blocks?.[0]?.text)}
                </div>
                <div class="explorer-row-meta">${formatTime(note.date)}</div>
            </div>

            <i class="bi bi-chevron-right"></i>

        </div>

    `).join("");

    explorerList.innerHTML = folderRows + noteRows;

    bindRowEvents();

}

function bindRowEvents(){

    explorerList.querySelectorAll(".explorer-row").forEach(row=>{

        row.addEventListener("click", event=>{

            // Jangan navigasi kalau yang diklik adalah tombol aksi
            if(event.target.closest("[data-action]")) return;

            if(row.dataset.type === "folder"){
                currentFolderId = row.dataset.id;

                currentParentType = "folder";

                render();
            }else{
                window.location.href = `note-detail.html?id=${row.dataset.id}`;
            }

        });

    });

    explorerList.querySelectorAll("[data-action='rename']").forEach(button=>{

        button.addEventListener("click", ()=>{

            const folder = getChildFolders(

                currentFolderId,

                currentParentType

            )
                .find(item => item.id === button.dataset.id);

            const newName = prompt("Rename folder", folder?.name || "");

            if(!newName) return;

            if(!renameFolder(button.dataset.id, newName)){
                alert("A folder with that name already exists here.");
                return;
            }

            render();

        });

    });

    explorerList.querySelectorAll("[data-action='delete']").forEach(button=>{

        button.addEventListener("click", ()=>{

            const noteCount = getFolderNoteCount(button.dataset.id, true);

            const confirmMessage = noteCount > 0
                ? `Delete this folder and its ${noteCount} note(s) inside (including subfolders)? This cannot be undone.`
                : "Delete this empty folder?";

            if(!confirm(confirmMessage)) return;

            deleteFolder(button.dataset.id);

            render();

        });

    });

}

function updateAddNoteLink() {
    const btn = document.getElementById("navAddNote");
    if (!btn) return;
    btn.href = currentFolderId
        ? `add-note.html?parentId=${currentFolderId}&parentType=folder`
        : "add-note.html";
}

function handleCreateFolder(){

    const value = newFolderInput.value.trim();

    if(!value) return;

    const folder = createFolder(

        value,

        currentFolderId,

        currentParentType

    );

    if(!folder){
        alert("A folder with that name already exists here.");
        return;
    }

    newFolderInput.value = "";

    render();

}

function getPreview(text){

    if(!text) return "Untitled";

    return text.length > 40
        ? text.substring(0, 40) + "..."
        : text;

}

function formatTime(date){

    return new Date(date).toLocaleTimeString(
        "en-US",
        { hour: "2-digit", minute: "2-digit" }
    );

}
