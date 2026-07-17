import"./modulepreload-polyfill-B5Qt9EMX.js";import"./preload-helper-D33vDyUH.js";import{i as g}from"./themeService-BgIb2Nl3.js";import{b as d,g as p,e as f}from"./noteService-DbdrNuO8.js";import"./quickNote-Doto7KFv.js";import"./syncService-BQUdfgLS.js";function y(e){const t=p(e);return t?(t.reminder.completed=!0,f(t),!0):!1}function a(){const e=new Date;return d().filter(t=>{if(!t.reminder?.enabled)return!1;const i=new Date(t.reminder.datetime);return i.getFullYear()===e.getFullYear()&&i.getMonth()===e.getMonth()&&i.getDate()===e.getDate()&&!t.reminder.completed})}function c(){const e=new Date;return d().filter(t=>t.reminder?.enabled?new Date(t.reminder.datetime)>e&&!t.reminder.completed:!1)}function l(){const e=new Date;return d().filter(t=>t.reminder?.enabled?new Date(t.reminder.datetime)<e&&!t.reminder.completed:!1)}function s(){return d().filter(e=>e.reminder?.completed)}function h(){return{today:a().length,upcoming:c().length,overdue:l().length,completed:s().length}}g();const{App:m}=window.Capacitor?.Plugins||{};m&&m.addListener("backButton",({canGoBack:e})=>{e?window.history.back():window.location.href="dashboard.html"});const b=document.getElementById("todayCount"),v=document.getElementById("upcomingCount"),w=document.getElementById("completedCount"),L=document.getElementById("todayList"),C=document.getElementById("upcomingList"),E=document.getElementById("completedList"),D=document.getElementById("overdueList"),B=document.getElementById("todayBtn");I();B.addEventListener("click",()=>{const e=new Date;document.title=`Reminders — ${k(e)}`,o()});function I(){o()}console.log("All notes with reminder:",JSON.parse(localStorage.getItem("serenotes_notes")||"[]").filter(e=>e.reminder?.enabled).map(e=>({name:e.noteName,datetime:e.reminder.datetime,completed:e.reminder.completed})));function o(){const e=h();b.textContent=e.today,v.textContent=e.upcoming,w.textContent=e.completed,r(L,a(),"No reminders for today."),r(C,c(),"No upcoming reminders."),r(E,s(),"No completed reminders."),r(D,l(),"No overdue reminders.")}function r(e,t,i){if(e.innerHTML="",!t.length){e.innerHTML=`
            <div class="reminder-empty">
                <i class="bi bi-bell-slash"></i>
                <p>${i}</p>
            </div>
        `;return}t.forEach(n=>{e.innerHTML+=N(n)}),e.querySelectorAll(".reminder-complete-btn").forEach(n=>{n.addEventListener("click",u=>{u.stopPropagation(),y(n.dataset.id),o()})}),e.querySelectorAll(".reminder-card").forEach(n=>{n.addEventListener("click",()=>{window.location.href=`note-detail.html?id=${n.dataset.id}`})})}function N(e){const t=e.reminder?.completed;return`
        <div class="reminder-card ${t?"reminder-done":""}" data-id="${e.id}">
            <div class="reminder-card-left">
                <div class="reminder-note-title">
                    ${e.noteName||e.title||"Untitled"}
                </div>
                <div class="reminder-note-time">
                    <i class="bi bi-bell"></i>
                    ${$(e.reminder.datetime)}
                </div>
                <div class="reminder-note-category">
                    ${e.category||""}
                </div>
            </div>
            ${t?'<i class="bi bi-check-circle-fill text-success fs-4"></i>':`<button class="reminder-complete-btn" data-id="${e.id}" title="Mark as done">
                        <i class="bi bi-check-lg"></i>
                   </button>`}
        </div>
    `}function $(e){return new Date(e).toLocaleString("en-US",{month:"short",day:"numeric",hour:"2-digit",minute:"2-digit"})}function k(e){return e.toLocaleDateString("en-US",{weekday:"long",month:"long",day:"numeric"})}
