import {

    initTheme

} from "../services/themeService.js";

initTheme();

import {
    getTodayReminders,
    getUpcomingReminders,
    getCompletedReminders,
    getOverdueReminders,
    completeReminder,
    getReminderStats
} from "../services/reminderService.js";

const todayCount    = document.getElementById("todayCount");
const upcomingCount = document.getElementById("upcomingCount");
const completedCount= document.getElementById("completedCount");
const todayList     = document.getElementById("todayList");
const upcomingList  = document.getElementById("upcomingList");
const completedList = document.getElementById("completedList");
const overdueList   = document.getElementById("overdueList");
const todayBtn      = document.getElementById("todayBtn");

init();

todayBtn.addEventListener("click", () => {
    const today = new Date();
    document.title = `Reminders — ${formatHeaderDate(today)}`;
    renderAll();
});

function init() {
    renderAll();
}

// Debug: cek apakah ada note dengan reminder
console.log("All notes with reminder:", 
    JSON.parse(localStorage.getItem("serenotes_notes") || "[]")
        .filter(n => n.reminder?.enabled)
        .map(n => ({ name: n.noteName, datetime: n.reminder.datetime, completed: n.reminder.completed }))
);

function renderAll() {
    const stats = getReminderStats();
    todayCount.textContent    = stats.today;
    upcomingCount.textContent = stats.upcoming;
    completedCount.textContent= stats.completed;

    renderList(todayList,     getTodayReminders(),     "No reminders for today.");
    renderList(upcomingList,  getUpcomingReminders(),  "No upcoming reminders.");
    renderList(completedList, getCompletedReminders(), "No completed reminders.");
    renderList(overdueList,   getOverdueReminders(),   "No overdue reminders.");
}

function renderList(container, notes, emptyMsg) {
    container.innerHTML = "";

    if (!notes.length) {
        container.innerHTML = `
            <div class="reminder-empty">
                <i class="bi bi-bell-slash"></i>
                <p>${emptyMsg}</p>
            </div>
        `;
        return;
    }

    notes.forEach(note => {
        container.innerHTML += createCard(note);
    });

    container.querySelectorAll(".reminder-complete-btn").forEach(btn => {
        btn.addEventListener("click", (e) => {
            e.stopPropagation();
            completeReminder(btn.dataset.id);
            renderAll();
        });
    });

    container.querySelectorAll(".reminder-card").forEach(card => {
        card.addEventListener("click", () => {
            window.location.href = `note-detail.html?id=${card.dataset.id}`;
        });
    });
}

function createCard(note) {
    const isCompleted = note.reminder?.completed;
    return `
        <div class="reminder-card ${isCompleted ? "reminder-done" : ""}" data-id="${note.id}">
            <div class="reminder-card-left">
                <div class="reminder-note-title">
                    ${note.noteName || note.title || "Untitled"}
                </div>
                <div class="reminder-note-time">
                    <i class="bi bi-bell"></i>
                    ${formatDate(note.reminder.datetime)}
                </div>
                <div class="reminder-note-category">
                    ${note.category || ""}
                </div>
            </div>
            ${
                !isCompleted
                ? `<button class="reminder-complete-btn" data-id="${note.id}" title="Mark as done">
                        <i class="bi bi-check-lg"></i>
                   </button>`
                : `<i class="bi bi-check-circle-fill text-success fs-4"></i>`
            }
        </div>
    `;
}

function formatDate(str) {
    return new Date(str).toLocaleString("en-US", {
        month: "short", day: "numeric",
        hour: "2-digit", minute: "2-digit"
    });
}

function formatHeaderDate(date) {
    return date.toLocaleDateString("en-US", {
        weekday: "long", month: "long", day: "numeric"
    });
}
