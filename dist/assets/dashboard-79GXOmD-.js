import"./modulepreload-polyfill-B5Qt9EMX.js";import"./preload-helper-CWvZBRxe.js";import{i as D}from"./themeService-BgIb2Nl3.js";import{d as $,j as x}from"./folderService-vNidHTMm.js";import{a as I,r as B}from"./notificationService-DwiMN6DO.js";import{t as P,b as r,d as k}from"./noteService-Ds2xWZYt.js";import{a as F,b as N,p as M,s as C}from"./syncService-BG6OB9KZ.js";import"./quickNote-wTLOMa8S.js";I();B();D();F()&&N().then(()=>M()).finally(()=>C(3e4));const{App:u}=window.Capacitor?.Plugins||{};let m=!1,b=null;u&&u.addListener("backButton",()=>{if(m){clearTimeout(b),u.exitApp();return}m=!0,A(),b=setTimeout(()=>{m=!1},2e3)});function A(){const e=document.getElementById("exitToast");e&&e.remove();const t=document.createElement("div");t.id="exitToast",t.textContent="Press back again to exit",t.style.cssText=`
        position: fixed;
        bottom: 90px;
        left: 50%;
        transform: translateX(-50%);
        background: rgba(0,0,0,0.75);
        color: #fff;
        padding: 10px 20px;
        border-radius: 20px;
        font-size: 14px;
        z-index: 9999;
        pointer-events: none;
        animation: fadeInOut 2s forwards;
    `,document.body.appendChild(t),setTimeout(()=>t.remove(),2e3)}const p=document.getElementById("notesContainer"),s=document.getElementById("filterFolder"),H=document.getElementById("applyFilter"),O=document.getElementById("resetFilter"),i=document.getElementById("filterTag"),f=document.getElementById("filterStartDate"),g=document.getElementById("filterEndDate"),h=localStorage.getItem("serenotes_user"),y=document.getElementById("headerGreeting"),v=document.getElementById("filterOverlay"),w=document.getElementById("filterPopup"),S=document.getElementById("btnFilter"),j=document.getElementById("closeFilter"),E=document.getElementById("recentContainer");function l(){v.classList.remove("show"),w.classList.remove("show")}y&&h&&(y.textContent=`Hi, ${h} 👋`);c();d();S.addEventListener("click",()=>{v.classList.add("show"),w.classList.add("show")});window.addEventListener("serenotes-data-changed",()=>{d(),c()});j.addEventListener("click",l);v.addEventListener("click",l);document.addEventListener("click",e=>{const t=e.target.closest(".btn-delete-note");if(t){e.stopPropagation();const L=t.dataset.id,T=t.dataset.title;R(L,T);return}const n=e.target.closest(".btn-star-note");if(n){e.stopPropagation(),P(n.dataset.id),c(),d();return}const a=e.target.closest(".note-card");a&&(window.location.href=`note-detail.html?id=${a.dataset.id}`)});function d(e=r()){if(e=e.sort((t,n)=>t.isPinned&&!n.isPinned?-1:!t.isPinned&&n.isPinned?1:new Date(n.date)-new Date(t.date)),p.innerHTML="",e.length===0){p.innerHTML=`
            <div class="text-center py-5">
                <i class="bi bi-journal-x" style="font-size:4rem;color:var(--text-primary);"></i>
                <h4 class="mt-3">No Notes Yet</h4>
                <p>Create your first note.</p>
            </div>
        `;return}e.forEach(t=>{p.innerHTML+=q(t)})}function q(e){return`
        <div class="row notes p-2 rounded-4 mb-3 note-card" data-id="${e.id}">
            <div class="top-card d-flex justify-content-between align-items-center w-100 pt-2">
                <div class="category-card d-flex justify-content-center align-items-center rounded-pill px-3">
                    <h5 class="pt-2">${e.category}</h5>
                </div>
                <div class="toggle-card d-flex gap-2 align-items-center">
                    <button class="btn-star-note" data-id="${e.id}" title="Pin note">
                        <i class="bi ${e.isPinned?"bi-pin-fill text-danger":"bi-pin-fill text-secondary"}"></i>
                    </button>
                    <button
                        class="btn-delete-note"
                        data-id="${e.id}"
                        data-title="${(e.noteName||"").replace(/"/g,"&quot;")}"
                        title="Delete note"
                    >
                        <i class="bi bi-trash3"></i>
                    </button>
                </div>
            </div>
            <div class="card-content pt-3">
                <h4>${e.noteName?e.noteName:(e.content||"").substring(0,30)+"..."}</h4>
                <p>${z(e.content)}</p>
            </div>
            <div class="card-date pb-2">
                <i class="bi bi-clock"></i>
                <span>${o(e.date)}</span>
                ${e.reminder?.enabled&&!e.reminder?.completed?`
                    <span class="ms-2 text-warning" title="Reminder: ${o(e.reminder.datetime)}">
                        <i class="bi bi-bell-fill"></i>
                        <small>${o(e.reminder.datetime)}</small>
                    </span>
                `:""}
            </div>
        </div>
    `}function z(e){return e?e.length>120?e.substring(0,120)+"...":e:""}function o(e){return new Date(e).toLocaleString("en-US",{day:"2-digit",month:"short",year:"numeric",hour:"2-digit",minute:"2-digit"})}function R(e,t){document.getElementById("deleteNoteModal")?.remove();const n=document.createElement("div");n.id="deleteNoteModal",n.innerHTML=`
        <div class="modal-backdrop-custom"></div>
        <div class="modal-sheet">
            <div class="modal-sheet-handle"></div>
            <i class="bi bi-trash3 modal-sheet-icon"></i>
            <h5>Delete Note?</h5>
            <p>"${t||"This note"}" will be permanently deleted.</p>
            <button id="confirmDelete" class="btn btn-danger w-100 rounded-4 mb-2">Delete</button>
            <button id="cancelDelete" class="btn btn-light w-100 rounded-4">Cancel</button>
        </div>
    `,document.body.appendChild(n),requestAnimationFrame(()=>n.classList.add("show"));function a(){n.classList.remove("show"),setTimeout(()=>n.remove(),300)}document.getElementById("confirmDelete").addEventListener("click",()=>{k(e),a(),c(),d()}),document.getElementById("cancelDelete").addEventListener("click",a),n.querySelector(".modal-backdrop-custom").addEventListener("click",a)}U();function U(){const e=$();s.innerHTML=`
        <option value="">All Folders</option>
    `,e.forEach(t=>{s.innerHTML+=`
            <option value="${t.id}">
                ${"— ".repeat(t.depth)}${t.name}
            </option>
        `})}function G(){if(!i)return;const e=[...new Set(r().flatMap(t=>t.tags||[]))].sort();i.innerHTML='<option value="">All Tags</option>',e.forEach(t=>{i.innerHTML+=`<option value="${t}">#${t}</option>`})}G();H.addEventListener("click",()=>{let e=r();if(s.value){const t=[s.value,...x(s.value)];e=e.filter(n=>t.includes(n.folderId))}if(f.value&&(e=e.filter(t=>new Date(t.date)>=new Date(f.value))),g.value){const t=new Date(g.value);t.setHours(23,59,59,999),e=e.filter(n=>new Date(n.date)<=t)}i.value&&(e=e.filter(t=>(t.tags||[]).includes(i.value))),e.sort((t,n)=>t.isPinned&&!n.isPinned?-1:!t.isPinned&&n.isPinned?1:new Date(n.date)-new Date(t.date)),d(e),l()});O.addEventListener("click",()=>{f.value="",g.value="",s.value="",i&&(i.value=""),d(),l()});function c(){const e=r().sort((t,n)=>new Date(n.lastOpened||n.updatedAt||n.date)-new Date(t.lastOpened||t.updatedAt||t.date)).slice(0,7);E.innerHTML="",e.forEach(t=>{E.innerHTML+=`
            <div class="recent-card note-card" data-id="${t.id}">

                <span class="recent-category">
                    ${t.category}
                </span>

                <div class="recent-title">
                    ${t.noteName||"Untitled"}
                </div>

                <div class="recent-date">
                    ${o(t.lastOpened||t.updatedAt||t.date)}
                </div>

            </div>
        `})}
