import"./modulepreload-polyfill-B5Qt9EMX.js";import{_ as k}from"./preload-helper-D33vDyUH.js";import{i as O}from"./themeService-BgIb2Nl3.js";const $="serenotes_boards",H={id:"default",name:"My Board",columns:[{id:"todo",name:"To Do",cards:[]},{id:"inprogress",name:"In Progress",cards:[]},{id:"done",name:"Done",cards:[]}],createdAt:new Date().toISOString()};function u(){return JSON.parse(localStorage.getItem($))||[]}function m(n){localStorage.setItem($,JSON.stringify(n))}function R(){localStorage.getItem($)||m([H])}R();function h(){return u()}function I(n){const e=u(),t={id:crypto.randomUUID(),name:n,columns:[{id:crypto.randomUUID(),name:"To Do",cards:[]},{id:crypto.randomUUID(),name:"In Progress",cards:[]},{id:crypto.randomUUID(),name:"Done",cards:[]}],createdAt:new Date().toISOString()};return e.push(t),m(e),t}function S(n){const e=u().filter(t=>t.id!==n);m(e)}function w(n,e,t,a=""){const d=u(),r=d.find(c=>c.id===n);if(!r)return null;const o=r.columns.find(c=>c.id===e);if(!o)return null;const i={id:crypto.randomUUID(),title:t,description:a,checklist:[],createdAt:new Date().toISOString()};return o.cards.push(i),m(d),i}function N(n,e,t,a){const d=u(),r=d.find(c=>c.id===n);if(!r)return!1;const o=r.columns.find(c=>c.id===e);if(!o)return!1;const i=o.cards.findIndex(c=>c.id===t);return i===-1?!1:(o.cards[i]={...o.cards[i],...a},m(d),!0)}function D(n,e,t){const a=u(),d=a.find(o=>o.id===n);if(!d)return!1;const r=d.columns.find(o=>o.id===e);return r?(r.cards=r.cards.filter(o=>o.id!==t),m(a),!0):!1}function A(n,e,t,a){const d=u(),r=d.find(f=>f.id===n);if(!r)return!1;const o=r.columns.find(f=>f.id===t),i=r.columns.find(f=>f.id===a);if(!o||!i)return!1;const c=o.cards.findIndex(f=>f.id===e);if(c===-1)return!1;const[l]=o.cards.splice(c,1);return i.cards.push(l),m(d),!0}function j(n,e,t,a){const d=u(),r=d.find(c=>c.id===n);if(!r)return!1;const o=r.columns.find(c=>c.id===e);if(!o)return!1;const i=o.cards.find(c=>c.id===t);return i?(i.checklist.push({id:crypto.randomUUID(),text:a,done:!1}),m(d),!0):!1}function V(n,e,t,a){const d=u(),r=d.find(l=>l.id===n);if(!r)return!1;const o=r.columns.find(l=>l.id===e);if(!o)return!1;const i=o.cards.find(l=>l.id===t);if(!i)return!1;const c=i.checklist.find(l=>l.id===a);return c?(c.done=!c.done,m(d),!0):!1}function F(n,e,t,a){const d=u(),r=d.find(c=>c.id===n);if(!r)return!1;const o=r.columns.find(c=>c.id===e);if(!o)return!1;const i=o.cards.find(c=>c.id===t);return i?(i.checklist=i.checklist.filter(c=>c.id!==a),m(d),!0):!1}function _(n,e){const t=u(),a=t.find(r=>r.id===n);if(!a)return null;const d={id:crypto.randomUUID(),name:e,cards:[]};return a.columns.push(d),m(t),d}function x(n,e,t){const a=u(),d=a.find(o=>o.id===n);if(!d)return!1;const r=d.columns.find(o=>o.id===e);return r?(r.name=t,m(a),!0):!1}function T(n,e){const t=u(),a=t.find(d=>d.id===n);return a?(a.columns=a.columns.filter(d=>d.id!==e),m(t),!0):!1}function C(n,e,t,a){const d=u(),r=d.find(c=>c.id===n);if(!r)return!1;const o=r.columns.find(c=>c.id===e);if(!o)return!1;const i=o.cards.find(c=>c.id===t);return i?(i.cover=a,m(d),!0):!1}const y=Object.freeze(Object.defineProperty({__proto__:null,addChecklistItem:j,addColumn:_,createBoard:I,createCard:w,deleteBoard:S,deleteCard:D,deleteChecklistItem:F,deleteColumn:T,getAllBoards:h,moveCard:A,renameColumn:x,toggleChecklistItem:V,updateCard:N,updateCardCover:C},Symbol.toStringTag,{value:"Module"}));O();const{App:B}=window.Capacitor?.Plugins||{};B&&B.addListener("backButton",({canGoBack:n})=>{n?window.history.back():window.location.href="dashboard.html"});let s=null;const q=document.getElementById("boardList"),M=document.getElementById("boardView"),G=document.getElementById("boardTitle"),p=document.getElementById("columnsWrap"),J=document.getElementById("newBoardBtn"),L=document.getElementById("backBtn");J.addEventListener("click",()=>{const n=prompt("Board name:");n?.trim()&&(I(n.trim()),g())});const P=document.getElementById("newBoardBtn");L.addEventListener("click",()=>{M.classList.add("d-none"),q.classList.remove("d-none"),P.classList.remove("d-none"),L.classList.add("d-none"),s=null,g()});g();function g(){const n=h(),e=document.getElementById("boardsGrid");if(e.innerHTML="",!n.length){e.innerHTML=`
            <div class="board-empty">
                <i class="bi bi-kanban"></i>
                <p>No boards yet. Create one!</p>
            </div>
        `;return}n.forEach(t=>{const a=t.columns.reduce((d,r)=>d+r.cards.length,0);e.innerHTML+=`
            <div class="board-card" data-id="${t.id}">
                <div class="board-card-icon"><i class="bi bi-kanban-fill"></i></div>
                <div class="board-card-info">
                    <h5>${t.name}</h5>
                    <span>${a} card${a!==1?"s":""}</span>
                </div>
                <button class="btn-delete-board" data-id="${t.id}">
                    <i class="bi bi-trash3"></i>
                </button>
            </div>
        `}),e.querySelectorAll(".board-card").forEach(t=>{t.addEventListener("click",a=>{a.target.closest(".btn-delete-board")||W(t.dataset.id)})}),e.querySelectorAll(".btn-delete-board").forEach(t=>{t.addEventListener("click",a=>{a.stopPropagation(),confirm("Delete this board?")&&(S(t.dataset.id),g())})})}function W(n){s=h().find(t=>t.id===n),s&&(G.textContent=s.name,q.classList.add("d-none"),M.classList.remove("d-none"),P.classList.add("d-none"),L.classList.remove("d-none"),U())}function U(){p.innerHTML="",s.columns.forEach(e=>{const t=document.createElement("div");t.className="kanban-col",t.dataset.colId=e.id,t.innerHTML=`
            <div class="kanban-col-header">
                <span class="kanban-col-name" data-col-id="${e.id}">${e.name}</span>
                <div class="d-flex align-items-center gap-1">
                    <span class="kanban-col-count">${e.cards.length}</span>
                    <button class="kanban-col-menu-btn" data-col-id="${e.id}" title="Column options">
                        <i class="bi bi-three-dots"></i>
                    </button>
                </div>
            </div>
            <div class="kanban-cards" id="col-${e.id}">
                ${e.cards.map(a=>z(a,e.id)).join("")}
            </div>
            <button class="kanban-add-card" data-col-id="${e.id}">
                <i class="bi bi-plus"></i> Add card
            </button>
        `,p.appendChild(t)});const n=document.createElement("div");n.className="kanban-add-col",n.innerHTML=`
        <button id="addColBtn" class="kanban-add-col-btn">
            <i class="bi bi-plus"></i> Add column
        </button>
    `,p.appendChild(n),document.getElementById("addColBtn").addEventListener("click",()=>{const e=prompt("Column name:");e?.trim()&&(_(s.id,e.trim()),v())}),p.querySelectorAll(".kanban-col-name").forEach(e=>{e.addEventListener("click",()=>{const t=e.dataset.colId,a=e.textContent.trim(),d=prompt("Rename column:",a);!d?.trim()||d.trim()===a||(x(s.id,t,d.trim()),v())})}),p.querySelectorAll(".kanban-col-menu-btn").forEach(e=>{e.addEventListener("click",t=>{t.stopPropagation();const a=e.dataset.colId;K(e,a)})}),p.querySelectorAll(".kanban-add-card").forEach(e=>{e.addEventListener("click",()=>{const t=prompt("Card title:");t?.trim()&&(w(s.id,e.dataset.colId,t.trim()),v())})}),p.querySelectorAll(".kanban-card").forEach(e=>{e.addEventListener("click",t=>{t.target.closest(".kanban-card-delete")||E(e.dataset.cardId,e.dataset.colId)})}),p.querySelectorAll(".kanban-card-delete").forEach(e=>{e.addEventListener("click",t=>{t.stopPropagation(),confirm("Delete this card?")&&(D(s.id,e.dataset.colId,e.dataset.cardId),v())})})}function z(n,e){const t=n.checklist.length,a=n.checklist.filter(d=>d.done).length;return`
        <div class="kanban-card" data-card-id="${n.id}" data-col-id="${e}">
            ${n.cover?`<img src="${n.cover}" class="kanban-card-cover" alt="cover">`:""}
            <div class="kanban-card-title">${n.title}</div>
            ${n.description?`<div class="kanban-card-desc">${n.description}</div>`:""}
            ${t?`
                <div class="kanban-card-checklist">
                    <i class="bi bi-check2-square"></i> ${a}/${t}
                </div>`:""}
            <button class="kanban-card-delete" data-card-id="${n.id}" data-col-id="${e}">
                <i class="bi bi-x"></i>
            </button>
        </div>
    `}function K(n,e){document.getElementById("colContextMenu")?.remove();const t=document.createElement("div");t.id="colContextMenu",t.className="col-context-menu",t.innerHTML=`
        <button id="menuDeleteCol" class="col-context-item text-danger">
            <i class="bi bi-trash3"></i> Delete column
        </button>
    `,document.body.appendChild(t);const a=n.getBoundingClientRect();t.style.top=`${a.bottom+6}px`,t.style.left=`${a.left}px`,t.querySelector("#menuDeleteCol").addEventListener("click",()=>{const d=s.columns.find(r=>r.id===e);if(d?.cards.length&&!confirm(`Column "${d.name}" has ${d.cards.length} card(s). Delete anyway?`)){t.remove();return}T(s.id,e),t.remove(),v()}),setTimeout(()=>{document.addEventListener("click",()=>t.remove(),{once:!0})},0)}function E(n,e){const a=s.columns.find(i=>i.id===e)?.cards.find(i=>i.id===n);if(!a)return;document.getElementById("cardDetailModal")?.remove();const d=document.createElement("div");d.id="cardDetailModal",d.innerHTML=`
        <div class="modal-backdrop-custom"></div>
        <div class="card-detail-sheet">
            <div class="modal-sheet-handle"></div>

            <input class="card-detail-title" value="${a.title}" placeholder="Card title">

            <textarea class="card-detail-desc" placeholder="Add description...">${a.description||""}</textarea>

            <div class="card-detail-cover-section">
                ${a.cover?`<img src="${a.cover}" class="card-detail-cover-preview" id="coverPreview">`:'<div class="card-detail-cover-empty" id="coverPreview"></div>'}
                <div class="d-flex gap-2 mt-2">
                    <label class="btn btn-sm btn-outline-primary rounded-pill flex-grow-1 text-center" style="cursor:pointer">
                        <i class="bi bi-image"></i> ${a.cover?"Change cover":"Add cover"}
                        <input type="file" id="coverInput" accept="image/*" style="display:none">
                    </label>
                    ${a.cover?'<button id="removeCoverBtn" class="btn btn-sm btn-outline-danger rounded-pill"><i class="bi bi-x"></i></button>':""}
                </div>
            </div>

            <div class="card-detail-move">
                <label>Move to</label>
                <div class="card-detail-cols">
                    ${s.columns.map(i=>`
                        <button class="move-btn ${i.id===e?"active":""}" data-col-id="${i.id}">
                            ${i.name}
                        </button>
                    `).join("")}
                </div>
            </div>

            <div class="card-detail-checklist">
                <h6><i class="bi bi-check2-square"></i> Checklist</h6>
                <div id="checklistItems">
                    ${a.checklist.map(i=>`
                        <div class="checklist-item" data-item-id="${i.id}">
                            <input type="checkbox" ${i.done?"checked":""} class="checklist-check">
                            <span class="${i.done?"done":""}">${i.text}</span>
                            <button class="checklist-delete" data-item-id="${i.id}">
                                <i class="bi bi-x"></i>
                            </button>
                        </div>
                    `).join("")}
                </div>
                <div class="checklist-add">
                    <input type="text" id="newCheckItem" placeholder="Add item...">
                    <button id="addCheckItem"><i class="bi bi-plus"></i></button>
                </div>
            </div>

            <button id="saveCardBtn" class="btn btn-primary w-100 rounded-4 mt-3">Save</button>
        </div>
    `,document.body.appendChild(d),requestAnimationFrame(()=>d.classList.add("show"));function r(){d.classList.remove("show"),setTimeout(()=>d.remove(),300)}d.querySelector(".modal-backdrop-custom").addEventListener("click",r),d.querySelector("#coverInput")?.addEventListener("change",i=>{const c=i.target.files[0];if(!c)return;const l=new FileReader;l.onload=f=>{C(s.id,e,n,f.target.result),v(),r(),setTimeout(()=>E(n,e),310)},l.readAsDataURL(c)}),d.querySelector("#removeCoverBtn")?.addEventListener("click",()=>{C(s.id,e,n,null),v(),r(),setTimeout(()=>E(n,e),310)}),d.querySelector("#saveCardBtn").addEventListener("click",()=>{const i=d.querySelector(".card-detail-title").value.trim(),c=d.querySelector(".card-detail-desc").value.trim();i&&k(async()=>{const{updateCard:l}=await Promise.resolve().then(()=>y);return{updateCard:l}},void 0).then(({updateCard:l})=>{l(s.id,e,n,{title:i,description:c}),v(),r()})}),d.querySelectorAll(".move-btn").forEach(i=>{i.addEventListener("click",()=>{const c=i.dataset.colId;c!==e&&(A(s.id,n,e,c),v(),r())})}),d.querySelectorAll(".checklist-check").forEach(i=>{i.addEventListener("change",()=>{const c=i.closest(".checklist-item").dataset.itemId;k(async()=>{const{toggleChecklistItem:l}=await Promise.resolve().then(()=>y);return{toggleChecklistItem:l}},void 0).then(({toggleChecklistItem:l})=>{l(s.id,e,n,c),v()})})}),d.querySelectorAll(".checklist-delete").forEach(i=>{i.addEventListener("click",()=>{k(async()=>{const{deleteChecklistItem:c}=await Promise.resolve().then(()=>y);return{deleteChecklistItem:c}},void 0).then(({deleteChecklistItem:c})=>{c(s.id,e,n,i.dataset.itemId),s=h().find(b=>b.id===s.id);const f=s.columns.find(b=>b.id===e)?.cards.find(b=>b.id===n);d.querySelector("#checklistItems").innerHTML=f.checklist.map(b=>`
                    <div class="checklist-item" data-item-id="${b.id}">
                        <input type="checkbox" ${b.done?"checked":""} class="checklist-check">
                        <span class="${b.done?"done":""}">${b.text}</span>
                        <button class="checklist-delete" data-item-id="${b.id}">
                            <i class="bi bi-x"></i>
                        </button>
                    </div>
                `).join("")})})}),d.querySelector("#addCheckItem").addEventListener("click",o),d.querySelector("#newCheckItem").addEventListener("keydown",i=>{i.key==="Enter"&&o()});function o(){const i=d.querySelector("#newCheckItem").value.trim();i&&k(async()=>{const{addChecklistItem:c}=await Promise.resolve().then(()=>y);return{addChecklistItem:c}},void 0).then(({addChecklistItem:c})=>{c(s.id,e,n,i),d.querySelector("#newCheckItem").value="",v(),r(),setTimeout(()=>E(n,e),310)})}}function v(){s=h().find(e=>e.id===s.id),U()}
