// Frontend: app/teacher/profile/announcementlist.tsx

import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  ActivityIndicator,
  TouchableOpacity,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams, useRouter } from "expo-router";
import { auth } from "@/firebaseConfig";
import { ip } from "@/utils/server_ip.json";

export default function AnnouncementList() {
  const { id: classid } = useLocalSearchParams();
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const apiURL = `http://${ip}:8000`;
  const router = useRouter();

  useEffect(() => {
    const fetchAnnouncements = async () => {
      const token = await auth.currentUser.getIdToken();

      const res = await fetch(`${apiURL}/announcements/${classid}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) {
        console.error("Failed to fetch announcements");
        setLoading(false);
        return;
      }

      const data = await res.json();
      setAnnouncements(data);
      setLoading(false);
    };

    fetchAnnouncements();
  }, [classid]);

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-SG", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  return (
    <SafeAreaView className="flex-1 bg-primary-50 p-5">
      <Text className="text-2xl font-bold text-center mb-6">Announcements</Text>

      {loading ? (
        <ActivityIndicator size="large" color="#285E5E" />
      ) : (
        <FlatList
          data={announcements}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <View className="bg-white rounded-2xl p-4 mb-4">
              <Text className="text-lg font-bold text-[#2A2E43] mb-1">
                {item.name}
              </Text>
              <Text className="text-[#2A2E43] mb-1">{item.content}</Text>
              <Text className="text-sm text-gray-500 mb-1">
                By {item.teachername} on {formatDate(item.created)}
              </Text>
              <Text
                className={`text-sm font-semibold ${
                  item.status === "open" ? "text-green-600" : "text-red-600"
                }`}
              >
                Status: {item.status}
              </Text>
            </View>
          )}
          ListEmptyComponent={() => (
            <Text className="text-center text-gray-500 mt-10">
              No announcements for this class.
            </Text>
          )}
        />
      )}
    </SafeAreaView>
  );
}
