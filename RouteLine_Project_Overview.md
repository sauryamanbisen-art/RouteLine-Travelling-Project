# RouteLine: Unified Travel Tracking & Booking Platform

## Project Overview
RouteLine is a comprehensive web application designed to give users a single, unified dashboard to view all their travel paths and histories. It bridges the gap between a standard booking portal and a personal travel diary. Structurally inspired by the provided UI references, RouteLine will support multi-modal travel planning (Trains, Flights, Buses, Hotels) while emphasizing a seamless, high-performance user experience.

## UI/UX Design System
While the reference screenshots provide a solid functional layout, the visual identity of RouteLine will utilize a modern, futuristic, and tech-oriented aesthetic. 
*   **Theme:** Dark mode default to highlight travel routes and data visualizations.
*   **Color Palette:** Deep backgrounds complemented by blue tech gradients and glowing UI elements for active states and primary calls-to-action (like the Search button).
*   **Layout:** Clean, structured grids for dashboards, utilizing subtle glassmorphism for the overlay widgets (like the central search bar).

## Core Features
1.  **Unified Travel Path Dashboard:** A dedicated interactive view where users can see past, current, and upcoming journeys mapped out sequentially.
2.  **Multi-Modal Booking Engine:** 
    *   Dynamic tabs for Trains, Flights, Buses, and Hotels.
    *   Interactive input fields for origin, destination, dates, and travel class.
3.  **Train Search & Seat Availability (Reference Implementation):**
    *   Detailed listing of trains with class-wise availability (SL, 3A, 2A, 1A).
    *   Integration of quick-access icons (Metro Ticket, Order Food on Train, Train by Name/No., Seat Availability).
4.  **Promotional & Destination Modules:**
    *   "Popular Destinations" visually engaging cards.
    *   "Best Offers for You" promotional carousel.

## Technical Architecture & Stack
*   **Front-End Development:** Built robustly utilizing semantic HTML, modern CSS, and JavaScript. 
*   **Version Control:** GitHub for repository management and collaborative version tracking.
*   **Containerization:** Docker will be utilized to ensure consistent, isolated development and deployment environments.
*   **Map Integration:** Implementation of a mapping API (e.g., Mapbox, Leaflet) to render the "all travelling paths" visualization.

## Development Roadmap: How to Start & Where We End Up

### Phase 1: Initialization & Architecture (The Starting Point)
*   Initialize the Git repository and define the directory structure.
*   Set up the Docker containers to establish a standardized development environment.
*   Define global CSS variables for the dark theme, blue tech gradients, and typography.
*   Create the foundational layout components (Navigation Bar, Global Footer).

### Phase 2: Core Front-End Construction
*   Develop the Hero Section featuring the central multi-modal booking widget.
*   Implement the floating Quick Services icon grid below the main hero image.
*   Build the Destination and Offer carousels, ensuring fully responsive design.

### Phase 3: Route Mapping & User Dashboard
*   Integrate the mapping API to build the interactive "My Paths" page.
*   Create the data models and UI to display waypoints, transport modes, and timestamps in a unified timeline.

### Phase 4: Dynamic UI & State Logic
*   Build out the detailed search result pages (specifically adapting the Train listing and seat availability UI from the references).
*   Implement client-side state management to handle search parameters and filter applications.

### Phase 5: Polish & Deployment (Where We End Up)
*   Refine all hover states, glowing UI effects, and page transitions.
*   Conduct thorough cross-browser and mobile responsiveness testing.
*   Finalize the Docker image and deploy the optimized front-end build to production.
