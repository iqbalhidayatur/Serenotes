import"./modulepreload-polyfill-B5Qt9EMX.js";import"./preload-helper-D33vDyUH.js";import{i as b}from"./themeService-BgIb2Nl3.js";import{h as g,a as y,b as s,i as w,e as f,r as x,f as $,c as E}from"./folderService-CcR8-Orv.js";import"./quickNote-Doto7KFv.js";import"./syncService-BQUdfgLS.js";import"./noteService-DbdrNuO8.js";b();const{App:u}=window.Capacitor?.Plugins||{};u&&u.addListener("backButton",({canGoBack:e})=>{e?window.history.back():window.location.href="dashboard.html"});const m=document.getElementById("explorerBreadcrumb"),d=document.getElementById("explorerList"),L=document.getElementById("categoryStats"),c=document.getElementById("newFolderInput"),F=document.getElementById("newFolderBtn");let n=null,o=null;B();function B(){o=null,F.addEventListener("click",p),c.addEventListener("keydown",e=>{e.key==="Enter"&&(e.preventDefault(),p())}),a()}function a(){k(),A(),I(),T()}function k(){const e=g();L.textContent=e.text}function A(){const e=y(n);m.innerHTML=`

        <a data-nav="root" class="${e.length?"":"current"}">
            <i class="bi bi-house-door-fill"></i> Home
        </a>

        ${e.map((t,i)=>`

            <span class="sep">/</span>

            <a
                data-nav="${t.id}"
                class="${i===e.length-1?"current":""}"
            >
                ${t.name}
            </a>

        `).join("")}

    `,m.querySelectorAll("[data-nav]").forEach(t=>{t.addEventListener("click",()=>{t.dataset.nav==="root"?(n=null,o=null):(n=t.dataset.nav,o="folder"),a()})})}function I(){const e=s(n,o),t=w(n,o);if(!e.length&&!t.length){d.innerHTML=`

            <div class="explorer-empty">
                <i class="bi bi-folder2-open"></i>
                <h5>Empty Folder</h5>
                <p>Create a subfolder above, or add a note here from the Add Note form.</p>
            </div>

        `;return}const i=e.map(r=>{const h=f(r.id,!0),v=s(r.id,"folder").length;return`

            <div class="explorer-row" data-type="folder" data-id="${r.id}">

                <div
                    class="explorer-row-icon"
                    style="background:${r.color}22;color:${r.color}"
                >
                    <i class="${r.icon||"bi bi-folder-fill"}"></i>
                </div>

                <div class="explorer-row-body">
                    <div class="explorer-row-title">${r.name}</div>
                    <div class="explorer-row-meta">

                        ${v} folders • ${h} notes

                    </div>
                </div>

                <div class="explorer-row-actions">

                    <button type="button" data-action="rename" data-id="${r.id}">
                        <i class="bi bi-pencil"></i>
                    </button>

                    <button type="button" data-action="delete" data-id="${r.id}">
                        <i class="bi bi-trash"></i>
                    </button>

                </div>

                <i class="bi bi-chevron-right"></i>

            </div>

        `}).join(""),l=t.map(r=>`

        <div class="explorer-row" data-type="note" data-id="${r.id}">

            <div class="explorer-row-icon" style="background:var(--primary-light);color:var(--primary)">
                <i class="bi bi-file-earmark-text-fill"></i>
            </div>

            <div class="explorer-row-body">
                <div class="explorer-row-title">
                    ${r.noteName?r.noteName:C(r.blocks?.[0]?.text)}
                </div>
                <div class="explorer-row-meta">${N(r.date)}</div>
            </div>

            <i class="bi bi-chevron-right"></i>

        </div>

    `).join("");d.innerHTML=i+l,S()}function S(){d.querySelectorAll(".explorer-row").forEach(e=>{e.addEventListener("click",t=>{t.target.closest("[data-action]")||(e.dataset.type==="folder"?(n=e.dataset.id,o="folder",a()):window.location.href=`note-detail.html?id=${e.dataset.id}`)})}),d.querySelectorAll("[data-action='rename']").forEach(e=>{e.addEventListener("click",()=>{const t=s(n,o).find(l=>l.id===e.dataset.id),i=prompt("Rename folder",t?.name||"");if(i){if(!x(e.dataset.id,i)){alert("A folder with that name already exists here.");return}a()}})}),d.querySelectorAll("[data-action='delete']").forEach(e=>{e.addEventListener("click",()=>{const t=f(e.dataset.id,!0),i=t>0?`Delete this folder and its ${t} note(s) inside (including subfolders)? This cannot be undone.`:"Delete this empty folder?";confirm(i)&&($(e.dataset.id),a())})})}function T(){const e=document.getElementById("navAddNote");e&&(e.href=n?`add-note.html?parentId=${n}&parentType=folder`:"add-note.html")}function p(){const e=c.value.trim();if(!e)return;if(!E(e,n,o)){alert("A folder with that name already exists here.");return}c.value="",a()}function C(e){return e?e.length>40?e.substring(0,40)+"...":e:"Untitled"}function N(e){return new Date(e).toLocaleTimeString("en-US",{hour:"2-digit",minute:"2-digit"})}
