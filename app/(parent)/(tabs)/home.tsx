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
import { fetchHomeData } from "@/controllers/homeController";

// 🔹 Types
type Announcement = {
  id: string;
  name: string;
  content: string;
  classname: string;
  teachername: string;
  children?: string[];
  type?: "announcement";
};

type Chat = {
  id: string;
  otherUserName: string;
  isRead: boolean;
  type?: "chat";
};

export default function HomeScreen() {
  const [profilePic, setProfilePic] = useState<string | null>(null);
  const [combinedItems, setCombinedItems] = useState<(Announcement | Chat)[]>(
    []
  );
  const [refreshing, setRefreshing] = useState(false);
  const apiURL = `http://${ip}:8000`;
  const router = useRouter();

  const fetchData = async () => {
    try {
      setRefreshing(true);
      const { profilePic, unreadChats, announcements } = await fetchHomeData("parent");
      setProfilePic(profilePic);
      setCombinedItems([...announcements, ...unreadChats]);
    } catch (err: any) {
      console.error("❌ Home fetch error:", err.message);
      Alert.alert("Error", "Could not load home screen data.");
    } finally {
      setRefreshing(false);
    }
  };
  
      // ✅ Unread Chats
      const chatRes = await fetch(`${apiURL}/findchats`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const chatData = await chatRes.json();
      const unreadChats: Chat[] = chatData
        .filter((chat: Chat) => !chat.isRead)
        .map((chat) => ({
          ...chat,
          type: "chat",
        }));
  
      setCombinedItems([...announcements, ...unreadChats]);
    } catch (err: any) {
      console.error("❌ Home fetch error:", err.message);
      Alert.alert("Error", "Could not load home screen data.");
    } finally {
      setRefreshing(false);
    }
  };
  

  useFocusEffect(
    useCallback(() => {
      fetchData();
    }, [])
  );

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

        {/* 🔹 Combined Announcements + New Chats */}
        <Text className="text-lg font-semibold mb-2 text-primary-400">
          Announcements
        </Text>

        {combinedItems.length === 0 ? (
          <Text className="text-gray-500">No open announcements.</Text>
        ) : (
          <FlatList
            data={combinedItems}
            keyExtractor={(item) =>
              item.type === "announcement" ? item.id : `chat-${item.id}`
            }
            bounces={true}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={fetchData} />
            }
            renderItem={({ item }) => {
              if (item.type === "announcement") {
                return (
                  <View className="bg-white rounded-xl p-4 mb-3 shadow-sm shadow-slate-400">
                    <Text className="text-lg font-bold text-primary-400">
                      {item.name}
                    </Text>
                    <Text className="text-sm text-primary-300">
                      Class: {item.classname}
                    </Text>
                    <Text className="text-sm text-primary-300">
                      Teacher: {item.teachername}
                    </Text>
                    {item.children && item.children.length > 0 && (
                      <Text className="text-sm text-primary-300">
                        For: {item.children.join(", ")}
                      </Text>
                    )}
                    <Text className="mt-1 text-gray-700">{item.content}</Text>
                  </View>
                );
              } else if (item.type === "chat") {
                return (
                  <TouchableOpacity
                    className="bg-white rounded-xl p-4 mb-3 shadow-sm shadow-slate-400 border border-primary-100"
                    onPress={() =>
                      router.push({ pathname: "/chat/[id]", params: { id: item.id } })
                    }
                  >
                    <Text className="text-base font-semibold text-primary-400">
                      New chat unread from {item.otherUserName}
                    </Text>
                  </TouchableOpacity>
                );
              }
              return null;
            }}
          />
        )}
      </View>
    </View>
  );
}
