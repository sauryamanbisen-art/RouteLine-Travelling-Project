/**
 * RouteLine Flight State & Mock Data Manager
 * Adheres to safety policies:
 * - Only demo/mock data is used.
 * - Sensitive payment details (card numbers, CVVs) are NEVER stored in localStorage or sessionStorage.
 * - Handles persistence across the 8-step flight booking flow with resilient defaults.
 */

const STORAGE_KEY = 'routeline_flight_session_v1';

export const MOCK_FLIGHTS = [
  {
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
  },
  {
    id: 'AI-852',
    airline: 'Air India',
    airlineCode: 'AI',
    flightNumber: 'AI-852',
    aircraft: 'Airbus A320neo',
    logo: 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?auto=format&fit=crop&w=80&q=80',
    originCode: 'PNQ',
    originCity: 'Pune',
    originAirport: 'Pune International Airport, Terminal 1',
    departureTime: '09:30',
    departureDate: '2026-10-24',
    destinationCode: 'DEL',
    destinationCity: 'New Delhi',
    destinationAirport: 'Indira Gandhi International, Terminal 3',
    arrivalTime: '11:55',
    arrivalDate: '2026-10-24',
    duration: '2h 25m',
    stops: 'Non-stop',
    basePrice: 4850,
    taxPrice: 820,
    seatsRemaining: 9,
    tags: ['Complimentary Meal'],
    amenities: ['25 kg Check-in', '7 kg Cabin', 'Hot Meal Included', 'Beverages']
  },
  {
    id: 'UK-992',
    airline: 'Vistara',
    airlineCode: 'UK',
    flightNumber: 'UK-992',
    aircraft: 'Boeing 737-800',
    logo: 'https://images.unsplash.com/photo-1436491865332-7a61a109cc05?auto=format&fit=crop&w=80&q=80',
    originCode: 'PNQ',
    originCity: 'Pune',
    originAirport: 'Pune International Airport, Terminal 1',
    departureTime: '14:10',
    departureDate: '2026-10-24',
    destinationCode: 'DEL',
    destinationCity: 'New Delhi',
    destinationAirport: 'Indira Gandhi International, Terminal 3',
    arrivalTime: '16:30',
    arrivalDate: '2026-10-24',
    duration: '2h 20m',
    stops: 'Non-stop',
    basePrice: 5400,
    taxPrice: 890,
    seatsRemaining: 6,
    tags: ['Executive Comfort'],
    amenities: ['15 kg Check-in', '7 kg Cabin', 'Star Chef Meal', 'Extra Recline']
  },
  {
    id: 'QP-1382',
    airline: 'Akasa Air',
    airlineCode: 'QP',
    flightNumber: 'QP-1382',
    aircraft: 'Boeing 737 MAX 8',
    logo: 'https://images.unsplash.com/photo-1506015391300-4802dc74de2e?auto=format&fit=crop&w=80&q=80',
    originCode: 'PNQ',
    originCity: 'Pune',
    originAirport: 'Pune International Airport, Terminal 1',
    departureTime: '18:45',
    departureDate: '2026-10-24',
    destinationCode: 'DEL',
    destinationCity: 'New Delhi',
    destinationAirport: 'Indira Gandhi International, Terminal 2',
    arrivalTime: '21:05',
    arrivalDate: '2026-10-24',
    duration: '2h 20m',
    stops: 'Non-stop',
    basePrice: 3950,
    taxPrice: 710,
    seatsRemaining: 2,
    tags: ['Best Value', 'Eco Jet'],
    amenities: ['15 kg Check-in', '7 kg Cabin', 'USB Type-C', 'Cafe Akasa']
  },
  {
    id: '6E-512',
    airline: 'IndiGo Airlines',
    airlineCode: '6E',
    flightNumber: '6E-512',
    aircraft: 'Airbus A321neo',
    logo: 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&w=80&q=80',
    originCode: 'PNQ',
    originCity: 'Pune',
    originAirport: 'Pune International Airport, Terminal 1',
    departureTime: '21:30',
    departureDate: '2026-10-24',
    destinationCode: 'DEL',
    destinationCity: 'New Delhi',
    destinationAirport: 'Indira Gandhi International, Terminal 3',
    arrivalTime: '23:45',
    arrivalDate: '2026-10-24',
    duration: '2h 15m',
    stops: 'Non-stop',
    basePrice: 4350,
    taxPrice: 760,
    seatsRemaining: 8,
    tags: ['Late Evening'],
    amenities: ['15 kg Check-in', '7 kg Cabin', 'Direct Gate Boarding']
  }
];

