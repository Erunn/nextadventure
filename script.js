const DB_URL = "https://timer-92fdd-default-rtdb.europe-west1.firebasedatabase.app/.json";

async function initTimer() {
    // Fail-safe: if DB takes > 5s, show default state
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);

    try {
        const response = await fetch(`${DB_URL}?nocache=${Date.now()}`, { signal: controller.signal });
        clearTimeout(timeoutId);
        const data = await response.json();
        
        if (!data) throw new Error("No data");

        document.title = data.shareTitle || "Next Adventure";
        const emojiKey = (data.emoji || "heart").toLowerCase();
        const emojiChar = (data.emojiLibrary && data.emojiLibrary[emojiKey]) ? data.emojiLibrary[emojiKey] : "❤️";
        
        document.getElementById("event-name").innerHTML = 
            `${data.eventName || "Next Adventure"} <span>${emojiChar}</span>`;

        const showTimer = Number(data.useTimer) === 1;
        const noTimerEl = document.getElementById("description-display");
        
        if (showTimer && data.targetDate) {
            if (noTimerEl) noTimerEl.style.display = "none";
            startCountdown(data.targetDate, data.celebrationMessage);
        } else {
            document.getElementById("countdown").style.display = "none";
            document.getElementById("full-date-display").style.display = "none";
            if (noTimerEl) {
                noTimerEl.style.display = "block";
                noTimerEl.innerText = data.noTimerMessage || "Our next adventure is coming soon.";
            }
        }
    } catch (e) { 
        console.error("Timer load failed:", e);
        // Fallback to prevent "Loading..." hang
        document.getElementById("event-name").innerText = "Next Adventure ❤️";
    }
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

        const d = Math.floor(dist / 86400000);
        const h = Math.floor((dist % 86400000) / 3600000);
        const m = Math.floor((dist % 3600000) /
