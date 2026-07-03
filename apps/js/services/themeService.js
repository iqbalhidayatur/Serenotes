const STORAGE_KEY = "serenotes_theme";

export function getTheme(){

    return localStorage.getItem(STORAGE_KEY)
        || "light";

}

export function applyTheme(theme){

    document.documentElement.setAttribute(
        "data-theme",
        theme
    );

    localStorage.setItem(
        STORAGE_KEY,
        theme
    );

}

export function initTheme(){

    applyTheme(getTheme());

}

export function toggleTheme(){

    const next = getTheme() === "dark"

        ? "light"

        : "dark";

    applyTheme(next);

}