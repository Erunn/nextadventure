const DB_URL = "https://timer-92fdd-default-rtdb.europe-west1.firebasedatabase.app/.json";

async function initTimer() {
    try {
        const response = await fetch(`${DB_URL}?nocache=${Date.now()}`);
        const data = await response.json();
        if (!data) return;

        // 1. Sync Tab Name with 'shareTitle'
        const finalTitle = data.shareTitle || "Next Adventure";
        document.title = finalTitle; 
        const og = document.getElementById("og-title");
        if (og) og.setAttribute("content", finalTitle);

        // 2. Emoji Logic
        const emojiKey = (data.emoji || "heart").toLowerCase();
        const emojiChar = (data.emojiLibrary && data.emojiLibrary[emojiKey]) ? data.emojiLibrary[emojiKey] : "❤️";
        let anim = "anim-bounce";
        if (emojiKey === "bus" || emojiKey === "train") anim = "anim-drive";
        else if (emojiKey === "plane") anim = "anim-takeoff";

        const nameEl = document.getElementById("event-name");
        if (nameEl) nameEl.innerHTML = `${data.eventName || "Next Adventure"} <span class="${anim}">${emojiChar}</span>`;

        // 3. Visibility Logic
        const showTimer = Number(data.useTimer) === 1;
        const countdownEl = document.getElementById("countdown");
        const statusEl = document.getElementById("status-message");

        if (showTimer && data.targetDate) {
            startCountdown(data.targetDate, data.celebrationMessage);
        } else {
            if (countdownEl) countdownEl.style.display = "none";
            if (statusEl) {
                statusEl.style.display = "block";
                statusEl.innerText = data.celebrationMessage || "Adventure Starts! ✨";
            }
        }
    } catch (e) { console.error(e); }
}

function startCountdown(dateStr, msg) {
    const parts = dateStr.split(/[-/ :]/);
    const target = new Date(parts[2], parts[1]-1, parts[0], parts[3]||0, parts[4]||0).getTime();
    const countdownEl = document.getElementById("countdown");
    const dateDisplay = document.getElementById("full-date-display");
    const statusEl = document.getElementById("status-message");

    const x = setInterval(() => {
        const dist = target - new Date().getTime();

        if (dist <= 0) {
            // FIX: Hide timer and date if past
            clearInterval(x);
            if (countdownEl) countdownEl.style.display = "none";
            if (dateDisplay) dateDisplay.style.display = "none";
            if (statusEl) {
                statusEl.style.display = "block";
                statusEl.innerText = msg || "The moment is here! ✨";
            }
            return;
        }

        // Show elements while active
        if (countdownEl) countdownEl.style.setProperty("display", "flex", "important");
        if (dateDisplay) {
            dateDisplay.innerText = new Date(target).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
            dateDisplay.style.display = "block";
        }

        document.getElementById("days").innerText = Math.floor(dist / 86400000).toString().padStart(2, '0');
        document.getElementById("hours").innerText = Math.floor((dist % 86400000) / 3600000).toString().padStart(2, '0');
        document.getElementById("minutes").innerText = Math.floor((dist % 3600000) / 60000).toString().padStart(2, '0');
        document.getElementById("seconds").innerText = Math.floor((dist % 60000) / 1000).toString().padStart(2, '0');
    }, 1000);
}

// Randomizer and Theme Setup
window.onload = () => {
    initTimer();
    const roll = Math.random();
    if (roll < 0.25) showSuri('suri-1');
    else if (roll < 0.50) showSuri('suri-2');
    else if (roll < 0.75) showSuri('suri-3');
    else { createPawTrack(); setInterval(createPawTrack, 25000); }

    const isLight = localStorage.getItem('theme') === 'light';
    if (isLight) document.body.classList.add('light-mode');
    updateUI(isLight);
};

function updateUI(light) {
    const sun = document.getElementById('icon-sun');
    const moon = document.getElementById('icon-moon');
    if (sun) sun.style.display = light ? 'block' : 'none';
    if (moon) moon.style.display = light ? 'none' : 'block';
}

document.getElementById('theme-toggle')?.addEventListener('click', () => {
    const light = document.body.classList.toggle('light-mode');
    localStorage.setItem('theme', light ? 'light' : 'dark');
    updateUI(light);
});

function showSuri(img) {
    const p = document.getElementById('cat-perch');
    if (!p) return;
    const c = document.createElement('div');
    c.className = `cat-image ${img}`;
    p.appendChild(c);
    setTimeout(() => p.style.opacity = "1", 500);
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
            const finalX = x + (i * 70 * Math.cos(angle * Math.PI / 180)) + (20 * Math.cos((angle + 90 * side) * Math.PI / 180));
            const finalY = y + (i * 70 * Math.sin(angle * Math.PI / 180)) + (20 * Math.sin((angle + 90 * side) * Math.PI / 180));
            paw.style.left = `${finalX}px`;
            paw.style.top = `${finalY}px`;
            paw.style.setProperty('--rot', `${angle + 90}deg`);
            container.appendChild(paw);
            setTimeout(() => paw.remove(), 7000);
        }, i * 450);
    }
}
