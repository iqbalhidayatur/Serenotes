const STORAGE_KEY = "serenotes_boards";

const DEFAULT_BOARD = {
    id: "default",
    name: "My Board",
    columns: [
        { id: "todo",        name: "To Do",       cards: [] },
        { id: "inprogress",  name: "In Progress",  cards: [] },
        { id: "done",        name: "Done",         cards: [] }
    ],
    createdAt: new Date().toISOString()
};

function getBoards() {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
}

function saveBoards(boards) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(boards));
}

function initBoard() {
    if (!localStorage.getItem(STORAGE_KEY)) {
        saveBoards([DEFAULT_BOARD]);
    }
}

initBoard();

export function getAllBoards() {
    return getBoards();
}

export function getBoardById(id) {
    return getBoards().find(b => b.id === id) || null;
}

export function createBoard(name) {
    const boards = getBoards();
    const board = {
        id:        crypto.randomUUID(),
        name,
        columns: [
            { id: crypto.randomUUID(), name: "To Do",       cards: [] },
            { id: crypto.randomUUID(), name: "In Progress",  cards: [] },
            { id: crypto.randomUUID(), name: "Done",         cards: [] }
        ],
        createdAt: new Date().toISOString()
    };
    boards.push(board);
    saveBoards(boards);
    return board;
}

export function deleteBoard(id) {
    const boards = getBoards().filter(b => b.id !== id);
    saveBoards(boards);
}

export function createCard(boardId, columnId, title, description = "") {
    const boards = getBoards();
    const board  = boards.find(b => b.id === boardId);
    if (!board) return null;

    const column = board.columns.find(c => c.id === columnId);
    if (!column) return null;

    const card = {
        id:          crypto.randomUUID(),
        title,
        description,
        checklist:   [],
        createdAt:   new Date().toISOString()
    };

    column.cards.push(card);
    saveBoards(boards);
    return card;
}

export function updateCard(boardId, columnId, cardId, data) {
    const boards = getBoards();
    const board  = boards.find(b => b.id === boardId);
    if (!board) return false;

    const column = board.columns.find(c => c.id === columnId);
    if (!column) return false;

    const idx = column.cards.findIndex(c => c.id === cardId);
    if (idx === -1) return false;

    column.cards[idx] = { ...column.cards[idx], ...data };
    saveBoards(boards);
    return true;
}

export function deleteCard(boardId, columnId, cardId) {
    const boards = getBoards();
    const board  = boards.find(b => b.id === boardId);
    if (!board) return false;

    const column = board.columns.find(c => c.id === columnId);
    if (!column) return false;

    column.cards = column.cards.filter(c => c.id !== cardId);
    saveBoards(boards);
    return true;
}

export function moveCard(boardId, cardId, fromColumnId, toColumnId) {
    const boards = getBoards();
    const board  = boards.find(b => b.id === boardId);
    if (!board) return false;

    const fromCol = board.columns.find(c => c.id === fromColumnId);
    const toCol   = board.columns.find(c => c.id === toColumnId);
    if (!fromCol || !toCol) return false;

    const cardIdx = fromCol.cards.findIndex(c => c.id === cardId);
    if (cardIdx === -1) return false;

    const [card] = fromCol.cards.splice(cardIdx, 1);
    toCol.cards.push(card);
    saveBoards(boards);
    return true;
}

export function addChecklistItem(boardId, columnId, cardId, text) {
    const boards = getBoards();
    const board  = boards.find(b => b.id === boardId);
    if (!board) return false;

    const column = board.columns.find(c => c.id === columnId);
    if (!column) return false;

    const card = column.cards.find(c => c.id === cardId);
    if (!card) return false;

    card.checklist.push({ id: crypto.randomUUID(), text, done: false });
    saveBoards(boards);
    return true;
}

export function toggleChecklistItem(boardId, columnId, cardId, itemId) {
    const boards = getBoards();
    const board  = boards.find(b => b.id === boardId);
    if (!board) return false;

    const column = board.columns.find(c => c.id === columnId);
    if (!column) return false;

    const card = column.cards.find(c => c.id === cardId);
    if (!card) return false;

    const item = card.checklist.find(i => i.id === itemId);
    if (!item) return false;

    item.done = !item.done;
    saveBoards(boards);
    return true;
}

export function deleteChecklistItem(boardId, columnId, cardId, itemId) {
    const boards = getBoards();
    const board  = boards.find(b => b.id === boardId);
    if (!board) return false;

    const column = board.columns.find(c => c.id === columnId);
    if (!column) return false;

    const card = column.cards.find(c => c.id === cardId);
    if (!card) return false;

    card.checklist = card.checklist.filter(i => i.id !== itemId);
    saveBoards(boards);
    return true;
}

export function getColumnOfCard(board, cardId) {
    for (const col of board.columns) {
        if (col.cards.find(c => c.id === cardId)) return col;
    }
    return null;
}