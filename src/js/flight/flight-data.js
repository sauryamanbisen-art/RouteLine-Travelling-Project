/**
 * RouteLine Professional Flight Data Access Layer
 * 
 * Provides unified, cached, and validated access to all flight mock datasets:
 * - airports.json: Verified Indian and International airport directory
 * - flights.json: Verified domestic and international flight itineraries
 * - airlines.json: Airline operators and brand identities
 * - fares.json: Cabin classes, fare tiers, and cancellation/rescheduling terms
 * - addons.json: Prepaid baggage, lounge access, priority passes, and travel insurance
 * - meals.json: Curated in-flight gourmet meals and dietary preferences
 */

import airportsData from '../../data/flight/airports-data.js';
import flightsData from '../../data/flight/flights-data.js';
import airlinesData from '../../data/flight/airlines-data.js';
import faresData from '../../data/flight/fares-data.js';
import addonsData from '../../data/flight/addons-data.js';
import mealsData from '../../data/flight/meals-data.js';

// In-memory caches for rapid lookup
const AIRPORT_BY_CODE = new Map();
const AIRPORT_BY_ID = new Map();
const FLIGHT_BY_ID = new Map();
const AIRLINE_BY_CODE = new Map();

// Initialize indexing
airportsData.forEach(airport => {
  AIRPORT_BY_CODE.set(airport.iataCode.toUpperCase(), airport);
  AIRPORT_BY_ID.set(airport.id, airport);
});

flightsData.forEach(flight => {
  FLIGHT_BY_ID.set(flight.id, flight);
});

airlinesData.forEach(airline => {
  AIRLINE_BY_CODE.set(airline.code.toUpperCase(), airline);
});

/**
 * Get all verified airports
 * @returns {Array<Object>}
 */
export function getAllAirports() {
  return airportsData;
}

/**
 * Get all verified Indian airports
 * @returns {Array<Object>}
 */
export function getIndianAirports() {
  return airportsData.filter(a => a.countryCode === 'IN');
}

/**
 * Get all verified International airports
 * @returns {Array<Object>}
 */
export function getInternationalAirports() {
  return airportsData.filter(a => a.countryCode !== 'IN');
}

/**
 * Look up an airport by its 3-letter IATA code
 * @param {string} code - e.g. "PNQ", "DEL", "LHR"
 * @returns {Object|null}
 */
export function getAirportByCode(code) {
  if (!code || typeof code !== 'string') return null;
  return AIRPORT_BY_CODE.get(code.trim().toUpperCase()) || null;
}

/**
 * Look up an airport by its unique ID
 * @param {string} id - e.g. "airport-pnq"
 * @returns {Object|null}
 */
export function getAirportById(id) {
  if (!id) return null;
  return AIRPORT_BY_ID.get(id) || null;
}

/**
/**
 * Simple Levenshtein distance helper for fuzzy typo tolerance
 */
function levenshteinDistance(a, b) {
  if (a === b) return 0;
  if (!a.length) return b.length;
  if (!b.length) return a.length;
  const d = [];
  for (let i = 0; i <= b.length; i++) d[i] = i;
  for (let i = 1; i <= a.length; i++) {
    let prev = i;
    for (let j = 1; j <= b.length; j++) {
      const temp = d[j];
      if (a[i - 1] === b[j - 1]) {
        d[j] = prev;
      } else {
        d[j] = Math.min(prev + 1, d[j] + 1, d[j - 1] + 1);
      }
      prev = temp;
    }
  }
  return d[b.length];
}

function hashString(str = '') {
  let h = 0;
  for (let i = 0; i < str.length; i++) {
    h = ((h << 5) - h) + str.charCodeAt(i);
    h |= 0;
  }
  return h;
}

