/**
 * RouteLine - Custom Search Controls (custom-search-controls.js)
 * Implements luxury-themed, accessible custom Date Pickers and Travel Class Selectors.
 * Seamlessly integrates with the unified search dock and preserves native form submission.
 */

const MONTH_NAMES = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
];

const WEEKDAY_NAMES = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

const DAY_NAMES_FULL = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTH_NAMES_SHORT = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

/**
 * Format a Date object to YYYY-MM-DD
 */
function formatDateToISO(date) {
    if (!date || isNaN(date.getTime())) return '';
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
}

/**
 * Format Date object to human display (e.g. "Thu, 29 Oct 2026")
 */
function formatDateToDisplay(date) {
    if (!date || isNaN(date.getTime())) return '';
    const dayName = DAY_NAMES_FULL[date.getDay()];
    const day = date.getDate();
    const month = MONTH_NAMES_SHORT[date.getMonth()];
    const year = date.getFullYear();
    return `${dayName}, ${day} ${month} ${year}`;
}

/**
 * Parse YYYY-MM-DD string to Date at midnight local time
 */
function parseISODate(str) {
    if (!str || typeof str !== 'string') return null;
    const parts = str.split('-');
    if (parts.length !== 3) return null;
    const y = parseInt(parts[0], 10);
    const m = parseInt(parts[1], 10) - 1;
    const d = parseInt(parts[2], 10);
    const date = new Date(y, m, d);
    return isNaN(date.getTime()) ? null : date;
}

/**
 * Compare two dates by day (ignoring time)
 * Returns -1 if d1 < d2, 0 if equal, 1 if d1 > d2
 */
function compareDays(d1, d2) {
    if (!d1 || !d2) return 0;
    const date1 = new Date(d1.getFullYear(), d1.getMonth(), d1.getDate()).getTime();
    const date2 = new Date(d2.getFullYear(), d2.getMonth(), d2.getDate()).getTime();
    if (date1 < date2) return -1;
    if (date1 > date2) return 1;
    return 0;
}

/* ==========================================================================
   GLOBAL POPOVER REGISTRY & MUTUAL EXCLUSION
   ========================================================================== */
const activeControllers = new Set();

function registerController(ctrl) {
    activeControllers.add(ctrl);
}

export function closeAllPopovers(exceptCtrl = null) {
    activeControllers.forEach(ctrl => {
        if (ctrl !== exceptCtrl && ctrl.isOpen) {
            ctrl.close();
        }
    });
    document.querySelectorAll('.rl-calendar-popover, .rl-class-menu').forEach(el => {
        if (!exceptCtrl || !exceptCtrl.boxEl.contains(el)) {
            el.remove();
        }
    });
    document.querySelectorAll('.dock-input-box.is-active, .train-input-group.is-active').forEach(b => {
        if (!exceptCtrl || b !== exceptCtrl.boxEl) {
            b.classList.remove('is-active');
        }
    });

    // Also close third-party panels if any
    const travellersDropdown = document.getElementById('travellersDropdown');
    if (travellersDropdown && (!exceptCtrl || !exceptCtrl.boxEl.contains(travellersDropdown))) {
        travellersDropdown.classList.add('hidden');
    }
    const travellersPanel = document.getElementById('travellers-panel');
    if (travellersPanel && (!exceptCtrl || !exceptCtrl.boxEl.contains(travellersPanel))) {
        travellersPanel.classList.remove('show');
    }
    const guestsPanel = document.getElementById('guests-panel');
    if (guestsPanel && (!exceptCtrl || !exceptCtrl.boxEl.contains(guestsPanel))) {
        guestsPanel.classList.remove('show');
    }
    document.querySelectorAll('.rl-station-dropdown, .airport-dropdown-menu').forEach(el => {
        if (!exceptCtrl || !exceptCtrl.boxEl.contains(el)) {
            el.remove();
        }
    });
}

