import {

    initTheme

} from "../services/themeService.js";

initTheme();

import {
    getAllBoards,
    createBoard,
    deleteBoard,
    createCard,
    deleteCard,
    moveCard,
    getColumnOfCard,
    addColumn,
    renameColumn,
    deleteColumn,
    updateCardCover
} from "../services/boardService.js";

const { App: CapApp } = window.Capacitor?.Plugins || {};

if (CapApp) {
    CapApp.addListener("backButton", ({ canGoBack }) => {
        if (canGoBack) window.history.back();
        else window.location.href = "dashboard.html";
    });
}

let activeBoard = null;

const boardList     = document.getElementById("boardList");
const boardView     = document.getElementById("boardView");
const boardTitle    = document.getElementById("boardTitle");
const columnsWrap   = document.getElementById("columnsWrap");
const newBoardBtn   = document.getElementById("newBoardBtn");
const backBtn       = document.getElementById("backBtn");

newBoardBtn.addEventListener("click", () => {
    const name = prompt("Board name:");
    if (!name?.trim()) return;
    createBoard(name.trim());
    renderBoardList();
});

const fabBtn = document.getElementById("newBoardBtn");

backBtn.addEventListener("click", () => {
    boardView.classList.add("d-none");
    boardList.classList.remove("d-none");
    fabBtn.classList.remove("d-none");
    backBtn.classList.add("d-none");
    activeBoard = null;
    renderBoardList();
});

renderBoardList();

function renderBoardList() {
    const boards = getAllBoards();
    const listEl = document.getElementById("boardsGrid");
    listEl.innerHTML = "";

    if (!boards.length) {
        listEl.innerHTML = `
            <div class="board-empty">
                <i class="bi bi-kanban"></i>
                <p>No boards yet. Create one!</p>
            </div>
        `;
        return;
    }

    boards.forEach(board => {
        const totalCards = board.columns.reduce((s, c) => s + c.cards.length, 0);
        listEl.innerHTML += `
            <div class="board-card" data-id="${board.id}">
                <div class="board-card-icon"><i class="bi bi-kanban-fill"></i></div>
                <div class="board-card-info">
                    <h5>${board.name}</h5>
                    <span>${totalCards} card${totalCards !== 1 ? "s" : ""}</span>
                </div>
                <button class="btn-delete-board" data-id="${board.id}">
                    <i class="bi bi-trash3"></i>
                </button>
            </div>
        `;
    });

    listEl.querySelectorAll(".board-card").forEach(el => {
        el.addEventListener("click", (e) => {
            if (e.target.closest(".btn-delete-board")) return;
            openBoard(el.dataset.id);
        });
    });

    listEl.querySelectorAll(".btn-delete-board").forEach(btn => {
        btn.addEventListener("click", (e) => {
            e.stopPropagation();
            if (!confirm("Delete this board?")) return;
            deleteBoard(btn.dataset.id);
            renderBoardList();
        });
    });
}

function openBoard(boardId) {
    const boards = getAllBoards();
    activeBoard  = boards.find(b => b.id === boardId);
    if (!activeBoard) return;

    boardTitle.textContent = activeBoard.name;
    boardList.classList.add("d-none");
    boardView.classList.remove("d-none");
    fabBtn.classList.add("d-none");        // ← tambah
    backBtn.classList.remove("d-none");    // ← tambah

    renderColumns();
}

