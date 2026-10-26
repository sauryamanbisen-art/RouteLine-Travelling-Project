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

        input.addEventListener('change', () => self.syncFromInput());
    }

    syncFromInput() {
        const val = this.input.value;
        if (val) {
            const parsed = parseISODate(val);
            if (parsed) {
                this.selectedDate = parsed;
                this.viewDate = new Date(parsed);
                this.updateDisplayText();
                if (this.isOpen) this.renderCalendar();
                return;
            }
        }
        this.selectedDate = null;
        this.updateDisplayText();
        if (this.isOpen) this.renderCalendar();
    }

    updateDisplayText() {
        if (!this.displayEl) return;
        if (this.selectedDate) {
            this.displayEl.textContent = formatDateToDisplay(this.selectedDate);
            this.displayEl.classList.remove('is-placeholder');
        } else {
            const placeholder = this.input.getAttribute('placeholder') || 'Select Date';
            this.displayEl.textContent = placeholder;
            this.displayEl.classList.add('is-placeholder');
        }
    }

    getMinDate() {
        if (this.options.getMinDate) {
            const dynamicMin = this.options.getMinDate();
            if (dynamicMin) return dynamicMin;
        }
        if (this.input.min) {
            const parsed = parseISODate(this.input.min);
            if (parsed) return parsed;
        }
        return this.today;
    }

    toggle() {
        if (this.isOpen) {
            this.close();
        } else {
            closeAllPopovers(this);
            this.open();
        }
    }

    open() {
        if (this.isOpen) return;
        closeAllPopovers(this);
        this.isOpen = true;
        this.boxEl.classList.add('is-active');

        // Reset view date to selected date or today
        if (this.selectedDate) {
            this.viewDate = new Date(this.selectedDate);
        } else {
            this.viewDate = new Date(this.getMinDate());
        }

        this.renderCalendar();
    }

    close() {
        if (!this.isOpen) return;
        this.isOpen = false;
        this.boxEl.classList.remove('is-active');
        if (this.popoverEl) {
            this.popoverEl.remove();
            this.popoverEl = null;
        }
    }

    updatePosition() {
        if (!this.popoverEl) return;
        const rect = this.boxEl.getBoundingClientRect();
        const popoverWidth = 336;
        const spaceOnRight = window.innerWidth - rect.left;

        if (spaceOnRight < popoverWidth + 16 && rect.right > popoverWidth) {
            this.popoverEl.classList.add('align-right');
        } else {
            this.popoverEl.classList.remove('align-right');
        }
    }

    renderCalendar() {
        if (!this.popoverEl) {
            this.popoverEl = document.createElement('div');
            this.popoverEl.className = 'rl-calendar-popover';
            this.popoverEl.setAttribute('role', 'dialog');
            this.popoverEl.setAttribute('aria-modal', 'true');
            this.popoverEl.setAttribute('aria-label', 'Calendar Date Picker');
            this.popoverEl.addEventListener('click', (e) => e.stopPropagation());
            this.boxEl.appendChild(this.popoverEl);
        }

        this.updatePosition();

        const currentYear = this.viewDate.getFullYear();
        const currentMonth = this.viewDate.getMonth();
        const minDate = this.getMinDate();

        // Check if previous month navigation should be disabled
        const firstDayOfThisMonth = new Date(currentYear, currentMonth, 1);
        const lastDayOfPrevMonth = new Date(currentYear, currentMonth, 0);
        const isPrevDisabled = lastDayOfPrevMonth < minDate;

        // Build HTML
        let html = `
            <div class="rl-cal-header">
                <button type="button" class="rl-cal-nav-btn rl-cal-prev-btn" ${isPrevDisabled ? 'disabled' : ''} aria-label="Previous Month">
                    <span class="material-symbols-outlined">chevron_left</span>
                </button>
                <div class="rl-cal-title">${MONTH_NAMES[currentMonth]} ${currentYear}</div>
                <button type="button" class="rl-cal-nav-btn rl-cal-next-btn" aria-label="Next Month">
                    <span class="material-symbols-outlined">chevron_right</span>
                </button>
            </div>

            <div class="rl-cal-quick-row">
                <button type="button" class="rl-cal-quick-chip" data-quick="today">Today</button>
                <button type="button" class="rl-cal-quick-chip" data-quick="tomorrow">Tomorrow</button>
                <button type="button" class="rl-cal-quick-chip" data-quick="+3">+3 Days</button>
            </div>

            <div class="rl-cal-weekdays">
                ${WEEKDAY_NAMES.map(w => `<div class="rl-cal-weekday">${w}</div>`).join('')}
            </div>

            <div class="rl-cal-grid">
        `;

        // Days calculation
        const startDayIndex = firstDayOfThisMonth.getDay(); // 0 is Sunday
        const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
        const daysInPrevMonth = lastDayOfPrevMonth.getDate();

        // 1. Trailing days from previous month
        for (let i = startDayIndex - 1; i >= 0; i--) {
            const dayNum = daysInPrevMonth - i;
            const dateObj = new Date(currentYear, currentMonth - 1, dayNum);
            const isDisabled = compareDays(dateObj, minDate) < 0;
            html += `
                <button type="button" class="rl-cal-day is-outside ${isDisabled ? 'is-disabled' : ''}" 
                    data-date="${formatDateToISO(dateObj)}" ${isDisabled ? 'disabled' : ''}>
                    ${dayNum}
                </button>
            `;
        }

        // 2. Days in current month
        for (let d = 1; d <= daysInMonth; d++) {
            const dateObj = new Date(currentYear, currentMonth, d);
            const isToday = compareDays(dateObj, this.today) === 0;
            const isSelected = this.selectedDate && compareDays(dateObj, this.selectedDate) === 0;
            const isDisabled = compareDays(dateObj, minDate) < 0;

            let classes = ['rl-cal-day'];
            if (isToday) classes.push('is-today');
            if (isSelected) classes.push('is-selected');
            if (isDisabled) classes.push('is-disabled');

            html += `
                <button type="button" class="${classes.join(' ')}" 
                    data-date="${formatDateToISO(dateObj)}" 
                    ${isDisabled ? 'disabled' : ''} 
                    aria-label="${formatDateToDisplay(dateObj)}">
                    <span>${d}</span>
                    ${isToday ? '<span class="rl-cal-today-dot"></span>' : ''}
                </button>
            `;
        }

        // 3. Leading days for next month to complete standard grid (up to 42 cells)
        const totalRendered = startDayIndex + daysInMonth;
        const remainingCells = (totalRendered <= 35 ? 35 : 42) - totalRendered;
        for (let n = 1; n <= remainingCells; n++) {
            const dateObj = new Date(currentYear, currentMonth + 1, n);
            const isDisabled = compareDays(dateObj, minDate) < 0;
            html += `
                <button type="button" class="rl-cal-day is-outside ${isDisabled ? 'is-disabled' : ''}" 
                    data-date="${formatDateToISO(dateObj)}" ${isDisabled ? 'disabled' : ''}>
                    ${n}
                </button>
            `;
        }

        html += `
            </div>

            <div class="rl-cal-footer">
                <span class="rl-cal-selected-preview">
                    ${this.selectedDate ? `Selected: <strong>${formatDateToDisplay(this.selectedDate)}</strong>` : 'No date selected'}
                </span>
                <button type="button" class="rl-cal-close-btn">Done</button>
            </div>
        `;

        this.popoverEl.innerHTML = html;
        this.attachCalendarEvents();
    }

    attachCalendarEvents() {
        if (!this.popoverEl) return;

        // Prev month
        const prevBtn = this.popoverEl.querySelector('.rl-cal-prev-btn');
        if (prevBtn) {
            prevBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                this.viewDate.setMonth(this.viewDate.getMonth() - 1);
                this.renderCalendar();
            });
        }

        // Next month
        const nextBtn = this.popoverEl.querySelector('.rl-cal-next-btn');
        if (nextBtn) {
            nextBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                this.viewDate.setMonth(this.viewDate.getMonth() + 1);
                this.renderCalendar();
            });
        }

        // Quick pills
        this.popoverEl.querySelectorAll('.rl-cal-quick-chip').forEach(chip => {
            chip.addEventListener('click', (e) => {
                e.stopPropagation();
                const type = chip.getAttribute('data-quick');
                const target = new Date(this.today);
                if (type === 'tomorrow') {
                    target.setDate(target.getDate() + 1);
                } else if (type === '+3') {
                    target.setDate(target.getDate() + 3);
                }
                this.selectDate(target);
            });
        });

        // Day click
        this.popoverEl.querySelectorAll('.rl-cal-day:not(.is-disabled)').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const iso = btn.getAttribute('data-date');
                const parsed = parseISODate(iso);
                if (parsed) {
                    this.selectDate(parsed);
                }
            });
        });

        // Done button
        const closeBtn = this.popoverEl.querySelector('.rl-cal-close-btn');
        if (closeBtn) {
            closeBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                this.close();
            });
        }
    }

    selectDate(dateObj) {
        this.selectedDate = new Date(dateObj);
        const iso = formatDateToISO(this.selectedDate);

        // Update underlying input
        this.input.value = iso;
        this.updateDisplayText();

        // Dispatch events
        this.input.dispatchEvent(new Event('input', { bubbles: true }));
        this.input.dispatchEvent(new Event('change', { bubbles: true }));

        if (this.options.onSelect) {
            this.options.onSelect(this.selectedDate, iso);
        }

        this.close();
    }
}

