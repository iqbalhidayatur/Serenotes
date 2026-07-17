import"./modulepreload-polyfill-B5Qt9EMX.js";import"./preload-helper-D33vDyUH.js";import{b as u}from"./noteService-DbdrNuO8.js";import"./quickNote-Doto7KFv.js";import"./syncService-BQUdfgLS.js";const p=[-6.9175,107.6191],e=L.map("map",{zoomControl:!1}).setView(p,13);L.control.zoom({position:"bottomright"}).addTo(e);L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",{maxZoom:19,attribution:"&copy; OpenStreetMap contributors"}).addTo(e);const g=L.divIcon({className:"",html:`
        <div style="
            width:20px;
            height:20px;
            background:#2563eb;
            border:4px solid white;
            border-radius:50%;
            box-shadow:0 0 12px rgba(37,99,235,.5);
        "></div>
    `,iconSize:[20,20],iconAnchor:[10,10]}),m=L.divIcon({className:"",html:`
        <div style="
            width:18px;
            height:18px;
            background:#ef4444;
            border:3px solid white;
            border-radius:50%;
            box-shadow:0 0 10px rgba(239,68,68,.4);
        "></div>
    `,iconSize:[18,18],iconAnchor:[9,9]}),a=L.latLngBounds();let d=null,r=null;function b(){u().forEach(o=>{if(!o.location)return;const t=o.location.latitude,i=o.location.longitude;if(typeof t!="number"||typeof i!="number")return;a.extend([t,i]);const c=o.date?new Date(o.date).toLocaleString("id-ID"):"-",s=o.title||o.noteName||"Untitled",l=o.location.label||`${t.toFixed(5)}, ${i.toFixed(5)}`;L.marker([t,i],{icon:m}).addTo(e).bindPopup(`
            <div style="min-width:180px">
                <strong>${s}</strong>
                <hr style="margin:8px 0">
                <div>
                    📍 ${l}
                </div>
                <div>
                    📅 ${c}
                </div>
            </div>
        `)})}function h(){navigator.geolocation&&navigator.geolocation.watchPosition(n=>{const o=n.coords.latitude,t=n.coords.longitude,i=n.coords.accuracy;a.extend([o,t]),d?d.setLatLng([o,t]):d=L.marker([o,t],{icon:g}).addTo(e).bindPopup("<b>Lokasi Anda</b>"),r?(r.setLatLng([o,t]),r.setRadius(i)):r=L.circle([o,t],{radius:i,color:"#2563eb",fillColor:"#2563eb",fillOpacity:.12,weight:1}).addTo(e),a.isValid()&&e.fitBounds(a,{padding:[60,60]})},n=>{console.error(n)},{enableHighAccuracy:!0,maximumAge:1e4,timeout:1e4})}b();h();a.isValid()&&e.fitBounds(a,{padding:[60,60]});
