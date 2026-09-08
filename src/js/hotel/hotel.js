import { initAuth } from '../auth/auth.js';
import { initModeSelectorPill } from '../global/mode-selector.js';

document.addEventListener('DOMContentLoaded', () => {
    initAuth({ autoPrompt: false });
    initModeSelectorPill();
    // 1. Initial Setup for Dates
    const checkinInput = document.getElementById('checkin-input');
    const checkoutInput = document.getElementById('checkout-input');
    
    // Set default dates: checkin today, checkout tomorrow
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    const todayStr = today.toISOString().split('T')[0];
    const tomorrowStr = tomorrow.toISOString().split('T')[0];
    
    if (checkinInput && checkoutInput) {
        checkinInput.value = todayStr;
        checkinInput.min = todayStr;
        
        checkoutInput.value = tomorrowStr;
        checkoutInput.min = tomorrowStr;
        
        // Ensure checkout is always after checkin
        checkinInput.addEventListener('change', (e) => {
            const newCheckin = new Date(e.target.value);
            const currentCheckout = new Date(checkoutInput.value);
            
            checkoutInput.min = e.target.value;
            
            if (newCheckin >= currentCheckout) {
                const newCheckout = new Date(newCheckin);
                newCheckout.setDate(newCheckout.getDate() + 1);
                checkoutInput.value = newCheckout.toISOString().split('T')[0];
            }
        });
    }

    // 2. Guests & Rooms Dropdown Logic
    const guestsField = document.getElementById('guests-field');
    const guestsPanel = document.getElementById('guests-panel');
    const guestsSummary = document.getElementById('guests-summary');
    
    let rooms = 1;
    let adults = 2;
    let children = 0;

    if (guestsField && guestsPanel) {
        // Toggle dropdown
        guestsField.addEventListener('click', (e) => {
            guestsPanel.classList.toggle('show');
            e.stopPropagation();
        });

        // Close dropdown when clicking outside
        document.addEventListener('click', (e) => {
            if (!guestsField.contains(e.target)) {
                guestsPanel.classList.remove('show');
            }
        });
    }

    function updateSummary() {
        if (guestsSummary) {
            guestsSummary.textContent = `${rooms} Room${rooms > 1 ? 's' : ''}, ${adults + children} Guest${(adults + children) > 1 ? 's' : ''}`;
        }
        
        document.getElementById('rooms-count').textContent = rooms;
        document.getElementById('adults-count').textContent = adults;
        document.getElementById('children-count').textContent = children;
        
        document.getElementById('rooms-dec').disabled = rooms <= 1;
        document.getElementById('adults-dec').disabled = adults <= 1;
        document.getElementById('children-dec').disabled = children <= 0;
    }

    // Handlers for Rooms
    document.getElementById('rooms-inc')?.addEventListener('click', (e) => {
        e.stopPropagation();
        if (rooms < 10) { rooms++; updateSummary(); }
    });
    document.getElementById('rooms-dec')?.addEventListener('click', (e) => {
        e.stopPropagation();
        if (rooms > 1) { rooms--; updateSummary(); }
    });

    // Handlers for Adults
    document.getElementById('adults-inc')?.addEventListener('click', (e) => {
        e.stopPropagation();
        if (adults < 20) { adults++; updateSummary(); }
    });
    document.getElementById('adults-dec')?.addEventListener('click', (e) => {
        e.stopPropagation();
        if (adults > 1) { adults--; updateSummary(); }
    });

    // Handlers for Children
    document.getElementById('children-inc')?.addEventListener('click', (e) => {
        e.stopPropagation();
        if (children < 10) { children++; updateSummary(); }
    });
    document.getElementById('children-dec')?.addEventListener('click', (e) => {
        e.stopPropagation();
        if (children > 0) { children--; updateSummary(); }
    });
    
    // Initialize state
    updateSummary();

    // 3. Form Submission (Mock Result)
    const searchForm = document.getElementById('search-form');
    const resultBanner = document.getElementById('result-banner');
    const resultText = document.getElementById('result-text');
    const locationInput = document.getElementById('location-input');

    if (searchForm) {
        searchForm.addEventListener('submit', (e) => {
            e.preventDefault();
            
            if (!locationInput.value) {
                alert("Please select a location.");
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
                    resultText.textContent = `Found 142 hotels in ${locationInput.value} from ${checkinInput.value} to ${checkoutInput.value}.`;
                }
            }, 1200);
        });
    }

    // 4. Canvas Animation (Starry Night Effect)
    initHotelAnimation();
});

function initHotelAnimation() {
    const canvas = document.getElementById('hotel-canvas');
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    let width, height;
    
    function resize() {
        width = canvas.width = window.innerWidth;
        height = canvas.height = document.querySelector('.hero').offsetHeight;
    }
    
    window.addEventListener('resize', resize);
    resize();

    // Stars
    const stars = [];
    const numStars = 150;
    
    for (let i = 0; i < numStars; i++) {
        stars.push({
            x: Math.random() * width,
            y: Math.random() * height,
            radius: Math.random() * 1.5,
            alpha: Math.random(),
            speed: (Math.random() * 0.05) + 0.01,
            fadeSpeed: (Math.random() * 0.02) + 0.005,
            fadingIn: Math.random() > 0.5
        });
    }

    function draw() {
        // Clear background
        ctx.clearRect(0, 0, width, height);
        
        stars.forEach(star => {
            // Update star position (slow drift upwards)
            star.y -= star.speed;
            if (star.y < 0) {
                star.y = height;
                star.x = Math.random() * width;
            }
            
            // Twinkle effect
            if (star.fadingIn) {
                star.alpha += star.fadeSpeed;
                if (star.alpha >= 1) {
                    star.fadingIn = false;
                }
            } else {
                star.alpha -= star.fadeSpeed;
                if (star.alpha <= 0.1) {
                    star.fadingIn = true;
                }
            }
            
            // Draw star
            ctx.beginPath();
            ctx.arc(star.x, star.y, star.radius, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(255, 255, 255, ${star.alpha})`;
            ctx.fill();
        });
        
        requestAnimationFrame(draw);
    }
    
    draw();
}
