const DB_URL = "https://timer-92fdd-default-rtdb.europe-west1.firebasedatabase.app/.json";

async function initTimer() {
    try {
        // Force fresh fetch for mobile
        const response = await fetch(`${DB_URL}?nocache=${new Date().getTime()}`);
        const data = await response.json();
        if (!data) return;

        // 1. Sync Titles
        document.title = data.shareTitle || "Next Adventure";
        document.getElementById("og-title")?.setAttribute("content", data.shareTitle || "Adventure");

        // 2. Emoji Animation Logic
        const emojiKey = (data.emoji || "heart").toLowerCase();
        const selectedEmoji = (data.emojiLibrary && data.emojiLibrary[emojiKey]) ? data.emojiLibrary[emojiKey] : "❤️";
        
        let animClass = "anim-bounce"; // Default
        if (emojiKey === "star") animClass = "anim-pulse";
        if (emojiKey === "sparkles") animClass = "anim-wiggle";
        if (emojiKey === "sun") animClass = "anim-spin";

        document.getElementById("event-name").innerHTML = 
            `${data.eventName || "Next Adventure"} <span class="${animClass}">${selectedEmoji}</span>`;

        // 3. useTimer Logic: Show Timer OR Description
        const useTimer = Number(data.useTimer) === 1;
        const countdownEl = document.getElementById("countdown");
        const descDisplay = document.getElementById("description-display");
        const fullDateEl = document.getElementById("full-date-display");

        if (useTimer && data.targetDate) {
            countdownEl.style.display = "flex";
            if (descDisplay) descDisplay.style.display = "none";
            
            const parts = data.targetDate.split(/[-/ :]/);
            const targetDateObj = new Date(parts[2], parts[1]-1, parts[0], parts[3]||0, parts[4]||0);
            const target = targetDateObj.getTime();
            
            if (fullDateEl) {
                fullDateEl.innerText = targetDateObj.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
                fullDateEl.style.display = "block";
            }

            const timerInterval = setInterval(() => {
                const dist = target - new Date().getTime();
                if (dist <= 0) {
                    clearInterval(timerInterval);
                    countdownEl.style.display = "none";
                    document.getElementById("status-message").style.display = "block";
                    document.getElementById("status-message").innerText = data.celebrationMessage || "Time's up! ✨";
                    return;
                }
                document.getElementById("days").innerText = Math.floor(dist / 86400000).toString().padStart(2, '0');
                document.getElementById("hours").innerText = Math.floor((dist % 86400000) / 3600000).toString().padStart(2, '0');
                document.getElementById("minutes").innerText = Math.floor((dist % 3600000) / 60000).toString().padStart(2, '0');
                document.getElementById("seconds").innerText = Math.floor((dist % 60000) / 1000).toString().padStart(2, '0');
            }, 1000);
        } else {
            // SHOW DESCRIPTION instead of timer
            countdownEl.style.display = "none";
            if (fullDateEl) fullDateEl.style.display = "none";
            if (descDisplay) {
                descDisplay.style.display = "block";
                descDisplay.innerText = data.metaDescription || "No description provided.";
            }
        }
    } catch (e) { console.error(e); }
}

// Fixed Theme Toggle with Mobile Icon update
function updateThemeIcons(isLight) {
    const sun = document.getElementById('icon-sun');
    const moon = document.getElementById('icon-moon');
    if (sun) sun.style.display = isLight ? 'block' : 'none';
    if (moon) moon.style.display = isLight ? 'none' : 'block';
}

document.getElementById('theme-toggle')?.addEventListener('click', () => {
    const isLight = document.body.classList.toggle('light-mode');
    localStorage.setItem('theme', isLight ? 'light' : 'dark');
    updateThemeIcons(isLight);
});

window.onload = () => {
    const isLight = localStorage.getItem('theme') === 'light';
    if (isLight) document.body.classList.add('light-mode');
    updateThemeIcons(isLight);
    initTimer();
    
    const roll = Math.random();
    if (roll < 0.25) showSuri('suri-1');
    else if (roll < 0.5) showSuri('suri-2');
    else if (roll < 0.75) showSuri('suri-3');
};

function showSuri(img) {
    const p = document.getElementById('cat-perch');
    if (!p) return;
    const c = document.createElement('div');
    c.className = `cat-image ${img}`;
    p.appendChild(c);
    setTimeout(() => p.style.opacity = "1", 500);
}
