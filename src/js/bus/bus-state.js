/**
 * RouteLine - Bus Booking State Management & Data Layer (bus-state.js)
 * Manages the 5-screen bus booking flow:
 * Screen 1: Bus Search Results
 * Screen 2: Bus Seat Selection
 * Screen 3: Passenger Details & Extra Services
 * Screen 4: Review Booking & Payment
 * Screen 5: Booking Confirmation & E-Ticket
 */

export const STORAGE_KEY_BUS_SESSION = 'routeline_bus_session_v1';

export const BUS_OPERATORS = [
  {
    id: 'zingbus-superfast',
    name: 'Zingbus Electric Superfast',
    type: '2+1 Premium AC Sleeper (Single & Double Berths)',
    busCategory: 'AC Sleeper (2+1)',
    operatorCategory: 'Zingbus Plus',
    operatorRating: 4.8,
    ratingsCount: '1,840 ratings',
    verified: true,
    promoBadge: '22% OFF With Code PUNE2DELHI',
    liveGps: true,
    departureTime: '16:30',
    departureLocation: 'Swargate, Pune',
    departureStation: 'Near Laxmi Narayan Theatre, Gate No. 2 Bus Bay',
    duration: '23h 45m',
    stopsNote: '0 STOPS OVERALL',
    arrivalTime: '16:15',
    arrivalDay: '+1 Day',
    arrivalLocation: 'Kashmiri Gate, Delhi ISBT',
    arrivalStation: 'ISBT, Metro Gate No. 1 Inter-State Platform',
    originalPrice: 3199,
    basePrice: 2499,
    singleSeatPrice: 2400,
    seatsLeft: 14,
    seatsLeftText: 'Only 14 Seats left!',
    cancellationNote: 'Instant Free Cancellation',
    policiesLink: true,
    vehicleNo: 'DL 01 EQ 3842',
    dispatchPhone: '+91 80 4040 2200',
    amenities: ['Free Wi-Fi', 'Water Bottle', 'Blanket & Pillow', 'USB Type-C', 'Live Tracking'],
    pickupBay: 'Pickup Bay #4'
  },
  {
    id: 'intrcity-smartbus',
    name: 'IntrCity SmartBus Premium Lounge',
    type: 'Multi-Axle Volvo AC Sleeper 2+1 (Private Pods)',
    busCategory: 'Multi-Axle Volvo / Scania',
    operatorCategory: 'IntrCity SmartBus',
    operatorRating: 4.7,
    ratingsCount: '3,218 ratings',
    verified: true,
    promoBadge: 'FREE SNACK KIT & LOUNGE ACCESS',
    promoSubtitle: 'Punctuality Guarantee (100% On-time)',
    hepaFiltered: true,
    departureTime: '18:00',
    departureLocation: 'Wakad Flyover, Pune',
    departureStation: 'Behind Hinjawadi Flyover, Service Road',
    duration: '22h 30m',
    stopsNote: 'FASTEST OPTION',
    arrivalTime: '16:30',
    arrivalDay: '+1 Day',
    arrivalLocation: 'Anand Vihar, Delhi Terminal',
    arrivalStation: 'Near Indian Oil Pump, Anand Vihar ISBT',
    originalPrice: 3400,
    basePrice: 2850,
    singleSeatPrice: 2800,
    seatsLeft: 8,
    seatsLeftText: 'Only 8 Seats left!',
    cancellationNote: 'Zero Cancellation upto 6h',
    policiesLink: false,
    photosLink: true,
    vehicleNo: 'MH 12 QX 4920',
    dispatchPhone: '+91 80 4040 3311',
    amenities: ['Air Purifier', 'Packaged Water', 'High-Speed 5G', 'Smart Lounge Access'],
    pickupBay: 'Pickup Bay #2'
  },
  {
    id: 'vrl-travels',
    name: 'VRL Travels Executive AC Sleeper',
    type: 'I-Shift Multi-Axle Premium Comfort 2+1',
    busCategory: 'Multi-Axle Volvo / Scania',
    operatorCategory: 'VRL Travels',
    operatorRating: 4.6,
    ratingsCount: '840 ratings',
    verified: false,
    departureTime: '19:30',
    departureLocation: 'Hinjawadi Ph 1, Pune',
    departureStation: 'Hinjawadi Phase 1 Main Chowk',
    duration: '24h 00m',
    stopsNote: 'DIRECT ROUTE',
    arrivalTime: '19:30',
    arrivalDay: '+1 Day',
    arrivalLocation: 'Dhaula Kuan, Delhi Metro Hub',
    arrivalStation: 'Dhaula Kuan Metro Bus Stop',
    originalPrice: 2600,
    basePrice: 2199,
    singleSeatPrice: 2200,
    seatsLeft: 18,
    seatsLeftText: '18 Seats available',
    cancellationNote: 'Rest Stop: Dhaba with Hygienic Restrooms',
    policiesLink: false,
    detailsLink: true,
    vehicleNo: 'KA 25 FA 1102',
    dispatchPhone: '+91 80 4040 7700',
    amenities: ['Bottled Water', 'Clean Blankets', 'In-Seat Charging'],
    pickupBay: 'Pickup Bay #7'
  },
  {
    id: 'orange-tours',
    name: 'Orange Tours & Travels',
    type: 'Bharat Benz Air Suspension AC Sleeper (2+1)',
    busCategory: 'Bharat Benz AC',
    operatorCategory: 'Orange Tours',
    operatorRating: 4.5,
    ratingsCount: '620 ratings',
    verified: false,
    departureTime: '21:00',
    departureLocation: 'Nigdi Bridge, Pune',
    departureStation: 'Nishant Travels Office, Near Highway Overpass',
    duration: '23h 15m',
    stopsNote: 'LATE NIGHT DEP',
    arrivalTime: '20:15',
    arrivalDay: '+1 Day',
    arrivalLocation: 'Kashmiri Gate, Delhi ISBT',
    arrivalStation: 'ISBT Kashmiri Gate Metro Gate No. 1',
    originalPrice: 2800,
    basePrice: 2350,
    singleSeatPrice: 2300,
    seatsLeft: 5,
    seatsLeftText: 'Only 5 Seats left!',
    cancellationNote: 'Verified Punctual Driver',
    reviewsLink: true,
    vehicleNo: 'AP 09 TY 9812',
    dispatchPhone: '+91 80 4040 8822',
    amenities: ['Free Wi-Fi', 'Personal Reading Lamp', 'Emergency SOS'],
    pickupBay: 'Pickup Bay #1'
  }
];

