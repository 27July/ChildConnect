import React, { useEffect, useState } from "react";
import { View, Text, Image, FlatList, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { auth } from "@/firebaseConfig";
import { ip } from "@/utils/server_ip.json";
import ProfilePic from "../../../assets/images/profilepic.svg";

// 🔹 Types
type Announcement = {
  id: string;
  name: string;
  content: string;
  classname: string;
  teachername: string;
};

export default function HomeScreen() {
  const [profilePic, setProfilePic] = useState<string | null>(null);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);

  const apiURL = `http://${ip}:8000`;

  useEffect(() => {
    const fetchData = async () => {
      const user = auth.currentUser;
      if (!user) {
        Alert.alert("Error", "No user logged in.");
        return;
      }

      try {
        const token = await user.getIdToken();

        // 🔹 Step 1: Get profile (to fetch profilepic)
        const profileRes = await fetch(`${apiURL}/profile`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const profileData = await profileRes.json();
        setProfilePic(profileData.profilepic || null);

        // 🔹 Step 2: Get announcements for this user's children
        const annRes = await fetch(`${apiURL}/homeinfo`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!annRes.ok) throw new Error("Failed to fetch announcements");

        const res = await annRes.json();
        setProfilePic(res.profilepic || null);
        setAnnouncements(res.announcements || []);
      } catch (err: any) {
        console.error("❌ Home fetch error:", err.message);
        Alert.alert("Error", "Could not load home screen data.");
      }
    };

    fetchData();
  }, []);

  return (
    <SafeAreaView className="flex-1 bg-primary-50">
          <View className="p-5">
            {/* 🔹 Profile Image */}
            <View className="items-center mb-4">
      {profilePic ? (
        <Image
          source={{ uri: profilePic }}
          className="w-20 h-20 rounded-full mb-2 bg-gray-200"
        />
      ) : (
        <ProfilePic width={80} height={80} />
      )}
    </View>


        <Text className="text-xl font-bold text-primary-400 mb-3 text-center">
          Welcome Back!
        </Text>

        {/* 🔹 Announcements Section */}
        <Text className="text-lg font-semibold mb-2 text-primary-400">
          Announcements
        </Text>

        {announcements.length === 0 ? (
          <Text className="text-gray-500">No open announcements.</Text>
        ) : (
          <FlatList
            data={announcements}
            keyExtractor={(item) => item.id}
            bounces = {false}
            renderItem={({ item }) => (
              <View className="bg-white rounded-xl p-4 mb-3 shadow">
                <Text className="text-lg font-bold text-primary-400">
                  {item.name}
                </Text>
                <Text className="text-sm text-primary-300">
                  Class: {item.classname}
                </Text>
                <Text className="text-sm text-primary-300">
                  Teacher: {item.teachername}
                </Text>
                <Text className="mt-1 text-gray-700">{item.content}</Text>
              </View>
            )}
          />
        )}
      </View>
    </SafeAreaView>
  );
}
