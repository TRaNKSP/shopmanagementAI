// ═══════════════════════════════════════════════════
//  ShopFlow AI — App Logic
// ═══════════════════════════════════════════════════

const SCREEN_TITLES = {
  dashboard:    'Command Center',
  bays:         'Bay Management',
  appointments: 'Appointments & Waitlist',
  walkins:      'Walk-in Intake',
  workorders:   'Work Orders',
  staffing:     'Daily Staffing',
  roles:        'Roles & Permissions',
  services:     'Services & Inventory',
  notifications:'Notifications Engine',
  hours:        'Store Hours',
  analytics:    'Analytics Dashboard',
  ai:           'AI Agents'
};

// ── Screen navigation ──
function showScreen(id) {
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
  const screen = document.getElementById('screen-' + id);
  if (screen) screen.classList.add('active');
  document.querySelectorAll('[data-screen="' + id + '"]').forEach(n => n.classList.add('active'));
  document.getElementById('breadcrumb').textContent = SCREEN_TITLES[id] || id;
  window.scrollTo(0, 0);
}

// ── Theme toggle ──
function toggleTheme() {
  const html = document.documentElement;
  const current = html.getAttribute('data-theme');
  html.setAttribute('data-theme', current === 'dark' ? 'light' : 'dark');
  setTimeout(() => { buildAnalyticsCharts(); }, 50);
}

// ── Live clock ──
function updateClock() {
  const now = new Date();
  const h = String(now.getHours()).padStart(2,'0');
  const m = String(now.getMinutes()).padStart(2,'0');
  const s = String(now.getSeconds()).padStart(2,'0');
  const el = document.getElementById('timeDisplay');
  if (el) el.textContent = h + ':' + m + ':' + s;
}
setInterval(updateClock, 1000);
updateClock();

// ══════════════════════════════════════════
//  BAY DATA
// ══════════════════════════════════════════
const BAYS = [
  { id:'B1',  type:'Chassis Lift',   cap:'Class 1–4', status:'occupied',  car:'2022 Camry',       tech:'Rivera',   services:['Oil','Brakes','Inspection'] },
  { id:'B2',  type:'Chassis Lift',   cap:'Class 1–4', status:'occupied',  car:'2020 BMW 3-Series',tech:'Torres',   services:['Oil','Brakes','Inspection'] },
  { id:'B3',  type:'Drive-on Lift',  cap:'Class 1–3', status:'occupied',  car:'2023 CR-V',        tech:'Patel',    services:['Oil','Tires','Brakes'] },
  { id:'B4',  type:'Drive-on Lift',  cap:'Class 1–3', status:'available', car:'',                 tech:'',         services:['Oil','Tires','Brakes'] },
  { id:'B5',  type:'Tire Mount Bay', cap:'Class 1–3', status:'occupied',  car:'2021 Explorer',    tech:'Adams',    services:['Tires','Mount & Balance'] },
  { id:'B6',  type:'Chassis Lift',   cap:'Class 1–4', status:'occupied',  car:'2019 Silverado',   tech:'Johnson',  services:['Oil','Brakes','Inspection'] },
  { id:'B7',  type:'Alignment Rack', cap:'Class 1–3', status:'occupied',  car:'2020 F-150',       tech:'Kim',      services:['Alignment','Inspection'] },
  { id:'B8',  type:'Drive-on Lift',  cap:'Class 1–3', status:'turnover',  car:'',                 tech:'',         services:['Oil','Tires','Brakes'] },
  { id:'B9',  type:'Chassis Lift',   cap:'Class 1–4', status:'reserved',  car:'James K. 10:30',   tech:'',         services:['Oil','Brakes','Inspection'] },
  { id:'B10', type:'Drive-on Lift',  cap:'Class 1–3', status:'occupied',  car:'2017 RAV4',        tech:'Rivera',   services:['Oil','Tires','Brakes'] },
  { id:'B11', type:'Chassis Lift',   cap:'Class 1–4', status:'occupied',  car:'2023 Tacoma',      tech:'Patel',    services:['Oil','Brakes','Inspection'] },
  { id:'B12', type:'Drive-on Lift',  cap:'Class 1–3', status:'available', car:'',                 tech:'',         services:['Oil','Tires','Brakes'] },
  { id:'B13', type:'Alignment Rack', cap:'Class 1–3', status:'occupied',  car:'2022 Accord',      tech:'Kim',      services:['Alignment','Inspection'] },
  { id:'B14', type:'Chassis Lift',   cap:'Class 1–4', status:'reserved',  car:'Chen W. 10:00',    tech:'',         services:['Oil','Brakes','Inspection'] },
  { id:'B15', type:'Drive-on Lift',  cap:'Class 1–3', status:'occupied',  car:'2020 Silverado',   tech:'Johnson',  services:['Oil','Tires','Brakes'] },
  { id:'B16', type:'Chassis Lift',   cap:'Class 1–4', status:'occupied',  car:'2021 Mustang',     tech:'Torres',   services:['Oil','Brakes','Inspection'] },
  { id:'B17', type:'Tire Mount Bay', cap:'Class 1–3', status:'available', car:'',                 tech:'',         services:['Tires','Mount & Balance'] },
  { id:'B18', type:'Drive-on Lift',  cap:'Class 1–3', status:'turnover',  car:'',                 tech:'',         services:['Oil','Tires','Brakes'] },
  { id:'B19', type:'Lube Pit',       cap:'Class 1–2', status:'occupied',  car:'2018 Civic',       tech:'Williams', services:['Oil Change Only'] },
  { id:'B20', type:'Drive-on Lift',  cap:'Class 1–3', status:'occupied',  car:'2024 Tucson',      tech:'Adams',    services:['Oil','Tires','Brakes'] },
];

