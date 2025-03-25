import React, { useState } from "react";
import {
  View,
  Text,
  FlatList,
  TextInput,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import { FontAwesome5, Feather } from "@expo/vector-icons";
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

  const filteredChats = chats.filter((chat) =>
    chat.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <View style={styles.container}>
      <Text style={styles.headerTitle}>Chats</Text>

      <View style={styles.searchContainer}>
        <Feather
          name="search"
          size={16}
          color="#8E8E8E"
          style={styles.searchIcon}
        />
        <TextInput
          style={styles.searchBar}
          placeholder="Search for a chat..."
          placeholderTextColor="#8E8E8E"
          onChangeText={(text) => setSearchQuery(text)}
        />
      </View>

      <FlatList
        data={filteredChats}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.chatList}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.chatItem}
            onPress={() => router.push("../chat/chatpage")}
          >
            <View style={styles.chatIcon}>
              <FontAwesome5 name="comments" size={20} color="#fff" />
            </View>

            <View style={styles.chatInfo}>
              <Text style={styles.chatName}>{item.name}</Text>
              <Text style={styles.lastMessage}>{item.lastMessage}</Text>
            </View>

            <Text style={styles.timestamp}>{item.time}</Text>
          </TouchableOpacity>
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f6fff8",
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#1E3765",
    marginBottom: 10,
    paddingBottom: 6,
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 10,
    paddingHorizontal: 10,
    marginBottom: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  searchIcon: {
    marginRight: 6,
  },
  searchBar: {
    flex: 1,
    paddingVertical: 10,
    fontSize: 14,
    color: "#333",
  },
  chatList: {
    paddingBottom: 20,
  },
  chatItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    paddingVertical: 14,
    paddingHorizontal: 15,
    borderRadius: 12,
    marginBottom: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 1,
    elevation: 1,
  },
  chatIcon: {
    width: 42,
    height: 42,
    borderRadius: 21,
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
    fontWeight: "600",
    color: "#1E3765",
    marginBottom: 2,
  },
  lastMessage: {
    fontSize: 13,
    color: "#555",
  },
  timestamp: {
    fontSize: 11,
    color: "#999",
  },
});

export default ChatsList;
