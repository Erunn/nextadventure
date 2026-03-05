const DB_URL = "https://timer-92fdd-default-rtdb.europe-west1.firebasedatabase.app/.json";

async function initTimer() {
    try {
        const response = await fetch(`${DB_URL}?nocache=${Date.now()}`);
        const data = await response.json();
        if (!data) return;

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

        const d = Math.floor(dist / 86400000);
        const h = Math.floor((dist % 86400000) / 3600000);
        const m = Math.floor((dist % 3600000) / 60000);
        const s = Math.floor((dist % 60000) / 1000);

        const dEl = document.getElementById("days");
        const hEl = document.getElementById("hours");
        const mEl = document.getElementById("minutes");
        const sEl = document.getElementById("seconds");

        // Display the numbers
        dEl.innerText = d.toString().padStart(2, '0');
        hEl.innerText = h.toString().padStart(2, '0');
        mEl.innerText = m.toString().padStart(2, '0');
        sEl.innerText = s.toString().padStart(2, '0');

        // FIXED: Cascade Dimming Logic
        // Days dim if 0
        if (d === 0) dEl.classList.add("is-due"); else dEl.classList.remove("is-due");
        
        // Hours dim ONLY if 0 AND Days are 0
        if (d === 0 && h === 0) hEl.classList.add("is-due"); else hEl
