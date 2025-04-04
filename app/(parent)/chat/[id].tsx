import React, { useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  Image,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams } from "expo-router";
import { auth } from "@/firebaseConfig";
import { ip } from "@/utils/server_ip.json";
import * as ImagePicker from "expo-image-picker";
import { Feather } from "@expo/vector-icons";
import ProfilePic from "@/assets/images/profilepic.svg";

export default function ChatScreen() {
  const { id: chatId } = useLocalSearchParams();
  const [messages, setMessages] = useState([]);
  const [messageText, setMessageText] = useState("");
  const [imageBase64, setImageBase64] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [refreshing, setRefreshing] = useState(false); // ✅ Pull-to-refresh
  const [otherUserProfile, setOtherUserProfile] = useState(null);
  const apiURL = `http://${ip}:8000`;
  const flatListRef = useRef();

  useEffect(() => {
    fetchMessages();
    markMessagesAsRead();
    fetchOtherUserProfile();
  }, [chatId]);

  // ✅ Scroll to bottom on new messages
  useEffect(() => {
    if (messages.length > 0) {
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [messages]);

  const fetchMessages = async () => {
    const token = await auth.currentUser.getIdToken();
    const res = await fetch(`${apiURL}/findspecificchat/${chatId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();
    setMessages(data.sort((a, b) => a.timestamp._seconds - b.timestamp._seconds));
    setLoading(false);
    setRefreshing(false); // ✅ Stop refresh after fetching
  };

  // ✅ Pull-to-refresh handler
  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchMessages();
  };

  const fetchOtherUserProfile = async () => {
    const token = await auth.currentUser.getIdToken();
    const res = await fetch(`${apiURL}/chat/${chatId}/otheruser`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();
    setOtherUserProfile(data);
  };

  const markMessagesAsRead = async () => {
    const token = await auth.currentUser.getIdToken();
    await fetch(`${apiURL}/markread/${chatId}`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
    });
  };

  const sendMessage = async () => {
    if (!messageText.trim() && !imageBase64) return;
    setSending(true);
    const token = await auth.currentUser.getIdToken();

    const payload = {
      chatId,
      message: messageText,
      image: imageBase64,
    };

    await fetch(`${apiURL}/sendmessage`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    setMessageText("");
    setImageBase64(null);
    await fetchMessages();
    setSending(false);
  };

  const pickImage = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      alert("Permission to access gallery is required!");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaType.Images,
      quality: 0.7,
      base64: true,
    });

    if (!result.canceled && result.assets.length > 0) {
      const base64 = result.assets[0].base64;
      setImageBase64(`data:image/jpeg;base64,${base64}`);
    }
  };

  const renderMessage = ({ item }) => {
    const isMe = item.sender === auth.currentUser.uid;
    const timestamp = item.timestamp?._seconds
      ? new Date(item.timestamp._seconds * 1000).toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        })
      : "";

    const renderAvatar = () => {
      if (!isMe && otherUserProfile?.profilepic) {
        return (
          <Image
            source={{ uri: otherUserProfile.profilepic }}
            className="w-7 h-7 rounded-full mr-2"
          />
        );
      }
      if (!isMe) {
        return <ProfilePic width={28} height={28} className="mr-2" />;
      }
      return null;
    };

    const wasRead = item.isRead && item.receiver !== auth.currentUser.uid;

    return (
      <View className={`flex-row mb-3 ${isMe ? "justify-end" : "justify-start"}`}>
        {!isMe && renderAvatar()}
        <View
          style={{
            maxWidth: "78%",
            backgroundColor: isMe ? "#C6E3DE" : "#FFFFFF",
            paddingVertical: 6,
            paddingHorizontal: 12,
            borderRadius: 20,
            flexShrink: 1,
          }}
        >
          {item.image && (
            <Image
              source={{ uri: item.image }}
              className="w-40 h-40 rounded-xl mb-1"
              resizeMode="cover"
            />
          )}
          {item.message ? (
            <Text className="text-[15px] text-gray-800 leading-snug">
              {item.message}
            </Text>
          ) : null}
          <Text className="text-[11px] text-gray-400 mt-1">{timestamp}</Text>
        </View>
        {isMe && (
          <Text className="text-[11px] text-gray-400 self-end ml-1">
            {wasRead ? "✓✓" : "✓"}
          </Text>
        )}
      </View>
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-primary-50">
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1, backgroundColor: "#E6F4F1" }}
        keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 0}
      >
        <FlatList
          ref={flatListRef}
          data={messages}
          renderItem={renderMessage}
          keyExtractor={(item, index) => index.toString()}
          contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 20, paddingBottom: 80 }}
          onContentSizeChange={() =>
            flatListRef.current?.scrollToEnd({ animated: true })
          }
          keyboardShouldPersistTaps="handled"
          ListEmptyComponent={
            loading ? (
              <View className="flex-1 justify-center items-center">
                <ActivityIndicator size="large" color="#999" />
              </View>
            ) : null
          }
          // ✅ Added props
          refreshing={refreshing}
          onRefresh={handleRefresh}
        />

        <View
          className="flex-row items-end border-t border-primary-100 bg-white"
          style={{
            paddingLeft: 12,
            paddingRight: 12,
            paddingTop: 8,
            paddingBottom: Platform.OS === "ios" ? 18 : 16,
            marginBottom: Platform.OS === "ios" ? 8 : 4,
          }}
        >
          <TouchableOpacity onPress={pickImage} className="mr-2">
            <Feather name="image" size={24} color="#2A2E43" />
          </TouchableOpacity>
          <View className="flex-1 bg-primary-50 border border-primary-200 rounded-full px-4 py-2 max-h-28">
            <TextInput
              value={messageText}
              onChangeText={setMessageText}
              multiline
              placeholder="Type a message"
              className="text-base text-gray-800"
              style={{ minHeight: 20, textAlignVertical: "center" }}
            />
          </View>
          <TouchableOpacity
            onPress={sendMessage}
            disabled={sending}
            className="ml-2 bg-primary-400 p-3 rounded-full"
          >
            {sending ? (
              <ActivityIndicator size="small" color="white" />
            ) : (
              <Feather name="send" size={20} color="white" />
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
