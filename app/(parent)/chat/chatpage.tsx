import React, { useState } from "react";
import {
  View,
  Text,
  FlatList,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
} from "react-native";
import { FontAwesome5 } from "@expo/vector-icons";
import { useRouter } from "expo-router";

const ChatPage = () => {
  const router = useRouter();

  const [messages, setMessages] = useState([
    { id: "1", text: "Hey! How are you?", sender: "them" },
    { id: "2", text: "I'm good! What about you?", sender: "me" },
    { id: "3", text: "Just preparing for class.", sender: "them" },
  ]);
  const [newMessage, setNewMessage] = useState("");

  // ✅ Function to send a message
  const sendMessage = () => {
    if (newMessage.trim() === "") return;
    setMessages([
      ...messages,
      { id: Date.now().toString(), text: newMessage, sender: "me" },
    ]);
    setNewMessage("");
  };

  return (
    <View style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.container}
      >
        {/* ✅ Navigation Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <FontAwesome5 name="arrow-left" size={20} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Chat</Text>
        </View>

        {/* ✅ Chat Messages List */}
        <FlatList
          data={messages}
          keyExtractor={(item) => item.id}
          contentContainerStyle={[styles.chatContainer]}
          renderItem={({ item }) => (
            <View
              style={[
                styles.messageBubble,
                item.sender === "me" ? styles.myMessage : styles.theirMessage,
              ]}
            >
              <Text style={styles.messageText}>{item.text}</Text>
            </View>
          )}
        />

        {/* ✅ Message Input Box (Adaptive Padding) */}
        <View style={[styles.inputContainer]}>
          <TextInput
            style={styles.textInput}
            placeholder="Type a message..."
            placeholderTextColor="#aaa"
            value={newMessage}
            onChangeText={setNewMessage}
          />
          <TouchableOpacity style={styles.sendButton} onPress={sendMessage}>
            <FontAwesome5 name="paper-plane" size={20} color="#fff" />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
};

// ✅ Styles (Padding now adapts dynamically)
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#E6F0EE",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#285E5E",
    paddingVertical: 15,
    paddingHorizontal: 20,
    paddingTop: 40,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#fff",
    marginLeft: 15,
  },
  chatContainer: {
    flexGrow: 1,
    padding: 15,
  },
  messageBubble: {
    padding: 12,
    borderRadius: 15,
    maxWidth: "75%",
    marginBottom: 8,
  },
  myMessage: {
    alignSelf: "flex-end",
    backgroundColor: "#285E5E",
  },
  theirMessage: {
    alignSelf: "flex-start",
    backgroundColor: "#7AA9A6",
  },
  messageText: {
    fontSize: 14,
    color: "#fff",
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    padding: 10,
    borderTopWidth: 1,
    borderColor: "#ddd",
    width: "100%",
    paddingBottom: 10,
  },
  textInput: {
    flex: 1,
    fontSize: 16,
    padding: 10,
    paddingBottom: 12,
    alignSelf: "flex-start",
  },
  sendButton: {
    backgroundColor: "#285E5E",
    padding: 12,
    borderRadius: 25,
    marginLeft: 10,
  },
});

export default ChatPage;
