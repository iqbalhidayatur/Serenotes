import {

    search,

    saveRecentSearch,

    getRecentSearches,

    clearRecentSearches,

    highlight

} from "../services/searchService.js";

const suggestionContainer =
    document.getElementById("suggestionContainer");

const clearInput =
    document.getElementById("clearInput");

const input =
    document.getElementById("searchInput");

const result =
    document.getElementById("searchResult");

const recent =
    document.getElementById("recentSearch");

const clearBtn =
    document.getElementById("clearRecent");

renderRecent();
bindSuggestions();

input.addEventListener(

    "input",

    handleSearch

);

clearBtn.addEventListener(

    "click",

    ()=>{

        clearRecentSearches();

        renderRecent();

    }

);

clearInput.addEventListener(
    "click",
    ()=>{

        input.value = "";

        result.innerHTML = `
            <div class="search-empty">

                <i class="bi bi-search"></i>

                <h5>Search Notes</h5>

                <p>
                    Start typing to search notes
                </p>

            </div>
        `;

        input.focus();

    }
);

function bindSuggestions(){

    suggestionContainer
        .querySelectorAll(".chip")
        .forEach(chip=>{

            chip.addEventListener("click",()=>{

                input.value =
                    chip.dataset.keyword;

                handleSearch();

                input.focus();

            });

        });

}

function handleSearch(){

    const keyword =
        input.value.trim();

    if(!keyword){

        result.innerHTML="";

        return;

    }

    const notes =
        search(keyword);

    result.innerHTML="";

    notes.forEach(note=>{

        result.innerHTML+=`

            <div
                class="search-card"
                onclick="
                    location.href=
                    'note-detail.html?id=${note.id}'
                "
            >

                <h5>

                    ${highlight(

                        note.title ||

                        "Untitled",

                        keyword

                    )}

                </h5>

                <p>

                    ${highlight(

                        preview(note.content),

                        keyword

                    )}

                </p>

                <small>

                    ${note.category}

                </small>

            </div>

        `;

    });

    saveRecentSearch(keyword);

    renderRecent();

}

function renderRecent(){

    recent.innerHTML = "";

    getRecentSearches().forEach(item=>{

        recent.innerHTML += `

            <div
                class="recent-item"
                data-keyword="${item}"
            >

                <i class="bi bi-clock-history"></i>

                <span>${item}</span>

            </div>

        `;

    });

    document
        .querySelectorAll(".recent-item")
        .forEach(item=>{

            item.addEventListener("click",()=>{

                input.value =
                    item.dataset.keyword;

                handleSearch();

                input.focus();

            });

        });

}

function preview(text){

    if(!text){

        return "";

    }

    return text.length>120

        ? text.substring(0,120)+"..."

        : text;

}