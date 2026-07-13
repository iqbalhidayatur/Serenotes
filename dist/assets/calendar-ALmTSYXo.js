import"./modulepreload-polyfill-B5Qt9EMX.js";import"./preload-helper-CWvZBRxe.js";import{i as v}from"./themeService-BgIb2Nl3.js";import{b as p}from"./noteService-BbxFfomM.js";import"./quickNote-CCxhJ69S.js";v();const{App:g}=window.Capacitor?.Plugins||{};g&&g.addListener("backButton",({canGoBack:e})=>{e?window.history.back():window.location.href="dashboard.html"});const M=document.getElementById("monthTitle"),d=document.getElementById("calendarGrid"),i=document.getElementById("notesByDate"),w=document.getElementById("selectedDateTitle"),T=document.getElementById("prevMonth"),L=document.getElementById("nextMonth"),b=["January","February","March","April","May","June","July","August","September","October","November","December"];let o=new Date,s=new Date;l();T.addEventListener("click",()=>{o.setMonth(o.getMonth()-1),l()});L.addEventListener("click",()=>{o.setMonth(o.getMonth()+1),l()});function l(){d.innerHTML="";const e=o.getFullYear(),n=o.getMonth();M.textContent=`${b[n]} ${e}`;const t=new Date(e,n,1).getDay(),r=new Date(e,n+1,0).getDate();for(let a=0;a<t;a++)d.innerHTML+='<div class="calendar-day empty"></div>';for(let a=1;a<=r;a++){const u=new Date(e,n,a),c=new Date,f=c.getDate()===a&&c.getMonth()===n&&c.getFullYear()===e,m=y(u),D=m.length?$(m[0].category):"";d.innerHTML+=`

            <div
                class="
                    calendar-day
                    ${f?"today":""}
                "
                data-date="${u.toISOString()}"
            >

                <span>

                    ${a}

                </span>

                ${D}

            </div>

        `}document.querySelectorAll(".calendar-day").forEach(a=>{a.addEventListener("click",E)}),h(s)}function E(e){const n=e.currentTarget.dataset.date;n&&(s=new Date(n),document.querySelectorAll(".calendar-day").forEach(t=>{t.classList.remove("selected")}),e.currentTarget.classList.add("selected"),h(s))}function h(e){const n=y(e);if(w.textContent=`Notes for ${S(e)}`,i.innerHTML="",!n.length){i.innerHTML=`

            <div class="calendar-empty">

                <i class="bi bi-journal-x"></i>

                <h5>

                    No notes

                </h5>

            </div>

        `;return}n.forEach(t=>{i.innerHTML+=`

            <div
                class="calendar-note"
                data-id="${t.id}"
            >

                <div
                    class="calendar-note-left"
                >

                    <div
                        class="d-flex align-items-center gap-2"
                    >

                        <span
                            class="calendar-note-category"
                        >

                            ${t.category}

                        </span>

                        <span
                            class="calendar-note-time"
                        >

                            ${B(t.date)}

                        </span>

                    </div>

                    <div class="calendar-note-title">
                        ${t.noteName||(t.content||"").substring(0,35)}
                    </div>

                </div>

                <i
                    class="bi bi-chevron-right"
                ></i>

            </div>

        `}),document.querySelectorAll(".calendar-note").forEach(t=>{t.addEventListener("click",()=>{window.location.href=`note-detail.html?id=${t.dataset.id}`})})}function y(e){return p().filter(t=>{const r=new Date(t.date);return r.getDate()===e.getDate()&&r.getMonth()===e.getMonth()&&r.getFullYear()===e.getFullYear()})}function $(e){return`

        <div
            class="
                calendar-dot
                ${{Work:"dot-work",Personal:"dot-personal",Ideas:"dot-ideas",Archive:"dot-archive"}[e]||"dot-work"}
            "
        ></div>

    `}function S(e){return e.toLocaleDateString("en-US",{month:"short",day:"numeric"})}function B(e){return new Date(e).toLocaleTimeString("en-US",{hour:"2-digit",minute:"2-digit"})}
