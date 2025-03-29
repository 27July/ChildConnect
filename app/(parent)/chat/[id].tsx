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

export default function ChatScreen() {
  const { id: chatId } = useLocalSearchParams();
  const [messages, setMessages] = useState([]);
  const [messageText, setMessageText] = useState("");
  const [imageBase64, setImageBase64] = useState(null);
  const [loading, setLoading] = useState(true);
  const apiURL = `http://${ip}:8000`;
  const flatListRef = useRef();

  useEffect(() => {
    fetchMessages();
    markMessagesAsRead();
  }, [chatId]);

  const fetchMessages = async () => {
    const token = await auth.currentUser.getIdToken();
    const res = await fetch(`${apiURL}/findspecificchat/${chatId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();
    setMessages(data.sort((a, b) => a.timestamp._seconds - b.timestamp._seconds));
    setLoading(false);
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
    fetchMessages();
  };

  const pickImage = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      alert("Permission to access gallery is required!");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
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
    return (
      <View
        className={`max-w-[75%] p-3 rounded-xl mb-2 ${
          isMe ? "bg-primary-200 self-end" : "bg-white self-start"
        }`}
      >
        {item.image && (
          <Image source={{ uri: item.image }} className="w-40 h-40 rounded-lg mb-2" />
        )}
        <Text className="text-sm text-gray-800">{item.message}</Text>
      </View>
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-primary-50">
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        className="flex-1"
        keyboardVerticalOffset={90}
      >
        {loading ? (
          <View className="flex-1 justify-center items-center">
            <ActivityIndicator size="large" color="#999" />
          </View>
        ) : (
          <FlatList
            ref={flatListRef}
            data={messages}
            renderItem={renderMessage}
            keyExtractor={(item, index) => index.toString()}
            contentContainerStyle={{ padding: 20 }}
            onContentSizeChange={() => flatListRef.current.scrollToEnd({ animated: true })}
          />
        )}

        <View className="flex-row items-center p-4 border-t border-primary-100">
          <TouchableOpacity onPress={pickImage} className="mr-2">
            <Feather name="image" size={24} color="#2A2E43" />
          </TouchableOpacity>
          <TextInput
            value={messageText}
            onChangeText={setMessageText}
            placeholder="Type a message"
            className="flex-1 bg-white px-4 py-2 rounded-full text-base border border-primary-200"
          />
          <TouchableOpacity onPress={sendMessage} className="ml-2 bg-primary-400 p-2 rounded-full">
            <Feather name="send" size={20} color="white" />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}