function renderColumns() {
    columnsWrap.innerHTML = "";

    activeBoard.columns.forEach(column => {
        const colEl = document.createElement("div");
        colEl.className = "kanban-col";
        colEl.dataset.colId = column.id;
        colEl.innerHTML = `
            <div class="kanban-col-header">
                <span class="kanban-col-name" data-col-id="${column.id}">${column.name}</span>
                <div class="d-flex align-items-center gap-1">
                    <span class="kanban-col-count">${column.cards.length}</span>
                    <button class="kanban-col-menu-btn" data-col-id="${column.id}" title="Column options">
                        <i class="bi bi-three-dots"></i>
                    </button>
                </div>
            </div>
            <div class="kanban-cards" id="col-${column.id}">
                ${column.cards.map(card => createCardHTML(card, column.id)).join("")}
            </div>
            <button class="kanban-add-card" data-col-id="${column.id}">
                <i class="bi bi-plus"></i> Add card
            </button>
        `;
        columnsWrap.appendChild(colEl);
    });

    // Tombol tambah kolom baru
    const addColEl = document.createElement("div");
    addColEl.className = "kanban-add-col";
    addColEl.innerHTML = `
        <button id="addColBtn" class="kanban-add-col-btn">
            <i class="bi bi-plus"></i> Add column
        </button>
    `;
    columnsWrap.appendChild(addColEl);

    // Add column
    document.getElementById("addColBtn").addEventListener("click", () => {
        const name = prompt("Column name:");
        if (!name?.trim()) return;
        addColumn(activeBoard.id, name.trim());
        refreshBoard();
    });

    // Column header: klik nama untuk rename
    columnsWrap.querySelectorAll(".kanban-col-name").forEach(el => {
        el.addEventListener("click", () => {
            const colId = el.dataset.colId;
            const current = el.textContent.trim();
            const newName = prompt("Rename column:", current);
            if (!newName?.trim() || newName.trim() === current) return;
            renameColumn(activeBoard.id, colId, newName.trim());
            refreshBoard();
        });
    });

    // Column menu (delete)
    columnsWrap.querySelectorAll(".kanban-col-menu-btn").forEach(btn => {
        btn.addEventListener("click", (e) => {
            e.stopPropagation();
            const colId = btn.dataset.colId;
            showColumnMenu(btn, colId);
        });
    });

    // Add card
    columnsWrap.querySelectorAll(".kanban-add-card").forEach(btn => {
        btn.addEventListener("click", () => {
            const title = prompt("Card title:");
            if (!title?.trim()) return;
            createCard(activeBoard.id, btn.dataset.colId, title.trim());
            refreshBoard();
        });
    });

    // Open card detail
    columnsWrap.querySelectorAll(".kanban-card").forEach(el => {
        el.addEventListener("click", (e) => {
            if (e.target.closest(".kanban-card-delete")) return;
            openCardDetail(el.dataset.cardId, el.dataset.colId);
        });
    });

    // Delete card
    columnsWrap.querySelectorAll(".kanban-card-delete").forEach(btn => {
        btn.addEventListener("click", (e) => {
            e.stopPropagation();
            if (!confirm("Delete this card?")) return;
            deleteCard(activeBoard.id, btn.dataset.colId, btn.dataset.cardId);
            refreshBoard();
        });
    });
}

function createCardHTML(card, colId) {
    const total = card.checklist.length;
    const done  = card.checklist.filter(i => i.done).length;
    return `
        <div class="kanban-card" data-card-id="${card.id}" data-col-id="${colId}">
            ${card.cover ? `<img src="${card.cover}" class="kanban-card-cover" alt="cover">` : ""}
            <div class="kanban-card-title">${card.title}</div>
            ${card.description ? `<div class="kanban-card-desc">${card.description}</div>` : ""}
            ${total ? `
                <div class="kanban-card-checklist">
                    <i class="bi bi-check2-square"></i> ${done}/${total}
                </div>` : ""}
            <button class="kanban-card-delete" data-card-id="${card.id}" data-col-id="${colId}">
                <i class="bi bi-x"></i>
            </button>
        </div>
    `;
}

