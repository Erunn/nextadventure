const DB_URL = "https://timer-92fdd-default-rtdb.europe-west1.firebasedatabase.app/.json";

async function initTimer() {
    try {
        const response = await fetch(`${DB_URL}?nocache=${Date.now()}`);
        const data = await response.json();
        if (!data) return;

        document.title = data.shareTitle || "Next Adventure";

        const emojiKey = (data.emoji || "heart").toLowerCase();
        const emojiChar = (data.emojiLibrary && data.emojiLibrary[emojiKey]) ? data.emojiLibrary[emojiKey] : "❤️";
        let anim = "anim-bounce";
        if (emojiKey === "bus" || emojiKey === "train") anim = "anim-drive";
        else if (emojiKey === "plane") anim = "anim-takeoff";

        document.getElementById("event-name").innerHTML = 
            `${data.eventName || "Next Adventure"} <span class="${anim}">${emojiChar}</span>`;

        const showTimer = Number(data.useTimer) === 1;
        if (showTimer && data.targetDate) {
            startCountdown(data.targetDate, data.celebrationMessage);
        } else {
            hideTimer(data.description || data.celebrationMessage);
        }
    } catch (e) { console.error(e); }
}

function startCountdown(dateStr, msg) {
    const parts = dateStr.split(/[-/ :]/);
    const targetDateObj = new Date(parts[2], parts[1]-1, parts[0], parts[3]||0, parts[4]||0);
    const target = targetDateObj.getTime();

    const fd = document.getElementById("full-date-display");
    if (fd) {
        fd.innerText = targetDateObj.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
        fd.style.display = "block";
    }

    const x = setInterval(() => {
        const dist = target - new Date().getTime();
        if (dist <= 0) {
            clearInterval(x);
            hideTimer(msg);
            return;
        }

        document.getElementById("countdown").style.display = "flex";
        updateUnit("days", Math.floor(dist / 86400000));
        updateUnit("hours", Math.floor((dist % 86400000) / 3600000));
        updateUnit("minutes", Math.floor((dist % 3600000) / 60000));
        updateUnit("seconds", Math.floor((dist % 60000) / 1000));
    }, 1000);
}

function updateUnit(id, value) {
    const el = document.getElementById(id);
    if (!el) return;
    el.innerText = value.toString().padStart(2, '0');
    if (value === 0) el.classList.add("is-due");
    else el.classList.remove("is-due");
}

function hideTimer(msg) {
    document.getElementById("countdown").style.display = "none";
    document.getElementById("full-date-display").style.display = "none";
    const s = document.getElementById("status-message");
    if (s) { s.style.display = "block"; s.innerText = msg || "Adventure Starts! ✨"; }
}

// NEW: Updated Theme Toggle with Icon Sync
function updateThemeIcons(isLight) {
    const sun = document.getElementById('sun-icon');
    const moon = document.getElementById('moon-icon');
    if (isLight) {
        sun.style.display = 'block';
        moon.style.display = 'none';
    } else {
        sun.style.display = 'none';
        moon.style.display = 'block';
    }
}

document.getElementById('theme-toggle')?.addEventListener('click', () => {
    const isLight = document.body.classList.toggle('light-mode');
    localStorage.setItem('theme', isLight ? 'light' : 'dark');
    updateThemeIcons(isLight);
});

window.onload = () => {
    initTimer();
    const roll = Math.random();
    if (roll < 0.14) showSuri('suri-1');
    else if (roll < 0.28) showSuri('suri-2');
    else if (roll < 0.42) showSuri('suri-3');
    else if (roll < 0.56) showSuri('suri-4');
    else if (roll < 0.70) showSuri('suri-5');
    else if (roll < 0.84) showSuri('suri-6');
    else showSuri('suri-7');

    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'light') {
        document.body.classList.add('light-mode');
        updateThemeIcons(true);
    } else {
        updateThemeIcons(false);
    }
};

function showSuri(img) {
    const p = document.getElementById('cat-perch');
    if (p) {
        const c = document.createElement('div');
        c.className = `cat-image ${img}`;
        p.innerHTML = ''; 
        p.appendChild(c);
        setTimeout(() => p.style.opacity = "1", 500);
    }
}
