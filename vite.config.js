import { defineConfig } from 'vite'
import { resolve } from 'path'
import { fileURLToPath } from 'url'

const rootDir = typeof import.meta.dirname !== 'undefined'
  ? import.meta.dirname
  : resolve(fileURLToPath(new URL('.', import.meta.url)))

export default defineConfig({
  base: '/RouteLine-Travelling-Project/',
  build: {
    rollupOptions: {
      input: {
        main: resolve(rootDir, 'index.html'),
        login: resolve(rootDir, 'pages/auth/login.html'),
        trainResults: resolve(rootDir, 'pages/train/train-results.html'),
        flightSearch: resolve(rootDir, 'pages/flight/flight-search.html'),
        flightResults: resolve(rootDir, 'pages/flight/flight-results.html'),
        flightDetails: resolve(rootDir, 'pages/flight/flight-details.html'),
        flightPassengers: resolve(rootDir, 'pages/flight/passenger-details.html'),
        flightSeats: resolve(rootDir, 'pages/flight/seat-selection.html'),
        flightAddons: resolve(rootDir, 'pages/flight/baggage-addons.html'),
        flightReview: resolve(rootDir, 'pages/flight/review-payment.html'),
        flightConfirmation: resolve(rootDir, 'pages/flight/booking-confirmation.html'),
        flightDesignSystem: resolve(rootDir, 'pages/flight/design-system.html'),
        busSearch: resolve(rootDir, 'pages/bus/bus-search.html'),
        busResults: resolve(rootDir, 'pages/bus/bus-results.html'),
        busSeats: resolve(rootDir, 'pages/bus/seat-selection.html'),
        busPassengers: resolve(rootDir, 'pages/bus/passenger-details.html'),
        busReview: resolve(rootDir, 'pages/bus/review-payment.html'),
        busConfirmation: resolve(rootDir, 'pages/bus/booking-confirmation.html'),
        hotelResults: resolve(rootDir, 'pages/hotel/hotel-results.html'),
        metroTicket: resolve(rootDir, 'pages/train/metro-ticket.html'),
        orderFood: resolve(rootDir, 'pages/train/order-food.html'),
        cabs: resolve(rootDir, 'pages/home/cabs.html'),
        trainStatus: resolve(rootDir, 'pages/train/train-status.html'),
        trainSchedule: resolve(rootDir, 'pages/train/train-schedule.html'),
        seatAvailability: resolve(rootDir, 'pages/train/seat-availability.html'),
        ticket: resolve(rootDir, 'pages/train/ticket.html')
      }
    }
  }
})
