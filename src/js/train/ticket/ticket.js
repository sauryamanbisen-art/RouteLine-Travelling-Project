/**
 * RouteLine - Unified My Bookings & E-Ticket Module (ticket.js)
 * Manages the multi-modal My Bookings Hub (Trains, Flights, Buses),
 * Electronic Reservation Slip (ERS), booking cancellation, and PNR verification.
 * Enforces strict user isolation:
 * - Unauthenticated visitors only see their own guest session bookings.
 * - Authenticated users only see their own account bookings.
 * - IDOR checks prevent viewing tickets belonging to other accounts.
 */

import { openPNRModal, initPNRModule } from '../pnr-status.js';
import { initAuth, getCurrentUser, isAuthenticated, openAuthModal } from '../../home/auth/auth.js';
import {
  getBookingsForCurrentSession,
  getBookingByRef,
  findBookingForPnrLookup,
  saveBooking,
  cancelBooking,
  filterBookingsByTab,
  filterBookingsByType,
  getGuestSessionId
} from '../../services/booking-store.js';

export const STORAGE_KEY_TICKETS = 'routeline_booked_tickets';

// Active state for dashboard filtering
let currentTab = 'all';
let currentType = 'all';

/**
 * Backwards-compatibility wrapper for train-specific ticket lookup
 */
export function getBookedTickets() {
  const all = getBookingsForCurrentSession();
  const trains = all.filter(b => b.type === 'train');
  // Normalize to legacy ticket format if needed
  return trains.map(t => normalizeToLegacyTicket(t));
}

/**
 * Normalizes unified booking object to legacy ticket format for ERS rendering
 */
function normalizeToLegacyTicket(b) {
  if (!b) return null;
  return {
    pnr: b.bookingReference || b.id,
    bookingId: b.details?.bookingId || b.id,
    trainNumber: b.details?.trainNumber || b.title?.split(' ')?.[1]?.replace(/\(|\)/g, '') || '11040',
    trainName: b.details?.trainName || b.title?.replace(/\s*\(\d+\)/, '') || 'Express Train',
    fromStationCode: b.fromCode || 'NDLS',
    fromStationName: b.fromName || 'Origin Station',
    toStationCode: b.toCode || 'MAS',
    toStationName: b.toName || 'Destination Station',
    boardingStationCode: b.fromCode || 'NDLS',
    boardingStationName: b.fromName || 'Origin Station',
    journeyDate: b.journeyDate || 'Sat, 12 Sep 2026',
    departureTime: b.departureTime || '14:15',
    arrivalTime: b.arrivalTime || '10:10',
    duration: b.duration || '16h 40m',
    distance: b.details?.distance || '885 km',
    platform: b.platform || 'Platform 2',
    classType: b.classType || 'Second AC (2A)',
    classCode: b.classCode || '2A',
    quota: b.quota || 'General (GN)',
    bookingStatus: b.isCancelled ? 'CANCELLED' : (b.status === 'COMPLETED' ? 'COMPLETED' : 'CNF'),
    chartStatus: b.details?.chartStatus || 'Chart Not Prepared',
    bookingDate: b.createdAt ? new Date(b.createdAt).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' }) : 'Recent',
    passengers: b.passengers && b.passengers.length > 0 ? b.passengers : [
      {
        name: b.userEmail ? (getCurrentUser()?.name || 'Passenger') : 'Guest Traveler',
        age: 26,
        gender: 'Male',
        coach: 'A3',
        berth: '35',
        berthType: 'Lower Berth (LB)',
        status: 'CNF'
      }
    ],
    fare: {
      baseFare: Math.max((b.totalFare || 865) - 80, 0),
      convenienceFee: 45,
      gst: 35,
      totalFare: b.totalFare || 865
    },
    payment: {
      status: 'SUCCESS',
      method: b.paymentMethod || 'UPI / Online',
      txnId: b.details?.txnId || `TXN-${(b.bookingReference || '').slice(-6)}`,
      paidAt: b.createdAt ? new Date(b.createdAt).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' }) : 'Online'
    },
    isCancelled: Boolean(b.isCancelled),
    cancellation: b.cancellation || null
  };
}

