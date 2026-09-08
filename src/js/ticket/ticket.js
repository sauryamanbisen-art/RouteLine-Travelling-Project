/**
 * RouteLine - Booked Ticket & E-Ticket Module (ticket.js)
 * Manages Electronic Reservation Slip (ERS), payment verification, PNR retrieval and cancellation.
 */

import { openPNRModal, initPNRModule } from '../train/pnr-status.js';
import { initAuth } from '../auth/auth.js';

export const STORAGE_KEY_TICKETS = 'routeline_booked_tickets';

// Default starter bookings matching user journeys (Saurya Man Bisen on Maharashtra Exp & Andaman Exp)
export const DEFAULT_TICKETS = [
  {
    pnr: '4114938453',
    bookingId: 'RL-2026-486066',
    trainNumber: '11040',
    trainName: 'Maharashtra Express',
    fromStationCode: 'NDLS',
    fromStationName: 'New Delhi',
    toStationCode: 'MAS',
    toStationName: 'MGR Chennai Central',
    boardingStationCode: 'NDLS',
    boardingStationName: 'New Delhi',
    journeyDate: 'Sat, 12 Sep 2026',
    departureTime: '14:15',
    arrivalTime: '10:10 (+2 days)',
    duration: '16h 40m',
    distance: '885 km',
    platform: 'Platform 2',
    classType: 'Second AC (2A)',
    classCode: '2A',
    quota: 'General (GN)',
    bookingStatus: 'CNF',
    chartStatus: 'Chart Not Prepared',
    bookingDate: '08 Sep 2026, 11:53 AM',
    passengers: [
      {
        name: 'Saurya Man Bisen',
        age: 26,
        gender: 'Male',
        coach: 'A3',
        berth: '35',
        berthType: 'Lower Berth (LB)',
        status: 'CNF'
      }
    ],
    fare: {
      baseFare: 1441,
      convenienceFee: 45,
      gst: 35,
      totalFare: 1521
    },
    payment: {
      status: 'SUCCESS',
      method: 'UPI / Google Pay',
      txnId: 'UPI-RL-48606647',
      paidAt: '08 Sep 2026, 11:53 AM'
    },
    isCancelled: false
  },
  {
    pnr: '6824915302',
    bookingId: 'RL-2026-948102',
    trainNumber: '16032',
    trainName: 'Andaman Express',
    fromStationCode: 'NDLS',
    fromStationName: 'New Delhi',
    toStationCode: 'MAS',
    toStationName: 'MGR Chennai Central',
    boardingStationCode: 'NDLS',
    boardingStationName: 'New Delhi',
    journeyDate: 'Sat, 12 Sep 2026',
    departureTime: '14:15',
    arrivalTime: '10:10 (+2 days)',
    duration: '43h 55m',
    distance: '2,184 km',
    platform: 'Platform 2',
    classType: 'Sleeper (SL)',
    classCode: 'SL',
    quota: 'General (GN)',
    bookingStatus: 'CNF',
    chartStatus: 'Chart Not Prepared',
    bookingDate: '08 Sep 2026, 11:20 AM',
    passengers: [
      {
        name: 'Saurya Man Bisen',
        age: 26,
        gender: 'Male',
        coach: 'S4',
        berth: '42',
        berthType: 'Middle Berth (MB)',
        status: 'CNF'
      }
    ],
    fare: {
      baseFare: 785,
      convenienceFee: 45,
      gst: 35,
      totalFare: 865
    },
    payment: {
      status: 'SUCCESS',
      method: 'UPI / Google Pay',
      txnId: 'UPI-RL-20260908-849102',
      paidAt: '08 Sep 2026, 11:22 AM'
    },
    isCancelled: false
  }
];

/**
 * Loads all tickets from localStorage, initializing with defaults if empty
 * @returns {Array}
 */
