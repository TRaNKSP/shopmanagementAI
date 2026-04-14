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

// ── Mobile sidebar ──
function toggleSidebar() {
  const sidebar = document.getElementById('sidebar');
  const overlay = document.getElementById('sidebarOverlay');
  const hamburger = document.getElementById('hamburger');
  const isOpen = sidebar.classList.contains('open');
  if (isOpen) {
    sidebar.classList.remove('open');
    overlay.classList.remove('active');
    hamburger.classList.remove('open');
  } else {
    sidebar.classList.add('open');
    overlay.classList.add('active');
    hamburger.classList.add('open');
  }
}

function closeSidebar() {
  document.getElementById('sidebar').classList.remove('open');
  document.getElementById('sidebarOverlay').classList.remove('active');
  document.getElementById('hamburger').classList.remove('open');
}

// ── Screen navigation ──
function showScreen(id) {
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
  const screen = document.getElementById('screen-' + id);
  if (screen) screen.classList.add('active');
  document.querySelectorAll('[data-screen="' + id + '"]').forEach(n => n.classList.add('active'));
  document.getElementById('breadcrumb').textContent = SCREEN_TITLES[id] || id;
  window.scrollTo(0, 0);
  // Close sidebar on mobile after navigation
  if (window.innerWidth <= 768) closeSidebar();
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
  { id:'B1', type:'Chassis Lift',   cap:'Class 1–4', status:'occupied',  car:'2022 Camry',        tech:'Rivera',  services:['Oil','Brakes','Inspection'] },
  { id:'B2', type:'Drive-on Lift',  cap:'Class 1–3', status:'occupied',  car:'2020 BMW 3-Series', tech:'Torres',  services:['Oil','Tires','Brakes'] },
  { id:'B3', type:'Drive-on Lift',  cap:'Class 1–3', status:'occupied',  car:'2023 CR-V',         tech:'Patel',   services:['Oil','Tires','Brakes'] },
  { id:'B4', type:'Drive-on Lift',  cap:'Class 1–3', status:'reserved',  car:'Next: Explorer',    tech:'',        services:['Oil','Tires','Brakes'] },
  { id:'B5', type:'Chassis Lift',   cap:'Class 1–4', status:'occupied',  car:'2020 Silverado',    tech:'Johnson', services:['Oil','Brakes','Inspection'] },
  { id:'B6', type:'Chassis Lift',   cap:'Class 1–4', status:'occupied',  car:'2021 Explorer',     tech:'Rivera',  services:['Oil','Brakes','Inspection'] },
  { id:'B7', type:'Alignment Rack', cap:'Class 1–3', status:'occupied',  car:'2020 F-150',        tech:'Kim',     services:['Alignment','Inspection'] },
  { id:'B8', type:'Drive-on Lift',  cap:'Class 1–3', status:'turnover',  car:'',                  tech:'',        services:['Oil','Tires','Brakes'] },
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
    // Fix: map type filter keys to actual type strings
    const typeMap = {
      'chassis':   'chassis lift',
      'driveon':   'drive-on',
      'alignment': 'alignment',
      'tire':      'tire mount',
      'lube':      'lube pit'
    };
    const typeOk = !filterType || b.type.toLowerCase().includes(typeMap[filterType] || filterType);
    return statusOk && typeOk;
  });
  if (filtered.length === 0) {
    grid.innerHTML = '<div style="grid-column:1/-1;padding:24px;text-align:center;color:var(--t3);font-size:13px">No bays match this filter</div>';
    return;
  }
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
    document.querySelectorAll('.filter-group:last-child .filter-btn').forEach(b => b.classList.remove('active'));
  } else {
    window._bayFilterType = type;
    document.querySelectorAll('.filter-group:last-child .filter-btn').forEach(b => b.classList.remove('active'));
    if (btn) btn.classList.add('active');
  }
  buildFullBayGrid(window._bayFilterStatus, window._bayFilterType);
}