export const FARE_TIERS = {
  saver: {
    id: 'saver',
    name: 'Saver Fare',
    badge: 'Standard',
    priceOffset: 0,
    features: ['Standard 15 kg Check-in', '7 kg Hand Baggage', 'Seat Selection from ₹200', 'Standard Date Change Fee']
  },
  flexi: {
    id: 'flexi',
    name: 'Flexi Plus',
    badge: 'Most Popular',
    priceOffset: 750,
    features: ['Complimentary Standard Seat', 'Free Date Change up to 24h prior', 'Complimentary Snack & Beverage', 'Priority Baggage Handling']
  },
  club: {
    id: 'club',
    name: 'RouteLine Concierge Club',
    badge: 'Executive VIP',
    priceOffset: 2200,
    features: ['Extra Legroom Seat Included', 'Zero Reschedule / Cancellation Fees', 'Complimentary Gourmet Hot Meal', 'Airport Lounge & Fast Track Priority']
  }
};

export const MOCK_MEALS = [
  { id: 'meal-junglee', name: 'Junglee Chicken Sandwich', type: 'Non-Veg', price: 350, calories: '420 kcal' },
  { id: 'meal-paneer', name: 'Paneer Tikka Kathi Roll', type: 'Veg', price: 300, calories: '380 kcal' },
  { id: 'meal-upma', name: 'South Indian Upma & Filter Coffee', type: 'Veg', price: 280, calories: '290 kcal' },
  { id: 'meal-fruit', name: 'Fresh Seasonal Fruit Platter', type: 'Vegan', price: 320, calories: '160 kcal' }
];

export const MOCK_ADDONS = {
  baggage: [
    { id: 'bag-0', weight: '0 kg', price: 0, label: 'Standard Included (15 kg)' },
    { id: 'bag-5', weight: '+5 kg', price: 1500, label: 'Prepaid +5 kg Check-in' },
    { id: 'bag-10', weight: '+10 kg', price: 2800, label: 'Prepaid +10 kg Check-in (Save 20%)' },
    { id: 'bag-15', weight: '+15 kg', price: 4000, label: 'Prepaid +15 kg Check-in (Save 30%)' }
  ],
  services: [
    { id: 'priority-pass', name: 'Fast-Track Priority Pass', desc: 'Dedicated check-in lane & fast boarding', price: 499 },
    { id: 'lounge-access', name: 'Executive Airport Lounge', desc: 'Buffet meals, high-speed Wi-Fi & quiet suites', price: 1200 },
    { id: 'insurance', name: 'Multi-Modal Trip Insurance', desc: 'Covers delays, baggage loss, and connecting train miss', price: 249 }
  ]
};

export const OCCUPIED_SEATS = ['1B', '2A', '2C', '3D', '4B', '5E', '6C', '7A', '8D', '9E', '10F', '12B', '12E', '14A', '15C', '16B', '18D', '20E', '22A', '25C'];

export const AVAILABLE_COUPONS = {
  'FLYLINE500': { code: 'FLYLINE500', discount: 500, type: 'flat', description: 'Flat ₹500 off on all domestic flights' },
  'FIRSTCLASS': { code: 'FIRSTCLASS', discount: 750, type: 'flat', description: 'Flat ₹750 off on Club / Flexi bookings' },
  'ROUTELINE10': { code: 'ROUTELINE10', discount: 0.10, type: 'percent', maxDiscount: 800, description: '10% instant discount up to ₹800' }
};

/**
 * Returns default flight booking state
 */
