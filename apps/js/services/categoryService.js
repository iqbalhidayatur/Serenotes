import {
    getAllNotes
} from "./noteService.js";

const STORAGE_KEY = "serenotes_categories";

const DEFAULT_CATEGORIES = [

    {
        id: crypto.randomUUID(),
        name: "Work",
        icon: "bi bi-briefcase",
        color: "#4F46E5",
        visible: true,
        subcategories: []
    },

    {
        id: crypto.randomUUID(),
        name: "Personal",
        icon: "bi bi-house",
        color: "#2563EB",
        visible: true,
        subcategories: []
    },

    {
        id: crypto.randomUUID(),
        name: "Ideas",
        icon: "bi bi-lightbulb",
        color: "#10B981",
        visible: true,
        subcategories: []
    },

    {
        id: crypto.randomUUID(),
        name: "Archive",
        icon: "bi bi-archive",
        color: "#6B7280",
        visible: true,
        subcategories: []
    }

];

initialize();
migrateCategories();

function migrateCategories(){

    const categories = getCategories();

    let changed = false;

    categories.forEach(category=>{

        if(category.visible === undefined){

            category.visible = true;

            changed = true;

        }

        if(!Array.isArray(category.subcategories)){

            category.subcategories = [];

            changed = true;

        }

        if(!category.icon){

            category.icon = "bi bi-folder";

            changed = true;

        }

        if(!category.color){

            category.color = "#4F46E5";

            changed = true;

        }

        if(!category.id){

            category.id = crypto.randomUUID();

            changed = true;

        }

    });

    if(changed){

        saveCategories(categories);

    }

}

function initialize(){

    if(!localStorage.getItem(STORAGE_KEY)){

        localStorage.setItem(

            STORAGE_KEY,

            JSON.stringify(DEFAULT_CATEGORIES)

        );

    }

}

export function getCategories(){

    return JSON.parse(

        localStorage.getItem(STORAGE_KEY)

    ) || [];

}

export function saveCategories(categories){

    localStorage.setItem(

        STORAGE_KEY,

        JSON.stringify(categories)

    );

}

export function addCategory(

    name,

    icon = "bi bi-folder",

    color = "#4F46E5"

){

    const categories =
        getCategories();

    const exists =
        categories.some(category=>

            category.name.toLowerCase() ===
            name.toLowerCase()

        );

    if(exists){

        return false;

    }

    categories.push({

        id: crypto.randomUUID(),

        name,

        icon,

        color,

        visible: true,

        subcategories: []

    });

    saveCategories(categories);

    return true;

}

// FIX: Removed duplicate deleteCategory export — only one definition kept
export function deleteCategory(id){

    const categories = getCategories();

    const index = categories.findIndex(item=>

        item.id === id

    );

    if(index === -1){

        return false;

    }

    categories.splice(index,1);

    saveCategories(categories);

    return true;

}

export function getCategoryByName(name){

    return getCategories().find(category=>

        category.name === name

    );

}

export function getCategoryCount(categoryName){

    return getAllNotes().filter(note=>

        note.category === categoryName

    ).length;

}

export function getNotesInCategory(categoryName){

    return getAllNotes().filter(note=>

        note.category === categoryName

    );

}

export function getCategoryStats(){

    const categories =
        getCategories();

    const notes =
        getAllNotes();

    return {

        totalNotes: notes.length,

        totalCategories: categories.length,

        text:

            `${notes.length} notes across ${categories.length} categories`

    };

}

export function updateCategory(

    id,

    data

){

    const categories =
        getCategories();

    const index =
        categories.findIndex(category=>

            category.id === id

        );

    if(index === -1){

        return false;

    }

    categories[index]={

        ...categories[index],

        ...data

    };

    saveCategories(categories);

    return true;

}

export function getCategoryNames(){

    return getCategories().map(category=>

        category.name

    );

}

export function toggleCategoryVisibility(id){

    const categories = getCategories();

    const category = categories.find(item=>

        item.id === id

    );

    if(!category){

        return false;

    }

    category.visible = !category.visible;

    saveCategories(categories);

    return true;

}

export function addSubcategory(

    categoryId,

    name

){

    const categories = getCategories();

    const category = categories.find(item=>

        item.id === categoryId

    );

    if(!category){

        return false;

    }

    const exists = category.subcategories.some(item=>

        item.name.toLowerCase() ===

        name.toLowerCase()

    );

    if(exists){

        return false;

    }

    category.subcategories.push({

        id: crypto.randomUUID(),

        name

    });

    saveCategories(categories);

    return true;

}

export function deleteSubcategory(

    categoryId,

    subcategoryId

){

    const categories = getCategories();

    const category = categories.find(item=>

        item.id === categoryId

    );

    if(!category){

        return false;

    }

    category.subcategories =

        category.subcategories.filter(item=>

            item.id !== subcategoryId

        );

    saveCategories(categories);

    return true;

}

export function renameCategory(

    id,

    newName

){

    const categories = getCategories();

    const category = categories.find(item=>

        item.id === id

    );

    if(!category){

        return false;

    }

    category.name = newName;

    saveCategories(categories);

    return true;

}

export function renameSubcategory(

    categoryId,

    subcategoryId,

    newName

){

    const categories = getCategories();

    const category = categories.find(item=>

        item.id === categoryId

    );

    if(!category){

        return false;

    }

    const sub =

        category.subcategories.find(item=>

            item.id === subcategoryId

        );

    if(!sub){

        return false;

    }

    sub.name = newName;

    saveCategories(categories);

    return true;

}

export function updateCategoryStyle(

    id,

    icon,

    color

){

    const categories = getCategories();

    const category = categories.find(item=>

        item.id === id

    );

    if(!category){

        return false;

    }

    category.icon = icon;

    category.color = color;

    saveCategories(categories);

    return true;

}

export function getVisibleCategories(){

    return getCategories().filter(item=>

        item.visible

    );

}

export function getSubcategories(

    categoryId

){

    const category =

        getCategories().find(item=>

            item.id === categoryId

        );

    if(!category){

        return [];

    }

    return category.subcategories;

}