/**
 * Saves a ticket into both unified store and legacy storage
 * @param {Object} ticket
 */
export function saveBookedTicket(ticket) {
  if (!ticket) return;
  const pnr = ticket.pnr || ticket.bookingReference;
  saveBooking({
    id: `BK-TRN-${pnr}`,
    bookingReference: pnr,
    type: 'train',
    status: ticket.isCancelled ? 'CANCELLED' : 'UPCOMING',
    title: `${ticket.trainName} (${ticket.trainNumber})`,
    fromCode: ticket.fromStationCode,
    fromName: ticket.fromStationName,
    toCode: ticket.toStationCode,
    toName: ticket.toStationName,
    journeyDate: ticket.journeyDate,
    departureTime: ticket.departureTime,
    arrivalTime: ticket.arrivalTime,
    duration: ticket.duration,
    platform: ticket.platform,
    classType: ticket.classType,
    classCode: ticket.classCode,
    quota: ticket.quota,
    passengers: ticket.passengers,
    totalFare: ticket.fare?.totalFare || 865,
    paymentMethod: ticket.payment?.method || 'UPI / Online',
    details: {
      trainNumber: ticket.trainNumber,
      trainName: ticket.trainName,
      bookingId: ticket.bookingId,
      distance: ticket.distance,
      chartStatus: ticket.chartStatus,
      txnId: ticket.payment?.txnId
    }
  });
}

/**
 * Retrieves a specific ticket by its PNR with ownership verification
 * @param {string} pnr
 * @returns {Object|null}
 */
export function getTicketByPnr(pnr) {
  if (!pnr) return null;
  const cleanPnr = String(pnr).trim().replace(/\D/g, '');
  const { authorized, booking, unowned } = getBookingByRef(cleanPnr || pnr);

  if (unowned) {
    return { unauthorized: true, pnr: cleanPnr || pnr };
  }

  if (booking) {
    return normalizeToLegacyTicket(booking);
  }

  // Check lookup fallback
  const lookup = findBookingForPnrLookup(cleanPnr || pnr);
  if (lookup) {
    return normalizeToLegacyTicket(lookup);
  }

  return null;
}

/**
 * Cancels a booked ticket and calculates refund
 * @param {string} pnr
 */
export function cancelBookedTicket(pnr) {
  const res = cancelBooking(pnr);
  if (res.success && res.booking) {
    return normalizeToLegacyTicket(res.booking);
  }
  return null;
}

/**
 * Main Controller: Renders either the Unified Bookings Dashboard or the single ERS ticket view
 */
export function renderTicketPage() {
  const urlParams = new URLSearchParams(window.location.search);
  const pnrParam = urlParams.get('pnr');
  const viewParam = urlParams.get('view');

  const container = document.getElementById('ticket-display-container');
  const sidebar = document.querySelector('.ticket-sidebar');
  const layout = document.querySelector('.ticket-layout-container');
  const breadcrumbCurrent = document.getElementById('ticket-breadcrumb-current');

  if (!container) return;

  // If a specific PNR is requested in URL, render the detailed ERS view
  if (pnrParam && viewParam !== 'all') {
    if (sidebar) sidebar.style.display = 'block';
    if (layout) layout.classList.remove('dashboard-hub-mode');
    if (breadcrumbCurrent) breadcrumbCurrent.textContent = `Electronic Reservation Slip (ERS) • PNR ${pnrParam}`;
    renderTicketView(pnrParam);
    renderBookingsDrawer();
  } else {
    // Render the Unified Multi-Modal Bookings Hub
    if (sidebar) sidebar.style.display = 'none';
    if (layout) layout.classList.add('dashboard-hub-mode');
    if (breadcrumbCurrent) breadcrumbCurrent.textContent = 'My Bookings & Travel Hub';
    renderUnifiedBookingsHub();
  }
}

/**
 * Renders the Unified Multi-Modal My Bookings Dashboard (Trains, Flights, Buses)
 */
