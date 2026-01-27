// Minimal frontend to list and create users via /api/users (legacy copy)
const usersListEl = document.getElementById('usersList');
const form = document.getElementById('userForm');
const statusEl = document.getElementById('formStatus');

async function fetchUsers() {
  usersListEl.textContent = 'Loading…';
  try {
    const res = await fetch('/api/users');
    if (!res.ok) throw new Error('Fetch failed: ' + res.status);
    const users = await res.json();
    renderUsers(users);
  } catch (err) {
    usersListEl.innerHTML = '<div class="error">Error loading users: ' + err.message + '</div>';
  }
}

function renderUsers(users) {
  if (!users || users.length === 0) {
    usersListEl.innerHTML = '<div class="muted">No users found</div>';
    return;
  }
  const html = users.map(u => `
    <div class="user">
      <div class="name">${escapeHtml(u.name)}</div>
      <div class="meta">${escapeHtml(u.email)} • ₹${Number(u.monthlyIncome).toFixed(2)}</div>
    </div>
  `).join('');
  usersListEl.innerHTML = html;
}

function escapeHtml(s){ return String(s||'').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c])); }

form.addEventListener('submit', async (e) => {
  e.preventDefault();
  statusEl.textContent = '';
  const fd = new FormData(form);
  const payload = {
    name: fd.get('name'),
    email: fd.get('email'),
    monthlyIncome: Number(fd.get('monthlyIncome'))
  };
  try {
    const res = await fetch('/api/users', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    if (!res.ok) throw new Error('Create failed: ' + res.status + ' ' + await res.text());
    const created = await res.json();
    statusEl.textContent = 'Created user id: ' + created.id;
    form.reset();
    fetchUsers();
  } catch (err) {
    statusEl.textContent = 'Error: ' + err.message;
    statusEl.classList.add('error');
  }
});

// Initial load
fetchUsers();
