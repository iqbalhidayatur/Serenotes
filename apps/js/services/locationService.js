/**
 * locationService.js
 * ------------------------------------------------------------
 * Menangkap lokasi device (dengan izin/permission user) saat
 * sebuah note dibuat, lalu mengubahnya jadi label yang enak
 * dibaca (mis. "Jakarta, DKI Jakarta") lewat reverse geocoding.
 *
 * Didesain untuk gagal secara aman:
 * - Kalau geolocation tidak didukung  -> resolve(null)
 * - Kalau user menolak permission     -> resolve(null)
 * - Kalau timeout / device tidak fix  -> resolve(null)
 * - Kalau reverse geocode gagal (mis. offline) -> tetap resolve
 *   dengan koordinat mentah, tanpa label.
 *
 * Note creation TIDAK PERNAH diblokir oleh fitur ini.
 */

const GEO_TIMEOUT_MS = 8000;
const GEOCODE_TIMEOUT_MS = 5000;

/**
 * Minta lokasi saat ini ke device (memicu permission prompt
 * kalau belum pernah diizinkan).
 *
 * @returns {Promise<{latitude:number, longitude:number, label:string|null, capturedAt:string}|null>}
 */
export function getCurrentLocation() {

    return new Promise((resolve) => {

        if (!("geolocation" in navigator)) {
            resolve(null);
            return;
        }

        navigator.geolocation.getCurrentPosition(

            async (position) => {

                const { latitude, longitude } = position.coords;

                let label = null;

                try {
                    label = await reverseGeocode(latitude, longitude);
                } catch (err) {
                    label = null;
                }

                resolve({
                    latitude,
                    longitude,
                    label,
                    capturedAt: new Date().toISOString()
                });

            },

            () => {
                // Permission ditolak, posisi tidak tersedia, atau timeout.
                resolve(null);
            },

            {
                enableHighAccuracy: false,
                timeout: GEO_TIMEOUT_MS,
                maximumAge: 60000
            }
        );

    });

}

/**
 * Ubah koordinat jadi nama kota/area lewat OpenStreetMap Nominatim.
 * Butuh koneksi internet — kalau gagal/offline, return null saja
 * (caller tetap punya koordinat mentah sebagai fallback).
 */
async function reverseGeocode(latitude, longitude) {

    if (!navigator.onLine) return null;

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), GEOCODE_TIMEOUT_MS);

    try {

        const url =
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=14&addressdetails=1`;

        const res = await fetch(url, {
            headers: { "Accept": "application/json" },
            signal: controller.signal
        });

        if (!res.ok) return null;

        const data = await res.json();
        const addr = data.address || {};

        const city =
            addr.city || addr.town || addr.village ||
            addr.county || addr.suburb || "";

        const region = addr.state || addr.region || "";

        const parts = [city, region].filter(Boolean);

        if (parts.length) return parts.join(", ");

        return data.display_name || null;

    } catch (err) {

        return null;

    } finally {

        clearTimeout(timeoutId);

    }

}

/**
 * Format lokasi note untuk ditampilkan di UI.
 * Pakai label kalau ada, fallback ke koordinat mentah.
 */
export function formatLocationLabel(location) {

    if (!location) return "";

    if (location.label) return location.label;

    if (
        typeof location.latitude === "number" &&
        typeof location.longitude === "number"
    ) {
        return `${location.latitude.toFixed(3)}, ${location.longitude.toFixed(3)}`;
    }

    return "";

}
