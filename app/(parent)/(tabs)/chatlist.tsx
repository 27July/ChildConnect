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
  const router = useRouter();
  const apiURL = `http://${ip}:8000`;

  useFocusEffect(
    useCallback(() => {
      fetchChats();
    }, [])
  );

  const fetchChats = async () => {
    const user = auth.currentUser;
    if (!user) return;
    const token = await user.getIdToken();
    const myUserId = user.uid;

    try {
      const res = await fetch(`${apiURL}/findchats`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();

      // Get my children
      const myChildrenRes = await fetch(`${apiURL}/mychildren`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const myChildren = await myChildrenRes.json();
      const myChildrenByClass = {};
      myChildren.forEach((child) => {
        if (!myChildrenByClass[child.class]) {
          myChildrenByClass[child.class] = [];
        }
        myChildrenByClass[child.class].push(child.name);
      });

      const enrichedChats = await Promise.all(
        data.map(async (chat) => {
          const otherUserId =
            chat.userID1 === myUserId ? chat.userID2 : chat.userID1;

          try {
            // Fetch the teacher's classes
            const classesRes = await fetch(
              `${apiURL}/classesof/${otherUserId}`,
              {
                headers: { Authorization: `Bearer ${token}` },
              }
            );
            const teacherClasses = await classesRes.json();
            const classNames = teacherClasses.map((c) => c.name);

            // Filter my children who are in this teacher's class
            const relevantChildren = Object.entries(myChildrenByClass)
              .filter(([className]) => classNames.includes(className))
              .flatMap(([_, names]) => names);

            chat.childNames = relevantChildren;
            return chat;
          } catch (err) {
            console.error("Error fetching teacher's classes:", err);
            chat.childNames = [];
            return chat;
          }
        })
      );

      const sorted = enrichedChats.sort((a, b) => {
        const aTime =
          a.lastUpdated?._seconds || new Date(a.lastUpdated).getTime() / 1000;
        const bTime =
          b.lastUpdated?._seconds || new Date(b.lastUpdated).getTime() / 1000;
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
          <View className="flex-row justify-between items-start">
            <View className="flex-1 pr-2">
              <Text className="text-base font-semibold text-primary-400">
                Chatting with {item.otherUserName}
              </Text>
              {item.childNames?.length > 0 && (
                <Text className="text-sm text-gray-500 mt-0.5">
                  
                </Text>
              )}
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
    <View className="flex-1 bg-primary-50 px-5">
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
    </View>
  );
}
