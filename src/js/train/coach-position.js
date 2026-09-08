/**
 * RouteLine - Train Coach Position & SVG Composition Renderer (coach-position.js)
 */

/**
 * Generate RailRadar-authentic Illustrated Train Coach SVG
 * @param {string} code - e.g. "ENG", "SLRD", "S12", "GEN", "B1", "A1", "H1", "PC"
 * @returns {string} SVG HTML string
 */
export function getCoachSvg(code) {
  const upper = (code || '').toUpperCase().trim();
  const isEngine = upper.includes('ENG') || upper.includes('LOCO') || upper.includes('WAP') || upper.includes('WDP');

  if (isEngine) {
    // Authentic RailRadar Vande Bharat / WAP Aerodynamic Locomotive on Track
    return `
      <svg class="rr-coach-svg" viewBox="0 0 110 56" xmlns="http://www.w3.org/2000/svg">
        <!-- Rail Track Line -->
        <line x1="2" y1="48" x2="108" y2="48" stroke="#94a3b8" stroke-width="1.5" />
        <!-- Ballast / Sleepers -->
        <line x1="6" y1="51" x2="104" y2="51" stroke="#cbd5e1" stroke-dasharray="2,3" stroke-width="3" stroke-linecap="butt" />
        
        <!-- Aerodynamic Nose & Cabin Body (White) -->
        <path d="M 8 38 C 9 24, 16 12, 32 9 L 104 9 L 104 38 Z" fill="#ffffff" stroke="#cbd5e1" stroke-width="0.75" />
        
        <!-- Top Orange Liveried Stripe -->
        <path d="M 28 9 L 104 9 L 104 15 L 23 15 Z" fill="#f97316" />
        
        <!-- Dark Blue / Charcoal Flank Wedge Accent -->
        <polygon points="46,15 64,15 54,38 36,38" fill="#1e293b" />
        <polygon points="68,15 104,15 104,38 58,38" fill="#334155" />
        
        <!-- Slanted Cockpit Windshield -->
        <path d="M 12 28 C 14 19, 20 17, 28 17 L 32 17 L 30 28 Z" fill="#bae6fd" stroke="#0284c7" stroke-width="0.5" />
        
        <!-- Crew Cab Door -->
        <rect x="36" y="17" width="8" height="19" rx="1" fill="#ffffff" stroke="#cbd5e1" stroke-width="0.5" />
        <rect x="38" y="19" width="4" height="6" rx="0.5" fill="#bae6fd" />
        
        <!-- Front Buffer / Pilot Cowcatcher -->
        <path d="M 5 42 L 14 42 L 14 38 L 9 38 Z" fill="#94a3b8" />
        
        <!-- Underbody Chassis -->
        <rect x="12" y="38" width="90" height="3" fill="#0f172a" />
        
        <!-- Bogie 1 (Left 2 Wheels) -->
        <circle cx="24" cy="43.5" r="4.5" fill="#1e293b" stroke="#0f172a" stroke-width="0.75" />
        <circle cx="24" cy="43.5" r="1.5" fill="#cbd5e1" />
        <circle cx="38" cy="43.5" r="4.5" fill="#1e293b" stroke="#0f172a" stroke-width="0.75" />
        <circle cx="38" cy="43.5" r="1.5" fill="#cbd5e1" />
        
        <!-- Bogie 2 (Right 2 Wheels) -->
        <circle cx="72" cy="43.5" r="4.5" fill="#1e293b" stroke="#0f172a" stroke-width="0.75" />
        <circle cx="72" cy="43.5" r="1.5" fill="#cbd5e1" />
        <circle cx="86" cy="43.5" r="4.5" fill="#1e293b" stroke="#0f172a" stroke-width="0.75" />
        <circle cx="86" cy="43.5" r="1.5" fill="#cbd5e1" />
      </svg>
    `;
  }

  // Determine Coach Colors based on Indian Railways / RailRadar classes
  let bodyColor = "#fae8b6"; // Sleeper Default (Golden Cream)
  let bandColor = "#c89b53"; // Sleeper Window Band
  let borderColor = "#e5cb8d";

  if (upper.startsWith('SLR') || upper.startsWith('EOG') || upper.includes('LPR') || upper.includes('GUARD')) {
    // SLR / SLRD / Generator Car (Silver/White)
    bodyColor = "#f1f5f9";
    bandColor = "#cbd5e1";
    borderColor = "#cbd5e1";
  } else if (upper.startsWith('GEN') || upper.startsWith('GS') || upper.startsWith('UR')) {
    // General / Unreserved (Soft Pastel Rose Pink)
    bodyColor = "#fad8e2";
    bandColor = "#f08b9b";
    borderColor = "#f5b7c7";
  } else if (upper.startsWith('B') || upper.startsWith('3A') || upper.startsWith('3E') || upper.startsWith('M')) {
    // AC 3 Tier (Bright Sky Blue)
    bodyColor = "#7dd3fc";
    bandColor = "#0284c7";
    borderColor = "#38bdf8";
  } else if (upper.startsWith('A') || upper.startsWith('2A')) {
    // AC 2 Tier (Lavender Indigo)
    bodyColor = "#c7d2fe";
    bandColor = "#4f46e5";
    borderColor = "#a5b4fc";
  } else if (upper.startsWith('H') || upper.startsWith('1A') || upper.startsWith('EA') || upper.startsWith('EC')) {
    // AC First Class (Gold / Amber)
    bodyColor = "#fef08a";
    bandColor = "#ca8a04";
    borderColor = "#fde047";
  } else if (upper.startsWith('PC') || upper.includes('PANTRY')) {
    // Pantry Car (Flame Orange)
    bodyColor = "#fed7aa";
    bandColor = "#ea580c";
    borderColor = "#fdba74";
  } else if (upper.startsWith('C') || upper.startsWith('CC')) {
    // AC Chair Car (Teal / Aqua)
    bodyColor = "#ccfbf1";
    bandColor = "#0d9488";
    borderColor = "#99f6e4";
  }

  return `
    <svg class="rr-coach-svg" viewBox="0 0 110 56" xmlns="http://www.w3.org/2000/svg">
      <!-- Rail Track Line -->
      <line x1="2" y1="48" x2="108" y2="48" stroke="#94a3b8" stroke-width="1.5" />
      <!-- Ballast / Sleepers -->
      <line x1="6" y1="51" x2="104" y2="51" stroke="#cbd5e1" stroke-dasharray="2,3" stroke-width="3" stroke-linecap="butt" />

      <!-- Carriage Body -->
      <rect x="6" y="9" width="98" height="29" rx="3" fill="${bodyColor}" stroke="${borderColor}" stroke-width="1" />
      
      <!-- Roof bevel reflection -->
      <path d="M 7 11 Q 55 8 103 11" stroke="rgba(255,255,255,0.85)" stroke-width="1.2" fill="none" />
      
      <!-- Left Door Line -->
      <rect x="9" y="11" width="10" height="25" rx="1.5" fill="#ffffff" stroke="${borderColor}" stroke-width="0.75" />
      <rect x="11.5" y="14" width="5" height="7" rx="1.5" fill="${borderColor}" />
      
      <!-- Central Main Window Band -->
      <rect x="23" y="13.5" width="64" height="13" rx="2" fill="${bandColor}" />
      
      <!-- Right Door Line -->
      <rect x="91" y="11" width="10" height="25" rx="1.5" fill="#ffffff" stroke="${borderColor}" stroke-width="0.75" />
      <rect x="93.5" y="14" width="5" height="7" rx="1.5" fill="${borderColor}" />
      
      <!-- Underbody Chassis Bar -->
      <rect x="10" y="38" width="90" height="3" fill="#0f172a" />
      
      <!-- Bogie 1 (Left 2 Wheels) -->
      <circle cx="24" cy="43.5" r="4.5" fill="#1e293b" stroke="#0f172a" stroke-width="0.75" />
      <circle cx="24" cy="43.5" r="1.5" fill="#cbd5e1" />
      <circle cx="38" cy="43.5" r="4.5" fill="#1e293b" stroke="#0f172a" stroke-width="0.75" />
      <circle cx="38" cy="43.5" r="1.5" fill="#cbd5e1" />
      
      <!-- Bogie 2 (Right 2 Wheels) -->
      <circle cx="72" cy="43.5" r="4.5" fill="#1e293b" stroke="#0f172a" stroke-width="0.75" />
      <circle cx="72" cy="43.5" r="1.5" fill="#cbd5e1" />
      <circle cx="86" cy="43.5" r="4.5" fill="#1e293b" stroke="#0f172a" stroke-width="0.75" />
      <circle cx="86" cy="43.5" r="1.5" fill="#cbd5e1" />
    </svg>
  `;
}

/**
 * Render coach boxes in RailRadar 5-column format with illustrated SVG carriages
 */
export function renderCoachStrip(coachStr) {
  const container = document.getElementById('ts-coach-scroller');
  if (!container) return;

  if (!coachStr) {
    container.innerHTML = `<span style="grid-column: 1 / -1; text-align:center; padding: 20px; font-size:13px; color:#94a3b8;">Coach position composition data not published for this service.</span>`;
    return;
  }

  const parts = coachStr.split('-').map(c => c.trim()).filter(Boolean);
  let coachSeq = 1;

  container.innerHTML = parts.map((code) => {
    const upper = code.toUpperCase();
    const isEngine = upper.includes('ENG') || upper.includes('LOCO') || upper.includes('WAP') || upper.includes('WDP');
    const seqNum = isEngine ? '' : coachSeq++;

    return `
      <div class="rr-coach-item" title="Coach ${code} ${seqNum ? `(#${seqNum})` : '(Locomotive)'}">
        <div class="rr-coach-num">${seqNum ? seqNum : '&nbsp;'}</div>
        <div class="rr-coach-graphic">
          ${getCoachSvg(code)}
        </div>
        <div class="rr-coach-code">${code}</div>
      </div>
    `;
  }).join('');
}

