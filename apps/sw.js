const CACHE_NAME = "serenotes-v2";

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
        // ignoreSearch: true → cache match tanpa peduli query string
        caches.match(event.request, { ignoreSearch: true }).then((cached) => {
            if (cached) return cached;
            return fetch(event.request).then((response) => {
                if (response && response.status === 200) {
                    const clone = response.clone();
                    // Simpan ke cache tanpa query string
                    const cacheUrl = new URL(event.request.url);
                    cacheUrl.search = "";
                    caches.open(CACHE_NAME).then((cache) =>
                        cache.put(new Request(cacheUrl.toString()), clone)
                    );
                }
                return response;
            }).catch(() => {
                if (event.request.mode === "navigate") {
                    // Coba return halaman yang diminta dari cache dulu
                    const url = new URL(event.request.url);
                    url.search = "";
                    return caches.match(url.toString()) ||
                           caches.match("./dashboard.html");
                }
            });
        })
    );
});

// ── Reminder Notification Handler ─────────────────────
// Dipanggil dari halaman via postMessage
self.addEventListener("message", (event) => {
    if (event.data?.type !== "CHECK_REMINDERS") return;

    const notes = event.data.notes || [];
    const now   = Date.now();

    notes.forEach(note => {
        const r = note.reminder;
        if (!r?.enabled || r.completed || r.notified) return;

        const reminderTime = new Date(r.datetime).getTime();

        // Tampilkan notifikasi jika waktu sudah lewat (dalam window 5 menit ke belakang)
        if (reminderTime <= now && reminderTime >= now - 5 * 60 * 1000) {
            self.registration.showNotification("Serenotes Reminder 🔔", {
                body:    note.noteName || note.title || "You have a reminder!",
                icon:    "./style/assets/icon-192.png",
                badge:   "./style/assets/icon-192.png",
                tag:     `reminder-${note.id}`,
                data:    { noteId: note.id, url: `./note-detail.html?id=${note.id}` },
                actions: [
                    { action: "open",   title: "Open Note" },
                    { action: "dismiss", title: "Dismiss" }
                ]
            });
        }
    });
});

// Klik notifikasi → buka note
self.addEventListener("notificationclick", (event) => {
    event.notification.close();

    const { url, noteId } = event.notification.data || {};

    if (event.action === "dismiss") return;

    event.waitUntil(
        clients.matchAll({ type: "window", includeUncontrolled: true }).then((clientList) => {
            // Kalau sudah ada tab yang terbuka, fokus ke sana
            for (const client of clientList) {
                if (client.url.includes(noteId) && "focus" in client) {
                    return client.focus();
                }
            }
            // Kalau tidak ada, buka tab baru
            if (clients.openWindow && url) {
                return clients.openWindow(url);
            }
        })
    );
});