function generateSyntheticFlights(orig, dest, depDate) {
  const isDomestic = orig.countryCode === 'IN' && dest.countryCode === 'IN';
  const depD = depDate || new Date().toISOString().split('T')[0];

  const templates = isDomestic ? [
    {
      airline: 'IndiGo Airlines',
      airlineCode: '6E',
      num: 2000 + (Math.abs(hashString(orig.iataCode + dest.iataCode)) % 800),
      aircraft: 'Airbus A320neo',
      logo: 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&w=80&q=80',
      depTime: '07:30',
      arrTime: '09:20',
      duration: '1h 50m',
      base: 4150,
      tax: 680,
      tags: ['Cheapest', 'Fastest'],
      amenities: ['15 kg Check-in', '7 kg Cabin', 'USB Power']
    },
    {
      airline: 'Air India',
      airlineCode: 'AI',
      num: 400 + (Math.abs(hashString(dest.iataCode + orig.iataCode)) % 500),
      aircraft: 'Airbus A321neo',
      logo: 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?auto=format&fit=crop&w=80&q=80',
      depTime: '14:15',
      arrTime: '16:10',
      duration: '1h 55m',
      base: 4680,
      tax: 740,
      tags: ['Complimentary Meal'],
      amenities: ['15 kg Check-in', '7 kg Cabin', 'Hot Meal Included', 'USB Power']
    },
    {
      airline: 'Vistara',
      airlineCode: 'UK',
      num: 700 + (Math.abs(hashString(orig.iataCode + 'UK')) % 280),
      aircraft: 'Airbus A320neo',
      logo: 'https://images.unsplash.com/photo-1559297434-fae8a1916a79?auto=format&fit=crop&w=80&q=80',
      depTime: '19:40',
      arrTime: '21:35',
      duration: '1h 55m',
      base: 5120,
      tax: 820,
      tags: ['Full Service', 'On-time 96%'],
      amenities: ['15 kg Check-in', '7 kg Cabin', 'Gourmet Meal', 'Extra Legroom']
    }
  ] : [
    {
      airline: 'Air India',
      airlineCode: 'AI',
      num: 120 + (Math.abs(hashString(orig.iataCode + dest.iataCode)) % 100),
      aircraft: 'Boeing 787-9 Dreamliner',
      logo: 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?auto=format&fit=crop&w=80&q=80',
      depTime: '06:15',
      arrTime: '14:45',
      duration: '8h 30m',
      base: 38500,
      tax: 4200,
      tags: ['Direct Flight', 'Free Meals'],
      amenities: ['2x23 kg Check-in', '8 kg Cabin', 'In-flight Entertainment', 'Full Meals']
    },
    {
      airline: 'Emirates',
      airlineCode: 'EK',
      num: 500 + (Math.abs(hashString(dest.iataCode)) % 40),
      aircraft: 'Boeing 777-300ER',
      logo: 'https://images.unsplash.com/photo-1436491865332-7a61a109cc05?auto=format&fit=crop&w=80&q=80',
      depTime: '13:00',
      arrTime: '22:15',
      duration: '9h 15m',
      base: 42300,
      tax: 4600,
      tags: ['Premium Service', 'Complimentary WiFi'],
      amenities: ['30 kg Check-in', '7 kg Cabin', 'Gourmet Dining', 'ice Entertainment']
    }
  ];

  return templates.map(t => ({
    id: `${t.airlineCode}-${t.num}`,
    airline: t.airline,
    airlineCode: t.airlineCode,
    flightNumber: `${t.airlineCode}-${t.num}`,
    aircraft: t.aircraft,
    logo: t.logo,
    originCode: orig.iataCode,
    originCity: orig.city,
    originAirport: `${orig.name}, Terminal 1`,
    departureTime: t.depTime,
    departureDate: depD,
    destinationCode: dest.iataCode,
    destinationCity: dest.city,
    destinationAirport: `${dest.name}, Terminal 1`,
    arrivalTime: t.arrTime,
    arrivalDate: depD,
    duration: t.duration,
    stops: 'Non-stop',
    basePrice: t.base,
    taxPrice: t.tax,
    seatsRemaining: 5 + (Math.abs(hashString(t.flightNumber)) % 6),
    tags: t.tags,
    amenities: t.amenities
  }));
}

/**
 * Search airports by autocomplete query across city, name, IATA, country, and aliases
 * Ranks exact IATA matches and city prefix matches highest.
 * Includes fuzzy typo tolerance for common misspelling (e.g. "nagpure" -> Nagpur).
 * 
 * @param {string} rawQuery - search keyword
 * @param {number} limit - maximum results to return (default: 10)
 * @returns {Array<Object>}
 */
