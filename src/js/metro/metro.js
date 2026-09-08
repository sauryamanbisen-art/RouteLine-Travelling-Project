/**
 * RouteLine — Metro QR Ticket Booking & QR Pass Engine
 * Supports Delhi, Mumbai, Bengaluru, Hyderabad, Chennai, and Kolkata Metros
 */

import { saveBookedTicket } from '../ticket/ticket.js';
import { openPNRModal, initPNRModule } from '../train/pnr-status.js';
import { requireAuthentication, isAuthenticated, initAuth, getCurrentUser } from '../auth/auth.js';

// Comprehensive Multi-City Metro Database
const METRO_DATABASE = {
  delhi: {
    name: "Delhi Metro (DMRC)",
    tag: "All 10 Lines Active",
    lines: [
      { id: "all", name: "All Lines", color: "#0f172a" },
      { id: "yellow", name: "Yellow Line", color: "#eab308" },
      { id: "blue", name: "Blue Line", color: "#2563eb" },
      { id: "red", name: "Red Line", color: "#ef4444" },
      { id: "violet", name: "Violet Line", color: "#9333ea" },
      { id: "airport", name: "Airport Express", color: "#f97316" },
      { id: "magenta", name: "Magenta Line", color: "#ec4899" }
    ],
    stations: [
      { id: "rajiv_chowk", name: "Rajiv Chowk (Connaught Place)", line: "yellow", lineName: "Yellow Line", interchange: true },
      { id: "kashmere_gate", name: "Kashmere Gate", line: "yellow", lineName: "Yellow Line", interchange: true },
      { id: "new_delhi_stn", name: "New Delhi (Railway Stn)", line: "yellow", lineName: "Yellow Line", interchange: true },
      { id: "central_sec", name: "Central Secretariat", line: "yellow", lineName: "Yellow Line", interchange: true },
      { id: "hauz_khas", name: "Hauz Khas", line: "yellow", lineName: "Yellow Line", interchange: true },
      { id: "huda_city", name: "Millennium City Centre (Huda)", line: "yellow", lineName: "Yellow Line" },
      { id: "chandni_chowk", name: "Chandni Chowk", line: "yellow", lineName: "Yellow Line" },
      { id: "vishwavidyalaya", name: "Vishwavidyalaya (Delhi Univ)", line: "yellow", lineName: "Yellow Line" },
      { id: "samaypur_badli", name: "Samaypur Badli", line: "yellow", lineName: "Yellow Line" },
      { id: "noida_sec_18", name: "Noida Sector 18 (Atta Market)", line: "blue", lineName: "Blue Line" },
      { id: "noida_elec_city", name: "Noida Electronic City", line: "blue", lineName: "Blue Line" },
      { id: "botanical_garden", name: "Botanical Garden", line: "blue", lineName: "Blue Line", interchange: true },
      { id: "vaishali", name: "Vaishali (Ghaziabad)", line: "blue", lineName: "Blue Line" },
      { id: "dwarka_sec_21", name: "Dwarka Sector 21", line: "blue", lineName: "Blue Line", interchange: true },
      { id: "igi_airport_t3", name: "IGI Airport (Terminal 3)", line: "airport", lineName: "Airport Express" },
      { id: "dhaula_kuan", name: "Dhaula Kuan", line: "airport", lineName: "Airport Express" },
      { id: "aerocity", name: "Delhi Aerocity", line: "airport", lineName: "Airport Express" },
      { id: "dilshad_garden", name: "Dilshad Garden", line: "red", lineName: "Red Line" },
      { id: "rithala", name: "Rithala", line: "red", lineName: "Red Line" },
      { id: "kalkaji_mandir", name: "Kalkaji Mandir", line: "violet", lineName: "Violet Line", interchange: true },
      { id: "badarpur_border", name: "Badarpur Border", line: "violet", lineName: "Violet Line" }
    ],
    popularRoutes: [
      { from: "rajiv_chowk", to: "huda_city", label: "Rajiv Chowk ➔ Huda City" },
      { from: "new_delhi_stn", to: "igi_airport_t3", label: "New Delhi ➔ IGI Airport" },
      { from: "kashmere_gate", to: "noida_sec_18", label: "Kashmere Gate ➔ Noida Sec 18" },
      { from: "hauz_khas", to: "botanical_garden", label: "Hauz Khas ➔ Botanical Garden" }
    ]
  },
  mumbai: {
    name: "Mumbai Metro (MMRDA / Metro One)",
    tag: "Lines 1, 2A, 7 & Aqua Line 3 Active",
    lines: [
      { id: "all", name: "All Lines", color: "#0f172a" },
      { id: "line1", name: "Blue Line 1 (Versova-Ghatkopar)", color: "#0284c7" },
      { id: "line2a", name: "Yellow Line 2A (Dahisar-Andheri W)", color: "#eab308" },
      { id: "line7", name: "Red Line 7 (Dahisar E-Gundavali)", color: "#ef4444" },
      { id: "line3", name: "Aqua Line 3 (Aarey-BKC)", color: "#06b6d4" }
    ],
    stations: [
      { id: "ghatkopar", name: "Ghatkopar (Railway Jn)", line: "line1", lineName: "Line 1 (Blue)", interchange: true },
      { id: "saki_naka", name: "Saki Naka", line: "line1", lineName: "Line 1 (Blue)" },
      { id: "marol_naka", name: "Marol Naka", line: "line1", lineName: "Line 1 (Blue)", interchange: true },
      { id: "western_exp", name: "Western Express Highway (WEH)", line: "line1", lineName: "Line 1 (Blue)" },
      { id: "andheri", name: "Andheri (Railway Station)", line: "line1", lineName: "Line 1 (Blue)", interchange: true },
      { id: "dn_nagar", name: "DN Nagar", line: "line1", lineName: "Line 1 (Blue)", interchange: true },
      { id: "versova", name: "Versova", line: "line1", lineName: "Line 1 (Blue)" },
      { id: "gundavali", name: "Gundavali (Andheri East)", line: "line7", lineName: "Line 7 (Red)", interchange: true },
      { id: "aarey_jvlr", name: "Aarey JVLR", line: "line7", lineName: "Line 7 (Red)", interchange: true },
      { id: "bkc", name: "Bandra Kurla Complex (BKC)", line: "line3", lineName: "Aqua Line 3" },
      { id: "csmia_t2", name: "CSMIA International Airport (T2)", line: "line3", lineName: "Aqua Line 3" },
      { id: "dahisar_east", name: "Dahisar East", line: "line7", lineName: "Line 7 (Red)" }
    ],
    popularRoutes: [
      { from: "ghatkopar", to: "versova", label: "Ghatkopar ➔ Versova" },
      { from: "andheri", to: "gundavali", label: "Andheri ➔ Gundavali" },
      { from: "bkc", to: "aarey_jvlr", label: "BKC ➔ Aarey JVLR" },
      { from: "marol_naka", to: "csmia_t2", label: "Marol Naka ➔ Airport T2" }
    ]
  },
  bangalore: {
    name: "Bengaluru (Namma Metro)",
    tag: "Purple & Green Lines Operational",
    lines: [
      { id: "all", name: "All Lines", color: "#0f172a" },
      { id: "purple", name: "Purple Line (Challaghatta-Whitefield)", color: "#7c3aed" },
      { id: "green", name: "Green Line (Nagasandra-Silk Inst.)", color: "#16a34a" }
    ],
    stations: [
      { id: "majestic", name: "Nadaprabhu Kempegowda Stn (Majestic)", line: "purple", lineName: "Purple Line", interchange: true },
      { id: "mg_road", name: "MG Road", line: "purple", lineName: "Purple Line" },
      { id: "cubbon_park", name: "Cubbon Park / Vidhana Soudha", line: "purple", lineName: "Purple Line" },
      { id: "indiranagar", name: "Indiranagar", line: "purple", lineName: "Purple Line" },
      { id: "baiyappanahalli", name: "Baiyappanahalli", line: "purple", lineName: "Purple Line" },
      { id: "kr_puram", name: "KR Puram (Railway Stn)", line: "purple", lineName: "Purple Line" },
      { id: "whitefield", name: "Whitefield (Kadugodi)", line: "purple", lineName: "Purple Line" },
      { id: "yeshwantpur", name: "Yeshwantpur (Railway Jn)", line: "green", lineName: "Green Line" },
      { id: "national_college", name: "National College (Basavanagudi)", line: "green", lineName: "Green Line" },
      { id: "silk_institute", name: "Silk Institute (Kanakapura Rd)", line: "green", lineName: "Green Line" }
    ],
    popularRoutes: [
      { from: "majestic", to: "whitefield", label: "Majestic ➔ Whitefield" },
      { from: "mg_road", to: "indiranagar", label: "MG Road ➔ Indiranagar" },
      { from: "majestic", to: "yeshwantpur", label: "Majestic ➔ Yeshwantpur" }
    ]
  },
  hyderabad: {
    name: "Hyderabad Metro (L&T Metro Rail)",
    tag: "Red, Blue & Green Lines",
    lines: [
      { id: "all", name: "All Lines", color: "#0f172a" },
      { id: "red", name: "Red Line (Miyapur-LB Nagar)", color: "#ef4444" },
      { id: "blue", name: "Blue Line (Nagole-Raidurg)", color: "#2563eb" },
      { id: "green", name: "Green Line (JBS-MGBS)", color: "#16a34a" }
    ],
    stations: [
      { id: "ameerpet", name: "Ameerpet", line: "red", lineName: "Red Line", interchange: true },
      { id: "mgbs", name: "MGBS (Bus Station)", line: "red", lineName: "Red Line", interchange: true },
      { id: "miyapur", name: "Miyapur", line: "red", lineName: "Red Line" },
      { id: "lb_nagar", name: "LB Nagar", line: "red", lineName: "Red Line" },
      { id: "secunderabad_east", name: "Secunderabad East", line: "blue", lineName: "Blue Line" },
      { id: "begumpet", name: "Begumpet", line: "blue", lineName: "Blue Line" },
      { id: "hitec_city", name: "Hitec City (Cyberabad)", line: "blue", lineName: "Blue Line" },
      { id: "raidurg", name: "Raidurg", line: "blue", lineName: "Blue Line" }
    ],
    popularRoutes: [
      { from: "miyapur", to: "ameerpet", label: "Miyapur ➔ Ameerpet" },
      { from: "secunderabad_east", to: "hitec_city", label: "Secunderabad ➔ Hitec City" },
      { from: "ameerpet", to: "raidurg", label: "Ameerpet ➔ Raidurg" }
    ]
  },
  chennai: {
    name: "Chennai Metro (CMRL)",
    tag: "Blue & Green Corridor Lines",
    lines: [
      { id: "all", name: "All Lines", color: "#0f172a" },
      { id: "blue", name: "Blue Line (Wimco Nagar-Airport)", color: "#0284c7" },
      { id: "green", name: "Green Line (Central-St Thomas Mount)", color: "#16a34a" }
    ],
    stations: [
      { id: "chennai_central", name: "Puratchi Thalaivar Dr. MGR Central", line: "blue", lineName: "Blue Line", interchange: true },
      { id: "chennai_airport", name: "Chennai International Airport", line: "blue", lineName: "Blue Line" },
      { id: "guindy", name: "Guindy (Railway Jn)", line: "blue", lineName: "Blue Line" },
      { id: "ag_dms", name: "AG - DMS", line: "blue", lineName: "Blue Line" },
      { id: "thousand_lights", name: "Thousand Lights", line: "blue", lineName: "Blue Line" },
      { id: "egmore", name: "Chennai Egmore", line: "green", lineName: "Green Line" },
      { id: "vadapalani", name: "Vadapalani", line: "green", lineName: "Green Line" },
      { id: "koyambedu", name: "Koyambedu (CMBT Bus Terminus)", line: "green", lineName: "Green Line" }
    ],
    popularRoutes: [
      { from: "chennai_central", to: "chennai_airport", label: "Central ➔ Chennai Airport" },
      { from: "egmore", to: "koyambedu", label: "Egmore ➔ Koyambedu" }
    ]
  },
  kolkata: {
    name: "Kolkata Metro (Metro Railway)",
    tag: "North-South & Underwater East-West",
    lines: [
      { id: "all", name: "All Lines", color: "#0f172a" },
      { id: "blue", name: "Blue Line (Dakshineswar-Kavi Subhash)", color: "#2563eb" },
      { id: "green", name: "Green Line (Underwater East-West)", color: "#059669" }
    ],
    stations: [
      { id: "howrah", name: "Howrah (Deepest Metro in India)", line: "green", lineName: "Green Line (Underwater)" },
      { id: "howrah_maidan", name: "Howrah Maidan", line: "green", lineName: "Green Line (Underwater)" },
      { id: "esplanade", name: "Esplanade", line: "green", lineName: "Green Line", interchange: true },
      { id: "sealdah", name: "Sealdah (Railway Station)", line: "green", lineName: "Green Line" },
      { id: "salt_lake_sec_v", name: "Salt Lake Sector V", line: "green", lineName: "Green Line" },
      { id: "park_street", name: "Park Street", line: "blue", lineName: "Blue Line" },
      { id: "dum_dum", name: "Dum Dum Jn", line: "blue", lineName: "Blue Line" },
      { id: "dakshineswar", name: "Dakshineswar Temple", line: "blue", lineName: "Blue Line" }
    ],
    popularRoutes: [
      { from: "howrah", to: "esplanade", label: "Howrah ➔ Esplanade (Underwater)" },
      { from: "sealdah", to: "salt_lake_sec_v", label: "Sealdah ➔ Sector V" },
      { from: "dum_dum", to: "park_street", label: "Dum Dum ➔ Park Street" }
    ]
  }
};

