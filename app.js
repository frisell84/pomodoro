// ── State ──────────────────────────────────────────────────────────
const CATEGORIES = [
  { id: 'study',  label: 'STUDIE',  icon: '📚' },
  { id: 'code',   label: 'KOD',     icon: '💻' },
  { id: 'write',  label: 'SKRIVA',  icon: '✍️' },
  { id: 'read',   label: 'LÄSA',    icon: '📖' },
  { id: 'other',  label: 'ÖVRIGT',  icon: '◆' },
];

const PRESETS = [
  { label: '25 MIN', minutes: 25 },
  { label: '50 MIN', minutes: 50 },
  { label: '90 MIN', minutes: 90 },
];

const WEEKDAYS = ['MÅN','TIS','ONS','TOR','FRE','LÖR','SÖN'];

let state = {
  category: 'study',
  totalSeconds: 25 * 60,
  remaining: 25 * 60,
  running: false,
  completed: false,
  sessions: loadSessions(),
};

let timerInterval = null;
let deferredPrompt = null;

// ── Storage ─────────────────────────────────────────────────────────
function loadSessions() {
  try { return JSON.parse(localStorage.getItem('focus_sessions') || '[]'); }
  catch { return []; }
}
function saveSessions() {
  localStorage.setItem('focus_sessions', JSON.stringify(state.sessions));
}

// ── Date helpers ─────────────────────────────────────────────────────
function todayKey() {
  return new Date().toISOString().split('T')[0];
}
function weekKey(date = new Date()) {
  const d = new Date(date);
  d.setHours(0,0,0,0);
  d.setDate(d.getDate() - (d.getDay() === 0 ? 6 : d.getDay() - 1));
  return d.toISOString().split('T')[0];
}
function getWeekDays() {
  const today = new Date();
  const dow = today.getDay();
  const monday = new Date(today);
  monday.setDate(today.getDate() - (dow === 0 ? 6 : dow - 1));
  monday.setHours(0,0,0,0);
  return WEEKDAYS.map((label, i) => {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    return { label, key: d.toISOString().split('T')[0] };
  });
}

// ── Timer logic ──────────────────────────────────────────────────────
function toggleTimer() {
  if (state.completed) {
    state.completed = false;
    state.remaining = state.totalSeconds;
    renderTimer();
  }
  state.running = !state.running;
  if (state.running) {
    startInterval();
  } else {
    stopInterval();
  }
  renderTimer();
}

function startInterval() {
  stopInterval();
  timerInterval = setInterval(() => {
    state.remaining--;
    if (state.remaining <= 0) {
      state.remaining = 0;
      state.running = false;
      state.completed = true;
      stopInterval();
      logSession();
      sendNotification();
      showToast('✓ SESSION KLAR — BRA JOBBAT!');
    }
    renderTimer();
    updateStatusBar();
  }, 1000);
}

function stopInterval() {
  clearInterval(timerInterval);
  timerInterval = null;
}

function resetTimer() {
  stopInterval();
  state.running = false;
  state.completed = false;
  state.remaining = state.totalSeconds;
  renderTimer();
}

function setPreset(minutes) {
  stopInterval();
  state.running = false;
  state.completed = false;
  state.totalSeconds = minutes * 60;
  state.remaining = minutes * 60;
  renderTimer();
  renderPresets();
}

function setCategory(id) {
  state.category = id;
  renderCategories();
}

// ── Session logging ───────────────────────────────────────────────────
function logSession() {
  const session = {
    id: Date.now(),
    category: state.category,
    minutes: Math.round(state.totalSeconds / 60),
    date: todayKey(),
    week: weekKey(),
    ts: new Date().toISOString(),
  };
  state.sessions.push(session);
  saveSessions();
}

// ── Notifications ─────────────────────────────────────────────────────
async function requestNotificationPermission() {
  if ('Notification' in window && Notification.permission === 'default') {
    await Notification.requestPermission();
  }
}

function sendNotification() {
  if ('Notification' in window && Notification.permission === 'granted') {
    const cat = CATEGORIES.find(c => c.id === state.category);
    new Notification('FOCUS // Session klar!', {
      body: `${cat.icon} ${cat.label} — ${Math.round(state.totalSeconds/60)} min slutförd. Gå djupt, inte fort.`,
      icon: 'icons/icon-192.png',
      badge: 'icons/icon-192.png',
    });
  }
}

// ── Rendering ─────────────────────────────────────────────────────────
function pad(n) { return String(n).padStart(2, '0'); }

