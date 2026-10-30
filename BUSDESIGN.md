---
name: RouteLine Travel System
colors:
  surface: '#f8f9ff'
  surface-dim: '#cbdbf5'
  surface-bright: '#f8f9ff'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#eff4ff'
  surface-container: '#e5eeff'
  surface-container-high: '#dce9ff'
  surface-container-highest: '#d3e4fe'
  on-surface: '#0b1c30'
  on-surface-variant: '#43474c'
  inverse-surface: '#213145'
  inverse-on-surface: '#eaf1ff'
  outline: '#74777d'
  outline-variant: '#c3c7cd'
  surface-tint: '#4c6075'
  primary: '#000f1d'
  on-primary: '#ffffff'
  primary-container: '#0f2537'
  on-primary-container: '#788da3'
  inverse-primary: '#b3c9e0'
  secondary: '#865218'
  on-secondary: '#ffffff'
  secondary-container: '#fdb875'
  on-secondary-container: '#78470c'
  tertiary: '#001209'
  on-tertiary: '#ffffff'
  tertiary-container: '#002a1b'
  on-tertiary-container: '#1a9e70'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#cfe5fd'
  primary-fixed-dim: '#b3c9e0'
  on-primary-fixed: '#061d2f'
  on-primary-fixed-variant: '#34495c'
  secondary-fixed: '#ffdcbf'
  secondary-fixed-dim: '#fdb875'
  on-secondary-fixed: '#2d1600'
  on-secondary-fixed-variant: '#6a3c00'
  tertiary-fixed: '#85f8c4'
  tertiary-fixed-dim: '#68dba9'
  on-tertiary-fixed: '#002114'
  on-tertiary-fixed-variant: '#005137'
  background: '#f8f9ff'
  on-background: '#0b1c30'
  surface-variant: '#d3e4fe'
typography:
  display-hero:
    fontFamily: Plus Jakarta Sans
    fontSize: 40px
    fontWeight: '700'
    lineHeight: 48px
    letterSpacing: -0.02em
  display-hero-mobile:
    fontFamily: Plus Jakarta Sans
    fontSize: 28px
    fontWeight: '700'
    lineHeight: 36px
    letterSpacing: -0.01em
  headline-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 24px
    fontWeight: '700'
    lineHeight: 32px
    letterSpacing: -0.015em
  headline-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 20px
    fontWeight: '600'
    lineHeight: 28px
  headline-sm:
    fontFamily: Plus Jakarta Sans
    fontSize: 16px
    fontWeight: '600'
    lineHeight: 24px
  body-lg:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 26px
  body-md:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 22px
  body-sm:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '400'
    lineHeight: 18px
  label-lg:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '600'
    lineHeight: 20px
  label-md:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '600'
    lineHeight: 16px
  label-caps:
    fontFamily: Inter
    fontSize: 10px
    fontWeight: '700'
    lineHeight: 14px
    letterSpacing: 0.08em
  price-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 18px
    fontWeight: '700'
    lineHeight: 24px
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  gutter: 1.25rem
  gutter-mobile: 0.75rem
  margin: 2rem
  margin-mobile: 1rem
  space-xs: 0.25rem
  space-sm: 0.5rem
  space-md: 1rem
  space-lg: 1.5rem
  space-xl: 2.25rem
  space-2xl: 3rem
---

## Brand & Style

This design system is engineered for multi-modal travel search, ticketing, and route planning across bus, train, cab, and flight connections. It establishes an authentic, trustworthy Indian travel aggregation experience prioritizing clarity, high-speed decision making, and transparent pricing.

### Brand Personality & Emotional Impact
- **Trustworthy & Authoritative:** Instills immediate confidence in seat inventory confirmation, live PNR updates, and auto-refund guarantees through grounded navy structures and crisp surface separations.
- **Warm & Welcoming:** Uses earthy ochre and warm amber call-to-actions to evoke regional journey landscapes, warmth, and reliable hospitality.
- **Effortless Discovery:** Soft pastel categorical tinting distinguishes service categories (buses, trains, hotels, flights) without cognitive clutter.