let currentCity = "delhi";
let currentLineFilter = "all";
let passengerCount = 1;
let journeyType = "single"; // single, return, tourist
let countdownInterval = null;

/**
 * Get City Config
 */
function getCityData() {
  return METRO_DATABASE[currentCity] || METRO_DATABASE.delhi;
}

/**
 * Populate Line Filter Chips
 */
function renderLineChips() {
  const container = document.getElementById('metro-lines-filter');
  if (!container) return;

  const cityData = getCityData();
  container.innerHTML = cityData.lines.map(line => {
    const isActive = line.id === currentLineFilter;
    return `
      <button type="button" class="line-chip ${isActive ? 'active' : ''}" data-line="${line.id}">
        <span class="line-dot" style="background:${line.color};"></span>
        <span>${line.name}</span>
      </button>
    `;
  }).join('');

  container.querySelectorAll('.line-chip').forEach(btn => {
    btn.addEventListener('click', () => {
      currentLineFilter = btn.dataset.line;
      renderLineChips();
      populateStationDropdowns();
      calculateRouteAndFare();
    });
  });
}

/**
 * Populate Origin and Destination Station Selects
 */
function populateStationDropdowns() {
  const cityData = getCityData();
  const fromSelect = document.getElementById('metro-from-select');
  const toSelect = document.getElementById('metro-to-select');
  if (!fromSelect || !toSelect) return;

  let stations = cityData.stations;
  if (currentLineFilter !== 'all') {
    stations = stations.filter(s => s.line === currentLineFilter);
  }

  // Preserve selections if possible
  const prevFrom = fromSelect.value;
  const prevTo = toSelect.value;

  const optionsHtml = stations.map(s => {
    return `<option value="${s.id}">${s.name} (${s.lineName})</option>`;
  }).join('');

  fromSelect.innerHTML = optionsHtml;
  toSelect.innerHTML = optionsHtml;

  // Defaults
  if (stations.some(s => s.id === prevFrom)) {
    fromSelect.value = prevFrom;
  } else if (stations.length > 0) {
    fromSelect.value = stations[0].id;
  }

  if (stations.some(s => s.id === prevTo && s.id !== fromSelect.value)) {
    toSelect.value = prevTo;
  } else if (stations.length > 1) {
    toSelect.value = stations[1].id;
  } else if (stations.length > 0) {
    toSelect.value = stations[0].id;
  }
}

