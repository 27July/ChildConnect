import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { FontAwesome5 } from "@expo/vector-icons";
import MapView, { Marker } from "react-native-maps";
import * as Location from "expo-location";
import { SafeAreaView } from "react-native-safe-area-context";
import { calculateDistance } from "../../../components/calculateDistance";
import {
  startForegroundTracking,
  stopForegroundTracking,
} from "../../../components/ChildLocationTracker";

export default function ChildScreen() {
  const { childId, name } = useLocalSearchParams();
  const router = useRouter();

  const [location, setLocation] =
    useState<Location.LocationObjectCoords | null>(null);
  const [childBackendLocation, setChildBackendLocation] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);
  const [childLocation, setChildLocation] =
    useState<Location.LocationObjectCoords | null>(null);
  const [loading, setLoading] = useState(true);
  const [isPresent, setIsPresent] = useState(false);
  const [isTracking, setIsTracking] = useState(false);

  const mapRef = useRef<MapView | null>(null);

  const SCHOOL_LOCATION = {
    // School location to backend
    latitude: 1.3462227582931519,
    longitude: 103.68243408203125,
    radius: 200,
  };

  useEffect(() => {
    let intervalId: NodeJS.Timeout;

    const fetchChildLocationFromBackend = async () => {
      //CHILD'S LOCATION FROM BACKEND
      try {
        const fetchedLocation = {
          latitude: 1.3376,
          longitude: 103.6969,
        };

        setChildBackendLocation(fetchedLocation);

        const distance = calculateDistance(fetchedLocation, SCHOOL_LOCATION);
        setIsPresent(distance <= SCHOOL_LOCATION.radius);
      } catch (error) {
        console.error("Failed to fetch child location from backend", error);
      }
    };

    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        Alert.alert("Permission Denied", "Location access is required.");
        setLoading(false);
        return;
      }

      const currentLocation = await Location.getCurrentPositionAsync({});
      setLocation(currentLocation.coords);

      setLoading(false);
      await fetchChildLocationFromBackend();

      intervalId = setInterval(fetchChildLocationFromBackend, 10000);
    })();

    return () => clearInterval(intervalId);
  }, []);

  useEffect(() => {
    if (mapRef.current && location && childBackendLocation) {
      mapRef.current.fitToCoordinates(
        [
          { latitude: location.latitude, longitude: location.longitude },
          {
            latitude: childBackendLocation.latitude,
            longitude: childBackendLocation.longitude,
          },
          {
            latitude: SCHOOL_LOCATION.latitude,
            longitude: SCHOOL_LOCATION.longitude,
          },
        ],
        {
          edgePadding: { top: 50, right: 50, bottom: 50, left: 50 },
          animated: true,
        }
      );
    }
  }, [location, childBackendLocation]);

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.profileInfo}>
          <Image
            source={require("../../../assets/images/indianboy.png")}
            style={styles.profilePic}
          />
          <View>
            <Text style={styles.childName}>{name}</Text>
            <Text style={styles.schoolText}>Experimental Primary School</Text>
            <Text style={styles.classText}>Class: 1E4 Grade: P1</Text>
          </View>
        </View>
        <TouchableOpacity
          onPress={() => router.push("./childmode")}
          style={styles.shieldButton}
        >
          <FontAwesome5 name="user-shield" size={18} color="white" />
        </TouchableOpacity>
      </View>

      {/* Toggle Tracking Button */}
      <TouchableOpacity
        style={[
          styles.trackingButton,
          { backgroundColor: isTracking ? "#d9534f" : "#6b9080" },
        ]}
        onPress={async () => {
          try {
            if (!isTracking) {
              await startForegroundTracking((coords) => {
                setChildLocation(coords);
                console.log("Child's device location:", coords);
              });
            } else {
              await stopForegroundTracking();
            }
            setIsTracking(!isTracking);
          } catch (err) {
            console.error("Tracking error:", err);
            Alert.alert(
              "Tracking Error",
              "Failed to toggle location tracking."
            );
          }
        }}
      >
        <Text style={styles.trackingButtonText}>
          {isTracking ? "Stop Tracking" : "Activate Tracking"}
        </Text>
      </TouchableOpacity>

      {/* Status Text */}
      <Text style={[styles.statusText, !isPresent && styles.notPresent]}>
        Status: {isPresent ? "In School" : "Not in School"}
      </Text>

      {/* Map View */}
      <View style={styles.mapContainer}>
        {loading ? (
          <ActivityIndicator size="large" color="#285E5E" />
        ) : childBackendLocation && location ? (
          <MapView
            ref={mapRef}
            style={styles.map}
            initialRegion={{
              latitude: childBackendLocation.latitude,
              longitude: childBackendLocation.longitude,
              latitudeDelta: 0.01,
              longitudeDelta: 0.01,
            }}
          >
            <Marker
              coordinate={childBackendLocation}
              title="Child's Location"
              description="Live tracking of your child"
              pinColor="blue"
            />
            <Marker
              coordinate={location}
              title="Your Location"
              description="This device"
              pinColor="green"
            />
            <Marker
              coordinate={SCHOOL_LOCATION}
              title="School"
              description="School Location"
              pinColor="orange"
            />
            {childLocation && (
              <Marker
                coordinate={childLocation}
                title="Child Device"
                description="Real-time from this device"
                pinColor="purple"
              />
            )}
          </MapView>
        ) : (
          <Text style={styles.errorText}>Unable to fetch locations</Text>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#E6F0EE",
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  profileInfo: {
    flexDirection: "row",
    alignItems: "center",
  },
  profilePic: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginRight: 12,
  },
  childName: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#285E5E",
  },
  schoolText: {
    fontSize: 14,
    color: "#444",
  },
  classText: {
    fontSize: 13,
    color: "#666",
  },
  shieldButton: {
    backgroundColor: "#6b9080",
    padding: 10,
    borderRadius: 20,
  },
  trackingButton: {
    alignSelf: "center",
    marginVertical: 15,
    paddingVertical: 10,
    paddingHorizontal: 25,
    borderRadius: 25,
  },
  trackingButtonText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 14,
  },
  statusText: {
    fontSize: 16,
    fontWeight: "bold",
    textAlign: "center",
    color: "#285E5E",
  },
  notPresent: {
    color: "#d9534f",
  },
  mapContainer: {
    marginTop: 15,
    width: "100%",
    height: 300,
    borderRadius: 12,
    overflow: "hidden",
    backgroundColor: "#ccc",
  },
  map: {
    width: "100%",
    height: "100%",
  },
  errorText: {
    color: "#ff0000",
    textAlign: "center",
    marginTop: 20,
  },
});
