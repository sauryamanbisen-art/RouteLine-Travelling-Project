/**
 * RouteLine - RailRadar API Client (railradar.js)
 * Live Indian Railway API integration using Bearer Token authentication.
 * Base URL: https://api.railradar.in/v1
 * Rate Limit: ~10 requests per minute (includes in-memory TTL caching to avoid throttling)
 */

export const RAILRADAR_CONFIG = {
  apiKey: (typeof localStorage !== 'undefined' && localStorage.getItem('railradar_api_key')) || 'rg_9e9b195b2c684ead8ca4f8777031a33a',
  baseUrl: 'https://api.railradar.in/v1'
};

// 45-second in-memory response cache to prevent rate limit exhaustion
const cache = new Map();
const CACHE_TTL_MS = 45 * 1000;

function getCached(key) {
  const item = cache.get(key);
  if (!item) return null;
  if (Date.now() - item.time > CACHE_TTL_MS) {
    cache.delete(key);
    return null;
  }
  return item.data;
}

function setCached(key, data) {
  // Only cache successful API responses
  if (data && data.success) {
    cache.set(key, { time: Date.now(), data });
  }
}

/**
 * Updates the RailRadar bearer token in memory and persists to localStorage
 * @param {string} newKey
 */
export function setRailRadarApiKey(newKey) {
  if (!newKey || typeof newKey !== 'string') return;
  const cleanKey = newKey.trim();
  RAILRADAR_CONFIG.apiKey = cleanKey;
  cache.clear(); // Invalidate cache on key change
  if (typeof localStorage !== 'undefined') {
    localStorage.setItem('railradar_api_key', cleanKey);
  }
  console.log('[RailRadar] API Key updated successfully.');
}

/**
 * Returns authorization headers for RailRadar API requests
 */
export function getRailRadarHeaders() {
  return {
    'Authorization': `Bearer ${RAILRADAR_CONFIG.apiKey}`,
    'Accept': 'application/json'
  };
}

/**
 * 1. Train Schedule & Timetable
 * Fetches timetable, halt stations, arrival/departure times, platforms, and lat/lng.
 * @param {string} trainNo - e.g. "12919"
 * @returns {Promise<Object>}
 */
export async function getTrainSchedule(trainNo = "12919") {
  if (!trainNo) {
    return { success: false, error: 'Train number is required' };
  }
  const cleanNo = String(trainNo).trim();
  const cacheKey = `sched_${cleanNo}`;
  const cached = getCached(cacheKey);
  if (cached) return cached;

  const url = `${RAILRADAR_CONFIG.baseUrl}/trains/${encodeURIComponent(cleanNo)}?haltsOnly=true`;

  try {
    const res = await fetch(url, { headers: getRailRadarHeaders() });
    const data = await res.json();

    if (!res.ok || data.success === false) {
      const errorMsg = data.error?.message || data.message || `Failed to fetch schedule for train ${cleanNo} (HTTP ${res.status})`;
      return { 
        success: false, 
        error: errorMsg, 
        code: data.error?.code || res.status,
        raw: data 
      };
    }

    const result = { 
      success: true, 
      data: data.data, 
      meta: data.meta 
    };
    setCached(cacheKey, result);
    return result;
  } catch (err) {
    console.error(`[RailRadar] getTrainSchedule(${cleanNo}) error:`, err.message || err);
    return { 
      success: false, 
      error: err.message || 'Network error fetching train schedule' 
    };
  }
}

/**
 * 2. Live Train Running Status
 * Real-time GPS train location, delay in minutes, speed, and upcoming halts.
 * @param {string} trainNo - e.g. "12919"
 * @returns {Promise<Object>}
 */
