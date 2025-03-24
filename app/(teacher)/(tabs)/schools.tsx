import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  Image,
  Linking,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from "react-native";
import MapView, { Marker } from "react-native-maps";
import * as Location from "expo-location";
import { auth } from "@/firebaseConfig";
import { ip } from "@/utils/server_ip.json";

const SchoolInfoScreen = () => {
  const [coordinates, setCoordinates] = useState(null);
  const [loading, setLoading] = useState(true);
  const [school, setSchool] = useState<any>(null);
  const apiURL = `http://${ip}:8000`;

  useEffect(() => {
    const fetchSchoolInfo = async () => {
      try {
        const user = auth.currentUser;
        if (!user) {
          Alert.alert("User not logged in");
          return;
        }

        const token = await user.getIdToken();
        const response = await fetch(`${apiURL}/myschool`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!response.ok) throw new Error("Failed to fetch school info");

        const schoolData = await response.json();
        setSchool(schoolData);

        // Convert postal code to coordinates
        const location = await Location.geocodeAsync(schoolData.postalCode);
        if (location.length > 0) {
          setCoordinates({
            latitude: location[0].latitude,
            longitude: location[0].longitude,
          });
        }
      } catch (error) {
        console.error("Error fetching school info:", error);
        Alert.alert("Error", "Could not load school info.");
      } finally {
        setLoading(false);
      }
    };

    fetchSchoolInfo();
  }, []);

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#1E3765" />
      </View>
    );
  }

  if (!school) {
    return (
      <View style={styles.container}>
        <Text style={{ color: "red" }}>No school data found.</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Image source={{ uri: school.logo }} style={styles.logo} />

      <Text style={styles.schoolName}>{school.name}</Text>
      <Text style={styles.address}>{school.address}</Text>

      {coordinates ? (
        <MapView
          style={styles.map}
          initialRegion={{
            ...coordinates,
            latitudeDelta: 0.01,
            longitudeDelta: 0.01,
          }}
        >
          <Marker
            coordinate={coordinates}
            title={school.name}
            description={school.address}
          />
        </MapView>
      ) : (
        <Text style={{ color: "red", marginVertical: 20 }}>
          Unable to load map.
        </Text>
      )}

      <TouchableOpacity
        style={styles.websiteButton}
        onPress={() => Linking.openURL(school.website)}
      >
        <Text style={styles.websiteButtonText}>Visit Website</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f6fff8",
    alignItems: "center",
    padding: 20,
  },
  logo: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 15,
  },
  schoolName: {
    fontSize: 22,
    fontWeight: "700",
    color: "#1E3765",
    marginBottom: 5,
    textAlign: "center",
  },
  address: {
    fontSize: 14,
    color: "#666",
    marginBottom: 15,
    textAlign: "center",
  },
  map: {
    width: "100%",
    height: 200,
    borderRadius: 10,
    marginBottom: 20,
  },
  websiteButton: {
    backgroundColor: "#1E3765",
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 8,
  },
  websiteButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
});

export default SchoolInfoScreen;