export const BOARDING_POINTS = [
  {
    id: 'bp-swargate',
    time: '16:30',
    name: 'Swargate',
    city: 'Pune',
    landmark: 'Near Laxmi Narayan Theatre, Gate 2',
    bay: 'Pickup Bay #4'
  },
  {
    id: 'bp-wakad',
    time: '17:15',
    name: 'Wakad Bridge',
    city: 'Pune',
    landmark: 'Behind Hinjawadi Flyover, Service Road',
    bay: 'Pickup Bay #1'
  },
  {
    id: 'bp-nigdi',
    time: '17:45',
    name: 'Nigdi',
    city: 'Pune',
    landmark: 'Nishant Travels Office, Near Highway Overpass',
    bay: 'Pickup Bay #3'
  }
];

export const DROPPING_POINTS = [
  {
    id: 'dp-kashmiri',
    time: '16:15 (+1 Day)',
    name: 'Kashmiri Gate',
    city: 'Delhi',
    landmark: 'ISBT Kashmiri Gate Metro Gate No. 1 Inter-State Platform'
  },
  {
    id: 'dp-majnu',
    time: '16:45 (+1 Day)',
    name: 'Majnu Ka Tilla',
    city: 'Delhi',
    landmark: 'HP Petrol Pump, Ring Road'
  },
  {
    id: 'dp-anand',
    time: '17:15 (+1 Day)',
    name: 'Anand Vihar',
    city: 'Delhi',
    landmark: 'Near Indian Oil Pump, Anand Vihar ISBT'
  }
];

