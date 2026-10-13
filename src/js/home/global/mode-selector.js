/**
 * RouteLine - Mode Selector Pill Controller (mode-selector.js)
 * Accurately aligns the active pill indicator behind the selected mode button
 * Ensuring concentric, pixel-perfect 5px border gaps for all tabs (Trains, Flights, Buses, Hotels)
 * And provides smooth, seamless sliding animations when switching between pages.
 */

function getPageHref(modeKey) {
    const isInsidePages = window.location.pathname.includes('/pages/');
    switch (modeKey) {
        case 'trains':
            return isInsidePages ? '../../index.html' : 'index.html';
        case 'flights':
            return isInsidePages ? '../flight/flight-search.html' : 'pages/flight/flight-search.html';
        case 'buses':
            return isInsidePages ? '../bus/bus-results.html' : 'pages/bus/bus-results.html';
        case 'hotels':
            return isInsidePages ? '../hotel/hotel-results.html' : 'pages/hotel/hotel-results.html';
        default:
            return isInsidePages ? '../../index.html' : 'index.html';
    }
}

export function initModeSelectorPill() {
    const selector = document.querySelector('.mode-selector');
    if (!selector) return;

    const activePill = selector.querySelector('#active-pill') || selector.querySelector('.active-pill');
    const btns = Array.from(selector.querySelectorAll('.mode-btn'));
    if (!activePill || btns.length === 0) return;

    function alignPill(targetBtn, animated = false) {
        const btn = targetBtn || selector.querySelector('.mode-btn.active') || btns[0];
        if (!btn || !activePill) return;

        if (animated) {
            selector.classList.add('is-animated');
            activePill.style.transition = 'left 0.22s cubic-bezier(0.4, 0, 0.2, 1), width 0.22s cubic-bezier(0.4, 0, 0.2, 1)';
        } else {
            selector.classList.remove('is-animated');
            activePill.style.transition = 'none';
        }

        activePill.style.right = 'auto';
        activePill.style.left = `${btn.offsetLeft}px`;
        activePill.style.width = `${btn.offsetWidth}px`;
        activePill.style.top = `${btn.offsetTop}px`;
        activePill.style.height = `${btn.offsetHeight}px`;

        if (!animated) {
            // Force layout reflow so position applies immediately with transition: none
            void activePill.offsetWidth;
        }
    }

    // Immediately align without animation on page load
    alignPill(null, false);

    // Re-align on next frames after font rendering and Lucide icon injection
    requestAnimationFrame(() => alignPill(null, false));
    setTimeout(() => {
        alignPill(null, false);
        // Ready for smooth user click animations
        selector.classList.add('is-animated');
    }, 60);

    // Handle tab clicks with smooth pre-navigation animation
    btns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            const currentActive = selector.querySelector('.mode-btn.active');
            if (btn === currentActive) {
                e.preventDefault();
                return;
            }

            e.preventDefault();

            // Target page URL
            const modeKey = (btn.getAttribute('data-mode') || '').toLowerCase();
            const targetHref = btn.getAttribute('data-href') || getPageHref(modeKey);

            // 1. Immediately switch active styles so button text colors cross-fade
            btns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            // 2. Animate the dark pill smoothly to the clicked tab
            alignPill(btn, true);

            // 3. Navigate smoothly right as the slide finishes
            if (targetHref) {
                setTimeout(() => {
                    window.location.href = targetHref;
                }, 200);
            }
        });
    });

    window.addEventListener('resize', () => {
        const currentActive = selector.querySelector('.mode-btn.active');
        alignPill(currentActive, false);
    });
}

export function initUnifiedSearchDock() {
    // 1. One-way vs Round-trip toggling
    const tripBtns = document.querySelectorAll('.dock-trip-btn');
    tripBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            tripBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            
            const returnBox = document.getElementById('returnBox') || document.querySelector('.dock-return-box');
            const returnInput = document.getElementById('returnDateInput') || document.querySelector('input[name="returnDate"]');
            
            if (btn.getAttribute('data-trip') === 'round-trip') {
                if (returnBox) returnBox.classList.remove('is-disabled');
                if (returnInput) {
                    returnInput.disabled = false;
                    returnInput.focus();
                }
            } else {
                if (returnBox) returnBox.classList.add('is-disabled');
                if (returnInput) {
                    returnInput.disabled = true;
                    returnInput.value = '';
                }
            }
        });
    });

    // 2. City / Station Swap button with smooth rotation
    document.querySelectorAll('.dock-swap-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const form = btn.closest('form');
            if (!form) return;
            const originInput = form.querySelector('input[name="origin"], input[name="from"]');
            const destInput = form.querySelector('input[name="destination"], input[name="to"]');
            if (originInput && destInput) {
                const temp = originInput.value;
                originInput.value = destInput.value;
                destInput.value = temp;
                btn.style.transform = 'rotate(180deg) scale(1.1)';
                setTimeout(() => {
                    btn.style.transform = '';
                }, 280);
            }
        });
    });
}

