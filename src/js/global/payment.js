/**
 * RouteLine - Payment Gateway & Checkout Module (payment.js)
 * Simulates real-time multi-method payment (UPI, Cards, NetBanking, Wallet),
 * generates official-format 10-digit PNR, allocates coach/berth, and saves ticket.
 */

import { saveBookedTicket } from '../ticket/ticket.js';
import { openPNRModal } from '../train/pnr-status.js';
import { isAuthenticated, openAuthModal, getCurrentUser } from '../auth/auth.js';

/**
 * Generates an authentic 10-digit Indian Railways PNR number
 * (Usually starts with 2, 4, 6, or 8 based on PRS zones)
 */
export function generateRealisticPNR() {
  const zonePrefixes = ['2', '4', '6', '8'];
  const prefix = zonePrefixes[Math.floor(Math.random() * zonePrefixes.length)];
  let remaining = '';
  for (let i = 0; i < 9; i++) {
    remaining += Math.floor(Math.random() * 10).toString();
  }
  return prefix + remaining;
}

/**
 * Allocates coach, berth, and berth type based on travel class
 */
export function allocateSeat(classType = 'SL', preference = 'NO') {
  const norm = String(classType).toUpperCase();
  let coachPrefix = 'S';
  let maxBerth = 72;
  const berthTypes = ['Lower Berth (LB)', 'Middle Berth (MB)', 'Upper Berth (UB)', 'Side Lower (SL)', 'Side Upper (SU)'];

  if (norm.includes('3A') || norm.includes('3E') || norm.includes('THIRD')) {
    coachPrefix = 'B';
    maxBerth = 64;
  } else if (norm.includes('2A') || norm.includes('SECOND')) {
    coachPrefix = 'A';
    maxBerth = 48;
  } else if (norm.includes('1A') || norm.includes('FIRST')) {
    coachPrefix = 'H';
    maxBerth = 24;
  } else if (norm.includes('CC') || norm.includes('CHAIR')) {
    coachPrefix = 'C';
    maxBerth = 78;
  }

  const coachNumber = Math.floor(Math.random() * 4) + 1;
  const coach = `${coachPrefix}${coachNumber}`;
  const berthNumber = Math.floor(Math.random() * (maxBerth - 1)) + 1;

  let chosenType = berthTypes[berthNumber % berthTypes.length];
  if (preference === 'LB') chosenType = 'Lower Berth (LB)';
  else if (preference === 'MB') chosenType = 'Middle Berth (MB)';
  else if (preference === 'UB') chosenType = 'Upper Berth (UB)';
  else if (preference === 'SL') chosenType = 'Side Lower (SL)';
  else if (preference === 'SU') chosenType = 'Side Upper (SU)';

  return { coach, berthNumber, berthType: chosenType };
}

/**
 * Creates payment modal container if not exists
 */
function ensurePaymentModalDOM() {
  if (document.getElementById('rl-payment-modal-backdrop')) return;

  const html = `
    <div id="rl-payment-modal-backdrop" class="rl-payment-backdrop" style="display:none;">
      <div class="rl-payment-modal" role="dialog" aria-modal="true">
        <!-- Close Button -->
        <button type="button" class="payment-close-btn" id="payment-close-btn">
          <i data-lucide="x"></i>
        </button>

        <div id="payment-modal-content">
          <!-- Injected dynamically -->
        </div>
      </div>
    </div>
  `;

  const div = document.createElement('div');
  div.innerHTML = html;
  document.body.appendChild(div.firstElementChild);

  if (window.lucide) window.lucide.createIcons();

  document.getElementById('payment-close-btn')?.addEventListener('click', closePaymentModal);
  document.getElementById('rl-payment-modal-backdrop')?.addEventListener('click', (e) => {
    if (e.target.id === 'rl-payment-modal-backdrop') closePaymentModal();
  });
}

/**
 * Closes the payment modal
 */
export function closePaymentModal() {
  const backdrop = document.getElementById('rl-payment-modal-backdrop');
  if (backdrop) backdrop.style.display = 'none';
  document.body.classList.remove('modal-open');
}

