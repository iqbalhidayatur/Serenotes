import"./modulepreload-polyfill-B5Qt9EMX.js";import"./preload-helper-CWvZBRxe.js";import{i as f}from"./themeService-BgIb2Nl3.js";import{d,e as s,f as p,c as l,r as y}from"./folderService-D-ma_eOi.js";import"./noteService-BbxFfomM.js";f();const{App:i}=window.Capacitor?.Plugins||{};i&&i.addListener("backButton",({canGoBack:e})=>{e?window.history.back():window.location.href="dashboard.html"});const o=document.getElementById("categoryList"),g=document.getElementById("addCategoryBtn"),h=document.getElementById("saveCategoryBtn"),c=document.getElementById("categoryName"),r=document.getElementById("parentFolderSelect"),m=new bootstrap.Modal(document.getElementById("categoryModal"));n();g.addEventListener("click",()=>{c.value="",v(),m.show()});h.addEventListener("click",L);function v(){const e=d();r.innerHTML=`
        <option value="">Top Level</option>
    `,e.forEach(t=>{r.innerHTML+=`
            <option value="${t.id}">
                ${"— ".repeat(t.depth)}${t.name}
            </option>
        `})}function n(){o.innerHTML="";const e=d();if(!e.length){o.innerHTML=`
            <p class="text-secondary text-center py-4">
                No folders yet. Create one above.
            </p>
        `;return}e.forEach(t=>{o.innerHTML+=b(t)}),E()}function b(e){return`

    <div
        class="category-setting-card mb-3"
        data-id="${e.id}"
        style="margin-left:${e.depth*20}px"
    >

        <div
            class="d-flex justify-content-between align-items-center"
        >

            <div>

                <h5>

                    <i class="${e.icon}" style="color:${e.color}"></i>

                    ${e.name}

                </h5>

                <small>

                    ${s(e.id,!0)}

                    Notes

                </small>

            </div>

        </div>

        <div
            class="d-flex gap-2 mt-3"
        >

            <button
                class="btn btn-outline-primary btn-sm add-sub"
                data-id="${e.id}"
            >

                Add Subfolder

            </button>

            <button
                class="btn btn-outline-secondary btn-sm rename-folder"
                data-id="${e.id}"
            >

                Rename

            </button>

            <button
                class="btn btn-outline-danger btn-sm delete-category"
                data-id="${e.id}"
            >

                Delete

            </button>

        </div>

    </div>

    `}function E(){document.querySelectorAll(".delete-category").forEach(e=>{e.addEventListener("click",()=>{const t=s(e.dataset.id,!0),a=t>0?`Delete this folder and its ${t} note(s) inside (including subfolders)? This cannot be undone.`:"Delete this empty folder?";confirm(a)&&(p(e.dataset.id),n())})}),document.querySelectorAll(".add-sub").forEach(e=>{e.addEventListener("click",()=>{const t=prompt("Subfolder name");if(t){if(!l(t,e.dataset.id)){alert("A folder with that name already exists here.");return}n()}})}),document.querySelectorAll(".rename-folder").forEach(e=>{e.addEventListener("click",()=>{const t=d().find(u=>u.id===e.dataset.id),a=prompt("Rename folder",t?.name||"");if(a){if(!y(e.dataset.id,a)){alert("A folder with that name already exists here.");return}n()}})})}function L(){const e=c.value.trim();if(e==="")return;const t=r.value||null;if(!l(e,t)){alert("A folder with that name already exists here.");return}m.hide(),n()}
