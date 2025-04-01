import React, { useEffect, useRef } from "react";
import { View, Text, Image } from "react-native";
import MapView, { Marker, Callout } from "react-native-maps";
import { useLocalSearchParams } from "expo-router";
import { useNavigation } from "expo-router";
import { TouchableOpacity } from "react-native";
import { ArrowLeft } from "lucide-react-native"; // or use any icon library

// Custom pin images (adjust path if needed)
const childPin = require("../../../assets/map_pins/child-pin.png");
const parentPin = require("../../../assets/map_pins/parent-pin.png");
const schoolPin = require("../../../assets/map_pins/school-pin.png");

export default function MapFullScreen() {
  const navigation = useNavigation();
  const { childLat, childLng, userLat, userLng, schoolLat, schoolLng } =
    useLocalSearchParams();

  const childCoord = {
    latitude: Number(childLat),
    longitude: Number(childLng),
  };

  const userCoord = {
    latitude: Number(userLat),
    longitude: Number(userLng),
  };

  const schoolCoord = {
    latitude: Number(schoolLat),
    longitude: Number(schoolLng),
  };

  const mapRef = useRef(null);

  useEffect(() => {
    const timeout = setTimeout(() => {
      if (
        mapRef.current &&
        childCoord?.latitude &&
        userCoord?.latitude &&
        schoolCoord?.latitude
      ) {
        mapRef.current.fitToCoordinates([childCoord, userCoord, schoolCoord], {
          edgePadding: { top: 50, right: 50, bottom: 50, left: 50 },
          animated: true,
        });
      }
    }, 500); // 0.5 second delay

    return () => clearTimeout(timeout);
  }, [childLat, childLng, userLat, userLng, schoolLat, schoolLng]);

  return (
    <View style={{ flex: 1 }}>
      <MapView
        ref={mapRef}
        style={{ flex: 1 }}
        initialRegion={{
          latitude: childCoord.latitude,
          longitude: childCoord.longitude,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        }}
      >
        {/* Child Marker */}
        <Marker coordinate={childCoord}>
          <View style={markerContainer}>
            <Image source={childPin} style={pinStyle} resizeMode="contain" />
          </View>
          <Callout>
            <Text>Child</Text>
          </Callout>
        </Marker>

        {/* Parent Marker */}
        <Marker coordinate={userCoord}>
          <View style={markerContainer}>
            <Image source={parentPin} style={pinStyle} resizeMode="contain" />
          </View>
          <Callout>
            <Text>You</Text>
          </Callout>
        </Marker>

        {/* School Marker */}
        <Marker coordinate={schoolCoord}>
          <View style={markerContainer}>
            <Image source={schoolPin} style={pinStyle} resizeMode="contain" />
          </View>
          <Callout>
            <Text>School</Text>
          </Callout>
        </Marker>
      </MapView>
      <TouchableOpacity
        style={{
          position: "absolute",
          top: 50,
          left: 20,
          zIndex: 10,
          backgroundColor: "#ffffffee",
          padding: 10,
          borderRadius: 999,
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.25,
          shadowRadius: 3.5,
          elevation: 5,
        }}
        onPress={() => navigation.goBack()}
      >
        <ArrowLeft size={24} color="#2A2E43" />
      </TouchableOpacity>
    </View>
  );
}

const markerContainer = {
  backgroundColor: "white",
  padding: 6,
  borderRadius: 999,
  elevation: 5, // Android
  shadowColor: "#000",
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.25,
  shadowRadius: 3.5,
};

const pinStyle = {
  width: 40,
  height: 40,
};