// Build mini bay grid (dashboard)
function buildMiniBayGrid() {
  const grid = document.getElementById('dashBayGrid');
  if (!grid) return;
  grid.innerHTML = '';
  BAYS.forEach(bay => {
    const el = document.createElement('div');
    el.className = 'mini-bay ' + bay.status;
    el.textContent = bay.id;
    el.title = bay.type + ' · ' + (bay.car || 'Available');
    el.onclick = () => showScreen('bays');
    grid.appendChild(el);
  });
}

// Build full bay grid
function buildFullBayGrid(filterStatus = 'all', filterType = '') {
  const grid = document.getElementById('fullBayGrid');
  if (!grid) return;
  grid.innerHTML = '';
  const filtered = BAYS.filter(b => {
    const statusOk = filterStatus === 'all' || b.status === filterStatus;
    const typeOk = !filterType || b.type.toLowerCase().includes(filterType.toLowerCase());
    return statusOk && typeOk;
  });
  filtered.forEach(bay => {
    const card = document.createElement('div');
    card.className = 'bay-card ' + bay.status;
    const svcs = bay.services.slice(0,2).join(', ') + (bay.services.length > 2 ? '...' : '');
    card.innerHTML = `
      <div class="bay-id">${bay.id}</div>
      <div class="bay-type">${bay.type}</div>
      <div class="bay-cap">${bay.cap} · ${svcs}</div>
      <span class="bay-status-tag ${bay.status}">${bay.status.charAt(0).toUpperCase() + bay.status.slice(1)}</span>
      ${bay.car ? `<div class="bay-car">${bay.car}</div>` : ''}
      ${bay.tech ? `<div class="bay-tech">Tech: ${bay.tech}</div>` : ''}
    `;
    grid.appendChild(card);
  });
}

window._bayFilterStatus = 'all';
window._bayFilterType = '';

function filterBays(status, btn) {
  window._bayFilterStatus = status;
  document.querySelectorAll('.filter-group:first-child .filter-btn').forEach(b => b.classList.remove('active'));
  if (btn) btn.classList.add('active');
  buildFullBayGrid(window._bayFilterStatus, window._bayFilterType);
}

function filterBayType(type, btn) {
  if (window._bayFilterType === type) {
    window._bayFilterType = '';
    if (btn) btn.classList.remove('active');
  } else {
    window._bayFilterType = type;
    document.querySelectorAll('.filter-group:last-child .filter-btn').forEach(b => b.classList.remove('active'));
    if (btn) btn.classList.add('active');
  }
  buildFullBayGrid(window._bayFilterStatus, window._bayFilterType);
}

// Build occupancy projection
function buildProjection() {
  const grid = document.getElementById('projectionGrid');
  if (!grid) return;
  const hours = ['Now','10:30','11:00','11:30','12:00','12:30'];
  const bayRows = BAYS.slice(0, 10);
  const statuses = {
    'B1':  ['occ','occ','avail','avail','avail','avail'],
    'B2':  ['occ','occ','occ','avail','avail','avail'],
    'B3':  ['occ','avail','avail','occ','occ','avail'],
    'B4':  ['avail','avail','occ','occ','avail','avail'],
    'B5':  ['occ','occ','avail','avail','occ','occ'],
    'B6':  ['occ','avail','avail','occ','occ','occ'],
    'B7':  ['occ','occ','occ','avail','res','res'],
    'B8':  ['avail','avail','avail','avail','occ','occ'],
    'B9':  ['res','res','occ','occ','avail','avail'],
    'B10': ['occ','avail','avail','avail','occ','occ'],
  };
  let html = '<table class="proj-table"><thead><tr><th>Bay</th>';
  hours.forEach(h => { html += `<th>${h}</th>`; });
  html += '</tr></thead><tbody>';
  bayRows.forEach(bay => {
    html += `<tr><td>${bay.id} — ${bay.type}</td>`;
    const row = statuses[bay.id] || Array(6).fill('avail');
    row.forEach(s => {
      html += `<td><div class="proj-cell ${s}"></div></td>`;
    });
    html += '</tr>';
  });
  html += '</tbody></table>';
  grid.innerHTML = html;
}

