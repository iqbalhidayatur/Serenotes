import {

    getCategories,

    addCategory,

    addSubcategory,

    deleteCategory,

    deleteSubcategory,

    toggleCategoryVisibility,

    getCategoryCount

} from "../services/categoryService.js";

const categoryList =
    document.getElementById("categoryList");

const addCategoryBtn =
    document.getElementById("addCategoryBtn");

const saveCategoryBtn =
    document.getElementById("saveCategoryBtn");

const categoryName =
    document.getElementById("categoryName");

const subcategoryName =
    document.getElementById("subcategoryName");

const modal = new bootstrap.Modal(

    document.getElementById("categoryModal")

);

renderCategories();

addCategoryBtn.addEventListener(

    "click",

    ()=>{

        categoryName.value="";

        subcategoryName.value="";

        modal.show();

    }

);

saveCategoryBtn.addEventListener(

    "click",

    saveCategory

);

function renderCategories(){

    categoryList.innerHTML="";

    const categories =
        getCategories();

    categories.forEach(category=>{

        categoryList.innerHTML+=createCard(category);

    });

    bindEvents();

}

function createCard(category){

    return `

    <div
        class="category-setting-card mb-4"
        data-id="${category.id}"
    >

        <div
            class="d-flex justify-content-between align-items-center"
        >

            <div>

                <h5>

                    <i class="${category.icon}"></i>

                    ${category.name}

                </h5>

                <small>

                    ${getCategoryCount(category.name)}

                    Notes

                </small>

            </div>

            <div>

                <div class="form-check form-switch">

                    <input

                        class="form-check-input visibility"

                        type="checkbox"

                        ${category.visible ? "checked" : ""}

                    >

                </div>

            </div>

        </div>

        <div class="mt-3">

            ${category.subcategories.map(sub=>`

                <span class="subcategory-chip">

                    ${sub.name}

                    <button

                        class="delete-sub"

                        data-category="${category.id}"

                        data-sub="${sub.id}"

                    >

                        <i class="bi bi-x"></i>

                    </button>

                </span>

            `).join("")}

        </div>

        <div
            class="d-flex gap-2 mt-4"
        >

            <button

                class="btn btn-outline-primary add-sub"

                data-id="${category.id}"

            >

                Add Subcategory

            </button>

            <button

                class="btn btn-outline-danger delete-category"

                data-id="${category.id}"

            >

                Delete

            </button>

        </div>

    </div>

    `;

}

function bindEvents(){

    document
        .querySelectorAll(".visibility")
        .forEach((item,index)=>{

            item.addEventListener("change",()=>{

                const category =
                    getCategories()[index];

                toggleCategoryVisibility(

                    category.id

                );

            });

        });

    document
        .querySelectorAll(".delete-category")
        .forEach(button=>{

            button.addEventListener("click",()=>{

                if(

                    !confirm(

                        "Delete this category?"

                    )

                ){

                    return;

                }

                deleteCategory(

                    button.dataset.id

                );

                renderCategories();

            });

        });

    document
        .querySelectorAll(".add-sub")
        .forEach(button=>{

            button.addEventListener("click",()=>{

                const value = prompt(

                    "Subcategory name"

                );

                if(!value) return;

                addSubcategory(

                    button.dataset.id,

                    value

                );

                renderCategories();

            });

        });

    document
        .querySelectorAll(".delete-sub")
        .forEach(button=>{

            button.addEventListener("click",()=>{

                deleteSubcategory(

                    button.dataset.category,

                    button.dataset.sub

                );

                renderCategories();

            });

        });

}

function saveCategory(){

    const name =
        categoryName.value.trim();

    if(name===""){

        return;

    }

    addCategory(name);

    if(

        subcategoryName.value.trim()

    ){

        const category =
            getCategories().find(item=>

                item.name===name

            );

        addSubcategory(

            category.id,

            subcategoryName.value.trim()

        );

    }

    modal.hide();

    renderCategories();

}