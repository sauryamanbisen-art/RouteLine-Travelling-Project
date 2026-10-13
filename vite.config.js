import { defineConfig } from 'vite'
import { resolve } from 'path'

export default defineConfig({
  base: '/RouteLine-Travelling-Project/',
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        trainResults: resolve(__dirname, 'pages/train/train-results.html'),
        flightSearch: resolve(__dirname, 'pages/flight/flight-search.html'),
        flightResults: resolve(__dirname, 'pages/flight/flight-results.html'),
        flightDetails: resolve(__dirname, 'pages/flight/flight-details.html'),
        flightPassengers: resolve(__dirname, 'pages/flight/passenger-details.html'),
        flightSeats: resolve(__dirname, 'pages/flight/seat-selection.html'),
        flightAddons: resolve(__dirname, 'pages/flight/baggage-addons.html'),
        flightReview: resolve(__dirname, 'pages/flight/review-payment.html'),
        flightConfirmation: resolve(__dirname, 'pages/flight/booking-confirmation.html'),
        flightDesignSystem: resolve(__dirname, 'pages/flight/design-system.html'),
        busResults: resolve(__dirname, 'pages/bus/bus-results.html'),
        hotelResults: resolve(__dirname, 'pages/hotel/hotel-results.html'),
        metroTicket: resolve(__dirname, 'pages/train/metro-ticket.html'),
        orderFood: resolve(__dirname, 'pages/train/order-food.html'),
        cabs: resolve(__dirname, 'pages/home/cabs.html'),
        trainStatus: resolve(__dirname, 'pages/train/train-status.html'),
        trainSchedule: resolve(__dirname, 'pages/train/train-schedule.html'),
        seatAvailability: resolve(__dirname, 'pages/train/seat-availability.html'),
        ticket: resolve(__dirname, 'pages/train/ticket.html')
      }
    }
  }
})