function renderTimer() {
  const mm = pad(Math.floor(state.remaining / 60));
  const ss = pad(state.remaining % 60);
  document.getElementById('clock-mm').textContent = mm;
  document.getElementById('clock-ss').textContent = ss;

  const display = document.getElementById('clock-display');
  display.className = 'clock-display';
  if (state.completed) display.classList.add('complete');
  else if (state.running) display.classList.add('running');

  const colon = document.getElementById('colon');
  colon.className = 'colon';
  if (!state.running) colon.classList.add('paused');

  const progress = 1 - (state.remaining / state.totalSeconds);
  document.getElementById('progress-fill').style.width = `${progress * 100}%`;

  const btn = document.getElementById('btn-start');
  if (state.completed) {
    btn.textContent = '↺ KÖR IGEN';
    btn.classList.remove('paused');
  } else if (state.running) {
    btn.textContent = '❙❙ PAUS';
    btn.classList.add('paused');
  } else {
    btn.textContent = '▶ START';
    btn.classList.remove('paused');
  }

  const msg = document.getElementById('complete-msg');
  msg.textContent = state.completed ? '▲ SESSION SLUTFÖRD ▲' : '';

  const dot = document.getElementById('status-dot');
  const statusText = document.getElementById('status-text');
  if (state.running) {
    dot.classList.add('active');
    statusText.textContent = 'AKTIV';
  } else {
    dot.classList.remove('active');
    statusText.textContent = state.completed ? 'KLAR' : 'STANDBY';
  }
}

function renderCategories() {
  const el = document.getElementById('cat-buttons');
  el.innerHTML = CATEGORIES.map(c => `
    <button class="cat-btn${state.category === c.id ? ' active' : ''}"
      onclick="setCategory('${c.id}')">${c.icon} ${c.label}</button>
  `).join('');
}

function renderPresets() {
  const el = document.getElementById('preset-buttons');
  el.innerHTML = PRESETS.map(p => `
    <button class="preset-btn${state.totalSeconds === p.minutes * 60 ? ' active' : ''}"
      onclick="setPreset(${p.minutes})">${p.label}</button>
  `).join('');
}

function updateStatusBar() {
  const today = todayKey();
  const week  = weekKey();
  const todayMin = state.sessions
    .filter(s => s.date === today)
    .reduce((a, b) => a + b.minutes, 0);
  const weekMin = state.sessions
    .filter(s => s.week === week)
    .reduce((a, b) => a + b.minutes, 0);
  document.getElementById('stat-today').textContent = `IDAG: ${todayMin} MIN`;
  document.getElementById('stat-week').textContent  = `VECKA: ${weekMin} MIN`;
}

// ── Stats screen ──────────────────────────────────────────────────────
function renderStats() {
  const today = todayKey();
  const week  = weekKey();
  const weekSessions  = state.sessions.filter(s => s.week === week);
  const todaySessions = state.sessions.filter(s => s.date === today);
  const weekMin  = weekSessions.reduce((a,b) => a + b.minutes, 0);
  const todayMin = todaySessions.reduce((a,b) => a + b.minutes, 0);
  const weekDays = getWeekDays();
  const totalMin = state.sessions.reduce((a,b) => a + b.minutes, 0);

  // Header
  const now = new Date();
  document.getElementById('stats-header').textContent =
    `◈ VECKORAPPORT — V${getWeekNumber(now)} ${now.getFullYear()}`;

  // Summary
  document.getElementById('summary-grid').innerHTML = `
    <div class="summary-card">
      <span class="s-label">IDAG</span>
      <div class="s-value">${todayMin}</div>
      <div class="s-sub">${todaySessions.length} sess.</div>
    </div>
    <div class="summary-card">
      <span class="s-label">VECKA</span>
      <div class="s-value">${weekMin}</div>
      <div class="s-sub">${weekSessions.length} sess.</div>
    </div>
    <div class="summary-card">
      <span class="s-label">TOTALT</span>
      <div class="s-value">${totalMin}</div>
      <div class="s-sub">${state.sessions.length} sess.</div>
    </div>
  `;

  // Bar chart
  const byDay = weekDays.map(d => ({
    ...d,
    minutes: state.sessions.filter(s => s.date === d.key).reduce((a,b) => a + b.minutes, 0),
  }));
  const maxMin = Math.max(...byDay.map(d => d.minutes), 1);
  const chartEl = document.getElementById('bar-chart');
  chartEl.innerHTML = byDay.map(d => {
    const isToday = d.key === today;
    const barH = d.minutes > 0 ? Math.max(4, (d.minutes / maxMin) * 55) : 0;
    return `
      <div class="bar-col">
        <div class="bar-val">${d.minutes > 0 ? d.minutes : ''}</div>
        <div class="bar-fill${isToday ? ' today' : ''}" style="height:${barH}px"></div>
        <div class="bar-day${isToday ? ' today' : ''}">${d.label}</div>
      </div>
    `;
  }).join('');

  // Category breakdown
  const byCat = CATEGORIES.map(c => ({
    ...c,
    minutes: weekSessions.filter(s => s.category === c.id).reduce((a,b) => a + b.minutes, 0),
  })).filter(c => c.minutes > 0).sort((a,b) => b.minutes - a.minutes);

  const catEl = document.getElementById('cat-stats');
  if (byCat.length > 0) {
    catEl.innerHTML = `
      <span class="section-label" style="margin-top:14px;display:block">KATEGORIER DENNA VECKA:</span>
      ${byCat.map(c => `
        <div class="cat-row">
          <div class="cat-row-header">
            <span class="cat-row-name">${c.icon} ${c.label}</span>
            <span class="cat-row-val">${c.minutes} MIN</span>
          </div>
          <div class="cat-bar-bg">
            <div class="cat-bar-fill" style="width:${(c.minutes/weekMin)*100}%"></div>
          </div>
        </div>
      `).join('')}
    `;
  } else {
    catEl.innerHTML = '';
  }

  // Recent sessions
  const recentEl = document.getElementById('recent-sessions');
  const recent = [...state.sessions].reverse().slice(0, 12);
  if (recent.length > 0) {
    recentEl.innerHTML = `
      <span class="section-label" style="margin-top:14px;display:block">SENASTE SESSIONER:</span>
      <div class="sessions-list">
        ${recent.map(s => {
          const cat = CATEGORIES.find(c => c.id === s.category);
          const d = new Date(s.ts);
          const timeStr = `${pad(d.getHours())}:${pad(d.getMinutes())}`;
          return `
            <div class="session-row">
              <span>${s.date.slice(5)} ${timeStr}</span>
              <span>${cat ? cat.icon + ' ' + cat.label : s.category}</span>
              <span>${s.minutes} MIN</span>
            </div>
          `;
        }).join('')}
      </div>
    `;
  } else {
    recentEl.innerHTML = `<div class="empty">INGA SESSIONER ÄNNU<br><span style="font-size:8px">Starta en fokus-session →</span></div>`;
  }
}

