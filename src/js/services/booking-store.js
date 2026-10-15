/**
 * RouteLine - Centralized Booking Store & User Isolation Service (booking-store.js)
 * Manages bookings across Trains, Flights, and Buses.
 * Guarantees strict user isolation:
 * - Authenticated users only see their own bookings.
 * - Guest users only see bookings created in their own isolated session.
 * - Different accounts on the same browser do not leak bookings to each other.
 * - Clean visits on new devices start with zero bookings.
 */

import { getCurrentUser, isAuthenticated } from '../home/auth/auth.js';

export const STORAGE_KEY_BOOKINGS_V2 = 'routeline_user_bookings_v2';
export const STORAGE_GUEST_SESSION_ID = 'routeline_guest_session_id';

/**
 * Retrieves or initializes an isolated Guest Session ID in sessionStorage.
 * This guarantees guest booking isolation without persisting across different browser sessions.
 */
export function getGuestSessionId() {
  if (typeof window === 'undefined') return 'guest_default';
  try {
    let id = sessionStorage.getItem(STORAGE_GUEST_SESSION_ID);
    if (!id) {
      id = 'gst_' + Date.now().toString(36) + '_' + Math.random().toString(36).substring(2, 9);
      sessionStorage.setItem(STORAGE_GUEST_SESSION_ID, id);
    }
    return id;
  } catch (e) {
    return 'guest_fallback';
  }
}

/**
 * Returns all raw bookings from localStorage (internal use only)
 */
function getRawBookings() {
  if (typeof localStorage === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY_BOOKINGS_V2);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (e) {
    console.error('[BookingStore] Failed to read bookings:', e);
    return [];
  }
}

/**
 * Saves all raw bookings to localStorage
 */
function setRawBookings(bookings) {
  if (typeof localStorage === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY_BOOKINGS_V2, JSON.stringify(bookings));
  } catch (e) {
    console.error('[BookingStore] Failed to write bookings:', e);
  }
}

/**
 * Default starter demo bookings scoped strictly to the generic demo account (demo@routeline.com)
 */
function getDemoStarterBookings(userId, userEmail) {
  return [
    {
      id: 'BK-TRN-11040-4114938453',
      bookingReference: '4114938453',
      type: 'train',
      userId: userId,
      userEmail: userEmail,
      guestSessionId: null,
      status: 'UPCOMING',
      title: 'Maharashtra Express (11040)',
      fromCode: 'NDLS',
      fromName: 'New Delhi',
      toCode: 'MAS',
      toName: 'MGR Chennai Central',
      journeyDate: 'Sat, 12 Sep 2026',
      departureTime: '14:15',
      arrivalTime: '10:10 (+2 days)',
      duration: '16h 40m',
      platform: 'Platform 2',
      classType: 'Second AC (2A)',
      classCode: '2A',
      quota: 'General (GN)',
      passengers: [
        {
          name: 'Demo Traveler',
          age: 28,
          gender: 'Male',
          coach: 'A3',
          berth: '35',
          berthType: 'Lower Berth (LB)',
          status: 'CNF'
        }
      ],
      totalFare: 1521,
      paymentMethod: 'UPI / Google Pay',
      isCancelled: false,
      createdAt: '2026-09-08T11:53:00.000Z',
      details: {
        trainNumber: '11040',
        trainName: 'Maharashtra Express',
        chartStatus: 'Chart Not Prepared',
        bookingId: 'RL-2026-486066',
        distance: '885 km'
      }
    },
    {
      id: 'BK-FLT-6E2415-9824',
      bookingReference: 'RL-DEMO-9824-PNQ',
      type: 'flight',
      userId: userId,
      userEmail: userEmail,
      guestSessionId: null,
      status: 'UPCOMING',
      title: 'IndiGo 6E-2415 (Airbus A320neo)',
      fromCode: 'PNQ',
      fromName: 'Pune Airport (PNQ)',
      toCode: 'DEL',
      toName: 'Indira Gandhi Int’l, T3 (DEL)',
      journeyDate: 'Thu, 24 Oct 2026',
      departureTime: '06:15',
      arrivalTime: '08:25',
      duration: '2h 10m',
      platform: 'Gate 4B',
      classType: 'Executive Economy (Flexi)',
      classCode: 'flexi',
      quota: 'Standard',
      passengers: [
        {
          name: 'Demo Traveler',
          seat: '12A',
          status: 'CONFIRMED'
        }
      ],
      totalFare: 7898,
      paymentMethod: 'UPI / HDFC Bank',
      isCancelled: false,
      createdAt: '2026-10-14T09:30:00.000Z',
      details: {
        airline: 'IndiGo',
        flightNumber: '6E-2415',
        seat: '12A (Extra Legroom XL)',
        baggage: '22 kg Complimentary + 5 kg Priority Pack',
        meal: 'Smoked Butter Chicken & Jeera Pulao'
      }
    },
    {
      id: 'BK-BUS-ZB-8921',
      bookingReference: 'ZB-PUN-MUM-8921',
      type: 'bus',
      userId: userId,
      userEmail: userEmail,
      guestSessionId: null,
      status: 'UPCOMING',
      title: 'Zingbus Executive AC Sleeper (2+1)',
      fromCode: 'PUN',
      fromName: 'Pune (Swargate Bus Terminal)',
      toCode: 'MUM',
      toName: 'Mumbai (Borivali West)',
      journeyDate: 'Sun, 18 Oct 2026',
      departureTime: '23:30',
      arrivalTime: '04:15 (+1 day)',
      duration: '4h 45m',
      platform: 'Bay 3',
      classType: 'AC Sleeper',
      classCode: 'AC-SL',
      quota: 'Standard',
      passengers: [
        {
          name: 'Demo Traveler',
          seat: 'Upper Berth 14',
          status: 'CONFIRMED'
        }
      ],
      totalFare: 850,
      paymentMethod: 'UPI / PhonePe',
      isCancelled: false,
      createdAt: '2026-10-12T14:20:00.000Z',
      details: {
        operator: 'Zingbus Premium',
        busType: 'Volvo 9600 Multi-Axle AC Sleeper',
        liveTracking: true
      }
    }
  ];
}