export function renderUnifiedBookingsHub() {
  const container = document.getElementById('ticket-display-container');
  if (!container) return;

  const isAuth = isAuthenticated();
  const user = getCurrentUser();
  const allBookings = getBookingsForCurrentSession();

  // Calculate status counts
  const countAll = allBookings.length;
  const countUpcoming = allBookings.filter(b => !b.isCancelled && b.status !== 'COMPLETED').length;
  const countCompleted = allBookings.filter(b => b.status === 'COMPLETED').length;
  const countCancelled = allBookings.filter(b => b.isCancelled || b.status === 'CANCELLED').length;

  // Filter for display
  const tabFiltered = filterBookingsByTab(allBookings, currentTab);
  const displayedBookings = filterBookingsByType(tabFiltered, currentType);

  // Type counts within active tab
  const countTrains = tabFiltered.filter(b => b.type === 'train').length;
  const countFlights = tabFiltered.filter(b => b.type === 'flight').length;
  const countBuses = tabFiltered.filter(b => b.type === 'bus').length;

  container.innerHTML = `
    <div class="rl-dashboard-wrapper">
      <!-- Dashboard Header Banner -->
      <div class="dashboard-header-card">
        <div class="dash-user-meta">
          <div class="dash-avatar">
            ${isAuth ? (user?.name?.charAt(0) || 'U') : '<i data-lucide="user-check"></i>'}
          </div>
          <div class="dash-user-info">
            <div class="dash-badge-row">
              <span class="dash-badge ${isAuth ? 'badge-auth' : 'badge-guest'}">
                ${isAuth ? 'Verified Account' : 'Guest Browser Session'}
              </span>
              ${isAuth ? `<span class="dash-email font-mono">${user?.email}</span>` : ''}
            </div>
            <h1 class="dash-title">
              ${isAuth ? `Welcome back, ${user?.name || 'Traveler'}` : 'My Bookings & Travel Hub'}
            </h1>
            <p class="dash-subtitle">
              ${isAuth 
                ? 'Review, download tickets, track live PNR, and manage reservations across all transport modes.'
                : 'Showing tickets created during this guest session. Sign in to permanently link and sync your bookings across devices.'}
            </p>
          </div>
        </div>

        ${!isAuth ? `
          <div class="dash-guest-cta">
            <button type="button" class="dash-btn-login" id="dash-guest-login-btn">
              <i data-lucide="log-in"></i> Sign In to Save Bookings
            </button>
          </div>
        ` : ''}
      </div>

      <!-- Quick Metrics Strip -->
      <div class="dash-metrics-grid">
        <div class="dash-metric-card ${currentTab === 'all' ? 'active' : ''}" data-filter-tab="all">
          <div class="metric-icon metric-all"><i data-lucide="layers"></i></div>
          <div class="metric-body">
            <span class="metric-val font-mono">${countAll}</span>
            <span class="metric-label">All Bookings</span>
          </div>
        </div>
        <div class="dash-metric-card ${currentTab === 'upcoming' ? 'active' : ''}" data-filter-tab="upcoming">
          <div class="metric-icon metric-upcoming"><i data-lucide="calendar"></i></div>
          <div class="metric-body">
            <span class="metric-val font-mono">${countUpcoming}</span>
            <span class="metric-label">Upcoming</span>
          </div>
        </div>
        <div class="dash-metric-card ${currentTab === 'completed' ? 'active' : ''}" data-filter-tab="completed">
          <div class="metric-icon metric-completed"><i data-lucide="check-circle-2"></i></div>
          <div class="metric-body">
            <span class="metric-val font-mono">${countCompleted}</span>
            <span class="metric-label">Completed</span>
          </div>
        </div>
        <div class="dash-metric-card ${currentTab === 'cancelled' ? 'active' : ''}" data-filter-tab="cancelled">
          <div class="metric-icon metric-cancelled"><i data-lucide="x-circle"></i></div>
          <div class="metric-body">
            <span class="metric-val font-mono">${countCancelled}</span>
            <span class="metric-label">Cancelled</span>
          </div>
        </div>
      </div>

      <!-- Filter Controls Strip -->
      <div class="dash-filter-strip">
        <!-- Status Tabs -->
        <div class="dash-tabs" id="dash-status-tabs">
          <button type="button" class="dash-tab ${currentTab === 'all' ? 'active' : ''}" data-tab="all">
            All (${countAll})
          </button>
          <button type="button" class="dash-tab ${currentTab === 'upcoming' ? 'active' : ''}" data-tab="upcoming">
            Upcoming (${countUpcoming})
          </button>
          <button type="button" class="dash-tab ${currentTab === 'completed' ? 'active' : ''}" data-tab="completed">
            Completed (${countCompleted})
          </button>
          <button type="button" class="dash-tab ${currentTab === 'cancelled' ? 'active' : ''}" data-tab="cancelled">
            Cancelled (${countCancelled})
          </button>
        </div>

        <!-- Mode Filters -->
        <div class="dash-mode-pills" id="dash-mode-pills">
          <button type="button" class="mode-pill ${currentType === 'all' ? 'active' : ''}" data-type="all">
            All Modes
          </button>
          <button type="button" class="mode-pill ${currentType === 'train' ? 'active' : ''}" data-type="train">
            <i data-lucide="train"></i> Trains (${countTrains})
          </button>
          <button type="button" class="mode-pill ${currentType === 'flight' ? 'active' : ''}" data-type="flight">
            <i data-lucide="plane"></i> Flights (${countFlights})
          </button>
          <button type="button" class="mode-pill ${currentType === 'bus' ? 'active' : ''}" data-type="bus">
            <i data-lucide="bus"></i> Buses (${countBuses})
          </button>
        </div>
      </div>

      <!-- Bookings Cards Container -->
      <div class="dash-cards-list" id="dash-cards-list">
        ${displayedBookings.length === 0 ? renderDashboardEmptyState() : displayedBookings.map(b => renderUnifiedBookingCard(b)).join('')}
      </div>

      <!-- Find Another Ticket by PNR or Reference (Quick Lookup Tool) -->
      <div class="dash-lookup-box">
        <div class="lookup-text">
          <i data-lucide="search"></i>
          <div>
            <strong>Looking for a specific booking?</strong>
            <p>Enter any 10-digit Indian Railways PNR or RouteLine Booking Reference to view the electronic ticket.</p>
          </div>
        </div>
        <form class="lookup-form" id="dash-pnr-lookup-form">
          <input type="text" id="dash-lookup-input" placeholder="e.g. 4114938453 or RL-DEMO-9824" required />
          <button type="submit" class="lookup-submit-btn">
            <i data-lucide="arrow-right"></i> Check Ticket
          </button>
        </form>
      </div>
    </div>
  `;

  if (window.lucide) window.lucide.createIcons();
  setupDashboardInteractions();
}

