const UI = {
    state: { isRevealed: false, timer: null },
    config: {
        DB: "https://timer-92fdd-default-rtdb.europe-west1.firebasedatabase.app/.json",
        SURI_TOTAL: 7
    },
    
    init() {
        this.preloadImages();
        this.renderSuri();
        this.initTheme();
        this.load();
    },

    preloadImages() {
        for(let i=1; i<=this.config.SURI_TOTAL; i++) {
            const img = new Image();
            img.src = `https://raw.githubusercontent.com/Erunn/ournextadventure/main/suri${i}.png`;
        }
    },

    async load() {
        try {
            const r = await fetch(`${this.config.DB}?v=${Date.now()}`);
            const d = await r.json();
            if (!d) throw 0;

            document.title = d.shareTitle || "Next Adventure";
            const emoji = d.emojiLibrary?.[d.emoji?.toLowerCase()] || "❤️";
            document.getElementById("event-name").innerHTML = `${d.eventName} <span>${emoji}</span>`;

            if (Number(d.useTimer) === 1 && d.targetDate) {
                this.runTimer(d.targetDate, d.celebrationMessage);
            } else {
                this.showStatic(d.noTimerMessage);
            }
        } catch (e) {
            this.showStatic("Next Adventure ❤️");
        }
    },

    runTimer(targetStr, msg) {
        const p = targetStr.split(/[-/ :]/);
        const target = new Date(p[2], p[1]-1, p[0], p[3]||0, p[4]||0).getTime();
        
        const fd = document.getElementById("full-date-display");
        if (fd) {
            fd.innerText = new Date(target).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });
