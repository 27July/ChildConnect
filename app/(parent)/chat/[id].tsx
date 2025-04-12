// app/(parent)/chat/[id].tsx
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
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams } from "expo-router";
import { Audio } from "expo-av";
import { Feather } from "@expo/vector-icons";
import ProfilePic from "@/assets/images/profilepic.svg";
import * as ImagePicker from "expo-image-picker";
import { auth } from "@/firebaseConfig";
import { LANGUAGES, Message, Translation } from "@/models/chatModel";
import {
  fetchMessages,
  markMessagesAsRead,
  sendMessage,
  transcribeAudio,
  fetchOtherUserProfile,
  playTextToSpeech,
  translateText,
} from "@/controllers/chatController";

export default function ChatScreen() {
  const { id: chatId } = useLocalSearchParams();
  const [messages, setMessages] = useState<Message[]>([]);
  const [messageText, setMessageText] = useState("");
  const [imageBase64, setImageBase64] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [recording, setRecording] = useState<any>(null);
  const [otherUserProfile, setOtherUserProfile] = useState<any>(null);
  const [translations, setTranslations] = useState<Record<string, Translation>>(
    {}
  );
  const flatListRef = useRef<any>(null);
  const pollingRef = useRef<any>(null);
  const lastMessageIdRef = useRef<string | null>(null);

  useEffect(() => {
    init();
    pollingRef.current = setInterval(fetchChat, 5000);
    return () => pollingRef.current && clearInterval(pollingRef.current);
  }, [chatId]);

  const init = async () => {
    await Promise.all([
      fetchChat(),
      markMessagesAsRead(chatId as string),
      loadOtherUser(),
    ]);
  };

  const fetchChat = async () => {
    const data = await fetchMessages(chatId as string);
    setMessages(data);
    setLoading(false);
    setRefreshing(false);
    const lastId = data[data.length - 1]?.id || "";
    if (lastMessageIdRef.current !== lastId) {
      flatListRef.current?.scrollToEnd({ animated: true });
      lastMessageIdRef.current = lastId;
    }
  };

  const loadOtherUser = async () => {
    const profile = await fetchOtherUserProfile(chatId as string);
    setOtherUserProfile(profile);
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchChat();
  };

  const handleSend = async () => {
    if (!messageText.trim() && !imageBase64) return;
    setSending(true);
    await sendMessage(chatId as string, messageText, imageBase64);
    setMessageText("");
    setImageBase64(null);
    await fetchChat();
    setSending(false);
  };

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.7,
      base64: true,
    });
    if (!result.canceled && result.assets.length > 0) {
      setImageBase64(`data:image/jpeg;base64,${result.assets[0].base64}`);
    }
  };

  const startRecording = async () => {
    const permission = await Audio.requestPermissionsAsync();
    if (!permission.granted) return;
    await Audio.setAudioModeAsync({
      allowsRecordingIOS: true,
      playsInSilentModeIOS: true,
    });
    const rec = new Audio.Recording();
    await rec.prepareToRecordAsync({
      android: {
        extension: ".wav",
        outputFormat: Audio.RECORDING_OPTION_ANDROID_OUTPUT_FORMAT_LINEAR16,
        audioEncoder: Audio.RECORDING_OPTION_ANDROID_AUDIO_ENCODER_LINEAR_PCM,
        sampleRate: 16000,
        numberOfChannels: 1,
        bitRate: 256000,
      },
      ios: {
        extension: ".wav",
        audioQuality: Audio.RECORDING_OPTION_IOS_AUDIO_QUALITY_HIGH,
        sampleRate: 16000,
        numberOfChannels: 1,
        linearPCMBitDepth: 16,
        linearPCMIsBigEndian: false,
        linearPCMIsFloat: false,
      },
    });
    await rec.startAsync();
    setRecording(rec);
  };

  const stopRecording = async () => {
    await recording.stopAndUnloadAsync();
    setRecording(null);
    const uri = recording.getURI();
    const transcript = await transcribeAudio(uri);
    setMessageText((prev) => prev + transcript);
  };

  const handleCycleTranslation = async (item: Message, key: string) => {
    const currentLang = translations[key]?.lang || "en";
    const nextIndex =
      (LANGUAGES.findIndex((l) => l.code === currentLang) + 1) %
      LANGUAGES.length;
    const nextLang = LANGUAGES[nextIndex].code;
    if (nextLang === "en") {
      setTranslations((prev) => ({
        ...prev,
        [key]: { text: item.message, lang: "en" },
      }));
    } else {
      const translated = await translateText(item.message, nextLang);
      setTranslations((prev) => ({
        ...prev,
        [key]: { text: translated, lang: nextLang },
      }));
    }
  };

  const renderMessage = ({ item, index }: { item: Message; index: number }) => {
    const key = item.id || `msg-${index}`;
    const isMe = item.sender === auth.currentUser?.uid;
    const displayText = translations[key]?.text || item.message;
    const lang = translations[key]?.lang || "en";
    const timestamp = new Date(
      item.timestamp._seconds * 1000
    ).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
    return (
      <TouchableOpacity
        className={`flex-row mb-3 ${isMe ? "justify-end" : "justify-start"}`}
      >
        {!isMe && otherUserProfile?.profilepic ? (
          <Image
            source={{ uri: otherUserProfile.profilepic }}
            className="w-7 h-7 rounded-full mr-2"
          />
        ) : (
          !isMe && <ProfilePic width={28} height={28} className="mr-2" />
        )}
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
          {!!displayText && (
            <View className="flex-row items-center">
              <TouchableOpacity
                onPress={() => handleCycleTranslation(item, key)}
                style={{ flexShrink: 1 }}
              >
                <Text className="text-[15px] text-gray-800 leading-snug mr-2">
                  {displayText}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => playTextToSpeech(displayText, lang)}
              >
                <Feather name="volume-2" size={18} color="#666" />
              </TouchableOpacity>
            </View>
          )}
          <Text className="text-[11px] text-gray-400 mt-1">{timestamp}</Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-primary-50">
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
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
          refreshing={refreshing}
          onRefresh={handleRefresh}
          keyboardShouldPersistTaps="handled"
          ListEmptyComponent={
            loading && <ActivityIndicator size="large" color="#999" />
          }
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
          <TouchableOpacity
            onPress={pickImage}
            className="mr-2 rounded-full p-3"
            style={{ backgroundColor: "#EDF3F2" }}
          >
            <Feather name="image" size={20} color="#2A2E43" />
          </TouchableOpacity>
          <TouchableOpacity
            onPressIn={startRecording}
            onPressOut={stopRecording}
            className="mr-2 rounded-full p-3"
            style={{
              backgroundColor: recording ? "#FFCDD2" : "#EDF3F2",
              borderWidth: recording ? 1 : 0,
              borderColor: recording ? "#FF5252" : "transparent",
            }}
          >
            <Feather
              name="mic"
              size={20}
              color={recording ? "#FF1744" : "#2A2E43"}
            />
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
            onPress={handleSend}
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