export const SEAT_BERTHS_DATA = {
  lower: {
    singleWindow: [
      { id: 'L1', label: 'L1', price: 2400, type: 'single', deck: 'Lower', side: 'Window', status: 'available' },
      { id: 'L4', label: 'L4', price: 2400, type: 'single', deck: 'Lower', side: 'Window', status: 'selected' },
      { id: 'L7', label: 'L7', price: 2400, type: 'single', deck: 'Lower', side: 'Window', status: 'selected' },
      { id: 'L10', label: 'L10', price: 2400, type: 'single', deck: 'Lower', side: 'Window', status: 'booked' },
      { id: 'L13', label: 'L13', price: 2400, type: 'single', deck: 'Lower', side: 'Window', status: 'female' },
      { id: 'L16', label: 'L16', price: 2400, type: 'single', deck: 'Lower', side: 'Window', status: 'available' }
    ],
    doubleBerths: [
      { id: 'L2', label: 'L2', price: 2400, type: 'double', deck: 'Lower', side: 'Double', status: 'available' },
      { id: 'L3', label: 'L3', price: 2400, type: 'double', deck: 'Lower', side: 'Double', status: 'available' },
      { id: 'L5', label: 'L5', price: 2400, type: 'double', deck: 'Lower', side: 'Double', status: 'booked' },
      { id: 'L6', label: 'L6', price: 2400, type: 'double', deck: 'Lower', side: 'Double', status: 'booked' },
      { id: 'L8', label: 'L8', price: 2400, type: 'double', deck: 'Lower', side: 'Double', status: 'available' },
      { id: 'L9', label: 'L9', price: 2400, type: 'double', deck: 'Lower', side: 'Double', status: 'available' },
      { id: 'L11', label: 'L11', price: 2400, type: 'double', deck: 'Lower', side: 'Double', status: 'available' },
      { id: 'L12', label: 'L12', price: 2400, type: 'double', deck: 'Lower', side: 'Double', status: 'available' },
      { id: 'L14', label: 'L14', price: 2400, type: 'double', deck: 'Lower', side: 'Double', status: 'available' },
      { id: 'L15', label: 'L15', price: 2400, type: 'double', deck: 'Lower', side: 'Double', status: 'booked' }
    ]
  },
  upper: {
    singleWindow: [
      { id: 'U1', label: 'U1', price: 2400, type: 'single', deck: 'Upper', side: 'Window', status: 'available' },
      { id: 'U4', label: 'U4', price: 2400, type: 'single', deck: 'Upper', side: 'Window', status: 'available' },
      { id: 'U7', label: 'U7', price: 2400, type: 'single', deck: 'Upper', side: 'Window', status: 'booked' },
      { id: 'U10', label: 'U10', price: 2400, type: 'single', deck: 'Upper', side: 'Window', status: 'available' },
      { id: 'U13', label: 'U13', price: 2400, type: 'single', deck: 'Upper', side: 'Window', status: 'female' },
      { id: 'U16', label: 'U16', price: 2400, type: 'single', deck: 'Upper', side: 'Window', status: 'available' }
    ],
    doubleBerths: [
      { id: 'U2', label: 'U2', price: 2400, type: 'double', deck: 'Upper', side: 'Double', status: 'available' },
      { id: 'U3', label: 'U3', price: 2400, type: 'double', deck: 'Upper', side: 'Double', status: 'available' },
      { id: 'U5', label: 'U5', price: 2400, type: 'double', deck: 'Upper', side: 'Double', status: 'available' },
      { id: 'U6', label: 'U6', price: 2400, type: 'double', deck: 'Upper', side: 'Double', status: 'available' },
      { id: 'U8', label: 'U8', price: 2400, type: 'double', deck: 'Upper', side: 'Double', status: 'booked' },
      { id: 'U9', label: 'U9', price: 2400, type: 'double', deck: 'Upper', side: 'Double', status: 'booked' },
      { id: 'U11', label: 'U11', price: 2400, type: 'double', deck: 'Upper', side: 'Double', status: 'available' },
      { id: 'U12', label: 'U12', price: 2400, type: 'double', deck: 'Upper', side: 'Double', status: 'available' },
      { id: 'U14', label: 'U14', price: 2400, type: 'double', deck: 'Upper', side: 'Double', status: 'available' },
      { id: 'U15', label: 'U15', price: 2400, type: 'double', deck: 'Upper', side: 'Double', status: 'available' }
    ]
  }
};