/**
 * Populate Popular Route Chips for Current City
 */
function renderPopularChips() {
  const container = document.getElementById('metro-popular-chips');
  if (!container) return;

  const cityData = getCityData();
  container.innerHTML = (cityData.popularRoutes || []).map(r => {
    return `<button type="button" class="route-chip" data-from="${r.from}" data-to="${r.to}">${r.label}</button>`;
  }).join('');

  container.querySelectorAll('.route-chip').forEach(btn => {
    btn.addEventListener('click', () => {
      currentLineFilter = 'all';
      renderLineChips();
      populateStationDropdowns();

      const fromSelect = document.getElementById('metro-from-select');
      const toSelect = document.getElementById('metro-to-select');
      if (fromSelect) fromSelect.value = btn.dataset.from;
      if (toSelect) toSelect.value = btn.dataset.to;

      calculateRouteAndFare();
    });
  });
}

/**
 * Calculate Route, Interchanges, Travel Time, and Fare
 */
function calculateRouteAndFare() {
  const cityData = getCityData();
  const fromSelect = document.getElementById('metro-from-select');
  const toSelect = document.getElementById('metro-to-select');
  if (!fromSelect || !toSelect) return;

  const fromId = fromSelect.value;
  const toId = toSelect.value;

  const fromStn = cityData.stations.find(s => s.id === fromId) || cityData.stations[0];
  const toStn = cityData.stations.find(s => s.id === toId) || cityData.stations[1] || fromStn;

  // Summary header display
  document.getElementById('summary-from-name').textContent = fromStn.name;
  document.getElementById('summary-from-line').textContent = fromStn.lineName;
  document.getElementById('summary-to-name').textContent = toStn.name;
  document.getElementById('summary-to-line').textContent = toStn.lineName;

  // Stops calculation (deterministic based on index distance)
  const fromIdx = cityData.stations.findIndex(s => s.id === fromId);
  const toIdx = cityData.stations.findIndex(s => s.id === toId);
  const stopsDiff = Math.max(1, Math.abs(fromIdx - toIdx));
  const stopsCount = fromId === toId ? 0 : stopsDiff;

  document.getElementById('summary-stops-count').innerHTML = `<i data-lucide="navigation" class="icon-tiny"></i> ${stopsCount} Station${stopsCount === 1 ? '' : 's'}`;

  // Time calculation: ~2.2 mins per stop
  const travelMins = Math.max(4, Math.round(stopsCount * 2.2 + (fromStn.line !== toStn.line ? 6 : 0)));
  document.getElementById('summary-travel-time').innerHTML = `<i data-lucide="clock" class="icon-tiny"></i> ~${travelMins} Mins`;

  // Interchange check
  const interchangeBox = document.getElementById('metro-interchange-box');
  const interchangeText = document.getElementById('interchange-details');
  if (fromStn.line !== toStn.line && fromId !== toId) {
    interchangeBox.style.display = 'flex';
    // Find interchange station
    const icStn = cityData.stations.find(s => s.interchange && (s.line === fromStn.line || s.line === toStn.line)) || { name: "Central Interchange" };
    interchangeText.textContent = `Change at ${icStn.name} from ${fromStn.lineName} to ${toStn.lineName}.`;
  } else {
    interchangeBox.style.display = 'none';
  }

  // Fare Calculation
  let baseFare = 20;
  if (fromStn.line === 'airport' || toStn.line === 'airport') {
    baseFare = 60; // Airport Express
  } else if (stopsCount <= 3) {
    baseFare = 20;
  } else if (stopsCount <= 8) {
    baseFare = 30;
  } else if (stopsCount <= 14) {
    baseFare = 40;
  } else {
    baseFare = 50;
  }

  if (journeyType === 'return') {
    baseFare = Math.round(baseFare * 1.8); // 10% discount on round-trip
  } else if (journeyType === 'tourist') {
    baseFare = 150; // 1-day unlimited tourist card
  }

  const totalFare = baseFare * passengerCount;

  // Update summary table
  document.getElementById('summary-single-fare').textContent = `₹${baseFare}`;
  document.getElementById('summary-pax-count').textContent = `${passengerCount} Person${passengerCount > 1 ? 's' : ''}`;
  document.getElementById('summary-journey-type').textContent = 
    journeyType === 'return' ? 'Return Journey Token' : 
    (journeyType === 'tourist' ? '1-Day Unlimited Tourist Pass' : 'Single Journey Token (SJT)');
  document.getElementById('summary-total-price').textContent = `₹${totalFare}`;
  document.getElementById('metro-btn-total-fare').textContent = `₹${totalFare}`;

  if (window.lucide) {
    window.lucide.createIcons();
  }
}

