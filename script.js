const MOD_KEY = "scratch123";
let currentMod = "";
let trainingInterval;
let activeNoteUser = "";

// --- ACCESS & THEME ---
function checkAccess() {
    const name = document.getElementById('mod-name').value;
    const key = document.getElementById('mod-key').value;
    if (key === MOD_KEY && name.trim() !== "") {
        currentMod = name;
        document.getElementById('login-overlay').style.display = 'none';
        document.getElementById('dashboard').style.display = 'block';
        initDashboard();
    } else { document.getElementById('login-error').style.display = 'block'; }
}

function changeTheme(t) {
    t === 'default' ? document.documentElement.removeAttribute('data-theme') : document.documentElement.setAttribute('data-theme', t);
    localStorage.setItem('mod_theme', t);
}

// --- MODERATION LOGIC ---
document.getElementById('reportForm').addEventListener('submit', (e) => {
    e.preventDefault();
    if (isLocked()) return;
    const user = document.getElementById('offenderName').value;
    const reason = document.getElementById('reportReason').value;
    const content = (user + " " + reason).toLowerCase();
    
    if (["spam", "hack"].some(w => content.includes(w))) {
        autoShadowBan(user, "Auto-Mod: Keyword Detected");
    } else {
        addToBanList(user, reason);
    }
    document.getElementById('reportForm').reset();
});

function addToBanList(user, reason) {
    let bans = JSON.parse(localStorage.getItem('scratch_bans')) || [];
    if (!bans.some(b => b.user === user)) {
        bans.push({ user, reason, mod: currentMod, date: new Date().toLocaleString() });
        localStorage.setItem('scratch_bans', JSON.stringify(bans));
        trackAction();
        addLogEntry(`BANNED: ${user} by ${currentMod}`);
        renderAll();
    }
}

function shadowBanUser() {
    if (isLocked()) return;
    const user = document.getElementById('offenderName').value;
    const reason = document.getElementById('reportReason').value;
    let shadows = JSON.parse(localStorage.getItem('scratch_shadows')) || [];
    shadows.push({ user, reason, mod: currentMod });
    localStorage.setItem('scratch_shadows', JSON.stringify(shadows));
    trackAction();
    renderAll();
}

// --- BADGE & LEADERBOARD ---
function trackAction() {
    let scores = JSON.parse(localStorage.getItem('mod_scores')) || {};
    scores[currentMod] = (scores[currentMod] || 0) + 1;
    localStorage.setItem('mod_scores', JSON.stringify(scores));
    renderLeaderboard();
}

function renderLeaderboard() {
    const scores = JSON.parse(localStorage.getItem('mod_scores')) || {};
    const sorted = Object.entries(scores).sort((a,b) => b[1] - a[1]);
    document.getElementById('leaderboardList').innerHTML = sorted.map(([name, val]) => {
        let badge = val >= 50 ? '<span class="badge">⭐️ Senior Mod</span>' : '';
        return `<tr><td><strong>${name}</strong>${badge}</td><td>${val} Actions</td></tr>`;
    }).join('');
}

// --- SYSTEM TOOLS ---
function toggleLockdown() {
    let s = !JSON.parse(localStorage.getItem('mod_lockdown'));
    localStorage.setItem('mod_lockdown', JSON.stringify(s));
    addLogEntry(`LOCKDOWN: ${s ? 'ON' : 'OFF'}`);
    applyLockdownUI();
}

function isLocked() { 
    if(JSON.parse(localStorage.getItem('mod_lockdown'))) { alert("System Locked!"); return true; } 
    return false;
}

function applyLockdownUI() {
    let s = JSON.parse(localStorage.getItem('mod_lockdown'));
    document.getElementById('lockdown-banner').style.display = s ? 'block' : 'none';
    document.querySelectorAll('input, button:not(#lockdown-btn)').forEach(el => el.disabled = s);
}

// --- INITIALIZATION ---
function renderAll() {
    // Renders Ban Table
    const bans = JSON.parse(localStorage.getItem('scratch_bans')) || [];
    document.getElementById('banList').innerHTML = bans.map(b => `<tr><td onclick="openNotes('${b.user}')" style="cursor:pointer; color:var(--primary)">${b.user}</td><td><button onclick="unban('${b.user}')">Unban</button></td></tr>`).join('');
    
    // Renders Shadows
    const shadows = JSON.parse(localStorage.getItem('scratch_shadows')) || [];
    document.getElementById('shadowList').innerHTML = shadows.map(s => `<tr><td>${s.user}</td><td><button onclick="unshadow('${s.user}')">Clear</button></td></tr>`).join('');
    
    renderLeaderboard();
}

function initDashboard() {
    initTheme();
    renderAll();
    setInterval(applyLockdownUI, 2000);
}

function initTheme() {
    const t = localStorage.getItem('mod_theme') || 'default';
    changeTheme(t);
}

function addLogEntry(msg) {
    let logs = JSON.parse(localStorage.getItem('mod_logs')) || [];
    logs.unshift(`${new Date().toLocaleTimeString()}: ${msg}`);
    localStorage.setItem('mod_logs', JSON.stringify(logs.slice(0,20)));
    document.getElementById('modLog').innerHTML = logs.map(l => `<div>${l}</div>`).join('');
}

// Helper functions for UI toggles
window.unban = (u) => { 
    let bans = JSON.parse(localStorage.getItem('scratch_bans')).filter(b => b.user !== u);
    localStorage.setItem('scratch_bans', JSON.stringify(bans)); renderAll(); 
};
window.toggleView = (v) => {
    document.getElementById('dashboard').style.display = v==='mod' ? 'block' : 'none';
    document.getElementById('appeal-view').style.display = v==='user' ? 'block' : 'none';
};
