import {

    initTheme

} from "../services/themeService.js";

initTheme();

const input = document.getElementById("nameInput");
const nextBtn   = document.querySelector(".btn-primary");

// If already set up, skip straight to dashboard
if (localStorage.getItem("serenotes_user")) {
    window.location.replace("dashboard.html");
}

nextBtn.addEventListener("click", handleNext);
input.addEventListener("keydown", (e) => {
    if (e.key === "Enter") handleNext();
});

function handleNext() {
    const name = input.value.trim();
    if (!name) {
        input.classList.add("is-invalid");
        return;
    }
    localStorage.setItem("serenotes_user", name);
    window.location.href = "dashboard.html";
}

input.addEventListener("input", () => {
    input.classList.remove("is-invalid");
});