/**
 * Generate Authentic SVG QR Pattern
 */
function generateSvgQr(codeString) {
  // Generates crisp, realistic 21x21 QR SVG pattern with finder patterns
  const size = 21;
  const matrix = [];
  for (let r = 0; r < size; r++) {
    matrix[r] = [];
    for (let c = 0; c < size; c++) {
      matrix[r][c] = 0;
    }
  }

  // Draw 7x7 Finder Pattern at (row, col)
  function drawFinder(sr, sc) {
    for (let r = 0; r < 7; r++) {
      for (let c = 0; c < 7; c++) {
        if (r === 0 || r === 6 || c === 0 || c === 6 || (r >= 2 && r <= 4 && c >= 2 && c <= 4)) {
          matrix[sr + r][sc + c] = 1;
        }
      }
    }
  }

  drawFinder(0, 0); // Top-left
  drawFinder(0, size - 7); // Top-right
  drawFinder(size - 7, 0); // Bottom-left

  // Pseudo-random deterministic fill based on hash
  let hash = 0;
  for (let i = 0; i < codeString.length; i++) {
    hash = ((hash << 5) - hash) + codeString.charCodeAt(i);
    hash |= 0;
  }

  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      // Don't overwrite finders
      const inTL = r < 8 && c < 8;
      const inTR = r < 8 && c >= size - 8;
      const inBL = r >= size - 8 && c < 8;
      if (!inTL && !inTR && !inBL) {
        if ((r % 2 === 0 && c % 3 === 0) || ((r + c + (hash % 7)) % 2 === 0)) {
          matrix[r][c] = 1;
        }
      }
    }
  }

  // Build SVG
  const cellSize = 7;
  const svgDim = size * cellSize;
  let rects = '';
  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      if (matrix[r][c] === 1) {
        rects += `<rect x="${c * cellSize}" y="${r * cellSize}" width="${cellSize}" height="${cellSize}" fill="#0f172a" />`;
      }
    }
  }

  return `<svg width="${svgDim}" height="${svgDim}" viewBox="0 0 ${svgDim} ${svgDim}" xmlns="http://www.w3.org/2000/svg">
    <rect width="100%" height="100%" fill="#ffffff" />
    ${rects}
  </svg>`;
}

