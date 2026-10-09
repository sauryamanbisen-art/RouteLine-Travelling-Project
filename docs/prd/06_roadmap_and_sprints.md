# RouteLine — Roadmap, Phases & Sprints

## 1. Development Phases

```
PHASE 1: Foundations & Architecture       [====================] 100% COMPLETE
PHASE 2: Core Front-End & Widgets         [====================] 100% COMPLETE
PHASE 3: Live RailRadar API & PRS Engine  [=================== ]  95% COMPLETE
PHASE 4: Route Intelligence & "My Paths"  [========            ]  40% IN PROGRESS (CURRENT)
PHASE 5: Backend Services & Production    [==                  ]  10% PLANNED
```

### Current Status: **Phase 4 (Route Intelligence & Spatial Path Tracking)**
* **Active Today:** The train booking, metro QR generation, live schedule lookup, PNR tracker, and ticket management workflows are complete on the client side with realistic state persistence.
* **In Progress in Phase 4:**
  1. Building the **"My Paths" interactive GIS map canvas** (using RailRadar’s GeoJSON route geometry endpoint to trace actual train tracks on a map).
  2. Unifying multimodal legs into a single chronological trip timeline (e.g. Flight -> Metro -> Train -> Cab).
  3. Upgrading flight, bus, and hotel results from mock search layouts to live availability data feeds.

## 2. Gap Analysis & Next Actionable Sprints

```
[Current State]                                                [Production Goal]
Client-side MPA with LocalStorage  ====> SPRINT 1-5 ====>  Full-Stack Cloud Platform
Simulated Payment Gateway          ====> SPRINT 1-5 ====>  Live Razorpay / UPI Integration
RailRadar Live Train Data          ====> SPRINT 1-5 ====>  Multi-Modal Live GDS Engines
Static Partner Redirects           ====> SPRINT 1-5 ====>  Embedded Native Services
```

### Sprint Breakdown:
* **Sprint 4.1 — Spatial Map Integration ("My Paths" Canvas):**
  * Integrate Leaflet/Mapbox in a dedicated view (`my-paths.html`).
  * Ingest RailRadar route geometry GeoJSON to render true railway tracks.
  * Plot active booked tickets from `routeline_booked_tickets` as active lines.
* **Sprint 4.2 — Flight & Bus Real-Time Integration:**
  * Replace static flight and bus cards with dynamic data models.
  * Add seat picker UI for intercity buses (sleeper lower/upper berth selector).
* **Sprint 5.1 — Node.js & Database Backend:**
  * Build Express.js REST API with PostgreSQL database schema (`users`, `bookings`, `tickets`, `stations`).
  * Migrate authentication to secure HTTP-only JWT cookies.
* **Sprint 5.2 — Live Payment Webhooks:**
  * Integrate Razorpay Checkout SDK for live UPI and Card payments.
  * Automate refund ledger for cancelled reservations.
* **Sprint 5.3 — Progressive Web App (PWA) & Offline Mode:**
  * Implement Service Worker with Cache-First strategy for downloaded ERS tickets and offline metro QR codes.
