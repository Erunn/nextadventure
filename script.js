const UI = {
    state: { isRevealed: false, timer: null, last: {} },
    config: { DB: "https://timer-92fdd-default-rtdb.europe-west1.firebasedatabase.app/.json", SURI_TOTAL: 7 },
    dom: {},
    
    init() {
        ['event-name', 'full-date-display', 'description-display', 'countdown', 'days', 'hours', 'minutes', 'seconds', 'cat-perch', 'theme-toggle', 'sun-icon', 'moon-icon'].forEach(id => {
            this.dom[id] = document.getElementById(id);
        });

        this.renderSuri();
        this.initTheme();
        this.load();
        
        if (this.dom['cat-perch']) {
            this.dom['cat-perch'].addEventListener('pointerdown', e => { e.stopPropagation(); this.renderSuri(); });
        }
    },
    
    preloadImages() {
        for(let i=1; i<=this.config.SURI_TOTAL; i++) {
            new Image().src = `https://raw.githubusercontent.com/Erunn/ournextadventure/main/suri${i}.png`;
        }
    },
    
    async load() {
        try {
            const r = await fetch(`${this.config.DB}?v=${Date.now()}`);
            const d = await r.json();
            if (!d) throw 0;
            
            const emoji = d.emojiLibrary?.[d.emoji?.toLowerCase()];
            const emojiHTML = emoji ? ` <span>${emoji}</span>` : "";
            if (this.dom['event-name']) this.dom['event-name'].innerHTML = `${d.eventName}${emojiHTML}`;
            
            if (Number(d.useTimer) === 1 && d.targetDate) this.runTimer(d.targetDate, d.celebrationMessage);
            else this.showStatic(d.noTimerMessage);
        } catch (e) {
            this.showStatic("next adventure");
        }
    },
    
    runTimer(targetStr, msg) {
        // Fix: Now explicitly extracts and uses seconds (s=0 defaults if missing)
        const [D, M, Y, h=0, m=0, s=0] = targetStr.split(/[-/ :]/);
        const target = new Date(Y, M-1, D, h, m, s).getTime();
        
        if (this.dom['full-date-display']) {
            this.dom['full-date-display'].innerText = new Date(target).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });
            this.dom['full-date-display'].style.display = "block";
        }
        
        const tick = () => {
            const dist = target - Date.now();
            if (dist <= 0) return this.showStatic(msg);
            
            const vals = {
                days: Math.floor(dist / 86400000),
                hours: Math.floor((dist % 86400000) / 3600000),
                minutes: Math.floor((dist % 3600000) / 60000),
                seconds: Math.floor((dist % 60000) / 1000)
            };
            
            Object.keys(vals).forEach(u => {
                const val = vals[u];
                if (this.dom[u] && this.state.last[u] !== val) {
                    this.state.last[u] = val;
                    this.dom[u].innerText = val.toString().padStart(2, '0');
                    if (u !== 'seconds') {
                        const isDue = (u==='days'&&vals.days===0) || (u==='hours'&&vals.days===0&&vals.hours===0) || (u==='minutes'&&vals.days===0&&vals.hours===0&&vals.minutes===0);
                        this.dom[u].classList.toggle('is-due', isDue);
                    }
                }
            });
            
            if (this.dom['countdown']) this.dom['countdown'].style.display = "flex";
            this.reveal();
        };
        
        tick();
        this.state.timer = setInterval(tick, 1000);
    },
    
    showStatic(msg) {
        if (this.state.timer) clearInterval(this.state.timer);
        
        if (this.dom['countdown']) {
            this.dom['countdown'].style.display = "flex";
            this.dom['countdown'].style.visibility = "hidden";
            this.dom['countdown'].style.opacity = "0";
        }
        
        if (this.dom['full-date-display']) this.dom['full-date-display'].style.display = "none";
        if (this.dom['description-display']) { 
            this.dom['description-display'].style.display = "block"; 
            this.dom['description-display'].innerText = msg; 
        }
        this.reveal();
    },
    
    reveal() {
        if (this.state.isRevealed) return;
        document.querySelectorAll(".sync-reveal").forEach(el => el.classList.add("reveal"));
        this.state.isRevealed = true;
    },
    
    renderSuri() {
        const last = sessionStorage.getItem('ls');
        let c; do { c = Math.floor(Math.random() * this.config.SURI_TOTAL) + 1; } while (c.toString() === last);
        sessionStorage.setItem('ls', c);
        if (this.dom['cat-perch']) this.dom['cat-perch'].innerHTML = `<div class="cat-image suri-${c}"></div>`;
    },
    
    initTheme() {
        const isL = localStorage.getItem('th') === 'l';
        if (isL) document.body.classList.add('light-mode');
        this.updIcons(isL);
        if (this.dom['theme-toggle']) {
            this.dom['theme-toggle'].onclick = () => {
                const l = document.body.classList.toggle('light-mode');
                localStorage.setItem('th', l ? 'l' : 'd');
                this.updIcons(l);
            };
        }
    },
    
    updIcons(l) {
        if (this.dom['sun-icon']) this.dom['sun-icon'].style.display = l ? 'block' : 'none';
        if (this.dom['moon-icon']) this.dom['moon-icon'].style.display = l ? 'none' : 'block';
    }
};

document.addEventListener('DOMContentLoaded', () => UI.init());
