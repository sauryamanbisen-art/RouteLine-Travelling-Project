/**
 * RouteLine — Train Schedule & Timetable Controller
 * Powered by RailRadar API
 */

import { getTrainSchedule } from './railradar.js';
import { getCoachSvg, renderCoachStrip } from './coach-position.js';
import { openPNRModal, initPNRModule } from './pnr-status.js';
import { initAuth } from '../auth/auth.js';

// Fallback Train Schedule Database for robust, zero-fail experience
const FALLBACK_SCHEDULES = {
  "12952": {
    train: {
      number: "12952",
      name: "New Delhi - Mumbai Central Tejas Rajdhani Express",
      type: "Rajdhani Express",
      category: "Premium",
      source: { code: "NDLS", name: "New Delhi" },
      destination: { code: "MMCT", name: "Mumbai Central" },
      runDays: ["mon", "tue", "wed", "thu", "fri", "sat", "sun"],
      distance: 1384.4,
      duration: 940,
      avgSpeed: 88.4,
      maxSpeed: 101.5,
      totalHalts: 8,
      returnTrain: "12951",
      coachPosition: "ENG-LPR-A5-A4-A3-A2-A1-AE1-H1-PC-B11-B10-B9-B8-B7-B6-B5-B4-B3-B2-B1-LPR"
    },
    route: [
      { sequence: 1, station: { code: "NDLS", name: "New Delhi" }, isHalt: true, platform: "3", arrival: "--", departure: "16:55", haltMinutes: 0, distance: 0, departureDay: 1 },
      { sequence: 2, station: { code: "KOTA", name: "Kota Jn" }, isHalt: true, platform: "2", arrival: "21:30", departure: "21:40", haltMinutes: 10, distance: 465, departureDay: 1 },
      { sequence: 3, station: { code: "RTM", name: "Ratlam Jn" }, isHalt: true, platform: "4", arrival: "00:50", departure: "00:53", haltMinutes: 3, distance: 731, departureDay: 2 },
      { sequence: 4, station: { code: "BRC", name: "Vadodara Jn" }, isHalt: true, platform: "1", arrival: "03:40", departure: "03:48", haltMinutes: 8, distance: 992, departureDay: 2 },
      { sequence: 5, station: { code: "ST", name: "Surat" }, isHalt: true, platform: "2", arrival: "05:13", departure: "05:18", haltMinutes: 5, distance: 1122, departureDay: 2 },
      { sequence: 6, station: { code: "BL", name: "Valsad" }, isHalt: true, platform: "3", arrival: "06:03", departure: "06:05", haltMinutes: 2, distance: 1190, departureDay: 2 },
      { sequence: 7, station: { code: "BVI", name: "Borivali" }, isHalt: true, platform: "7", arrival: "07:40", departure: "07:42", haltMinutes: 2, distance: 1354, departureDay: 2 },
      { sequence: 8, station: { code: "MMCT", name: "Mumbai Central" }, isHalt: true, platform: "1", arrival: "08:35", departure: "--", haltMinutes: 0, distance: 1384, departureDay: 2 }
    ]
  },
  "12919": {
    train: {
      number: "12919",
      name: "Malwa SF Express (DADN to SVDK)",
      type: "Superfast Express",
      category: "Mail / Express",
      source: { code: "DADN", name: "Dr. Ambedkar Nagar" },
      destination: { code: "SVDK", name: "Shri Mata Vaishno Devi Katra" },
      runDays: ["mon", "tue", "wed", "thu", "fri", "sat", "sun"],
      distance: 1540,
      duration: 1680,
      avgSpeed: 55.0,
      maxSpeed: 110.0,
      totalHalts: 44,
      returnTrain: "12920",
      coachPosition: "ENG-SLRD-S12-S11-S10-S9-GEN-GEN-GEN-S8-S7-GEN-GEN-S6-S5-GEN-S4-B2-B1-S3-S2-S1-SLRD"
    },
    route: [
      { sequence: 1, station: { code: "DADN", name: "Dr. Ambedkar Nagar" }, isHalt: true, platform: "1", arrival: "--", departure: "11:50", haltMinutes: 0, distance: 0, departureDay: 1 },
      { sequence: 2, station: { code: "INDB", name: "Indore Jn" }, isHalt: true, platform: "4", arrival: "12:05", departure: "12:15", haltMinutes: 10, distance: 21, departureDay: 1 },
      { sequence: 3, station: { code: "UJN", name: "Ujjain Jn" }, isHalt: true, platform: "1", arrival: "13:45", departure: "14:00", haltMinutes: 15, distance: 100, departureDay: 1 },
      { sequence: 4, station: { code: "BPL", name: "Bhopal Jn" }, isHalt: true, platform: "2", arrival: "17:25", departure: "17:30", haltMinutes: 5, distance: 283, departureDay: 1 },
      { sequence: 5, station: { code: "VGLJ", name: "V Lakshmibai Jhansi Jn" }, isHalt: true, platform: "4", arrival: "21:30", departure: "21:38", haltMinutes: 8, distance: 575, departureDay: 1 },
      { sequence: 6, station: { code: "GWL", name: "Gwalior Jn" }, isHalt: true, platform: "2", arrival: "22:46", departure: "22:48", haltMinutes: 2, distance: 672, departureDay: 1 },
      { sequence: 7, station: { code: "AGC", name: "Agra Cantt" }, isHalt: true, platform: "2", arrival: "00:45", departure: "00:50", haltMinutes: 5, distance: 790, departureDay: 2 },
      { sequence: 8, station: { code: "NDLS", name: "New Delhi" }, isHalt: true, platform: "4", arrival: "04:15", departure: "04:30", haltMinutes: 15, distance: 985, departureDay: 2 },
      { sequence: 9, station: { code: "LDH", name: "Ludhiana Jn" }, isHalt: true, platform: "3", arrival: "09:10", departure: "09:20", haltMinutes: 10, distance: 1297, departureDay: 2 },
      { sequence: 10, station: { code: "JAT", name: "Jammu Tawi" }, isHalt: true, platform: "1", arrival: "14:10", departure: "14:15", haltMinutes: 5, distance: 1463, departureDay: 2 },
      { sequence: 11, station: { code: "SVDK", name: "Shri Mata Vaishno Devi Katra" }, isHalt: true, platform: "2", arrival: "16:30", departure: "--", haltMinutes: 0, distance: 1540, departureDay: 2 }
    ]
  },
  "22436": {
    train: {
      number: "22436",
      name: "New Delhi - Varanasi Vande Bharat Express",
      type: "Vande Bharat Express",
      category: "Superfast Semi-High Speed",
      source: { code: "NDLS", name: "New Delhi" },
      destination: { code: "BSB", name: "Varanasi Jn" },
      runDays: ["mon", "tue", "wed", "fri", "sat", "sun"],
      distance: 759,
      duration: 480,
      avgSpeed: 94.8,
      maxSpeed: 130.0,
      totalHalts: 4,
      returnTrain: "22435",
      coachPosition: "ENG-C1-C2-C3-C4-C5-C6-C7-EC1-EC2-C8-C9-C10-C11-C12-ENG"
    },
    route: [
      { sequence: 1, station: { code: "NDLS", name: "New Delhi" }, isHalt: true, platform: "16", arrival: "--", departure: "06:00", haltMinutes: 0, distance: 0, departureDay: 1 },
      { sequence: 2, station: { code: "CNB", name: "Kanpur Central" }, isHalt: true, platform: "5", arrival: "10:08", departure: "10:10", haltMinutes: 2, distance: 440, departureDay: 1 },
      { sequence: 3, station: { code: "PRYJ", name: "Prayagraj Jn" }, isHalt: true, platform: "6", arrival: "12:08", departure: "12:10", haltMinutes: 2, distance: 635, departureDay: 1 },
      { sequence: 4, station: { code: "BSB", name: "Varanasi Jn" }, isHalt: true, platform: "1", arrival: "14:00", departure: "--", haltMinutes: 0, distance: 759, departureDay: 1 }
    ]
  },
  "12002": {
    train: {
      number: "12002",
      name: "New Delhi - Rani Kamalapati (Bhopal) Shatabdi Express",
      type: "Shatabdi Express",
      category: "Superfast Premium",
      source: { code: "NDLS", name: "New Delhi" },
      destination: { code: "RKMP", name: "Rani Kamalapati" },
      runDays: ["mon", "tue", "wed", "thu", "fri", "sat", "sun"],
      distance: 708,
      duration: 510,
      avgSpeed: 83.3,
      maxSpeed: 150.0,
      totalHalts: 8,
      returnTrain: "12001",
      coachPosition: "ENG-LPR-C1-C2-C3-C4-C5-C6-C7-C8-C9-E1-E2-LPR"
    },
    route: [
      { sequence: 1, station: { code: "NDLS", name: "New Delhi" }, isHalt: true, platform: "1", arrival: "--", departure: "06:00", haltMinutes: 0, distance: 0, departureDay: 1 },
      { sequence: 2, station: { code: "MTJ", name: "Mathura Jn" }, isHalt: true, platform: "1", arrival: "07:19", departure: "07:20", haltMinutes: 1, distance: 141, departureDay: 1 },
      { sequence: 3, station: { code: "AGC", name: "Agra Cantt" }, isHalt: true, platform: "1", arrival: "07:50", departure: "07:55", haltMinutes: 5, distance: 195, departureDay: 1 },
      { sequence: 4, station: { code: "GWL", name: "Gwalior Jn" }, isHalt: true, platform: "1", arrival: "09:23", departure: "09:28", haltMinutes: 5, distance: 313, departureDay: 1 },
      { sequence: 5, station: { code: "VGLJ", name: "V Lakshmibai Jhansi Jn" }, isHalt: true, platform: "1", arrival: "10:45", departure: "10:50", haltMinutes: 5, distance: 410, departureDay: 1 },
      { sequence: 6, station: { code: "BPL", name: "Bhopal Jn" }, isHalt: true, platform: "1", arrival: "14:07", departure: "14:12", haltMinutes: 5, distance: 702, departureDay: 1 },
      { sequence: 7, station: { code: "RKMP", name: "Rani Kamalapati" }, isHalt: true, platform: "5", arrival: "14:40", departure: "--", haltMinutes: 0, distance: 708, departureDay: 1 }
    ]
  },
  "16318": {
    train: {
      number: "16318",
      name: "Himsagar Express (Shri Mata Vaishno Devi Katra - Kanyakumari)",
      type: "Express",
      category: "Long Distance Intercity",
      source: { code: "SVDK", name: "Shri Mata Vaishno Devi Katra" },
      destination: { code: "CAPE", name: "Kanyakumari" },
      runDays: ["mon"],
      distance: 3789,
      duration: 4320,
      avgSpeed: 52.6,
      maxSpeed: 110.0,
      totalHalts: 66,
      returnTrain: "16317",
      coachPosition: "ENG-GEN-GEN-S1-S2-S3-S4-S5-S6-PC-B1-B2-B3-B4-B5-A1-GEN-SLR"
    },
    route: [
      { sequence: 1, station: { code: "SVDK", name: "SMVD Katra" }, isHalt: true, platform: "2", arrival: "--", departure: "22:30", haltMinutes: 0, distance: 0, departureDay: 1 },
      { sequence: 2, station: { code: "JAT", name: "Jammu Tawi" }, isHalt: true, platform: "1", arrival: "00:05", departure: "00:15", haltMinutes: 10, distance: 78, departureDay: 2 },
      { sequence: 3, station: { code: "NDLS", name: "New Delhi" }, isHalt: true, platform: "4", arrival: "13:50", departure: "14:15", haltMinutes: 25, distance: 655, departureDay: 2 },
      { sequence: 4, station: { code: "AGC", name: "Agra Cantt" }, isHalt: true, platform: "1", arrival: "16:50", departure: "16:55", haltMinutes: 5, distance: 850, departureDay: 2 },
      { sequence: 5, station: { code: "BPL", name: "Bhopal Jn" }, isHalt: true, platform: "1", arrival: "02:05", departure: "02:10", haltMinutes: 5, distance: 1360, departureDay: 3 },
      { sequence: 6, station: { code: "NGP", name: "Nagpur Jn" }, isHalt: true, platform: "2", arrival: "09:00", departure: "09:05", haltMinutes: 5, distance: 1750, departureDay: 3 },
      { sequence: 7, station: { code: "WL", name: "Warangal" }, isHalt: true, platform: "1", arrival: "17:10", departure: "17:15", haltMinutes: 5, distance: 2200, departureDay: 3 },
      { sequence: 8, station: { code: "BZA", name: "Vijayawada Jn" }, isHalt: true, platform: "1", arrival: "21:10", departure: "21:20", haltMinutes: 10, distance: 2410, departureDay: 3 },
      { sequence: 9, station: { code: "MAS", name: "MGR Chennai Central" }, isHalt: true, platform: "5", arrival: "05:00", departure: "05:25", haltMinutes: 25, distance: 2840, departureDay: 4 },
      { sequence: 10, station: { code: "ED", name: "Erode Jn" }, isHalt: true, platform: "2", arrival: "12:15", departure: "12:20", haltMinutes: 5, distance: 3230, departureDay: 4 },
      { sequence: 11, station: { code: "CBE", name: "Coimbatore Jn" }, isHalt: true, platform: "3", arrival: "14:00", departure: "14:05", haltMinutes: 5, distance: 3330, departureDay: 4 },
      { sequence: 12, station: { code: "TCR", name: "Thrisur" }, isHalt: true, platform: "1", arrival: "16:40", departure: "16:43", haltMinutes: 3, distance: 3460, departureDay: 4 },
      { sequence: 13, station: { code: "ERS", name: "Ernakulam Town" }, isHalt: true, platform: "2", arrival: "18:20", departure: "18:25", haltMinutes: 5, distance: 3535, departureDay: 4 },
      { sequence: 14, station: { code: "TVC", name: "Thiruvananthapuram Central" }, isHalt: true, platform: "1", arrival: "22:15", departure: "22:20", haltMinutes: 5, distance: 3702, departureDay: 4 },
      { sequence: 15, station: { code: "CAPE", name: "Kanyakumari" }, isHalt: true, platform: "1", arrival: "23:20", departure: "--", haltMinutes: 0, distance: 3789, departureDay: 4 }
    ]
  }
};

