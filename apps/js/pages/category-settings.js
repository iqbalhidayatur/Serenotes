import {
    initTheme
} from "../services/themeService.js";

initTheme();

import {
    getFlatFolderList,
    getFolderNoteCount,
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

const categoryList =
    document.getElementById("categoryList");

const addCategoryBtn =
    document.getElementById("addCategoryBtn");

const saveCategoryBtn =
    document.getElementById("saveCategoryBtn");

const categoryName =
    document.getElementById("categoryName");

const parentFolderSelect =
    document.getElementById("parentFolderSelect");

const modal = new bootstrap.Modal(
    document.getElementById("categoryModal")
);

renderFolders();

addCategoryBtn.addEventListener(
    "click",
    ()=>{

        categoryName.value = "";

        renderParentFolderOptions();

        modal.show();

    }
);

saveCategoryBtn.addEventListener(
    "click",
    saveFolder
);

function renderParentFolderOptions(){

    const folders = getFlatFolderList();

    parentFolderSelect.innerHTML = `
        <option value="">Top Level</option>
    `;

    folders.forEach(folder=>{

        parentFolderSelect.innerHTML += `
            <option value="${folder.id}">
                ${"— ".repeat(folder.depth)}${folder.name}
            </option>
        `;

    });

}

function renderFolders(){

    categoryList.innerHTML = "";

    const folders = getFlatFolderList();

    if(!folders.length){

        categoryList.innerHTML = `
            <p class="text-secondary text-center py-4">
                No folders yet. Create one above.
            </p>
        `;

        return;

    }

    folders.forEach(folder=>{

        categoryList.innerHTML += createCard(folder);

    });

    bindEvents();

}

function createCard(folder){

    return `

    <div
        class="category-setting-card mb-3"
        data-id="${folder.id}"
        style="margin-left:${folder.depth * 20}px"
    >

        <div
            class="d-flex justify-content-between align-items-center"
        >

            <div>

                <h5>

                    <i class="${folder.icon}" style="color:${folder.color}"></i>

                    ${folder.name}

                </h5>

                <small>

                    ${getFolderNoteCount(folder.id, true)}

                    Notes

                </small>

            </div>

        </div>

        <div
            class="d-flex gap-2 mt-3"
        >

            <button
                class="btn btn-outline-primary btn-sm add-sub"
                data-id="${folder.id}"
            >

                Add Subfolder

            </button>

            <button
                class="btn btn-outline-secondary btn-sm rename-folder"
                data-id="${folder.id}"
            >

                Rename

            </button>

            <button
                class="btn btn-outline-danger btn-sm delete-category"
                data-id="${folder.id}"
            >

                Delete

            </button>

        </div>

    </div>

    `;

}

function bindEvents(){

    document
        .querySelectorAll(".delete-category")
        .forEach(button=>{

            button.addEventListener("click",()=>{

                const noteCount =
                    getFolderNoteCount(button.dataset.id, true);

                const message = noteCount > 0
                    ? `Delete this folder and its ${noteCount} note(s) inside (including subfolders)? This cannot be undone.`
                    : "Delete this empty folder?";

                if(!confirm(message)) return;

                deleteFolder(button.dataset.id);

                renderFolders();

            });

        });

    document
        .querySelectorAll(".add-sub")
        .forEach(button=>{

            button.addEventListener("click",()=>{

                const value = prompt("Subfolder name");

                if(!value) return;

                if(!createFolder(value, button.dataset.id)){
                    alert("A folder with that name already exists here.");
                    return;
                }

                renderFolders();

            });

        });

    document
        .querySelectorAll(".rename-folder")
        .forEach(button=>{

            button.addEventListener("click",()=>{

                const folder = getFlatFolderList()
                    .find(item => item.id === button.dataset.id);

                const value = prompt("Rename folder", folder?.name || "");

                if(!value) return;

                if(!renameFolder(button.dataset.id, value)){
                    alert("A folder with that name already exists here.");
                    return;
                }

                renderFolders();

            });

        });

}

function saveFolder(){

    const name =
        categoryName.value.trim();

    if(name === ""){
        return;
    }

    const parentId = parentFolderSelect.value || null;

    if(!createFolder(name, parentId)){
        alert("A folder with that name already exists here.");
        return;
    }

    modal.hide();

    renderFolders();

}
