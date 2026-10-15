/**
 * RouteLine Flight State & Mock Data Manager
 * 
 * Integrated with the RouteLine Flight Data Access Layer (`flight-data.js`)
 * Adheres to safety policies:
 * - Only verified demo/mock data is used.
 * - Sensitive payment details (card numbers, CVVs, OTPs) are NEVER stored in localStorage or sessionStorage.
 * - Handles persistence across the 8-step flight booking flow with resilient defaults.
 */

import {
  getAllAirports,
  getIndianAirports,
  getInternationalAirports,
  getAirportByCode,
  getAirportById,
  searchAirports,
  getAllFlights,
  getFlightById,
  searchFlights,
  getAvailableRoutes,
  getAllAirlines,
  getAirlineByCode,
  getFareTiers,
  getAddons,
  getMeals,
  getOccupiedSeats,
  calculateTotalFare
} from './flight-data.js';

const STORAGE_KEY = 'routeline_flight_session_v2';

// Backwards-compatible mock exports sourced from standardized JSON datasets
export const MOCK_FLIGHTS = getAllFlights();
export const FARE_TIERS = getFareTiers();
export const MOCK_ADDONS = getAddons();
export const MOCK_MEALS = getMeals();
export const OCCUPIED_SEATS = getOccupiedSeats();

// Re-export Data Access Layer functions for all pages
export {
  getAllAirports,
  getIndianAirports,
  getInternationalAirports,
  getAirportByCode,
  getAirportById,
  searchAirports,
  getAllFlights,
  getFlightById,
  searchFlights,
  getAvailableRoutes,
  getAllAirlines,
  getAirlineByCode,
  getFareTiers,
  getAddons,
  getMeals,
  getOccupiedSeats,
  calculateTotalFare
};

export const AVAILABLE_COUPONS = {
  'FLYLINE500': { code: 'FLYLINE500', discount: 500, type: 'flat', description: 'Flat ₹500 off on all domestic flights' },
  'FIRSTCLASS': { code: 'FIRSTCLASS', discount: 750, type: 'flat', description: 'Flat ₹750 off on Club / Flexi bookings' },
  'ROUTELINE10': { code: 'ROUTELINE10', discount: 0.10, type: 'percent', maxDiscount: 800, description: '10% instant discount up to ₹800' }
};

/**
 * Returns default flight booking state
 */
export function getDefaultFlightState() {
  const defaultFlight = MOCK_FLIGHTS[0] || {
    id: '6E-2415',
    airline: 'IndiGo Airlines',
    airlineCode: '6E',
    flightNumber: '6E-2415',
    aircraft: 'Airbus A321neo',
    logo: 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&w=80&q=80',
    originCode: 'PNQ',
    originCity: 'Pune',
    originAirport: 'Pune International Airport, Terminal 1',
    departureTime: '06:15',
    departureDate: '2026-10-24',
    destinationCode: 'DEL',
    destinationCity: 'New Delhi',
    destinationAirport: 'Indira Gandhi International, Terminal 3',
    arrivalTime: '08:35',
    arrivalDate: '2026-10-24',
    duration: '2h 20m',
    stops: 'Non-stop',
    basePrice: 4199,
    taxPrice: 740,
    seatsRemaining: 4,
    tags: ['Cheapest', 'On-time 94%'],
    amenities: ['15 kg Check-in', '7 kg Cabin', 'USB Power', 'Snacks available']
  };

  return {
    search: {
      originCode: defaultFlight.originCode || 'PNQ',
      originCity: defaultFlight.originCity || 'Pune',
      destinationCode: defaultFlight.destinationCode || 'DEL',
      destinationCity: defaultFlight.destinationCity || 'New Delhi',
      departureDate: defaultFlight.departureDate || '2026-10-24',
      returnDate: '',
      tripType: 'oneway',
      passengers: 1,
      travelClass: 'Economy'
    },
    selectedFlightId: defaultFlight.id,
    selectedFlight: defaultFlight,
    selectedFareTier: 'saver',
    passengersList: [
      {
        id: 1,
        title: 'Mr',
        firstName: '',
        lastName: '',
        dob: '',
        gender: 'Male',
        frequentFlyer: '',
        isLead: true
      }
    ],
    contactInfo: {
      email: '',
      mobile: '',
      whatsappUpdates: true,
      emergencyName: '',
      emergencyPhone: '',
      gstin: '',
      companyName: ''
    },
    selectedSeats: ['12A'],
    selectedBaggageId: 'bag-0',
    selectedMeals: [
      { id: 'meal-junglee', qty: 1 }
    ],
    selectedServices: ['priority-pass', 'insurance'],
    appliedCoupon: null,
    pnrSession: 'RL-8842-PNQ',
    demoBookingRef: 'RL-DEMO-9824-PNQ',
    status: 'IN_PROGRESS'
  };
}

/**
 * Get the current persistent state
 */
export function getFlightState() {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY) || localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      const def = getDefaultFlightState();
      saveFlightState(def);
      return def;
    }
    const parsed = JSON.parse(raw);
    if (!parsed.selectedFlight || !parsed.search) {
      const def = getDefaultFlightState();
      return Object.assign(def, parsed);
    }
    // Sanitize any legacy mock contacts/passengers
    if (parsed.passengersList && parsed.passengersList[0]) {
      if (parsed.passengersList[0].firstName === 'Rahul') parsed.passengersList[0].firstName = '';
      if (parsed.passengersList[0].lastName === 'Verma') parsed.passengersList[0].lastName = '';
      if (parsed.passengersList[0].dob === '1992-08-14') parsed.passengersList[0].dob = '';
    }
    if (parsed.contactInfo) {
      if (parsed.contactInfo.email && parsed.contactInfo.email.includes('rahul.verma')) parsed.contactInfo.email = '';
      if (parsed.contactInfo.mobile === '9876543210') parsed.contactInfo.mobile = '';
    }
    return parsed;
  } catch (err) {
    console.warn('Failed to parse flight state, using defaults', err);
    return getDefaultFlightState();
  }
}

/**
 * Save updated state securely
 */
export function saveFlightState(state) {
  try {
    // Sanitize to NEVER store card numbers or CVVs even if passed
    const sanitized = { ...state };
    if (sanitized.paymentDetails) {
      delete sanitized.paymentDetails.cardNumber;
      delete sanitized.paymentDetails.cvv;
      delete sanitized.paymentDetails.otp;
    }
    const str = JSON.stringify(sanitized);
    sessionStorage.setItem(STORAGE_KEY, str);
    localStorage.setItem(STORAGE_KEY, str);
    return sanitized;
  } catch (err) {
    console.error('Error saving flight state:', err);
    return state;
  }
}

/**
 * Update partial state
 */
export function updateFlightState(partial) {
  const current = getFlightState();
  const merged = { ...current, ...partial };
  return saveFlightState(merged);
}

/**
 * Calculate dynamic price breakdown (delegates to Data Access Layer)
 */
export function calculatePricing(state = getFlightState()) {
  return calculateTotalFare(state);
}

/**
 * Generate a demo booking reference
 */
export function generateDemoBookingRef(routeSuffix = 'PNQ') {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let ref = 'RL-';
  for (let i = 0; i < 4; i++) {
    ref += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  ref += `-${(routeSuffix || 'PNQ').toUpperCase().slice(0, 3)}`;
  return ref;
}
