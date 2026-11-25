# RouteLine Changelog

All notable changes to the RouteLine project are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [1.2.0] - 2026-11-25

### Fixed
- **Multi-Environment Lucide Icon Loading**: Replaced fragile absolute `/vendor/lucide.min.js` references with robust relative paths (`./vendor/...` and `../../vendor/...`) across `index.html` and 21 subpages.
- **Offline & CDN Fallback**: Added automatic unpkg Cloudflare Edge CDN fallback via `document.write` if local files are missing, ensuring 100% icon uptime.
- **file:/// CORS Module Independence**: Added universal classic script auto-runners that initialize icons on `DOMContentLoaded` and `window.load` without getting blocked by browser CORS restrictions on ES modules.

### Added
- Root-level `vendor/lucide.min.js` mirroring `public/vendor/` for direct root web server compatibility.
- Automated integrity verification suite (`scripts/verify-assets.js` and `scripts/test-icons.js`) wired into `npm test`.
- Accessible `aria-label` attributes across all interactive route swap buttons.

### Changed
- Refactored `vite.config.js` to modern Node.js `import.meta.dirname` path resolution.
- Cleaned up unused WebGL animation frame variables and added page unload cancellation.

---

## [1.1.0] - 2026-11-23

### Added
- **Dedicated Bus Search Portal**: Intercity coach search at `pages/bus/bus-search.html` with dual-capsule trip modes, live inventory locks, and direct seat selection flow.
- Seamless booking workflow connecting bus search results, berth layout picker, passenger intake, and payment review.
- Popular bus routes and intercity destination showcases with direct fare card pre-population.

---

## [1.0.0] - 2026-11-06

### Added
- Indian Railways RailRadar live telemetry, train timetable, seat availability, and live PNR tracking modal.
- Multi-modal unified search dock across Trains, Flights, Buses, and Hotels.
- Metro QR Pass generator for 6 major metro systems across India.
- Centralized Secure Pass authentication modal with `localStorage` session persistence.
