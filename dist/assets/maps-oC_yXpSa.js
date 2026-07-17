import{b as m}from"./noteService-DbdrNuO8.js";const b=[-6.9175,107.6191],i=L.map("map",{zoomControl:!1}).setView(b,13);L.control.zoom({position:"bottomright"}).addTo(i);L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",{maxZoom:19,attribution:"&copy; OpenStreetMap contributors"}).addTo(i);const h=L.divIcon({className:"",html:`
        <div style="
            width:20px;
            height:20px;
            background:#2563eb;
            border:4px solid white;
            border-radius:50%;
            box-shadow:0 0 12px rgba(37,99,235,.5);
        "></div>
    `,iconSize:[20,20],iconAnchor:[10,10]}),x=L.divIcon({className:"",html:`
        <div style="
            width:18px;
            height:18px;
            background:#ef4444;
            border:3px solid white;
            border-radius:50%;
            box-shadow:0 0 10px rgba(239,68,68,.4);
        "></div>
    `,iconSize:[18,18],iconAnchor:[9,9]}),a=L.latLngBounds();let s=null,c=null;function f(){m().forEach(o=>{if(!o.location)return;const t=o.location.latitude,e=o.location.longitude;if(typeof t!="number"||typeof e!="number")return;a.extend([t,e]);const l=o.date?new Date(o.date).toLocaleString("id-ID"):"-",u=o.title||o.noteName||"Untitled",p=o.location.label||`${t.toFixed(5)}, ${e.toFixed(5)}`,g=L.marker([t,e],{icon:x}).addTo(i),r=document.createElement("div");r.style.minWidth="180px",r.innerHTML=`
            <strong>${u}</strong>
            <hr style="margin:8px 0">
            <div>📍 ${p}</div>
            <div>📅 ${l}</div>
        `;const d=document.createElement("button");d.textContent="Buka Note",d.style.cssText=`
            margin-top: 10px;
            width: 100%;
            padding: 6px 0;
            background: #4F46E5;
            color: white;
            border: none;
            border-radius: 6px;
            font-size: 13px;
            cursor: pointer;
        `,d.addEventListener("click",()=>{window.location.href=`note-detail.html?id=${o.id}`}),r.appendChild(d),g.bindPopup(r)})}function y(){navigator.geolocation&&navigator.geolocation.watchPosition(n=>{const o=n.coords.latitude,t=n.coords.longitude,e=n.coords.accuracy;a.extend([o,t]),s?s.setLatLng([o,t]):s=L.marker([o,t],{icon:h}).addTo(i).bindPopup("<b>Lokasi Anda</b>"),c?(c.setLatLng([o,t]),c.setRadius(e)):c=L.circle([o,t],{radius:e,color:"#2563eb",fillColor:"#2563eb",fillOpacity:.12,weight:1}).addTo(i),a.isValid()&&i.fitBounds(a,{padding:[60,60]})},n=>{console.error(n)},{enableHighAccuracy:!0,maximumAge:1e4,timeout:1e4})}f();y();a.isValid()&&i.fitBounds(a,{padding:[60,60]});