### Design Movement
- **Modern Clean Utility with Tactile Warmth:** Merges floating rounded cards, pill-shaped control housings, crisp 1px borders, subtle atmospheric shadows, and a clean structured grid.

## Colors

The palette employs a deep maritime navy for primary branding, navigation backdrops, and high-impact headers, contrasted against warm ochre/amber for conversion drivers. Soft pastel containers provide semantic separation for multi-modal deals and ticket statuses.

### Role Assignments
- **Primary Navy (`#0F2537` / `#0C1E2E`):** Header anchors, brand marks, primary typographic titles, and full-bleed mobile/desktop download sections.
- **Secondary Ochre Accent (`#C88A4B` / `#D97706`):** Search action buttons, trip planning triggers, directional progression chevrons, and rating stars (`#F59E0B`).
- **Success & Trust Emerald (`#059669` / `#047857`):** Pricing confirmation, green value badges, and guaranteed inventory pill bands.
- **Pastel Category Surface Tints:**
  - *Mint Green (`#E8F8F0`):* Bus journeys, confirmations, guarantee ribbons.
  - *Warm Amber Tint (`#FEF3C7` / `#FFF7ED`):* Train deals and step badges.
  - *Soft Lavender (`#F3E8FF`):* Hotel reservations and premium accommodations.
  - *Sky Cyan (`#E0F2FE`):* Flight deals, air routes, and tracking chips.
- **Surface & Neutral System:**
  - Base canvas: `#F8FAFC`
  - Elevated surfaces: `#FFFFFF`
  - Subtle borders: `#E2E8F0`
  - Secondary text / metadata: `#64748B`
  - High-emphasis body copy: `#1E293B`

## Typography

The type scale combines **Plus Jakarta Sans** for prominent section headlines, route titles, and promo figures with **Inter** for dense transactional UI, booking inputs, departure times, and price points.

### Hierarchy & Usage
- **Uppercase Field Markers (`label-caps`):** Form field headers (`FROM`, `TO`, `TRAVEL DATE`, `RETURN`) use bold, spaced uppercase in slate `#94A3B8` to anchor user inputs without stealing focus.
- **Numeric & Pricing Emphasis (`price-lg`):** All fare displays (`₹299`, `₹599`) utilize `Plus Jakarta Sans` in bold weights to ensure price discoverability across dense search feeds.
- **Section Headers & CTAs:** Titles such as "Best Deals & Offers" and "Popular Destinations" utilize `Plus Jakarta Sans` with tight kerning (`-0.015em`) for modern editorial warmth.

## Layout & Spacing

A 12-column responsive layout anchors the desktop web experience with a maximum content container width of `1280px`. Mobile viewports stack content horizontally with side-swipe carousels for destinations, offers, and route cards.

### Layout Rules
- **Modular Section Cards:** Major functional clusters (Multi-City planner, Deals, Testimonials, Trust highlights) sit on isolated cards padded with `space-lg` to `space-xl` with clear white backgrounds.
- **Multi-Input Search Shell:** The booking bar uses an encapsulating floating pill or rounded container (`p-2` to `p-3`) hosting nested segmented input modules divided by subtle `1px solid #E2E8F0` separators.
- **Horizontal Cards & Quick Actions:** Service shortcuts (Track Bus, Cancel Ticket, Charter) sit in a compact flex row with `0.75rem` gaps on desktop, shifting into a scroll snap strip on viewports narrower than `768px`.

## Elevation & Depth

Visual depth is achieved through quiet, layered surfaces with crisp hairline borders rather than heavy drop shadows.

### Elevation Levels
- **Level 0 (Canvas Base):** Background wash in `#F8FAFC`.
- **Level 1 (Surface Cards & Sections):** `#FFFFFF` surfaces paired with a crisp 1px border (`#E2E8F0` or `#F1F5F9`) and a soft ambient glow: `0px 1px 3px rgba(15, 37, 55, 0.04), 0px 4px 12px rgba(15, 37, 55, 0.02)`.
- **Level 2 (Floating Search Containers & Popovers):** Elevated search master bars and date pickers use a wider diffuse shadow: `0px 8px 30px rgba(15, 37, 55, 0.08)`.
- **Level 3 (Modals & Overlays):** `0px 20px 40px rgba(15, 37, 55, 0.16)`.

