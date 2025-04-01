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
import MapView, { Marker, Callout } from "react-native-maps";
import { FontAwesome5 } from "@expo/vector-icons";
import * as Location from "expo-location";
import { calculateDistance } from "../../../components/calculateDistance";
import {
  startForegroundTracking,
  stopForegroundTracking,
} from "../../../components/ChildLocationTracker";
import { ShieldUser } from "lucide-react-native";

// Custom pin images
const childPin = require("../../../assets/map_pins/child-pin.png");
const parentPin = require("../../../assets/map_pins/parent-pin.png");
const schoolPin = require("../../../assets/map_pins/school-pin.png");

export default function ChildDetailScreen() {
  const { id: childId } = useLocalSearchParams();
  console.log("🧩 Raw childId from params:", childId, typeof childId);

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
  const [locationIntervalId, setLocationIntervalId] =
    useState<NodeJS.Timeout | null>(null);

  const mapRef = React.useRef<MapView | null>(null);

  const apiURL = `http://${ip}:8000`;
  const hasFetchedAttendance = React.useRef(false);

  //Dynamic school location
  const [schoolLocation, setSchoolLocation] = useState<{
    latitude: number;
    longitude: number;
    radius: number;
  } | null>(null);

  //Static school location for testing purposes
  // const SCHOOL_LOCATION = {
  //   latitude: 1.3462227582931519,
  //   longitude: 103.68243408203125,
  //   radius: 200,
  // };

  // ───────────────────────────────────────────────────────────────────────────
  // 1) DEFINE fetchTodayAttendance HERE, ABOVE THE USEEFFECT
  // ───────────────────────────────────────────────────────────────────────────
  const getTodayDateString = () => {
    const today = new Date();
    const dd = String(today.getDate()).padStart(2, "0");
    const mm = String(today.getMonth() + 1).padStart(2, "0");
    const yyyy = today.getFullYear();
    return `${dd}${mm}${yyyy}`;
  };

  const fetchTodayAttendance = async () => {
    console.log("🚨 fetchTodayAttendance CALLED");
    try {
      const user = auth.currentUser;
      if (!user || !childId) return;
      const token = await user.getIdToken();
      const today = getTodayDateString();

      const res = await fetch(
        `${apiURL}/attendance/${today}?childid=${childId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      console.log("✅ Attendance response:", res.status);

      if (res.ok) {
        const data = await res.json();
        const childAttendance = data[0]; // should return one entry
        setIsPresent(childAttendance?.present ?? false);
      } else {
        setIsPresent(false);
      }
    } catch (err) {
      console.error("Error fetching attendance:", err);
      setIsPresent(false);
    }
  };
  // ───────────────────────────────────────────────────────────────────────────

  // Ensure Gestures Are Enabled
  useEffect(() => {
    navigation.setOptions({ gestureEnabled: true });
  }, []);

  // ───────────────────────────────────────────────────────────────────────────
  // 2) USEEFFECT THAT CALLS fetchTodayAttendance
  // ───────────────────────────────────────────────────────────────────────────
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
      await fetchSchoolLocation();

      // ✅ Only fetch attendance once
      if (
        typeof childId === "string" &&
        childId.length > 0 &&
        !hasFetchedAttendance.current
      ) {
        console.log("📅 Fetching today's attendance for child:", childId);
        // CALL THE ARROW FUNCTION WE DEFINED ABOVE
        fetchTodayAttendance();
        hasFetchedAttendance.current = true;
      }

      setLoading(false);
    };

    if (childId) {
      fetchInitialData();
    }
  }, [childId]);

  // ───────────────────────────────────────────────────────────────────────────
  // 3) REMAINING LOGIC UNCHANGED
  // ───────────────────────────────────────────────────────────────────────────
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
            return { name, profilepic, role, userid: id };
          }
          return null;
        })
      );

      setTeachers(teacherResults.filter((t) => t !== null));
    } catch (err) {
      console.error("Error fetching detail:", err);
    }
  };

  const handleChat = async (teacherId: string) => {
    if (!teacherId) return;
    const user = auth.currentUser;
    const token = await user.getIdToken();

    try {
      const res = await fetch(`${apiURL}/startchatwith/${teacherId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      router.push({ pathname: "/chat/[id]", params: { id: data.id } });
    } catch (err) {
      Alert.alert("Chat Error", "Could not start or open chat.");
    }
  };

  const handleContactInfo = (teacherId: string) => {
    if (!teacherId) return;
    router.push({
      pathname: "/(parent)/profile/otherContact",
      params: { id: teacherId },
    });
  };

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

      if (data.istracking !== undefined) {
        setIsTracking(data.istracking);
      }

      //For location based attendance -- NOT TO BE IMPLEMENTED
      // const distance = calculateDistance(data, schoolLocation);
      // setIsPresent(distance <= schoolLocation.radius);

      if (data.timestamp) {
        const time = new Date(data.timestamp);
        setLastUpdated(time.toLocaleString());
      }
    } catch (error) {
      console.error("Failed to fetch child location from backend", error);
    }
  };

  // Fetch school location from backend
  const fetchSchoolLocation = async () => {
    const user = auth.currentUser;
    if (!user) return;
    const token = await user.getIdToken();

    try {
      const res = await fetch(`${apiURL}/school/child/${childId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) throw new Error("Failed to fetch school location");

      const data = await res.json();
      console.log("📬 Full school API response:", data);
      setSchoolLocation({
        latitude: data.latitude,
        longitude: data.longitude,
        radius: 200, // You can replace this with a field from the API if you include it later
      });
      console.log("📍 School Location Set:", data.latitude, data.longitude);
    } catch (error) {
      console.error("Error fetching school location:", error);
    }
  };

  //Fit all 3 corrdinates in the map
  useEffect(() => {
    if (mapRef.current && location && childBackendLocation && schoolLocation) {
      mapRef.current.fitToCoordinates(
        [
          { latitude: location.latitude, longitude: location.longitude },
          childBackendLocation,
          schoolLocation,
        ],
        {
          edgePadding: { top: 50, right: 50, bottom: 50, left: 50 },
          animated: true,
        }
      );
    }
  }, [location, childBackendLocation, schoolLocation]);

  useEffect(() => {
    return () => {
      if (locationIntervalId) {
        clearInterval(locationIntervalId);
        console.log("✅ Cleared location interval on unmount");
      }
    };
  }, [locationIntervalId]);

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
            pathname: "../../(childmode)/[id]",
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

        {/* School Details Button */}
        <TouchableOpacity
          className="bg-[#C6E3DE] px-4 py-2 rounded-full mt-2"
          onPress={() =>
            router.push({
              pathname: "../../profile/schoolinfo",
              params: { id: childId },
            })
          }
        >
          <Text className="text-center text-[#2A2E43] mt-1">
            {child.school}
          </Text>
          <Text className="text-center text-[#2A2E43] mt-1">
            Class: {child.class} Grade: {child.grade}
          </Text>
        </TouchableOpacity>

        <View className="bg-[#C6E3DE] px-4 py-3 rounded-full mt-3 mb-4">
          <Text className="text-center font-bold text-[#2A2E43]">
            Today's Attendance:{" "}
            <Text className={isPresent ? "text-green-600" : "text-red-500"}>
              {isPresent ? "Present" : "Absent"}
            </Text>
          </Text>
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
            <View>
              <TouchableOpacity onPress={() => handleChat(teacher.userid)}>
                <Text className="text-blue-600 mb-1">Chat</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => handleContactInfo(teacher.userid)}
              >
                <Text className="text-blue-600">Contact Info</Text>
              </TouchableOpacity>
            </View>
          </View>
        ))}

        {/* Navigation buttons */}
        {[
          { label: "Attendance Records", path: "../profile/attendance" },
          { label: "Documentation", path: "../profile/documentationlist" },
          {
            label: "Homework List",
            path: "../profile/childhomework",
          },
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
          }`}
          onPress={async () => {
            try {
              const user = auth.currentUser;
              if (!user) return;
              const token = await user.getIdToken();

              if (!isTracking) {
                // Start local foreground tracking
                await startForegroundTracking((coords) => {
                  setChildLocation(coords);
                });

                // Notify backend to start tracking
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

                // Immediately refresh map and start polling every 16s
                await fetchChildLocationFromBackend();
                const interval = setInterval(
                  fetchChildLocationFromBackend,
                  16000
                );
                setLocationIntervalId(interval);
              } else {
                // Stop tracking
                await stopForegroundTracking();
                setChildLocation(null);

                await fetch(`${apiURL}/location/stop`, {
                  method: "POST",
                  headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json",
                  },
                  body: JSON.stringify({ childid: childId }),
                });

                // Stop polling
                if (locationIntervalId) {
                  clearInterval(locationIntervalId);
                  setLocationIntervalId(null);
                }
              }

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

        <View className="flex-row items-center justify-center mb-3">
          {lastUpdated && (
            <Text className="text-center text-sm text-gray-500 mt-1">
              Last updated: {lastUpdated}
            </Text>
          )}
        </View>

        {/* Map with interactive markers */}
        <TouchableOpacity activeOpacity={0.9}>
          <View
            style={{ height: 300 }}
            className="rounded-xl overflow-hidden bg-gray-300"
          >
            {childBackendLocation && location ? (
              <MapView
                ref={mapRef}
                style={{ flex: 1 }}
                initialRegion={
                  schoolLocation
                    ? {
                        latitude: schoolLocation.latitude,
                        longitude: schoolLocation.longitude,
                        latitudeDelta: 0.01,
                        longitudeDelta: 0.01,
                      }
                    : undefined
                }
              >
                {/* Custom Child Pin */}
                <Marker coordinate={childBackendLocation}>
                  <View
                    style={{
                      backgroundColor: "white",
                      padding: 6,
                      borderRadius: 999,
                      elevation: 5,
                      shadowColor: "#000",
                      shadowOffset: { width: 0, height: 2 },
                      shadowOpacity: 0.25,
                      shadowRadius: 3.5,
                    }}
                  >
                    <Image
                      source={childPin}
                      style={{ width: 40, height: 40 }}
                      resizeMode="contain"
                    />
                  </View>
                  <Callout>
                    <Text>{child?.name || "Child"}</Text>
                  </Callout>
                </Marker>

                {/* Custom Parent Pin */}
                <Marker coordinate={location}>
                  <View
                    style={{
                      backgroundColor: "white",
                      padding: 6,
                      borderRadius: 999,
                      elevation: 5,
                      shadowColor: "#000",
                      shadowOffset: { width: 0, height: 2 },
                      shadowOpacity: 0.25,
                      shadowRadius: 3.5,
                    }}
                  >
                    <Image
                      source={parentPin}
                      style={{ width: 40, height: 40 }}
                      resizeMode="contain"
                    />
                  </View>
                  <Callout>
                    <Text>You</Text>
                  </Callout>
                </Marker>

                {/* Custom School Pin */}
                {schoolLocation?.latitude != null &&
                  schoolLocation?.longitude != null && (
                    <Marker
                      coordinate={{
                        latitude: schoolLocation.latitude,
                        longitude: schoolLocation.longitude,
                      }}
                    >
                      <View
                        style={{
                          backgroundColor: "white",
                          padding: 6,
                          borderRadius: 999,
                          elevation: 5,
                          shadowColor: "#000",
                          shadowOffset: { width: 0, height: 2 },
                          shadowOpacity: 0.25,
                          shadowRadius: 3.5,
                        }}
                      >
                        <Image
                          source={schoolPin}
                          style={{ width: 40, height: 40 }}
                          resizeMode="contain"
                        />
                      </View>
                      <Callout>
                        <Text>School</Text>
                      </Callout>
                    </Marker>
                  )}
              </MapView>
            ) : (
              <Text className="text-center text-red-500 mt-4">
                Unable to fetch locations
              </Text>
            )}
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          className="bg-primary-500 py-3 rounded-full mt-3 mb-5"
          onPress={() =>
            router.push({
              pathname: "./MapFullScreen",
              params: {
                childLat: childBackendLocation.latitude,
                childLng: childBackendLocation.longitude,
                userLat: location.latitude,
                userLng: location.longitude,
                schoolLat: schoolLocation?.latitude,
                schoolLng: schoolLocation?.longitude,
              },
            })
          }
        >
          <Text className="text-center font-bold text-white">
            View Fullscreen Map
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}
