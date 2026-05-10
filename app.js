// ── LinkDrop App ──────────────────────────────────────────────
const STORAGE_KEY = 'linkdrop_links';

const CATEGORIES = [
  { id: 'education',      label: 'Education',      icon: 'school' },
  { id: 'cs_ai',         label: 'CS & AI',         icon: 'code' },
  { id: 'games',         label: 'Games',           icon: 'sports_esports' },
  { id: 'extracurricular', label: 'Extracurricular', icon: 'emoji_events' },
  { id: 'news',          label: 'News',            icon: 'newspaper' },
  { id: 'entertainment', label: 'Entertainment',   icon: 'play_circle' },
  { id: 'other',         label: 'Other',           icon: 'bookmark' },
];

// ── State ─────────────────────────────────────────────────────
let state = {
  links: [],
  search: '',
  filter: 'all',
  currentPage: 'home',
  formData: { url: '', title: '', category: 'other', note: '' },
  deleteTarget: null,
  openMenu: null,
};

// ── Storage ───────────────────────────────────────────────────
function loadLinks() {
  try { state.links = JSON.parse(localStorage.getItem(STORAGE_KEY)) || []; }
  catch { state.links = []; }
}
function saveLinks() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state.links));
}

// ── Helpers ───────────────────────────────────────────────────
function getDomain(url) {
  try { return new URL(url).hostname.replace('www.', ''); }
  catch { return url; }
}

function timeAgo(ts) {
  const diff = Date.now() - ts;
  const m = Math.floor(diff / 60000);
  const h = Math.floor(diff / 3600000);
  const d = Math.floor(diff / 86400000);
  if (m < 1) return 'Just now';
  if (m < 60) return `${m}m ago`;
  if (h < 24) return `${h}h ago`;
  if (d < 7) return `${d}d ago`;
  return new Date(ts).toLocaleDateString();
}