function showColumnMenu(anchorBtn, colId) {
    // Hapus menu lama jika ada
    document.getElementById("colContextMenu")?.remove();

    const menu = document.createElement("div");
    menu.id = "colContextMenu";
    menu.className = "col-context-menu";
    menu.innerHTML = `
        <button id="menuDeleteCol" class="col-context-item text-danger">
            <i class="bi bi-trash3"></i> Delete column
        </button>
    `;
    document.body.appendChild(menu);

    const rect = anchorBtn.getBoundingClientRect();
    menu.style.top  = `${rect.bottom + 6}px`;
    menu.style.left = `${rect.left}px`;

    menu.querySelector("#menuDeleteCol").addEventListener("click", () => {
        const col = activeBoard.columns.find(c => c.id === colId);
        if (col?.cards.length) {
            if (!confirm(`Column "${col.name}" has ${col.cards.length} card(s). Delete anyway?`)) {
                menu.remove();
                return;
            }
        }
        deleteColumn(activeBoard.id, colId);
        menu.remove();
        refreshBoard();
    });

    setTimeout(() => {
        document.addEventListener("click", () => menu.remove(), { once: true });
    }, 0);
}

function openCardDetail(cardId, colId) {
    const column = activeBoard.columns.find(c => c.id === colId);
    const card   = column?.cards.find(c => c.id === cardId);
    if (!card) return;

    // Remove existing modal
    document.getElementById("cardDetailModal")?.remove();

    const modal = document.createElement("div");
    modal.id    = "cardDetailModal";
    modal.innerHTML = `
        <div class="modal-backdrop-custom"></div>
        <div class="card-detail-sheet">
            <div class="modal-sheet-handle"></div>

            <input class="card-detail-title" value="${card.title}" placeholder="Card title">

            <textarea class="card-detail-desc" placeholder="Add description...">${card.description || ""}</textarea>

            <div class="card-detail-cover-section">
                ${card.cover
                    ? `<img src="${card.cover}" class="card-detail-cover-preview" id="coverPreview">`
                    : `<div class="card-detail-cover-empty" id="coverPreview"></div>`
                }
                <div class="d-flex gap-2 mt-2">
                    <label class="btn btn-sm btn-outline-primary rounded-pill flex-grow-1 text-center" style="cursor:pointer">
                        <i class="bi bi-image"></i> ${card.cover ? "Change cover" : "Add cover"}
                        <input type="file" id="coverInput" accept="image/*" style="display:none">
                    </label>
                    ${card.cover ? `<button id="removeCoverBtn" class="btn btn-sm btn-outline-danger rounded-pill"><i class="bi bi-x"></i></button>` : ""}
                </div>
            </div>

            <div class="card-detail-move">
                <label>Move to</label>
                <div class="card-detail-cols">
                    ${activeBoard.columns.map(c => `
                        <button class="move-btn ${c.id === colId ? "active" : ""}" data-col-id="${c.id}">
                            ${c.name}
                        </button>
                    `).join("")}
                </div>
            </div>

            <div class="card-detail-checklist">
                <h6><i class="bi bi-check2-square"></i> Checklist</h6>
                <div id="checklistItems">
                    ${card.checklist.map(item => `
                        <div class="checklist-item" data-item-id="${item.id}">
                            <input type="checkbox" ${item.done ? "checked" : ""} class="checklist-check">
                            <span class="${item.done ? "done" : ""}">${item.text}</span>
                            <button class="checklist-delete" data-item-id="${item.id}">
                                <i class="bi bi-x"></i>
                            </button>
                        </div>
                    `).join("")}
                </div>
                <div class="checklist-add">
                    <input type="text" id="newCheckItem" placeholder="Add item...">
                    <button id="addCheckItem"><i class="bi bi-plus"></i></button>
                </div>
            </div>

            <button id="saveCardBtn" class="btn btn-primary w-100 rounded-4 mt-3">Save</button>
        </div>
    `;

    document.body.appendChild(modal);
    requestAnimationFrame(() => modal.classList.add("show"));

    function closeModal() {
        modal.classList.remove("show");
        setTimeout(() => modal.remove(), 300);
    }

    modal.querySelector(".modal-backdrop-custom")
         .addEventListener("click", closeModal);

    // Cover upload
    modal.querySelector("#coverInput")?.addEventListener("change", (e) => {
        const file = e.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (ev) => {
            updateCardCover(activeBoard.id, colId, cardId, ev.target.result);
            refreshBoard();
            closeModal();
            setTimeout(() => openCardDetail(cardId, colId), 310);
        };
        reader.readAsDataURL(file);
    });

    // Remove cover
    modal.querySelector("#removeCoverBtn")?.addEventListener("click", () => {
        updateCardCover(activeBoard.id, colId, cardId, null);
        refreshBoard();
        closeModal();
        setTimeout(() => openCardDetail(cardId, colId), 310);
    });

    // Save card
    modal.querySelector("#saveCardBtn").addEventListener("click", () => {
        const newTitle = modal.querySelector(".card-detail-title").value.trim();
        const newDesc  = modal.querySelector(".card-detail-desc").value.trim();
        if (!newTitle) return;

        import("../services/boardService.js").then(({ updateCard }) => {
            updateCard(activeBoard.id, colId, cardId, {
                title: newTitle,
                description: newDesc
            });
            refreshBoard();
            closeModal();
        });
    });

    // Move card
    modal.querySelectorAll(".move-btn").forEach(btn => {
        btn.addEventListener("click", () => {
            const targetColId = btn.dataset.colId;
            if (targetColId === colId) return;
            moveCard(activeBoard.id, cardId, colId, targetColId);
            refreshBoard();
            closeModal();
        });
    });

    // Toggle checklist
    modal.querySelectorAll(".checklist-check").forEach(chk => {
        chk.addEventListener("change", () => {
            const itemId = chk.closest(".checklist-item").dataset.itemId;
            import("../services/boardService.js").then(({ toggleChecklistItem }) => {
                toggleChecklistItem(activeBoard.id, colId, cardId, itemId);
                refreshBoard();
            });
        });
    });

    // Delete checklist item
    modal.querySelectorAll(".checklist-delete").forEach(btn => {
        btn.addEventListener("click", () => {
            import("../services/boardService.js").then(({ deleteChecklistItem }) => {
                deleteChecklistItem(activeBoard.id, colId, cardId, btn.dataset.itemId);
                // Re-render checklist only
                const updatedBoards = getAllBoards();
                activeBoard = updatedBoards.find(b => b.id === activeBoard.id);
                const updatedCard = activeBoard.columns
                    .find(c => c.id === colId)?.cards
                    .find(c => c.id === cardId);
                modal.querySelector("#checklistItems").innerHTML = updatedCard.checklist.map(item => `
                    <div class="checklist-item" data-item-id="${item.id}">
                        <input type="checkbox" ${item.done ? "checked" : ""} class="checklist-check">
                        <span class="${item.done ? "done" : ""}">${item.text}</span>
                        <button class="checklist-delete" data-item-id="${item.id}">
                            <i class="bi bi-x"></i>
                        </button>
                    </div>
                `).join("");
            });
        });
    });

    // Add checklist item
    modal.querySelector("#addCheckItem").addEventListener("click", addItem);
    modal.querySelector("#newCheckItem").addEventListener("keydown", (e) => {
        if (e.key === "Enter") addItem();
    });

    function addItem() {
        const text = modal.querySelector("#newCheckItem").value.trim();
        if (!text) return;
        import("../services/boardService.js").then(({ addChecklistItem }) => {
            addChecklistItem(activeBoard.id, colId, cardId, text);
            modal.querySelector("#newCheckItem").value = "";
            refreshBoard();
            // Re-open detail to reflect changes
            closeModal();
            setTimeout(() => openCardDetail(cardId, colId), 310);
        });
    }
}

function refreshBoard() {
    const boards = getAllBoards();
    activeBoard  = boards.find(b => b.id === activeBoard.id);
    renderColumns();
}