// Global click-outside listener to close any open popover
document.addEventListener('click', (e) => {
    const insideCalendar = e.target.closest('.rl-calendar-popover');
    const insideClassMenu = e.target.closest('.rl-class-menu');
    const insideActiveBox = e.target.closest('.dock-input-box.is-active, .train-input-group.is-active');

    if (!insideCalendar && !insideClassMenu && !insideActiveBox) {
        closeAllPopovers();
    }
});

/* ==========================================================================
   DATE PICKER CONTROLLER
   ========================================================================== */

class CustomDatePicker {
    constructor(boxEl, options = {}) {
        if (boxEl.__rl_date_ctrl) return boxEl.__rl_date_ctrl;
        boxEl.__rl_date_ctrl = this;

        this.boxEl = boxEl;
        this.options = options;
        this.input = boxEl.querySelector('input[type="date"], input[name*="date" i], input[name*="check" i]');
        if (!this.input) return;

        this.isOpen = false;
        this.today = new Date();
        this.today.setHours(0, 0, 0, 0);

        // Current active view month & year
        this.viewDate = new Date(this.today);
        this.selectedDate = null;
        this.popoverEl = null;

        registerController(this);
        this.init();
    }

    init() {
        // 1. Mark native input as hidden
        this.input.classList.add('rl-native-date-hidden');
        this.input.setAttribute('tabindex', '-1');

        // 2. Build or link display element inside box
        let contentEl = this.boxEl.querySelector('.dock-box-content') || this.boxEl.querySelector('.train-input-text');
        if (!contentEl) {
            contentEl = document.createElement('div');
            contentEl.className = 'dock-box-content';
            this.boxEl.prepend(contentEl);
        }

        let displayWrapper = contentEl.querySelector('.dock-date-display-wrapper');
        if (!displayWrapper) {
            displayWrapper = document.createElement('div');
            displayWrapper.className = 'dock-date-display-wrapper';
            contentEl.appendChild(displayWrapper);
        }

        this.displayEl = displayWrapper.querySelector('.dock-date-display');
        if (!this.displayEl) {
            this.displayEl = document.createElement('div');
            this.displayEl.className = 'dock-date-display';
            displayWrapper.appendChild(this.displayEl);
        }

        // Add or update the end calendar icon
        let iconEnd = this.boxEl.querySelector('.dock-box-icon-end');
        if (!iconEnd) {
            iconEnd = this.boxEl.querySelector('.material-symbols-outlined:not(.dock-box-icon)');
            if (iconEnd) iconEnd.classList.add('dock-box-icon-end');
        }

        // Sync initial date from input
        this.syncFromInput();

        // Intercept input.value changes
        this.observeInputValue();

        // Event listeners
        this.boxEl.addEventListener('click', (e) => {
            if (this.boxEl.classList.contains('is-disabled') || this.input.disabled) {
                return;
            }
            if (this.popoverEl && this.popoverEl.contains(e.target)) {
                return;
            }
            e.stopPropagation();
            this.toggle();
        });

        // Close on window resize or scroll
        window.addEventListener('resize', () => {
            if (this.isOpen) this.updatePosition();
        });

        // Add to global click handler registry
        document.addEventListener('click', (e) => {
            if (this.isOpen && !this.boxEl.contains(e.target) && (!this.popoverEl || !this.popoverEl.contains(e.target))) {
                this.close();
            }
        });

        document.addEventListener('keydown', (e) => {
            if (this.isOpen && e.key === 'Escape') {
                this.close();
            }
        });
    }

    observeInputValue() {
        const input = this.input;
        const self = this;
        let internalVal = input.value;

        // Sync initial
        if (internalVal) {
            const parsed = parseISODate(internalVal);
            if (parsed) {
                this.selectedDate = parsed;
                this.viewDate = new Date(parsed);
                this.updateDisplayText();
            }
        }

        // Override property descriptor to detect programmatic updates
        const descriptor = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value');
        if (descriptor && descriptor.set) {
            Object.defineProperty(input, 'value', {
                get() {
                    return descriptor.get.call(this);
                },
                set(newVal) {
                    descriptor.set.call(this, newVal);
                    self.syncFromInput();
                },
                configurable: true
            });
        }