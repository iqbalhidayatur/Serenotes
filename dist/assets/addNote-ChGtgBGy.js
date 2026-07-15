import"./modulepreload-polyfill-B5Qt9EMX.js";import"./preload-helper-CWvZBRxe.js";import{i as Q}from"./themeService-BgIb2Nl3.js";import{g as h,a as J,b as V,c as X}from"./folderService-vNidHTMm.js";import{g as y,a as R,b as Z,u as ee,m as te,c as ne}from"./noteService-Ds2xWZYt.js";import{g as ae}from"./locationService-C-vaanNi.js";import{i as oe,u as ie}from"./syncService-BG6OB9KZ.js";import{c as de,s as q}from"./notificationService-DwiMN6DO.js";Q();const{App:O}=window.Capacitor?.Plugins||{};O&&O.addListener("backButton",({canGoBack:e})=>{e?window.history.back():window.location.href="dashboard.html"});const C=new URLSearchParams(window.location.search),D=C.get("id"),S=C.get("parentId"),re=C.get("parentType");let i=null,k=[],T=[],a=null,d={parentId:null,parentType:null};const se=document.getElementById("noteForm"),M=document.getElementById("title"),W=document.getElementById("content"),I=document.getElementById("noteDate"),Y=document.getElementById("folderPickerBtn"),P=document.getElementById("folderPickerLabel"),_=document.getElementById("folderBreadcrumb"),x=document.getElementById("folderPickerList"),le=document.getElementById("chooseNoFolderBtn"),ce=document.getElementById("chooseThisFolderBtn"),H=document.getElementById("newFolderInline"),me=document.getElementById("newFolderInlineBtn"),$=new bootstrap.Modal(document.getElementById("folderPickerModal")),b=document.getElementById("reminderSwitch"),A=document.getElementById("reminderFields"),p=document.getElementById("reminderDate"),K=document.getElementById("attachment"),N=document.getElementById("attachmentPreview"),l=document.getElementById("noteName"),s=document.getElementById("noteSelect"),f=document.getElementById("btnNewNote"),v=document.getElementById("btnCancelNewNote");be();if(S&&!D){const e=y(S);a=null,d={parentId:S,parentType:re||"note"},e&&(P.innerHTML=`<i class="bi bi-file-earmark me-2"></i>${e.noteName||e.title||"Note"}`,Y.disabled=!0)}else ve();D&&(i=y(D),k=[...i?.media||[]]);i&&(ye(),L());Y.addEventListener("click",fe);le.addEventListener("click",ge);ce.addEventListener("click",he);me.addEventListener("click",G);H.addEventListener("keydown",e=>{e.key==="Enter"&&(e.preventDefault(),G())});b.addEventListener("change",Ie);se.addEventListener("submit",Le);K.addEventListener("change",ue);function ue(e){Array.from(e.target.files).forEach(o=>{if(!oe(o)){alert(`"${o.name}" is not supported. Only images, videos, and audio are allowed.`);return}T.push(o)}),K.value="",U()}function U(){N.innerHTML="",k.forEach((e,t)=>{N.innerHTML+=`
            <div class="attachment-item">
                <div class="attachment-info">
                    <i class="${j(e.mimeType)}"></i>
                    <div>
                        <div class="attachment-name">${e.filename}</div>
                        <div class="attachment-size">${z(e.size)}</div>
                    </div>
                </div>
                <button class="btn-remove" type="button" data-existing="${t}">
                    <i class="bi bi-x"></i>
                </button>
            </div>
        `}),T.forEach((e,t)=>{N.innerHTML+=`
            <div class="attachment-item">
                <div class="attachment-info">
                    <i class="${j(e.type)}"></i>
                    <div>
                        <div class="attachment-name">${e.name}</div>
                        <div class="attachment-size">${z(e.size)}</div>
                    </div>
                </div>
                <button class="btn-remove" type="button" data-new="${t}">
                    <i class="bi bi-x"></i>
                </button>
            </div>
        `}),pe()}function pe(){N.querySelectorAll(".btn-remove").forEach(e=>{e.addEventListener("click",()=>{const t=e.dataset.existing,o=e.dataset.new;t!==void 0&&k.splice(Number(t),1),o!==void 0&&T.splice(Number(o),1),U()})})}function fe(){const e=a?h(a):null;d=e?{parentId:e.id,parentType:"folder"}:{parentId:null,parentType:null},B(),$.show()}function ve(){const e=Ee();if(!e)return;if(!y(e.noteId)){localStorage.removeItem("serenotes_last_context");return}a=e.folderId;const o=h(a);d={parentId:a,parentType:o?o.parentType:null},E(),L(),requestAnimationFrame(()=>{s.value=e.noteId})}function L(){if(s.innerHTML="",!a){l.classList.remove("d-none"),s.classList.add("d-none"),f.classList.add("d-none"),v.classList.add("d-none");return}const e=R(a);if(e.length===0){l.classList.remove("d-none"),s.classList.add("d-none"),f.classList.add("d-none"),v.classList.add("d-none");return}e.forEach(t=>{s.innerHTML+=`

            <option value="${t.id}">

                ${t.noteName}

            </option>

        `}),l.classList.add("d-none"),s.classList.remove("d-none"),f.classList.remove("d-none"),v.classList.add("d-none")}f.addEventListener("click",()=>{s.classList.add("d-none"),f.classList.add("d-none"),l.classList.remove("d-none"),v.classList.remove("d-none"),l.value="",l.focus(),w(a,null)});v.addEventListener("click",()=>{l.classList.add("d-none"),v.classList.add("d-none"),s.classList.remove("d-none"),f.classList.remove("d-none")});function B(){const e=J(d.parentId);_.innerHTML=`
        <li class="breadcrumb-item">
            <a href="#" data-nav="root">
                <i class="bi bi-house"></i>
            </a>
        </li>
        ${e.map(n=>`
            <li class="breadcrumb-item">
                <a href="#" data-nav="${n.id}">
                    ${n.name}
                </a>
            </li>
        `).join("")}
    `,_.querySelectorAll("[data-nav]").forEach(n=>{n.addEventListener("click",r=>{if(r.preventDefault(),n.dataset.nav==="root")d={parentId:null,parentType:null};else{const g=h(n.dataset.nav);if(!g)return;d={parentId:g.id,parentType:"folder"}}B()})});const t=V(d.parentId,d.parentType),o=d.parentId?R(d.parentId):Z().filter(n=>!n.folderId&&!n.parentId);let m="";t.length&&(m+=t.map(n=>`
            <button
                type="button"
                class="folder-picker-item"
                data-id="${n.id}"
                data-kind="folder"
            >
                <i class="${n.icon||"bi bi-folder"}" style="color:${n.color||"#4F46E5"}"></i>
                <span>${n.name}</span>
                <i class="bi bi-chevron-right ms-auto"></i>
            </button>
        `).join("")),o.length&&(t.length&&(m+='<div class="fp-section-label">Notes</div>'),m+=o.map(n=>{const r=n.noteName||n.title||"Untitled",g=n.date?new Date(n.date).toLocaleDateString("id-ID",{day:"numeric",month:"short"}):"";return`
                <button
                    type="button"
                    class="folder-picker-item fp-note-item"
                    data-id="${n.id}"
                    data-kind="note"
                >
                    <i class="bi bi-file-earmark-text" style="color:#6b7280"></i>
                    <span class="fp-note-name">${r}</span>
                    <span class="fp-note-date ms-auto">${g}</span>
                </button>
            `}).join("")),!t.length&&!o.length&&(m='<div class="text-muted small py-2 px-1">Folder ini kosong.</div>'),x.innerHTML=m,x.querySelectorAll("[data-kind='folder']").forEach(n=>{n.addEventListener("click",()=>{const r=h(n.dataset.id);r&&(d={parentId:r.id,parentType:"folder"},B())})}),x.querySelectorAll("[data-kind='note']").forEach(n=>{n.addEventListener("click",()=>{const r=y(n.dataset.id);r&&(a=r.folderId||null,E(),a?(L(),requestAnimationFrame(()=>{s.value=r.id})):(s.innerHTML=`<option value="${r.id}">${r.noteName||r.title||"Untitled"}</option>`,s.value=r.id,l.classList.add("d-none"),s.classList.remove("d-none"),f.classList.remove("d-none"),v.classList.add("d-none")),$.hide())})}),H.value=""}function G(){const e=H.value.trim();if(!e)return;const t=X(e,d.parentId,d.parentType);if(!t){alert("A folder with that name already exists here.");return}d={parentId:t.id,parentType:"folder"},B()}function ge(){a=null,d={parentId:null,parentType:null},E(),$.hide(),L()}function he(){a=d.parentId,E(),L(),$.hide()}function E(){if(!a){P.innerHTML='<i class="bi bi-file-earmark me-2"></i>No Folder';return}const t=J(a).map(o=>o.name).join(" / ");P.innerHTML=`<i class="bi bi-folder2-open me-2"></i>${t}`}function Ie(){if(b.checked){if(A.classList.remove("d-none"),!p.value){const e=I.value?new Date(new Date(I.value).getTime()+36e5):new Date(Date.now()+36e5),t=o=>String(o).padStart(2,"0");p.value=`${e.getFullYear()}-${t(e.getMonth()+1)}-${t(e.getDate())}T${t(e.getHours())}:${t(e.getMinutes())}`}}else A.classList.add("d-none"),p.value=""}function be(){const e=new Date,t=o=>String(o).padStart(2,"0");I.value=`${e.getFullYear()}-${t(e.getMonth()+1)}-${t(e.getDate())}T${t(e.getHours())}:${t(e.getMinutes())}`}function ye(){document.title="Edit Note | Serenotes",document.getElementById("pageTitle").textContent="Edit Note",document.getElementById("headerSaveBtn").textContent="Update",document.getElementById("bottomSaveBtn").textContent="Update Note",l.value=i.noteName||"",M.value=i.title||"",W.value=i.blocks?.map(t=>t.text).join(`

`)||"",I.value=i.date.substring(0,16),a=i.folderId||null,E();const e=h(a);d={parentId:a,parentType:e?e.parentType:null},i.reminder?.enabled&&(b.checked=!0,A.classList.remove("d-none"),p.value=i.reminder.datetime.substring(0,16)),U()}async function Le(e){e.preventDefault();const t=[...k];for(const c of T)try{const F=await ie(c);t.push(F)}catch(F){alert(`Failed to upload "${c.name}": ${F.message}`);return}const o=a?h(a):null,m=l.classList.contains("d-none")?y(s.value)?.noteName||"":l.value.trim(),r=!i&&l.classList.contains("d-none")===!1?await ae():null,g=t.map(c=>({id:crypto.randomUUID(),type:"media",text:"",mediaIds:JSON.stringify([c.refId||c.id])})),u={noteName:m,title:M.value.trim(),blocks:[{id:crypto.randomUUID(),type:"section",text:M.value.trim()},{id:crypto.randomUUID(),type:"paragraph",text:W.value.trim()},...g],folderId:a??null,parentId:a??d.parentId??null,parentType:a?"folder":d.parentType??null,category:o?.name||"",subcategory:"",date:I.value,reminder:b.checked&&p.value?{enabled:!0,datetime:p.value,completed:!1,notified:!1,createdAt:new Date().toISOString()}:{enabled:!1,datetime:"",completed:!1,notified:!1},checklist:i?.checklist||[],media:t,tags:i?.tags||[],location:i?.location||r||null};if(console.log("reminderSwitch.checked:",b.checked),console.log("reminderDate.value:",p.value),console.log("noteData.reminder:",JSON.stringify(u.reminder)),i)ee(i.id,u),w(a,i.id),await de(i.id),u.reminder?.enabled&&await q({...i,...u});else if(l.classList.contains("d-none"))te(s.value,u.blocks),w(a,s.value);else{const c=ne(u);w(a,c.id),u.reminder?.enabled&&await q(c)}window.location.href="dashboard.html"}function j(e){return e.startsWith("image/")?"bi bi-image":e.startsWith("video/")?"bi bi-camera-video":e.startsWith("audio/")?"bi bi-mic-fill":"bi bi-paperclip"}function z(e){return e<1024?e+" B":e<1024*1024?(e/1024).toFixed(1)+" KB":(e/(1024*1024)).toFixed(1)+" MB"}function w(e,t){localStorage.setItem("serenotes_last_context",JSON.stringify({folderId:e,noteId:t}))}function Ee(){return JSON.parse(localStorage.getItem("serenotes_last_context")||"null")}