/**
 * Renders an empty state when no bookings exist in current filter
 */
function renderDashboardEmptyState() {
  const isAuth = isAuthenticated();
  return `
    <div class="dash-empty-card">
      <div class="empty-icon-wrap">
        <i data-lucide="ticket-slash"></i>
      </div>
      <h3>No Bookings Found</h3>
      <p>
        ${currentTab === 'all' && currentType === 'all'
          ? (isAuth 
              ? "You don't have any bookings in your account yet. Start planning your next journey below!"
              : "No active bookings in this guest browser session. Book a journey or sign in to load your previous trips.")
          : `No ${currentType !== 'all' ? currentType : ''} bookings matching the "${currentTab}" filter.`}
      </p>

      <div class="empty-cta-buttons">
        <a href="../../index.html" class="empty-btn btn-train">
          <i data-lucide="train"></i> Book Trains
        </a>
        <a href="../flight/flight-search.html" class="empty-btn btn-flight">
          <i data-lucide="plane"></i> Book Flights
        </a>
        <a href="../bus/bus-results.html" class="empty-btn btn-bus">
          <i data-lucide="bus"></i> Book Buses
        </a>
      </div>
    </div>
  `;
}

/**
 * Renders an individual unified booking card (Train, Flight, or Bus)
 */
function renderUnifiedBookingCard(b) {
  const isCancelled = Boolean(b.isCancelled) || b.status === 'CANCELLED';
  const typeIcons = {
    train: 'train',
    flight: 'plane',
    bus: 'bus'
  };
  const icon = typeIcons[b.type] || 'ticket';
  const typeLabel = b.type ? (b.type.charAt(0).toUpperCase() + b.type.slice(1)) : 'Travel';
  const leadPax = b.passengers?.[0]?.name || 'Passenger';
  const seatInfo = b.type === 'train' 
    ? (b.passengers?.[0]?.coach ? `Coach ${b.passengers[0].coach}, Berth ${b.passengers[0].berth} (${b.passengers[0].berthType || 'CNF'})` : (b.classType || 'Standard Class'))
    : (b.passengers?.[0]?.seat ? `Seat ${b.passengers[0].seat}` : (b.classType || 'Economy'));

  return `
    <article class="dash-card ${isCancelled ? 'card-cancelled' : ''}" data-booking-id="${b.id}" data-type="${b.type}">
      <!-- Card Top Ribbon -->
      <div class="dash-card-header">
        <div class="dash-card-mode">
          <span class="mode-badge mode-${b.type}">
            <i data-lucide="${icon}"></i> ${typeLabel}
          </span>
          <span class="booking-ref-tag font-mono">
            ${b.type === 'train' ? `PNR: ${b.bookingReference}` : `Ref: ${b.bookingReference}`}
          </span>
        </div>

        <div class="dash-card-status">
          <span class="status-pill-badge ${isCancelled ? 'badge-cancelled' : (b.status === 'COMPLETED' ? 'badge-completed' : 'badge-confirmed')}">
            <i data-lucide="${isCancelled ? 'x-circle' : 'check-circle-2'}"></i>
            ${isCancelled ? 'CANCELLED' : (b.status === 'COMPLETED' ? 'COMPLETED' : 'CONFIRMED')}
          </span>
        </div>
      </div>

      <!-- Card Main Body -->
      <div class="dash-card-body">
        <div class="card-journey-title">
          <h3>${b.title || 'Journey'}</h3>
          <span class="journey-class-tag">${b.classType || 'Standard'}</span>
        </div>

        <!-- Route & Timing Strip -->
        <div class="card-route-strip">
          <div class="route-point origin">
            <span class="station-code">${b.fromCode}</span>
            <span class="station-name">${b.fromName}</span>
            <span class="route-time font-mono">${b.departureTime || '10:00'}</span>
          </div>

          <div class="route-connector">
            <span class="route-duration"><i data-lucide="clock"></i> ${b.duration || 'Direct'}</span>
            <div class="connector-line">
              <span class="line-dot"></span>
              <span class="line-bar"></span>
              <i data-lucide="${icon}" class="line-icon"></i>
              <span class="line-dot"></span>
            </div>
            <span class="route-date">${b.journeyDate}</span>
          </div>

          <div class="route-point destination">
            <span class="station-code">${b.toCode}</span>
            <span class="station-name">${b.toName}</span>
            <span class="route-time font-mono">${b.arrivalTime || '18:00'}</span>
          </div>
        </div>

        <!-- Passenger & Fare Info Row -->
        <div class="card-pax-row">
          <div class="pax-item">
            <span class="pax-label">Passenger:</span>
            <strong>${leadPax}${b.passengers?.length > 1 ? ` +${b.passengers.length - 1} more` : ''}</strong>
          </div>
          <div class="pax-item">
            <span class="pax-label">Allocation:</span>
            <strong class="font-mono">${seatInfo}</strong>
          </div>
          <div class="pax-item pax-fare">
            <span class="pax-label">Total Fare Paid:</span>
            <strong class="font-mono text-price">₹${(b.totalFare || 0).toLocaleString('en-IN')}</strong>
          </div>
        </div>

        ${isCancelled && b.cancellation ? `
          <div class="card-cancellation-alert">
            <i data-lucide="alert-circle"></i>
            <span>Cancelled on ${b.cancellation.cancelledAt}. Refund of <strong>₹${b.cancellation.refundAmount}</strong> processed.</span>
          </div>
        ` : ''}
      </div>

      <!-- Card Action Buttons -->
      <div class="dash-card-footer">
        <div class="card-left-actions">
          ${b.type === 'train' ? `
            <a href="ticket.html?pnr=${b.bookingReference}" class="btn-card-primary" title="View Electronic Reservation Slip">
              <i data-lucide="file-text"></i> View ERS Ticket
            </a>
            <button type="button" class="btn-card-track" data-track-pnr="${b.bookingReference}">
              <i data-lucide="activity"></i> Track Live PNR
            </button>
          ` : (b.type === 'flight' ? `
            <a href="../flight/booking-confirmation.html?ref=${b.bookingReference}" class="btn-card-primary">
              <i data-lucide="plane-takeoff"></i> Boarding Pass & Details
            </a>
          ` : `
            <button type="button" class="btn-card-primary btn-view-bus-ticket" data-ref="${b.bookingReference}">
              <i data-lucide="ticket"></i> View Bus Pass
            </button>
          `)}
        </div>

        <div class="card-right-actions">
          ${!isCancelled ? `
            <button type="button" class="btn-card-cancel" data-cancel-ref="${b.bookingReference}" data-cancel-title="${b.title}" data-fare="${b.totalFare}" data-type="${b.type}">
              <i data-lucide="x-circle"></i> Cancel
            </button>
          ` : ''}
        </div>
      </div>
    </article>
  `;
}

