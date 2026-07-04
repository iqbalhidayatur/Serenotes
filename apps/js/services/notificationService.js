/**
 * Cek apakah berjalan di Capacitor native (Android/iOS).
 */
function isNative() {
    return !!(window.Capacitor?.isNativePlatform?.());
}

/**
 * Ambil plugin LocalNotifications dari Capacitor global.
 * Di native, Capacitor inject plugin ke window.Capacitor.Plugins.
 */
function getPlugin() {
    return window.Capacitor?.Plugins?.LocalNotifications || null;
}

/**
 * Minta izin notifikasi.
 */
export async function requestPermission() {
    const plugin = getPlugin();

    if (isNative() && plugin) {
        const { display } = await plugin.requestPermissions();
        return display === "granted";
    }

    if (!("Notification" in window)) return false;
    if (Notification.permission === "granted") return true;
    if (Notification.permission === "denied")  return false;

    const result = await Notification.requestPermission();
    return result === "granted";
}

/**
 * Schedule notifikasi reminder untuk sebuah note.
 */
export async function scheduleReminderNotification(note) {
    if (!note?.reminder?.enabled || !note.reminder.datetime) return;

    const scheduledAt = new Date(note.reminder.datetime);
    if (scheduledAt <= new Date()) return;

    const granted = await requestPermission();
    if (!granted) return;

    const notifId = hashId(note.id);
    const plugin  = getPlugin();

    if (isNative() && plugin) {
        await cancelReminderNotification(note.id);

        await plugin.schedule({
            notifications: [
                {
                    id:       notifId,
                    title:    "Serenotes Reminder 🔔",
                    body:     note.noteName || note.title || "You have a reminder!",
                    schedule: { at: scheduledAt, allowWhileIdle: true },
                    smallIcon: "ic_launcher_foreground",
                    extra:    { noteId: note.id }
                }
            ]
        });

    } else {
        // Fallback browser: setTimeout (hanya works kalau tab terbuka)
        const delay = scheduledAt.getTime() - Date.now();
        if (delay > 0 && delay < 24 * 60 * 60 * 1000) {
            setTimeout(() => {
                new Notification("Serenotes Reminder 🔔", {
                    body: note.noteName || note.title || "You have a reminder!",
                    icon: "./style/assets/icon-192.png"
                });
            }, delay);
        }
    }
}

/**
 * Cancel notifikasi yang sudah di-schedule untuk note tertentu.
 */
export async function cancelReminderNotification(noteId) {
    const plugin = getPlugin();
    if (!isNative() || !plugin) return;

    const notifId = hashId(noteId);
    try {
        await plugin.cancel({ notifications: [{ id: notifId }] });
    } catch (e) {
        // Tidak apa-apa kalau belum ada
    }
}

/**
 * Re-schedule semua reminder yang belum lewat saat app dibuka.
 */
export async function rescheduleAllReminders() {
    const granted = await requestPermission();
    if (!granted) return;

    const notes = JSON.parse(
        localStorage.getItem("serenotes_notes") || "[]"
    );

    const now = new Date();

    for (const note of notes) {
        const r = note.reminder;
        if (!r?.enabled || r.completed || r.notified) continue;
        if (new Date(r.datetime) <= now) continue;
        await scheduleReminderNotification(note);
    }
}

/**
 * Setup listener klik notifikasi → buka note.
 * Panggil sekali saat app init.
 */
export function setupNotificationListener() {
    const plugin = getPlugin();
    if (!isNative() || !plugin) return;

    plugin.addListener(
        "localNotificationActionPerformed",
        (action) => {
            const noteId = action.notification.extra?.noteId;
            if (noteId) {
                window.location.href = `note-detail.html?id=${noteId}`;
            }
        }
    );
}

/**
 * Convert UUID string ke integer 32-bit untuk ID notifikasi.
 */
function hashId(str) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        const char = str.charCodeAt(i);
        hash = (hash << 5) - hash + char;
        hash |= 0;
    }
    return Math.abs(hash);
}