/* ==========================================================================
   CLASS SELECTOR CONTROLLER & MODE CONFIGURATIONS
   ========================================================================== */

export const MODE_CLASS_CONFIGS = {
    train: {
        label: 'Class & Quota',
        headerTitle: 'Select Travel Class',
        defaultVal: '3A',
        options: [
            {
                value: '3A',
                title: '3rd AC (3A)',
                subtitle: 'AC 3 Tier · Popular Choice',
                icon: 'airline_seat_recline_extra'
            },
            {
                value: '2A',
                title: '2nd AC (2A)',
                subtitle: 'AC 2 Tier · High Comfort',
                icon: 'airline_seat_recline_extra'
            },
            {
                value: '1A',
                title: '1st AC (1A)',
                subtitle: 'Executive AC · Maximum Luxury',
                icon: 'hotel_class'
            },
            {
                value: 'Sleeper',
                title: 'Sleeper (SL)',
                subtitle: 'Non-AC Sleeper · Budget Friendly',
                icon: 'bed'
            },
            {
                value: 'All',
                title: 'All Classes',
                subtitle: 'View all train classes',
                icon: 'layers'
            }
        ]
    },
    flight: {
        label: 'Cabin Class',
        headerTitle: 'Select Cabin Class',
        defaultVal: 'Economy',
        options: [
            {
                value: 'Economy',
                title: 'Economy Class',
                subtitle: 'Standard Seating · Best Value',
                icon: 'airline_seat_recline_normal'
            },
            {
                value: 'Premium Economy',
                title: 'Premium Economy',
                subtitle: 'Extra Legroom · Priority Boarding',
                icon: 'airline_seat_recline_extra'
            },
            {
                value: 'Business',
                title: 'Business Class',
                subtitle: 'Priority Service & Flatbed Seats',
                icon: 'airline_seat_individual_suite'
            },
            {
                value: 'First Class',
                title: 'First Class',
                subtitle: 'Private Suite · Ultimate Luxury',
                icon: 'hotel_class'
            }
        ]
    },
    bus: {
        label: 'Bus Type & Class',
        headerTitle: 'Select Bus Type',
        defaultVal: 'All',
        options: [
            {
                value: 'All',
                title: 'All Bus Types',
                subtitle: 'AC & Non-AC Luxury Coaches',
                icon: 'directions_bus'
            },
            {
                value: 'AC Sleeper',
                title: 'AC Sleeper (2+1)',
                subtitle: 'Lie-Flat Berths · Maximum Comfort',
                icon: 'bed'
            },
            {
                value: 'AC Seater',
                title: 'AC Seater (2+2)',
                subtitle: 'Pushback Recliner Seats',
                icon: 'airline_seat_recline_extra'
            },
            {
                value: 'Volvo',
                title: 'Volvo Multi-Axle',
                subtitle: 'Ultra-Smooth Air Suspension',
                icon: 'airport_shuttle'
            },
            {
                value: 'Non-AC Sleeper',
                title: 'Non-AC Sleeper',
                subtitle: 'Budget-Friendly Lie-Flat Berths',
                icon: 'bed'
            }
        ]
    },
    hotel: {
        label: 'Room Category',
        headerTitle: 'Select Room Category',
        defaultVal: 'Deluxe',
        options: [
            {
                value: 'Deluxe',
                title: 'Deluxe Room',
                subtitle: 'Standard King / Twin · Best Value',
                icon: 'hotel'
            },
            {
                value: 'Suite',
                title: 'Executive Suite',
                subtitle: 'Spacious Suite with City View',
                icon: 'apartment'
            },
            {
                value: 'Villa',
                title: 'Luxury Villa / Penthouse',
                subtitle: 'Private Balcony & Premium Amenities',
                icon: 'villa'
            },
            {
                value: 'Resort',
                title: '5-Star Resort Stay',
                subtitle: 'All-Inclusive Breakfast & Pool',
                icon: 'pool'
            },
            {
                value: 'Budget',
                title: 'Comfort Budget Stay',
                subtitle: 'Essential, Clean & Pocket-Friendly',
                icon: 'bed'
            }
        ]
    }
};

