# RouteLine: Unified Travel Tracking & Multi-Modal Booking Platform

> **Your journey, Just a Tap Away.** An intelligent, all-in-one travel operating system connecting Indian Railways, Flights, Buses, Urban Metros, and Station Cabs with live transit telemetry and spatial trip tracking.

[![Vite 8](https://img.shields.io/badge/Bundler-Vite_8.2-646CFF?logo=vite&logoColor=white)](https://vitejs.dev/)
[![Docker](https://img.shields.io/badge/Container-Docker-2496ED?logo=docker&logoColor=white)](https://www.docker.com/)
[![Oxlint](https://img.shields.io/badge/Linter-Oxlint-orange)](https://oxc.rs/)
[![Status](https://img.shields.io/badge/Phase_4-In_Development-blue)](#development-phases--roadmap)
[![PRD](https://img.shields.io/badge/Docs-PRD_1.0-brightgreen)](./RouteLine_PRD.md)

---

## 🧭 Project Overview

**RouteLine** eliminates modern travel fragmentation by delivering a single, cohesive multi-modal booking platform and interactive spatial travel diary. It connects long-distance transit (Trains, Flights, Intercity Buses) with first- and last-mile urban mobility (Metros, Station Cabs) and on-board services (Station-delivered food).

* **Repository:** `sauryamanbisen-art/RouteLine-Travelling-Project`
* **Master PRD:** [RouteLine_PRD.md](./RouteLine_PRD.md)
* **PRD Sections & Specs:** [`docs/prd/`](./docs/prd/)

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

---

## ✨ Key Features & Live Modules

| Domain | Implemented Functionality & Page Link |
|:---|:---|
| **Multi-Modal Hero Search** | Context-aware switching across Trains, Flights, Buses, and Hotels with active indicator pill, 40+ station autocomplete, and quick service actions. (`index.html`) |
| **RailRadar Live Railway Engine** | Real-time Indian Railway API integration (`src/js/train/railradar.js`) with in-memory caching covering 11 live endpoints: Train Timetables, GPS Running Status, Route Geometry, Coach Positions, and Fares. |
| **Train Search & Results** | Real-time train listings, class availability badges (1A, 2A, 3A, SL), interactive booking drawers, and passenger intake. (`train-results.html`) |
| **Live Timetable & Coach Layout** | Station-by-station arrival/departure times, platform numbers, halt durations, and coach/rake composition visualizer. (`train-schedule.html`) |
| **Seat Vacancy & Availability** | Multi-day availability calendar matrix with confirmation probability metrics. (`seat-availability.html`) |
| **PNR Tracking & Prediction** | 10-digit PNR validator modal with PRS zone recognition, waitlist confirmation probability, and refund estimations. (`src/js/train/pnr-status.js`) |
| **Metro QR Ticketing Pass** | Multi-city metro engine for Delhi (DMRC), Mumbai (MMRDA), Bengaluru, Kolkata, Hyderabad, and Chennai with automated fare calculation and animated QR passes. (`metro-ticket.html`) |
| **Centralized Authentication** | RouteLine Secure Pass modal supporting user registration, login, guest browsing mode, and session persistence in `localStorage`. (`src/js/auth/auth.js`) |
| **Unified Checkout Simulator** | 256-bit checkout gateway supporting UPI, Cards, NetBanking, and Wallet with automatic berth allocation and authentic 10-digit PNR generation. (`src/js/global/payment.js`) |
| **Electronic Reservation Slip (ERS)** | IRCTC-compliant ERS view with barcode, passenger manifests, print/PDF layout, and one-click ticket cancellations. (`ticket.html`) |
| **Visuals & Partner Integrations** | Custom WebGL cloud shader background on flights (`flight-results.html`), Uber cab bridge (`cabs.html`), and Zoop India food-to-berth bridge (`order-food.html`). |

---

## 🛠️ Technical Architecture & Stack

* **Front-End Core:** Semantic HTML5, Vanilla JavaScript (Modular ES6+), Vanilla CSS3 (Custom Variables, BEM, Glassmorphism).
* **Visual Effects:** WebGL 2D/3D Fragment Shaders (`flight.js`), vector Lucide icons.
* **Build System & Tooling:** Vite 8.2.0 (Multi-Page Rollup configuration), Oxlint 1.75.0 for high-speed static linting.
* **External APIs:** RailRadar v1 REST API (`https://api.railradar.in/v1`) with Bearer token authentication and 45s in-memory TTL caching.
* **State Management:** Browser `localStorage` and `sessionStorage` persistence for user sessions and ticket history.
* **Containerization:** Docker (`Dockerfile`) and Docker Compose (`docker-compose.yml`).

---

## 📁 Repository Directory Structure

```
RouteLine-Travelling-Project/
├── Dockerfile                  # Container definition for reproducible builds
├── docker-compose.yml          # Local containerized orchestration
├── vite.config.js              # Multi-page Rollup bundler configuration
├── package.json                # Dependencies, Oxlint scripts, and metadata
├── RouteLine_PRD.md            # Comprehensive Master Product Requirement Document
├── index.html                  # Unified multi-modal search homepage
├── train-results.html          # Train search results & class selection drawer
├── train-schedule.html         # Live timetable, halt list & coach composition
├── seat-availability.html      # Multi-day vacancy calendar matrix
├── metro-ticket.html           # Multi-city metro QR ticket booking engine
├── ticket.html                 # Booked tickets dashboard & print-ready ERS
├── flight-results.html         # Flight search with WebGL cloud shader
├── bus-results.html            # Intercity bus routes and schedules
├── hotel-results.html          # Accommodations search portal
├── cabs.html                   # Station taxi dispatch integration
├── order-food.html             # Train seat food delivery partner bridge
├── src/
│   ├── css/                    # Modular BEM stylesheet hierarchy (13 namespaces)
│   ├── js/
│   │   ├── auth/               # Login, registration, session management
│   │   ├── train/              # RailRadar client, schedules, PNR tracking
│   │   ├── metro/              # Multi-city metro routing & QR engine
│   │   ├── global/             # Payment modal, mode switcher, main scripts
│   │   └── ticket/             # ERS generator and ticket cancellation
│   └── assets/                 # Brand mascot, backgrounds, city imagery
└── docs/
    └── prd/                    # Modularized PRD chapters & system specifications
```

---

## 🚀 Getting Started

### Prerequisites
* [Node.js](https://nodejs.org/) (v20+ recommended)
* `npm` or `yarn`
* (Optional) [Docker](https://www.docker.com/) & Docker Compose

### Local Development Setup
```bash
# Clone the repository
git clone https://github.com/sauryamanbisen-art/RouteLine-Travelling-Project.git
cd RouteLine-Travelling-Project

# Install dependencies
npm install

# Start local development server with Vite HMR
npm run dev

# Run high-performance linter
npm run lint

# Build production bundle
npm run build

# Preview production build locally
npm run preview
```

### Running with Docker
```bash
# Build and run containerized environment
docker-compose up --build
```

---

## 📊 Development Phases & Roadmap

```
PHASE 1: Foundations & Architecture       [====================] 100% COMPLETE
PHASE 2: Core Front-End & Widgets         [====================] 100% COMPLETE
PHASE 3: Live RailRadar API & PRS Engine  [=================== ]  95% COMPLETE
PHASE 4: Route Intelligence & "My Paths"  [========            ]  40% IN PROGRESS (CURRENT)
PHASE 5: Backend Services & Production    [==                  ]  10% PLANNED
```

* **Current Focus (Phase 4):**
  1. Integrating Leaflet / Mapbox GIS canvas to plot live railway coordinates via RailRadar GeoJSON.
  2. Building the unified multi-modal trip timeline ("My Paths").
  3. Connecting live data feeds for flight and intercity bus routes.

---

## 📄 Documentation

For full product requirements, functional specifications, persona studies, and sprint details:
* 📖 [Master PRD (RouteLine_PRD.md)](./RouteLine_PRD.md)
* 📑 [Executive Summary & Vision](./docs/prd/01_executive_summary_and_vision.md)
* 📑 [Target Personas & User Journeys](./docs/prd/02_target_personas_and_user_journeys.md)
* 📑 [Current Implementation Audit](./docs/prd/03_current_implementation_audit.md)
* 📑 [Technical Architecture & Stack](./docs/prd/04_technical_architecture_and_stack.md)
* 📑 [Functional & Non-Functional Requirements](./docs/prd/05_requirements_and_specifications.md)
* 📑 [Roadmap, Phases & Sprints](./docs/prd/06_roadmap_and_sprints.md)
* 📑 [Metrics & Risk Mitigation](./docs/prd/07_metrics_and_risk_mitigation.md)

---

## 👤 Author & Maintainer
* **Lead Engineer:** Sauryaman Bisen ([@sauryamanbisen-art](https://github.com/sauryamanbisen-art))
* **License:** MIT