function getWeekNumber(d) {
  const date = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
  date.setUTCDate(date.getUTCDate() + 4 - (date.getUTCDay() || 7));
  const yearStart = new Date(Date.UTC(date.getUTCFullYear(), 0, 1));
  return Math.ceil((((date - yearStart) / 86400000) + 1) / 7);
}

// ── Screen switching ──────────────────────────────────────────────────
function showScreen(name) {
  document.getElementById('screen-timer').style.display = name === 'timer' ? '' : 'none';
  document.getElementById('screen-stats').style.display = name === 'stats' ? '' : 'none';
  document.getElementById('nav-timer').classList.toggle('active', name === 'timer');
  document.getElementById('nav-stats').classList.toggle('active', name === 'stats');
  if (name === 'stats') renderStats();
}

// ── Clear data ────────────────────────────────────────────────────────
function clearData() {
  if (confirm('Rensa ALL loggad data? Detta kan inte ångras.')) {
    state.sessions = [];
    saveSessions();
    renderStats();
    updateStatusBar();
    showToast('DATA RENSAD');
  }
}

// ── Toast ─────────────────────────────────────────────────────────────
let toastTimeout;
function showToast(msg) {
  const el = document.getElementById('toast');
  el.textContent = msg;
  el.style.display = 'block';
  clearTimeout(toastTimeout);
  toastTimeout = setTimeout(() => { el.style.display = 'none'; }, 3000);
}

// ── PWA install ───────────────────────────────────────────────────────
window.addEventListener('beforeinstallprompt', (e) => {
  e.preventDefault();
  deferredPrompt = e;
  document.getElementById('install-banner').style.display = 'block';
});

document.getElementById('install-btn').addEventListener('click', async () => {
  if (!deferredPrompt) return;
  deferredPrompt.prompt();
  const result = await deferredPrompt.userChoice;
  deferredPrompt = null;
  document.getElementById('install-banner').style.display = 'none';
  if (result.outcome === 'accepted') showToast('✓ APP INSTALLERAD');
});

document.getElementById('dismiss-install').addEventListener('click', () => {
  document.getElementById('install-banner').style.display = 'none';
});

// ── Service Worker registration ───────────────────────────────────────
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('sw.js')
      .then(() => console.log('SW registered'))
      .catch(err => console.warn('SW failed:', err));
  });
}

// ── Init ──────────────────────────────────────────────────────────────
renderCategories();
renderPresets();
renderTimer();
updateStatusBar();
requestNotificationPermission();

// Title ticker when running
setInterval(() => {
  if (state.running) {
    const mm = pad(Math.floor(state.remaining / 60));
    const ss = pad(state.remaining % 60);
    document.title = `${mm}:${ss} — FOCUS`;
  } else {
    document.title = 'FOCUS // Deep Work Terminal';
  }
}, 1000);
