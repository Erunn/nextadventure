const DB_URL = "https://timer-92fdd-default-rtdb.europe-west1.firebasedatabase.app/.json";

function showSuri(imageClass) {
    const perch = document.getElementById('cat-perch');
    if (!perch) return;
    const cat = document.createElement('div');
    cat.className = `cat-image ${imageClass}`;
    perch.appendChild(cat);
    setTimeout(() => { perch.style.opacity = "1"; }, 500);
}

function createPawTrack() {
    const container = document.getElementById('cat-encounter-container');
    if (!container) return;
    let x = Math.random() * (window.innerWidth - 100);
    let y = Math.random() * (window.innerHeight - 100);
    let angle = Math.random() * 360; 

    for (let i = 0; i < 10; i++) {
        setTimeout(() => {
            const paw = document.createElement('div');
            paw.className = 'paw-print';
            const side = i % 2 === 0 ? 1 : -1;
            const moveAngle = angle * (Math.PI / 180);
            const finalX = x + (i * 70 * Math.cos(moveAngle)) + (20 * Math.cos((angle + 90 * side) * (Math.PI / 180)));
            const finalY = y + (i * 70 * Math.sin(moveAngle)) + (20 * Math.sin((angle + 90 * side) * (Math.PI / 180)));
            paw.style.left = `${finalX}px`;
            paw.style.top = `${finalY}px`;
            paw.style.setProperty('--rot', `${angle + 90}deg`);
            container.appendChild(paw);
            setTimeout(() => paw.remove(), 7000);
        }, i * 450);
    }
}

async function initTimer() {
    try {
        const response = await fetch(DB_URL);
        const data = await response.json();
        
        // Update Title/Meta from Firebase
        document.title = data.shareTitle || "Next Adventure";
        document.getElementById("og-title")?.setAttribute("content", data.shareTitle || "Next Adventure");
        document.getElementById("meta-desc")?.setAttribute("content", data.metaDescription || "A personal countdown.");

        const eventNameEl = document.getElementById("event-name");
        eventNameEl.innerHTML = `${data.eventName || "Next Adventure"} ❤️`;

        if (data.targetDate) {
            const parts = data.targetDate.split(/[-/ :]/);
            const target = new Date(parts[2], parts[1]-1, parts[0], parts[3]||0, parts[4]||0).getTime();
            document.getElementById("countdown").style.display = "flex";

            setInterval(() => {
                const now = new Date().getTime();
                const dist = target - now;
                if (dist < 0) return;

                document.getElementById("days").innerText = Math.floor(dist / 86400000).toString().padStart(2, '0');
                document.getElementById("hours").innerText = Math.floor((dist % 86400000) / 3600000).toString().padStart(2, '0');
                document.getElementById("minutes").innerText = Math.floor((dist % 3600000) / 60000).toString().padStart(2, '0');
                document.getElementById("seconds").innerText = Math.floor((dist % 60000) / 1000).toString().padStart(2, '0');
            }, 1000);
        }
    } catch (e) { console.error("Database failed", e); }
}

const themeBtn = document.getElementById('theme-toggle');
if (themeBtn) {
    themeBtn.addEventListener('click', () => {
        document.body.classList.toggle('light-mode');
        localStorage.setItem('theme', document.body.classList.contains('light-mode') ? 'light' : 'dark');
    });
}

// 25% Encounter Chance
window.onload = () => {
    initTimer();
    const roll = Math.random();
    if (roll < 0.25) showSuri('suri-1');
    else if (roll < 0.5) showSuri('suri-2');
    else if (roll < 0.75) showSuri('suri-3');
    else { createPawTrack(); setInterval(createPawTrack, 30000); }
};