export async function getLiveStatus(trainNo = "12919") {
  if (!trainNo) {
    return { success: false, error: 'Train number is required' };
  }
  const cleanNo = String(trainNo).trim();
  const cacheKey = `live_${cleanNo}`;
  const cached = getCached(cacheKey);
  if (cached) return cached;

  const url = `${RAILRADAR_CONFIG.baseUrl}/trains/${encodeURIComponent(cleanNo)}/live`;

  try {
    const res = await fetch(url, { headers: getRailRadarHeaders() });
    const data = await res.json();

    if (!res.ok || data.success === false) {
      const errorMsg = data.error?.message || data.message || `Failed to fetch live status for train ${cleanNo} (HTTP ${res.status})`;
      return { 
        success: false, 
        error: errorMsg, 
        code: data.error?.code || res.status,
        raw: data 
      };
    }

    const result = { 
      success: true, 
      data: data.data, 
      meta: data.meta 
    };
    setCached(cacheKey, result);
    return result;
  } catch (err) {
    console.error(`[RailRadar] getLiveStatus(${cleanNo}) error:`, err.message || err);
    return { 
      success: false, 
      error: err.message || 'Network error fetching live status' 
    };
  }
}

/**
 * 3. Train Route Geometry (GIS / GeoJSON)
 * Returns the GIS route geometry for map visualization and stop coordinates.
 * @param {string} trainNo - e.g. "12919"
 * @returns {Promise<Object>}
 */
export async function getRouteGeometry(trainNo = "12919") {
  if (!trainNo) {
    return { success: false, error: 'Train number is required' };
  }
  const cleanNo = String(trainNo).trim();
  const cacheKey = `geom_${cleanNo}`;
  const cached = getCached(cacheKey);
  if (cached) return cached;

  const url = `${RAILRADAR_CONFIG.baseUrl}/trains/${encodeURIComponent(cleanNo)}/route?format=geojson&stops=true`;

  try {
    const res = await fetch(url, { headers: getRailRadarHeaders() });
    const data = await res.json();

    if (!res.ok || data.success === false) {
      const errorMsg = data.error?.message || data.message || `Failed to fetch route geometry for train ${cleanNo} (HTTP ${res.status})`;
      return { 
        success: false, 
        error: errorMsg, 
        code: data.error?.code || res.status,
        raw: data 
      };
    }

    const result = { 
      success: true, 
      data: data.data, 
      meta: data.meta 
    };
    setCached(cacheKey, result);
    return result;
  } catch (err) {
    console.error(`[RailRadar] getRouteGeometry(${cleanNo}) error:`, err.message || err);
    return { 
      success: false, 
      error: err.message || 'Network error fetching route geometry' 
    };
  }
}

/**
 * 4. Train Coach Position & Layout
 * Complete rake configuration, coach ordering (e.g. Engine, A1, B1, S1), and variations.
 * @param {string} trainNo - e.g. "12952"
 * @returns {Promise<Object>}
 */
export async function getCoachPosition(trainNo = "12952") {
  if (!trainNo) {
    return { success: false, error: 'Train number is required' };
  }
  const cleanNo = String(trainNo).trim();
  const cacheKey = `coach_${cleanNo}`;
  const cached = getCached(cacheKey);
  if (cached) return cached;

  const url = `${RAILRADAR_CONFIG.baseUrl}/trains/${encodeURIComponent(cleanNo)}/coaches`;

  try {
    const res = await fetch(url, { headers: getRailRadarHeaders() });
    const data = await res.json();

    if (!res.ok || data.success === false) {
      const errorMsg = data.error?.message || data.message || `Failed to fetch coach layout for train ${cleanNo} (HTTP ${res.status})`;
      return { 
        success: false, 
        error: errorMsg, 
        code: data.error?.code || res.status,
        raw: data 
      };
    }

    const result = { 
      success: true, 
      data: data.data, 
      meta: data.meta 
    };
    setCached(cacheKey, result);
    return result;
  } catch (err) {
    console.error(`[RailRadar] getCoachPosition(${cleanNo}) error:`, err.message || err);
    return { 
      success: false, 
      error: err.message || 'Network error fetching coach layout' 
    };
  }
}

