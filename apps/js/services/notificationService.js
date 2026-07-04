import { LocalNotifications } from "@capacitor/local-notifications";

/**
 * Cek apakah berjalan di Capacitor native (Android/iOS)
 * atau di browser biasa.
 */
function isNative() {
    return !!(window.Capacitor?.isNativePlatform?.());
}

/**
 * Minta izin notifikasi.
 * Di native: pakai Capacitor API.
 * Di browser: pakai Web Notification API.
 */
export async function requestPermission() {
    if (isNative()) {
        const { display } = await LocalNotifications.requestPermissions();
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
 * @param {object} note - note object dengan id, noteName, reminder.datetime
 */
export async function scheduleReminderNotification(note) {
    if (!note?.reminder?.enabled || !note.reminder.datetime) return;

    const scheduledAt = new Date(note.reminder.datetime);
    if (scheduledAt <= new Date()) return; // Sudah lewat, skip

    const granted = await requestPermission();
    if (!granted) return;

    // Gunakan hash dari noteId sebagai integer ID notifikasi
    const notifId = hashId(note.id);

    if (isNative()) {
        // Cancel dulu kalau sudah ada
        await cancelReminderNotification(note.id);

        await LocalNotifications.schedule({
            notifications: [
                {
                    id:       notifId,
                    title:    "Serenotes Reminder 🔔",
                    body:     note.noteName || note.title || "You have a reminder!",
                    schedule: { at: scheduledAt, allowWhileIdle: true },
                    sound:    null,
                    smallIcon: "ic_launcher_foreground",
                    extra:    { noteId: note.id }
                }
            ]
        });

    } else {
        // Fallback browser: pakai setTimeout (hanya works kalau tab terbuka)
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
 * @param {string} noteId
 */
export async function cancelReminderNotification(noteId) {
    if (!isNative()) return;

    const notifId = hashId(noteId);

    try {
        await LocalNotifications.cancel({
            notifications: [{ id: notifId }]
        });
    } catch (e) {
        // Tidak apa-apa kalau belum ada yang di-schedule
    }
}

/**
 * Re-schedule semua reminder yang belum lewat dan belum completed.
 * Panggil ini saat app pertama dibuka (di dashboard.js).
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

        const reminderTime = new Date(r.datetime);
        if (reminderTime <= now) continue; // Sudah lewat

        await scheduleReminderNotification(note);
    }
}

/**
 * Setup listener untuk klik notifikasi → buka note.
 * Panggil sekali saat app init.
 */
export function setupNotificationListener() {
    if (!isNative()) return;

    LocalNotifications.addListener(
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
 * Convert string UUID ke integer untuk ID notifikasi Capacitor.
 * Capacitor butuh ID berupa integer 32-bit.
 */
function hashId(str) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        const char = str.charCodeAt(i);
        hash = (hash << 5) - hash + char;
        hash |= 0; // Convert ke 32-bit integer
    }
    return Math.abs(hash);
}