### Specialty Overlays
- **Trust Ribbons:** Soft mint container ribbon (`#E8F8F0`) docked cleanly at the bottom edge of floating search bars with zero shadow, bounded by a faint green-tinted upper line (`#D1FAE5`).
- **Destination Vignettes:** 45% height gradient overlays (`linear-gradient(to top, rgba(15, 37, 55, 0.85) 0%, transparent 100%)`) anchored over card image bases to preserve high text legibility for multi-city journey names.

## Shapes

The interface balances soft friendliness with structured utility. Generous rounded geometry softens dense transit information.

### Boundary Tokens
- **Standard Controls & Small Items (`0.5rem` / `rounded-md`):** Destination thumbnails inside route steps, micro action icons, badges.
- **Standard Cards & Input Cells (`0.75rem` - `1rem` / `rounded-xl`):** Individual travel collection cards, service action boxes, segmented search fields.
- **Enclosing Section Containers (`1.25rem` - `1.5rem` / `rounded-2xl`):** Major landing modules, deals wrappers, and testimonial blocks.
- **Pills (`9999px` / `rounded-full`):** Search action trigger buttons ("Search Buses", "Plan Multi-City Trip"), step numbering chips (1, 2, 3), and filter badges.

## Components

### Buttons
- **Primary Action (Search & Plan):** Background `#C88A4B` (or `#D97706`), text `#0F2537` or `#FFFFFF`, font weight 600. Fully rounded pill (`rounded-full`) with `px-8 py-3.5`. Hover shifts to `#B45309` with subtle scale transition.
- **Secondary Button:** Surface `#FFFFFF`, border `1px solid #CBD5E1`, text `#0F2537`, hover `#F8FAFC`.
- **Icon / Swap Button:** Circular `40px x 40px` pill between `From` and `To` nodes, background `#F1F5F9`, border `1px solid #E2E8F0`, icon `#64748B`.

### Search Input Bar
- Floating white composite container with rounded borders (`rounded-2xl`).
- Segments divided by 1px vertical borders (`#E2E8F0`).
- Each segment contains a transit icon (`#C88A4B`), a micro label (`FROM`, `TO`, `TRAVEL DATE`) in uppercase 10px gray, and the selection value in 15px bold navy text.
- Integrated bottom trust ribbon with green checkmarks displaying "Confirmed Bus Inventory", "Instant Auto-Refunds", and "24/7 Human Dispatch Desk".

### Destination & Deal Cards
- **Popular Destination Card:** Top aspect ratio `16:10` image, bottom white info panel with city title in `#0F2537`, state subtitle in `#64748B`, starting fare in bold navy, and a directional arrow link (`#C88A4B`).
- **Promo Cards:** Pastel-tinted surfaces (`#FFF7ED`, `#E8F8F0`, `#F3E8FF`, `#E0F2FE`) featuring bold percentage badges, ticket icons, and concise savings copy ("Up to 40% OFF", "Save ₹200+").
- **Multi-Stop Itinerary Flow:** Sequential step cards labeled with circular numeric badges (`#FEF3C7` with `#B45309` text), connected by horizontal breadcrumb chevrons (`→`).

### Chips & Badges
- **Pill Badges:** Height 24px, padding `0 10px`, typography `label-md`. Background in light mint (`#E8F8F0`), sky (`#E0F2FE`), or lavender (`#F3E8FF`) with coordinating deep text colors.
- **Ratings:** 5-star rating layout rendered in `#F59E0B` amber with customer quote copy in `#334155`.

### App Promo / Banner
- Dark Navy full-width band (`#0F2537`) containing white display typography, official Google Play and App Store pill download badges, and an integrated rounded QR code container.