/**
 * 5. Platform Coach Position at specific Station
 * Orientation and platform alignment for the train at an intermediate station.
 * @param {string} trainNo - e.g. "12952"
 * @param {string} station - e.g. "BRC"
 * @returns {Promise<Object>}
 */
export async function getStationCoachPosition(trainNo = "12952", station = "BRC") {
  if (!trainNo || !station) {
    return { success: false, error: 'Train number and station code are required' };
  }
  const cleanNo = String(trainNo).trim();
  const cleanStation = String(station).trim().toUpperCase();
  const cacheKey = `stncoach_${cleanNo}_${cleanStation}`;
  const cached = getCached(cacheKey);
  if (cached) return cached;

  const url = `${RAILRADAR_CONFIG.baseUrl}/trains/${encodeURIComponent(cleanNo)}/coaches/${encodeURIComponent(cleanStation)}`;

  try {
    const res = await fetch(url, { headers: getRailRadarHeaders() });
    const data = await res.json();

    if (!res.ok || data.success === false) {
      const errorMsg = data.error?.message || data.message || `Failed to fetch coach position for train ${cleanNo} at ${cleanStation} (HTTP ${res.status})`;
      return { 
        success: false, 
        error: errorMsg, 
        code: data.error?.code || res.status,
        raw: data 
      };
    }

    const result = { 
      success: true, 
      data: data.data, 
      meta: data.meta 
    };
    setCached(cacheKey, result);
    return result;
  } catch (err) {
    console.error(`[RailRadar] getStationCoachPosition(${cleanNo}, ${cleanStation}) error:`, err.message || err);
    return { 
      success: false, 
      error: err.message || 'Network error fetching platform coach position' 
    };
  }
}

/**
 * 6. Train Seat Availability
 * Real-time reservation status across classes and quotas within the Advance Reservation Period.
 * @param {Object} params
 * @param {string} params.trainNo - e.g. "12952"
 * @param {string} params.date - YYYY-MM-DD
 * @param {string} params.src - Source code, e.g. "NDLS"
 * @param {string} params.dst - Destination code, e.g. "MMCT"
 * @param {string} params.cls - Class code, e.g. "3A", "2A", "SL", "1A"
 * @param {string} params.quota - Quota code, e.g. "GN", "TQ", "LD"
 * @returns {Promise<Object>}
 */
export async function getSeatAvailability(params = {}) {
  const trainNo = params.trainNo || "12952";
  const date = params.date || new Date().toISOString().split('T')[0];
  const src = (params.src || "NDLS").toUpperCase();
  const dst = (params.dst || "MMCT").toUpperCase();
  const cls = (params.cls || "3A").toUpperCase();
  const quota = (params.quota || "GN").toUpperCase();

  const cacheKey = `seats_${trainNo}_${date}_${src}_${dst}_${cls}_${quota}`;
  const cached = getCached(cacheKey);
  if (cached) return cached;

  const url = `${RAILRADAR_CONFIG.baseUrl}/trains/${encodeURIComponent(trainNo)}/seats?journeyDate=${encodeURIComponent(date)}&source=${encodeURIComponent(src)}&destination=${encodeURIComponent(dst)}&classCode=${encodeURIComponent(cls)}&quotaCode=${encodeURIComponent(quota)}`;

  try {
    const res = await fetch(url, { headers: getRailRadarHeaders() });
    const data = await res.json();

    if (!res.ok || data.success === false) {
      const errorMsg = data.error?.message || data.message || `Failed to fetch seat availability for train ${trainNo} (HTTP ${res.status})`;
      return { 
        success: false, 
        error: errorMsg, 
        code: data.error?.code || res.status,
        raw: data 
      };
    }

    const result = { 
      success: true, 
      data: data.data, 
      meta: data.meta 
    };
    setCached(cacheKey, result);
    return result;
  } catch (err) {
    console.error(`[RailRadar] getSeatAvailability(${trainNo}) error:`, err.message || err);
    return { 
      success: false, 
      error: err.message || 'Network error fetching seat availability' 
    };
  }
}

