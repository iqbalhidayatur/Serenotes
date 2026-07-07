import {

    initTheme,

    getTheme,

    toggleTheme

} from "../services/themeService.js";

initTheme();

import { clearNotes } from "../services/noteService.js";
import { clearMedia } from "../services/mediaService.js";

const { App: CapApp } = window.Capacitor?.Plugins || {};

if (CapApp) {
    CapApp.addListener("backButton", ({ canGoBack }) => {
        if (canGoBack) window.history.back();
        else window.location.href = "dashboard.html";
    });
}

const backupBtn   = document.getElementById("backupBtn");
const clearDataBtn= document.getElementById("clearDataBtn");
const profileName = document.getElementById("profileName");
const profileGreet= document.getElementById("profileGreet");

const darkModeToggle =
    document.getElementById(
        "darkModeToggle"
    );

// Load saved user name
const userName = localStorage.getItem("serenotes_user") || "User";
if (profileName)  profileName.textContent  = userName;
if (profileGreet) profileGreet.textContent = `Welcome back, ${userName}! 👋`;

darkModeToggle.checked =

    getTheme() === "dark";

darkModeToggle.addEventListener(

    "change",

    ()=>{

        toggleTheme();

    }

);

backupBtn.addEventListener("click", handleBackup);
clearDataBtn.addEventListener("click", handleClear);

function handleBackup() {
    const { getAllNotes } = (() => {
        // inline import workaround for settings
        const STORAGE_KEY = "serenotes_notes";
        return {
            getAllNotes: () => JSON.parse(localStorage.getItem(STORAGE_KEY)) || []
        };
    })();

    const notes = getAllNotes();

    if (!notes.length) {
        alert("No notes to backup.");
        return;
    }

    const blob = new Blob(
        [JSON.stringify(notes, null, 2)],
        { type: "application/json" }
    );

    const url  = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href     = url;
    link.download = `serenotes_backup_${new Date().toISOString().slice(0,10)}.json`;
    link.click();
    URL.revokeObjectURL(url);
}

async function handleClear() {
    const confirmed = confirm(
        "Delete ALL notes permanently? This cannot be undone."
    );
    if (!confirmed) return;

    clearNotes();
    await clearMedia();

    alert("All data cleared.");
}