// ══════════════════════════════════════════
//  STAFFING HEATMAP
// ══════════════════════════════════════════
function buildHeatmap() {
  const container = document.getElementById('heatmap');
  if (!container) return;
  const hours = ['7am','8am','9am','10am','11am','12pm','1pm','2pm','3pm','4pm','5pm','6pm','7pm'];
  const techs = [
    { name:'J. Rivera (Lead)', data:['green','green','green','green','green','green','green','green','green','gray','gray','gray','gray'] },
    { name:'A. Patel (Journey)', data:['green','green','green','green','green','green','green','green','green','gray','gray','gray','gray'] },
    { name:'E. Adams (Tire)', data:['green','green','green','green','amber','amber','amber','gray','gray','gray','gray','gray','gray'] },
    { name:'D. Kim (Alignment)', data:['gray','green','green','green','green','green','green','green','green','green','gray','gray','gray'] },
    { name:'S. Johnson (Journey)', data:['gray','gray','green','green','green','green','green','green','green','green','green','gray','gray'] },
    { name:'T. Williams (Lube)', data:['gray','gray','gray','green','green','green','green','green','green','green','green','green','gray'] },
    { name:'M. Torres (Journey)', data:['gray','gray','gray','gray','red','red','amber','amber','amber','green','green','green','green'] },
  ];
  let html = '<table class="heatmap-table"><thead><tr><th style="text-align:left">Technician</th>';
  hours.forEach(h => html += `<th>${h}</th>`);
  html += '</tr></thead><tbody>';
  techs.forEach(t => {
    html += `<tr><td>${t.name}</td>`;
    t.data.forEach(c => html += `<td><div class="hm-cell ${c}"></div></td>`);
    html += '</tr>';
  });
  html += '</tbody></table>';
  container.innerHTML = html;
}

// ══════════════════════════════════════════
//  ANALYTICS CHARTS (CSS-based)
// ══════════════════════════════════════════
function buildAnalyticsCharts() {
  buildRevenueChart();
  buildDonutChart();
  buildNoShowChart();
  buildWeeklyChart();
}

function buildRevenueChart() {
  const el = document.getElementById('revenueChart');
  if (!el) return;
  const data = [820,1240,1680,2100,2380,2210,1940,2100,1820,1430];
  const targets = [900,1400,1800,2000,2200,2200,2000,2000,1800,1500];
  const labels = ['7am','8am','9am','10am','11am','12pm','1pm','2pm','3pm','4pm'];
  const maxV = Math.max(...data, ...targets);
  const colors = ['#4d8de8','#4d8de8','#4d8de8','#4d8de8','#4d8de8','#4d8de8','#4d8de8','#4d8de8','#4d8de8','#4d8de8'];
  let html = '';
  data.forEach((v, i) => {
    const h = Math.round((v / maxV) * 140);
    const targetH = Math.round((targets[i] / maxV) * 140);
    const overTarget = v >= targets[i];
    const color = overTarget ? 'rgba(60,207,126,0.6)' : 'rgba(77,141,232,0.5)';
    html += `<div class="rev-bar-wrap">
      <div class="rev-bar" style="height:${h}px;background:${color}"></div>
      <div class="rev-label">${labels[i]}</div>
    </div>`;
  });
  const targetPct = Math.round((targets[5] / maxV) * 140);
  html += `<div class="target-line" style="bottom:${targetPct + 24}px" title="Target"></div>`;
  el.innerHTML = html;
}

function buildDonutChart() {
  const el = document.getElementById('donutChart');
  if (!el) return;
  const segments = [
    { pct: 38, color: '#4ade80' },
    { pct: 24, color: '#60a5fa' },
    { pct: 18, color: '#f59e0b' },
    { pct: 10, color: '#a78bfa' },
    { pct: 10, color: '#94a3b8' },
  ];
  let cumulativeDeg = -90;
  let gradientParts = [];
  segments.forEach(s => {
    const startDeg = cumulativeDeg;
    const endDeg = cumulativeDeg + (s.pct / 100) * 360;
    gradientParts.push(`${s.color} ${startDeg}deg ${endDeg}deg`);
    cumulativeDeg = endDeg;
  });
  const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
  const centerColor = isDark ? '#141720' : '#ffffff';
  el.style.background = `conic-gradient(${gradientParts.join(', ')})`;
  el.style.position = 'relative';
  el.innerHTML = `<div style="position:absolute;inset:20px;background:${centerColor};border-radius:50%;display:flex;align-items:center;justify-content:center;flex-direction:column"><div style="font-family:var(--font-mono);font-size:11px;color:var(--text-muted)">Total</div><div style="font-size:18px;font-weight:500;color:var(--text-primary)">31</div><div style="font-size:9px;color:var(--text-muted)">cars</div></div>`;
}

