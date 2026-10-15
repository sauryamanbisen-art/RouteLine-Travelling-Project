import { initAuth, getCurrentUser, isAuthenticated, requireAuthentication } from '../home/auth/auth.js';
import { initModeSelectorPill } from '../home/global/mode-selector.js';
import { saveBooking } from '../services/booking-store.js';

document.addEventListener('DOMContentLoaded', () => {
    initAuth({ autoPrompt: false });
    initModeSelectorPill();
    // Initialize the bus search functionality
    // 1. Initial Setup
    const fromInput = document.getElementById('from-input');
    const toInput = document.getElementById('to-input');
    const swapBtn = document.getElementById('swap-btn');
    const departInput = document.getElementById('depart-input');
    
    // Set default date to today
    const today = new Date().toISOString().split('T')[0];
    if (departInput) {
        departInput.value = today;
        departInput.min = today;
    }

    // 2. Swap Functionality
    if (swapBtn && fromInput && toInput) {
        swapBtn.addEventListener('click', () => {
            const temp = fromInput.value;
            fromInput.value = toInput.value;
            toInput.value = temp;
            
            // Add a quick flip animation to the icon
            const icon = swapBtn.querySelector('i');
            if (icon) {
                icon.style.transform = 'rotate(180deg)';
                icon.style.transition = 'transform 0.3s ease';
                setTimeout(() => {
                    icon.style.transform = 'rotate(0deg)';
                    icon.style.transition = 'none';
                }, 300);
            }
        });
    }

    // 3. Passengers Dropdown Logic
    const travellersField = document.getElementById('travellers-field');
    const travellersPanel = document.getElementById('travellers-panel');
    const travellersSummary = document.getElementById('travellers-summary');
    
    const btnInc = document.getElementById('btn-inc');
    const btnDec = document.getElementById('btn-dec');
    const passCountEl = document.getElementById('passengers-count');
    
    let passengers = 1;

    if (travellersField && travellersPanel) {
        // Toggle dropdown
        travellersField.addEventListener('click', (e) => {
            travellersPanel.classList.toggle('show');
            e.stopPropagation(); // prevent document click from firing immediately
        });

        // Close dropdown when clicking outside
        document.addEventListener('click', (e) => {
            if (!travellersField.contains(e.target)) {
                travellersPanel.classList.remove('show');
            }
        });
    }

    function updateSummary() {
        if (passCountEl && travellersSummary) {
            passCountEl.textContent = passengers;
            travellersSummary.textContent = `${passengers} Passenger${passengers > 1 ? 's' : ''}`;
        }
    }

    if (btnInc) {
        btnInc.addEventListener('click', (e) => {
            e.stopPropagation();
            if (passengers < 6) { // max 6 passengers usually for a single booking
                passengers++;
                updateSummary();
            }
        });
    }

    if (btnDec) {
        btnDec.addEventListener('click', (e) => {
            e.stopPropagation();
            if (passengers > 1) {
                passengers--;
                updateSummary();
            }
        });
    }

    // 4. Form Submission (Mock Result)
    const searchForm = document.getElementById('search-form');
    const resultBanner = document.getElementById('result-banner');
    const resultText = document.getElementById('result-text');

    if (searchForm) {
        searchForm.addEventListener('submit', (e) => {
            e.preventDefault();
            
            if (!fromInput.value || !toInput.value) {
                alert("Please select Origin and Destination.");
                return;
            }
            
            // Mock API Call delay
            const btn = document.getElementById('search-btn');
            const originalText = btn.innerHTML;
            btn.innerHTML = '<i data-lucide="loader" class="spin"></i> Searching...';
            lucide.createIcons();
            btn.style.pointerEvents = 'none';
            btn.style.opacity = '0.8';
            
            if (resultBanner) resultBanner.style.display = 'none';

            setTimeout(() => {
                btn.innerHTML = originalText;
                lucide.createIcons();
                btn.style.pointerEvents = 'auto';
                btn.style.opacity = '1';
                
                if (resultBanner && resultText) {
                    resultBanner.style.display = 'block';
                    resultText.textContent = `Found 24 verified buses from ${fromInput.value} to ${toInput.value} on ${departInput.value} for ${passengers} passenger(s).`;
                }

                // Render dynamic bus results cards
                renderBusSearchResults(fromInput.value, toInput.value, departInput.value, passengers);
            }, 800);
        });
    }

    function renderBusSearchResults(from, to, date, paxCount) {
        const section = document.getElementById('bus-results-section');
        const container = document.getElementById('bus-cards-container');
        const title = document.getElementById('bus-results-title');
        const subtitle = document.getElementById('bus-results-subtitle');

        if (!section || !container) return;

        section.style.display = 'block';
        if (title) title.textContent = `Buses from ${from} to ${to}`;
        if (subtitle) subtitle.textContent = `Showing 3 top-rated services on ${date} for ${paxCount} passenger(s).`;

        const busOptions = [
            {
                operator: 'Zingbus Premium',
                busType: 'Volvo 9600 Multi-Axle AC Sleeper (2+1)',
                departure: '22:30',
                arrival: '06:15 (+1 day)',
                duration: '7h 45m',
                rating: '4.8',
                reviews: '1,420',
                fare: 850,
                amenities: ['Live Tracking', 'Charging Point', 'Water Bottle', 'Blanket']
            },
            {
                operator: 'IntrCity SmartBus',
                busType: 'Bharat Benz Club Class AC (2+1)',
                departure: '21:00',
                arrival: '05:00 (+1 day)',
                duration: '8h 00m',
                rating: '4.9',
                reviews: '2,810',
                fare: 1050,
                amenities: ['Lounge Access', 'WiFi', 'Snacks', 'CCTV']
            },
            {
                operator: 'VRL Travels',
                busType: 'I-Shift Multi-Axle Executive AC',
                departure: '23:45',
                arrival: '07:30 (+1 day)',
                duration: '7h 45m',
                rating: '4.7',
                reviews: '980',
                fare: 720,
                amenities: ['Emergency Exit', 'Reading Light', 'Charging Point']
            }
        ];

        container.innerHTML = busOptions.map(bus => `
            <div style="background: #ffffff; border: 1.5px solid #e2e8f0; border-radius: 18px; padding: 22px 26px; display: flex; justify-content: space-between; align-items: center; gap: 20px; box-shadow: 0 4px 14px rgba(0,0,0,0.03); flex-wrap: wrap;">
                <div style="flex: 1; min-width: 260px;">
                    <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 6px;">
                        <span style="font-weight: 800; font-size: 1.1rem; color: #0f172a;">${bus.operator}</span>
                        <span style="background: #ecfdf5; color: #047857; font-size: 0.75rem; font-weight: 800; padding: 2px 8px; border-radius: 6px;">★ ${bus.rating} (${bus.reviews})</span>
                    </div>
                    <div style="font-size: 0.8rem; color: #64748b; font-weight: 600; margin-bottom: 12px;">${bus.busType}</div>
                    <div style="display: flex; align-items: center; gap: 8px; flex-wrap: wrap;">
                        ${bus.amenities.map(a => `<span style="background: #f8fafc; border: 1px solid #e2e8f0; font-size: 0.72rem; color: #475569; padding: 2px 8px; border-radius: 4px;">${a}</span>`).join('')}
                    </div>
                </div>

                <div style="display: flex; align-items: center; gap: 24px; text-align: center;">
                    <div>
                        <div style="font-size: 1.15rem; font-weight: 800; color: #0f172a; font-family: monospace;">${bus.departure}</div>
                        <div style="font-size: 0.75rem; color: #64748b; font-weight: 600;">${from}</div>
                    </div>
                    <div style="display: flex; flex-direction: column; align-items: center; gap: 4px;">
                        <span style="font-size: 0.72rem; color: #94a3b8; font-weight: 600;">${bus.duration}</span>
                        <div style="width: 70px; height: 2px; background: #cbd5e1; position: relative;">
                            <span style="width: 6px; height: 6px; border-radius: 50%; background: #d89b53; position: absolute; left: 50%; top: -2px; transform: translateX(-50%);"></span>
                        </div>
                    </div>
                    <div>
                        <div style="font-size: 1.15rem; font-weight: 800; color: #0f172a; font-family: monospace;">${bus.arrival}</div>
                        <div style="font-size: 0.75rem; color: #64748b; font-weight: 600;">${to}</div>
                    </div>
                </div>

                <div style="text-align: right; min-width: 160px;">
                    <div style="font-size: 1.35rem; font-weight: 900; color: #0f172a; font-family: monospace;">₹${(bus.fare * paxCount).toLocaleString('en-IN')}</div>
                    <div style="font-size: 0.75rem; color: #94a3b8; margin-bottom: 10px;">For ${paxCount} traveler${paxCount > 1 ? 's' : ''}</div>
                    <button type="button" class="btn-book-bus-seat" 
                            data-operator="${bus.operator}"
                            data-fare="${bus.fare}"
                            data-departure="${bus.departure}"
                            data-arrival="${bus.arrival}"
                            data-duration="${bus.duration}"
                            data-bustype="${bus.busType}"
                            style="background: #0f172a; color: #ffffff; border: none; border-radius: 10px; padding: 10px 20px; font-weight: 800; font-size: 0.85rem; cursor: pointer; transition: all 0.15s ease;">
                        Book Seat
                    </button>
                </div>
            </div>
        `).join('');

        // Smooth scroll to results
        section.scrollIntoView({ behavior: 'smooth' });

        // Wire click handler for booking
        container.querySelectorAll('.btn-book-bus-seat').forEach(btn => {
            btn.addEventListener('click', () => {
                requireAuthentication(() => {
                    const operator = btn.getAttribute('data-operator');
                    const fare = Number(btn.getAttribute('data-fare'));
                    const departure = btn.getAttribute('data-departure');
                    const arrival = btn.getAttribute('data-arrival');
                    const duration = btn.getAttribute('data-duration');
                    const busType = btn.getAttribute('data-bustype');

                    const user = getCurrentUser();
                    const isAuth = isAuthenticated();
                    const paxName = isAuth ? (user?.name || 'Verified Traveler') : 'Guest Passenger';

                    const ref = `ZB-${Date.now().toString().slice(-6)}`;
                    saveBooking({
                        id: `BK-BUS-${ref}`,
                        bookingReference: ref,
                        type: 'bus',
                        status: 'UPCOMING',
                        title: `${operator} (${busType})`,
                        fromCode: from.slice(0, 3).toUpperCase(),
                        fromName: from,
                        toCode: to.slice(0, 3).toUpperCase(),
                        toName: to,
                        journeyDate: date,
                        departureTime: departure,
                        arrivalTime: arrival,
                        duration: duration,
                        platform: 'Bay 3',
                        classType: busType,
                        classCode: 'AC-SL',
                        quota: 'Standard',
                        passengers: [{
                            name: paxName,
                            seat: 'Berth 14 (Upper)',
                            status: 'CONFIRMED'
                        }],
                        totalFare: fare * paxCount,
                        paymentMethod: 'UPI / Online',
                        details: {
                            operator: operator,
                            busType: busType,
                            liveTracking: true
                        }
                    });

                    alert(
                        `🎉 Bus Booking Confirmed!\n\n` +
                        `Booking Reference: ${ref}\n` +
                        `Operator: ${operator}\n` +
                        `Route: ${from} ➔ ${to}\n` +
                        `Date: ${date} (${departure})\n` +
                        `Seat: Berth 14 (Upper)\n` +
                        `Total Fare: ₹${(fare * paxCount).toLocaleString('en-IN')}\n\n` +
                        `Your booking is recorded in your session. Redirecting to My Bookings...`
                    );

                    window.location.href = `../train/ticket.html`;
                });
            });
        });
    }

    // 5. Canvas Animation (Moving Road Effect)
    initRoadAnimation();
});

