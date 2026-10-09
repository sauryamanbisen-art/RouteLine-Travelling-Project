# RouteLine — Target Personas & User Journeys

## 1. Problem Statement
Travelers across India and regional hubs face severe friction due to fragmented digital infrastructure:
* **App Fatigue & Siloed Records:** Commuters use 4–6 different apps per journey. Booking confirmation emails, PNR numbers, flight tickets, and metro tokens are scattered across SMS, email, and disparate dashboards.
* **Lack of Predictive Travel Context:** Standard railway portals do not offer clear, probabilistic waitlist confirmation models, live rake/coach layout diagrams, or real-time platform tracking before arriving at stations.
* **Disconnected Urban First/Last Mile Transit:** High-speed rail journeys suffer friction at origin and destination due to separate ticketing queues for city metros, station autos, and cabs.
* **Cluttered, Legacy User Interfaces:** Existing government and budget portals suffer from ad clutter, sluggish page performance, and outdated design systems.

## 2. Target User Personas

| Persona | Archetype | Needs & Pain Points | RouteLine Value Proposition |
|:---|:---|:---|:---|
| **Vikram (28)** | *Tech Professional & Frequent Commuter* | Commutes weekly between Delhi and regional hubs. Values speed, clean interfaces, instant PNR lookup, and metro QR access. | Sub-second live train tracking, instant metro pass generation, sleek dark-mode UI. |
| **Priya (34)** | *Family & Vacation Planner* | Coordinates multi-city family trips combining flights, hotel stays, and regional rail legs. Needs clear fare breakdowns and seat layout previews. | Multi-modal search tabs, coach position visualizer, transparent pricing, unified ticket drawer. |
| **Rohit (22)** | *Student & Budget Traveler* | Looking for cheapest available seats across trains and sleeper buses; needs waitlist confirmation predictions before paying. | Real-time seat vacancy matrix, 6-day trend forecasts, PNR confirmation probabilities. |

## 3. Core User Journeys

### 3.1 The Daily Metropolitan Commuter Journey
1. Open RouteLine homepage.
2. Select "Metro Ticket" quick service.
3. Choose starting station and destination (e.g. Rajiv Chowk to Huda City Centre).
4. Review line interchanges, calculated fare, and estimated duration.
5. Generate an instant QR pass with active countdown timer for contactless turnstile scanning.

### 3.2 The Intercity Rail Explorer Journey
1. Enter Origin (e.g. New Delhi) and Destination (e.g. Kanyakumari) with automated date picker (+3 days default).
2. Browse live train results powered by RailRadar API.
3. Compare travel times, intermediate halts, and class availability (1A, 2A, 3A, SL).
4. Inspect interactive coach layouts and train timetables.
5. Complete simulated 256-bit checkout; receive official ERS with 10-digit PNR and berth assignment.