export function searchAirports(rawQuery = '', limit = 10) {
  const trimmed = (rawQuery || '').trim();
  const q = trimmed.toLowerCase();
  
  // If query is empty, return popular domestic and international hubs
  if (!q) {
    const popularCodes = ['PNQ', 'DEL', 'BOM', 'BLR', 'NAG', 'CCU', 'MAA', 'HYD', 'GOI', 'DXB', 'LHR', 'SIN'];
    return popularCodes.map(code => AIRPORT_BY_CODE.get(code)).filter(Boolean).slice(0, limit);
  }

  // Extract IATA code in brackets if present e.g. "Pune (PNQ)"
  const codeInParens = trimmed.match(/\(([A-Za-z0-9]{3})\)/);
  const explicitCode = codeInParens ? codeInParens[1].toUpperCase() : null;

  // Clean alphanumeric for comparison
  const cleanQ = q.replace(/[^a-z0-9]/g, '');

  const scored = [];

  for (const airport of airportsData) {
    const iata = airport.iataCode.toLowerCase();
    const city = airport.city.toLowerCase();
    const cleanCity = city.replace(/[^a-z0-9]/g, '');
    const name = airport.name.toLowerCase();
    const country = airport.country.toLowerCase();
    const aliases = (airport.searchTerms || []).map(t => t.toLowerCase());

    let score = 0;

    if (explicitCode && airport.iataCode === explicitCode) {
      score = 110;
    } else if (iata === q || iata === cleanQ) {
      score = 100;
    } else if (city === q || cleanCity === cleanQ) {
      score = 95;
    } else if (iata.startsWith(cleanQ)) {
      score = 90;
    } else if (cleanCity.startsWith(cleanQ)) {
      score = 88;
    } else if (cleanQ.length >= 4 && cleanQ.startsWith(cleanCity)) {
      // Handles user typing "nagpure" -> city "nagpur"
      score = 85;
    } else if (cleanCity.includes(cleanQ)) {
      score = 80;
    } else if (cleanQ.length >= 4 && levenshteinDistance(cleanQ, cleanCity) <= 2) {
      // Handles minor typos: "pune" vs "puna", "bengalor" vs "bengaluru"
      score = 78;
    } else if (aliases.some(alias => alias === q || alias === cleanQ)) {
      score = 82;
    } else if (aliases.some(alias => alias.startsWith(cleanQ) || (cleanQ.length >= 4 && cleanQ.startsWith(alias)))) {
      score = 75;
    } else if (aliases.some(alias => alias.includes(cleanQ))) {
      score = 65;
    } else if (name.startsWith(q) || name.includes(q)) {
      score = 55;
    } else if (country.startsWith(q) || country.includes(q)) {
      score = 35;
    }

    if (score > 0) {
      scored.push({ airport, score });
    }
  }

  // Sort descending by score, then alphabetically by city
  scored.sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score;
    return a.airport.city.localeCompare(b.airport.city);
  });

  return scored.slice(0, limit).map(item => item.airport);
}

/**
 * Get all flights in the inventory
 * @returns {Array<Object>}
 */
export function getAllFlights() {
  return flightsData;
}

/**
 * Look up flight by its unique ID
 * @param {string} id - e.g. "6E-2415"
 * @returns {Object|null}
 */
export function getFlightById(id) {
  if (!id) return null;
  return FLIGHT_BY_ID.get(id) || null;
}

/**
 * Search flights matching route, date, passengers, and optional filters
 * Strictly enforces origin and destination routing.
 * If no static flights exist for a route, dynamically synthesizes realistic flights
 * to ensure every route across all 179 airports is functional end-to-end.
 * 
 * @param {Object} criteria
 * @param {string} criteria.originCode - origin IATA code (e.g. "PNQ")
 * @param {string} criteria.destinationCode - destination IATA code (e.g. "DEL")
 * @param {string} [criteria.departureDate] - ISO date string "YYYY-MM-DD"
 * @param {boolean} [criteria.strictDate=false] - if true, only exact date matches returned
 * @param {number} [criteria.passengers=1] - passenger count filter
 * @param {string} [criteria.travelClass] - 'Economy' | 'Premium Economy' | 'Business' | 'First'
 * @param {Array<string>} [criteria.airlines] - array of airline names to include
 * @param {number} [criteria.maxPrice] - maximum base price
 * @param {string} [criteria.timeSlot] - 'early' (<6am) | 'morning' (6-12) | 'afternoon' (12-18) | 'night' (>=18)
 * @param {string} [criteria.stops] - 'Non-stop' | '1 Stop'
 * @param {string} [criteria.sortBy='recommended'] - 'cheapest' | 'fastest' | 'earliest' | 'recommended'
 * @returns {Array<Object>}
 */
