import React, { useState } from "react";
import {
  View,
  Text,
  FlatList,
  TextInput,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import { FontAwesome5 } from "@expo/vector-icons";
import { useRouter } from "expo-router";

// ✅ Sample Chat Data
const chats = [
  {
    id: "1",
    name: "Class 1E4",
    lastMessage: "Reminder: Test on Monday!",
    time: "2h ago",
  },
  {
    id: "2",
    name: "Class 2K2",
    lastMessage: "Homework submission deadline?",
    time: "4h ago",
  },
  {
    id: "3",
    name: "Staff Room",
    lastMessage: "Meeting at 3 PM.",
    time: "1 day ago",
  },
  {
    id: "4",
    name: "Parent-Teacher Chat",
    lastMessage: "Can we schedule a meeting?",
    time: "2 days ago",
  },
  {
    id: "5",
    name: "Science Department",
    lastMessage: "Lab materials update",
    time: "3 days ago",
  },
];

const ChatsList = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const router = useRouter();

  // ✅ Filter chats based on search query
  const filteredChats = chats.filter((chat) =>
    chat.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <View style={styles.container}>
      {/* ✅ Page Title */}
      <Text style={styles.headerTitle}>Chats</Text>

      {/* ✅ Search Bar */}
      <TextInput
        style={styles.searchBar}
        placeholder="Search for a chat..."
        placeholderTextColor="#8E8E8E"
        onChangeText={(text) => setSearchQuery(text)}
      />

      {/* ✅ Chat List */}
      <FlatList
        data={filteredChats}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.chatList}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.chatItem}
            onPress={() => router.push("./chatpage")} // ✅ Navigate to ChatPage
          >
            {/* ✅ Chat Icon */}
            <View style={styles.chatIcon}>
              <FontAwesome5 name="comments" size={20} color="#fff" />
            </View>

            {/* ✅ Chat Info */}
            <View style={styles.chatInfo}>
              <Text style={styles.chatName}>{item.name}</Text>
              <Text style={styles.lastMessage}>{item.lastMessage}</Text>
            </View>

            {/* ✅ Chat Timestamp */}
            <Text style={styles.timestamp}>{item.time}</Text>
          </TouchableOpacity>
        )}
      />
    </View>
  );
};

// ✅ Styles
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#E6F0EE",
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#1E3765",
    marginBottom: 10,
  },
  searchBar: {
    backgroundColor: "#fff",
    padding: 10,
    borderRadius: 10,
    fontSize: 14,
    color: "#333",
    marginBottom: 10,
  },
  chatList: {
    paddingBottom: 20,
  },
  chatItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    paddingVertical: 12,
    paddingHorizontal: 15,
    borderRadius: 10,
    marginBottom: 8,
  },
  chatIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#6C9BCF",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  chatInfo: {
    flex: 1,
  },
  chatName: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#1E3765",
  },
  lastMessage: {
    fontSize: 12,
    color: "#666",
  },
  timestamp: {
    fontSize: 12,
    color: "#999",
  },
});

export default ChatsList;
