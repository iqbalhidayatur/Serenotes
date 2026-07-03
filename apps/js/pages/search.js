import { initTheme } from "../services/themeService.js";
initTheme();

import {
    search,
    saveRecentSearch,
    getRecentSearches,
    clearRecentSearches,
    highlight
} from "../services/searchService.js";

import { getAllNotes } from "../services/noteService.js";

const suggestionContainer = document.getElementById("suggestionContainer");
const clearInput          = document.getElementById("clearInput");
const input               = document.getElementById("searchInput");
const result              = document.getElementById("searchResult");
const recent              = document.getElementById("recentSearch");
const clearBtn            = document.getElementById("clearRecent");
const tagFilterWrap       = document.getElementById("tagFilterWrap");
const sortSelect = document.getElementById("sortSelect");

// Tag filter aktif
let activeTagFilters = [];

renderRecent();
renderTagCloud();
bindSuggestions();

input.addEventListener("input", handleSearch);
sortSelect.addEventListener("change", handleSearch);

clearBtn.addEventListener("click", () => {
    clearRecentSearches();
    renderRecent();
});

clearInput.addEventListener("click", () => {
    input.value = "";
    activeTagFilters = [];
    renderTagCloud();
    result.innerHTML = `
        <div class="search-empty">
            <i class="bi bi-search"></i>
            <h5>Search Notes</h5>
            <p>Start typing to search notes</p>
        </div>
    `;
    input.focus();
});

function bindSuggestions() {
    suggestionContainer.querySelectorAll(".chip").forEach(chip => {
        chip.addEventListener("click", () => {
            input.value = chip.dataset.keyword;
            handleSearch();
            input.focus();
        });
    });
}

function handleSearch() {
    const keyword = input.value.trim();

    if (!keyword && activeTagFilters.length === 0) {
        result.innerHTML = "";
        return;
    }

    // search() sudah return urutan relevansi
    let notes = keyword ? search(keyword) : getAllNotes();

    // Filter by active tags
    if (activeTagFilters.length > 0) {
        notes = notes.filter(note =>
            activeTagFilters.every(tag =>
                (note.tags || []).includes(tag)
            )
        );
    }

    // Sorting
    const sortBy = sortSelect?.value || "relevance";

    if (sortBy === "newest") {
        notes = [...notes].sort((a, b) => new Date(b.date) - new Date(a.date));
    } else if (sortBy === "oldest") {
        notes = [...notes].sort((a, b) => new Date(a.date) - new Date(b.date));
    } else if (sortBy === "az") {
        notes = [...notes].sort((a, b) =>
            (a.title || "").localeCompare(b.title || "")
        );
    } else if (sortBy === "za") {
        notes = [...notes].sort((a, b) =>
            (b.title || "").localeCompare(a.title || "")
        );
    }
    // "relevance" → biarkan urutan dari search() yang sudah scored

    result.innerHTML = "";

    if (notes.length === 0) {
        result.innerHTML = `
            <div class="text-center py-4 text-secondary">
                <i class="bi bi-journal-x" style="font-size:2.5rem;"></i>
                <p class="mt-2">No notes found</p>
            </div>
        `;
        return;
    }

    notes.forEach(note => {
        const tagsHtml = (note.tags || []).map(tag => `
            <span class="note-card-tag" data-tag="${tag}">#${tag}</span>
        `).join("");

        result.innerHTML += `
            <div class="search-card" onclick="location.href='note-detail.html?id=${note.id}'">
                <h5>${highlight(note.title || "Untitled", keyword)}</h5>
                <p>${highlight(preview(getPreviewText(note)), keyword)}</p>
                <small>${note.category || ""}</small>
                ${tagsHtml ? `<div class="note-card-tags">${tagsHtml}</div>` : ""}
            </div>
        `;
    });

    // Klik tag di card → aktifkan filter
    result.querySelectorAll(".note-card-tag").forEach(el => {
        el.addEventListener("click", e => {
            e.stopPropagation();
            const tag = el.dataset.tag;
            if (!activeTagFilters.includes(tag)) {
                activeTagFilters.push(tag);
                renderActiveTagFilters();
                handleSearch();
            }
        });
    });

    if (keyword) saveRecentSearch(keyword);
    renderRecent();
}

function renderTagCloud() {
    const allTags = [...new Set(
        getAllNotes().flatMap(n => n.tags || [])
    )].sort();

    const tagCloud = document.getElementById("tagCloud");
    if (!tagCloud) return;

    if (allTags.length === 0) {
        tagCloud.innerHTML = `<span class="text-secondary" style="font-size:13px;">No tags yet</span>`;
        return;
    }

    tagCloud.innerHTML = allTags.map(tag => `
        <span class="note-card-tag" data-tag="${tag}">#${tag}</span>
    `).join("");

    tagCloud.querySelectorAll(".note-card-tag").forEach(el => {
        el.addEventListener("click", () => {
            const tag = el.dataset.tag;
            if (!activeTagFilters.includes(tag)) {
                activeTagFilters.push(tag);
                renderActiveTagFilters();
                handleSearch();
            }
        });
    });
}

function renderActiveTagFilters() {
    if (!tagFilterWrap) return;

    if (activeTagFilters.length === 0) {
        tagFilterWrap.innerHTML = "";
        return;
    }

    tagFilterWrap.innerHTML = activeTagFilters.map(tag => `
        <span class="search-tag-chip">
            #${tag}
            <span class="chip-remove" data-tag="${tag}">
                <i class="bi bi-x"></i>
            </span>
        </span>
    `).join("");

    tagFilterWrap.querySelectorAll(".chip-remove").forEach(btn => {
        btn.addEventListener("click", () => {
            activeTagFilters = activeTagFilters.filter(t => t !== btn.dataset.tag);
            renderActiveTagFilters();
            handleSearch();
        });
    });
}

function renderRecent() {
    recent.innerHTML = "";
    getRecentSearches().forEach(item => {
        recent.innerHTML += `
            <div class="recent-item" data-keyword="${item}">
                <i class="bi bi-clock-history"></i>
                <span>${item}</span>
            </div>
        `;
    });

    document.querySelectorAll(".recent-item").forEach(item => {
        item.addEventListener("click", () => {
            input.value = item.dataset.keyword;
            handleSearch();
            input.focus();
        });
    });
}

function getPreviewText(note) {
    if (note.blocks && note.blocks.length > 0) {
        return note.blocks.map(b => b.text || "").join(" ").replace(/<[^>]+>/g, "");
    }
    return note.content || "";
}

function preview(text) {
    if (!text) return "";
    return text.length > 120 ? text.substring(0, 120) + "..." : text;
}