import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { useRouter } from "expo-router";

// ✅ Sample Class Data (replace this with Firestore/Backend fetch of teacher's classes)
const classes = [
  { id: "1", name: "1E4", role: "Form Teacher" },
  { id: "2", name: "2E1", role: "Teacher" },
  { id: "3", name: "3B2", role: "Teacher" },
  { id: "4", name: "4A1", role: "Form Teacher" },
];

const ChatsList = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const router = useRouter();

  // ✅ Filter classes based on search
  const filteredClasses = classes.filter((item) =>
    item.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.scrollContent}
      bounces={false}
    >
      <Text style={styles.headerTitle}>My Classes</Text>

      <View style={styles.searchContainer}>
        <Feather
          name="search"
          size={16}
          color="#8E8E8E"
          style={styles.searchIcon}
        />
        <TextInput
          style={styles.searchBar}
          placeholder="Search for a class..."
          placeholderTextColor="#8E8E8E"
          onChangeText={(text) => setSearchQuery(text)}
        />
      </View>

      {/* ✅ Dynamically generate each class card; link backend here */}
      {filteredClasses.map((item) => (
        <TouchableOpacity
          key={item.id}
          style={[
            styles.classCard,
            item.role === "Form Teacher"
              ? styles.formTeacherCard
              : styles.teacherCard,
          ]}
          onPress={() => router.push("../classes/classdetails")}
        >
          <Text style={styles.className}>{item.name}</Text>
          <Text style={styles.classRole}>{item.role}</Text>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f6fff8",
    paddingHorizontal: 20,
  },
  scrollContent: {
    paddingVertical: 20,
    paddingBottom: 40,
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
  classCard: {
    backgroundColor: "#fff",
    paddingVertical: 16,
    paddingHorizontal: 18,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07,
    shadowRadius: 4,
    elevation: 3,
  },
  formTeacherCard: {
    borderLeftWidth: 5,
    borderLeftColor: "#1E3765", // Dark blue for form teacher
  },
  teacherCard: {
    borderLeftWidth: 5,
    borderLeftColor: "#6C9BCF", // Soft blue for regular teacher
  },
  className: {
    fontSize: 16,
    fontWeight: "700",
    color: "#1E3765",
    marginBottom: 4,
  },
  classRole: {
    fontSize: 14,
    color: "#6c757d",
  },
});

export default ChatsList;
