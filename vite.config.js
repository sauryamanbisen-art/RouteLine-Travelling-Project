import { defineConfig } from 'vite'
import { resolve } from 'path'

export default defineConfig({
  base: '/RouteLine-Travelling-Project/',
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        trainResults: resolve(__dirname, 'train-results.html'),
        flightResults: resolve(__dirname, 'flight-results.html'),
        busResults: resolve(__dirname, 'bus-results.html'),
        hotelResults: resolve(__dirname, 'hotel-results.html'),
        metroTicket: resolve(__dirname, 'metro-ticket.html'),
        orderFood: resolve(__dirname, 'order-food.html'),
        cabs: resolve(__dirname, 'cabs.html'),
        trainStatus: resolve(__dirname, 'train-status.html'),
        trainSchedule: resolve(__dirname, 'train-schedule.html'),
        seatAvailability: resolve(__dirname, 'seat-availability.html'),
        ticket: resolve(__dirname, 'ticket.html')
      }
    }
  }
})
