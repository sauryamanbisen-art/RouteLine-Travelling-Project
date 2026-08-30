// bus.js

document.addEventListener('DOMContentLoaded', () => {
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
                    resultText.textContent = `Found 24 buses from ${fromInput.value} to ${toInput.value} on ${departInput.value} for ${passengers} passenger(s).`;
                }
            }, 1000);
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
