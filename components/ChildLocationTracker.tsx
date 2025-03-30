// Purpose: This file contains the code for the ChildLocationTracker component, which is used to track the location of the child user.
// It uses the Expo Location API to track the location of the device in the foreground.

import * as Location from "expo-location";

let locationSubscription: Location.LocationSubscription | null = null;

/**
 * Starts foreground location tracking.
 *
 * @param onLocationUpdate - Callback to receive updated location.
 * @param intervalMs - How often to get location updates (default: 10 seconds).
 */

let isTracking = false;

export const startForegroundTracking = async (
  onLocationUpdate: (location: Location.LocationObjectCoords) => void,
  intervalMs: number = 10000
) => {
  const { status } = await Location.requestForegroundPermissionsAsync();

  if (status !== "granted") {
    throw new Error("Location permission not granted.");
  }

  if (locationSubscription) {
    await locationSubscription.remove(); // Clear previous subscription
    locationSubscription = null;
  }

  locationSubscription = await Location.watchPositionAsync(
    {
      accuracy: Location.Accuracy.High,
      timeInterval: intervalMs,
      distanceInterval: 0, // trigger every intervalMs regardless of movement
    },
    (location) => {
      const coords = location.coords;
      console.log("Tracked coordinates:", coords); // LOGGING COORDINATES (FOR DEBUGGING)
      onLocationUpdate(coords);
    }
  );
};

/**
 * Stops foreground location tracking.
 */
export const stopForegroundTracking = async () => {
  if (locationSubscription) {
    await locationSubscription.remove();
    locationSubscription = null;
  }
};