/**
 * Retrieves only bookings belonging to the currently authenticated user
 * or currently active guest session.
 * 
 * Strict Isolation Rules:
 * 1. Logged in user: matches `booking.userId === user.id` OR `booking.userEmail === user.email`.
 * 2. Guest user: matches `!booking.userId && booking.guestSessionId === currentGuestSessionId`.
 * 3. Never exposes another user's bookings.
 */
export function getBookingsForCurrentSession() {
  const allBookings = getRawBookings();
  const user = getCurrentUser();

  if (user && user.email) {
    const userEmail = user.email.toLowerCase().trim();
    const userId = user.id;

    // Filter user's own bookings
    let userBookings = allBookings.filter(b => {
      const matchId = userId && b.userId === userId;
      const matchEmail = b.userEmail && b.userEmail.toLowerCase().trim() === userEmail;
      return matchId || matchEmail;
    });

    // If demo account with 0 bookings, seed starter demo bookings exclusively for this demo account
    if (userBookings.length === 0 && userEmail === 'demo@routeline.com') {
      const demoBookings = getDemoStarterBookings(userId, user.email);
      const updatedAll = [...allBookings, ...demoBookings];
      setRawBookings(updatedAll);
      return demoBookings;
    }

    return userBookings;
  }

  // Guest session isolation: only return bookings created in this guest session
  const guestId = getGuestSessionId();
  return allBookings.filter(b => !b.userId && b.guestSessionId === guestId);
}

/**
 * Retrieves a booking by its reference or ID, with authorization check.
 * @param {string} ref - PNR or Booking Reference
 * @returns {{ authorized: boolean, booking: Object|null }}
 */
export function getBookingByRef(ref) {
  if (!ref) return { authorized: false, booking: null };
  const cleanRef = String(ref).trim().toUpperCase();
  const allBookings = getRawBookings();
  const found = allBookings.find(b => 
    (b.bookingReference && b.bookingReference.toUpperCase() === cleanRef) ||
    (b.id && b.id.toUpperCase() === cleanRef)
  );

  if (!found) return { authorized: false, booking: null };

  const user = getCurrentUser();
  if (user && user.email) {
    const isOwner = (user.id && found.userId === user.id) ||
      (found.userEmail && found.userEmail.toLowerCase() === user.email.toLowerCase());
    return { authorized: isOwner, booking: isOwner ? found : null, unowned: !isOwner };
  }

  // For guest
  const guestId = getGuestSessionId();
  const isGuestOwner = !found.userId && found.guestSessionId === guestId;
  return { authorized: isGuestOwner, booking: isGuestOwner ? found : null, unowned: !isGuestOwner };
}

/**
 * Public PNR verification helper:
 * Allows explicit ticket lookup (e.g. from the Check PNR modal or Guest ticket search),
 * but tags it as a lookup query rather than claiming account ownership.
 */
export function findBookingForPnrLookup(ref) {
  if (!ref) return null;
  const clean = String(ref).trim().replace(/\D/g, '');
  const allBookings = getRawBookings();
  return allBookings.find(b => b.bookingReference === clean || b.bookingReference === ref) || null;
}