/**
 * 7. Train Ticket Fare Breakdown
 * Official fare breakdown (Base Fare, Superfast Charge, Reservation, GST, Dynamic Fare).
 * @param {Object} params
 * @param {string} params.trainNo - e.g. "12952"
 * @param {string} params.date - YYYY-MM-DD
 * @param {string} params.src - Source code, e.g. "NDLS"
 * @param {string} params.dst - Destination code, e.g. "MMCT"
 * @param {string} params.cls - Class code, e.g. "3A", "2A", "SL", "1A"
 * @param {string} params.quota - Quota code, e.g. "GN"
 * @returns {Promise<Object>}
 */
export async function getTicketFare(params = {}) {
  const trainNo = params.trainNo || "12952";
  const date = params.date || new Date().toISOString().split('T')[0];
  const src = (params.src || "NDLS").toUpperCase();
  const dst = (params.dst || "MMCT").toUpperCase();
  const cls = (params.cls || "3A").toUpperCase();
  const quota = (params.quota || "GN").toUpperCase();

  const cacheKey = `fare_${trainNo}_${date}_${src}_${dst}_${cls}_${quota}`;
  const cached = getCached(cacheKey);
  if (cached) return cached;

  const url = `${RAILRADAR_CONFIG.baseUrl}/trains/${encodeURIComponent(trainNo)}/fare?journeyDate=${encodeURIComponent(date)}&source=${encodeURIComponent(src)}&destination=${encodeURIComponent(dst)}&classCode=${encodeURIComponent(cls)}&quotaCode=${encodeURIComponent(quota)}`;

  try {
    const res = await fetch(url, { headers: getRailRadarHeaders() });
    const data = await res.json();

    if (!res.ok || data.success === false) {
      const errorMsg = data.error?.message || data.message || `Failed to fetch ticket fare for train ${trainNo} (HTTP ${res.status})`;
      return { 
        success: false, 
        error: errorMsg, 
        code: data.error?.code || res.status,
        raw: data 
      };
    }

    const result = { 
      success: true, 
      data: data.data, 
      meta: data.meta 
    };
    setCached(cacheKey, result);
    return result;
  } catch (err) {
    console.error(`[RailRadar] getTicketFare(${trainNo}) error:`, err.message || err);
    return { 
      success: false, 
      error: err.message || 'Network error fetching ticket fare' 
    };
  }
}

/**
 * 8. Trains Between Stations
 * Fetches all trains running between two stations on an optional journey date.
 * @param {string} src - Source station code (e.g. "UJN")
 * @param {string} dst - Destination station code (e.g. "INDB")
 * @param {string} [date] - Optional date (YYYY-MM-DD)
 * @returns {Promise<Object>}
 */
export async function getTrainsBetween(src = "UJN", dst = "INDB", date = "") {
  if (!src || !dst) {
    return { success: false, error: 'Source and destination station codes are required', trains: [] };
  }
  const cleanSrc = String(src).trim().toUpperCase();
  const cleanDst = String(dst).trim().toUpperCase();
  const cleanDate = date ? String(date).trim() : '';
  const cacheKey = `between_${cleanSrc}_${cleanDst}_${cleanDate}`;
  const cached = getCached(cacheKey);
  if (cached) return cached;

  let url = `${RAILRADAR_CONFIG.baseUrl}/trains/between/${encodeURIComponent(cleanSrc)}/${encodeURIComponent(cleanDst)}`;
  if (cleanDate.length > 0) {
    url += `?date=${encodeURIComponent(cleanDate)}`;
  }

  try {
    const res = await fetch(url, { headers: getRailRadarHeaders() });
    const data = await res.json();

    if (!res.ok || data.success === false) {
      const errorMsg = data.error?.message || data.message || `Failed to fetch trains between ${cleanSrc} and ${cleanDst} (HTTP ${res.status})`;
      return { 
        success: false, 
        error: errorMsg, 
        code: data.error?.code || res.status,
        trains: [],
        raw: data 
      };
    }

    const trainsList = data.data?.trains || [];
    const result = { 
      success: true, 
      data: data.data, 
      trains: trainsList,
      count: data.data?.count !== undefined ? data.data.count : trainsList.length,
      from: data.data?.from,
      to: data.data?.to,
      meta: data.meta 
    };
    setCached(cacheKey, result);
    return result;
  } catch (err) {
    console.error(`[RailRadar] getTrainsBetween(${cleanSrc}, ${cleanDst}) error:`, err.message || err);
    return { 
      success: false, 
      error: err.message || 'Network error fetching trains between stations',
      trains: [] 
    };
  }
}