function initRoadAnimation() {
    const canvas = document.getElementById('road-canvas');
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    let width, height;
    
    function resize() {
        width = canvas.width = window.innerWidth;
        height = canvas.height = document.querySelector('.hero').offsetHeight;
    }
    
    window.addEventListener('resize', resize);
    resize();

    // Road lines
    const lines = [];
    const numLines = 5;
    
    for (let i = 0; i < numLines; i++) {
        lines.push({
            y: (height / numLines) * i,
            speed: 2 + Math.random() * 2
        });
    }

    function draw() {
        // Clear with dark road color
        ctx.fillStyle = '#111';
        ctx.fillRect(0, 0, width, height);
        
        // Draw dashed road markings
        ctx.fillStyle = 'rgba(255, 255, 255, 0.15)';
        
        // Center line
        const centerX = width / 2;
        const lineWidth = 10;
        const lineHeight = 60;
        const lineGap = 40;
        
        let currentY = (Date.now() / 10) % (lineHeight + lineGap);
        
        for (let y = -currentY; y < height; y += (lineHeight + lineGap)) {
            ctx.fillRect(centerX - lineWidth/2, y, lineWidth, lineHeight);
            
            // Draw some side road lights/markers
            ctx.fillStyle = 'rgba(255, 200, 0, 0.4)';
            ctx.beginPath();
            ctx.arc(centerX - 150 - (y/height)*100, y, 3, 0, Math.PI*2);
            ctx.fill();
            
            ctx.beginPath();
            ctx.arc(centerX + 150 + (y/height)*100, y, 3, 0, Math.PI*2);
            ctx.fill();
            
            ctx.fillStyle = 'rgba(255, 255, 255, 0.15)';
        }
        
        // Draw moving particles representing other vehicles
        requestAnimationFrame(draw);
    }
    
    draw();
}
