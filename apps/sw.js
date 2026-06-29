const CACHE_NAME = "serenotes-v2";

// Only cache same-origin assets — external CDN URLs often fail addAll()
const STATIC_ASSETS = [
    "./welcome.html",
    "./dashboard.html",
    "./add-note.html",
    "./note-detail.html",
    "./calendar.html",
    "./category.html",
    "./category-settings.html",
    "./reminder.html",
    "./search.html",
    "./settings.html",
    "./manifest.json",
    "./style/app.css",
    "./style/welcome.css",
    "./style/assets/Serenotes.png",
    "./style/assets/icon-192.png",
    "./style/assets/icon-512.png",
    "./js/pages/welcome.js",
    "./js/pages/dashboard.js",
    "./js/pages/add-note.js",
    "./js/pages/note-detail.js",
    "./js/pages/calendar.js",
    "./js/pages/category.js",
    "./js/pages/category-settings.js",
    "./js/pages/reminder.js",
    "./js/pages/search.js",
    "./js/pages/settings.js",
    "./js/services/noteService.js",
    "./js/services/categoryService.js",
    "./js/services/reminderService.js",
    "./js/services/mediaService.js",
    "./js/services/searchService.js"
];

self.addEventListener("install", (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => cache.addAll(STATIC_ASSETS))
    );
    self.skipWaiting();
});

self.addEventListener("activate", (event) => {
    event.waitUntil(
        caches.keys().then((keys) =>
            Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
        )
    );
    self.clients.claim();
});

self.addEventListener("fetch", (event) => {
    if (event.request.method !== "GET") return;
    if (!event.request.url.startsWith(self.location.origin)) return;

    event.respondWith(
        caches.match(event.request).then((cached) => {
            if (cached) return cached;
            return fetch(event.request).then((response) => {
                if (response && response.status === 200) {
                    const clone = response.clone();
                    caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
                }
                return response;
            }).catch(() => {
                if (event.request.mode === "navigate") {
                    return caches.match("./dashboard.html");
                }
            });
        })
    );
});