function uid() {
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

function getCategoryInfo(id) {
  return CATEGORIES.find(c => c.id === id) || CATEGORIES[CATEGORIES.length - 1];
}

function getDomainIcon(url) {
  const d = getDomain(url);
  if (d.includes('youtube') || d.includes('youtu.be')) return 'play_circle';
  if (d.includes('github')) return 'code';
  if (d.includes('twitter') || d.includes('x.com')) return 'tag';
  if (d.includes('reddit')) return 'forum';
  if (d.includes('medium')) return 'article';
  if (d.includes('instagram')) return 'photo_camera';
  if (d.includes('whatsapp')) return 'chat';
  if (d.includes('linkedin')) return 'work';
  if (d.includes('figma')) return 'palette';
  return 'language';
}

function showToast(msg, type = 'success') {
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.className = `toast ${type} show`;
  setTimeout(() => t.className = 'toast', 2500);
}

// ── Navigation ────────────────────────────────────────────────
function navigate(page) {
  state.currentPage = page;
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  document.getElementById(`page-${page}`)?.classList.add('active');
  document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
  const map = { home: 'nav-home', add: 'nav-add', settings: 'nav-settings' };
  if (map[page]) document.getElementById(map[page])?.classList.add('active');
  // Close any open menus
  state.openMenu = null;
  renderMenus();
}

// ── Render Home ───────────────────────────────────────────────
function getFilteredLinks() {
  return state.links.filter(l => {
    const q = state.search.toLowerCase();
    const matchSearch = !q || l.title.toLowerCase().includes(q) || l.url.toLowerCase().includes(q) || (l.note || '').toLowerCase().includes(q);
    const matchCat = state.filter === 'all' || l.category === state.filter;
    return matchSearch && matchCat;
  }).sort((a, b) => b.savedAt - a.savedAt);
}

function renderHome() {
  // Stats
  const statsEl = document.getElementById('stats-bar');
  const total = state.links.length;
  const todayCount = state.links.filter(l => Date.now() - l.savedAt < 86400000).length;
  statsEl.innerHTML = `
    <div class="stat-chip"><span class="material-symbols-outlined" style="font-size:15px">bookmark</span><strong>${total}</strong> saved</div>
    <div class="stat-chip"><span class="material-symbols-outlined" style="font-size:15px">today</span><strong>${todayCount}</strong> today</div>
    ${CATEGORIES.map(c => {
      const n = state.links.filter(l => l.category === c.id).length;
      return n ? `<div class="stat-chip"><span class="material-symbols-outlined" style="font-size:15px">${c.icon}</span><strong>${n}</strong> ${c.label}</div>` : '';
    }).join('')}
  `;

  // Pills
  const pillsEl = document.getElementById('category-pills');
  pillsEl.innerHTML = `
    <button class="pill ${state.filter === 'all' ? 'active' : ''}" onclick="setFilter('all')">All Links</button>
    ${CATEGORIES.map(c => `<button class="pill ${state.filter === c.id ? 'active' : ''}" onclick="setFilter('${c.id}')">${c.label}</button>`).join('')}
  `;

  // Cards
  const grid = document.getElementById('cards-grid');
  const filtered = getFilteredLinks();
  if (filtered.length === 0) {
    grid.innerHTML = `
      <div class="empty-state" style="grid-column:1/-1">
        <div class="empty-icon"><span class="material-symbols-outlined">link_off</span></div>
        <div class="empty-title">${state.search || state.filter !== 'all' ? 'No matches found' : 'No links yet'}</div>
        <p class="empty-sub">${state.search || state.filter !== 'all' ? 'Try a different search or category.' : 'Share any link to LinkDrop or tap + to add one manually.'}</p>
        ${(!state.search && state.filter === 'all') ? `<button class="empty-cta" onclick="navigate('add')">Add your first link</button>` : ''}
      </div>`;
    return;
  }
  grid.innerHTML = filtered.map((l, i) => {
    const cat = getCategoryInfo(l.category);
    return `
      <article class="link-card card-enter" style="animation-delay:${i * 0.04}s" onclick="openLink('${l.id}', event)">
        <div class="card-top">
          <span class="cat-badge">${cat.label}</span>
          <div style="position:relative">
            <button class="card-menu-btn" id="menu-btn-${l.id}" onclick="toggleMenu('${l.id}', event)">
              <span class="material-symbols-outlined">more_horiz</span>
            </button>
            <div class="card-menu" id="menu-${l.id}">
              <button class="card-menu-item" onclick="openLinkUrl('${l.id}', event)">
                <span class="material-symbols-outlined" style="font-size:18px">open_in_new</span> Open link
              </button>
              <button class="card-menu-item" onclick="copyLink('${l.id}', event)">
                <span class="material-symbols-outlined" style="font-size:18px">content_copy</span> Copy URL
              </button>
              <button class="card-menu-item danger" onclick="confirmDelete('${l.id}', event)">
                <span class="material-symbols-outlined" style="font-size:18px">delete</span> Delete
              </button>
            </div>
          </div>
        </div>
        <div>
          <h2 class="card-title">${escHtml(l.title)}</h2>
          ${l.note ? `<p class="card-note" style="margin-top:6px">${escHtml(l.note)}</p>` : ''}
        </div>
        <div class="card-footer">
          <div class="card-domain">
            <div class="domain-icon"><span class="material-symbols-outlined">${getDomainIcon(l.url)}</span></div>
            <span class="domain-text">${escHtml(getDomain(l.url))}</span>
          </div>
          <span class="card-time">${timeAgo(l.savedAt)}</span>
        </div>
      </article>`;
  }).join('');
}

function escHtml(s) {
  return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

function setFilter(cat) { state.filter = cat; renderHome(); }

function openLink(id, e) {
  if (e.target.closest('.card-menu-btn') || e.target.closest('.card-menu')) return;
  const l = state.links.find(x => x.id === id);
  if (l) window.open(l.url, '_blank', 'noopener');
}
function openLinkUrl(id, e) {
  e.stopPropagation();
  const l = state.links.find(x => x.id === id);
  if (l) window.open(l.url, '_blank', 'noopener');
  closeMenu();
}
function copyLink(id, e) {
  e.stopPropagation();
  const l = state.links.find(x => x.id === id);
  if (l) navigator.clipboard?.writeText(l.url).then(() => showToast('URL copied!')).catch(() => {});
  closeMenu();
}
function confirmDelete(id, e) {
  e.stopPropagation();
  state.deleteTarget = id;
  closeMenu();
  document.getElementById('modal').classList.add('open');
}
function closeMenu() { state.openMenu = null; renderMenus(); }
function renderMenus() {
  document.querySelectorAll('.card-menu').forEach(m => m.classList.remove('open'));
  if (state.openMenu) document.getElementById(`menu-${state.openMenu}`)?.classList.add('open');
}
function toggleMenu(id, e) {
  e.stopPropagation();
  state.openMenu = state.openMenu === id ? null : id;
  renderMenus();
}
document.addEventListener('click', () => { if (state.openMenu) { state.openMenu = null; renderMenus(); } });

// ── Delete Modal ──────────────────────────────────────────────
function doDelete() {
  if (!state.deleteTarget) return;
  state.links = state.links.filter(l => l.id !== state.deleteTarget);
  saveLinks();
  state.deleteTarget = null;
  document.getElementById('modal').classList.remove('open');
  renderHome();
  showToast('Link deleted');
}
function cancelDelete() {
  state.deleteTarget = null;
  document.getElementById('modal').classList.remove('open');
}

// ── Add / Share-Target Form ───────────────────────────────────
function initFormPage(urlPrefill = '', titlePrefill = '') {
  state.formData = { url: urlPrefill, title: titlePrefill, category: 'other', note: '' };
  const urlInput = document.getElementById('form-url');
  const titleInput = document.getElementById('form-title');
  const noteInput = document.getElementById('form-note');
  if (urlInput) urlInput.value = urlPrefill;
  if (titleInput) titleInput.value = titlePrefill;
  if (noteInput) noteInput.value = '';
  renderCatPills('form-cats', 'other');
}

function renderCatPills(containerId, selected) {
  const el = document.getElementById(containerId);
  if (!el) return;
  el.innerHTML = CATEGORIES.map(c => `
    <button class="cat-pill ${selected === c.id ? 'active' : ''}" onclick="selectCat('${c.id}', '${containerId}')">
      <span class="material-symbols-outlined" style="font-size:14px;vertical-align:middle;margin-right:4px">${c.icon}</span>${c.label}
    </button>`).join('');
}

function selectCat(id, containerId) {
  state.formData.category = id;
  renderCatPills(containerId, id);
}

function saveLink(fromShare = false) {
  const url = document.getElementById('form-url')?.value.trim();
  const title = document.getElementById('form-title')?.value.trim();
  const note = document.getElementById('form-note')?.value.trim();

  if (!url) { showToast('Please enter a URL', 'error'); return; }
  if (!title) { showToast('Please enter a title', 'error'); return; }

  const link = {
    id: uid(),
    url: url.startsWith('http') ? url : 'https://' + url,
    title,
    category: state.formData.category || 'other',
    note: note || '',
    savedAt: Date.now(),
  };
  state.links.unshift(link);
  saveLinks();
  showToast('Link saved! 🎉');
  navigate('home');
  state.filter = 'all';
  state.search = '';
  document.getElementById('search-input').value = '';
  renderHome();
}

// ── Share Target Handler ──────────────────────────────────────
function handleShareTarget() {
  const params = new URLSearchParams(window.location.search);
  const url = params.get('url') || params.get('text') || '';
  const title = params.get('title') || '';
  // Clear URL without reload
  window.history.replaceState({}, '', '/share-target');
  navigate('share');
  document.getElementById('share-form-url').value = url;
  document.getElementById('share-form-title').value = title;
  state.formData = { url, title, category: 'other', note: '' };
  renderCatPills('share-cats', 'other');
}

function saveSharedLink() {
  const url = document.getElementById('share-form-url')?.value.trim();
  const title = document.getElementById('share-form-title')?.value.trim();
  const note = document.getElementById('share-form-note')?.value.trim();

  if (!url) { showToast('No URL found', 'error'); return; }
  if (!title) { showToast('Please enter a title', 'error'); return; }

  const link = {
    id: uid(),
    url: url.startsWith('http') ? url : 'https://' + url,
    title,
    category: state.formData.category || 'other',
    note: note || '',
    savedAt: Date.now(),
  };
  state.links.unshift(link);
  saveLinks();
  showToast('Link saved! 🎉');
  navigate('home');
  state.filter = 'all';
  renderHome();
  window.history.replaceState({}, '', '/');
}

// ── Settings Page ─────────────────────────────────────────────
function renderSettings() {
  const total = state.links.length;
  const byCategory = CATEGORIES.map(c => ({
    ...c, count: state.links.filter(l => l.category === c.id).length
  })).filter(c => c.count > 0);

  document.getElementById('settings-total').textContent = total;
  document.getElementById('settings-cat-list').innerHTML = byCategory.map(c => `
    <div style="display:flex;align-items:center;justify-content:space-between;padding:12px 0;border-bottom:1px solid rgba(190,202,183,0.2)">
      <div style="display:flex;align-items:center;gap:10px">
        <div style="width:36px;height:36px;border-radius:50%;background:rgba(0,108,12,0.1);display:flex;align-items:center;justify-content:center">
          <span class="material-symbols-outlined" style="font-size:18px;color:var(--primary)">${c.icon}</span>
        </div>
        <span style="font-size:15px;font-weight:500">${c.label}</span>
      </div>
      <span style="font-size:13px;color:var(--on-surface-var);font-weight:600">${c.count}</span>
    </div>`).join('') || '<p style="color:var(--on-surface-var);font-size:14px;text-align:center;padding:20px">No links saved yet.</p>';
}

function clearAllLinks() {
  if (!confirm('Delete ALL saved links? This cannot be undone.')) return;
  state.links = [];
  saveLinks();
  renderHome();
  renderSettings();
  showToast('All links cleared');
}

function exportLinks() {
  const json = JSON.stringify(state.links, null, 2);
  const blob = new Blob([json], { type: 'application/json' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = 'linkdrop-export.json';
  a.click();
}

function importLinks(e) {
  const file = e.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = (ev) => {
    try {
      const data = JSON.parse(ev.target.result);
      if (Array.isArray(data)) {
        state.links = [...data, ...state.links];
        saveLinks();
        renderHome();
        renderSettings();
        showToast(`Imported ${data.length} links!`);
      }
    } catch { showToast('Invalid file', 'error'); }
  };
  reader.readAsText(file);
}

// ── Init ──────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  loadLinks();

  // Register SW
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/sw.js').catch(() => {});
  }

  // Route based on URL
  const path = window.location.pathname;
  if (path === '/share-target') {
    handleShareTarget();
  } else if (path === '/add') {
    navigate('add');
    initFormPage();
  } else {
    navigate('home');
    renderHome();
  }

  // Search input
  document.getElementById('search-input').addEventListener('input', (e) => {
    state.search = e.target.value;
    renderHome();
  });

  // Form inputs sync
  document.getElementById('form-url')?.addEventListener('input', e => state.formData.url = e.target.value);
  document.getElementById('form-title')?.addEventListener('input', e => state.formData.title = e.target.value);

  // PWA install prompt
  let deferredPrompt;
  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPrompt = e;
    const btn = document.getElementById('install-btn');
    if (btn) btn.style.display = 'flex';
  });
  document.getElementById('install-btn')?.addEventListener('click', () => {
    deferredPrompt?.prompt();
    deferredPrompt = null;
    document.getElementById('install-btn').style.display = 'none';
  });

  // Initial settings render
  renderSettings();
});