export function getDefaultBusState() {
  const defaultBus = BUS_OPERATORS[0];
  const defaultBoarding = BOARDING_POINTS[0];
  const defaultDropping = DROPPING_POINTS[0];

  return {
    search: {
      origin: 'Pune',
      destination: 'Delhi',
      travelDate: 'Sun, 15 Nov 2026',
      travelDateRaw: '2026-11-15',
      returnDate: '',
      passengersCount: 2
    },
    selectedBusId: defaultBus.id,
    selectedBus: defaultBus,
    activeDeck: 'lower',
    selectedSeats: ['L4', 'L7'],
    selectedSeatsData: [
      { id: 'L4', label: 'L4', deck: 'Lower', type: 'Single', side: 'Window', price: 2400 },
      { id: 'L7', label: 'L7', deck: 'Lower', type: 'Single', side: 'Window', price: 2400 }
    ],
    boardingPoint: defaultBoarding,
    droppingPoint: defaultDropping,
    contactInfo: {
      email: 'rahul.verma@example.com',
      mobile: '9820154321',
      whatsappUpdates: true
    },
    passengers: [
      {
        id: 1,
        seatId: 'L4',
        name: 'Rahul Verma',
        age: '28',
        gender: 'Male',
        type: 'Primary Passenger',
        berthLabel: 'Berth L4 (Lower Deck)'
      },
      {
        id: 2,
        seatId: 'L7',
        name: 'Priya Sharma',
        age: '26',
        gender: 'Female',
        type: 'Co-Traveler',
        berthLabel: 'Berth L7 (Lower Deck)'
      }
    ],
    savePassengerDetails: true,
    services: {
      extra10kg: false, // ₹250
      extra20kg: false, // ₹450
      vegThali: 1,      // ₹220
      chaiCombo: 0,     // ₹110
      mineralWater: 1,  // ₹45
      travelShield: true, // ₹29 per person = ₹58 for 2
      cancellationPass: true // ₹99
    },
    pricing: {
      baseFare: 4998,
      taxesAndToll: 250,
      travelShield: 58,
      refreshments: 265,
      luggage: 0,
      cancellationPass: 99,
      grossTotal: 5670,
      couponCode: 'ROUTE200',
      couponDiscount: 200,
      totalPayable: 5470
    },
    payment: {
      method: 'upi',
      vpa: 'rahulverma@okhdfcbank',
      termsAgreed: true,
      seatsHeldRemaining: 309 // 5m 09s
    },
    bookingConfirmation: {
      bookingId: 'RL-BUS-8492041',
      pnr: 'ZNGB-PN-739192',
      status: 'CONFIRMED',
      bookingDate: '02 Nov 2026, 18:24 IST',
      verificationPin: '8692',
      txnRef: 'UPI-BH1281948228'
    }
  };
}

export function getBusState() {
  if (typeof window === 'undefined') return getDefaultBusState();
  try {
    const raw = localStorage.getItem(STORAGE_KEY_BUS_SESSION);
    if (!raw) {
      const def = getDefaultBusState();
      saveBusState(def);
      return def;
    }
    const parsed = JSON.parse(raw);
    return { ...getDefaultBusState(), ...parsed };
  } catch (e) {
    console.error('[BusState] Failed to parse state:', e);
    return getDefaultBusState();
  }
}

export function saveBusState(state) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY_BUS_SESSION, JSON.stringify(state));
  } catch (e) {
    console.error('[BusState] Failed to save state:', e);
  }
}

export function updateBusState(partial) {
  const current = getBusState();
  const updated = { ...current, ...partial };
  
  // Recalculate pricing if relevant fields changed
  if (partial.selectedSeats || partial.services || partial.selectedBus || partial.pricing) {
    updated.pricing = recalculatePricing(updated);
  }
  
  saveBusState(updated);
  return updated;
}

export function recalculatePricing(state) {
  const bus = state.selectedBus || BUS_OPERATORS[0];
  const seatCount = (state.selectedSeats && state.selectedSeats.length > 0) ? state.selectedSeats.length : 1;
  const basePricePerSeat = bus.basePrice || 2499;
  const baseFare = basePricePerSeat * seatCount;
  const taxesAndToll = 250; // Standard 5% GST & Toll representation

  // Add-ons
  const services = state.services || {};
  const travelShield = services.travelShield ? (29 * seatCount) : 0;
  const refreshments = ((services.vegThali || 0) * 220) + 
                        ((services.chaiCombo || 0) * 110) + 
                        ((services.mineralWater || 0) * 45);
  const luggage = (services.extra10kg ? 250 : 0) + (services.extra20kg ? 450 : 0);
  const cancellationPass = services.cancellationPass ? 99 : 0;

  const grossTotal = baseFare + taxesAndToll + travelShield + refreshments + luggage + cancellationPass;
  
  let couponDiscount = 0;
  if (state.pricing?.couponCode === 'ROUTE200' || !state.pricing?.couponCode) {
    couponDiscount = 200;
  } else if (state.pricing?.couponCode === 'PUNE2DELHI') {
    couponDiscount = Math.round(baseFare * 0.22);
  }

  const totalPayable = Math.max(0, grossTotal - couponDiscount);

  return {
    baseFare,
    taxesAndToll,
    travelShield,
    refreshments,
    luggage,
    cancellationPass,
    grossTotal,
    couponCode: state.pricing?.couponCode || 'ROUTE200',
    couponDiscount,
    totalPayable
  };
}

export function getBusById(id) {
  return BUS_OPERATORS.find(b => b.id === id) || BUS_OPERATORS[0];
}