/**
 * Adds a new booking associated strictly with the current user or guest session
 * @param {Object} bookingData
 */
export function saveBooking(bookingData) {
  if (!bookingData) return null;

  const user = getCurrentUser();
  const isAuth = Boolean(user && user.email);
  const guestId = !isAuth ? getGuestSessionId() : null;

  const newBooking = {
    id: bookingData.id || `BK-${(bookingData.type || 'TRN').toUpperCase().substring(0,3)}-${Date.now().toString().slice(-6)}`,
    bookingReference: bookingData.bookingReference || bookingData.pnr || String(Math.floor(1000000000 + Math.random() * 9000000000)),
    type: bookingData.type || 'train',
    userId: isAuth ? user.id : null,
    userEmail: isAuth ? user.email : null,
    guestSessionId: guestId,
    status: bookingData.status || 'UPCOMING',
    title: bookingData.title || 'Travel Booking',
    fromCode: bookingData.fromCode || 'DEP',
    fromName: bookingData.fromName || 'Origin',
    toCode: bookingData.toCode || 'ARR',
    toName: bookingData.toName || 'Destination',
    journeyDate: bookingData.journeyDate || new Date().toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' }),
    departureTime: bookingData.departureTime || '10:00',
    arrivalTime: bookingData.arrivalTime || '14:00',
    duration: bookingData.duration || '4h 00m',
    platform: bookingData.platform || 'Platform 1',
    classType: bookingData.classType || 'Standard',
    classCode: bookingData.classCode || 'STD',
    quota: bookingData.quota || 'General (GN)',
    passengers: bookingData.passengers || [{ name: isAuth ? user.name : 'Guest Passenger', status: 'CONFIRMED' }],
    totalFare: bookingData.totalFare || bookingData.fare?.totalFare || 0,
    paymentMethod: bookingData.paymentMethod || 'UPI / Online',
    isCancelled: false,
    createdAt: new Date().toISOString(),
    details: bookingData.details || {}
  };

  const allBookings = getRawBookings();
  // Check for duplicate reference
  const existingIdx = allBookings.findIndex(b => b.bookingReference === newBooking.bookingReference);
  if (existingIdx >= 0) {
    allBookings[existingIdx] = newBooking;
  } else {
    allBookings.unshift(newBooking);
  }

  setRawBookings(allBookings);
  return newBooking;
}

/**
 * Cancels a booking with authorization check
 * @param {string} bookingRefOrId
 * @returns {Object|null}
 */
export function cancelBooking(bookingRefOrId) {
  const { authorized, booking } = getBookingByRef(bookingRefOrId);
  if (!authorized || !booking) {
    return { success: false, error: 'Unauthorized: You do not have permission to cancel this booking.' };
  }

  if (booking.isCancelled) {
    return { success: false, error: 'This booking has already been cancelled.' };
  }

  const allBookings = getRawBookings();
  const target = allBookings.find(b => b.id === booking.id || b.bookingReference === booking.bookingReference);
  if (!target) {
    return { success: false, error: 'Booking not found.' };
  }

  const fee = target.type === 'train' ? 180 : (target.type === 'flight' ? 1500 : 100);
  const refundAmount = Math.max(0, target.totalFare - fee);

  target.isCancelled = true;
  target.status = 'CANCELLED';
  target.cancellation = {
    cancelledAt: new Date().toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' }),
    cancellationFee: fee,
    refundAmount: refundAmount,
    refundStatus: 'REFUND_PROCESSED_TO_SOURCE',
    refundTxnId: `REF-${Date.now().toString().slice(-8)}`
  };

  setRawBookings(allBookings);
  return { success: true, booking: target };
}

/**
 * Filter bookings by status tab
 * @param {Array} bookings
 * @param {'all'|'upcoming'|'completed'|'cancelled'} tab
 */
export function filterBookingsByTab(bookings, tab = 'all') {
  if (!Array.isArray(bookings)) return [];
  switch (tab) {
    case 'upcoming':
      return bookings.filter(b => !b.isCancelled && b.status !== 'COMPLETED');
    case 'completed':
      return bookings.filter(b => b.status === 'COMPLETED');
    case 'cancelled':
      return bookings.filter(b => b.isCancelled || b.status === 'CANCELLED');
    case 'all':
    default:
      return bookings;
  }
}

/**
 * Filter bookings by mode type
 * @param {Array} bookings
 * @param {'all'|'train'|'flight'|'bus'} type
 */
export function filterBookingsByType(bookings, type = 'all') {
  if (!Array.isArray(bookings)) return [];
  if (type === 'all') return bookings;
  return bookings.filter(b => b.type === type);
}