// Build occupancy projection — full day 7am to 8pm (14 hours)
function buildProjection() {
  const grid = document.getElementById('projectionGrid');
  if (!grid) return;
  const hours = ['7a','8a','9a','10a','11a','12p','1p','2p','3p','4p','5p','6p','7p','8p'];
  const bayRows = BAYS;
  const statuses = {
    'B1': ['gray','occ','occ','occ','avail','occ','occ','avail','avail','avail','avail','gray','gray','gray'],
    'B2': ['gray','occ','occ','occ','occ','occ','avail','avail','occ','occ','avail','gray','gray','gray'],
    'B3': ['occ','occ','occ','avail','avail','occ','occ','occ','avail','occ','occ','avail','gray','gray'],
    'B4': ['gray','gray','res','occ','occ','avail','avail','avail','occ','occ','occ','avail','gray','gray'],
    'B5': ['occ','occ','occ','avail','avail','occ','occ','avail','avail','occ','occ','occ','avail','gray'],
    'B6': ['gray','occ','avail','avail','occ','occ','occ','occ','avail','avail','occ','occ','gray','gray'],
    'B7': ['gray','gray','occ','occ','occ','occ','avail','res','res','occ','occ','avail','gray','gray'],
    'B8': ['gray','gray','gray','avail','avail','avail','occ','occ','avail','avail','occ','occ','occ','gray'],
  };
  let html = '<table class="proj-table"><thead><tr><th>Bay</th>';
  hours.forEach(h => { html += `<th>${h}</th>`; });
  html += '</tr></thead><tbody>';
  bayRows.forEach(bay => {
    html += `<tr><td>${bay.id} — ${bay.type.replace(' Lift','').replace(' Rack','')}</td>`;
    const row = statuses[bay.id] || Array(14).fill('avail');
    row.forEach(s => { html += `<td><div class="proj-cell ${s}"></div></td>`; });
    html += '</tr>';
  });
  html += '</tbody></table>';
  grid.innerHTML = html;
}