let currentTrainData = null;
let currentRouteList = [];

/**
 * Format duration minutes into "15h 40m"
 */
function formatDuration(minutes) {
  if (!minutes) return '--';
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return `${h}h ${m}m`;
}


/**
 * Render running days pills
 */
function renderRunningDays(runDays) {
  const container = document.getElementById('ts-running-days');
  if (!container) return;

  const days = [
    { key: 'mon', letter: 'M' },
    { key: 'tue', letter: 'T' },
    { key: 'wed', letter: 'W' },
    { key: 'thu', letter: 'T' },
    { key: 'fri', letter: 'F' },
    { key: 'sat', letter: 'S' },
    { key: 'sun', letter: 'S' }
  ];

  const daysSet = new Set((runDays || []).map(d => String(d).toLowerCase().slice(0, 3)));
  container.innerHTML = days.map(d => {
    const isActive = daysSet.has(d.key);
    return `<span class="day-pill ${isActive ? 'active' : ''}" title="${d.key.toUpperCase()}">${d.letter}</span>`;
  }).join('');
}

/**
 * Render the timetable halt rows
 */
function renderTimetable(routes, filterQuery = '') {
  const tbody = document.getElementById('ts-table-body');
  const subtitle = document.getElementById('ts-table-subtitle');
  if (!tbody) return;

  let filtered = routes.filter(r => r.isHalt !== false);

  if (filterQuery) {
    const q = filterQuery.toLowerCase().trim();
    filtered = filtered.filter(r => {
      const code = (r.station?.code || '').toLowerCase();
      const name = (r.station?.name || '').toLowerCase();
      return code.includes(q) || name.includes(q);
    });
  }

  if (subtitle) {
    subtitle.textContent = `Showing ${filtered.length} stoppage stations ${filterQuery ? `(matching "${filterQuery}")` : ''}`;
  }

  if (filtered.length === 0) {
    tbody.innerHTML = `<tr><td colspan="8" style="text-align:center; padding: 40px; color: #64748b;">
      No halt stations matched your search "${filterQuery}".
    </td></tr>`;
    return;
  }

  const totalStops = filtered.length;
  tbody.innerHTML = filtered.map((halt, idx) => {
    const isSource = idx === 0;
    const isDest = idx === totalStops - 1;
    let rowClass = '';
    if (isSource) rowClass = 'source-halt';
    if (isDest) rowClass = 'dest-halt';

    const stnCode = halt.station?.code || '---';
    const stnName = halt.station?.name || 'Unknown Station';
    const arr = halt.arrival || '--';
    const dep = halt.departure || '--';
    const haltMins = halt.haltMinutes !== undefined ? (halt.haltMinutes === 0 ? 'Source / Terminus' : `${halt.haltMinutes} mins`) : '--';
    const pf = halt.platform ? `<span class="ts-pf-badge">PF ${halt.platform}</span>` : '<span style="color:#94a3b8;">--</span>';
    const dist = halt.distance !== undefined ? `${halt.distance} km` : '--';
    const day = halt.departureDay || halt.day || (idx === 0 ? 1 : '--');

    return `<tr class="${rowClass}">
      <td style="font-weight: 700; color: #64748b;">${idx + 1}</td>
      <td>
        <span class="ts-station-code">${stnCode}</span>
        <strong>${stnName}</strong>
        ${isSource ? ' <span style="font-size:11px;color:#16a34a;font-weight:700;">[ORIGIN]</span>' : ''}
        ${isDest ? ' <span style="font-size:11px;color:#2563eb;font-weight:700;">[TERMINUS]</span>' : ''}
      </td>
      <td>${arr}</td>
      <td><strong>${dep}</strong></td>
      <td><span class="ts-halt-badge">${haltMins}</span></td>
      <td>${pf}</td>
      <td>${dist}</td>
      <td><span style="font-size:12px;background:#f1f5f9;padding:2px 8px;border-radius:4px;">Day ${day}</span></td>
    </tr>`;
  }).join('');
}