/**
 * Sets up event listeners for the dashboard (Tabs, Mode pills, Cancellation, PNR Tracking)
 */
function setupDashboardInteractions() {
  // Tab Switching
  document.querySelectorAll('#dash-status-tabs .dash-tab, .dash-metric-card').forEach(el => {
    el.addEventListener('click', () => {
      const tab = el.getAttribute('data-tab') || el.getAttribute('data-filter-tab');
      if (tab) {
        currentTab = tab;
        renderUnifiedBookingsHub();
      }
    });
  });

  // Mode Filter Pills
  document.querySelectorAll('#dash-mode-pills .mode-pill').forEach(el => {
    el.addEventListener('click', () => {
      const type = el.getAttribute('data-type');
      if (type) {
        currentType = type;
        renderUnifiedBookingsHub();
      }
    });
  });

  // Guest Login CTA button
  document.getElementById('dash-guest-login-btn')?.addEventListener('click', () => {
    openAuthModal(() => {
      renderUnifiedBookingsHub();
    }, 'login');
  });

  // Live PNR Tracking buttons on cards
  document.querySelectorAll('[data-track-pnr]').forEach(btn => {
    btn.addEventListener('click', () => {
      const pnr = btn.getAttribute('data-track-pnr');
      openPNRModal(pnr);
    });
  });

  // Cancellation buttons on cards
  document.querySelectorAll('[data-cancel-ref]').forEach(btn => {
    btn.addEventListener('click', () => {
      const ref = btn.getAttribute('data-cancel-ref');
      const title = btn.getAttribute('data-cancel-title');
      const fare = Number(btn.getAttribute('data-fare')) || 0;
      const type = btn.getAttribute('data-type') || 'train';

      const deduction = type === 'train' ? 180 : (type === 'flight' ? 1500 : 100);
      const refund = Math.max(0, fare - deduction);

      const proceed = confirm(
        `Are you sure you want to cancel booking: ${title} (${ref})?\n\n` +
        `Total Amount: ₹${fare.toLocaleString('en-IN')}\n` +
        `Standard Cancellation Fee: ₹${deduction.toLocaleString('en-IN')}\n` +
        `Net Refund to Source: ₹${refund.toLocaleString('en-IN')}\n\n` +
        `Click OK to confirm cancellation.`
      );

      if (proceed) {
        const res = cancelBooking(ref);
        if (res.success) {
          alert(`Booking successfully cancelled. Refund of ₹${refund.toLocaleString('en-IN')} has been credited.`);
          renderUnifiedBookingsHub();
        } else {
          alert(res.error || 'Failed to cancel booking.');
        }
      }
    });
  });

  // Bus Pass Quick Modal
  document.querySelectorAll('.btn-view-bus-ticket').forEach(btn => {
    btn.addEventListener('click', () => {
      const ref = btn.getAttribute('data-ref');
      const { booking } = getBookingByRef(ref);
      if (booking) {
        alert(
          `🚍 ROUTELINE BUS ELECTRONIC TICKET\n` +
          `-----------------------------------\n` +
          `Booking Ref: ${booking.bookingReference}\n` +
          `Service: ${booking.title}\n` +
          `From: ${booking.fromName} (${booking.departureTime})\n` +
          `To: ${booking.toName} (${booking.arrivalTime})\n` +
          `Date: ${booking.journeyDate}\n` +
          `Passenger: ${booking.passengers?.[0]?.name || 'Traveler'}\n` +
          `Status: ${booking.status}\n` +
          `Total Fare: ₹${booking.totalFare}\n\n` +
          `Show this e-ticket along with valid Govt ID while boarding the bus.`
        );
      }
    });
  });

  // PNR / Reference Lookup Form
  const lookupForm = document.getElementById('dash-pnr-lookup-form');
  if (lookupForm) {
    lookupForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const input = document.getElementById('dash-lookup-input');
      const query = input ? input.value.trim() : '';
      if (!query) return;

      const cleanPnr = query.replace(/\D/g, '');
      if (cleanPnr.length === 10) {
        window.location.href = `ticket.html?pnr=${cleanPnr}`;
      } else {
        const { booking } = getBookingByRef(query);
        if (booking && booking.type === 'flight') {
          window.location.href = `../flight/booking-confirmation.html?ref=${booking.bookingReference}`;
        } else if (booking && booking.type === 'train') {
          window.location.href = `ticket.html?pnr=${booking.bookingReference}`;
        } else {
          window.location.href = `ticket.html?pnr=${query}`;
        }
      }
    });
  }
}

