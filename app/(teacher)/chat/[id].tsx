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

const LANGUAGES = [
  { code: "en", label: "English" },
  { code: "zh", label: "Chinese" },
  { code: "ms", label: "Malay" },
  { code: "ta", label: "Tamil" },
];

export default function ChatScreen() {
  const { id: chatId } = useLocalSearchParams();
  const [messages, setMessages] = useState([]);
  const [messageText, setMessageText] = useState("");
  const [imageBase64, setImageBase64] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [otherUserProfile, setOtherUserProfile] = useState(null);
  const [translations, setTranslations] = useState({});
  const apiURL = `http://${ip}:8000`;
  const flatListRef = useRef();
  const pollingRef = useRef(null);
  const lastMessageIdRef = useRef(null);

  useEffect(() => {
    fetchMessages();
    markMessagesAsRead();
    fetchOtherUserProfile();

    pollingRef.current = setInterval(() => {
      fetchMessages();
    }, 5000);

    return () => {
      if (pollingRef.current) clearInterval(pollingRef.current);
    };
  }, [chatId]);

  const fetchMessages = async () => {
    const token = await auth.currentUser.getIdToken();
    const res = await fetch(`${apiURL}/findspecificchat/${chatId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();
    const sorted = data.sort((a, b) => a.timestamp._seconds - b.timestamp._seconds);
    setMessages(sorted);
    setLoading(false);
    setRefreshing(false);

    const lastId = sorted[sorted.length - 1]?.id || "";
    if (lastMessageIdRef.current !== lastId) {
      flatListRef.current?.scrollToEnd({ animated: true });
      lastMessageIdRef.current = lastId;
    }
  };

  const markMessagesAsRead = async () => {
    const token = await auth.currentUser.getIdToken();
    await fetch(`${apiURL}/markread/${chatId}`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
    });
  };

  const fetchOtherUserProfile = async () => {
    const token = await auth.currentUser.getIdToken();
    const res = await fetch(`${apiURL}/chat/${chatId}/otheruser`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();
    setOtherUserProfile(data);
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchMessages();
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
      mediaTypes: ["images"],
      quality: 0.7,
      base64: true,
    });

    if (!result.canceled && result.assets.length > 0) {
      const base64 = result.assets[0].base64;
      setImageBase64(`data:image/jpeg;base64,${base64}`);
    }
  };

  const translateText = async (messageId, original, nextLang) => {
    if (nextLang === "en") {
      setTranslations((prev) => ({
        ...prev,
        [messageId]: {
          text: original,
          lang: "en",
        },
      }));
      return;
    }

    try {
      const res = await fetch("https://translate-text-565810748414.asia-southeast1.run.app", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text: original,
          source: "en",
          target: nextLang,
        }),
      });
      const data = await res.json();
      setTranslations((prev) => ({
        ...prev,
        [messageId]: {
          text: data.translatedText || "⚠️ Failed",
          lang: nextLang,
        },
      }));
    } catch (err) {
      console.error("Translation failed", err);
    }
  };

  const handleCycleTranslation = (item) => {
    const current = translations[item.id]?.lang || "en";
    const currentIndex = LANGUAGES.findIndex((l) => l.code === current);
    const nextIndex = (currentIndex + 1) % LANGUAGES.length;
    const nextLang = LANGUAGES[nextIndex].code;

    translateText(item.id, item.message, nextLang);
  };

  const renderMessage = ({ item }) => {
    const isMe = item.sender === auth.currentUser?.uid;
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

    const wasRead = item.isRead && item.receiver !== auth.currentUser?.uid;
    const displayText = translations[item.id]?.text || item.message;

    return (
      <TouchableOpacity
        onPress={() => handleCycleTranslation(item)}
        className={`flex-row mb-3 ${isMe ? "justify-end" : "justify-start"}`}
      >
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
              {displayText}
            </Text>
          ) : null}
          <Text className="text-[11px] text-gray-400 mt-1">{timestamp}</Text>
        </View>
        {isMe && (
          <Text className="text-[11px] text-gray-400 self-end ml-1">
            {wasRead ? "✓✓" : "✓"}
          </Text>
        )}
      </TouchableOpacity>
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
          contentContainerStyle={{
            paddingHorizontal: 20,
            paddingTop: 20,
            paddingBottom: 80,
          }}
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
          refreshing={refreshing}
          onRefresh={handleRefresh}
        />

        {imageBase64 && (
          <View className="px-4 py-2 flex-row items-center">
            <Image
              source={{ uri: imageBase64 }}
              style={{
                width: 100,
                height: 100,
                borderRadius: 12,
                marginRight: 8,
              }}
            />
            <TouchableOpacity onPress={() => setImageBase64(null)}>
              <Feather name="x-circle" size={24} color="#FF5A5F" />
            </TouchableOpacity>
          </View>
        )}

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