/**
 * Populate full train schedule view with retrieved data
 */
function displayTrainSchedule(data) {
  const train = data.train || {};
  const route = data.route || [];

  currentTrainData = train;
  currentRouteList = route;

  // Overview elements
  document.getElementById('ts-train-number').textContent = train.number || '--';
  document.getElementById('ts-train-name').textContent = train.name || 'Express Train';
  document.getElementById('ts-train-cat').textContent = train.category || 'Express';
  document.getElementById('ts-train-type').textContent = train.type || 'Passenger';

  if (train.returnTrain) {
    document.getElementById('ts-train-return').style.display = 'inline-block';
    document.getElementById('ts-train-return').textContent = `Return: ${train.returnTrain}`;
  } else {
    document.getElementById('ts-train-return').style.display = 'none';
  }

  // Endpoints
  const srcCode = train.source?.code || (route[0]?.station?.code) || 'NDLS';
  const srcName = train.source?.name || (route[0]?.station?.name) || 'Source';
  const destCode = train.destination?.code || (route[route.length - 1]?.station?.code) || 'DEST';
  const destName = train.destination?.name || (route[route.length - 1]?.station?.name) || 'Terminus';
  document.getElementById('ts-route-endpoints').textContent = `${srcCode} (${srcName}) ➔ ${destCode} (${destName})`;

  // Stats
  document.getElementById('ts-total-distance').textContent = train.distance ? `${train.distance} km` : `${route[route.length - 1]?.distance || '--'} km`;
  document.getElementById('ts-total-duration').textContent = formatDuration(train.duration);
  document.getElementById('ts-speed-stats').textContent = `${train.avgSpeed || '--'} km/h ${train.maxSpeed ? `(Max ${train.maxSpeed})` : ''}`;
  document.getElementById('ts-total-halts').textContent = `${train.totalHalts || route.filter(r => r.isHalt !== false).length} Stations`;

  // Action button: Check Seat Availability
  const availBtn = document.getElementById('ts-check-seats-btn');
  if (availBtn) {
    availBtn.href = `seat-availability.html?train=${encodeURIComponent(train.number || '')}&from=${encodeURIComponent(srcCode)}&to=${encodeURIComponent(destCode)}`;
  }

  // Running days
  renderRunningDays(train.runDays);

  // Coach strip
  renderCoachStrip(train.coachPosition);

  // Timetable
  renderTimetable(route);

  // Show results
  document.getElementById('ts-loading').style.display = 'none';
  document.getElementById('ts-error').style.display = 'none';
  document.getElementById('ts-results-container').style.display = 'block';

  if (window.lucide) {
    window.lucide.createIcons();
  }
}

