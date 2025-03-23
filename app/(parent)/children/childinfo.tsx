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
  startBackgroundLocationTracking,
  stopBackgroundLocationTracking,
} from "../../../components/ChildLocationTracker";

export const options = {
  href: null,
};

export default function ChildScreen() {
  const { childId, name } = useLocalSearchParams();
  const router = useRouter();

  const [location, setLocation] =
    useState<Location.LocationObjectCoords | null>(null);
  const [loading, setLoading] = useState(true);
  const [isPresent, setIsPresent] = useState(false);
  const [isTracking, setIsTracking] = useState(false);

  const mapRef = useRef<MapView | null>(null);

  const SCHOOL_LOCATION = {
    latitude: 1.3462227582931519,
    longitude: 103.68243408203125,
    radius: 200,
  };

  const [childBackendLocation, setChildBackendLocation] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);

  useEffect(() => {
    stopBackgroundLocationTracking(); // in case tracking was still active
  }, []);

  useEffect(() => {
    let intervalId: NodeJS.Timeout;

    const fetchChildLocationFromBackend = async () => {
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
      <TouchableOpacity
        onPress={() => router.push("./childmode")}
        style={styles.childModeButton}
      >
        <FontAwesome5 name="user-shield" size={20} color="white" />
      </TouchableOpacity>

      <View style={styles.profileSection}>
        <Image
          source={require("../../../assets/images/indianboy.png")}
          style={styles.profilePic}
        />
        <Text style={styles.childName}>{name}</Text>
        <Text style={styles.schoolName}>Experimental Primary School</Text>
        <Text style={styles.childDetails}>Class: 1E4 Grade: P1</Text>
        <Text style={[styles.presenceStatus, !isPresent && styles.notPresent]}>
          Status: {isPresent ? "In School" : "Not in School"}
        </Text>
      </View>

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
              coordinate={{
                latitude: location.latitude,
                longitude: location.longitude,
              }}
              title="Your Location"
              description="This device"
              pinColor="green"
            />

            <Marker
              coordinate={{
                latitude: SCHOOL_LOCATION.latitude,
                longitude: SCHOOL_LOCATION.longitude,
              }}
              title="School"
              description="School Location"
              pinColor="orange"
            />
          </MapView>
        ) : (
          <Text style={styles.errorText}>Unable to fetch locations</Text>
        )}
      </View>

      {/* Start tracking button */}
      {/* {!isTracking && (
        <TouchableOpacity
          style={[styles.childModeButton, { top: 70 }]}
          onPress={async () => {
            await startBackgroundLocationTracking();
            setIsTracking(true);
          }}
        >
          <Text style={{ color: "white", fontWeight: "bold" }}>
            Start Tracking
          </Text>
        </TouchableOpacity>
      )} */}

      {isTracking && (
        <Text style={{ color: "#285E5E", marginTop: 10 }}>
          Tracking in progress...
        </Text>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#E6F0EE",
    alignItems: "center",
    paddingTop: 20,
  },
  childModeButton: {
    position: "absolute",
    top: 20,
    right: 20,
    backgroundColor: "#6b9080",
    padding: 10,
    borderRadius: 20,
  },
  profileSection: {
    alignItems: "center",
    marginBottom: 20,
  },
  profilePic: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 10,
  },
  childName: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#285E5E",
  },
  schoolName: {
    fontSize: 16,
    color: "#666",
    marginBottom: 5,
  },
  childDetails: {
    fontSize: 14,
    color: "#444",
    marginBottom: 10,
  },
  presenceStatus: {
    fontSize: 16,
    fontWeight: "bold",
    marginTop: 5,
    color: "#285E5E",
  },
  notPresent: {
    color: "#d9534f",
  },
  mapContainer: {
    width: "90%",
    height: 250,
    borderRadius: 10,
    overflow: "hidden",
    backgroundColor: "#ddd",
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