export function getBookedTickets() {
  if (typeof localStorage === 'undefined') return DEFAULT_TICKETS;
  try {
    const raw = localStorage.getItem(STORAGE_KEY_TICKETS);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY_TICKETS, JSON.stringify(DEFAULT_TICKETS));
      return DEFAULT_TICKETS;
    }
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed) || parsed.length === 0) {
      localStorage.setItem(STORAGE_KEY_TICKETS, JSON.stringify(DEFAULT_TICKETS));
      return DEFAULT_TICKETS;
    }
    // Make sure default tickets (4114938453, 6824915302) are preserved
    let updated = false;
    DEFAULT_TICKETS.forEach(dt => {
      if (!parsed.some(t => t.pnr === dt.pnr)) {
        parsed.push(dt);
        updated = true;
      }
    });
    if (updated) {
      localStorage.setItem(STORAGE_KEY_TICKETS, JSON.stringify(parsed));
    }
    return parsed;
  } catch (err) {
    console.error('[Ticket] Failed to load tickets from localStorage:', err);
    return DEFAULT_TICKETS;
  }
}

/**
 * Saves a new ticket to localStorage
 * @param {Object} ticket
 */
export function saveBookedTicket(ticket) {
  if (!ticket || !ticket.pnr) return;
  const list = getBookedTickets();
  // Avoid duplicates
  const existingIdx = list.findIndex(t => t.pnr === ticket.pnr);
  if (existingIdx >= 0) {
    list[existingIdx] = ticket;
  } else {
    list.unshift(ticket);
  }
  if (typeof localStorage !== 'undefined') {
    localStorage.setItem(STORAGE_KEY_TICKETS, JSON.stringify(list));
  }
}

/**
 * Retrieves a specific ticket by its 10-digit PNR number
 * @param {string} [pnr]
 * @returns {Object|null}
 */
export function getTicketByPnr(pnr) {
  const cleanPnr = String(pnr || '').trim().replace(/\D/g, '');
  const list = getBookedTickets();
  if (!cleanPnr) return list[0] || null;
  return list.find(t => t.pnr === cleanPnr) || null;
}

/**
 * Cancels a booked ticket and calculates refund
 * @param {string} pnr
 */
export function cancelBookedTicket(pnr) {
  const list = getBookedTickets();
  const ticket = list.find(t => t.pnr === pnr);
  if (!ticket) return null;

  const clerkage = ticket.classCode === 'SL' ? 60 : (ticket.classCode === '3A' ? 180 : 200);
  const refundAmount = Math.max(0, (ticket.fare.totalFare || 865) - clerkage);

  ticket.isCancelled = true;
  ticket.bookingStatus = 'CANCELLED';
  ticket.cancellation = {
    cancelledAt: new Date().toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' }),
    clerkageFee: clerkage,
    refundAmount: refundAmount,
    refundStatus: 'REFUND_PROCESSED_TO_SOURCE',
    refundTxnId: `REF-${Date.now().toString().slice(-8)}`
  };

  if (typeof localStorage !== 'undefined') {
    localStorage.setItem(STORAGE_KEY_TICKETS, JSON.stringify(list));
  }

  return ticket;
}

/**
 * Renders the Electronic Reservation Slip (ERS Ticket) into the DOM
 * @param {string} [targetPnr]
 */