export function getDefaultFlightState() {
  const defaultFlight = MOCK_FLIGHTS[0];
  return {
    search: {
      originCode: 'PNQ',
      originCity: 'Pune',
      destinationCode: 'DEL',
      destinationCity: 'New Delhi',
      departureDate: '2026-10-24',
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
        firstName: 'Rahul',
        lastName: 'Verma',
        dob: '1992-08-14',
        gender: 'Male',
        frequentFlyer: '6E-994821',
        isLead: true
      }
    ],
    contactInfo: {
      email: 'rahul.verma@example.com',
      mobile: '9876543210',
      whatsappUpdates: true,
      emergencyName: 'Priya Verma',
      emergencyPhone: '9876543211',
      gstin: '',
      companyName: ''
    },
    selectedSeats: ['12A'], // Emergency exit default selection
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
    // Ensure nested objects exist
    if (!parsed.selectedFlight || !parsed.search) {
      const def = getDefaultFlightState();
      return Object.assign(def, parsed);
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
 * Calculate dynamic price breakdown
 */
export function calculatePricing(state = getFlightState()) {
  const flight = state.selectedFlight || MOCK_FLIGHTS[0];
  const passengerCount = (state.passengersList && state.passengersList.length) || state.search.passengers || 1;
  const baseFarePerPax = flight.basePrice || 4199;
  const taxPerPax = flight.taxPrice || 740;
  
  // Tier offset
  const tier = FARE_TIERS[state.selectedFareTier] || FARE_TIERS.saver;
  const tierCost = tier.priceOffset * passengerCount;

  const totalBaseFare = (baseFarePerPax * passengerCount) + tierCost;
  const totalTaxes = taxPerPax * passengerCount;

  // Seat pricing
  let seatsCost = 0;
  if (state.selectedSeats && state.selectedSeats.length > 0) {
    state.selectedSeats.forEach(seat => {
      const row = parseInt(seat, 10);
      if (row <= 3 || row === 12) {
        seatsCost += (tier.id === 'club') ? 0 : 800; // Extra Legroom
      } else if (row <= 11) {
        seatsCost += (tier.id === 'flexi' || tier.id === 'club') ? 0 : 400; // Preferred
      } else {
        seatsCost += (tier.id === 'flexi' || tier.id === 'club') ? 0 : 200; // Standard
      }
    });
  }

  // Baggage pricing
  const bagObj = MOCK_ADDONS.baggage.find(b => b.id === state.selectedBaggageId);
  const baggageCost = bagObj ? bagObj.price : 0;

  // Meals pricing
  let mealsCost = 0;
  if (state.selectedMeals && Array.isArray(state.selectedMeals)) {
    state.selectedMeals.forEach(m => {
      const mealItem = MOCK_MEALS.find(x => x.id === m.id);
      if (mealItem) {
        mealsCost += mealItem.price * (m.qty || 1);
      }
    });
  }

  // Services pricing
  let servicesCost = 0;
  if (state.selectedServices && Array.isArray(state.selectedServices)) {
    state.selectedServices.forEach(srvId => {
      const srvObj = MOCK_ADDONS.services.find(s => s.id === srvId);
      if (srvObj) {
        servicesCost += srvObj.price;
      }
    });
  }

  const subtotal = totalBaseFare + totalTaxes + seatsCost + baggageCost + mealsCost + servicesCost;

  // Coupon discount
  let discount = 0;
  if (state.appliedCoupon) {
    if (state.appliedCoupon.type === 'flat') {
      discount = state.appliedCoupon.discount;
    } else if (state.appliedCoupon.type === 'percent') {
      discount = Math.min(totalBaseFare * state.appliedCoupon.discount, state.appliedCoupon.maxDiscount || 1000);
    }
  }

  const grandTotal = Math.max(0, subtotal - discount);

  return {
    passengerCount,
    baseFarePerPax,
    totalBaseFare,
    totalTaxes,
    tierName: tier.name,
    tierCost,
    seatsCost,
    baggageCost,
    mealsCost,
    servicesCost,
    subtotal,
    discount,
    appliedCouponCode: state.appliedCoupon ? state.appliedCoupon.code : null,
    grandTotal: Math.round(grandTotal)
  };
}

/**
 * Generate a demo booking reference
 */
export function generateDemoBookingRef() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let ref = 'RL-';
  for (let i = 0; i < 4; i++) {
    ref += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  ref += '-PNQ';
  return ref;
}
