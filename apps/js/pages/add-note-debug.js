// MINIMAL DEBUG VERSION - no imports, direct localStorage
console.log("[DEBUG] add-note-debug.js loaded");

const form = document.getElementById("noteForm");
console.log("[DEBUG] form element:", form);

if (!form) {
    console.error("[DEBUG] FORM NOT FOUND - check id='noteForm' in HTML");
} else {
    form.addEventListener("submit", (e) => {
        e.preventDefault();
        console.log("[DEBUG] submit fired!");

        const title   = document.getElementById("title")?.value || "";
        const content = document.getElementById("content")?.value || "";

        const note = {
            id:      crypto.randomUUID(),
            title,
            content,
            date:    new Date().toISOString(),
            category:"General"
        };

        const existing = JSON.parse(localStorage.getItem("serenotes_notes") || "[]");
        existing.unshift(note);
        localStorage.setItem("serenotes_notes", JSON.stringify(existing));

        console.log("[DEBUG] note saved:", note);
        console.log("[DEBUG] total notes:", existing.length);

        alert("DEBUG: Note saved! Check console. Redirecting...");
        window.location.href = "dashboard.html";
    });
    console.log("[DEBUG] submit listener attached");
}
