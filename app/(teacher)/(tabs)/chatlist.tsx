import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  Image,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter, useFocusEffect } from "expo-router";
import { auth } from "@/firebaseConfig";
import { ip } from "@/utils/server_ip.json";
import ProfilePic from "@/assets/images/profilepic.svg";

export default function ChatList() {
  const [loading, setLoading] = useState(true);
  const [chats, setChats] = useState([]);
  const [classNames, setClassNames] = useState([]);
  const router = useRouter();
  const apiURL = `http://${ip}:8000`;

  useFocusEffect(
    useCallback(() => {
      fetchMyClasses();
    }, [])
  );

  const fetchMyClasses = async () => {
    const user = auth.currentUser;
    if (!user) return;
    const token = await user.getIdToken();

    try {
      const res = await fetch(`${apiURL}/myclasses`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const classes = await res.json();
      const classNames = classes.map((c) => c.name);
      setClassNames(classNames);
      fetchChats(classNames);
    } catch (err) {
      console.error("Error loading my classes:", err);
      setLoading(false);
    }
  };

  const fetchChats = async (myClassNames) => {
    const user = auth.currentUser;
    if (!user) return;
    const token = await user.getIdToken();

    try {
      const res = await fetch(`${apiURL}/findchats`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();

      const enrichedChats = await Promise.all(
        data.map(async (chat) => {
          const otherUserId =
            chat.userID1 === user.uid ? chat.userID2 : chat.userID1;

          try {
            const childrenRes = await fetch(`${apiURL}/childrenof/${otherUserId}`, {
              headers: { Authorization: `Bearer ${token}` },
            });
            const children = await childrenRes.json();

            const relevantChildren = children.filter((child) =>
              myClassNames.includes(child.class)
            );

            chat.childNames = relevantChildren.map((child) => child.name);
            return chat;
          } catch (err) {
            console.error("Error fetching children of other user:", err);
            chat.childNames = [];
            return chat;
          }
        })
      );

      const sorted = enrichedChats.sort((a, b) => {
        const aTime = a.lastUpdated?._seconds || new Date(a.lastUpdated).getTime() / 1000;
        const bTime = b.lastUpdated?._seconds || new Date(b.lastUpdated).getTime() / 1000;
        return bTime - aTime;
      });
      setChats(sorted);
    } catch (err) {
      console.error("Error loading chats:", err);
    } finally {
      setLoading(false);
    }
  };

  const formatTimestamp = (ts) => {
    if (!ts) return "-";
    if (typeof ts === "string") {
      return new Date(ts).toLocaleString();
    }
    if (ts._seconds) {
      return new Date(ts._seconds * 1000).toLocaleString();
    }
    return "-";
  };

  const renderProfileImage = (uri) => {
    if (!uri || uri.trim() === "") {
      return <ProfilePic width={40} height={40} />;
    }
    return <Image source={{ uri }} className="w-10 h-10 rounded-full" />;
  };

  const renderChatItem = ({ item }) => {
    return (
      <TouchableOpacity
        onPress={() =>
          router.push({ pathname: "/chat/[id]", params: { id: item.id } })
        }
        className="bg-white rounded-2xl p-4 mb-3 shadow-sm border border-primary-100 flex-row items-center"
      >
        {renderProfileImage(item.otherUserPic)}
        <View className="ml-4 flex-1">
          <View className="flex-row justify-between items-center">
            <View className="flex-1 pr-2">
              <Text className="text-base font-semibold text-primary-400">
                Chatting with {item.otherUserName}
              </Text>
            </View>
            {!item.isRead && (
              <View className="bg-primary-400 px-2 py-0.5 rounded-full">
                <Text className="text-white text-xs">New</Text>
              </View>
            )}
          </View>
          <Text className="text-gray-600 mt-1 text-sm" numberOfLines={1}>
            {item.lastMessage || "No messages yet."}
          </Text>
          <Text className="text-xs text-gray-400 mt-1">
            {formatTimestamp(item.lastUpdated)}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-primary-50 px-5">
      <Text className="text-3xl font-extrabold text-[#2A2E43] mt-6 mb-4">
        Chats
      </Text>
      {loading ? (
        <ActivityIndicator size="large" color="#999" />
      ) : (
        <FlatList
          data={chats}
          keyExtractor={(item) => item.id}
          renderItem={renderChatItem}
          contentContainerStyle={{ paddingBottom: 20 }}
        />
      )}
    </SafeAreaView>
  );
}