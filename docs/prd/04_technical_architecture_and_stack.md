# RouteLine — Technical Architecture & Stack

## 1. System Architecture
RouteLine is architected as a modular Multi-Page Application (MPA) combining modern frontend design patterns with decoupled domain services and resilient client-side state caching.

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

## 2. Directory & Module Organization
```
RouteLine-Travelling-Project/
├── Dockerfile                  # Container definition for reproducible builds
├── docker-compose.yml          # Local containerized orchestration
├── vite.config.js              # Multi-page Rollup bundler configuration
├── package.json                # Dependencies, Oxlint scripts, and metadata
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
│   ├── css/                    # Modular BEM stylesheet hierarchy
│   ├── js/
│   │   ├── auth/               # Login, registration, session management
│   │   ├── train/              # RailRadar client, schedules, PNR tracking
│   │   ├── metro/              # Multi-city metro routing & QR engine
│   │   ├── global/             # Payment modal, mode switcher, main scripts
│   │   └── ticket/             # ERS generator and ticket cancellation
│   └── assets/                 # Brand mascot, backgrounds, city imagery
└── docs/                       # Product requirements, architecture & guides
```