// ══════════════════════════════════════════
//  STAFFING HEATMAP — skill-level shading
// ══════════════════════════════════════════
function buildHeatmap() {
  const container = document.getElementById('heatmap');
  if (!container) return;
  const hours = ['7am','8am','9am','10am','11am','12pm','1pm','2pm','3pm','4pm','5pm','6pm','7pm','8pm'];

  // Each tech: name, tier (mta/mtb/mtc/mt), schedule (1=working, 0=off, w=warn, r=red)
  const techs = [
    { name:'J. Rivera', tier:'mta', label:'MT-A',
      data:[0,'w','on','on','on','on','on','on','on',0,0,0,0,0] },
    { name:'A. Patel',  tier:'mta', label:'MT-A',
      data:[0,'w','on','on','on','on','on','on','on',0,0,0,0,0] },
    { name:'E. Adams',  tier:'mtc', label:'MT-C',
      data:[0,'w','on','on','warn','warn','warn',0,0,0,0,0,0,0] },
    { name:'D. Kim',    tier:'mtb', label:'MT-B',
      data:[0,0,'on','on','on','on','on','on','on','on',0,0,0,0] },
    { name:'S. Johnson',tier:'mtb', label:'MT-B',
      data:[0,0,0,'on','on','on','on','on','on','on','on',0,0,0] },
    { name:'T. Williams',tier:'mtc',label:'MT-C',
      data:[0,0,0,0,'on','on','on','on','on','on','on','on',0,0] },
    { name:'M. Torres', tier:'mt',  label:'MT',
      data:[0,0,0,0,'red','red','warn','warn','warn','on','on','on','on',0] },
  ];

  // Capacity per hour: count techs working
  const capacity = hours.map((_, hi) => {
    const working = techs.filter(t => t.data[hi] === 'on' || t.data[hi] === 'warn').length;
    const demand  = [0,1,3,4,5,5,4,4,3,3,2,1,1,0][hi]; // projected car demand
    if (demand === 0) return 'closed';
    if (working === 0) return 'under';
    if (working < demand - 1) return 'under';
    if (working >= demand) return 'over';
    return 'at';
  });

  // Tier colors for working cells — brighter fills
  const tierColor = { mta:'#3ccf7e', mtb:'#4d8de8', mtc:'#f0b232', mt:'#8b90a8' };
  const tierBg    = { mta:'rgba(60,207,126,.55)', mtb:'rgba(77,141,232,.5)', mtc:'rgba(240,178,50,.5)', mt:'rgba(139,144,168,.35)' };

  // Capacity header
  const capLabel = { over:'Well covered', at:'At capacity', under:'Understaffed', closed:'Closed' };
  const capBg    = { over:'rgba(60,207,126,.45)', at:'rgba(240,178,50,.45)', under:'rgba(240,96,96,.5)', closed:'rgba(255,255,255,.04)' };
  const capTxt   = { over:'#3ccf7e', at:'#f0b232', under:'#f06060', closed:'#4a5068' };

  let html = '<table class="heatmap-table"><thead>';
  // Capacity row
  html += '<tr><th style="text-align:left;font-size:9.5px;color:var(--t3)">Capacity →</th>';
  capacity.forEach(cap => {
    html += `<th><div style="height:16px;border-radius:3px;background:${capBg[cap]};color:${capTxt[cap]};font-size:8px;display:flex;align-items:center;justify-content:center;font-weight:700">${cap==='closed'?'—':cap==='over'?'✓':cap==='at'?'~':'!'}</div></th>`;
  });
  html += '</tr>';
  // Tech header row
  html += '<tr><th style="text-align:left">Technician</th>';
  hours.forEach(h => html += `<th>${h}</th>`);
  html += '</tr></thead><tbody>';

  techs.forEach(t => {
    const color = tierColor[t.tier];
    const bg    = tierBg[t.tier];
    html += `<tr><td><span style="font-weight:500">${t.name}</span> <span style="font-size:9.5px;font-weight:700;padding:1px 5px;border-radius:3px;background:${bg};color:${color}">${t.label}</span></td>`;
    t.data.forEach(cell => {
      if (!cell || cell === 0) {
        html += `<td><div class="hm-cell gray"></div></td>`;
      } else if (cell === 'on') {
        html += `<td><div class="hm-cell" style="background:${bg};border:1px solid ${color}30"></div></td>`;
      } else if (cell === 'warn') {
        html += `<td><div class="hm-cell amber"></div></td>`;
      } else if (cell === 'red') {
        html += `<td><div class="hm-cell red"></div></td>`;
      } else if (cell === 'w') {
        // Warming up / arriving
        html += `<td><div class="hm-cell" style="background:${bg};opacity:.4;border:1px dashed ${color}50"></div></td>`;
      } else {
        html += `<td><div class="hm-cell gray"></div></td>`;
      }
    });
    html += '</tr>';
  });
  html += '</tbody></table>';
  html += `<div style="display:flex;gap:14px;flex-wrap:wrap;margin-top:10px;font-size:10.5px;color:var(--t2)">
    <span><span style="display:inline-block;width:10px;height:10px;border-radius:2px;background:rgba(60,207,126,.55);border:1px solid #3ccf7e80;margin-right:4px"></span>MT-A (Advanced)</span>
    <span><span style="display:inline-block;width:10px;height:10px;border-radius:2px;background:rgba(77,141,232,.5);border:1px solid #4d8de880;margin-right:4px"></span>MT-B (Mid-level)</span>
    <span><span style="display:inline-block;width:10px;height:10px;border-radius:2px;background:rgba(240,178,50,.5);border:1px solid #f0b23280;margin-right:4px"></span>MT-C (General)</span>
    <span><span style="display:inline-block;width:10px;height:10px;border-radius:2px;background:rgba(139,144,168,.35);margin-right:4px"></span>MT (Entry)</span>
    <span><span style="display:inline-block;width:10px;height:10px;border-radius:2px;background:rgba(240,96,96,.5);margin-right:4px"></span>Understaffed</span>
    <span><span style="display:inline-block;width:10px;height:10px;border-radius:2px;background:rgba(240,178,50,.45);margin-right:4px"></span>At capacity</span>
    <span><span style="display:inline-block;width:10px;height:10px;border-radius:2px;background:rgba(60,207,126,.45);margin-right:4px"></span>Well covered</span>
  </div>`;
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
// ══════════════════════════════════════════
//  ROLE DETAIL MODAL
// ══════════════════════════════════════════
const ROLE_DETAILS = {
  customer: {
    title: 'Customer View',
    desc: 'Customers receive a unique SMS link the moment their car is checked in — no account or login required. They see a clean status tracker with the current stage (Waiting → In Bay → Awaiting Approval → QC → Ready), estimated completion time, any pending approvals needed (with ability to approve or decline additional work from their phone), and the final invoice with a Pay link when service is complete. Post-visit, they receive a satisfaction survey.'
  },
  mt_a: {
    title: 'Maintenance Tech A — Highest Grade',
    desc: 'MT-A is the most skilled, highest-paid technician in the shop. Full ASE Master certification. The manager routes the most complex and highest-value jobs here — engine diagnostics, A/C system repair, transmission service, timing belt, and any non-obvious troubleshooting (rattles, vibrations, intermittent issues). MT-A techs mentor others, review findings from junior techs, and can approve or escalate additional work recommendations. Expected book ratio: 1.2–1.4×. e.g. J. Rivera, A. Patel.'
  },
  mt_b: {
    title: 'Maintenance Tech B — Advanced',
    desc: 'MT-B techs handle the mid-complexity services that require certification but not full master-level skill. This includes brake jobs (front and rear), 4-wheel alignment, steering and suspension diagnosis, 150-point vehicle inspections, and wiper/cabin filter replacement. Actively working toward ASE certifications. Expected book ratio: 1.0–1.2×. e.g. D. Kim (Alignment), S. Johnson.'
  },
  mt_c: {
    title: 'Maintenance Tech C — General Service',
    desc: 'MT-C techs are competent, experienced general-service technicians. Primary work: tire mount & balance, tire rotation, oil changes (all types), battery test and replacement, air filter service, and basic vehicle checks. They can assist MT-B techs on brake jobs to accelerate throughput. Expected book ratio: 0.85–1.05×. e.g. T. Williams, E. Adams.'
  },
  mt: {
    title: 'Maintenance Tech — Entry Level',
    desc: 'The entry rung of the ladder. No prior certification required — just willingness to work and learn. Primary jobs: flat repair, tire changes, oil changes (supervised initially), and shop support. With in-shop mentorship from MT-A and MT-B techs, management support, and completion of online training courses, MTs build toward MT-C within 6–12 months. Expected book ratio: 0.7–0.9× as they build speed. e.g. M. Torres.'
  },
  advisor: {
    title: 'Service Advisor',
    desc: 'Service advisors manage the customer relationship from intake to invoice. They see the full work order with customer communication history, vehicle service history, and AI-generated upsell recommendations based on mileage and prior service records. They create and manage appointments, handle walk-in intake with AI bay suggestions, review tech findings with customers, and process payments. Key metric: conversion rate on additional work recommendations.'
  },
  manager: {
    title: 'Store Manager',
    desc: 'The manager sees all open work orders across all 8 bays simultaneously, with AI alerts for any job running past book time, staffing coverage gaps, parts shortages, and revenue pacing vs. budget and regional peers. Full access to analytics, staffing, tech performance, and the ability to override any AI recommendation. Receives escalations for customer approval-pending jobs that are holding a bay idle.'
  },
  parts: {
    title: 'Parts Associate',
    desc: 'Parts associates manage the staging queue — which parts are needed for upcoming work orders, incoming reorder alerts, and current inventory status. When the autonomous reorder agent fires, they receive a push notification with the PO details and expected delivery time. They also handle receiving, organized by bay-staging location so technicians can pull parts without searching.'
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

  // ── Deep-link: if arriving from a standalone page that set sessionStorage goto ──
  // e.g. clicking "Bay Management" from shopfloor.html sets goto='bays'
  // then index.html loads and immediately navigates to the right screen
  const goto = sessionStorage.getItem('goto');
  if (goto) {
    sessionStorage.removeItem('goto');
    // Small delay so all screens are rendered before switching
    setTimeout(() => showScreen(goto), 0);
  }
});