export function detectMode(boxEl) {
    if (boxEl) {
        const explicit = boxEl.getAttribute('data-mode') || boxEl.closest('[data-mode]')?.getAttribute('data-mode');
        if (explicit && MODE_CLASS_CONFIGS[explicit]) return explicit;
    }
    const path = window.location.pathname.toLowerCase();
    if (path.includes('flight')) return 'flight';
    if (path.includes('bus')) return 'bus';
    if (path.includes('hotel')) return 'hotel';
    if (path.includes('train')) return 'train';
    
    // Check active button in mode switcher
    const activeBtn = document.querySelector('.dock-mode-btn.active');
    if (activeBtn) {
        const text = activeBtn.textContent.toLowerCase();
        if (text.includes('flight')) return 'flight';
        if (text.includes('bus')) return 'bus';
        if (text.includes('hotel')) return 'hotel';
        if (text.includes('train')) return 'train';
    }
    return 'train';
}

export class CustomClassSelector {
    constructor(triggerBox) {
        if (triggerBox.__rl_class_ctrl) return triggerBox.__rl_class_ctrl;
        triggerBox.__rl_class_ctrl = this;

        this.boxEl = triggerBox;
        this.mode = detectMode(triggerBox);
        this.modeConfig = MODE_CLASS_CONFIGS[this.mode] || MODE_CLASS_CONFIGS.train;

        this.selectEl = triggerBox.querySelector('select[name="class"], select[name="cabin"], select[name="busType"], select[name="roomType"]');
        
        // If no select element exists, build one automatically
        if (!this.selectEl) {
            this.selectEl = document.createElement('select');
            this.selectEl.name = 'class';
            this.selectEl.style.display = 'none';
            this.modeConfig.options.forEach((opt, idx) => {
                const o = document.createElement('option');
                o.value = opt.value;
                o.textContent = opt.title;
                if (opt.value === this.modeConfig.defaultVal || idx === 0) o.selected = true;
                this.selectEl.appendChild(o);
            });
            this.boxEl.appendChild(this.selectEl);
        }

        this.isOpen = false;
        this.menuEl = null;

        registerController(this);
        this.init();
    }

