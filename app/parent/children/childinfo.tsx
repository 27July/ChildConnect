import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
  // SafeAreaView,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { FontAwesome5 } from "@expo/vector-icons";
import MapView, { Marker } from "react-native-maps";
import * as Location from "expo-location";
import { SafeAreaView } from "react-native-safe-area-context";

export default function ChildScreen() {
  const { childId, name } = useLocalSearchParams();
  const router = useRouter();
  const [location, setLocation] =
    useState<Location.LocationObjectCoords | null>(null);
  const [loading, setLoading] = useState(true);
  const [isPresent, setIsPresent] = useState(false);

  // ✅ School Location for Geofencing
  const SCHOOL_LOCATION = {
    latitude: 1.3462227582931519, // replace with real school latitude
    longitude: 103.68243408203125, // replace with real school longitude
    radius: 200, // in meters
  };

  // ✅ Fetch Child's Location & Check Presence
  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        Alert.alert(
          "Permission Denied",
          "Location access is required to track the child's location."
        );
        setLoading(false);
        return;
      }

      let currentLocation = await Location.getCurrentPositionAsync({});
      setLocation(currentLocation.coords);
      setLoading(false);

      console.log(currentLocation); //DEBUGGING Current Location

      // ✅ Calculate distance to school
      const toRad = (value: number) => (value * Math.PI) / 180;

      const calculateDistance = (coords1: any, coords2: any) => {
        const R = 6371e3; // metres
        const φ1 = toRad(coords1.latitude);
        const φ2 = toRad(coords2.latitude);
        const Δφ = toRad(coords2.latitude - coords1.latitude);
        const Δλ = toRad(coords2.longitude - coords1.longitude);

        const a =
          Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
          Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

        const distance = R * c; // in metres
        return distance;
      };

      const distance = calculateDistance(
        currentLocation.coords,
        SCHOOL_LOCATION
      );

      console.log("Distance to school:", distance); //DEBUGGING Distance to school
      setIsPresent(distance <= SCHOOL_LOCATION.radius);
    })();
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      {/* ✅ Child Mode Toggle Button (Top Right) */}
      <TouchableOpacity
        onPress={() => router.push("./childmode")}
        style={styles.childModeButton}
      >
        <FontAwesome5 name="user-shield" size={20} color="white" />
      </TouchableOpacity>

      {/* ✅ Profile Section */}
      <View style={styles.profileSection}>
        <Image
          source={require("../../../assets/images/indianboy.png")}
          style={styles.profilePic}
        />
        <Text style={styles.childName}>{name}</Text>
        <Text style={styles.schoolName}>Experimental Primary School</Text>
        <Text style={styles.childDetails}>Class: 1E4 Grade: P1</Text>
        <Text style={styles.presenceStatus}>
          Status: {isPresent ? "Present" : "Not Present"}
        </Text>
      </View>

      {/* ✅ Live Map */}
      <View style={styles.mapContainer}>
        {loading ? (
          <ActivityIndicator size="large" color="#285E5E" />
        ) : location ? (
          <MapView
            style={styles.map}
            initialRegion={{
              latitude: location.latitude,
              longitude: location.longitude,
              latitudeDelta: 0.01,
              longitudeDelta: 0.01,
            }}
          >
            <Marker
              coordinate={{
                latitude: location.latitude,
                longitude: location.longitude,
              }}
              title="Child's Location"
              description="Live tracking of your child"
            />
          </MapView>
        ) : (
          <Text style={styles.errorText}>Unable to fetch location</Text>
        )}
      </View>
    </SafeAreaView>
  );
}

// ✅ Styles
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
    backgroundColor: "#285E5E",
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
    color: "#285E5E",
    fontWeight: "bold",
    marginTop: 5,
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
