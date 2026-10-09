# Product Requirement Document (PRD)
# RouteLine — Unified Travel Tracking & Multi-Modal Booking Platform

---

| **Document Attribute** | **Specification** |
|:---|:---|
| **Project Title** | RouteLine (Unified Travel Tracking & Multi-Modal Mobility Platform) |
| **Document Version** | 1.0.0 (Production Blueprint & Audit) |
| **Status** | Active / In Development (Phase 4: Route Intelligence & Spatial Tracking) |
| **Author / Product Lead** | Sauryaman Bisen & RouteLine Core Engineering Team |
| **Target Audience** | Engineering, Product, UI/UX Design, DevOps, Executive Stakeholders |
| **Last Updated** | October 2026 |
| **Repository** | `sauryamanbisen-art/RouteLine-Travelling-Project` |

---

## 1. Executive Summary & Product Vision

### 1.1 Executive Summary
**RouteLine** is a modern, unified multi-modal travel platform engineered to eliminate the fragmentation of modern passenger transit. Current travel ecosystems force travelers to juggle disparate applications: IRCTC for train bookings, airline aggregators (MakeMyTrip, EaseMyTrip) for flights, regional state transport or private bus portals (redBus), local urban metro apps, and ride-hailing platforms (Uber, Ola). 

RouteLine bridges this divide by delivering an **all-in-one booking portal and real-time spatial travel diary**. It unifies cross-country rail, commercial aviation, intercity buses, urban rapid transit (Metro QR ticketing), station transfers, and on-berth dining into a cohesive, high-performance web experience backed by live transit telemetry.

```
+-----------------------------------------------------------------------------+
|                                ROUTELINE                                    |
|                      The Unified Mobility Platform                          |
+-----------------------------------------------------------------------------+
       |                      |                       |               |
       v                      v                       v               v
 [ Indian Railways ]     [ Flights ]             [ Buses ]       [ Metro QR ]
  - RailRadar API         - Low-fare matrix       - Intercity     - Multi-city
  - Live GPS tracking     - Seat selection        - Operators     - Auto fare
  - PNR predictions       - WebGL visualizer      - AC/Sleeper    - Active pass
       |                      |                       |               |
       +----------------------+-----------------------+---------------+
                                      |
                                      v
                      [ Unified Checkout & Payment ]
                       - UPI / Cards / NetBanking / Wallet
                       - Auto PNR & Seat Allocation
                                      |
                                      v
                      [ "My Paths" Spatial Dashboard ]
                       - End-to-end trip journey timeline
                       - ERS generation, live alerts & PDF
```

### 1.2 The North Star Goal (Final Vision)
The ultimate goal of RouteLine is to become **India’s first Intelligent Multi-Leg Door-to-Door Mobility Operating System**:
1. **Zero-Friction Multi-Modal Routing:** A user can query a journey like *"Indore to Manali"* or *"Pune to Kedarnath"*, and RouteLine automatically constructs an optimized, multi-leg itinerary combining Vande Bharat / Superfast Express trains, local metro connections, and connecting Volvo buses with synchronized layover margins.
2. **Unified Travel Path & Spatial Diary ("My Paths"):** An interactive GIS map canvas where all past, active, and upcoming journeys across all transit modes are rendered chronologically with live GPS waypoints, weather layers, delay projections, and exportable memories.
3. **End-to-End Travel Continuity:** Integrated auxiliary services that trigger contextually—ordering food to your specific coach/berth, pre-scheduling an EV station taxi synchronized to actual train arrival times (even if delayed), and auto-issuing contactless metro QR passes.

---

## 2. Problem Statement & Target Personas

