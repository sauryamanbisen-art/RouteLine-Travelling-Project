import { initPNRModule } from '../train/pnr-status.js';
import { initAuth } from '../auth/auth.js';
import { initModeSelectorPill } from './mode-selector.js';

// Comprehensive Station Dataset for Interactive Autocomplete Suggestions
const STATIONS_DATA = [
  { code: 'NDLS', name: 'New Delhi', city: 'Delhi', state: 'Delhi' },
  { code: 'DLI', name: 'Old Delhi', city: 'Delhi', state: 'Delhi' },
  { code: 'NZM', name: 'Hazrat Nizamuddin', city: 'Delhi', state: 'Delhi' },
  { code: 'ANVT', name: 'Anand Vihar Terminal', city: 'Delhi', state: 'Delhi' },
  { code: 'CAPE', name: 'Kanyakumari', city: 'Kanyakumari', state: 'Tamil Nadu' },
  { code: 'MMCT', name: 'Mumbai Central', city: 'Mumbai', state: 'Maharashtra' },
  { code: 'CSMT', name: 'Mumbai CSMT', city: 'Mumbai', state: 'Maharashtra' },
  { code: 'BDTS', name: 'Bandra Terminus', city: 'Mumbai', state: 'Maharashtra' },
  { code: 'HWH', name: 'Howrah Junction', city: 'Kolkata', state: 'West Bengal' },
  { code: 'MAS', name: 'MGR Chennai Central', city: 'Chennai', state: 'Tamil Nadu' },
  { code: 'SBC', name: 'KSR Bengaluru City', city: 'Bengaluru', state: 'Karnataka' },
  { code: 'PUNE', name: 'Pune Junction', city: 'Pune', state: 'Maharashtra' },
  { code: 'NGP', name: 'Nagpur Junction', city: 'Nagpur', state: 'Maharashtra' },
  { code: 'ADI', name: 'Ahmedabad Junction', city: 'Ahmedabad', state: 'Gujarat' },
  { code: 'BSB', name: 'Varanasi Junction', city: 'Varanasi', state: 'Uttar Pradesh' },
  { code: 'CNB', name: 'Kanpur Central', city: 'Kanpur', state: 'Uttar Pradesh' },
  { code: 'LKO', name: 'Lucknow Charbagh', city: 'Lucknow', state: 'Uttar Pradesh' },
  { code: 'PNBE', name: 'Patna Junction', city: 'Patna', state: 'Bihar' },
  { code: 'GKP', name: 'Gorakhpur Junction', city: 'Gorakhpur', state: 'Uttar Pradesh' },
  { code: 'JAT', name: 'Jammu Tawi', city: 'Jammu', state: 'Jammu & Kashmir' },
  { code: 'SVDK', name: 'SMVD Katra', city: 'Katra', state: 'Jammu & Kashmir' },
  { code: 'ASR', name: 'Amritsar Junction', city: 'Amritsar', state: 'Punjab' },
  { code: 'CDG', name: 'Chandigarh', city: 'Chandigarh', state: 'Punjab' },
  { code: 'JP', name: 'Jaipur Junction', city: 'Jaipur', state: 'Rajasthan' },
  { code: 'JU', name: 'Jodhpur Junction', city: 'Jodhpur', state: 'Rajasthan' },
  { code: 'UJN', name: 'Ujjain Junction', city: 'Ujjain', state: 'Madhya Pradesh' },
  { code: 'INDB', name: 'Indore Junction', city: 'Indore', state: 'Madhya Pradesh' },
  { code: 'BPL', name: 'Bhopal Junction', city: 'Bhopal', state: 'Madhya Pradesh' },
  { code: 'RKMP', name: 'Rani Kamlapati', city: 'Bhopal', state: 'Madhya Pradesh' },
  { code: 'HYB', name: 'Hyderabad Deccan', city: 'Hyderabad', state: 'Telangana' },
  { code: 'SC', name: 'Secunderabad Junction', city: 'Secunderabad', state: 'Telangana' },
  { code: 'BJU', name: 'Barauni Junction', city: 'Barauni', state: 'Bihar' },
  { code: 'GHY', name: 'Guwahati', city: 'Guwahati', state: 'Assam' },
  { code: 'MAO', name: 'Madgaon Junction', city: 'Goa', state: 'Goa' },
  { code: 'TVC', name: 'Thiruvananthapuram', city: 'Trivandrum', state: 'Kerala' },
  { code: 'ERS', name: 'Ernakulam Junction', city: 'Kochi', state: 'Kerala' },
  { code: 'JWB', name: 'Jawai Bandh', city: 'Pali', state: 'Rajasthan' },
  { code: 'AGC', name: 'Agra Cantt', city: 'Agra', state: 'Uttar Pradesh' },
  { code: 'GWL', name: 'Gwalior Junction', city: 'Gwalior', state: 'Madhya Pradesh' },
  { code: 'KOTA', name: 'Kota Junction', city: 'Kota', state: 'Rajasthan' },
  { code: 'SUR', name: 'Solapur', city: 'Solapur', state: 'Maharashtra' },
  { code: 'BSL', name: 'Bhusaval Junction', city: 'Bhusaval', state: 'Maharashtra' }
];

