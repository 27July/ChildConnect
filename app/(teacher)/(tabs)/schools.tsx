import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  Image,
  Linking,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import MapView, { Marker } from "react-native-maps";
import * as Location from "expo-location";

const SchoolInfoScreen = () => {
  const [coordinates, setCoordinates] = useState(null);
  const [loading, setLoading] = useState(true);

  //load variables from database
  const school = {
    name: "Anderson Primary School",
    logo: "https://www.andersonpri.moe.edu.sg/qql/slot/u143/Anderson_Primary_School_logo.png",
    address: "19 Ang Mo Kio Avenue 9, Singapore 569785",
    postalCode: "569785",
    website: "https://www.andersonpri.moe.edu.sg",
  };

  //coverting postal code to coordinates
  useEffect(() => {
    const fetchCoordinates = async () => {
      try {
        const location = await Location.geocodeAsync(school.postalCode);
        if (location.length > 0) {
          setCoordinates({
            latitude: location[0].latitude,
            longitude: location[0].longitude,
          });
        }
      } catch (error) {
        console.error("Geocoding error:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchCoordinates();
  }, []);

  return (
    <View style={styles.container}>
      <Image source={{ uri: school.logo }} style={styles.logo} />

      <Text style={styles.schoolName}>{school.name}</Text>
      <Text style={styles.address}>{school.address}</Text>

      {loading ? (
        <ActivityIndicator
          size="large"
          color="#1E3765"
          style={{ marginVertical: 20 }}
        />
      ) : coordinates ? (
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
