import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Alert,
  SafeAreaView,
} from "react-native";
import { useRouter } from "expo-router";
import { auth } from "@/firebaseConfig";
import { ip } from "@/utils/server_ip.json";

export default function ChildrenScreen() {
  const router = useRouter();
  const [children, setChildren] = useState<any[]>([]);
  const apiURL = `http://${ip}:8000`;

useEffect(() => {
  const fetchChildren = async () => {
    const user = auth.currentUser;
    if (!user) {
      Alert.alert("Error", "User not logged in.");
      return;
    }

    const token = await user.getIdToken();

    try {
      const response = await fetch(`${apiURL}/mychildren`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) throw new Error("Failed to fetch children");

      const data = await response.json();
      setChildren(data);
    } catch (error) {
      console.error("Error fetching children:", error);
      Alert.alert("Error", "Failed to load children.");
    }
  };

  fetchChildren();
}, []);


  return (
    <SafeAreaView className="flex-1 bg-primary-50">
      <View className="p-5">
        <Text className="text-2xl font-bold text-primary-400 mb-4">Select a Child</Text>
        <FlatList
          data={children}
          keyExtractor={(item) => item.id}
          bounces = {false}
          renderItem={({ item }) => (
            <TouchableOpacity className="bg-white p-4 rounded-2xl mb-3 shadow">
              <Text className="text-lg font-bold text-primary-400">{item.name}</Text>
              <Text className="text-base text-primary-300">{item.school}</Text>
            </TouchableOpacity>
          )}
        />
      </View>
    </SafeAreaView>
  );
}
