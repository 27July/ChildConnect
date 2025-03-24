import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  Linking,
} from "react-native";
import MapView, { Marker } from "react-native-maps";
import * as Location from "expo-location";
import { SafeAreaView } from "react-native-safe-area-context";
import { auth } from "@/firebaseConfig";
import { ip } from "@/utils/server_ip.json";

export default function SchoolsScreen() {
  const [schools, setSchools] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const apiURL = `http://${ip}:8000`;

  useEffect(() => {
    const fetchSchools = async () => {
      const user = auth.currentUser;
      if (!user) {
        console.warn("User not logged in");
        return;
      }
      const token = await user.getIdToken();

      try {
        console.log("Fetching schools from:", `${apiURL}/schoolsinfo`);
        const res = await fetch(`${apiURL}/schoolsinfo`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!res.ok) throw new Error("Failed to fetch schools");

        const data = await res.json();
        console.log("Raw school data from backend:", data);

        const enriched = await Promise.all(
          data.map(async (school: any) => {
            console.log("Attempting to geocode postal code:", school.postal_code);

            try {
              const location = await Location.geocodeAsync(school.postal_code);
              if (location.length > 0) {
                const enrichedSchool = {
                  ...school,
                  coordinates: {
                    latitude: location[0].latitude,
                    longitude: location[0].longitude,
                  },
                };
                console.log("Geocoded:", enrichedSchool);
                return enrichedSchool;
              } else {
                console.warn("No location returned for:", school.school_name);
              }
            } catch (e) {
              console.warn("Geocoding failed for:", school.school_name, e);
            }

            return school; // Still return the school even if geocoding fails
          })
        );

        console.log("Final list of enriched schools:", enriched);
        setSchools(enriched);
      } catch (err) {
        console.error("Error fetching schools:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchSchools();
  }, []);

  if (loading) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center bg-primary-50">
        <ActivityIndicator size="large" color="#1E3765" />
      </SafeAreaView>
    );
  }

  if (schools.length === 0) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center bg-primary-50 px-5">
        <Text className="text-xl font-bold text-gray-500 text-center">
          No schools available for your children.
        </Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-primary-50">
      <FlatList
        data={schools}
        keyExtractor={(item) => item.school_name}
        contentContainerStyle={{ padding: 20 }}
        renderItem={({ item }) => (
          <View className="bg-white p-5 rounded-2xl mb-5">
            <Text className="text-xl font-bold text-primary-400 mb-1 text-center">
              {item.school_name}
            </Text>
            <Text className="text-sm text-gray-600 text-center mb-1">
              {item.address}
            </Text>
            <Text className="text-sm text-gray-500 text-center mb-3">
              Postal Code: {item.postal_code}
            </Text>

            <View className="items-center mb-3">
              {item.principal_name && (
                <Text className="text-sm text-gray-500">
                  Principal: {item.principal_name}
                </Text>
              )}
              {item.first_vp_name && item.first_vp_name !== "NA" && (
                <Text className="text-sm text-gray-500">
                  Vice Principal: {item.first_vp_name}
                </Text>
              )}
              {item.email_address && (
                <Text className="text-sm text-gray-500">
                  Email Address: {item.email_address}
                </Text>
              )}
              {item.fax_no && (
                <Text className="text-sm text-gray-500 mb-1">
                  Fax: {item.fax_no}
                </Text>
              )}
            </View>

            {item.telephone_no && item.telephone_no !== "na" && (
              <TouchableOpacity
                className="bg-primary-400 py-3 px-28 rounded-md mb-4"
                onPress={() => Linking.openURL(`tel:${item.telephone_no}`)}
              >
                <Text className="text-white font-semibold text-base text-center">
                  Call School
                </Text>
              </TouchableOpacity>
            )}

            {item.coordinates ? (
              <MapView
                style={{ width: "100%", height: 200, borderRadius: 12, marginBottom: 12 }}
                initialRegion={{
                  ...item.coordinates,
                  latitudeDelta: 0.01,
                  longitudeDelta: 0.01,
                }}
              >
                <Marker
                  coordinate={item.coordinates}
                  title={item.school_name}
                  description={item.address}
                />
              </MapView>
            ) : (
              <Text className="text-red-500 mb-3 text-center">Map unavailable</Text>
            )}

            {item.url_address ? (
              <TouchableOpacity
                className="bg-primary-400 py-3 px-28 rounded-md"
                onPress={() =>
                  Linking.openURL(
                    item.url_address.startsWith("http")
                      ? item.url_address
                      : `https://${item.url_address}`
                  )
                }
              >
                <Text className="text-white font-semibold text-base text-center">
                  Visit Website
                </Text>
              </TouchableOpacity>
            ) : (
              <Text className="text-gray-400 mt-2 text-center">No website available</Text>
            )}
          </View>
        )}
      />
    </SafeAreaView>
  );
}