/**
 * Handle Booking Submission & QR Pass Generation
 */
function handleBookingSubmit() {
  if (!isAuthenticated()) {
    requireAuthentication(() => handleBookingSubmit());
    return;
  }

  const cityData = getCityData();
  const fromSelect = document.getElementById('metro-from-select');
  const toSelect = document.getElementById('metro-to-select');
  if (!fromSelect || !toSelect) return;

  const fromStn = cityData.stations.find(s => s.id === fromSelect.value);
  const toStn = cityData.stations.find(s => s.id === toSelect.value);

  if (fromStn.id === toStn.id) {
    alert("Please select different origin and destination stations.");
    return;
  }

  // Calculate fare
  const totalAmountStr = document.getElementById('summary-total-price').textContent.replace('₹', '');
  const totalFare = parseInt(totalAmountStr, 10) || 40;

  // Generate unique Token ID & PNR
  const randomNum = Math.floor(100000 + Math.random() * 900000);
  const tokenId = `${currentCity.slice(0, 3).toUpperCase()}-SJT-${randomNum}`;
  const pnr = `8${Math.floor(100000000 + Math.random() * 900000000)}`;

  // Populate QR Modal
  document.getElementById('ticket-modal-network-title').textContent = cityData.name;
  document.getElementById('ticket-origin-stn').textContent = fromStn.name;
  document.getElementById('ticket-dest-stn').textContent = toStn.name;
  document.getElementById('ticket-token-id').textContent = tokenId;
  document.getElementById('ticket-pax').textContent = `${passengerCount} Adult${passengerCount > 1 ? 's' : ''}`;
  document.getElementById('ticket-fare-paid').textContent = `₹${totalFare}`;
  document.getElementById('ticket-pass-type').textContent = 
    journeyType === 'return' ? 'Return Journey' : (journeyType === 'tourist' ? '1-Day Pass' : 'Single Journey');

  const now = new Date();
  document.getElementById('ticket-issued-time').textContent = `Today, ${now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;

  // Render SVG QR
  const qrContainer = document.getElementById('ticket-dynamic-qr');
  if (qrContainer) {
    qrContainer.innerHTML = generateSvgQr(tokenId);
  }

  // Start 120-minute validity countdown
  startCountdown(120 * 60);

  // Save Booked Ticket record to localStorage
  const bookedRecord = {
    pnr: pnr,
    trainNumber: `${currentCity.toUpperCase()}-METRO`,
    trainName: `${cityData.name} QR Boarding Pass`,
    classCode: "QR-PASS",
    journeyDate: now.toISOString().split('T')[0],
    fromStationCode: fromStn.id.toUpperCase().slice(0, 4),
    fromStationName: fromStn.name,
    toStationCode: toStn.id.toUpperCase().slice(0, 4),
    toStationName: toStn.name,
    departureTime: now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    arrivalTime: "+120 Mins Gate Window",
    isConfirmed: true,
    chartStatus: "Instant Digital Token",
    bookingTime: now.toISOString(),
    fare: {
      baseFare: totalFare,
      reservationFee: 0,
      superfastFee: 0,
      tatkalFee: 0,
      gst: 0,
      totalFare: totalFare
    },
    passengers: [
      {
        name: `Primary Rider (${passengerCount} Pax)`,
        age: 28,
        gender: "Adult",
        berth: `Token ${tokenId}`,
        coach: "AFC GATE",
        status: "VALID"
      }
    ]
  };

  saveBookedTicket(bookedRecord);

  // Show Modal
  const modal = document.getElementById('metro-qr-modal');
  if (modal) {
    modal.style.display = 'flex';
  }

  if (window.lucide) {
    window.lucide.createIcons();
  }
}

/**
 * Countdown timer
 */
function startCountdown(seconds) {
  if (countdownInterval) clearInterval(countdownInterval);
  let rem = seconds;

  const timerEl = document.getElementById('ticket-countdown-timer');

  function update() {
    if (rem <= 0) {
      clearInterval(countdownInterval);
      if (timerEl) timerEl.textContent = "Expired";
      return;
    }
    const m = Math.floor(rem / 60);
    const s = rem % 60;
    if (timerEl) {
      timerEl.textContent = `${m}m ${s < 10 ? '0' : ''}${s}s`;
    }
    rem--;
  }

  update();
  countdownInterval = setInterval(update, 1000);
}

/**
 * Initialize
 */
function initMetro() {
  // City Tabs
  document.querySelectorAll('.metro-city-tab').forEach(tab => {
    tab.addEventListener('click', () => {
      document.querySelectorAll('.metro-city-tab').forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      currentCity = tab.dataset.city;
      currentLineFilter = 'all';

      const cityData = getCityData();
      document.getElementById('metro-selected-city-title').textContent = `${cityData.name} Route`;
      document.getElementById('metro-system-tag').textContent = cityData.tag;

      renderLineChips();
      populateStationDropdowns();
      renderPopularChips();
      calculateRouteAndFare();
    });
  });

  // Station Selectors
  const fromSelect = document.getElementById('metro-from-select');
  const toSelect = document.getElementById('metro-to-select');
  if (fromSelect) fromSelect.addEventListener('change', calculateRouteAndFare);
  if (toSelect) toSelect.addEventListener('change', calculateRouteAndFare);

  // Swap Button
  const swapBtn = document.getElementById('metro-swap-btn');
  if (swapBtn) {
    swapBtn.addEventListener('click', () => {
      const temp = fromSelect.value;
      fromSelect.value = toSelect.value;
      toSelect.value = temp;
      calculateRouteAndFare();
    });
  }

  // Journey Type Pills
  document.querySelectorAll('#metro-journey-type .pill-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('#metro-journey-type .pill-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      journeyType = btn.dataset.type;
      calculateRouteAndFare();
    });
  });

  // Pax Counter
  const minusBtn = document.getElementById('pax-minus');
  const plusBtn = document.getElementById('pax-plus');
  const paxValue = document.getElementById('pax-count');

  if (minusBtn && plusBtn && paxValue) {
    minusBtn.addEventListener('click', () => {
      if (passengerCount > 1) {
        passengerCount--;
        paxValue.textContent = passengerCount;
        calculateRouteAndFare();
      }
    });
    plusBtn.addEventListener('click', () => {
      if (passengerCount < 6) {
        passengerCount++;
        paxValue.textContent = passengerCount;
        calculateRouteAndFare();
      }
    });
  }

  // Form Submit
  const form = document.getElementById('metro-booking-form');
  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      handleBookingSubmit();
    });
  }

  // Modal Close
  const closeBtn = document.getElementById('metro-modal-close');
  const modal = document.getElementById('metro-qr-modal');
  if (closeBtn && modal) {
    closeBtn.addEventListener('click', () => {
      modal.style.display = 'none';
      if (countdownInterval) clearInterval(countdownInterval);
    });
  }

  // Print button
  const printBtn = document.getElementById('btn-print-metro-qr');
  if (printBtn) {
    printBtn.addEventListener('click', () => {
      window.print();
    });
  }

  // Initial setup
  renderLineChips();
  populateStationDropdowns();
  renderPopularChips();
  calculateRouteAndFare();
  initAuth({ autoPrompt: false });
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initMetro);
} else {
  initMetro();
}
