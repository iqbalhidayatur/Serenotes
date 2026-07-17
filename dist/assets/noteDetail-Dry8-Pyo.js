import"./modulepreload-polyfill-B5Qt9EMX.js";import"./preload-helper-D33vDyUH.js";import{i as je}from"./themeService-BgIb2Nl3.js";import{f as Ge}from"./locationService-BpfLJlW5.js";import{g as De,u as I,d as Ke,c as Je}from"./noteService-DbdrNuO8.js";import{i as Ve,u as Ze,c as pe,d as Qe}from"./syncService-BQUdfgLS.js";import{c as et,k as tt,l as nt}from"./folderService-CcR8-Orv.js";je();const ae=document.getElementById("mediaSection"),se=document.getElementById("reminderSection"),re=document.getElementById("voiceCard"),ot=document.getElementById("toolbarAttachBtn"),J=document.getElementById("mediaFileInput"),it=new URLSearchParams(window.location.search),Q=it.get("id");if(!Q)throw document.querySelector("main").innerHTML=`
        <div class="text-center py-5">
            <i class="bi bi-journal-x" style="font-size:4rem;color:#9ca3af;"></i>
            <h3 class="mt-3">ID Note tidak ditemukan</h3>
            <p class="text-muted">URL tidak mengandung parameter id.</p>
            <a href="dashboard.html" class="btn btn-primary mt-3">Kembali ke Dashboard</a>
        </div>
    `,new Error("No note ID in URL");const d=De(Q);d&&I(d.id,{lastOpened:new Date().toISOString()});const at=document.getElementById("categoryBadge"),st=document.getElementById("noteDate"),v=document.getElementById("editor"),A=document.getElementById("noteNameDisplay"),ee=document.getElementById("titleToggle"),$e=document.getElementById("noteBodyWrap"),H=document.getElementById("mediaContainer"),de=document.getElementById("reminderContainer"),Ce=document.getElementById("deleteBtn"),M=document.getElementById("editorToolbar"),L=document.getElementById("slashMenu"),X=document.getElementById("noteFoldersList"),rt=document.getElementById("btnAddFolderInNote"),V=document.getElementById("viewModeBtn"),ue=document.getElementById("tagHeaderBtn"),$=document.getElementById("tagDropdown"),ce=document.getElementById("tagsContainer"),O=document.getElementById("tagAddInput"),dt=document.getElementById("tagAddBtn");let C=null;if(!d)throw document.querySelector("main").innerHTML=`
        <div class="text-center py-5">
            <i class="bi bi-journal-x" style="font-size:4rem;color:#9ca3af;"></i>
            <h3 class="mt-3">Note tidak ditemukan</h3>
            <p class="text-muted small">ID: ${Q}</p>
            <a href="dashboard.html" class="btn btn-primary mt-3">Kembali ke Dashboard</a>
        </div>
    `,new Error("Note not found: "+Q);ut();rt?.addEventListener("click",mt);const ct=document.getElementById("btnAddNoteInNote");ct?.addEventListener("click",()=>{window.location.href=`add-note.html?parentId=${d.id}&parentType=note`});v.addEventListener("click",e=>{if(e.target.closest(".heading-toggle"))return;if(!e.target.closest(".editor-block")){const n=v.lastElementChild;n&&n.contentEditable==="true"?ve(n):Y(v.lastElementChild)}});V?.addEventListener("click",Dt);dt?.addEventListener("click",Ue);O?.addEventListener("keydown",e=>{e.key==="Enter"&&(e.preventDefault(),Ue())});ue?.addEventListener("click",e=>{if(e.stopPropagation(),$.classList.contains("open")){$.classList.remove("open");return}$.classList.add("open");const n=ue.getBoundingClientRect(),o=$.offsetWidth,i=$.offsetHeight,s=12,a=window.innerWidth,c=window.innerHeight;let l=n.bottom+8,u=n.right-o;u<s&&(u=s),u+o>a-s&&(u=a-o-s),l+i>c-s&&(l=n.top-i-8),$.style.top=`${l}px`,$.style.left=`${u}px`});document.addEventListener("click",e=>{!$?.contains(e.target)&&e.target!==ue&&$?.classList.remove("open")});ot?.addEventListener("click",()=>{J.click()});J?.addEventListener("change",async()=>{const e=Array.from(J.files);if(!e.length)return;const t=[];for(const n of e){if(!Ve(n)){alert(`"${n.name}" tidak didukung.`);continue}try{const o=await Ze(n);t.push(o)}catch(o){alert(`Gagal upload "${n.name}": ${o.message}`)}}t.length&&(d.media||(d.media=[]),d.media.push(...t),I(d.id,{media:d.media}),At(t),J.value="")});document.addEventListener("selectionchange",Tt);const lt=new MutationObserver(()=>{Lt()});lt.observe(v,{childList:!0,subtree:!0,characterData:!0});Ce&&Ce.addEventListener("click",()=>{confirm("Delete this note?")&&(Ke(d.id),window.location.href="dashboard.html")});function he(){X.innerHTML="";const e=tt(d.id),t=nt(d.id);if(e.length===0&&t.length===0){X.innerHTML=`

            <div class="text-secondary">

                Empty

            </div>

        `;return}e.forEach(n=>{X.innerHTML+=`

            <div
                class="folder-row"
                data-type="folder"
                data-id="${n.id}">

                <i
                    class="${n.icon}"
                    style="color:${n.color}">
                </i>

                <span>

                    ${n.name}

                </span>

            </div>

        `}),t.forEach(n=>{X.innerHTML+=`

            <div
                class="folder-row"
                data-type="note"
                data-id="${n.id}">

                <i
                    class="bi bi-file-earmark-text">

                </i>

                <span>

                    ${n.noteName}

                </span>

            </div>

        `})}X.addEventListener("click",e=>{const t=e.target.closest(".folder-row");t&&(t.dataset.type==="folder"?window.location.href=`category.html?folder=${t.dataset.id}`:window.location.href=`note-detail.html?id=${t.dataset.id}`)});async function ut(){at.textContent=d.category,A&&(A.textContent=d.noteName||"",A.addEventListener("input",()=>{d.noteName=A.textContent.trim(),I(d.id,{noteName:d.noteName})}),A.addEventListener("keydown",e=>{if(e.key==="Enter"){e.preventDefault();const t=v.querySelector(".editor-block");t&&F(t)}})),Re(!!d.titleCollapsed),ft(),he(),st.textContent=Ye(d.date),gt(),It(),await kt(),Mt()}function mt(){const e=prompt("Folder name");if(!e)return;if(!et(e,d.id,"note")){alert("Folder already exists.");return}he()}function ft(){v.innerHTML="",(!d.blocks||d.blocks.length===0)&&(d.blocks=[{id:crypto.randomUUID(),type:"section",text:d.title||""},{id:crypto.randomUUID(),type:"paragraph",text:""}]),d.blocks.forEach(pt)}function Re(e){!ee||!$e||(ee.classList.toggle("collapsed",e),$e.classList.toggle("note-body-hidden",e))}ee?.addEventListener("click",e=>{e.preventDefault(),e.stopPropagation();const t=!ee.classList.contains("collapsed");Re(t),d.titleCollapsed=t,I(d.id,{titleCollapsed:t})});function gt(){const e=document.getElementById("locationMetaWrap"),t=document.getElementById("noteLocation");if(!e||!t)return;const n=Ge(d.location);if(!n){e.classList.add("d-none");return}t.textContent=n,e.classList.remove("d-none")}function me(e){if(e.querySelectorAll(":scope > .heading-toggle").forEach(s=>s.remove()),!e.dataset.type.startsWith("heading")||e.textContent.replace(/\u200B/g,"").trim()==="")return;const n=window.getSelection();let o=null;n.rangeCount&&e.contains(n.anchorNode)&&(o=n.getRangeAt(0).cloneRange());const i=document.createElement("span");i.className="heading-toggle",i.contentEditable=!1,i.innerHTML='<i class="bi bi-chevron-down"></i>',i.addEventListener("click",s=>{s.preventDefault(),s.stopPropagation(),ht(e,i)}),e.insertBefore(i,e.firstChild),o&&(n.removeAllRanges(),n.addRange(o))}function pt(e){const t=document.createElement("div");t.dataset.id=e.id,t.dataset.type=e.type,t.className=`editor-block ${e.type}`;const n=document.createElement("div");if(n.innerHTML=e.text||"",n.querySelectorAll(".heading-toggle").forEach(o=>o.remove()),t.innerHTML=n.innerHTML,e.type==="media"){t.contentEditable=!1,t.dataset.mediaIds=e.mediaIds||"[]",t.dataset.layout=e.layout||"carousel";const o=JSON.parse(e.mediaIds||"[]");(async()=>{const i=[];for(const s of o){const a=await pe(s);a&&i.push({refId:a.id,id:a.id,filename:a.filename,type:a.mimeType?.startsWith("image")?"photo":a.mimeType?.startsWith("video")?"video":"voice",mimeType:a.mimeType})}be(t,i,t.dataset.layout)})(),t.setAttribute("tabindex","0"),t.addEventListener("keydown",i=>{i.key==="Enter"&&(i.preventDefault(),Y(t))}),t.addEventListener("click",()=>{t.focus()}),D(t),v.appendChild(t);return}if(e.type==="note-link"){qe(t,e.linkedNoteId),D(t),v.appendChild(t);return}if(e.type==="todo"){t.contentEditable=!1,t.innerHTML=`
            <label class="todo-block-label">
                <input type="checkbox" class="todo-checkbox" ${e.checked?"checked":""}>
                <span class="todo-block-text ${e.checked?"done":""}"
                    contenteditable="true"
                    spellcheck="false"
                >${e.text||""}</span>
            </label>
        `;const o=t.querySelector(".todo-checkbox"),i=t.querySelector(".todo-block-text");o.addEventListener("change",()=>{e.checked=o.checked,i.classList.toggle("done",o.checked),p()}),i.addEventListener("input",p),i.addEventListener("keydown",s=>{if(s.key==="Enter"&&(s.preventDefault(),Y(t)),s.key==="Backspace"&&i.textContent.trim()===""){s.preventDefault();const a=t.previousElementSibling;t.remove(),a&&F(a),p()}}),t.addEventListener("keydown",Z),t.addEventListener("input",()=>{const s=window.getSelection();let a=null;s.rangeCount&&t.contains(s.anchorNode)&&(a=s.getRangeAt(0).cloneRange()),me(t),a&&(s.removeAllRanges(),s.addRange(a)),p()}),D(t),v.appendChild(t);return}if(e.type==="heading1"||e.type==="heading2"||e.type==="heading3"){t.contentEditable=!0,t.spellcheck=!1;const o=document.createElement("div");o.innerHTML=e.text||"",o.querySelectorAll(".heading-toggle").forEach(i=>i.remove()),t.innerHTML=o.innerHTML,t.contentEditable=!0,t.spellcheck=!1,me(t),t.addEventListener("keydown",Z),t.addEventListener("input",p),D(t),v.appendChild(t);return}t.contentEditable=!0,t.spellcheck=!1,t.addEventListener("keydown",Z),t.addEventListener("input",p),D(t),v.appendChild(t)}function Se(e){return e==="heading1"?1:e==="heading2"?2:e==="heading3"?3:0}function ht(e,t){const n=Se(e.dataset.type),o=t.classList.contains("collapsed");t.classList.toggle("collapsed",!o);let i=e.nextElementSibling;for(;i;){const s=Se(i.dataset.type);if(s>0&&s<=n)break;i.classList.toggle("heading-hidden",!o),i=i.nextElementSibling}}function Z(e){if(e.key==="Enter"&&(e.preventDefault(),Y(e.target)),e.key==="Backspace"){const t=e.target;if(t.innerText.trim()!==""||v.children.length===1)return;e.preventDefault();const n=t.previousElementSibling;t.remove(),F(n),p()}if(e.key==="ArrowUp"){if(!yt(e.target))return;const t=e.target.previousElementSibling;if(!t)return;e.preventDefault(),ve(t)}if(e.key==="ArrowDown"){if(!bt(e.target))return;const t=e.target.nextElementSibling;if(!t)return;e.preventDefault(),F(t)}e.ctrlKey&&e.key==="b"&&(e.preventDefault(),B("strong")),e.ctrlKey&&e.key==="i"&&(e.preventDefault(),B("em")),e.ctrlKey&&e.key==="u"&&(e.preventDefault(),B("u"))}function B(e){const t=R()||C;if(!t||t.collapsed)return;const n=window.getSelection(),o=t.cloneRange(),i=Ae(o,e);if(i){const c=vt(i);n.removeAllRanges(),n.addRange(c),C=c.cloneRange(),p(),U();return}const s=document.createElement(e),a=o.extractContents();s.appendChild(a),o.insertNode(s),o.selectNodeContents(s),n.removeAllRanges(),n.addRange(o),C=o.cloneRange(),p(),U()}function Ne(e,t,n){let o;for(e.nodeType===Node.TEXT_NODE?o=e:o=n?e.childNodes[t-1]||e.childNodes[t]||e:e.childNodes[t]||e.childNodes[t-1]||e;o&&o.nodeType===Node.ELEMENT_NODE&&o.childNodes.length;)o=n?o.lastChild:o.firstChild;return $t(o)}function Ae(e,t){const n=Ne(e.startContainer,e.startOffset,!1),o=Ne(e.endContainer,e.endOffset,!0);if(!n||!o)return null;const i=n.closest(t),s=o.closest(t);return i&&i===s&&v.contains(i)?i:null}function vt(e){const t=document.createRange(),n=e.firstChild,o=e.lastChild,i=e.parentNode;if(!i)return t;for(;e.firstChild;)i.insertBefore(e.firstChild,e);return i.removeChild(e),n&&o?(t.setStartBefore(n),t.setEndAfter(o)):t.selectNodeContents(i),t}function yt(e){const t=window.getSelection();if(!t.rangeCount)return!1;const n=t.getRangeAt(0);return n.startOffset===0&&n.endOffset===0}function bt(e){const t=window.getSelection();if(!t.rangeCount)return!1;const n=t.getRangeAt(0);return n.startOffset===e.textContent.length&&n.endOffset===e.textContent.length}function ve(e){e.focus();const t=document.createRange();t.selectNodeContents(e),t.collapse(!1);const n=window.getSelection();n.removeAllRanges(),n.addRange(t)}function Y(e){const t=document.createElement("div");t.className="editor-block",t.dataset.id=crypto.randomUUID();const n=e.dataset.type;t.dataset.type=n.startsWith("heading")?"paragraph":n,t.className=`editor-block ${t.dataset.type}`,t.contentEditable=!0,t.spellcheck=!1,t.innerHTML="",t.addEventListener("keydown",Z),t.addEventListener("input",p),D(t),e.after(t),F(t),p()}function He(e,t){if(t==="note-link"){Et(e);return}if(!e)return;const n=e.dataset.type===t?"paragraph":t;e.dataset.type=n,e.className=`editor-block ${n}`,me(e),p(),U()}function Et(e){const t=prompt("Note name","Untitled");if(t===null){e.dataset.type="paragraph",e.className="editor-block paragraph",p();return}const n=Je({noteName:t.trim()||"Untitled",parentId:d.id,parentType:"note",category:d.category||""});qe(e,n.id),he(),p()}function qe(e,t){const n=De(t);e.dataset.type="note-link",e.className="editor-block note-link",e.dataset.linkedNoteId=t,e.contentEditable=!1,e.innerHTML=`
        <i class="bi bi-file-earmark-text"></i>
        <span class="note-link-name">${n?.noteName||"Untitled"}</span>
    `,e.setAttribute("tabindex","0"),e.addEventListener("click",()=>{window.location.href=`note-detail.html?id=${t}`}),e.addEventListener("keydown",o=>{o.key==="Enter"&&(o.preventDefault(),window.location.href=`note-detail.html?id=${t}`)})}function F(e){e.focus();const t=document.createRange();t.selectNodeContents(e),t.collapse(!0);const n=window.getSelection();n.removeAllRanges(),n.addRange(t)}function Lt(){const e=window.getSelection();if(!e.rangeCount){L.classList.remove("show");return}const t=e.anchorNode,n=t?.nodeType===Node.TEXT_NODE?t.parentElement?.closest(".editor-block"):t?.closest?.(".editor-block");if(!n||n.contentEditable!=="true"){L.classList.remove("show");return}const o=e.getRangeAt(0),i=document.createRange();i.selectNodeContents(n),i.setEnd(o.startContainer,o.startOffset);const s=i.toString(),a=s.lastIndexOf("/");if(a===-1){L.classList.remove("show");return}const c=s.substring(0,a),l=s.substring(a+1);if(!(c.length===0||/\s$/.test(c))||/\S/.test(l)){L.classList.remove("show");return}wt(n)}function wt(e){L.classList.add("show");const t=e.getBoundingClientRect(),n=L.offsetWidth||220,o=L.offsetHeight||200,i=12,s=window.innerWidth,a=window.innerHeight;let c=t.left,l=t.bottom+8;c+n>s-i&&(c=s-n-i),c<i&&(c=i),l+o>a-i&&(l=t.top-o-8),l<i&&(l=i),L.style.left=`${c}px`,L.style.top=`${l}px`}function xt(e){if(!e)return;const t=e.innerText,n=t.lastIndexOf("/");n!==-1&&(e.innerText=t.substring(0,n)+t.substring(n+1),ve(e))}L.addEventListener("click",e=>{const t=e.target.closest("button");if(!t)return;const n=t.dataset.type,o=window.getSelection().anchorNode.parentElement.closest(".editor-block");xt(o),He(o,n),L.classList.remove("show"),p()});function Tt(){const e=window.getSelection(),t=R();if(e.rangeCount===0||e.toString().trim()===""||!t){M.classList.remove("show");return}C=t.cloneRange(),M.classList.add("show"),U()}(function(){const t=window.visualViewport;if(!t)return;function n(){const o=Math.max(0,window.innerHeight-(t.height+t.offsetTop));M.style.bottom=o>10?`${o}px`:"0px"}t.addEventListener("resize",n),t.addEventListener("scroll",n)})();M.addEventListener("mousedown",e=>{e.preventDefault()});M.addEventListener("click",e=>{const t=e.target.closest("button");if(t){if(t.dataset.command)switch(t.dataset.command){case"bold":B("strong");break;case"italic":B("em");break;case"underline":B("u");break;case"strikethrough":B("s");break;case"fontSize":t.classList.toggle("active"),St(t);return;case"fontFamily":t.classList.toggle("active"),Nt(t);return}if(t.dataset.heading){const n=ye();He(n,t.dataset.heading)}p()}});function R(){const e=window.getSelection();if(!e.rangeCount)return null;const t=e.getRangeAt(0),n=t.commonAncestorContainer,o=n.nodeType===Node.ELEMENT_NODE?n:n.parentElement;return!o||!v.contains(o)?null:t}function $t(e){return e?e.nodeType===Node.ELEMENT_NODE?e:e.parentElement:null}function ye(){const e=R()||C;if(!e)return null;const t=e.commonAncestorContainer;return(t.nodeType===Node.ELEMENT_NODE?t:t.parentElement)?.closest(".editor-block")||null}function U(){const e=R()||C,t=ye();M.querySelectorAll("button").forEach(n=>{let o=!1;if(n.dataset.command){const i=Ct(n.dataset.command);o=!!(i&&e&&Ae(e,i))}n.dataset.heading&&(o=t?.dataset.type===n.dataset.heading),n.classList.toggle("active",o)})}function Ct(e){switch(e){case"bold":return"strong";case"italic":return"em";case"underline":return"u";case"strikethrough":return"s";default:return null}}function fe(e,t){const n=R()||C;if(!n||n.collapsed)return;const o=window.getSelection(),i=n.commonAncestorContainer,a=(i.nodeType===Node.ELEMENT_NODE?i:i.parentElement)?.closest(`span[data-style-${e}]`);if(a&&a.style[e]===t){const f=a.parentNode;for(;a.firstChild;)f.insertBefore(a.firstChild,a);f.removeChild(a),p();return}const c=document.createElement("span");c.style[e]=t,c.dataset[`style${e.charAt(0).toUpperCase()+e.slice(1)}`]=t;const l=n.extractContents();c.appendChild(l),n.insertNode(c);const u=document.createRange();u.selectNodeContents(c),o.removeAllRanges(),o.addRange(u),C=u.cloneRange(),p(),U()}function St(e){k();const t=[8,10,12,14,16,18,20,24,28,32,36,48,64,72],n=document.createElement("div");n.className="toolbar-dropdown font-size-dropdown",n.id="toolbarDropdown";const o=document.createElement("div");o.className="fs-input-row";const i=document.createElement("input");i.type="number",i.min="1",i.max="200",i.placeholder="px",i.className="fs-input";const s=R()||C;if(s){const f=(s.commonAncestorContainer.nodeType===Node.TEXT_NODE?s.commonAncestorContainer.parentElement:s.commonAncestorContainer)?.closest("[data-style-font-size]")?.style.fontSize;f&&(i.value=parseInt(f))}const a=document.createElement("button");a.className="fs-apply-btn",a.textContent="OK",a.addEventListener("mousedown",u=>{u.preventDefault();const f=parseInt(i.value);f>0&&f<=200&&fe("fontSize",`${f}px`),k(),e.classList.remove("active")}),i.addEventListener("keydown",u=>{u.key==="Enter"&&(u.preventDefault(),a.dispatchEvent(new MouseEvent("mousedown"))),u.key==="Escape"&&k()}),o.appendChild(i),o.appendChild(a),n.appendChild(o);const c=document.createElement("div");c.className="fs-divider",n.appendChild(c);const l=document.createElement("div");l.className="fs-list",t.forEach(u=>{const f=document.createElement("button");f.innerHTML=`<span style="font-size:${u}px;line-height:1.3">${u}</span><span class="fs-unit">px</span>`,f.addEventListener("mousedown",y=>{y.preventDefault(),fe("fontSize",`${u}px`),k(),e.classList.remove("active")}),l.appendChild(f)}),n.appendChild(l),document.body.appendChild(n),Xe(n,e),requestAnimationFrame(()=>requestAnimationFrame(()=>{i.focus(),i.select()}))}function Nt(e){k();const n=Bt([{label:"Default",value:""},{label:"Poppins",value:"'Poppins', sans-serif"},{label:"Serif",value:"Georgia, serif"},{label:"Mono",value:"'Courier New', monospace"},{label:"Rounded",value:"'Nunito', sans-serif"}].map(o=>({label:`<span style="font-family:${o.value||"inherit"}">${o.label}</span>`,value:o.value,action:()=>{o.value&&fe("fontFamily",o.value)}})),e);document.body.appendChild(n),Xe(n,e)}function Bt(e,t){const n=document.createElement("div");return n.className="toolbar-dropdown",n.id="toolbarDropdown",e.forEach(o=>{const i=document.createElement("button");i.innerHTML=o.label,i.addEventListener("mousedown",s=>{s.preventDefault(),o.action(),k(),t.classList.remove("active")}),n.appendChild(i)}),n}function Xe(e,t){e.style.visibility="hidden",e.style.position="fixed",e.style.left="0",e.style.top="0",document.body.appendChild(e),requestAnimationFrame(()=>{const n=t.getBoundingClientRect(),o=M.getBoundingClientRect(),i=e.offsetHeight,s=e.offsetWidth,a=8;let c=o.top-i-a,l=n.left;l+s>window.innerWidth-a&&(l=window.innerWidth-s-a),l<a&&(l=a),c<a&&(c=a),e.style.top=`${c}px`,e.style.left=`${l}px`,e.style.visibility="visible"})}function k(){document.getElementById("toolbarDropdown")?.remove()}document.addEventListener("mousedown",e=>{const t=document.getElementById("toolbarDropdown");t&&!t.contains(e.target)&&!e.target.closest("[data-dropdown]")&&k()});function p(){const e=[];v.querySelectorAll(".editor-block").forEach(t=>{if(t.dataset.type==="todo"){const n=t.querySelector(".todo-checkbox"),o=t.querySelector(".todo-block-text");e.push({id:t.dataset.id,type:"todo",text:o?o.innerHTML:"",checked:n?n.checked:!1})}else if(t.dataset.type==="media")e.push({id:t.dataset.id,type:"media",text:"",mediaIds:t.dataset.mediaIds||"[]",layout:t.dataset.layout||"carousel"});else if(t.dataset.type==="note-link")e.push({id:t.dataset.id,type:"note-link",text:"",linkedNoteId:t.dataset.linkedNoteId||""});else{const n=t.cloneNode(!0);n.querySelectorAll(".heading-toggle").forEach(o=>o.remove()),e.push({id:t.dataset.id,type:t.dataset.type,text:n.innerHTML})}}),I(d.id,{title:d.title||"",blocks:e})}let S=null,b=null,N=null;const Be=500;function D(e){let t=0,n=0,o=!1;e.addEventListener("touchstart",a=>{const c=a.touches[0];t=c.clientX,n=c.clientY,N=setTimeout(()=>{o=!0,ke(e,c.clientX,c.clientY)},Be)},{passive:!0}),e.addEventListener("touchmove",a=>{const c=a.touches[0],l=Math.abs(c.clientX-t),u=Math.abs(c.clientY-n);if(!o&&(l>8||u>8)){clearTimeout(N);return}o&&(a.preventDefault(),ge(c.clientX,c.clientY),Me(c.clientX,c.clientY))},{passive:!1}),e.addEventListener("touchend",a=>{if(clearTimeout(N),!o)return;o=!1;const c=a.changedTouches[0];Ie(c.clientX,c.clientY),le()}),e.addEventListener("touchcancel",()=>{clearTimeout(N),o=!1,le()}),e.addEventListener("mousedown",a=>{a.target.closest("button, input, a, [contenteditable]")||(t=a.clientX,n=a.clientY,N=setTimeout(()=>{o=!0,ke(e,a.clientX,a.clientY),document.addEventListener("mousemove",i),document.addEventListener("mouseup",s)},Be))}),e.addEventListener("mousemove",a=>{if(!o){const c=Math.abs(a.clientX-t),l=Math.abs(a.clientY-n);(c>8||l>8)&&clearTimeout(N)}}),e.addEventListener("mouseup",()=>{clearTimeout(N)});function i(a){o&&(ge(a.clientX,a.clientY),Me(a.clientX,a.clientY))}function s(a){document.removeEventListener("mousemove",i),document.removeEventListener("mouseup",s),o&&(o=!1,Ie(a.clientX,a.clientY),le())}}function ke(e,t,n){S=e,e.classList.add("dragging"),b=document.createElement("div"),b.className="drag-ghost",b.textContent=e.innerText.trim().substring(0,50)||"Block",document.body.appendChild(b),ge(t,n),navigator.vibrate&&navigator.vibrate(40)}function ge(e,t){b&&(b.style.left=`${e+12}px`,b.style.top=`${t-20}px`)}function Me(e,t){v.querySelectorAll(".drag-over-top, .drag-over-bottom").forEach(s=>{s.classList.remove("drag-over-top","drag-over-bottom")});const n=Oe(e,t);if(!n||n===S)return;const o=n.getBoundingClientRect(),i=o.top+o.height/2;t<i?n.classList.add("drag-over-top"):n.classList.add("drag-over-bottom")}function Oe(e,t){b&&(b.style.display="none");const n=document.elementFromPoint(e,t);return b&&(b.style.display=""),n?.closest(".editor-block")||null}function Ie(e,t){if(!S)return;const n=Oe(e,t);if(!n||n===S)return;const o=n.getBoundingClientRect(),i=o.top+o.height/2;t<i?v.insertBefore(S,n):n.after(S),p()}function le(){S?.classList.remove("dragging"),S=null,b?.remove(),b=null,v.querySelectorAll(".drag-over-top, .drag-over-bottom").forEach(e=>{e.classList.remove("drag-over-top","drag-over-bottom")})}async function kt(){if(!(!H||!ae)){if(H.innerHTML="",!d.media||d.media.length===0){ae.style.display="none";return}ae.style.display="block";for(const e of d.media){const t=await pe(e.refId);if(!t)continue;const n=URL.createObjectURL(t.file);e.type==="photo"||e.type==="gif"?H.innerHTML+=`

                <div class="attachment-card mb-3">

                    <img
                        src="${n}"
                        class="img-fluid rounded-4 w-100"
                    >

                    <div class="attachment-info">

                        <div>

                            <strong>

                                ${e.filename}

                            </strong>

                            <br>

                            <small>

                                ${Rt(e.size)}

                            </small>

                        </div>

                    </div>

                </div>

            `:e.type==="video"?H.innerHTML+=`

                <div class="attachment-card mb-3">

                    <video
                        controls
                        class="w-100 rounded-4"
                    >

                        <source
                            src="${n}"
                            type="${e.mimeType}"
                        >

                    </video>

                    <div class="attachment-info">

                        <strong>

                            ${e.filename}

                        </strong>

                    </div>

                </div>

            `:e.type==="voice"&&(H.innerHTML+=`

                <div class="attachment-card mb-3">

                    <audio
                        controls
                        class="w-100"
                    >

                        <source
                            src="${n}"
                            type="${e.mimeType}"
                        >

                    </audio>

                    <div class="attachment-info">

                        <strong>

                            ${e.filename}

                        </strong>

                    </div>

                </div>

            `)}}}function Mt(){if(!(!de||!se)){if(de.innerHTML="",!d.reminder||!d.reminder.enabled){se.style.display="none";return}se.style.display="block",de.innerHTML=`

        <div class="d-flex align-items-center gap-2">

            <i class="bi bi-bell-fill text-warning"></i>

            <span>

                ${Ye(d.reminder.datetime)}

            </span>

        </div>

    `}}function Ye(e){return new Date(e).toLocaleString("en-US",{day:"2-digit",month:"short",year:"numeric",hour:"2-digit",minute:"2-digit"})}function It(){if(re){if(!d.media||!d.media.some(e=>e.type==="voice")){re.style.display="none";return}re.style.display="block"}}let q=!1;function Dt(){q=!q,document.body.classList.toggle("read-mode",q),v.querySelectorAll(".editor-block").forEach(t=>{t.contentEditable=q?"false":"true"});const e=V.querySelector("i");q?(e.className="bi bi-eye-slash",V.title="Switch to Edit mode"):(e.className="bi bi-eye",V.title="Switch to Read mode")}function Rt(e){return e<1024?e+" B":e<1024*1024?(e/1024).toFixed(1)+" KB":(e/(1024*1024)).toFixed(1)+" MB"}function Fe(){ce&&(d.tags||(d.tags=[]),ce.innerHTML=d.tags.map((e,t)=>`
        <span class="tag-pill">
            #${e}
            <button class="tag-remove" data-index="${t}" title="Remove tag">
                <i class="bi bi-x"></i>
            </button>
        </span>
    `).join(""),ce.querySelectorAll(".tag-remove").forEach(e=>{e.addEventListener("click",()=>{d.tags.splice(Number(e.dataset.index),1),_e(),Fe()})}))}function Ue(){const e=O.value.trim().toLowerCase().replace(/\s+/g,"-");if(e){if(d.tags||(d.tags=[]),d.tags.includes(e)){O.value="";return}d.tags.push(e),_e(),Fe(),O.value="",O.focus()}}function _e(){I(d.id,{tags:d.tags})}function At(e,t="carousel"){const n=crypto.randomUUID(),o=document.createElement("div");o.className="editor-block media",o.dataset.id=n,o.dataset.type="media",o.dataset.layout=t,o.dataset.mediaIds=JSON.stringify(e.map(s=>s.refId)),o.contentEditable=!1,o.innerHTML=`<div class="media-carousel-loading">
        <i class="bi bi-hourglass-split"></i> Loading...
    </div>`;const i=ye();i?i.after(o):v.appendChild(o),o.setAttribute("tabindex","0"),o.addEventListener("keydown",s=>{s.key==="Enter"&&(s.preventDefault(),Y(o))}),o.addEventListener("click",()=>{o.focus()}),be(o,e,t),p()}async function be(e,t,n){if(n=n||e.dataset.layout||"carousel",!t||t.length===0){e.innerHTML="";return}const o=[];for(const i of t){const s=await pe(i.refId||i.id);if(!s)continue;const a=URL.createObjectURL(s.file);o.push({media:i,url:a,data:s})}if(!o.length){e.innerHTML="";return}if(n==="row"){Xt(e,o);return}if(n==="column"){Ot(e,o);return}if(n==="grid3"){Yt(e,o);return}if(n==="grid2x2"){Ft(e,o);return}qt(e,o)}function _(e,t,n){const o=e.dataset.id;return`
        <div class="media-layout-toolbar" data-block="${o}">
            <button class="media-layout-btn ${n==="carousel"?"active":""}" data-layout="carousel" title="Carousel">
                <i class="bi bi-layout-sidebar-inset-reverse"></i>
            </button>
            <button class="media-layout-btn ${n==="row"?"active":""}" data-layout="row" title="Row (scroll horizontal)">
                <i class="bi bi-layout-three-columns"></i>
            </button>
            <button class="media-layout-btn ${n==="column"?"active":""}" data-layout="column" title="Column">
                <i class="bi bi-layout-split"></i>
            </button>
            <button class="media-layout-btn ${n==="grid3"?"active":""}" data-layout="grid3" title="Grid 3 kolom">
                <i class="bi bi-grid-3x2-gap"></i>
            </button>
            <button class="media-layout-btn ${n==="grid2x2"?"active":""}" data-layout="grid2x2" title="Grid 2x2">
                <i class="bi bi-grid-fill"></i>
            </button>
            <button class="media-carousel-del ml-auto" data-block="${o}" title="Hapus block ini">
                <i class="bi bi-trash3"></i>
            </button>
        </div>
    `}function W(e,t){e.querySelectorAll(".media-layout-btn").forEach(n=>{n.addEventListener("click",o=>{o.stopPropagation();const i=n.dataset.layout;e.dataset.layout=i,be(e,t.map(s=>s.media),i),p()})}),e.querySelector(".media-carousel-del")?.addEventListener("click",async n=>{if(n.stopPropagation(),!confirm("Hapus attachment ini?"))return;const o=JSON.parse(e.dataset.mediaIds||"[]");for(const i of o)await Qe(i),d.media=(d.media||[]).filter(s=>s.refId!==i);I(d.id,{media:d.media}),e.remove(),p()}),Ht(e,t)}function Ht(e,t){const n=e.querySelector(".media-carousel-track");n&&n.querySelectorAll(".media-carousel-slide").forEach((o,i)=>{o.addEventListener("click",s=>{s.stopPropagation(),window.openLightbox(t,i)}),o.style.cursor="zoom-in"}),e.querySelectorAll(".media-row-item, .media-grid-item, .media-column-item").forEach((o,i)=>{o.addEventListener("click",s=>{s.stopPropagation(),window.openLightbox(t,i)}),o.style.cursor="zoom-in"})}function qt(e,t){const n=e.dataset.id,o=t.length;let i=0;e.innerHTML=`
        ${_(e,t,"carousel")}
        <div class="media-carousel">
            <div class="media-carousel-track" id="track_${n}">
                ${t.map(({media:g,url:E})=>`
                    <div class="media-carousel-slide">
                        ${P(g,E)}
                    </div>
                `).join("")}
            </div>

            ${o>1?`
                <button class="media-carousel-nav prev" id="prev_${n}">
                    <i class="bi bi-chevron-left"></i>
                </button>
                <button class="media-carousel-nav next" id="next_${n}">
                    <i class="bi bi-chevron-right"></i>
                </button>
            `:""}

            <div class="media-carousel-footer">
                <span class="media-carousel-filename" id="fname_${n}">
                    ${t[0].media.filename}
                </span>
                <div class="media-carousel-dots" id="dots_${n}">
                    ${t.map((g,E)=>`
                        <div class="media-carousel-dot ${E===0?"active":""}"></div>
                    `).join("")}
                </div>
            </div>
        </div>
    `;const s=e.querySelector(`#track_${n}`),a=e.querySelectorAll(".media-carousel-dot"),c=e.querySelector(`#fname_${n}`),l=e.querySelector(`#prev_${n}`),u=e.querySelector(`#next_${n}`);function f(g){i=g,s.style.transform=`translateX(-${i*100}%)`,a.forEach((E,w)=>E.classList.toggle("active",w===i)),c.textContent=t[i].media.filename,l&&(l.disabled=i===0),u&&(u.disabled=i===o-1)}l?.addEventListener("click",()=>{i>0&&f(i-1)}),u?.addEventListener("click",()=>{i<o-1&&f(i+1)});let y=0;s.addEventListener("touchstart",g=>{y=g.touches[0].clientX}),s.addEventListener("touchend",g=>{const E=y-g.changedTouches[0].clientX;E>40&&i<o-1&&f(i+1),E<-40&&i>0&&f(i-1)}),f(0),W(e,t)}function Xt(e,t){e.innerHTML=`
        ${_(e,t,"row")}
        <div class="media-row">
            ${t.map(({media:n,url:o})=>`
                <div class="media-row-item">
                    ${P(n,o)}
                    <div class="media-row-filename">${n.filename}</div>
                </div>
            `).join("")}
        </div>
    `,W(e,t)}function Ot(e,t){e.innerHTML=`
        ${_(e,t,"column")}
        <div class="media-column">
            ${t.map(({media:n,url:o})=>`
                <div class="media-column-item">
                    ${P(n,o)}
                    <div class="media-column-filename">${n.filename}</div>
                </div>
            `).join("")}
        </div>
    `,W(e,t)}function Yt(e,t){e.innerHTML=`
        ${_(e,t,"grid3")}
        <div class="media-grid media-grid-3">
            ${t.map(({media:n,url:o})=>`
                <div class="media-grid-item">
                    ${P(n,o)}
                    <div class="media-grid-filename">${n.filename}</div>
                </div>
            `).join("")}
        </div>
    `,W(e,t)}function Ft(e,t){const n=t.slice(0,4),o=t.length-4;e.innerHTML=`
        ${_(e,t,"grid2x2")}
        <div class="media-grid media-grid-2x2">
            ${n.map(({media:i,url:s},a)=>`
                <div class="media-grid-item ${a===3&&o>0?"has-more":""}">
                    ${P(i,s)}
                    ${a===3&&o>0?`<div class="media-grid-more">+${o+1}</div>`:""}
                    <div class="media-grid-filename">${i.filename}</div>
                </div>
            `).join("")}
        </div>
    `,W(e,t)}(function(){const t=document.getElementById("mediaLightbox"),n=t?.querySelector(".media-lightbox-backdrop"),o=document.getElementById("lightboxBody"),i=document.getElementById("lightboxTitle"),s=document.getElementById("lightboxCounter"),a=document.getElementById("lightboxDownload"),c=document.getElementById("lightboxClose"),l=document.getElementById("lightboxPrev"),u=document.getElementById("lightboxNext"),f=document.getElementById("lightboxDots");if(!t)return;let y=[],g=0;window.openLightbox=function(r,h=0){y=r,g=h,r.map(m=>m.url),We(),w(g),t.classList.add("open"),document.body.style.overflow="hidden"};function E(){t.classList.remove("open"),document.body.style.overflow="",o.innerHTML="",y=[]}c?.addEventListener("click",E),n?.addEventListener("click",E);function w(r){g=Math.max(0,Math.min(r,y.length-1));const{media:h,url:m}=y[g];o.innerHTML=Pe(h,m),i.textContent=h.filename,s.textContent=y.length>1?`${g+1} / ${y.length}`:"",a.href=m,a.download=h.filename,l.style.display=y.length>1&&g>0?"":"none",u.style.display=y.length>1&&g<y.length-1?"":"none",f.querySelectorAll(".lb-dot").forEach((T,ze)=>T.classList.toggle("active",ze===g)),ie()}l?.addEventListener("click",()=>w(g-1)),u?.addEventListener("click",()=>w(g+1));function We(){f.innerHTML="",!(y.length<=1)&&y.forEach((r,h)=>{const m=document.createElement("div");m.className="lb-dot"+(h===0?" active":""),m.addEventListener("click",()=>w(h)),f.appendChild(m)})}document.addEventListener("keydown",r=>{t.classList.contains("open")&&(r.key==="ArrowLeft"&&w(g-1),r.key==="ArrowRight"&&w(g+1),r.key==="Escape"&&E())});let Ee=0,Le=0;o.addEventListener("touchstart",r=>{Ee=r.touches[0].clientX,Le=r.touches[0].clientY},{passive:!0}),o.addEventListener("touchend",r=>{const h=Ee-r.changedTouches[0].clientX,m=Math.abs(Le-r.changedTouches[0].clientY);Math.abs(h)>50&&m<60&&(h>0?w(g+1):w(g-1))},{passive:!0});let x=1,z=1,te=0,ne=0,oe=!1,we=0,xe=0,j=0,G=0;function ie(){x=1,z=1,j=0,G=0,K()}function K(){const r=o.querySelector("img");r&&(r.style.transform=`translate(${j}px, ${G}px) scale(${x})`,r.style.transformOrigin=`${te}px ${ne}px`,r.style.cursor=x>1?"grab":"default")}o.addEventListener("touchstart",r=>{if(r.touches.length===2){const h=r.touches[1].clientX-r.touches[0].clientX,m=r.touches[1].clientY-r.touches[0].clientY;z=Math.hypot(h,m);const T=o.getBoundingClientRect();te=(r.touches[0].clientX+r.touches[1].clientX)/2-T.left,ne=(r.touches[0].clientY+r.touches[1].clientY)/2-T.top}else r.touches.length===1&&x>1&&(oe=!0,we=r.touches[0].clientX-j,xe=r.touches[0].clientY-G)},{passive:!0}),o.addEventListener("touchmove",r=>{if(r.touches.length===2){r.preventDefault();const h=r.touches[1].clientX-r.touches[0].clientX,m=r.touches[1].clientY-r.touches[0].clientY,T=Math.hypot(h,m);x=Math.min(5,Math.max(1,x*(T/z))),z=T,K()}else oe&&x>1&&(j=r.touches[0].clientX-we,G=r.touches[0].clientY-xe,K())},{passive:!1}),o.addEventListener("touchend",r=>{r.touches.length===0&&(oe=!1,x<1.1&&ie())},{passive:!0});let Te=0;o.addEventListener("touchend",r=>{if(!o.querySelector("img"))return;const m=Date.now();if(m-Te<300)if(x>1)ie();else{const T=o.getBoundingClientRect();te=r.changedTouches[0].clientX-T.left,ne=r.changedTouches[0].clientY-T.top,x=2.5,K()}Te=m},{passive:!0});function Pe(r,h){const m=r.type||r.mimeType?.split("/")[0];return m==="photo"||m==="image"||m==="gif"?`<img src="${h}" alt="${r.filename}" draggable="false">`:m==="video"?`<video controls autoplay playsinline>
                        <source src="${h}" type="${r.mimeType}">
                    </video>`:m==="voice"||m==="audio"?`<div class="lb-audio-wrap">
                        <i class="bi bi-music-note-beamed lb-audio-icon"></i>
                        <audio controls autoplay>
                            <source src="${h}" type="${r.mimeType}">
                        </audio>
                        <p class="lb-audio-name">${r.filename}</p>
                    </div>`:`<div class="lb-file-wrap">
                    <i class="bi bi-file-earmark lb-file-icon"></i>
                    <p class="lb-file-name">${r.filename}</p>
                </div>`}})();function P(e,t){const n=e.type||e.mimeType?.split("/")[0];return n==="photo"||n==="image"||n==="gif"?`<img src="${t}" alt="${e.filename}">`:n==="video"?`<video controls><source src="${t}" type="${e.mimeType}"></video>`:n==="voice"||n==="audio"?`<audio controls><source src="${t}" type="${e.mimeType}"></audio>`:`
        <div class="media-file-thumb">
            <i class="bi bi-file-earmark"></i>
            <span>${e.filename}</span>
        </div>
    `}