export function searchFlights(criteria = {}) {
  const origin = (criteria.originCode || criteria.origin || '').trim().toUpperCase();
  const dest = (criteria.destinationCode || criteria.destination || '').trim().toUpperCase();
  const depDate = (criteria.departureDate || criteria.date || '').trim();
  const passengers = parseInt(criteria.passengers, 10) || 1;

  // Origin and Destination are strictly enforced
  let results = flightsData.filter(flight => {
    if (origin && flight.originCode.toUpperCase() !== origin) return false;
    if (dest && flight.destinationCode.toUpperCase() !== dest) return false;
    if (flight.seatsRemaining < passengers) return false;
    return true;
  });

  // If no static flights exist for this route, dynamically synthesize realistic scheduled flights
  if (results.length === 0 && origin && dest && origin !== dest) {
    const origAirport = AIRPORT_BY_CODE.get(origin);
    const destAirport = AIRPORT_BY_CODE.get(dest);

    if (origAirport && destAirport) {
      const synthetic = generateSyntheticFlights(origAirport, destAirport, depDate || '2026-10-24');
      synthetic.forEach(f => {
        FLIGHT_BY_ID.set(f.id, f);
      });
      results = synthetic;
    }
  }

  // Date filtering
  if (depDate) {
    const exactDateMatches = results.filter(f => f.departureDate === depDate);
    if (criteria.strictDate) {
      results = exactDateMatches;
    } else {
      // If we have flights on this date, use them. Otherwise, keep route flights
      // but attach the requested departureDate for seamless booking simulation.
      if (exactDateMatches.length > 0) {
        results = exactDateMatches;
      } else if (results.length > 0) {
        results = results.map(f => ({
          ...f,
          departureDate: depDate,
          arrivalDate: depDate
        }));
      }
    }
  }

  // Airline filter
  if (Array.isArray(criteria.airlines) && criteria.airlines.length > 0) {
    const airlineSet = new Set(criteria.airlines.map(a => a.toLowerCase()));
    results = results.filter(f => airlineSet.has(f.airline.toLowerCase()));
  }

  // Stops filter
  if (criteria.stops) {
    results = results.filter(f => f.stops.toLowerCase() === criteria.stops.toLowerCase());
  }

  // Max price filter
  if (typeof criteria.maxPrice === 'number' && !isNaN(criteria.maxPrice)) {
    results = results.filter(f => f.basePrice <= criteria.maxPrice);
  }

  // Time slot filter
  if (criteria.timeSlot) {
    results = results.filter(f => {
      const hour = parseInt(f.departureTime.split(':')[0], 10);
      switch (criteria.timeSlot) {
        case 'early': return hour < 6;
        case 'morning': return hour >= 6 && hour < 12;
        case 'afternoon': return hour >= 12 && hour < 18;
        case 'night': return hour >= 18;
        default: return true;
      }
    });
  }

  // Sorting
  const sortBy = criteria.sortBy || 'recommended';
  results.sort((a, b) => {
    if (sortBy === 'cheapest') {
      return (a.basePrice + a.taxPrice) - (b.basePrice + b.taxPrice);
    }
    if (sortBy === 'fastest') {
      return a.duration.localeCompare(b.duration);
    }
    if (sortBy === 'earliest') {
      return a.departureTime.localeCompare(b.departureTime);
    }
    // Recommended: balance cheapest tag, price, and seats remaining
    const aScore = (a.tags.includes('Cheapest') ? -1000 : 0) + a.basePrice;
    const bScore = (b.tags.includes('Cheapest') ? -1000 : 0) + b.basePrice;
    return aScore - bScore;
  });

  return results;
}

/**
 * Get distinct corridors/routes available in mock data
 * @returns {Array<{originCode: string, originCity: string, destinationCode: string, destinationCity: string, flightCount: number}>}
 */
export function getAvailableRoutes() {
  const routeMap = new Map();

  for (const f of flightsData) {
    const key = `${f.originCode}->${f.destinationCode}`;
    if (!routeMap.has(key)) {
      routeMap.set(key, {
        originCode: f.originCode,
        originCity: f.originCity,
        destinationCode: f.destinationCode,
        destinationCity: f.destinationCity,
        flightCount: 1,
        minPrice: f.basePrice
      });
    } else {
      const entry = routeMap.get(key);
      entry.flightCount++;
      entry.minPrice = Math.min(entry.minPrice, f.basePrice);
    }
  }

  return Array.from(routeMap.values());
}

