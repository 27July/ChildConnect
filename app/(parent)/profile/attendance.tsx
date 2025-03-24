import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  ActivityIndicator,
  Image,
  ScrollView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Calendar } from "react-native-calendars";
import { useLocalSearchParams } from "expo-router";
import { auth } from "@/firebaseConfig";
import { ip } from "@/utils/server_ip.json";
import ProfilePic from "../../../assets/images/profilepic.svg";
import { useRouter } from "expo-router";

export default function AttendanceScreen() {
  const { id: childId } = useLocalSearchParams();
  const [markedDates, setMarkedDates] = useState({});
  const [loading, setLoading] = useState(true);
  const [child, setChild] = useState<any>(null);
  const apiURL = `http://${ip}:8000`;
  const router = useRouter();

  useEffect(() => {
    const fetchData = async () => {
      const user = auth.currentUser;
      if (!user) return;

      const token = await user.getIdToken();

      try {
        // 🔹 Fetch attendance
        const res = await fetch(`${apiURL}/attendance-records/${childId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json(); // { "25032025": true/false, ... }

        const formatted: Record<string, any> = {};
        Object.entries(data).forEach(([compactDate, present]) => {
          const isoDate = `${compactDate.slice(4)}-${compactDate.slice(2, 4)}-${compactDate.slice(0, 2)}`;
          formatted[isoDate] = {
            customStyles: {
              container: {
                backgroundColor: present ? "green" : "red",
              },
              text: {
                color: "white",
              },
            },
          };
        });

        setMarkedDates(formatted);

        // 🔹 Fetch child details
        const childRes = await fetch(`${apiURL}/child/${childId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const childData = await childRes.json();
        setChild(childData);
      } catch (err) {
        console.error("Error fetching attendance or child:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [childId]);

  if (loading || !child) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center bg-primary-50">
        <ActivityIndicator size="large" color="#00B6AC" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-primary-50">
      <ScrollView contentContainerStyle={{ padding: 20 }}>
        {/* 🔹 Child Header */}
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
        <Text className="text-center text-[#2A2E43] mt-1 mb-4">
          Class: {child.class}   Grade: {child.grade}
        </Text>

        {/* 🔹 Attendance Calendar */}
        <Calendar
          markingType="custom"
          markedDates={markedDates}
          onDayPress={(day) => {
            const compactDate = day.dateString.split("-").reverse().join(""); // "2025-03-25" -> "25032025"
            router.push({ pathname: "../../profile/attendanceRecord", params: { date: compactDate } });
          }}          
          theme={{
            textDayFontWeight: "bold",
            monthTextColor: "#285E5E",
            arrowColor: "#285E5E",
          }}
        />
      </ScrollView>
    </SafeAreaView>
  );
}