/**
 * Opens payment modal with journey and passenger details
 * @param {Object} params
 */
export function openPaymentModal(params = {}) {
  if (!isAuthenticated()) {
    openAuthModal(() => openPaymentModal(params), 'login', 'Please log in or sign up to complete your ticket booking.');
    return;
  }

  ensurePaymentModalDOM();
  const backdrop = document.getElementById('rl-payment-modal-backdrop');
  const content = document.getElementById('payment-modal-content');

  if (!backdrop || !content) return;

  const { train, selectedClass, passenger } = params;
  const user = getCurrentUser();
  const fare = selectedClass?.fare || 865;
  const baseFare = Math.max(fare - 45, 0);
  const trainName = train?.train_name || 'Express Train';
  const trainNo = train?.train_number || '12952';
  const classType = selectedClass?.class_type || 'Sleeper (SL)';
  const passName = passenger?.name || user?.name || 'Saurya Man Bisen';

  content.innerHTML = `
    <div class="payment-view-container">
      <!-- Header -->
      <div class="payment-modal-header">
        <div class="pay-security-badge">
          <i data-lucide="shield-check"></i> 256-Bit SSL Encrypted Checkout
        </div>
        <h3 class="pay-title">Complete Your Booking Payment</h3>
        <p class="pay-subtitle">Select a payment option below to finalize booking and generate your PNR.</p>
      </div>

      <!-- Main 2-Column Payment Layout -->
      <div class="payment-grid">
        <!-- Left: Payment Methods -->
        <div class="payment-methods-col">
          <!-- Tabs Navigation -->
          <div class="pay-tabs-nav" id="pay-tabs-nav">
            <button type="button" class="pay-tab active" data-tab="upi">
              <i data-lucide="qr-code"></i> UPI / QR
            </button>
            <button type="button" class="pay-tab" data-tab="card">
              <i data-lucide="credit-card"></i> Cards
            </button>
            <button type="button" class="pay-tab" data-tab="netbanking">
              <i data-lucide="building"></i> Net Banking
            </button>
            <button type="button" class="pay-tab" data-tab="wallet">
              <i data-lucide="wallet"></i> Wallet
            </button>
          </div>

          <!-- Tab 1: UPI -->
          <div class="pay-tab-pane active" id="tab-upi">
            <div class="upi-checkout-box">
              <div class="upi-qr-area">
                <div class="qr-box-inner">
                  <!-- SVG Dynamic UPI QR Code -->
                  <svg viewBox="0 0 100 100" class="upi-qr-svg">
                    <path fill="#0f172a" d="M0,0 h32 v32 h-32 z M6,6 h20 v20 h-20 z M10,10 h12 v12 h-12 z" />
                    <path fill="#0f172a" d="M68,0 h32 v32 h-32 z M74,6 h20 v20 h-20 z M78,10 h12 v12 h-12 z" />
                    <path fill="#0f172a" d="M0,68 h32 v32 h-32 z M6,74 h20 v20 h-20 z M10,78 h12 v12 h-12 z" />
                    <rect x="40" y="8" width="6" height="12" fill="#0066ff"/>
                    <rect x="52" y="8" width="8" height="6" fill="#0f172a"/>
                    <rect x="40" y="24" width="20" height="6" fill="#0f172a"/>
                    <rect x="8" y="40" width="16" height="6" fill="#0f172a"/>
                    <rect x="28" y="40" width="10" height="16" fill="#0f172a"/>
                    <rect x="44" y="38" width="16" height="16" fill="#22c55e"/>
                    <rect x="68" y="40" width="8" height="8" fill="#0f172a"/>
                    <rect x="82" y="40" width="10" height="14" fill="#0f172a"/>
                    <rect x="40" y="60" width="8" height="14" fill="#0f172a"/>
                    <rect x="54" y="60" width="10" height="6" fill="#0066ff"/>
                    <rect x="70" y="60" width="12" height="14" fill="#0f172a"/>
                    <rect x="40" y="80" width="18" height="6" fill="#0f172a"/>
                    <rect x="64" y="80" width="8" height="12" fill="#0f172a"/>
                    <rect x="78" y="80" width="14" height="6" fill="#0f172a"/>
                  </svg>
                  <span class="qr-badge">Scan & Pay ₹${fare.toLocaleString('en-IN')}</span>
                </div>
                <div class="upi-apps-row">
                  <span class="upi-app-chip"><i data-lucide="smartphone"></i> GPay</span>
                  <span class="upi-app-chip"><i data-lucide="smartphone"></i> PhonePe</span>
                  <span class="upi-app-chip"><i data-lucide="smartphone"></i> Paytm</span>
                  <span class="upi-app-chip"><i data-lucide="smartphone"></i> BHIM</span>
                </div>
              </div>

              <div class="upi-divider"><span>OR ENTER VPA / UPI ID</span></div>

              <div class="upi-input-group">
                <input type="text" id="upi-id-input" placeholder="e.g. mobile@upi or name@okhdfcbank" value="saurya@okaxis" />
                <button type="button" class="btn-verify-upi" id="btn-verify-upi">Verify</button>
              </div>
            </div>
          </div>

          <!-- Tab 2: Cards -->
          <div class="pay-tab-pane" id="tab-card">
            <div class="card-form-wrap">
              <div class="form-field">
                <label>Card Number</label>
                <div class="card-input-box">
                  <i data-lucide="credit-card"></i>
                  <input type="text" id="card-num-input" placeholder="4532 •••• •••• 8901" value="4532 8910 2341 8901" maxlength="19" />
                </div>
              </div>
              <div class="form-row-2">
                <div class="form-field">
                  <label>Valid Thru (MM/YY)</label>
                  <input type="text" id="card-exp-input" placeholder="MM/YY" value="08/29" maxlength="5" />
                </div>
                <div class="form-field">
                  <label>CVV / CVC</label>
                  <input type="password" id="card-cvv-input" placeholder="•••" value="782" maxlength="3" />
                </div>
              </div>
              <div class="form-field">
                <label>Name on Card</label>
                <input type="text" id="card-name-input" value="${passName}" />
              </div>
            </div>
          </div>

          <!-- Tab 3: Net Banking -->
          <div class="pay-tab-pane" id="tab-netbanking">
            <div class="netbanking-grid">
              <label class="bank-pill active">
                <input type="radio" name="bank" value="SBI" checked />
                <span>State Bank of India</span>
              </label>
              <label class="bank-pill">
                <input type="radio" name="bank" value="HDFC" />
                <span>HDFC Bank</span>
              </label>
              <label class="bank-pill">
                <input type="radio" name="bank" value="ICICI" />
                <span>ICICI Bank</span>
              </label>
              <label class="bank-pill">
                <input type="radio" name="bank" value="AXIS" />
                <span>Axis Bank</span>
              </label>
            </div>
          </div>

          <!-- Tab 4: Wallet -->
          <div class="pay-tab-pane" id="tab-wallet">
            <div class="wallet-checkout-box">
              <div class="wallet-info">
                <i data-lucide="wallet" class="wallet-icon"></i>
                <div>
                  <strong>RouteLine Travel Credits</strong>
                  <span class="wallet-balance">Available Balance: ₹2,500</span>
                </div>
              </div>
              <span class="badge-discount">Instant 1-Click Payment</span>
            </div>
          </div>
        </div>

        <!-- Right: Order Summary Sidebar -->
        <div class="payment-summary-col">
          <div class="order-summary-card">
            <h4 class="summary-title"><i data-lucide="train"></i> Journey Summary</h4>
            <div class="summary-train-info">
              <span class="train-no font-mono font-bold">${trainNo}</span>
              <strong class="train-title">${trainName}</strong>
              <span class="class-title">${classType}</span>
            </div>

            <div class="summary-passenger-info">
              <span class="label">Primary Passenger:</span>
              <strong class="p-name">${passName}</strong>
              <span class="sub">${passenger?.age || 26} Yrs, ${passenger?.gender === 'F' ? 'Female' : 'Male'}</span>
            </div>

            <div class="summary-fare-breakdown">
              <div class="fare-row">
                <span>Base Fare</span>
                <span class="font-mono">₹${baseFare.toLocaleString('en-IN')}</span>
              </div>
              <div class="fare-row">
                <span>IRCTC Convenience & Taxes</span>
                <span class="font-mono">₹45</span>
              </div>
              <div class="fare-row total">
                <span>Total Payable</span>
                <span class="font-mono font-bold highlight-amt">₹${fare.toLocaleString('en-IN')}</span>
              </div>
            </div>

            <button type="button" class="btn-pay-now" id="btn-execute-payment">
              <i data-lucide="lock"></i> Pay ₹${fare.toLocaleString('en-IN')} Now
            </button>
            <p class="pay-guarantee-note"><i data-lucide="check"></i> 100% Refund Guarantee on PRS Waitlist failure</p>
          </div>
        </div>
      </div>
    </div>
  `;

  backdrop.style.display = 'flex';
  document.body.classList.add('modal-open');

  if (window.lucide) window.lucide.createIcons();

  setupPaymentEventListeners(params);
}

