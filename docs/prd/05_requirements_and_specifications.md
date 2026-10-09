# RouteLine — Functional & Non-Functional Requirements

## 1. Functional Requirements (FR)

### 1.1 Multi-Modal Search & Navigation (FR-01)
* **FR-01.1:** The homepage hero MUST support tab switching between **Trains, Flights, Buses, and Hotels** without full-page reloads when navigating within the search widget.
* **FR-01.2:** The active pill indicator MUST calculate bounding box coordinates dynamically and slide smoothly to highlight the selected mode.
* **FR-01.3:** Origin and destination fields MUST support an instant swap button that reverses the departure and arrival terminals with rotational animation.
* **FR-01.4:** Station search MUST provide instantaneous autocomplete matching station codes, city names, and Indian state names with keyboard navigation support.

### 1.2 RailRadar Indian Railways Engine (FR-02)
* **FR-02.1:** The system MUST communicate with RailRadar v1 REST API using Bearer Token authentication.
* **FR-02.2:** To prevent quota exhaustion (rate limited to ~10 req/min), an internal in-memory cache MUST intercept duplicate queries within a 45-second window.
* **FR-02.3:** In the event of network failure or API token exhaustion, graceful fallback mock datasets MUST be supplied to ensure unbroken UI exploration.
* **FR-02.4:** The search result engine MUST compute travel duration, departure time, arrival time, intermediate halts, and class-wise ticket pricing.

### 1.3 PNR Status Tracking & Prediction (FR-03)
* **FR-03.1:** The PNR modal MUST enforce standard 10-digit numeric validation before dispatching requests.
* **FR-03.2:** The status engine MUST parse and display passenger booking status vs. current status (e.g., `WL 42` -> `CNF`).
* **FR-03.3:** The prediction engine MUST calculate confirmation probability percentages and display qualitative risk badges (*"High Chance > 85%"*, *"Moderate"*, *"Low"*).
* **FR-03.4:** The PNR viewer MUST calculate projected cancellation refund values based on travel class and cancellation timing relative to chart preparation.

### 1.4 Metro QR Ticketing Engine (FR-04)
* **FR-04.1:** The Metro module MUST support at least 6 metropolitan networks: Delhi (DMRC), Mumbai (MMRDA/Metro 1 & 3), Bengaluru (Namma Metro), Kolkata Metro, Hyderabad Metro, and Chennai Metro.
* **FR-04.2:** Stations MUST be categorized by operational metro line colors with explicit indicators for interchange junction stations.
* **FR-04.3:** Fare calculations MUST automatically compute based on line-hops and station distances according to official metro fare slabs.
* **FR-04.4:** Upon issuance, an active QR pass MUST display passenger details, boarding station, destination station, issuing timestamp, and a real-time validity countdown timer.

### 1.5 User Authentication & Profile Security (FR-05)
* **FR-05.1:** Users MUST be able to register using Full Name, Email, Mobile Number, and Password.
* **FR-05.2:** Login MUST support both email and phone number authentication with input sanitization.
* **FR-05.3:** Guest users MUST be allowed to explore schedules and availability unimpeded; authentication MUST only be required when proceeding to final payment or accessing personal ticket history.
* **FR-05.4:** Active user sessions MUST be reflected dynamically across all site headers with profile badges, email previews, and logout capabilities.

### 1.6 Checkout, Payment & Ticket Generation (FR-06)
* **FR-06.1:** The payment modal MUST calculate a transparent price breakdown: Base Fare + IRCTC Convenience Fee + GST + Optional Travel Insurance.
* **FR-06.2:** Multiple payment instruments MUST be supported: UPI ID / Virtual Payment Address, Credit/Debit Cards (with Luhn validation), NetBanking bank selectors, and RouteLine Wallet.
* **FR-06.3:** Upon successful payment confirmation, the system MUST:
  1. Generate an authentic 10-digit PNR matching Indian PRS zone prefixes (`2`, `4`, `6`, `8`).
  2. Execute an intelligent seat-allocation algorithm that assigns coach and berth based on class selected (e.g., Coach `B3`, Berth `42`, Lower Berth).
  3. Store the full booking object into `routeline_booked_tickets`.
  4. Automatically transition the user to the Electronic Reservation Slip (ERS) view.

### 1.7 Electronic Reservation Slip (ERS) & Ticket Lifecycle (FR-07)
* **FR-07.1:** The ticket page (`ticket.html`) MUST display all critical booking data: PNR, Booking ID, Train Number, Train Name, Quota, Class, Boarding Station, Destination Station, Passenger Manifest, and Payment Transaction ID.
* **FR-07.2:** The ERS MUST feature print-optimized CSS rules that strip out headers, sidebars, and navigation controls, printing only the official reservation slip.
* **FR-07.3:** Users MUST be able to initiate ticket cancellations directly from their dashboard, triggering refund calculations and updating ticket status to `CANCELLED`.

## 2. Non-Functional Requirements (NFR)

| Category | Requirement Specification |
|:---|:---|
| **Performance** | * Page load time (LCP) under 1.5 seconds on 4G networks.<br>* Autocomplete latency under 50ms.<br>* Zero layout shift (CLS < 0.05) across all viewport transitions. |
| **Security** | * Passwords stored securely (salted hashing when backend lands).<br>* All external API tokens kept server-side or encrypted in environment secrets.<br>* Strict input validation against XSS and injection attacks on search parameters. |
| **Reliability** | * 99.9% uptime target for client-side routing.<br>* Graceful offline mode using Service Worker caching for stored tickets and downloaded passes. |
| **Accessibility (a11y)** | * WCAG 2.1 AA compliance.<br>* Full keyboard accessibility for modal dialogs and dropdown menus.<br>* Explicit `aria-label` attributes on icon-only buttons. |
| **Device Responsiveness** | * Pixel-perfect responsiveness across Mobile (360px–480px), Tablet (768px–1024px), and Desktop (1280px–2560px). |
