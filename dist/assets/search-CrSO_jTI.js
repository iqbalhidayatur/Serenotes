import"./modulepreload-polyfill-B5Qt9EMX.js";import"./preload-helper-D33vDyUH.js";import{i as C}from"./themeService-BgIb2Nl3.js";import{b as p}from"./noteService-DbdrNuO8.js";import"./syncService-BQUdfgLS.js";const f="serenotes_recent_searches";function I(e){if(!e)return[];const s=e.toLowerCase().trim().split(/\s+/);return p().map(n=>{const c=(n.title||"").toLowerCase(),T=(n.blocks||[]).map(i=>(i.text||"").replace(/<[^>]+>/g,"")).join(" ").toLowerCase(),v=(n.tags||[]).join(" ").toLowerCase(),b=(n.category||"").toLowerCase();let o=0;return s.forEach(i=>{c===i&&(o+=100),c.startsWith(i)&&(o+=60),c.includes(i)&&(o+=40),v.split(" ").includes(i)?o+=50:v.includes(i)&&(o+=30),b.includes(i)&&(o+=20);const $=(T.match(new RegExp(i,"g"))||[]).length;o+=$*5}),{note:n,score:o}}).filter(n=>n.score>0).sort((n,c)=>c.score-n.score).map(n=>n.note)}function B(e){if(!e.trim())return;let t=w();t=t.filter(s=>s!==e),t.unshift(e),t=t.slice(0,10),localStorage.setItem(f,JSON.stringify(t))}function w(){return JSON.parse(localStorage.getItem(f))||[]}function H(){localStorage.removeItem(f)}function E(e,t){if(!t)return e;const s=new RegExp(`(${t})`,"gi");return e.replace(s,"<mark>$1</mark>")}C();const{App:y}=window.Capacitor?.Plugins||{};y&&y.addListener("backButton",({canGoBack:e})=>{e?window.history.back():window.location.href="dashboard.html"});const M=document.getElementById("suggestionContainer"),N=document.getElementById("clearInput"),l=document.getElementById("searchInput"),u=document.getElementById("searchResult"),L=document.getElementById("recentSearch"),A=document.getElementById("clearRecent"),g=document.getElementById("tagFilterWrap"),S=document.getElementById("sortSelect");let r=[];m();k();R();l.addEventListener("input",d);S.addEventListener("change",d);A.addEventListener("click",()=>{H(),m()});N.addEventListener("click",()=>{l.value="",r=[],k(),u.innerHTML=`
        <div class="search-empty">
            <i class="bi bi-search"></i>
            <h5>Search Notes</h5>
            <p>Start typing to search notes</p>
        </div>
    `,l.focus()});function R(){M.querySelectorAll(".chip").forEach(e=>{e.addEventListener("click",()=>{l.value=e.dataset.keyword,d(),l.focus()})})}function d(){const e=l.value.trim();if(!e&&r.length===0){u.innerHTML="";return}let t=e?I(e):p();r.length>0&&(t=t.filter(a=>r.every(n=>(a.tags||[]).includes(n))));const s=S?.value||"relevance";if(s==="newest"?t=[...t].sort((a,n)=>new Date(n.date)-new Date(a.date)):s==="oldest"?t=[...t].sort((a,n)=>new Date(a.date)-new Date(n.date)):s==="az"?t=[...t].sort((a,n)=>(a.noteName||"").localeCompare(n.noteName||"")):s==="za"&&(t=[...t].sort((a,n)=>(n.noteName||"").localeCompare(a.noteName||""))),u.innerHTML="",t.length===0){u.innerHTML=`
            <div class="text-center py-4 text-secondary">
                <i class="bi bi-journal-x" style="font-size:2.5rem;"></i>
                <p class="mt-2">No notes found</p>
            </div>
        `;return}t.forEach(a=>{const n=(a.tags||[]).map(c=>`
            <span class="note-card-tag" data-tag="${c}">#${c}</span>
        `).join("");u.innerHTML+=`
            <div class="search-card" onclick="location.href='note-detail.html?id=${a.id}'">
                <h5>${E(a.noteName||"Untitled",e)}</h5>
                <p>${E(j(x(a)),e)}</p>
                <small>${a.category||""}</small>
                ${n?`<div class="note-card-tags">${n}</div>`:""}
            </div>
        `}),u.querySelectorAll(".note-card-tag").forEach(a=>{a.addEventListener("click",n=>{n.stopPropagation();const c=a.dataset.tag;r.includes(c)||(r.push(c),h(),d())})}),e&&B(e),m()}function k(){const e=[...new Set(p().flatMap(s=>s.tags||[]))].sort(),t=document.getElementById("tagCloud");if(t){if(e.length===0){t.innerHTML='<span class="text-secondary" style="font-size:13px;">No tags yet</span>';return}t.innerHTML=e.map(s=>`
        <span class="note-card-tag" data-tag="${s}">#${s}</span>
    `).join(""),t.querySelectorAll(".note-card-tag").forEach(s=>{s.addEventListener("click",()=>{const a=s.dataset.tag;r.includes(a)||(r.push(a),h(),d())})})}}function h(){if(g){if(r.length===0){g.innerHTML="";return}g.innerHTML=r.map(e=>`
        <span class="search-tag-chip">
            #${e}
            <span class="chip-remove" data-tag="${e}">
                <i class="bi bi-x"></i>
            </span>
        </span>
    `).join(""),g.querySelectorAll(".chip-remove").forEach(e=>{e.addEventListener("click",()=>{r=r.filter(t=>t!==e.dataset.tag),h(),d()})})}}function m(){L.innerHTML="",w().forEach(e=>{L.innerHTML+=`
            <div class="recent-item" data-keyword="${e}">
                <i class="bi bi-clock-history"></i>
                <span>${e}</span>
            </div>
        `}),document.querySelectorAll(".recent-item").forEach(e=>{e.addEventListener("click",()=>{l.value=e.dataset.keyword,d(),l.focus()})})}function x(e){return e.blocks&&e.blocks.length>0?e.blocks.map(t=>t.text||"").join(" ").replace(/<[^>]+>/g,""):e.content||""}function j(e){return e?e.length>120?e.substring(0,120)+"...":e:""}