function setupStationAutocomplete() {
    function closeAllDropdowns() {
        document.querySelectorAll('.rl-station-dropdown').forEach(el => el.remove());
    }

    function getMatches(query) {
        if (!query) {
            return [
                STATIONS_DATA[0], // New Delhi
                STATIONS_DATA[4], // Kanyakumari
                STATIONS_DATA[5], // Mumbai Central
                STATIONS_DATA[8], // Howrah
                STATIONS_DATA[9], // Chennai Central
                STATIONS_DATA[10] // Bengaluru
            ];
        }
        const clean = query.trim().toLowerCase();
        return STATIONS_DATA.filter(s => 
            s.code.toLowerCase().includes(clean) ||
            s.name.toLowerCase().includes(clean) ||
            s.city.toLowerCase().includes(clean) ||
            s.state.toLowerCase().includes(clean)
        ).slice(0, 8);
    }

    function renderDropdown(input) {
        closeAllDropdowns();
        const group = input.closest('.input-group');
        if (!group) return;

        const matches = getMatches(input.value);
        if (matches.length === 0) return;

        const dropdown = document.createElement('div');
        dropdown.className = 'rl-station-dropdown active';

        dropdown.innerHTML = matches.map(s => `
            <div class="rl-station-item" data-value="${s.name} (${s.code})" data-code="${s.code}">
                <div class="rl-station-info">
                    <span class="rl-station-name">${s.name}</span>
                    <span class="rl-station-city">${s.city}, ${s.state}</span>
                </div>
                <span class="rl-station-code">${s.code}</span>
            </div>
        `).join('');

        dropdown.querySelectorAll('.rl-station-item').forEach(item => {
            item.addEventListener('mousedown', (e) => {
                e.preventDefault(); // Prevent input blur
                const val = item.getAttribute('data-value');
                input.value = val;
                closeAllDropdowns();
            });
        });

        group.appendChild(dropdown);
    }

    // Input typing listener
    document.addEventListener('input', (e) => {
        const input = e.target;
        if (input && (input.name === 'origin' || input.name === 'destination')) {
            renderDropdown(input);
        }
    });

    // Input focus listener
    document.addEventListener('focusin', (e) => {
        const input = e.target;
        if (input && (input.name === 'origin' || input.name === 'destination')) {
            renderDropdown(input);
        }
    });

    // Close on outside click
    document.addEventListener('click', (e) => {
        if (!e.target.closest('.input-group')) {
            closeAllDropdowns();
        }
    });

    // Close on Escape
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            closeAllDropdowns();
        }
    });
}

