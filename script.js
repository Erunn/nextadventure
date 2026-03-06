const UI = {
    config: {
        DB: "https://timer-92fdd-default-rtdb.europe-west1.firebasedatabase.app/.json",
        SURI_TOTAL: 7,
        CLASSES: { reveal: "reveal", dim: "is-due", light: "light-mode" }
    },

    init() {
        this.renderSuri();
        this.initTheme();
        this.fetchData();
    },

    async fetchData() {
        try {
            const resp = await fetch(`${this.config.DB}?v=${Date.now()}`);
            const data = await resp.json();
            if (!data) throw "No Data";

            document.title = data.shareTitle || "Next Adventure";
            const emoji = data.emojiLibrary?.[data.emoji?.toLowerCase()] || "❤️";
            document.getElementById("event-name").innerHTML = `${data.eventName} <span>${emoji}</span>`;

            if (Number(data.useTimer) === 1 && data.targetDate) {
                this.startTimer(data.targetDate, data.celebrationMessage);
            } else {
                this.updateUI(false, data.noTimerMessage);
            }
        } catch (e) {
            this.updateUI(false, "Next Adventure ❤️");
        }
    },

    startTimer(targetStr, msg) {
        const p = targetStr.split(/[-/ :]/);
        const target = new Date(p[2], p[1]-1, p[0], p[3]||0, p[4]||0).getTime();
        
        const fd = document.getElementById("full-date-display");
        if (fd) {
            fd.innerText = new Date(target).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });
            fd.style.display = "block";
        }

        const tick = () => {
            const dist = target - Date.now();
            if (dist <= 0) return this.updateUI(false, msg);

            const time = {
                days: Math.floor(dist / 86400000),
                hours: Math.floor((dist % 86400000) / 3600000),
                minutes: Math.floor((dist % 3600000) / 60000),
                seconds: Math.floor((dist % 60000) / 1000)
            };

            // Batch DOM updates for performance
            for (const [unit, val] of Object.entries(time)) {
                const el = document.getElementById(unit);
                el.innerText = val.toString().padStart(2, '0');
                
                // Dimming Logic
                if (unit === 'days') el.classList.toggle(this.config.CLASSES.dim, val === 0);
                if (unit === 'hours') el.classList.toggle(this.config.CLASSES.dim, time.days === 0 && val === 0);
                if (unit === 'minutes') el.classList.toggle(this.config.CLASSES.dim, time.days === 0 && time.hours === 0 && val === 0);
            }

            document.getElementById("countdown").style.display = "flex";
            this.revealAll();
        };

        tick();
        setInterval(tick, 1000);
    },

    updateUI(showTimer, msg) {
        document.getElementById("countdown").style.display = showTimer ? "flex" : "none";
        const desc = document.getElementById("description-display");
        if (desc) {
            desc.style.display = "block";
            desc.innerText = msg;
        }
        this.revealAll();
    },

    revealAll() {
        document.querySelectorAll(".sync-reveal").forEach(el => el.classList.add(this.config.CLASSES.reveal));
    },

    renderSuri() {
        const last = sessionStorage.getItem('lastSuri');
        let cur;
        do { cur = Math.floor(Math.random() * this.config.SURI_TOTAL) + 1; } while (cur == last);
        
        sessionStorage.setItem('lastSuri', cur);
        const perch = document.getElementById('cat-perch');
        const img = document.createElement('div');
        img.className = `cat-image suri-${cur}`;
        perch.appendChild(img);
    },

    initTheme() {
        const btn = document.getElementById('theme-toggle');
        const isLight = localStorage.getItem('theme') === 'light';
        if (isLight) document.body.classList.add(this.config.CLASSES.light);
        this.updateThemeIcons(isLight);

        btn.onclick = () => {
            const active = document.body.classList.toggle(this.config.CLASSES.light);
            localStorage.setItem('theme', active ? 'light' : 'dark');
            this.updateThemeIcons(active);
        };
    },

    updateThemeIcons(isLight) {
        document.getElementById('sun-icon').style.display = isLight ? 'block' : 'none';
        document.getElementById('moon-icon').style.display = isLight ? 'none' : 'block';
    }
};

window.onload = () => UI.init();