/**
 * Get airline operators dataset
 * @returns {Array<Object>}
 */
export function getAllAirlines() {
  return airlinesData;
}

/**
 * Look up airline by 2-letter IATA code
 * @param {string} code - e.g. "6E", "AI", "EK"
 * @returns {Object|null}
 */
export function getAirlineByCode(code) {
  if (!code) return null;
  return AIRLINE_BY_CODE.get(code.toUpperCase()) || null;
}

/**
 * Get fare tiers configuration
 * @returns {Object}
 */
export function getFareTiers() {
  return faresData;
}

/**
 * Get add-on options (baggage tiers and special services)
 * @returns {Object}
 */
export function getAddons() {
  return addonsData;
}

/**
 * Get in-flight meal options
 * @returns {Array<Object>}
 */
export function getMeals() {
  return mealsData;
}

/**
 * Get occupied mock seat IDs for an aircraft/flight
 * @param {string} [flightId]
 * @returns {Array<string>}
 */
export function getOccupiedSeats(flightId = '') {
  return [
    '1B', '2A', '2C', '3D', '4B', '5E', '6C', 
    '7A', '8D', '9E', '10F', '12B', '12E', 
    '14A', '15C', '16B', '18D', '20E', '22A', '25C'
  ];
}

/**
 * Calculate total fare breakdown reliably
 * 
 * @param {Object} state - current booking state
 * @returns {Object}
 */
export function calculateTotalFare(state) {
  if (!state) return null;
  const flight = state.selectedFlight || flightsData[0];
  const passengerCount = (state.passengersList && state.passengersList.length) || state.search?.passengers || 1;
  const baseFarePerPax = flight.basePrice || 4199;
  const taxPerPax = flight.taxPrice || 740;

  // Fare Tier
  const tierKey = state.selectedFareTier || 'saver';
  const tier = faresData[tierKey] || faresData.saver;
  const tierCost = (tier.priceOffset || 0) * passengerCount;

  const totalBaseFare = (baseFarePerPax * passengerCount) + tierCost;
  const totalTaxes = taxPerPax * passengerCount;

  // Seat charges
  let seatsCost = 0;
  if (state.selectedSeats && Array.isArray(state.selectedSeats)) {
    state.selectedSeats.forEach(seat => {
      const row = parseInt(seat, 10);
      if (row <= 3 || row === 12) {
        seatsCost += (tierKey === 'club') ? 0 : 800; // Extra Legroom
      } else if (row <= 11) {
        seatsCost += (tierKey === 'flexi' || tierKey === 'club') ? 0 : 400; // Preferred
      } else {
        seatsCost += (tierKey === 'flexi' || tierKey === 'club') ? 0 : 200; // Standard
      }
    });
  }

  // Baggage charges
  let baggageCost = 0;
  if (state.selectedBaggageId && addonsData.baggage) {
    const bagObj = addonsData.baggage.find(b => b.id === state.selectedBaggageId);
    if (bagObj) baggageCost = bagObj.price || 0;
  }

  // Meals charges
  let mealsCost = 0;
  if (state.selectedMeals && Array.isArray(state.selectedMeals)) {
    state.selectedMeals.forEach(m => {
      const mealItem = mealsData.find(x => x.id === m.id);
      if (mealItem) {
        mealsCost += (mealItem.price || 0) * (m.qty || 1);
      }
    });
  }

  // Ancillary services charges
  let servicesCost = 0;
  if (state.selectedServices && Array.isArray(state.selectedServices)) {
    state.selectedServices.forEach(srvId => {
      const srvObj = addonsData.services?.find(s => s.id === srvId);
      if (srvObj) {
        servicesCost += srvObj.price || 0;
      }
    });
  }

  const subtotal = totalBaseFare + totalTaxes + seatsCost + baggageCost + mealsCost + servicesCost;

  // Coupon discount
  let discount = 0;
  if (state.appliedCoupon) {
    if (state.appliedCoupon.type === 'flat') {
      discount = state.appliedCoupon.discount || 0;
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
