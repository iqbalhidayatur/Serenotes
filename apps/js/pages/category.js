import {

    getVisibleCategories

} from "../services/categoryService.js";

import {
    getAllNotes
} from "../services/noteService.js";

const categoryGrid =
    document.getElementById("categoryGrid");

const categoryNotes =
    document.getElementById("categoryNotes");

const categoryStats =
    document.getElementById("categoryStats");

const selectedCategory =
    document.getElementById("selectedCategory");

const selectedCount =
    document.getElementById("selectedCount");

const CATEGORY_ICONS = {

    Work: "style/assets/briefcase.png",

    Personal: "style/assets/home.png",

    Ideas: "style/assets/idea.png",

    Archive: "style/assets/archive.png"

};

let activeCategory = null;

init();

function init(){

    renderCategories();

}

function renderCategories(){

    const categories = getVisibleCategories();

    const notes = getAllNotes();

    categoryGrid.innerHTML = "";

    categoryStats.textContent =
        `${notes.length} notes across ${categories.length} categories`;

    categories.forEach(category=>{

        const count =
            notes.filter(note=>

                note.category === category.name

            ).length;

        categoryGrid.innerHTML += `

            <div class="col-6">

                <div
                    class="category-card-item"
                    data-category="${category.name}"
                >

                    <div class="category-icon">

                        <img
                            src="${
                                CATEGORY_ICONS[category.name] ||
                                "style/assets/folder.png"
                            }"
                            class="category-icon-img"
                            alt="${category.name}"
                        >

                    </div>

                    <div>

                        <div class="category-title">

                            ${category.name}

                        </div>

                        <div class="category-count">

                            ${count} Notes

                        </div>

                    </div>

                </div>

            </div>

        `;

    });

    document
        .querySelectorAll(".category-card-item")
        .forEach(card=>{

            card.addEventListener(
                "click",
                ()=>{

                    activeCategory =
                        card.dataset.category;

                    document
                        .querySelectorAll(".category-card-item")
                        .forEach(item=>

                            item.classList.remove("active")

                        );

                    card.classList.add("active");

                    renderNotes(activeCategory);

                }
            );

        });

    if(categories.length){

        activeCategory = categories[0].name;

        document
            .querySelector(".category-card-item")
            ?.classList.add("active");

        renderNotes(activeCategory);

    }

}

function renderNotes(category){

    const notes =
        getAllNotes().filter(note=>

            note.category === category

        );

    selectedCategory.textContent =
        category;

    selectedCount.textContent =
        `${notes.length} Notes`;

    categoryNotes.innerHTML = "";

    if(notes.length === 0){

        categoryNotes.innerHTML = `

            <div class="category-empty">

                <i class="bi bi-journal-x"></i>

                <h5>

                    No Notes

                </h5>

            </div>

        `;

        return;

    }

    notes.forEach(note=>{

        categoryNotes.innerHTML += `

            <div
                class="category-note"
                data-id="${note.id}"
            >

                <div
                    class="category-note-left"
                >

                    <div
                        class="d-flex align-items-center gap-2"
                    >

                        <span
                            class="category-note-category"
                        >

                            ${note.category}

                        </span>

                        <span
                            class="category-note-time"
                        >

                            ${formatTime(note.date)}

                        </span>

                    </div>

                    <div
                        class="category-note-title"
                    >

                        ${
                            note.title
                            ? note.title
                            : getPreview(note.content)
                        }

                    </div>

                </div>

                <i class="bi bi-chevron-right"></i>

            </div>

        `;

    });

    document
        .querySelectorAll(".category-note")
        .forEach(card=>{

            card.addEventListener(
                "click",
                ()=>{

                    window.location.href =
                        `note-detail.html?id=${card.dataset.id}`;

                }
            );

        });

}

function getPreview(text){

    if(!text){

        return "Untitled";

    }

    return text.length > 40

        ? text.substring(0,40) + "..."

        : text;

}

function formatTime(date){

    return new Date(date)
        .toLocaleTimeString(
            "en-US",
            {

                hour:"2-digit",

                minute:"2-digit"

            }

        );

}