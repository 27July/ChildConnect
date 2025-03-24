import React, { useEffect, useState } from "react";
import { View, Text, Image, ScrollView } from "react-native";
import { useLocalSearchParams } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { auth } from "@/firebaseConfig";
import { ip } from "@/utils/server_ip.json";
import ProfilePic from "../../../assets/images/profilepic.svg";

export default function AttendanceRecord() {
  const { date } = useLocalSearchParams();
  const [entries, setEntries] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const apiURL = `http://${ip}:8000`;

  useEffect(() => {
    const fetchDetails = async () => {
      const user = auth.currentUser;
      if (!user) return;
      const token = await user.getIdToken();

      try {
        const res = await fetch(`${apiURL}/attendance/${date}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!res.ok) {
          setEntries([]);
          return;
        }

        const data = await res.json(); // [{ childid, image, present }]
        const enriched = await Promise.all(
          data.map(async (entry: any) => {
            const childRes = await fetch(`${apiURL}/child/${entry.childid}`, {
              headers: { Authorization: `Bearer ${token}` },
            });
            const childData = await childRes.json();
            return {
              ...entry,
              name: childData.name,
              class: childData.class,
              grade: childData.grade,
              profilepic: childData.profilepic,
            };
          })
        );

        setEntries(enriched);
      } catch (err) {
        console.error("Error fetching attendance record:", err);
        setEntries([]);
      } finally {
        setLoading(false);
      }
    };

    fetchDetails();
  }, [date]);

  return (
    <SafeAreaView className="flex-1 bg-primary-50 p-5">
      <ScrollView>
        <Text className="text-2xl font-bold text-center mb-4">
          Attendance {formatDisplayDate(date as string)}
        </Text>

        {entries.length === 0 ? (
          <View className="items-center justify-center mt-20">
          <Text className="text-xl font-semibold text-red-500 mb-2">
            No data recorded for this day
          </Text>
          <Text className="text-base text-gray-500 text-center px-8">
            Contact a teacher if you believe this is an error.
          </Text>
        </View>
        
        ) : (
          entries.map((entry, idx) => (
            <View
              key={idx}
              className="bg-white rounded-xl px-4 py-6 mb-5 items-center"
            >
              {/* 🔹 Profile Image (top) */}
              {entry.profilepic && entry.profilepic !== "" ? (
                <Image
                  source={{ uri: entry.profilepic }}
                  className="w-24 h-24 rounded-full mb-2"
                />
              ) : (
                <ProfilePic width={96} height={96} className="mb-2" />
              )}

              {/* 🔹 Name + School Info */}
              <Text className="text-primary-400 font-bold text-lg">
                {entry.name}
              </Text>
              <Text className="text-[#6C7A93] mb-4">
                Class: {entry.class}   Grade: {entry.grade}
              </Text>

              {/* 🔹 Attendance Image + Status */}
              <View className="flex-row items-center justify-between w-full px-4">
                {/* Attendance Image */}
                {entry.image && entry.image !== "null" ? (
                  <Image
                    source={{ uri: entry.image }}
                    className="w-32 h-32 rounded-xl"
                  />
                ) : (
                  <ProfilePic width={128} height={128} />
                )}

                {/* 🔹 Status depends on entry.present */}
                <Text
                  className={`text-lg font-bold ${
                    entry.present ? "text-green-600" : "text-red-600"
                  }`}
                >
                  {entry.present ? "Present" : "Absent"}
                </Text>
              </View>
            </View>
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

function formatDisplayDate(dateString: string): string {
  if (dateString.length !== 8) return dateString;
  const day = dateString.slice(0, 2);
  const month = dateString.slice(2, 4);
  const year = dateString.slice(4);
  return `${day}/${month}/${year}`;
}
