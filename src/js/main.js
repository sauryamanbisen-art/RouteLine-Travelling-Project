document.addEventListener('DOMContentLoaded', () => {
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
                    <input type="text" name="origin" value="Jawai Bandh (JWB)">
                </div>
            </div>
            
            <div class="swap-icon-container">
                <button type="button" class="swap-btn"><i data-lucide="arrow-left-right" class="icon-sm"></i></button>
            </div>
            
            <div class="input-group">
                <i data-lucide="map-pin" class="input-icon"></i>
                <div class="input-text">
                    <label>To</label>
                    <input type="text" name="destination" value="Bandra Terminus (BDTS)">
                </div>
            </div>
            
            <div class="divider-vertical"></div>
            
            <div class="input-group">
                <i data-lucide="calendar" class="input-icon"></i>
                <div class="input-text">
                    <label>Date</label>
                    <input type="text" name="date" value="Sat, 31 June">
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

    function setPillPosition(btn) {
        activePill.style.width = `${btn.offsetWidth}px`;
        activePill.style.left = `${btn.offsetLeft}px`;
    }

    // Initialize pill position
    const activeBtn = document.querySelector('.mode-btn.active');
    if(activeBtn) {
        // slight timeout to ensure DOM is fully calculated
        setTimeout(() => setPillPosition(activeBtn), 50);
    }

    modeBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            // Update active state
            modeBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            
            // Move the dark pill
            setPillPosition(btn);

            // Update form inputs and action dynamically
            const mode = btn.getAttribute('data-mode');
            dynamicInputs.innerHTML = inputTemplates[mode];
            
            // Set form action based on mode
            let modeSlug = mode.toLowerCase();
            // Convert plural modes to singular for filenames (e.g. Trains -> train)
            if (modeSlug === 'buses') modeSlug = 'bus';
            else if (modeSlug.endsWith('s')) modeSlug = modeSlug.slice(0, -1);
            
            searchForm.action = `${modeSlug}-results.html`;

            // Re-initialize Lucide icons for the newly injected HTML
            lucide.createIcons();
        });
    });

    // Handle Window resize to adjust pill position
    window.addEventListener('resize', () => {
        const activeBtn = document.querySelector('.mode-btn.active');
        if(activeBtn) setPillPosition(activeBtn);
    });
});