/**
 * Renders the Electronic Reservation Slip (ERS Ticket) into the DOM for a single train booking
 * @param {string} targetPnr
 */
export function renderTicketView(targetPnr) {
  const container = document.getElementById('ticket-display-container');
  if (!container) return;

  const result = getTicketByPnr(targetPnr);

  // IDOR / Unauthorized Protection Screen
  if (result && result.unauthorized) {
    container.innerHTML = `
      <div class="ticket-ers-card ticket-unauthorized-card">
        <div class="unauth-icon-wrap">
          <i data-lucide="shield-alert"></i>
        </div>
        <h2>Private Ticket — Access Restricted</h2>
        <p class="unauth-desc">
          The booking ticket with PNR <strong>${result.pnr}</strong> is registered under a different authenticated account or session.
        </p>
        <div class="unauth-notice-box">
          <i data-lucide="lock"></i>
          <span>To protect personal travel privacy and ticket details, RouteLine isolates bookings by user identity. Please log in with the correct account to view this journey.</span>
        </div>
        <div class="unauth-actions">
          <a href="ticket.html" class="btn-primary" style="text-decoration:none;">
            <i data-lucide="arrow-left"></i> Back to My Bookings Hub
          </a>
          <button type="button" class="btn-secondary" id="unauth-login-switch-btn">
            <i data-lucide="log-in"></i> Sign In to Another Account
          </button>
        </div>
      </div>
    `;
    if (window.lucide) window.lucide.createIcons();
    document.getElementById('unauth-login-switch-btn')?.addEventListener('click', () => {
      openAuthModal(() => {
        renderTicketView(targetPnr);
      }, 'login');
    });
    return;
  }

  // Not Found State
  if (!result) {
    container.innerHTML = `
      <div class="ticket-ers-card empty-ticket-state">
        <div class="empty-icon-wrap"><i data-lucide="ticket-x"></i></div>
        <h3>No Booked Ticket Found for PNR "${targetPnr || ''}"</h3>
        <p>This booking reference does not exist in your current account session, or was previously removed.</p>
        <div style="display:flex; gap:12px; justify-content:center; margin-top:20px; flex-wrap:wrap;">
          <a href="ticket.html" class="btn-primary" style="text-decoration:none;">
            <i data-lucide="layers"></i> View All My Bookings
          </a>
          <a href="train-results.html" class="btn-secondary" style="text-decoration:none;">
            <i data-lucide="search"></i> Search Trains
          </a>
        </div>
      </div>
    `;
    if (window.lucide) window.lucide.createIcons();
    return;
  }

  const ticket = result;
  const isCancelled = ticket.isCancelled === true;

  container.innerHTML = `
    <!-- Top Back to Dashboard Link -->
    <div class="ers-hub-return-bar no-print">
      <a href="ticket.html" class="hub-return-link">
        <i data-lucide="arrow-left"></i> Back to All My Bookings (Trains, Flights, Buses)
      </a>
      <span class="hub-return-pnr font-mono">Viewing ERS Ticket • PNR: ${ticket.pnr}</span>
    </div>

    <div class="ticket-ers-card ${isCancelled ? 'ticket-cancelled' : ''}" id="printable-ticket">
      <!-- Watermark Background -->
      <div class="ers-watermark">ROUTELINE • IRCTC E-TICKET</div>

      <!-- ERS Top Official Header -->
      <div class="ers-top-header">
        <div class="ers-brand">
          <img src="../../public/logo.svg" alt="RouteLine" class="ers-logo" />
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
            <p>Cancelled on ${ticket.cancellation?.cancelledAt}. Refund of <strong>₹${ticket.cancellation?.refundAmount}</strong> (Fare: ₹${ticket.fare.totalFare} - ₹${ticket.cancellation?.clerkageFee || 180} Clerkage fee) has been initiated to original payment method (${ticket.payment.method}).</p>
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
            <span class="distance">${ticket.distance || '885 km'}</span>
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
                  <td>${p.age || 28} Yrs / ${p.gender || 'Male'}</td>
                  <td><span class="status-pill cnf">${ticket.bookingStatus}</span></td>
                  <td><span class="status-pill cnf">${isCancelled ? 'CAN' : (p.status || 'CNF')}</span></td>
                  <td class="font-mono font-bold">${isCancelled ? '-' : (p.coach || 'A3')}</td>
                  <td class="font-mono font-bold">${isCancelled ? '-' : (p.berth || '35')}</td>
                  <td>${isCancelled ? '-' : (p.berthType || 'Lower Berth (LB)')}</td>
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
              <rect x="46" y="36" width="16" height="16" fill="#d89b53"/>
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
 * Wires button interactions on the ERS ticket view
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
      const clerkage = ticket.classCode === 'SL' ? 60 : 180;
      const refund = Math.max(0, (ticket.fare?.totalFare || 865) - clerkage);
      const confirmCancel = confirm(
        `Are you sure you want to cancel ticket for ${ticket.passengers[0]?.name} on ${ticket.trainName}?\n\n` +
        `Total Fare: ₹${ticket.fare.totalFare}\n` +
        `Clerkage deduction: ₹${clerkage}\n` +
        `Net Expected Refund: ₹${refund}`
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
 * Renders the "My Booked Journeys" sidebar list for quick switching when viewing an ERS ticket
 */
export function renderBookingsDrawer() {
  const container = document.getElementById('all-bookings-list');
  if (!container) return;

  const tickets = getBookedTickets();

  if (tickets.length === 0) {
    container.innerHTML = `<p class="no-bookings-text">No other train tickets in this session.</p>`;
    return;
  }

  const urlParams = new URLSearchParams(window.location.search);
  const currentPnr = urlParams.get('pnr') || tickets[0]?.pnr;

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

  // Re-render dashboard or ticket when auth state changes (login / logout)
  window.addEventListener('routeline:auth-change', () => {
    renderTicketPage();
  });

  renderTicketPage();
}

// Auto-run on DOM ready
if (typeof document !== 'undefined') {
  document.addEventListener('DOMContentLoaded', () => {
    if (document.getElementById('ticket-display-container')) {
      initTicketPage();
    }
  });
}
