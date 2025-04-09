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

export default function GradeListScreen() {
  const { id } = useLocalSearchParams(); // classid
  const router = useRouter();
  const [tests, setTests] = useState([]);
  const [loading, setLoading] = useState(true);
  const apiURL = `http://${ip}:8000`;

  useEffect(() => {
    fetchTests();
  }, [id]);

  const fetchTests = async () => {
    const token = await auth.currentUser.getIdToken();
    try {
      const res = await fetch(`${apiURL}/grades/by-class/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) throw new Error("Failed to fetch tests");

      const data = await res.json();
      setTests(data);
    } catch (err) {
      console.error("Error fetching tests:", err);
    } finally {
      setLoading(false);
    }
  };

  const renderItem = ({ item }) => (
    <TouchableOpacity
      className="bg-white px-4 py-3 rounded-xl mb-3 shadow-sm"
      onPress={() =>
        router.push({
          pathname: "/(teacher)/profile/testResult",
          params: { id: item.docid },
        })
      }
    >
      <Text className="text-lg font-semibold text-primary-400">{item.testname}</Text>
      <Text className="text-sm text-gray-500 mt-1">Class: {item.class}</Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView className="flex-1 bg-primary-50 px-5 pt-6">
      <Text className="text-2xl font-extrabold text-[#2A2E43] mb-4">Grades</Text>
      <TouchableOpacity
          className="bg-primary-400 px-4 py-3 rounded-xl mb-4 shadow-sm items-center"
          onPress={() =>
            router.push({
              pathname: "/(teacher)/profile/newTest",
              params: { id }, // pass the class ID to prefill if needed
            })
          }
        >
          <Text className="text-white font-semibold">Add New Test</Text>
        </TouchableOpacity>

      {loading ? (
        <ActivityIndicator size="large" color="#999" />
      ) : (
        <FlatList
          data={tests}
          renderItem={renderItem}
          keyExtractor={(item) => item.docid}
          contentContainerStyle={{ paddingBottom: 40 }}
        />
      )}
    </SafeAreaView>
  );
}
