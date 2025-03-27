import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  Image,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  StyleSheet,
} from "react-native";
import { useLocalSearchParams, useNavigation } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { auth } from "@/firebaseConfig";
import { ip } from "@/utils/server_ip.json";
import ProfilePic from "../../../assets/images/profilepic.svg";
import { useRouter } from "expo-router";
import MapView, { Marker } from "react-native-maps";
import { FontAwesome5 } from "@expo/vector-icons";
import * as Location from "expo-location";
import { calculateDistance } from "../../../components/calculateDistance";
import {
  startForegroundTracking,
  stopForegroundTracking,
} from "../../../components/ChildLocationTracker";
import { ShieldUser } from "lucide-react-native";

export default function ChildDetailScreen() {
  const { id: childId } = useLocalSearchParams();
  const router = useRouter();
  const navigation = useNavigation();
  const [child, setChild] = useState<any>(null);
  const [teachers, setTeachers] = useState<any[]>([]);
  const [childBackendLocation, setChildBackendLocation] = useState<any>(null);
  const [childLocation, setChildLocation] =
    useState<Location.LocationObjectCoords | null>(null);
  const [location, setLocation] =
    useState<Location.LocationObjectCoords | null>(null);
  const [loading, setLoading] = useState(true);
  const [isTracking, setIsTracking] = useState(false);
  const [isPresent, setIsPresent] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);

  const mapRef = React.useRef<MapView | null>(null);

  const apiURL = `http://${ip}:8000`;

  const SCHOOL_LOCATION = {
    latitude: 1.3462227582931519,
    longitude: 103.68243408203125,
    radius: 200,
  };
  // Ensure Gestures Are Enabled
  useEffect(() => {
    navigation.setOptions({ gestureEnabled: true });
  }, []);

  // Fetch Initial Location Data
  useEffect(() => {
    const fetchInitialData = async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        Alert.alert("Permission Denied", "Location access is required.");
        setLoading(false);
        return;
      }

      try {
        const currentLocation = await Location.getCurrentPositionAsync({});
        setLocation(currentLocation.coords);
      } catch (err) {
        console.error("Error fetching location:", err);
      }

      await fetchChildData();
      await fetchChildLocationFromBackend();
      setLoading(false);
    };

    fetchInitialData();
  }, [childId]);

  // Fetch Child Data
  const fetchChildData = async () => {
    const user = auth.currentUser;
    if (!user) return;
    const token = await user.getIdToken();

    try {
      const childRes = await fetch(`${apiURL}/child/${childId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const childData = await childRes.json();
      setChild(childData);

      const classRes = await fetch(`${apiURL}/classbyname/${childData.class}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const classData = await classRes.json();

      const teacherEntries = [
        { id: classData.teacherId, role: "Form Teacher" },
        ...(classData.subteachers || []).map((id: string) => ({
          id,
          role: "Teacher",
        })),
      ];

      const teacherResults = await Promise.all(
        teacherEntries.map(async ({ id, role }) => {
          const res = await fetch(`${apiURL}/users/${id}`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          if (res.ok) {
            const { name, profilepic } = await res.json();
            return { name, profilepic, role };
          }
          return null;
        })
      );

      setTeachers(teacherResults.filter((t) => t !== null));
    } catch (err) {
      console.error("Error fetching detail:", err);
    }
  };
  // Fetch Child Location From Backend
  const fetchChildLocationFromBackend = async () => {
    try {
      const user = auth.currentUser;
      if (!user) return;
      const token = await user.getIdToken();

      const res = await fetch(`${apiURL}/location/${childId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) throw new Error("Failed to fetch location");

      const data = await res.json();
      setChildBackendLocation(data);

      //Sync backend istracking state with frontend
      if (data.istracking !== undefined) {
        setIsTracking(data.istracking);
      }

      const distance = calculateDistance(data, SCHOOL_LOCATION); // Calculate distance from school
      setIsPresent(distance <= SCHOOL_LOCATION.radius); // Check if child is within school radius

      if (data.timestamp) {
        const time = new Date(data.timestamp);
        setLastUpdated(time.toLocaleString());
      }
    } catch (error) {
      console.error("Failed to fetch child location from backend", error);
    }
  };

  useEffect(() => {
    if (mapRef.current && location && childBackendLocation) {
      mapRef.current.fitToCoordinates(
        // Fit map to show all markers
        [
          { latitude: location.latitude, longitude: location.longitude },
          childBackendLocation,
          SCHOOL_LOCATION,
        ],
        {
          edgePadding: { top: 50, right: 50, bottom: 50, left: 50 },
          animated: true,
        }
      );
    }
  }, [location, childBackendLocation]);

  if (loading) {
    return (
      <SafeAreaView className="flex-1 justify-center items-center bg-white">
        <ActivityIndicator size="large" color="#285E5E" />
        <Text className="mt-4 text-gray-600">Loading child details...</Text>
      </SafeAreaView>
    );
  }

  if (!child) {
    return (
      <SafeAreaView className="flex-1 justify-center items-center bg-white">
        <Text className="text-red-500">Failed to load child data.</Text>
      </SafeAreaView>
    );
  }

  const renderProfileImage = (uri: string | null) => {
    if (!uri || uri.trim() === "") {
      return <ProfilePic width={48} height={48} />;
    }
    return <Image source={{ uri }} className="w-12 h-12 rounded-full" />;
  };

  return (
    <SafeAreaView className="flex-1 bg-primary-50">
      {/* Top-right button */}
      <TouchableOpacity
        style={{
          position: "absolute",
          top: 60,
          right: 20,
          zIndex: 10,
          backgroundColor: "#C6E3DE",
          padding: 10,
          borderRadius: 50,
        }}
        onPress={() => {
          router.push({
            pathname: "../../(child)/[id]",
            params: { id: childId },
          });
        }}
      >
        <ShieldUser color="#2A2E43" size={24} />
      </TouchableOpacity>

      <ScrollView contentContainerStyle={{ padding: 20 }}>
        <View className="items-center mb-4">
          {child.profilepic ? (
            <Image
              source={{ uri: child.profilepic }}
              className="w-32 h-32 rounded-full"
            />
          ) : (
            <ProfilePic width={128} height={128} />
          )}
        </View>

        <Text className="text-xl font-bold text-center text-[#2A2E43]">
          {child.name}
        </Text>
        <Text className="text-center text-[#2A2E43] mt-1">{child.school}</Text>
        <Text className="text-center text-[#2A2E43] mt-1">
          Class: {child.class} Grade: {child.grade}
        </Text>

        <View className="bg-[#C6E3DE] px-4 py-3 rounded-full mt-5 mb-4">
          <Text className="text-center font-bold text-[#2A2E43]">
            Today's Attendance:{" "}
            <Text className="text-[#00B6AC]">
              {isPresent ? "Present" : "Absent"}
            </Text>
          </Text>
          {lastUpdated && (
            <Text className="text-center text-xs text-gray-500 mt-1">
              Last updated: {lastUpdated}
            </Text>
          )}
        </View>

        {teachers.map((teacher, idx) => (
          <View
            key={idx}
            className="flex-row bg-white rounded-xl items-center p-4 mb-3"
          >
            {renderProfileImage(teacher.profilepic)}
            <View className="flex-1 ml-4">
              <Text className="font-semibold text-[#2A2E43]">
                {teacher.name}
              </Text>
              <Text className="text-[#6C7A93] text-sm">{teacher.role}</Text>
            </View>
          </View>
        ))}

        {/* Navigation buttons */}
        {[
          { label: "Attendance Records", path: "../../profile/attendance" },
          { label: "Documentation", path: "../../profile/documentationlist" },
          { label: "Homework List", path: "../../profile/childhomework" },
        ].map(({ label, path }, index) => (
          <TouchableOpacity
            key={index}
            className="bg-[#C6E3DE] py-4 rounded-full mb-3"
            onPress={() =>
              router.push({ pathname: path, params: { id: childId } })
            }
          >
            <Text className="text-center font-bold text-[#2A2E43]">
              {label}
            </Text>
          </TouchableOpacity>
        ))}

        {/* Tracking Button */}
        <TouchableOpacity
          className={`py-4 rounded-full mb-3 ${
            isTracking ? "bg-danger" : "bg-primary-500"
          }`} // Change button color based on tracking state
          onPress={async () => {
            try {
              const user = auth.currentUser;
              if (!user) return;
              const token = await user.getIdToken();

              if (!isTracking) {
                // Start local foreground tracking (for display)
                await startForegroundTracking((coords) => {
                  setChildLocation(coords);
                });

                // ✅ Notify backend to start tracking
                await fetch(`${apiURL}/location/update`, {
                  method: "POST",
                  headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json",
                  },
                  body: JSON.stringify({
                    childid: childId,
                    latitude: location?.latitude,
                    longitude: location?.longitude,
                    istracking: true,
                  }),
                });
              } else {
                // Stop local foreground tracking
                await stopForegroundTracking();
                setChildLocation(null);

                // ✅ Notify backend to stop tracking
                await fetch(`${apiURL}/location/stop`, {
                  method: "POST",
                  headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json",
                  },
                  body: JSON.stringify({ childid: childId }),
                });
              }

              // ✅ Flip local tracking state
              setIsTracking(!isTracking);
            } catch (err) {
              Alert.alert(
                "Tracking Error",
                "Failed to toggle location tracking."
              );
            }
          }}
        >
          <Text className="text-center font-bold text-white">
            {isTracking ? "Stop Tracking" : "Activate Tracking"}
          </Text>
        </TouchableOpacity>

        {/* Map */}
        <View
          style={{ height: 300 }}
          className="rounded-xl overflow-hidden bg-gray-300"
        >
          {childBackendLocation && location ? (
            <MapView
              ref={mapRef}
              style={{ flex: 1 }}
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
                pinColor="blue"
              />
              <Marker
                coordinate={location}
                title="Your Location"
                pinColor="green"
              />
              <Marker
                coordinate={SCHOOL_LOCATION}
                title="School"
                pinColor="orange"
              />
              {childLocation && (
                <Marker
                  coordinate={childLocation}
                  title="Child Device"
                  pinColor="purple"
                />
              )}
            </MapView>
          ) : (
            <Text className="text-center text-red-500 mt-4">
              Unable to fetch locations
            </Text>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
