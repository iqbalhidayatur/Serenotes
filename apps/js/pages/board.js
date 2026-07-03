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
    getColumnOfCard
} from "../services/boardService.js";

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
        const doneCount  = column.cards.filter(c =>
            c.checklist.length && c.checklist.every(i => i.done)
        ).length;

        columnsWrap.innerHTML += `
            <div class="kanban-col" data-col-id="${column.id}">
                <div class="kanban-col-header">
                    <span class="kanban-col-name">${column.name}</span>
                    <span class="kanban-col-count">${column.cards.length}</span>
                </div>
                <div class="kanban-cards" id="col-${column.id}">
                    ${column.cards.map(card => createCardHTML(card, column.id)).join("")}
                </div>
                <button class="kanban-add-card" data-col-id="${column.id}">
                    <i class="bi bi-plus"></i> Add card
                </button>
            </div>
        `;
    });

    // Add card buttons
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
            <div class="kanban-card-title">${card.title}</div>
            ${card.description
                ? `<div class="kanban-card-desc">${card.description}</div>`
                : ""}
            ${total
                ? `<div class="kanban-card-checklist">
                        <i class="bi bi-check2-square"></i> ${done}/${total}
                   </div>`
                : ""}
            <button class="kanban-card-delete" data-card-id="${card.id}" data-col-id="${colId}">
                <i class="bi bi-x"></i>
            </button>
        </div>
    `;
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