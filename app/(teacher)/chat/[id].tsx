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

// ⬆️ Keep all imports same...

export default function ChatScreen() {
  const { id: chatId } = useLocalSearchParams();
  const [messages, setMessages] = useState([]);
  const [messageText, setMessageText] = useState("");
  const [imageBase64, setImageBase64] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false); // ✅ NEW STATE for pull-to-refresh
  const [sending, setSending] = useState(false);
  const [otherUserProfile, setOtherUserProfile] = useState(null);
  const apiURL = `http://${ip}:8000`;
  const flatListRef = useRef();

  useEffect(() => {
    fetchMessages();
    markMessagesAsRead();
    fetchOtherUserProfile();
  }, [chatId]);

  // ✅ SCROLL TO END whenever messages change
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
    setRefreshing(false); // ✅ Stop pull-to-refresh
  };

  // ✅ Pull-to-refresh handler
  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchMessages();
  };

  // Keep fetchOtherUserProfile, markMessagesAsRead, sendMessage, pickImage, renderMessage same...

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
          keyboardShouldPersistTaps="handled"
          ListEmptyComponent={
            loading ? (
              <View className="flex-1 justify-center items-center">
                <ActivityIndicator size="large" color="#999" />
              </View>
            ) : null
          }
          // ✅ ADD THESE PROPS:
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
