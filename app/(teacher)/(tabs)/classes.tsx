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

export default function ClassesScreen() {
  const router = useRouter();
  const [classes, setClasses] = useState<any[]>([]);
  const apiURL = `http://${ip}:8000`;

  useEffect(() => {
    const fetchClasses = async () => {
      const user = auth.currentUser;
      if (!user) {
        Alert.alert("Error", "User not logged in.");
        return;
      }

      const token = await user.getIdToken();

      try {
        const response = await fetch(`${apiURL}/myclasses`, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) throw new Error("Failed to fetch classes");

        const data = await response.json();
        setClasses(data);
      } catch (error) {
        console.error("Error fetching classes:", error);
        Alert.alert("Error", "Failed to load classes.");
      }
    };

    fetchClasses();
  }, []);

  return (
    <SafeAreaView className="flex-1 bg-primary-50">
      <View className="p-5">
        <Text className="text-2xl font-bold text-primary-400 mb-4">
          My Classes
        </Text>
        <FlatList
          data={classes}
          keyExtractor={(item) => item.id}
          bounces={false}
          renderItem={({ item }) => (
            <TouchableOpacity className="bg-white p-4 rounded-2xl mb-3 shadow">
              <Text className="text-lg font-bold text-primary-400">
                {item.name}
              </Text>
              <Text className="text-base text-primary-300">
                {item.role}
              </Text>
            </TouchableOpacity>
          )}
        />
      </View>
    </SafeAreaView>
  );
}