### 2.1 The Core Problems
* **App Fatigue & Siloed Records:** Commuters use 4–6 different apps per journey. Booking confirmation emails, PNR numbers, flight tickets, and metro tokens are scattered across SMS, email, and disparate dashboards.
* **Lack of Predictive Travel Context:** Standard railway portals do not offer clear, probabilistic waitlist confirmation models, live rake/coach layout diagrams, or real-time platform tracking before arriving at stations.
* **Disconnected Urban First/Last Mile Transit:** High-speed rail journeys suffer friction at origin and destination due to separate ticketing queues for city metros, station autos, and cabs.
* **Cluttered, Legacy User Interfaces:** Existing government and budget portals suffer from ad clutter, sluggish page performance, and outdated design systems.

### 2.2 Target User Personas

| Persona | Archetype | Needs & Pain Points | RouteLine Value Proposition |
|:---|:---|:---|:---|
| **Vikram (28)** | *Tech Professional & Frequent Commuter* | Commutes weekly between Delhi and regional hubs. Values speed, clean interfaces, instant PNR lookup, and metro QR access. | Sub-second live train tracking, instant metro pass generation, sleek dark-mode UI. |
| **Priya (34)** | *Family & Vacation Planner* | Coordinates multi-city family trips combining flights, hotel stays, and regional rail legs. Needs clear fare breakdowns and seat layout previews. | Multi-modal search tabs, coach position visualizer, transparent pricing, unified ticket drawer. |
| **Rohit (22)** | *Student & Budget Traveler* | Looking for cheapest available seats across trains and sleeper buses; needs waitlist confirmation predictions before paying. | Real-time seat vacancy matrix, 6-day trend forecasts, PNR confirmation probabilities. |

---

## 3. What Has Been Done As of Now (Current Implementation Audit)

RouteLine has evolved rapidly from early static wireframes into a feature-rich, high-performance multi-page application (MPA) with production-ready modules, live REST API integrations, and robust state management.

### 3.1 Architecture & Design System
* **Unified Visual Identity:** Implemented a futuristic dark-theme design system featuring deep navy backgrounds (`#0a1128`, `#060b18`), royal blue tech gradients (`#2563eb` to `#3b82f6`), glowing state tokens, and glassmorphic elevated panels (`backdrop-filter: blur(12px)`).
* **Multi-Page App (MPA) Architecture:** Modularized into 12 dedicated HTML endpoints bundled via **Vite 8.x** with custom Rollup entrypoints (`vite.config.js`).
* **Modular CSS Architecture:** Refactored bloated monolithic stylesheets into 13 discrete namespaces (`src/css/global/`, `home/`, `train/`, `flight/`, `bus/`, `hotel/`, `metro/`, `ticket/`, `auth/`, `food/`, `booking/`, `insurance/`).
* **Iconography & Typography:** Standardized on Google Inter font and vector Lucide icons for maximum crispness and zero visual layout shifts.

### 3.2 Implemented Modules & Capabilities