/**
 * Load train schedule via RailRadar API with fallback
 */
export async function loadTrainSchedule(trainNo) {
  const cleanNo = String(trainNo || '12952').trim();
  if (!cleanNo) return;

  // Show loading
  document.getElementById('ts-loading').style.display = 'block';
  document.getElementById('ts-error').style.display = 'none';
  document.getElementById('ts-results-container').style.display = 'none';

  // Update input
  const input = document.getElementById('ts-train-input');
  if (input) input.value = cleanNo;

  // Update chip active states
  document.querySelectorAll('.ts-chip').forEach(c => {
    if (c.dataset.train === cleanNo) {
      c.classList.add('active');
    } else {
      c.classList.remove('active');
    }
  });

  try {
    const res = await getTrainSchedule(cleanNo);
    if (res.success && res.data && res.data.train) {
      displayTrainSchedule(res.data);
      return;
    }
  } catch (err) {
    console.warn(`[TrainSchedule] RailRadar API error for ${cleanNo}:`, err);
  }

  // Fallback Check
  if (FALLBACK_SCHEDULES[cleanNo]) {
    displayTrainSchedule(FALLBACK_SCHEDULES[cleanNo]);
    return;
  }

  // Try finding in fallback by partial name or number
  const matchedKey = Object.keys(FALLBACK_SCHEDULES).find(k => {
    const item = FALLBACK_SCHEDULES[k];
    return k === cleanNo || item.train.name.toLowerCase().includes(cleanNo.toLowerCase());
  });

  if (matchedKey) {
    displayTrainSchedule(FALLBACK_SCHEDULES[matchedKey]);
    return;
  }

  // Show Error
  document.getElementById('ts-loading').style.display = 'none';
  document.getElementById('ts-results-container').style.display = 'none';
  document.getElementById('ts-error').style.display = 'block';
  document.getElementById('ts-error-title').textContent = `Train "${cleanNo}" Not Found`;
  document.getElementById('ts-error-desc').textContent = 'Please check the 5-digit Indian Railways train number and try again, or click one of the popular express train chips above.';

  if (window.lucide) {
    window.lucide.createIcons();
  }
}

