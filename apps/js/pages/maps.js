import { getAllNotes } from "../services/noteService.js";

const DEFAULT_LOCATION = [-6.9175, 107.6191];

const map = L.map("map", {
    zoomControl: false
}).setView(DEFAULT_LOCATION, 13);

L.control.zoom({
    position: "bottomright"
}).addTo(map);

L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    maxZoom: 19,
    attribution: "&copy; OpenStreetMap contributors"
}).addTo(map);

// =========================
// Icons
// =========================

const userIcon = L.divIcon({
    className: "",
    html: `
        <div style="
            width:20px;
            height:20px;
            background:#2563eb;
            border:4px solid white;
            border-radius:50%;
            box-shadow:0 0 12px rgba(37,99,235,.5);
        "></div>
    `,
    iconSize: [20, 20],
    iconAnchor: [10, 10]
});

const noteIcon = L.divIcon({
    className: "",
    html: `
        <div style="
            width:18px;
            height:18px;
            background:#ef4444;
            border:3px solid white;
            border-radius:50%;
            box-shadow:0 0 10px rgba(239,68,68,.4);
        "></div>
    `,
    iconSize: [18, 18],
    iconAnchor: [9, 9]
});

const bounds = L.latLngBounds();

let userMarker = null;
let accuracyCircle = null;

// =========================
// Notes Marker
// =========================

function loadNotes() {

    const notes = getAllNotes();

    notes.forEach(note => {

        if (!note.location) return;

        const lat = note.location.latitude;
        const lng = note.location.longitude;

        if (
            typeof lat !== "number" ||
            typeof lng !== "number"
        ) {
            return;
        }

        bounds.extend([lat, lng]);

        const date = note.date
            ? new Date(note.date).toLocaleString("id-ID")
            : "-";

        const title =
            note.title ||
            note.noteName ||
            "Untitled";

        const location =
            note.location.label ||
            `${lat.toFixed(5)}, ${lng.toFixed(5)}`;

        const marker = L.marker([lat, lng], { icon: noteIcon }).addTo(map);

        // Popup dengan tombol "Buka Note"
        const popupContent = document.createElement("div");
        popupContent.style.minWidth = "180px";
        popupContent.innerHTML = `
            <strong>${title}</strong>
            <hr style="margin:8px 0">
            <div>📍 ${location}</div>
            <div>📅 ${date}</div>
        `;

        const btn = document.createElement("button");
        btn.textContent = "Buka Note";
        btn.style.cssText = `
            margin-top: 10px;
            width: 100%;
            padding: 6px 0;
            background: #4F46E5;
            color: white;
            border: none;
            border-radius: 6px;
            font-size: 13px;
            cursor: pointer;
        `;
        btn.addEventListener("click", () => {
            window.location.href = `note-detail.html?id=${note.id}`;
        });

        popupContent.appendChild(btn);
        marker.bindPopup(popupContent);

    });

}

// =========================
// User Location
// =========================

function loadUserLocation() {

    if (!navigator.geolocation) return;

    navigator.geolocation.watchPosition(

        position => {

            const lat = position.coords.latitude;
            const lng = position.coords.longitude;
            const accuracy = position.coords.accuracy;

            bounds.extend([lat, lng]);

            if (!userMarker) {

                userMarker = L.marker([lat, lng], { icon: userIcon })
                    .addTo(map)
                    .bindPopup("<b>Lokasi Anda</b>");

            } else {

                userMarker.setLatLng([lat, lng]);

            }

            if (!accuracyCircle) {

                accuracyCircle = L.circle([lat, lng], {
                    radius: accuracy,
                    color: "#2563eb",
                    fillColor: "#2563eb",
                    fillOpacity: .12,
                    weight: 1
                }).addTo(map);

            } else {

                accuracyCircle.setLatLng([lat, lng]);
                accuracyCircle.setRadius(accuracy);

            }

            if (bounds.isValid()) {
                map.fitBounds(bounds, { padding: [60, 60] });
            }

        },

        error => { console.error(error); },

        {
            enableHighAccuracy: true,
            maximumAge: 10000,
            timeout: 10000
        }

    );

}

// =========================
// Init
// =========================

loadNotes();
loadUserLocation();

if (bounds.isValid()) {
    map.fitBounds(bounds, { padding: [60, 60] });
}