    init() {
        this.boxEl.classList.add('class-selector-box');

        // Hide raw select
        this.selectEl.style.display = 'none';

        // Update label text if present
        const labelEl = this.boxEl.querySelector('.dock-box-label');
        if (labelEl && (!labelEl.textContent.trim() || labelEl.textContent.includes('Class') || labelEl.textContent.includes('Category') || labelEl.textContent.includes('Type') || labelEl.textContent.includes('Rooms') || labelEl.textContent.includes('Passengers'))) {
            labelEl.textContent = this.modeConfig.label;
        }

        // Add or ensure display element
        let contentEl = this.boxEl.querySelector('.dock-box-content') || this.boxEl.querySelector('.train-input-text');
        if (!contentEl) {
            contentEl = document.createElement('div');
            contentEl.className = 'dock-box-content';
            this.boxEl.prepend(contentEl);
        }

        let displayWrapper = contentEl.querySelector('.dock-class-display-wrapper');
        if (!displayWrapper) {
            displayWrapper = document.createElement('div');
            displayWrapper.className = 'dock-class-display-wrapper';
            contentEl.appendChild(displayWrapper);
        }

        this.displayEl = displayWrapper.querySelector('.dock-class-display');
        if (!this.displayEl) {
            this.displayEl = document.createElement('div');
            this.displayEl.className = 'dock-class-display';
            displayWrapper.appendChild(this.displayEl);
        }

        // Chevron icon
        let chevron = this.boxEl.querySelector('.rl-dropdown-chevron');
        if (!chevron) {
            chevron = this.boxEl.querySelector('.material-symbols-outlined');
            if (chevron) {
                chevron.classList.add('rl-dropdown-chevron');
            } else {
                chevron = document.createElement('span');
                chevron.className = 'material-symbols-outlined rl-dropdown-chevron';
                chevron.textContent = 'expand_more';
                this.boxEl.appendChild(chevron);
            }
        }

        // Sync initial text from current select value
        this.syncFromSelect();

        // Listen for external changes to select
        this.selectEl.addEventListener('change', () => this.syncFromSelect());

        // Toggle on box click
        this.boxEl.addEventListener('click', (e) => {
            if (this.menuEl && this.menuEl.contains(e.target)) return;
            e.stopPropagation();
            this.toggle();
        });

        // Close on Escape
        document.addEventListener('keydown', (e) => {
            if (this.isOpen && e.key === 'Escape') {
                this.close();
            }
        });
    }

    syncFromSelect() {
        const val = this.selectEl.value;
        const allOptions = [
            ...(this.modeConfig.options || []),
            ...Object.values(MODE_CLASS_CONFIGS).flatMap(c => c.options)
        ];
        const matched = allOptions.find(c => c.value === val);
        if (matched) {
            this.displayEl.textContent = matched.title;
        } else {
            const selectedOpt = this.selectEl.options[this.selectEl.selectedIndex];
            this.displayEl.textContent = selectedOpt ? selectedOpt.textContent : val;
        }
        if (this.isOpen) this.renderMenu();
    }

    toggle() {
        if (this.isOpen) {
            this.close();
        } else {
            closeAllPopovers(this);
            this.open();
        }
    }

    open() {
        if (this.isOpen) return;
        closeAllPopovers(this);
        this.isOpen = true;
        this.boxEl.classList.add('is-active');
        this.renderMenu();
    }

    close() {
        if (!this.isOpen) return;
        this.isOpen = false;