// Make global for onclick in browser
if (typeof window !== 'undefined') {
  window.loadTrainSchedule = loadTrainSchedule;
}

/**
 * Initialize on DOM Ready
 */
function initTrainSchedule() {
  // Read URL query params
  const urlParams = new URLSearchParams(window.location.search);
  const trainFromUrl = urlParams.get('train') || urlParams.get('trainNo') || '12952';

  // Form submission
  const form = document.getElementById('train-sched-form');
  const input = document.getElementById('ts-train-input');
  const clearBtn = document.getElementById('ts-clear-btn');
  const retryBtn = document.getElementById('ts-error-retry-btn');
  const filterInput = document.getElementById('ts-station-filter');

  if (input && clearBtn) {
    input.addEventListener('input', () => {
      clearBtn.style.display = input.value.trim() ? 'flex' : 'none';
    });
    clearBtn.addEventListener('click', () => {
      input.value = '';
      clearBtn.style.display = 'none';
      input.focus();
    });
  }

  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const val = input.value.trim();
      if (val) loadTrainSchedule(val);
    });
  }

  // Chips click
  document.querySelectorAll('.ts-chip').forEach(chip => {
    chip.addEventListener('click', () => {
      const train = chip.dataset.train;
      if (train) loadTrainSchedule(train);
    });
  });

  // Table filter
  if (filterInput) {
    filterInput.addEventListener('input', (e) => {
      if (currentRouteList) {
        renderTimetable(currentRouteList, e.target.value);
      }
    });
  }

  if (retryBtn) {
    retryBtn.addEventListener('click', () => loadTrainSchedule('12952'));
  }

  // Load initial train & auth
  initAuth({ autoPrompt: false });
  loadTrainSchedule(trainFromUrl);
}

if (typeof document !== 'undefined') {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initTrainSchedule);
  } else {
    initTrainSchedule();
  }
}
