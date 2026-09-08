/**
 * RouteLine - Train Status Module (train-status.js)
 */
import { getLiveStatus } from './railradar.js';

export async function fetchTrainLiveStatus(trainNumber, startDay = 0) {
  try {
    return await getLiveStatus(trainNumber, startDay);
  } catch (err) {
    console.error('Failed to fetch train live status:', err);
    throw err;
  }
}

document.addEventListener('DOMContentLoaded', () => {
  // If dedicated live status elements exist, bind handlers here
});
