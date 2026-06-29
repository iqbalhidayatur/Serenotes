import {
    getAllNotes
} from "../services/noteService.js";

const monthTitle = document.getElementById("monthTitle");
const calendarGrid = document.getElementById("calendarGrid");
const notesByDate = document.getElementById("notesByDate");
const selectedDateTitle =
    document.getElementById("selectedDateTitle");

const prevMonth =
    document.getElementById("prevMonth");

const nextMonth =
    document.getElementById("nextMonth");

const MONTHS = [

    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December"

];

let currentDate = new Date();

let selectedDate = new Date();

renderCalendar();

prevMonth.addEventListener("click", () => {

    currentDate.setMonth(
        currentDate.getMonth() - 1
    );

    renderCalendar();

});

nextMonth.addEventListener("click", () => {

    currentDate.setMonth(
        currentDate.getMonth() + 1
    );

    renderCalendar();

});

function renderCalendar() {

    calendarGrid.innerHTML = "";

    const year = currentDate.getFullYear();

    const month = currentDate.getMonth();

    monthTitle.textContent =
        `${MONTHS[month]} ${year}`;

    const firstDay =
        new Date(year, month, 1).getDay();

    const totalDays =
        new Date(year, month + 1, 0).getDate();

    for (let i = 0; i < firstDay; i++) {

        calendarGrid.innerHTML +=
            `<div class="calendar-day empty"></div>`;

    }

    for (let day = 1; day <= totalDays; day++) {

        const date =
            new Date(year, month, day);

        const today = new Date();

        const isToday =
            today.getDate() === day &&
            today.getMonth() === month &&
            today.getFullYear() === year;

        const notes =
            getNotesByDate(date);

        const dot =
            notes.length
                ? getDot(notes[0].category)
                : "";

        calendarGrid.innerHTML += `

            <div
                class="
                    calendar-day
                    ${isToday ? "today" : ""}
                "
                data-date="${date.toISOString()}"
            >

                <span>

                    ${day}

                </span>

                ${dot}

            </div>

        `;

    }

    document
        .querySelectorAll(".calendar-day")
        .forEach(day => {

            day.addEventListener(
                "click",
                handleSelectDate
            );

        });

    renderNotes(selectedDate);

}

function handleSelectDate(event) {

    const value =
        event.currentTarget.dataset.date;

    if (!value) return;

    selectedDate = new Date(value);

    document
        .querySelectorAll(".calendar-day")
        .forEach(item => {

            item.classList.remove("selected");

        });

    event.currentTarget.classList.add(
        "selected"
    );

    renderNotes(selectedDate);

}

function renderNotes(date) {

    const notes =
        getNotesByDate(date);

    selectedDateTitle.textContent =
        `Notes for ${formatHeaderDate(date)}`;

    notesByDate.innerHTML = "";

    if (!notes.length) {

        notesByDate.innerHTML = `

            <div class="calendar-empty">

                <i class="bi bi-journal-x"></i>

                <h5>

                    No notes

                </h5>

            </div>

        `;

        return;

    }

    notes.forEach(note => {

        notesByDate.innerHTML += `

            <div
                class="calendar-note"
                data-id="${note.id}"
            >

                <div
                    class="calendar-note-left"
                >

                    <div
                        class="d-flex align-items-center gap-2"
                    >

                        <span
                            class="calendar-note-category"
                        >

                            ${note.category}

                        </span>

                        <span
                            class="calendar-note-time"
                        >

                            ${formatTime(note.date)}

                        </span>

                    </div>

                    <div
                        class="calendar-note-title"
                    >

                        ${
                            note.title ||
                            (note.content || "").substring(0,35)
                        }

                    </div>

                </div>

                <i
                    class="bi bi-chevron-right"
                ></i>

            </div>

        `;

    });

    document
        .querySelectorAll(".calendar-note")
        .forEach(card => {

            card.addEventListener(
                "click",
                () => {

                    window.location.href =
                        `note-detail.html?id=${card.dataset.id}`;

                }
            );

        });

}

function getNotesByDate(date) {

    const notes =
        getAllNotes();

    return notes.filter(note => {

        const d =
            new Date(note.date);

        return (

            d.getDate() === date.getDate() &&

            d.getMonth() === date.getMonth() &&

            d.getFullYear() === date.getFullYear()

        );

    });

}

function getDot(category) {

    const color = {

        Work: "dot-work",

        Personal: "dot-personal",

        Ideas: "dot-ideas",

        Archive: "dot-archive"

    };

    return `

        <div
            class="
                calendar-dot
                ${color[category] || "dot-work"}
            "
        ></div>

    `;

}

function formatHeaderDate(date) {

    return date.toLocaleDateString(
        "en-US",
        {

            month: "short",

            day: "numeric"

        }

    );

}

function formatTime(date) {

    return new Date(date)
        .toLocaleTimeString(
            "en-US",
            {

                hour: "2-digit",

                minute: "2-digit"

            }

        );

}