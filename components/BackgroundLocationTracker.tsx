import * as TaskManager from "expo-task-manager";
import * as Location from "expo-location";
import { Alert } from "react-native";
import { calculateDistance } from "./calculateDistance";

const LOCATION_TASK_NAME = "background-location-task";

const SCHOOL_LOCATION = {
  latitude: 1.3462227582931519,
  longitude: 103.68243408203125,
  radius: 200,
};

const HOME_LOCATION = {
  latitude: 1.3455, // Replace with real coordinates
  longitude: 103.684,
  radius: 200,
};

export async function startBackgroundLocationTracking() {
  const { status } = await Location.requestBackgroundPermissionsAsync();
  if (status !== "granted") {
    Alert.alert("Permission Denied", "Background location access is required.");
    return;
  }

  const hasStarted = await Location.hasStartedLocationUpdatesAsync(
    LOCATION_TASK_NAME
  );
  if (!hasStarted) {
    await Location.startLocationUpdatesAsync(LOCATION_TASK_NAME, {
      accuracy: Location.Accuracy.High,
      timeInterval: 5000,
      distanceInterval: 10,
      showsBackgroundLocationIndicator: true,
      foregroundService: {
        notificationTitle: "Tracking in progress",
        notificationBody: "Your location is being tracked.",
        notificationColor: "#285E5E",
      },
    });
  }
}

export async function stopBackgroundLocationTracking() {
  const hasStarted = await Location.hasStartedLocationUpdatesAsync(
    LOCATION_TASK_NAME
  );
  if (hasStarted) {
    await Location.stopLocationUpdatesAsync(LOCATION_TASK_NAME);
  }
}

// Define the background task handler
TaskManager.defineTask(LOCATION_TASK_NAME, ({ data, error }) => {
  if (error) {
    console.error("Location task error:", error);
    return;
  }

  const { locations } = data;
  const latestLocation = locations[0];

  if (!latestLocation) return;

  const isInSchool =
    calculateDistance(latestLocation.coords, SCHOOL_LOCATION) <=
    SCHOOL_LOCATION.radius;
  const isAtHome =
    calculateDistance(latestLocation.coords, HOME_LOCATION) <=
    HOME_LOCATION.radius;

  if (isInSchool || isAtHome) {
    stopBackgroundLocationTracking();
    Alert.alert(
      "Arrived",
      isInSchool ? "You have arrived at school." : "You have arrived at home."
    );
  }
});
