const API_BASE = "http://localhost:5500/api";
let token = localStorage.getItem('token');

// Selectors
const loginContainer = document.getElementById('login-container');
const dashboardContainer = document.getElementById('dashboard-container');
const loginForm = document.getElementById('login-form');
const navLinks = document.querySelectorAll('.nav-links li');
const sections = document.querySelectorAll('.dashboard-section');

// Init
if (token) {
    showDashboard();
}

// Authentication
loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    try {
        const res = await fetch(`${API_BASE}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });
        const data = await res.json();
        if (res.ok) {
            token = data.token;
            localStorage.setItem('token', token);
            showDashboard();
        } else {
            alert(data.error);
        }
    } catch (err) {
        alert("Connection failed");
    }
});

document.getElementById('logout-btn').addEventListener('click', () => {
    localStorage.removeItem('token');
    location.reload();
});

function showDashboard() {
    loginContainer.classList.add('hidden');
    dashboardContainer.classList.remove('hidden');
    document.body.style.alignItems = 'stretch';
    loadOverview();
}

// Navigation
navLinks.forEach(link => {
    link.addEventListener('click', () => {
        const target = link.dataset.section;
        navLinks.forEach(l => l.classList.remove('active'));
        link.classList.add('active');

        sections.forEach(s => s.classList.add('hidden'));
        document.getElementById(target).classList.remove('hidden');
        document.getElementById('section-title').innerText = target.charAt(0).toUpperCase() + target.slice(1);

        if (target === 'prizes') loadPrizes();
        if (target === 'tickets') loadTickets();
        if (target === 'winners') loadWinners();
    });
});

// Winners Management
async function loadWinners() {
    const winners = await fetchAPI('/winners');
    const tbody = document.querySelector('#winners-table tbody');
    tbody.innerHTML = '';
    
    winners.forEach(w => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${w.prize ? w.prize.name : 'No Prize'}</td>
            <td>${w.ticket.ticketNumber}</td>
            <td>${w.ticket.name}</td>
            <td>${new Date(w.createdAt).toLocaleString()}</td>
        `;
        tbody.appendChild(tr);
    });
}

document.getElementById('export-xlsx-btn').addEventListener('click', async () => {
    const res = await fetch(`${API_BASE}/winners/export`, {
        headers: { 'Authorization': `Bearer ${token}` }
    });
    const blob = await res.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'winners.xlsx';
    a.click();
});

document.getElementById('export-csv-btn').addEventListener('click', async () => {
    const res = await fetch(`${API_BASE}/winners/export/csv`, {
        headers: { 'Authorization': `Bearer ${token}` }
    });
    const blob = await res.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'winners.csv';
    a.click();
});

// Overview Data
async function loadOverview() {
    const stats = await fetchAPI('/dashboard/stats');
    if (stats) {
        document.getElementById('stat-prizes').innerText = stats.totalPrizes || 0;
        document.getElementById('stat-tickets').innerText = stats.totalTickets || 0;
        document.getElementById('stat-winners').innerText = stats.totalWinners || 0;
    }
}

// Prizes CRUD
async function loadPrizes() {
    const prizes = await fetchAPI('/prizes');
    const tbody = document.querySelector('#prizes-table tbody');
    tbody.innerHTML = '';
    
    prizes.forEach(p => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${p.id}</td>
            <td>${p.name}</td>
            <td>${p.status}</td>
            <td>
                <button class="btn-secondary" onclick="editPrize(${p.id}, '${p.name}')">Edit</button>
                <button class="btn-secondary" onclick="deletePrize(${p.id})">Delete</button>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

document.getElementById('add-prize-btn').addEventListener('click', () => {
    document.getElementById('modal-title').innerText = 'Add Prize';
    document.getElementById('prize-id').value = '';
    document.getElementById('prize-name').value = '';
    document.getElementById('prize-modal').classList.remove('hidden');
});

async function editPrize(id, name) {
    document.getElementById('modal-title').innerText = 'Edit Prize';
    document.getElementById('prize-id').value = id;
    document.getElementById('prize-name').value = name;
    document.getElementById('prize-modal').classList.remove('hidden');
}

document.getElementById('prize-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const id = document.getElementById('prize-id').value;
    const name = document.getElementById('prize-name').value;
    
    const method = id ? 'PUT' : 'POST';
    const url = id ? `/prizes/${id}` : '/prizes';

    const res = await fetchAPI(url, method, { name });
    if (res) {
        closeModal();
        loadPrizes();
        loadOverview();
    }
});

async function deletePrize(id) {
    if (confirm('Are you sure?')) {
        await fetchAPI(`/prizes/${id}`, 'DELETE');
        loadPrizes();
        loadOverview();
    }
}

function closeModal() {
    document.getElementById('prize-modal').classList.add('hidden');
}

// Tickets Management
async function loadTickets(search = '') {
    const tickets = await fetchAPI(`/tickets?search=${search}`);
    const tbody = document.querySelector('#tickets-table tbody');
    tbody.innerHTML = '';
    tickets.forEach(t => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${t.ticketNumber}</td>
            <td>${t.name}</td>
            <td>${t.isWinner ? '🏆 Winner' : 'Eligible'}</td>
        `;
        tbody.appendChild(tr);
    });
}

document.getElementById('ticket-search').addEventListener('input', (e) => {
    loadTickets(e.target.value);
});

document.getElementById('ticket-file').addEventListener('change', async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);

    const res = await fetch(`${API_BASE}/tickets/upload`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: formData
    });
    const data = await res.json();
    if (res.ok) {
        alert(`Success! Uploaded: ${data.uploaded}, Duplicates: ${data.duplicates}`);
        loadTickets();
        loadOverview();
    } else {
        alert(data.error);
    }
});

// Helper
async function fetchAPI(endpoint, method = 'GET', body = null) {
    const options = {
        method,
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        }
    };
    if (body) options.body = JSON.stringify(body);

    try {
        const res = await fetch(`${API_BASE}${endpoint}`, options);
        const data = await res.json();
        if (res.ok) return data;
        alert(data.error || 'Request failed');
    } catch (err) {
        alert("Connection error");
    }
    return null;
}
