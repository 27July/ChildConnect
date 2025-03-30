import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  Linking,
} from "react-native";
import MapView, { Marker } from "react-native-maps";
import * as Location from "expo-location";
import { SafeAreaView } from "react-native-safe-area-context";
import { auth } from "@/firebaseConfig";
import { ip } from "@/utils/server_ip.json";
import { useLocalSearchParams } from "expo-router";

export default function ChildSchoolScreen() {
  const { id: childId } = useLocalSearchParams();
  const [school, setSchool] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const apiURL = `http://${ip}:8000`;

  useEffect(() => {
    const fetchSchool = async () => {
      const user = auth.currentUser;
      if (!user) return;

      const token = await user.getIdToken();

      try {
        const res = await fetch(`${apiURL}/school/child/${childId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!res.ok) throw new Error("Failed to fetch school info");

        const schoolData = await res.json();

        // Attempt to geocode postal code
        const geocode = await Location.geocodeAsync(schoolData.postal_code);
        if (geocode.length > 0) {
          schoolData.coordinates = {
            latitude: geocode[0].latitude,
            longitude: geocode[0].longitude,
          };
        }

        setSchool(schoolData);
      } catch (err) {
        console.error("Error fetching school:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchSchool();
  }, [childId]);

  if (loading) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center bg-primary-50">
        <ActivityIndicator size="large" color="#1E3765" />
      </SafeAreaView>
    );
  }

  if (!school) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center bg-primary-50 px-5">
        <Text className="text-xl font-bold text-gray-500 text-center">
          School information not available.
        </Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-primary-50 justify-center items-center px-5">
      <View className="w-full items-center">
        <Text className="text-xl font-bold text-primary-400 mb-1 text-center">
          {school.school_name}
        </Text>
        <Text className="text-sm text-gray-600 text-center mb-1">
          {school.address}
        </Text>
        <Text className="text-sm text-gray-500 text-center mb-3">
          Postal Code: {school.postal_code}
        </Text>

        {school.principal_name && (
          <Text className="text-sm text-gray-500 text-center">
            Principal: {school.principal_name}
          </Text>
        )}

        {school.first_vp_name && school.first_vp_name !== "NA" && (
          <Text className="text-sm text-gray-500 text-center">
            Vice Principal: {school.first_vp_name}
          </Text>
        )}

        {school.email_address && (
          <Text className="text-sm text-gray-500 text-center">
            Email: {school.email_address}
          </Text>
        )}

        {school.telephone_no && (
          <TouchableOpacity
            className="bg-primary-400 py-3 px-10 rounded-md mt-4"
            onPress={() => Linking.openURL(`tel:${school.telephone_no}`)}
          >
            <Text className="text-white font-semibold text-base text-center">
              Call School
            </Text>
          </TouchableOpacity>
        )}

        {school.coordinates ? (
          <MapView
            style={{
              width: "100%",
              height: 200,
              borderRadius: 12,
              marginTop: 12,
            }}
            initialRegion={{
              ...school.coordinates,
              latitudeDelta: 0.01,
              longitudeDelta: 0.01,
            }}
          >
            <Marker
              coordinate={school.coordinates}
              title={school.school_name}
              description={school.address}
            />
          </MapView>
        ) : (
          <Text className="text-red-500 mt-3 text-center">Map unavailable</Text>
        )}

        {school.url_address ? (
          <TouchableOpacity
            className="bg-primary-400 py-3 px-10 rounded-md mt-4"
            onPress={() =>
              Linking.openURL(
                school.url_address.startsWith("http")
                  ? school.url_address
                  : `https://${school.url_address}`
              )
            }
          >
            <Text className="text-white font-semibold text-base text-center">
              Visit Website
            </Text>
          </TouchableOpacity>
        ) : (
          <Text className="text-gray-400 mt-2 text-center">
            No website available
          </Text>
        )}
      </View>
    </SafeAreaView>
  );
}
