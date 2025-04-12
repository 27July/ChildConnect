import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  Image,
  FlatList,
  Alert,
  TouchableOpacity,
  RefreshControl,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { auth } from "@/firebaseConfig";
import { ip } from "@/utils/server_ip.json";
import { useRouter, useFocusEffect } from "expo-router";
import ProfilePic from "../../../assets/images/profilepic.svg";
import { useHomeObserver } from "@/observers/chatObserver";
import { fetchHomeData } from "@/controllers/homeController";

type Chat = {
  id: string;
  otherUserName: string;
  isRead: boolean;
  type?: "chat";
};

export default function TeacherHomeScreen() {
  const [profilePic, setProfilePic] = useState<string | null>(null);
  const [unreadChats, setUnreadChats] = useState<Chat[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const apiURL = `http://${ip}:8000`;
  const router = useRouter();

  const fetchData = async () => {
    try {
      setRefreshing(true);
      const { profilePic, unreadChats, announcements } = await fetchHomeData(
        "teacher"
      );
      setProfilePic(profilePic);
      setUnreadChats(unreadChats);
    } catch (err: any) {
      console.error("❌ Home fetch error:", err.message);
      Alert.alert("Error", "Could not load home screen data.");
    } finally {
      setRefreshing(false);
    }
  };

  return (
    <View className="flex-1 bg-primary-50">
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

        <Text className="text-lg font-semibold mb-2 text-primary-400">
          Announcements
        </Text>

        {unreadChats.length === 0 ? (
          <Text className="text-gray-500">No unread chats.</Text>
        ) : (
          <FlatList
            data={unreadChats}
            keyExtractor={(item) => `chat-${item.id}`}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={fetchData} />
            }
            renderItem={({ item }) => (
              <TouchableOpacity
                className="bg-white rounded-xl p-4 mb-3 shadow-sm shadow-slate-400 border border-primary-100"
                onPress={() =>
                  router.push({
                    pathname: "/chat/[id]",
                    params: { id: item.id },
                  })
                }
              >
                <Text className="text-base font-semibold text-primary-400">
                  New chat unread from {item.otherUserName}
                </Text>
              </TouchableOpacity>
            )}
          />
        )}
      </View>
    </View>
  );
}