/**
 * Wires tabs and checkout action listeners
 * @param {Object} params
 */
function setupPaymentEventListeners(params) {
  // Tabs switching
  const tabs = document.querySelectorAll('.pay-tab');
  const panes = document.querySelectorAll('.pay-tab-pane');

  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      tabs.forEach(t => t.classList.remove('active'));
      panes.forEach(p => p.classList.remove('active'));
      tab.classList.add('active');
      const target = tab.getAttribute('data-tab');
      document.getElementById(`tab-${target}`)?.classList.add('active');
    });
  });

  // Verify UPI button
  document.getElementById('btn-verify-upi')?.addEventListener('click', (e) => {
    e.target.innerHTML = `<i data-lucide="check" style="color:#22c55e;"></i> Verified`;
    if (window.lucide) window.lucide.createIcons();
  });

  // Pay Now Button
  const payBtn = document.getElementById('btn-execute-payment');
  if (payBtn) {
    payBtn.addEventListener('click', () => {
      executePaymentFlow(params);
    });
  }
}

/**
 * Simulates real payment gateway processing and generates booked ticket
 * @param {Object} params
 */
function executePaymentFlow(params) {
  const content = document.getElementById('payment-modal-content');
  if (!content) return;

  const { train, selectedClass, passenger } = params;
  const fare = selectedClass?.fare || 865;
  const trainName = train?.train_name || 'Andaman Express';
  const trainNo = train?.train_number || '16032';
  const passName = passenger?.name || 'Saurya Man Bisen';
  const pnr = generateRealisticPNR();
  const seat = allocateSeat(selectedClass?.class_type, passenger?.berthPreference);
  const txnId = `UPI-RL-${Date.now().toString().slice(-8)}`;

  // Step 1: Processing Screen
  content.innerHTML = `
    <div class="payment-processing-state">
      <div class="payment-spinner"></div>
      <h3>Connecting with Payment Gateway...</h3>
      <p>Authorizing payment of <strong>₹${fare.toLocaleString('en-IN')}</strong> securely with your bank.</p>
      <div class="proc-steps">
        <div class="proc-step active"><i data-lucide="check-circle-2"></i> Encrypting transaction credentials</div>
        <div class="proc-step active"><i data-lucide="loader-2" class="spin-icon"></i> Awaiting bank 3D-Secure approval</div>
        <div class="proc-step"><i data-lucide="circle"></i> Allocating IRCTC Coach & Berth</div>
      </div>
    </div>
  `;
  if (window.lucide) window.lucide.createIcons();

  // Step 2: After 1.8 seconds, complete booking and present Success Screen
  setTimeout(() => {
    // Construct real ticket record
    const ticket = {
      pnr: pnr,
      bookingId: `RL-${Date.now().toString().slice(-6)}`,
      trainNumber: trainNo,
      trainName: trainName,
      fromStationCode: train?.from_station_code || 'NDLS',
      fromStationName: train?.from_station_name || 'New Delhi',
      toStationCode: train?.to_station_code || 'MAS',
      toStationName: train?.to_station_name || 'MGR Chennai Central',
      boardingStationCode: train?.from_station_code || 'NDLS',
      boardingStationName: train?.from_station_name || 'New Delhi',
      journeyDate: train?.journey_date || 'Sat, 12 Sep 2026',
      departureTime: train?.departure_time || '14:15',
      arrivalTime: train?.arrival_time || '10:10 (+2 days)',
      duration: train?.duration || '43h 55m',
      distance: train?.distance || '2,184 km',
      platform: train?.platform_number ? `Platform ${train.platform_number}` : 'Platform 2',
      classType: selectedClass?.class_type || 'Sleeper (SL)',
      classCode: selectedClass?.class_code || 'SL',
      quota: 'General (GN)',
      bookingStatus: 'CNF',
      chartStatus: 'Chart Not Prepared',
      bookingDate: new Date().toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' }),
      passengers: [
        {
          name: passName,
          age: passenger?.age || 26,
          gender: passenger?.gender === 'F' ? 'Female' : 'Male',
          coach: seat.coach,
          berth: seat.berthNumber,
          berthType: seat.berthType,
          status: 'CNF'
        }
      ],
      fare: {
        baseFare: Math.max(fare - 45, 0),
        convenienceFee: 45,
        gst: 35,
        totalFare: fare
      },
      payment: {
        status: 'SUCCESS',
        method: 'UPI / Google Pay',
        txnId: txnId,
        paidAt: new Date().toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })
      },
      isCancelled: false
    };

    // Save ticket to localStorage
    saveBookedTicket(ticket);

    // Render Success Screen
    content.innerHTML = `
      <div class="payment-success-view">
        <div class="success-icon-wrap">
          <i data-lucide="check-circle"></i>
        </div>
        <h2 class="success-title">Booking Confirmed!</h2>
        <p class="success-sub">Your payment of <strong>₹${fare.toLocaleString('en-IN')}</strong> was successful and your IRCTC ticket has been confirmed.</p>

        <!-- Ticket Highlight Card -->
        <div class="success-ticket-summary">
          <div class="sum-row">
            <div class="sum-item">
              <span class="sum-label">PNR NUMBER</span>
              <span class="sum-val font-mono highlight-pnr">${pnr}</span>
            </div>
            <div class="sum-item">
              <span class="sum-label">STATUS</span>
              <span class="status-pill cnf">CONFIRMED (CNF)</span>
            </div>
          </div>

          <div class="sum-train-row">
            <strong>${trainNo} • ${trainName}</strong>
            <span>${ticket.fromStationCode} ➔ ${ticket.toStationCode} (${ticket.journeyDate})</span>
          </div>

          <div class="sum-seat-row">
            <div class="seat-item">
              <span>Passenger:</span>
              <strong>${passName}</strong>
            </div>
            <div class="seat-item">
              <span>Coach:</span>
              <strong class="font-mono">${seat.coach}</strong>
            </div>
            <div class="seat-item">
              <span>Berth:</span>
              <strong class="font-mono">${seat.berthNumber} (${seat.berthType})</strong>
            </div>
          </div>
        </div>

        <div class="success-actions-row">
          <a href="ticket.html?pnr=${pnr}" class="btn-primary" style="flex:1;text-decoration:none;display:inline-flex;align-items:center;justify-content:center;gap:8px;">
            <i data-lucide="printer"></i> View & Print E-Ticket
          </a>
          <button type="button" class="btn-secondary" id="btn-quick-check-live-pnr" data-pnr="${pnr}" style="flex:1;">
            <i data-lucide="activity"></i> Track Live PNR
          </button>
        </div>
      </div>
    `;

    if (window.lucide) window.lucide.createIcons();

    document.getElementById('btn-quick-check-live-pnr')?.addEventListener('click', () => {
      closePaymentModal();
      openPNRModal(pnr);
    });
  }, 1800);
}