export function renderTicketView(targetPnr) {
  const container = document.getElementById('ticket-display-container');
  if (!container) return;

  const ticket = getTicketByPnr(targetPnr);
  if (!ticket) {
    container.innerHTML = `
      <div class="empty-ticket-state">
        <i data-lucide="ticket-x"></i>
        <h3>No Booked Ticket Found</h3>
        <p>You haven't booked any journeys yet or the requested PNR could not be located.</p>
        <a href="train-results.html" class="btn-primary" style="display:inline-flex;margin-top:16px;">Search & Book Trains</a>
      </div>
    `;
    if (window.lucide) window.lucide.createIcons();
    return;
  }

  const isCancelled = ticket.isCancelled === true;

  container.innerHTML = `
    <div class="ticket-ers-card ${isCancelled ? 'ticket-cancelled' : ''}" id="printable-ticket">
      <!-- Watermark Background -->
      <div class="ers-watermark">ROUTELINE • IRCTC E-TICKET</div>

      <!-- ERS Top Official Header -->
      <div class="ers-top-header">
        <div class="ers-brand">
          <img src="./public/logo.svg" alt="RouteLine" class="ers-logo" />
          <div class="brand-text">
            <span class="main-title">RouteLine IRCTC E-Ticketing System</span>
            <span class="sub-title">Electronic Reservation Slip (ERS) • Passenger Copy</span>
          </div>
        </div>
        <div class="ers-meta-right">
          <div class="booking-ref-badge">
            <span>Txn ID: <strong>${ticket.payment?.txnId || ticket.bookingId}</strong></span>
            <span>Booked on: <strong>${ticket.bookingDate}</strong></span>
          </div>
        </div>
      </div>

      <!-- PNR & Status Highlight Banner -->
      <div class="ers-pnr-banner">
        <div class="pnr-left">
          <span class="pnr-label">PNR NUMBER</span>
          <div class="pnr-val-wrap">
            <span class="pnr-val font-mono" id="ers-pnr-text">${ticket.pnr}</span>
            <button type="button" class="btn-copy-pnr" id="copy-pnr-btn" title="Copy PNR">
              <i data-lucide="copy"></i>
            </button>
          </div>
        </div>

        <div class="pnr-status-group">
          <span class="ers-status-badge ${isCancelled ? 'status-cancelled' : 'status-confirmed'}">
            <i data-lucide="${isCancelled ? 'x-circle' : 'check-circle-2'}"></i>
            ${isCancelled ? 'CANCELLED' : 'CONFIRMED (CNF)'}
          </span>
          <span class="ers-chart-badge">
            <i data-lucide="file-check"></i> ${ticket.chartStatus || 'Chart Not Prepared'}
          </span>
          <button type="button" class="btn-live-pnr-track" id="track-this-pnr-btn" data-pnr="${ticket.pnr}">
            <i data-lucide="activity"></i> Check Live PNR Status
          </button>
        </div>
      </div>

      <!-- Cancellation Banner (if cancelled) -->
      ${isCancelled ? `
        <div class="ers-cancellation-notice">
          <i data-lucide="alert-triangle"></i>
          <div>
            <strong>This ticket has been cancelled</strong>
            <p>Cancelled on ${ticket.cancellation?.cancelledAt}. Refund of <strong>₹${ticket.cancellation?.refundAmount}</strong> (Fare: ₹${ticket.fare.totalFare} - ₹${ticket.cancellation?.clerkageFee} Clerkage fee) has been initiated to original payment method (${ticket.payment.method}).</p>
          </div>
        </div>
      ` : ''}

      <!-- Train & Journey Details Section -->
      <div class="ers-section ers-journey-grid">
        <div class="journey-primary-info">
          <div class="train-lead">
            <span class="t-badge font-mono">${ticket.trainNumber}</span>
            <h2 class="t-name">${ticket.trainName}</h2>
          </div>
          <div class="t-tags">
            <span class="t-tag"><i data-lucide="armchair"></i> ${ticket.classType}</span>
            <span class="t-tag"><i data-lucide="shield"></i> Quota: ${ticket.quota}</span>
            <span class="t-tag"><i data-lucide="map-pin"></i> ${ticket.platform}</span>
          </div>
        </div>

        <div class="ers-schedule-strip">
          <div class="sched-point departure">
            <span class="station-code">${ticket.fromStationCode}</span>
            <span class="station-name">${ticket.fromStationName}</span>
            <span class="timing font-mono">${ticket.departureTime}</span>
            <span class="date">${ticket.journeyDate}</span>
          </div>

          <div class="sched-journey-path">
            <span class="duration-pill"><i data-lucide="clock"></i> ${ticket.duration}</span>
            <div class="path-line">
              <span class="dot from"></span>
              <span class="line"></span>
              <i data-lucide="train" class="train-mid-icon"></i>
              <span class="dot to"></span>
            </div>
            <span class="distance">${ticket.distance || '2,184 km'}</span>
          </div>

          <div class="sched-point arrival">
            <span class="station-code">${ticket.toStationCode}</span>
            <span class="station-name">${ticket.toStationName}</span>
            <span class="timing font-mono">${ticket.arrivalTime}</span>
            <span class="date">${ticket.journeyDate}</span>
          </div>
        </div>
      </div>

      <!-- Passenger Details Table -->
      <div class="ers-section">
        <div class="section-heading">
          <i data-lucide="users"></i>
          <h3>Passenger & Seat Allocation Details</h3>
        </div>
        <div class="ers-table-wrap">
          <table class="ers-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Passenger Name</th>
                <th>Age / Gender</th>
                <th>Booking Status</th>
                <th>Current Status</th>
                <th>Coach</th>
                <th>Berth / Seat</th>
                <th>Berth Type</th>
              </tr>
            </thead>
            <tbody>
              ${ticket.passengers.map((p, idx) => `
                <tr>
                  <td class="font-mono">${idx + 1}</td>
                  <td class="passenger-name-cell">
                    <strong>${p.name}</strong>
                  </td>
                  <td>${p.age || 26} Yrs / ${p.gender || 'Male'}</td>
                  <td><span class="status-pill cnf">${ticket.bookingStatus}</span></td>
                  <td><span class="status-pill cnf">${isCancelled ? 'CAN' : (p.status || 'CNF')}</span></td>
                  <td class="font-mono font-bold">${isCancelled ? '-' : (p.coach || 'S4')}</td>
                  <td class="font-mono font-bold">${isCancelled ? '-' : (p.berth || '42')}</td>
                  <td>${isCancelled ? '-' : (p.berthType || 'Middle Berth (MB)')}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </div>

      <!-- Payment & QR Code Summary Strip -->
      <div class="ers-section ers-payment-grid">
        <div class="payment-receipt-box">
          <div class="section-heading">
            <i data-lucide="receipt"></i>
            <h3>Fare & Payment Breakdown</h3>
          </div>
          <div class="fare-rows">
            <div class="f-row">
              <span>Ticket Base Fare (1 Adult)</span>
              <span class="font-mono">₹${ticket.fare?.baseFare || 785}</span>
            </div>
            <div class="f-row">
              <span>IRCTC Convenience Fee (Incl. GST)</span>
              <span class="font-mono">₹${ticket.fare?.convenienceFee || 45}</span>
            </div>
            <div class="f-row">
              <span>Travel Insurance & Agent Charge</span>
              <span class="font-mono">₹${ticket.fare?.gst || 35}</span>
            </div>
            <div class="f-row total">
              <span>Total Amount Paid</span>
              <span class="font-mono font-bold highlight-amt">₹${ticket.fare?.totalFare || 865}</span>
            </div>
            <div class="f-row payment-meta">
              <span>Mode: <strong>${ticket.payment?.method || 'UPI / Online'}</strong></span>
              <span>Status: <strong class="text-success">${ticket.payment?.status || 'PAID'}</strong></span>
            </div>
          </div>
        </div>

        <!-- QR Code Verification Box -->
        <div class="ticket-qr-box">
          <div class="qr-frame">
            <!-- SVG QR Code Representation -->
            <svg viewBox="0 0 100 100" class="qr-svg">
              <path fill="#0f172a" d="M0,0 h30 v30 h-30 z M6,6 h18 v18 h-18 z M10,10 h10 v10 h-10 z" />
              <path fill="#0f172a" d="M70,0 h30 v30 h-30 z M76,6 h18 v18 h-18 z M80,10 h10 v10 h-10 z" />
              <path fill="#0f172a" d="M0,70 h30 v30 h-30 z M6,76 h18 v18 h-18 z M10,80 h10 v10 h-10 z" />
              <rect x="36" y="8" width="6" height="6" fill="#0f172a"/>
              <rect x="48" y="8" width="12" height="6" fill="#0f172a"/>
              <rect x="40" y="20" width="8" height="6" fill="#0f172a"/>
              <rect x="54" y="20" width="6" height="6" fill="#0f172a"/>
              <rect x="8" y="38" width="16" height="6" fill="#0f172a"/>
              <rect x="30" y="38" width="10" height="6" fill="#0f172a"/>
              <rect x="46" y="36" width="16" height="16" fill="#0066ff"/>
              <rect x="68" y="38" width="8" height="6" fill="#0f172a"/>
              <rect x="82" y="38" width="10" height="6" fill="#0f172a"/>
              <rect x="36" y="58" width="6" height="12" fill="#0f172a"/>
              <rect x="48" y="58" width="8" height="6" fill="#0f172a"/>
              <rect x="62" y="58" width="12" height="6" fill="#0f172a"/>
              <rect x="80" y="58" width="6" height="12" fill="#0f172a"/>
              <rect x="36" y="76" width="12" height="6" fill="#0f172a"/>
              <rect x="54" y="76" width="6" height="14" fill="#0f172a"/>
              <rect x="66" y="76" width="14" height="6" fill="#0f172a"/>
              <rect x="40" y="88" width="8" height="6" fill="#0f172a"/>
              <rect x="66" y="88" width="8" height="6" fill="#0f172a"/>
              <rect x="80" y="86" width="12" height="8" fill="#0f172a"/>
            </svg>
          </div>
          <span class="qr-caption">Scan to Verify with TTE / Indian Railways PRS</span>
          <span class="qr-pnr font-mono">PNR: ${ticket.pnr}</span>
        </div>
      </div>

      <!-- IRCTC Passenger Instructions -->
      <div class="ers-instructions">
        <h4><i data-lucide="info"></i> Important Travel Instructions:</h4>
        <ol>
          <li>One of the passengers booked on this E-ticket must carry an original government-issued photo identity proof (Aadhaar Card, Voter ID, Driving Licence, Passport, or PAN Card).</li>
          <li>Departure and arrival times are based on the latest Indian Railways schedule and are subject to operational conditions.</li>
          <li>For RAC/WL tickets, chart preparation happens 4 hours prior to train departure from the originating station.</li>
        </ol>
      </div>

      <!-- Action Footer -->
      <div class="ers-actions-footer no-print">
        <div class="left-actions">
          <button type="button" class="ers-btn btn-print" id="print-ticket-btn">
            <i data-lucide="printer"></i> Print / Download PDF
          </button>
          <button type="button" class="ers-btn btn-track-pnr" id="check-live-pnr-btn" data-pnr="${ticket.pnr}">
            <i data-lucide="activity"></i> Track Live PNR Status
          </button>
        </div>

        <div class="right-actions">
          ${!isCancelled ? `
            <button type="button" class="ers-btn btn-cancel-ticket" id="cancel-ticket-modal-btn" data-pnr="${ticket.pnr}">
              <i data-lucide="x-circle"></i> Cancel Ticket
            </button>
          ` : ''}
          <a href="train-results.html" class="ers-btn btn-book-another">
            <i data-lucide="search"></i> Book Another Train
          </a>
        </div>
      </div>
    </div>
  `;

  if (window.lucide) window.lucide.createIcons();
  setupTicketInteractions(ticket);
}

/**
 * Wires button interactions (print, copy PNR, check PNR modal, cancel ticket)
 * @param {Object} ticket
 */
function setupTicketInteractions(ticket) {
  // 1. Copy PNR
  const copyBtn = document.getElementById('copy-pnr-btn');
  if (copyBtn) {
    copyBtn.addEventListener('click', () => {
      navigator.clipboard.writeText(ticket.pnr).then(() => {
        const origHtml = copyBtn.innerHTML;
        copyBtn.innerHTML = `<i data-lucide="check" style="color:#16a34a;"></i>`;
        if (window.lucide) window.lucide.createIcons();
        setTimeout(() => {
          copyBtn.innerHTML = origHtml;
          if (window.lucide) window.lucide.createIcons();
        }, 2000);
      });
    });
  }

  // 2. Track live PNR button
  const trackBtns = document.querySelectorAll('#track-this-pnr-btn, #check-live-pnr-btn');
  trackBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      openPNRModal(ticket.pnr);
    });
  });

  // 3. Print / Save as PDF
  const printBtn = document.getElementById('print-ticket-btn');
  if (printBtn) {
    printBtn.addEventListener('click', () => {
      window.print();
    });
  }

  // 4. Cancel ticket
  const cancelBtn = document.getElementById('cancel-ticket-modal-btn');
  if (cancelBtn) {
    cancelBtn.addEventListener('click', () => {
      const confirmCancel = confirm(
        `Are you sure you want to cancel ticket for ${ticket.passengers[0]?.name} on ${ticket.trainName}?\n\n` +
        `Total Fare: ₹${ticket.fare.totalFare}\n` +
        `Clerkage deduction: ₹${ticket.classCode === 'SL' ? 60 : 180}\n` +
        `Net Expected Refund: ₹${Math.max(0, ticket.fare.totalFare - (ticket.classCode === 'SL' ? 60 : 180))}`
      );
      if (confirmCancel) {
        cancelBookedTicket(ticket.pnr);
        renderTicketView(ticket.pnr);
        renderBookingsDrawer();
      }
    });
  }
}

/**
 * Renders the "All My Bookings" list drawer
 */
export function renderBookingsDrawer() {
  const container = document.getElementById('all-bookings-list');
  if (!container) return;

  const tickets = getBookedTickets();

  if (tickets.length === 0) {
    container.innerHTML = `<p class="no-bookings-text">No bookings found.</p>`;
    return;
  }

  const urlParams = new URLSearchParams(window.location.search);
  const currentPnr = urlParams.get('pnr') || tickets[0].pnr;

  container.innerHTML = tickets.map(t => {
    const isActive = t.pnr === currentPnr;
    const isCancelled = t.isCancelled === true;
    return `
      <div class="booking-thumb-card ${isActive ? 'active' : ''} ${isCancelled ? 'cancelled' : ''}" data-pnr="${t.pnr}">
        <div class="thumb-top">
          <span class="thumb-train font-bold">${t.trainNumber} • ${t.trainName}</span>
          <span class="thumb-badge ${isCancelled ? 'cancelled' : 'confirmed'}">
            ${isCancelled ? 'CANCELLED' : 'CNF'}
          </span>
        </div>
        <div class="thumb-route">
          <span>${t.fromStationCode}</span>
          <i data-lucide="arrow-right" class="arrow-sm"></i>
          <span>${t.toStationCode}</span>
          <span class="thumb-date">${t.journeyDate}</span>
        </div>
        <div class="thumb-bottom">
          <span class="thumb-pnr font-mono">PNR: ${t.pnr}</span>
          <span class="thumb-fare font-mono font-bold">₹${t.fare.totalFare}</span>
        </div>
      </div>
    `;
  }).join('');

  if (window.lucide) window.lucide.createIcons();

  // Switch ticket on click
  container.querySelectorAll('.booking-thumb-card').forEach(card => {
    card.addEventListener('click', () => {
      const pnr = card.getAttribute('data-pnr');
      window.history.pushState({}, '', `ticket.html?pnr=${pnr}`);
      renderTicketView(pnr);
      renderBookingsDrawer();
    });
  });
}

/**
 * Page initialization for ticket.html
 */
export function initTicketPage() {
  initPNRModule();
  initAuth({ autoPrompt: false });

  const urlParams = new URLSearchParams(window.location.search);
  const pnrParam = urlParams.get('pnr');

  renderTicketView(pnrParam);
  renderBookingsDrawer();
}

// Auto-run if on ticket page
if (typeof document !== 'undefined') {
  document.addEventListener('DOMContentLoaded', () => {
    if (document.getElementById('ticket-display-container')) {
      initTicketPage();
    }
  });
}
