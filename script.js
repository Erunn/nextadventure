async function initTimer() {
    try {
        const response = await fetch(`${DB_URL}?nocache=${Date.now()}`);
        const data = await response.json();
        if (!data) return;

        // 1. Map your specific emojis to unique animations
        const emojiKey = (data.emoji || "heart").toLowerCase();
        const emojiChar = (data.emojiLibrary && data.emojiLibrary[emojiKey]) ? data.emojiLibrary[emojiKey] : "❤️";
        
        let animClass = "anim-bounce"; // Default for Heart
        
        if (emojiKey === "bus" || emojiKey === "train") {
            animClass = "anim-drive"; // Side-to-side driving
        } else if (emojiKey === "plane") {
            animClass = "anim-takeoff"; // Diagonal floating
        }

        const nameEl = document.getElementById("event-name");
        if (nameEl) {
            nameEl.innerHTML = `${data.eventName || "Next Adventure"} <span class="${animClass}">${emojiChar}</span>`;
        }

        // 2. useTimer Logic: Strictly using 'description' field
        const showTimer = Number(data.useTimer) === 1;
        const countdownEl = document.getElementById("countdown");
        const descEl = document.getElementById("description-display");

        if (showTimer && data.targetDate) {
            if (countdownEl) countdownEl.style.display = "flex";
            if (descEl) descEl.style.display = "none";
            startCountdown(data.targetDate, data.celebrationMessage);
        } else {
            if (countdownEl) countdownEl.style.display = "none";
            if (descEl) {
                descEl.style.display = "block";
                descEl.innerText = data.description || "Our next adventure is coming soon.";
            }
        }
    } catch (e) { console.error(e); }
}
