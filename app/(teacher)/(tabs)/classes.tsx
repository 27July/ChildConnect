import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  FlatList,
  ActivityIndicator,
  TouchableOpacity,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { auth } from "@/firebaseConfig";
import { ip } from "@/utils/server_ip.json";

export default function ClassesScreen() {
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const apiURL = `http://${ip}:8000`;
  const router = useRouter();

  useEffect(() => {
    fetchMyClasses();
  }, []);

  const fetchMyClasses = async () => {
    const user = auth.currentUser;
    if (!user) return;
    const token = await user.getIdToken();

    try {
      const res = await fetch(`${apiURL}/myclasses`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (Array.isArray(data)) {
        setClasses(data);
      } else {
        console.error("Expected array but got:", data);
        setClasses([]);
      }
    } catch (error) {
      console.error("Failed to fetch classes:", error);
    } finally {
      setLoading(false);
    }
  };

  const renderClassItem = ({ item }) => (
    <TouchableOpacity
      onPress={() =>
        router.push({
          pathname: "/classes/[id]",
          params: { id: item.id, name: item.name },
        })
      }
      className="bg-white rounded-2xl p-4 mb-4 shadow-sm border border-primary-100"
    >
      <Text className="text-lg font-semibold text-primary-400">
        {item.name}
      </Text>
      <Text className="text-sm text-gray-500 mt-1">Role: {item.role}</Text>
    </TouchableOpacity>
  );

  return (
    <View className="flex-1 bg-primary-50 p-5">
      <Text className="text-3xl font-extrabold text-[#2A2E43] mb-4">
        My Classes
      </Text>
      {loading ? (
        <ActivityIndicator size="large" color="#999" />
      ) : (
        <FlatList
          data={classes}
          keyExtractor={(item) => item.id}
          renderItem={renderClassItem}
          contentContainerStyle={{ paddingBottom: 20 }}
        />
      )}
    </View>
  );
}