function buildNoShowChart() {
  const el = document.getElementById('noShowChart');
  if (!el) return;
  const days = ['Mon','Tue','Wed','Thu','Fri','Sat'];
  const noshow = [5,4,6,7,9,11];
  const cancel = [8,6,7,9,12,8];
  const maxV = Math.max(...noshow.map((v,i) => v + cancel[i]));
  let html = '';
  days.forEach((d, i) => {
    const nsH = Math.round((noshow[i] / maxV) * 100);
    const cnH = Math.round((cancel[i] / maxV) * 100);
    html += `<div class="ns-group">
      <div class="ns-bar" style="height:${nsH}px;background:#f87171;opacity:0.7"></div>
      <div class="ns-bar" style="height:${cnH}px;background:#60a5fa;opacity:0.7"></div>
    </div>`;
  });
  el.innerHTML = html;
}

function buildWeeklyChart() {
  const el = document.getElementById('weeklyChart');
  if (!el) return;
  const weeks = ['W1','W2','W3','W4','W5','W6','W7','W8(F)'];
  const vals   = [78400, 82100, 79600, 85200, 88700, 91300, 89800, null];
  const forecast = [null,null,null,null,null,null,null,96000];
  const maxV = 100000;
  let html = '';
  weeks.forEach((w, i) => {
    const isF = forecast[i] !== null;
    const v = vals[i] || forecast[i];
    const h = Math.round((v / maxV) * 120);
    const color = isF ? 'var(--accent-purple)' : 'var(--accent-blue)';
    html += `<div class="wk-bar-wrap">
      <div class="wk-val">${isF ? '~$96k' : '$' + Math.round(v/1000) + 'k'}</div>
      <div class="wk-bar ${isF ? 'forecast' : ''}" style="height:${h}px;background:${isF ? 'rgba(167,139,250,0.25)' : 'rgba(77,141,232,0.45)'}"></div>
      <div class="wk-label">${w}</div>
    </div>`;
  });
  el.innerHTML = html;
}

// ══════════════════════════════════════════
//  ROLE DETAIL MODAL (simple)
// ══════════════════════════════════════════
const ROLE_DETAILS = {
  customer: {
    title: 'Customer view',
    desc: 'Customers access their vehicle status via a unique SMS link — no account or login required. They see a clean, consumer-facing tracker with the current status stage (Waiting → In Progress → Ready), estimated completion time, and the final invoice when work is done. Post-visit, they receive a satisfaction survey link.'
  },
  tech: {
    title: 'Technician view',
    desc: 'Technicians see their personal queue for the day: which car, which bay, which service, what parts should be staged, and a timer running against book time. The AI work order documentation tool lets them dictate findings verbally. Push notifications fire when a new car is assigned, when it is checked in, and when parts are staged.'
  },
  advisor: {
    title: 'Service advisor view',
    desc: 'Service advisors see the full work order with customer communication history, upsell recommendations powered by the AI advisor engine (based on vehicle mileage and history), and payment status. They create and manage appointments and handle walk-in intake with AI bay suggestions.'
  },
  manager: {
    title: 'Store manager view',
    desc: 'The manager sees all open work orders across all 20 bays simultaneously, with AI alerts for any job running past book time, staffing coverage gaps, parts shortages, and revenue pacing. They have full access to analytics, staffing, and override any AI recommendation with one click.'
  },
  parts: {
    title: 'Parts associate view',
    desc: 'Parts associates see the staging queue (which parts are needed for upcoming work orders), incoming reorder alerts, and the current inventory status. When the autonomous reorder agent fires, they receive a push notification with the PO details and expected delivery time.'
  }
};

function showRoleDetail(role) {
  const detail = ROLE_DETAILS[role];
  if (!detail) return;
  alert(detail.title + '\n\n' + detail.desc);
}

// ══════════════════════════════════════════
//  INIT
// ══════════════════════════════════════════
document.addEventListener('DOMContentLoaded', () => {
  buildMiniBayGrid();
  buildFullBayGrid();
  buildProjection();
  buildHeatmap();
  buildAnalyticsCharts();
});
