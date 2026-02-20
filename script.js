const MOD_KEY = "scratch123"; // Change this for your own security

// 1. Access Control
function checkAccess() {
    const entered = document.getElementById('mod-key').value;
    if (entered === MOD_KEY) {
        document.getElementById('login-overlay').style.display = 'none';
        document.getElementById('dashboard').style.display = 'block';
    } else {
        document.getElementById('login-error').style.display = 'block';
    }
}

function logout() {
    location.reload();
}

// 2. Report Logic
document.getElementById('reportForm').addEventListener('submit', (e) => {
    e.preventDefault();
    const user = document.getElementById('offenderName').value;
    addToBanList(user);
    document.getElementById('reportForm').reset();
});

// 3. Database Management
function addToBanList(user) {
    let banned = JSON.parse(localStorage.getItem('scratch_bans')) || [];
    if (!banned.includes(user)) {
        banned.push(user);
        localStorage.setItem('scratch_bans', JSON.stringify(banned));
        renderTable();
    }
}

function unbanUser(user) {
    let banned = JSON.parse(localStorage.getItem('scratch_bans')) || [];
    banned = banned.filter(u => u !== user);
    localStorage.setItem('scratch_bans', JSON.stringify(banned));
    renderTable();
}

function renderTable() {
    const banned = JSON.parse(localStorage.getItem('scratch_bans')) || [];
    const container = document.getElementById('banList');
    container.innerHTML = banned.map(user => `
        <tr>
            <td><strong>${user}</strong></td>
            <td style="color: #FF4D4D;">Permanent Ban</td>
            <td><button onclick="unbanUser('${user}')" style="background:#575E75">Unban</button></td>
        </tr>
    `).join('');
}

// Load existing data on startup
renderTable();