/**
 * 9. PNR Current Status
 * Real-time booking status, passenger berth/coach allocations, and chart status.
 * GET https://api.railradar.in/v1/pnr/{pnr}
 * @param {string} pnr - 10-digit PNR number
 * @returns {Promise<Object>}
 */
export async function getPNRStatus(pnr) {
  if (!pnr) {
    return { success: false, error: '10-digit PNR number is required' };
  }
  const cleanPnr = String(pnr).trim().replace(/\D/g, '');
  if (cleanPnr.length !== 10) {
    return { success: false, error: 'Please enter a valid 10-digit PNR number' };
  }

  const cacheKey = `pnr_${cleanPnr}`;
  const cached = getCached(cacheKey);
  if (cached) return cached;

  const url = `${RAILRADAR_CONFIG.baseUrl}/pnr/${encodeURIComponent(cleanPnr)}`;

  try {
    const res = await fetch(url, { 
      headers: {
        'Authorization': `Bearer ${RAILRADAR_CONFIG.apiKey}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      signal: AbortSignal.timeout(8000)
    });
    const data = await res.json();

    if (!res.ok || data.success === false) {
      const errorMsg = data.error?.message || data.message || `Status Error: ${res.status}`;
      return {
        success: false,
        error: errorMsg,
        code: data.error?.code || `HTTP_${res.status}`,
        pnr: cleanPnr,
        raw: data
      };
    }

    const result = {
      success: true,
      data: data.data,
      meta: data.meta,
      pnr: cleanPnr
    };
    setCached(cacheKey, result);
    return result;
  } catch (err) {
    console.error(`[RailRadar] Failed to fetch PNR status for ${cleanPnr}:`, err);
    return {
      success: false,
      error: err.name === 'TimeoutError' ? 'PRS enquiry timed out. Please try again.' : (err.message || 'Failed to fetch PNR status'),
      pnr: cleanPnr
    };
  }
}

/**
 * 10. PNR Confirmation Prediction
 * Probability percentage and historical WL/RAC/CNF confirmation trend analysis.
 * GET https://api.railradar.in/v1/pnr/{pnr}/prediction
 * @param {string} pnr - 10-digit PNR number
 * @returns {Promise<Object>}
 */
export async function getPNRPrediction(pnr) {
  if (!pnr) {
    return { success: false, error: '10-digit PNR number is required' };
  }
  const cleanPnr = String(pnr).trim().replace(/\D/g, '');
  const cacheKey = `pnr_pred_${cleanPnr}`;
  const cached = getCached(cacheKey);
  if (cached) return cached;

  const url = `${RAILRADAR_CONFIG.baseUrl}/pnr/${encodeURIComponent(cleanPnr)}/prediction`;

  try {
    const res = await fetch(url, { 
      headers: {
        'Authorization': `Bearer ${RAILRADAR_CONFIG.apiKey}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      signal: AbortSignal.timeout(8000)
    });
    const data = await res.json();

    if (!res.ok || data.success === false) {
      const errorMsg = data.error?.message || data.message || `Prediction Error: ${res.status}`;
      return {
        success: false,
        error: errorMsg,
        code: data.error?.code || `HTTP_${res.status}`,
        pnr: cleanPnr,
        raw: data
      };
    }

    const result = {
      success: true,
      data: data.data,
      probability: data.data?.probability,
      header: data.data?.header,
      trends: data.data?.trends || [],
      meta: data.meta,
      pnr: cleanPnr
    };
    setCached(cacheKey, result);
    return result;
  } catch (err) {
    console.error(`[RailRadar] Failed to fetch PNR prediction for ${cleanPnr}:`, err);
    return {
      success: false,
      error: err.name === 'TimeoutError' ? 'Prediction enquiry timed out.' : (err.message || 'Failed to fetch confirmation prediction'),
      pnr: cleanPnr
    };
  }
}

/**
 * 11. PNR Cancellation Refund Details
 * Expected refund calculation, clerkage deductions, and refund credit status.
 * GET https://api.railradar.in/v1/pnr/{pnr}/refund
 * @param {string} pnr - 10-digit PNR number
 * @returns {Promise<Object>}
 */
export async function getPNRRefund(pnr) {
  if (!pnr) {
    return { success: false, error: '10-digit PNR number is required' };
  }
  const cleanPnr = String(pnr).trim().replace(/\D/g, '');
  const cacheKey = `pnr_refund_${cleanPnr}`;
  const cached = getCached(cacheKey);
  if (cached) return cached;

  const url = `${RAILRADAR_CONFIG.baseUrl}/pnr/${encodeURIComponent(cleanPnr)}/refund`;

  try {
    const res = await fetch(url, { 
      headers: {
        'Authorization': `Bearer ${RAILRADAR_CONFIG.apiKey}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      signal: AbortSignal.timeout(7000)
    });
    const data = await res.json();

    if (!res.ok || data.success === false) {
      const errorMsg = data.error?.message || data.message || `Refund Error: ${res.status}`;
      return {
        success: false,
        error: errorMsg,
        code: data.error?.code || `HTTP_${res.status}`,
        pnr: cleanPnr,
        raw: data
      };
    }

    const result = {
      success: true,
      data: data.data,
      refundAmount: data.data?.refundAmount,
      clerkageCharge: data.data?.clerkageCharge,
      cancellationStatus: data.data?.cancellationStatus,
      meta: data.meta,
      pnr: cleanPnr
    };
    setCached(cacheKey, result);
    return result;
  } catch (err) {
    console.error(`[RailRadar] Failed to fetch refund details for ${cleanPnr}:`, err);
    return {
      success: false,
      error: err.name === 'TimeoutError' ? 'Refund enquiry timed out.' : (err.message || 'Failed to fetch refund details'),
      pnr: cleanPnr
    };
  }
}

// Bundle of all RailRadar methods
export const RailRadar = {
  CONFIG: RAILRADAR_CONFIG,
  setApiKey: setRailRadarApiKey,
  getHeaders: getRailRadarHeaders,
  getTrainSchedule,
  getLiveStatus,
  getRouteGeometry,
  getCoachPosition,
  getStationCoachPosition,
  getSeatAvailability,
  getTicketFare,
  getTrainsBetween,
  getPNRStatus,
  getPNRPrediction,
  getPNRRefund
};

// Mount onto global window object for immediate browser console testing & external scripting
if (typeof window !== 'undefined') {
  window.RailRadar = RailRadar;
  window.getTrainSchedule = getTrainSchedule;
  window.getLiveStatus = getLiveStatus;
  window.getRouteGeometry = getRouteGeometry;
  window.getCoachPosition = getCoachPosition;
  window.getStationCoachPosition = getStationCoachPosition;
  window.getSeatAvailability = getSeatAvailability;
  window.getTicketFare = getTicketFare;
  window.getTrainsBetween = getTrainsBetween;
  window.getPNRStatus = getPNRStatus;
  window.getPNRPrediction = getPNRPrediction;
  window.getPNRRefund = getPNRRefund;
  window.setRailRadarApiKey = setRailRadarApiKey;
}