```
+----------------------------------------------------------------------------------------+
|                             COMPLETED FEATURE INVENTORY                                |
+--------------------------+-------------------------------------------------------------+
| Feature Domain           | Implemented Functionality & Key Files                       |
+--------------------------+-------------------------------------------------------------+
| Homepage & Hero Search   | * Dynamic 4-mode switcher (Trains, Flights, Buses, Hotels)  |
| (index.html)             | * Sliding active indicator pill with smooth easing          |
|                          | * Real-time station autocomplete (40+ major Indian stations)|
|                          | * Datepickers with automated +3 day default offsets         |
|                          | * 8-item Quick Service grid with deep links & action modals |
|                          | * Popular destinations & dynamic offer carousels            |
+--------------------------+-------------------------------------------------------------+
| RailRadar API Client     | * Full client wrapper (`src/js/train/railradar.js`)         |
| (Live Railways Engine)   | * Bearer Token authentication (`https://api.railradar.in/v1`)|
|                          | * 45-second in-memory response cache to respect rate limits  |
|                          | * 11 API endpoints implemented: Train Schedule, Live GPS,   |
|                          |   GIS Geometry, Coach Layouts, Station Coach Positions,     |
|                          |   Seat Availability, Fares, Trains Between, PNR Status,     |
|                          |   PNR Prediction, and Refund Calculations                   |
+--------------------------+-------------------------------------------------------------+
| Train Search & Results   | * Interactive search and filtering (`train-results.html`)    |
| (train.js)               | * Real-time station code resolver (e.g., NDLS -> CAPE)     |
|                          | * Class-specific availability chips (1A, 2A, 3A, SL, CC)    |
|                          | * Sliding booking drawer with passenger detail capture      |
|                          | * Sorting by departure, duration, and fare                  |
+--------------------------+-------------------------------------------------------------+
| Live Train Timetable     | * Dedicated portal (`train-schedule.html`, `train-schedule.js`)|
| & Route Geometry         | * Route halt timeline with arrival/departure & halt timings |
|                          | * Platform number indicators and distance milestones        |
|                          | * Interactive coach position and rake visualizer            |
+--------------------------+-------------------------------------------------------------+
| Seat Availability Engine | * Multi-day vacancy calendar matrix (`seat-availability.html`)|
|                          | * Historical confirmation likelihood & quota selectors      |
+--------------------------+-------------------------------------------------------------+
| PNR Intelligence & Modal | * Floating 10-digit PNR validator modal (`pnr-status.js`)   |
|                          | * Zone prefix parsing (PRS Northern, Western, Southern)    |
|                          | * Real-time confirmation likelihood & refund estimators     |
+--------------------------+-------------------------------------------------------------+
| Metro QR Ticketing Pass  | * Multi-city metro engine (`metro-ticket.html`, `metro.js`) |
|                          | * Delhi (DMRC), Mumbai (MMRDA), Bengaluru, Kolkata,         |
|                          |   Hyderabad, and Chennai networks                           |
|                          | * Automated fare calculation by station count & line hops   |
|                          | * Dynamic animated QR token with validity countdown timer   |
+--------------------------+-------------------------------------------------------------+
| Central Authentication   | * RouteLine Secure Pass modal (`auth.js`, `login.js`, etc.) |
|                          | * Email & password validation, toggle visibility, guest mode|
|                          | * Persistent local session state (`routeline_auth_user`)    |
|                          | * Protected booking checkout triggers                       |
+--------------------------+-------------------------------------------------------------+
| Payment & Checkout       | * 256-bit SSL simulated checkout gateway (`payment.js`)     |
| Gateway Simulator        | * Supports UPI (GPay/PhonePe), Cards, NetBanking, Wallet    |
|                          | * Realistic Indian Railways 10-digit PNR generator          |
|                          | * Automatic coach & berth allocation algorithm              |
|                          | * Direct persistence to Booked Tickets storage              |
+--------------------------+-------------------------------------------------------------+
| Electronic Reservation   | * Official IRCTC-compliant ERS view (`ticket.html`)         |
| Slip (ERS) & Dashboard   | * Scannable barcode, passenger manifest & fare breakdown    |
|                          | * One-click browser print / PDF download formatting         |
|                          | * Interactive cancellation flow with refund calculations    |
|                          | * Historical booked ticket list sidebar                     |
+--------------------------+-------------------------------------------------------------+
| Visual Innovation        | * WebGL custom cloud shader background for flights          |
| & Partner Portals        | * Uber station cab redirect bridge (`cabs.html`)            |
|                          | * Zoop India train-seat food delivery bridge (`order-food.html`)|
|                          | * Stubs for Group Booking & Travel Insurance                |
+--------------------------+-------------------------------------------------------------+
```

---

## 4. Current Phase: Where We Are Right Now

RouteLine is executing against a 5-phase progressive delivery plan.

```
PHASE 1: Foundations & Architecture       [====================] 100% COMPLETE
PHASE 2: Core Front-End & Widgets         [====================] 100% COMPLETE
PHASE 3: Live RailRadar API & PRS Engine  [=================== ]  95% COMPLETE
PHASE 4: Route Intelligence & "My Paths"  [========            ]  40% IN PROGRESS (CURRENT)
PHASE 5: Backend Services & Production    [==                  ]  10% PLANNED
```

### Current Status: **Phase 4 (Route Intelligence & Spatial Path Tracking)**

#### What is working today:
1. **End-to-End User Flow:** Users can open the homepage, search trains between real stations, view real Indian Railways schedules and live statuses via RailRadar, open the booking drawer, authenticate or continue as guest, complete simulated checkout, generate an authentic PNR, view/print their official ERS ticket, and check PNR status anytime.
2. **Metro System:** Commuters can book tickets across 6 major Indian metro systems and get an active, animated QR pass.
3. **Data Storage:** Fully functional browser-level state engine persisting users, auth tokens, session preferences, and booked ticket history in `localStorage`.

#### What is in progress in this phase:
1. **Interactive Spatial Map ("My Paths"):** Implementing Mapbox GL / Leaflet map visualization to render full GPS rail tracks (using the GIS GeoJSON returned by RailRadar's `/trains/:no/route/geometry` endpoint).
2. **Multi-Leg Unified Timeline:** Connecting a booked train leg with a connecting metro leg and station cab transfer into a single scrollable itinerary.
3. **Flight & Bus Results Real-Time Data:** Transitioning flight and bus results from mock search layouts to live API feeds (Skyscanner/Amadeus sandboxes and redBus aggregator APIs).

---

## 5. Technical Architecture & Tech Stack

```
+-------------------------------------------------------------------------------+
|                             ROUTELINE TECH STACK                              |
+-------------------------------------------------------------------------------+
|  LAYER           |  TECHNOLOGY              |  PURPOSE / DETAILS              |
+------------------+--------------------------+---------------------------------+
|  Core Front-End  |  HTML5 (Semantic)        |  Clean, SEO-optimized markup    |
|                  |  Vanilla JavaScript ES6+ |  Zero-overhead modular logic    |
|                  |  Vanilla CSS3 (BEM)      |  Custom variables, zero bloat   |
|                  |  WebGL Canvas Shader     |  Dynamic atmospheric flight sky |
+------------------+--------------------------+---------------------------------+
|  Tooling & Build |  Vite 8.2.0              |  Lightning fast HMR & bundling  |
|                  |  Rollup                  |  Multi-page HTML entry routing  |
|                  |  Oxlint 1.75.0           |  High-performance code linting  |
|                  |  Node.js (v20+ LTS)      |  Local development runtime      |
+------------------+--------------------------+---------------------------------+
|  UI & Design     |  Lucide Icons (CDN & npm)|  Crisp scalable vector icons    |
|                  |  Google Fonts (Inter)    |  Modern typography standard     |
|                  |  Custom Glassmorphism    |  Backdrop-filter translucent UI |
+------------------+--------------------------+---------------------------------+
|  External APIs   |  RailRadar v1 REST API   |  Live Indian Railways PRS,      |
|                  |                          |  timetables, PNR, GPS tracking  |
|                  |  Zoop India API / Bridge |  Food delivery to train berth   |
|                  |  Uber API / Bridge       |  First/last-mile station cabs   |
+------------------+--------------------------+---------------------------------+
|  State & Storage |  Browser LocalStorage    |  User profile, ticket records   |
|                  |  SessionStorage          |  Temporary prompts, modal state |
|                  |  In-Memory API Cache     |  45s TTL request throttling     |
+------------------+--------------------------+---------------------------------+
|  DevOps & Infra  |  Docker                  |  Containerized runtime build    |
|                  |  Docker Compose          |  Local multi-container dev      |
|                  |  GitHub Actions / Pages  |  CI/CD automation & preview     |
+------------------+--------------------------+---------------------------------+
|  Target Backend  |  Node.js / Express       |  Authentication & DB API        |
|  (Phase 5)       |  PostgreSQL / Supabase   |  Relational user & ticket DB    |
|                  |  Redis                   |  Live transit cache & rate limit|
|                  |  Mapbox GL JS / Leaflet  |  Spatial route rendering        |
+------------------+--------------------------+---------------------------------+
```

---

## 6. Functional Requirements & Feature Specifications

### 6.1 Multi-Modal Search & Navigation (FR-01)
* **FR-01.1:** The homepage hero MUST support tab switching between **Trains, Flights, Buses, and Hotels** without full-page reloads when navigating within the search widget.
* **FR-01.2:** The active pill indicator MUST calculate bounding box coordinates dynamically and slide smoothly to highlight the selected mode.
* **FR-01.3:** Origin and destination fields MUST support an instant swap button that reverses the departure and arrival terminals with rotational animation.
* **FR-01.4:** Station search MUST provide instantaneous autocomplete matching station codes, city names, and Indian state names with keyboard navigation support.

### 6.2 RailRadar Indian Railways Engine (FR-02)
* **FR-02.1:** The system MUST communicate with RailRadar v1 REST API using Bearer Token authentication.
* **FR-02.2:** To prevent quota exhaustion (rate limited to ~10 req/min), an internal in-memory cache MUST intercept duplicate queries within a 45-second window.
* **FR-02.3:** In the event of network failure or API token exhaustion, graceful fallback mock datasets MUST be supplied to ensure unbroken UI exploration.
* **FR-02.4:** The search result engine MUST compute travel duration, departure time, arrival time, intermediate halts, and class-wise ticket pricing.

### 6.3 PNR Status Tracking & Prediction (FR-03)
* **FR-03.1:** The PNR modal MUST enforce standard 10-digit numeric validation before dispatching requests.
* **FR-03.2:** The status engine MUST parse and display passenger booking status vs. current status (e.g., `WL 42` -> `CNF`).
* **FR-03.3:** The prediction engine MUST calculate confirmation probability percentages and display qualitative risk badges (*"High Chance > 85%"*, *"Moderate"*, *"Low"*).
* **FR-03.4:** The PNR viewer MUST calculate projected cancellation refund values based on travel class and cancellation timing relative to chart preparation.

### 6.4 Metro QR Ticketing Engine (FR-04)
* **FR-04.1:** The Metro module MUST support at least 6 metropolitan networks: Delhi (DMRC), Mumbai (MMRDA/Metro 1 & 3), Bengaluru (Namma Metro), Kolkata Metro, Hyderabad Metro, and Chennai Metro.
* **FR-04.2:** Stations MUST be categorized by operational metro line colors with explicit indicators for interchange junction stations.
* **FR-04.3:** Fare calculations MUST automatically compute based on line-hops and station distances according to official metro fare slabs.
* **FR-04.4:** Upon issuance, an active QR pass MUST display passenger details, boarding station, destination station, issuing timestamp, and a real-time validity countdown timer.

### 6.5 User Authentication & Profile Security (FR-05)
* **FR-05.1:** Users MUST be able to register using Full Name, Email, Mobile Number, and Password.
* **FR-05.2:** Login MUST support both email and phone number authentication with input sanitization.
* **FR-05.3:** Guest users MUST be allowed to explore schedules and availability unimpeded; authentication MUST only be required when proceeding to final payment or accessing personal ticket history.
* **FR-05.4:** Active user sessions MUST be reflected dynamically across all site headers with profile badges, email previews, and logout capabilities.

### 6.6 Checkout, Payment & Ticket Generation (FR-06)
* **FR-06.1:** The payment modal MUST calculate a transparent price breakdown: Base Fare + IRCTC Convenience Fee + GST + Optional Travel Insurance.
* **FR-06.2:** Multiple payment instruments MUST be supported: UPI ID / Virtual Payment Address, Credit/Debit Cards (with Luhn validation), NetBanking bank selectors, and RouteLine Wallet.
* **FR-06.3:** Upon successful payment confirmation, the system MUST:
  1. Generate an authentic 10-digit PNR matching Indian PRS zone prefixes (`2`, `4`, `6`, `8`).
  2. Execute an intelligent seat-allocation algorithm that assigns coach and berth based on class selected (e.g., Coach `B3`, Berth `42`, Lower Berth).
  3. Store the full booking object into `routeline_booked_tickets`.
  4. Automatically transition the user to the Electronic Reservation Slip (ERS) view.

### 6.7 Electronic Reservation Slip (ERS) & Ticket Lifecycle (FR-07)
* **FR-07.1:** The ticket page (`ticket.html`) MUST display all critical booking data: PNR, Booking ID, Train Number, Train Name, Quota, Class, Boarding Station, Destination Station, Passenger Manifest, and Payment Transaction ID.
* **FR-07.2:** The ERS MUST feature print-optimized CSS rules that strip out headers, sidebars, and navigation controls, printing only the official reservation slip.
* **FR-07.3:** Users MUST be able to initiate ticket cancellations directly from their dashboard, triggering refund calculations and updating ticket status to `CANCELLED`.

---

## 7. Non-Functional Requirements (NFR)

| Category | Requirement Specification |
|:---|:---|
| **Performance** | * Page load time (LCP) under 1.5 seconds on 4G networks.<br>* Autocomplete latency under 50ms.<br>* Zero layout shift (CLS < 0.05) across all viewport transitions. |
| **Security** | * Passwords stored securely (salted hashing when backend lands).<br>* All external API tokens kept server-side or encrypted in environment secrets.<br>* Strict input validation against XSS and injection attacks on search parameters. |
| **Reliability** | * 99.9% uptime target for client-side routing.<br>* Graceful offline mode using Service Worker caching for stored tickets and downloaded passes. |
| **Accessibility (a11y)** | * WCAG 2.1 AA compliance.<br>* Full keyboard accessibility for modal dialogs and dropdown menus.<br>* Explicit `aria-label` attributes on icon-only buttons. |
| **Device Responsiveness** | * Pixel-perfect responsiveness across Mobile (360px–480px), Tablet (768px–1024px), and Desktop (1280px–2560px). |

---

## 8. Final Goal & The RouteLine 2.0 Roadmap

The ultimate goal of RouteLine is to evolve from a frontend-heavy travel portal into an enterprise-grade transit operating system.

```
+-----------------------------------------------------------------------------+
|                          ROUTELINE FINAL ROADMAP                            |
+-----------------------------------------------------------------------------+
| Phase 4 (Current)   | Spatial "My Paths" GIS Map & Multi-Leg Travel Timeline|
+---------------------+-------------------------------------------------------+
| Phase 5 (Next Up)   | Production Node.js Backend, Supabase DB & Live Razorpay|
+---------------------+-------------------------------------------------------+
| Phase 6             | Flights & Bus Live GDS APIs + AI Itinerary Planner    |
+---------------------+-------------------------------------------------------+
| Phase 7             | Native Mobile Apps (React Native / iOS & Android)     |
+---------------------+-------------------------------------------------------+
```

### 8.1 The "My Paths" Interactive Travel Timeline (Phase 4 Milestone)
The centerpiece of RouteLine's final vision is the **Unified Travel Path Dashboard**:
* **Interactive GIS Map:** Utilizing Mapbox GL or Leaflet to draw connecting vector paths across the country representing past trips, active journeys, and future bookings.
* **Multi-Modal Leg Chaining:** Displaying a complete journey from start to finish:
  $$\text{Home} \xrightarrow{\text{Uber}} \text{Station} \xrightarrow{\text{Train}} \text{Metro Station} \xrightarrow{\text{Metro}} \text{Airport} \xrightarrow{\text{Flight}} \text{Destination}$$
* **Live GPS Headway:** Real-time pulse icon indicating exactly where the train or flight is along the polyline track.

### 8.2 Production Backend & Enterprise Integrations (Phase 5)
* **Microservices Architecture:** Transitioning from client-side simulated payments to an authenticated backend:
  * `auth-service`: JWT tokens, OAuth2 (Google, Apple Sign-in), SMS OTP via Twilio/Fast2SMS.
  * `booking-service`: Transactional state machine, seat locking, PostgreSQL relational store.
  * `payment-service`: Real-time Razorpay / Cashfree / Stripe webhooks with cryptographic signature verification.
  * `notification-service`: Automated WhatsApp and SMS delivery of tickets and delay alerts.

### 8.3 RouteLine Copilot: AI Transit Assistant (Phase 6)
* An embedded GenAI assistant capable of understanding conversational queries:
  * *"Find me the fastest way from Delhi to Dharamshala leaving this Friday after 6 PM under ₹2,000."*
  * *"My connecting train 12919 is delayed by 80 minutes. Will I miss my flight 6E-204 from Mumbai? Re-route me if necessary."*

---

## 9. Gap Analysis & Next Actionable Sprints

To bridge the current state with the final goal, the following immediate sprints are planned:

```
[Current State]                                                [Production Goal]
Client-side MPA with LocalStorage  ====> SPRINT 1-5 ====>  Full-Stack Cloud Platform
Simulated Payment Gateway          ====> SPRINT 1-5 ====>  Live Razorpay / UPI Integration
RailRadar Live Train Data          ====> SPRINT 1-5 ====>  Multi-Modal Live GDS Engines
Static Partner Redirects           ====> SPRINT 1-5 ====>  Embedded Native Services
```

### Sprint Breakdown:
1. **Sprint 4.1 — Spatial Map Integration ("My Paths" Canvas):**
   * Integrate Leaflet/Mapbox in a dedicated view (`my-paths.html`).
   * Ingest RailRadar route geometry GeoJSON to render true railway tracks.
   * Plot active booked tickets from `routeline_booked_tickets` as active lines.
2. **Sprint 4.2 — Flight & Bus Real-Time Integration:**
   * Replace static flight and bus cards with dynamic data models.
   * Add seat picker UI for intercity buses (sleeper lower/upper berth selector).
3. **Sprint 5.1 — Node.js & Database Backend:**
   * Build Express.js REST API with PostgreSQL database schema (`users`, `bookings`, `tickets`, `stations`).
   * Migrate authentication to secure HTTP-only JWT cookies.
4. **Sprint 5.2 — Live Payment Webhooks:**
   * Integrate Razorpay Checkout SDK for live UPI and Card payments.
   * Automate refund ledger for cancelled reservations.
5. **Sprint 5.3 — Progressive Web App (PWA) & Offline Mode:**
   * Implement Service Worker with Cache-First strategy for downloaded ERS tickets and offline metro QR codes.

---

## 10. Success Metrics & Key Performance Indicators (KPIs)

| Metric | Target Goal | Measurement Mechanism |
|:---|:---|:---|
| **Search-to-Booking Conversion Rate** | $\ge 12\%$ | Funnel analytics from homepage search to ERS generation |
| **API Cache Hit Ratio** | $\ge 65\%$ | Internal caching analytics on RailRadar API requests |
| **Page Speed Index** | $< 1.2\text{s}$ | Google Lighthouse & Chrome Web Vitals audits |
| **Booking Flow Completion Time** | $< 45\text{s}$ | Timestamp delta from train selection to ticket issuance |
| **Customer CSAT Score** | $\ge 4.7 / 5.0$ | Post-booking and post-journey feedback surveys |

---

## 11. Appendix & Reference Links

* **Live Railway API Documentation:** [RailRadar v1 API Portal](https://api.railradar.in/v1)
* **Repository Architecture:** Multi-page Vite configuration with decoupled CSS/JS modules
* **Design Guidelines:** RouteLine Modern Dark Tech Theme (Inter font, Lucide icons, glassmorphism)
* **Author & Contact:** Sauryaman Bisen (`sauryamanbisen-art`)