document.addEventListener('DOMContentLoaded', () => {
    // Initialize PNR Status Quick Service & Authentication Module
    initPNRModule();
    initAuth({ autoPrompt: true });

    // Initialize Station Autocomplete Suggestions
    setupStationAutocomplete();

    const modeBtns = document.querySelectorAll('.mode-btn');
    const activePill = document.getElementById('active-pill');
    const dynamicInputs = document.getElementById('dynamic-inputs');
    const searchForm = document.getElementById('search-form');

    // Define the HTML for different travel modes
    const inputTemplates = {
        Trains: `
            <div class="input-group">
                <i data-lucide="map-pin" class="input-icon"></i>
                <div class="input-text">
                    <label>From</label>
                    <input type="text" name="origin" value="New Delhi (NDLS)" placeholder="e.g. New Delhi (NDLS)" autocomplete="off" spellcheck="false" required>
                </div>
            </div>
            
            <div class="swap-icon-container">
                <button type="button" class="swap-btn"><i data-lucide="arrow-left-right" class="icon-sm"></i></button>
            </div>
            
            <div class="input-group">
                <i data-lucide="map-pin" class="input-icon"></i>
                <div class="input-text">
                    <label>To</label>
                    <input type="text" name="destination" value="Kanyakumari (CAPE)" placeholder="e.g. Kanyakumari (CAPE)" autocomplete="off" spellcheck="false" required>
                </div>
            </div>
            
            <div class="divider-vertical"></div>
            
            <div class="input-group date-picker-group">
                <i data-lucide="calendar" class="input-icon"></i>
                <div class="input-text">
                    <label>Date</label>
                    <input type="date" name="date" id="home-train-date" required>
                </div>
            </div>
            
            <div class="divider-vertical"></div>
            
            <div class="input-group class-selector">
                <div class="input-text">
                    <label>Class</label>
                    <select name="class">
                        <option value="Sleeper">Sleeper</option>
                        <option value="3A">3A</option>
                        <option value="2A">2A</option>
                        <option value="1A">1A</option>
                    </select>
                </div>
            </div>
            
            <button type="submit" class="search-btn">
                <i data-lucide="search"></i> Search
            </button>
        `,
        Flights: `
            <div class="input-group">
                <i data-lucide="plane-takeoff" class="input-icon"></i>
                <div class="input-text">
                    <label>From</label>
                    <input type="text" name="origin" value="DEL - New Delhi">
                </div>
            </div>
            
            <div class="swap-icon-container">
                <button type="button" class="swap-btn"><i data-lucide="arrow-left-right" class="icon-sm"></i></button>
            </div>
            
            <div class="input-group">
                <i data-lucide="plane-landing" class="input-icon"></i>
                <div class="input-text">
                    <label>To</label>
                    <input type="text" name="destination" value="BOM - Mumbai">
                </div>
            </div>
            
            <div class="divider-vertical"></div>
            
            <div class="input-group">
                <i data-lucide="calendar" class="input-icon"></i>
                <div class="input-text">
                    <label>Departure</label>
                    <input type="date" name="departureDate">
                </div>
            </div>
            
            <div class="divider-vertical"></div>
            
            <div class="input-group">
                <i data-lucide="calendar" class="input-icon"></i>
                <div class="input-text">
                    <label>Return</label>
                    <input type="date" name="returnDate" placeholder="Optional">
                </div>
            </div>
            
            <div class="divider-vertical"></div>
            
            <div class="input-group class-selector">
                <div class="input-text">
                    <label>Travellers & Class</label>
                    <select name="class">
                        <option value="Economy">1, Economy</option>
                        <option value="Business">1, Business</option>
                    </select>
                </div>
            </div>
            
            <button type="submit" class="search-btn">
                <i data-lucide="search"></i> Search
            </button>
        `,
        Buses: `
            <div class="input-group">
                <i data-lucide="map-pin" class="input-icon"></i>
                <div class="input-text">
                    <label>From</label>
                    <input type="text" name="origin" placeholder="Leaving from">
                </div>
            </div>
            
            <div class="swap-icon-container">
                <button type="button" class="swap-btn"><i data-lucide="arrow-left-right" class="icon-sm"></i></button>
            </div>
            
            <div class="input-group">
                <i data-lucide="map-pin" class="input-icon"></i>
                <div class="input-text">
                    <label>To</label>
                    <input type="text" name="destination" placeholder="Going to">
                </div>
            </div>
            
            <div class="divider-vertical"></div>
            
            <div class="input-group">
                <i data-lucide="calendar" class="input-icon"></i>
                <div class="input-text">
                    <label>Date of Journey</label>
                    <input type="date" name="date">
                </div>
            </div>
            
            <button type="submit" class="search-btn">
                <i data-lucide="search"></i> Search
            </button>
        `,
        Hotels: `
            <div class="input-group">
                <i data-lucide="map-pin" class="input-icon"></i>
                <div class="input-text">
                    <label>City, Property Name Or Location</label>
                    <input type="text" name="location" placeholder="Where do you want to stay?">
                </div>
            </div>
            
            <div class="divider-vertical"></div>
            
            <div class="input-group">
                <i data-lucide="calendar" class="input-icon"></i>
                <div class="input-text">
                    <label>Check-In</label>
                    <input type="date" name="checkIn">
                </div>
            </div>
            
            <div class="divider-vertical"></div>
            
            <div class="input-group">
                <i data-lucide="calendar" class="input-icon"></i>
                <div class="input-text">
                    <label>Check-Out</label>
                    <input type="date" name="checkOut">
                </div>
            </div>
            
            <div class="divider-vertical"></div>
            
            <div class="input-group class-selector">
                <div class="input-text">
                    <label>Rooms & Guests</label>
                    <select name="guests">
                        <option value="1 Room, 2 Adults">1 Room, 2 Adults</option>
                        <option value="1 Room, 1 Adult">1 Room, 1 Adult</option>
                        <option value="2 Rooms, 4 Adults">2 Rooms, 4 Adults</option>
                    </select>
                </div>
            </div>
            
            <button type="submit" class="search-btn">
                <i data-lucide="search"></i> Search
            </button>
        `
    };

    function initDefaultDates() {
        const trainDate = document.getElementById('home-train-date');
        if (trainDate && !trainDate.value) {
            const d = new Date();
            d.setDate(d.getDate() + 3);
            trainDate.value = d.toISOString().split('T')[0];
            trainDate.min = new Date().toISOString().split('T')[0];
        }
    }
    initDefaultDates();

    // Initialize unified Mode Selector Pill with smooth switching animation
    initModeSelectorPill();

    // Delegated click on any .input-group containing a date input to open the picker
    document.addEventListener('click', (e) => {
        const group = e.target.closest('.input-group');
        if (group) {
            const dateInput = group.querySelector('input[type="date"]');
            if (dateInput && e.target !== dateInput && typeof dateInput.showPicker === 'function') {
                try {
                    dateInput.showPicker();
                } catch (err) {
                    dateInput.focus();
                }
            }
        }
    });

    // Delegated swap button click
    document.addEventListener('click', (e) => {
        const swapBtn = e.target.closest('.swap-btn');
        if (swapBtn) {
            const form = swapBtn.closest('form');
            if (form) {
                const originInput = form.querySelector('input[name="origin"]');
                const destInput = form.querySelector('input[name="destination"]');
                if (originInput && destInput) {
                    const temp = originInput.value;
                    originInput.value = destInput.value;
                    destInput.value = temp;
                    swapBtn.classList.add('is-rotating');
                    setTimeout(() => swapBtn.classList.remove('is-rotating'), 300);
                }
            }
        }
    });
});

