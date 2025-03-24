import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  FlatList,
  TextInput,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import { FontAwesome5 } from "@expo/vector-icons";
import { useLocalSearchParams } from "expo-router";

// ✅ Sample Student Data (Replace with Firestore/Backend later)
const students = [
  {
    id: "1",
    name: "Keerthi",
    attendance: "Present",
    statusColor: "#285E5E",
    iconColor: "#6C9BCF",
  },
  {
    id: "2",
    name: "ZiHao",
    attendance: "Absent",
    statusColor: "red",
    iconColor: "#F7A7A6",
  },
  {
    id: "3",
    name: "Isaac",
    attendance: "Present",
    statusColor: "#285E5E",
    iconColor: "#FAD02E",
  },
  {
    id: "4",
    name: "Edwin",
    attendance: "Unconfirmed",
    statusColor: "red",
    iconColor: "#A7C7E7",
  },
  {
    id: "5",
    name: "Kumar",
    attendance: "Present",
    statusColor: "#285E5E",
    iconColor: "#F7A7A6",
  },
  {
    id: "6",
    name: "Rio",
    attendance: "Present",
    statusColor: "#285E5E",
    iconColor: "#FAD02E",
  },
  {
    id: "7",
    name: "Kai",
    attendance: "Absent",
    statusColor: "red",
    iconColor: "#6C9BCF",
  },
  {
    id: "8",
    name: "Jax",
    attendance: "Present",
    statusColor: "#285E5E",
    iconColor: "#F7A7A6",
  },
  {
    id: "9",
    name: "Leo",
    attendance: "Present",
    statusColor: "#285E5E",
    iconColor: "#6C9BCF",
  },
  {
    id: "10",
    name: "Mia",
    attendance: "Present",
    statusColor: "#285E5E",
    iconColor: "#F7A7A6",
  },
  {
    id: "11",
    name: "Noah",
    attendance: "Present",
    statusColor: "#285E5E",
    iconColor: "#FAD02E",
  },
];

const ClassDetails = () => {
  const { classId = "1E4" } = useLocalSearchParams(); // ✅ Dynamic class name from router param
  const [searchQuery, setSearchQuery] = useState("");
  const [dateString, setDateString] = useState("");

  useEffect(() => {
    const today = new Date();
    const options = {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    };
    const formatted = today.toLocaleDateString("en-GB", options); // e.g., 24 March 2025, Monday
    setDateString(formatted);
  }, []);

  const presentCount = students.filter(
    (s) => s.attendance === "Present"
  ).length;
  const totalStudents = students.length;

  const filteredStudents = students.filter((s) =>
    s.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <View style={styles.container}>
      {/* ✅ Dynamic Date & Class Title */}
      <Text style={styles.attendanceTitle}>{`${dateString} Attendance`}</Text>

      <View style={styles.classCard}>
        <View style={styles.classIconContainer}>
          <FontAwesome5 name="book" size={20} color="#fff" />
        </View>
        <View style={styles.classTextContainer}>
          <Text style={styles.className}>{classId}</Text>
          <Text style={styles.classSubject}>Science</Text>
        </View>
        <View style={styles.classActions}>
          <Text style={styles.assignText}>Assign Homework</Text>
          <Text style={styles.releaseText}>Release Form</Text>
        </View>
      </View>

      <TextInput
        style={styles.searchBar}
        placeholder="Search for someone"
        placeholderTextColor="#8E8E8E"
        onChangeText={(text) => setSearchQuery(text)}
      />

      <View style={styles.studentListContainer}>
        <FlatList
          data={filteredStudents}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.studentList}
          renderItem={({ item }) => (
            <View style={styles.studentRow}>
              <View style={styles.studentInfo}>
                <FontAwesome5
                  name="user-circle"
                  size={24}
                  color={item.iconColor}
                  style={styles.studentIcon}
                />
                <Text style={styles.studentName}>{item.name}</Text>
              </View>
              <Text
                style={[styles.attendanceStatus, { color: item.statusColor }]}
              >
                {" "}
                {item.attendance}{" "}
              </Text>
              <TouchableOpacity style={styles.manageButton}>
                <Text style={styles.manageText}>Manage</Text>
              </TouchableOpacity>
            </View>
          )}
        />
      </View>

      <View style={styles.summaryContainer}>
        <Text style={styles.summaryText}>Total: {totalStudents} Students</Text>
        <Text style={styles.summaryText}>
          Arrived: {presentCount}/{totalStudents} Students
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#E6F0EE",
    paddingHorizontal: 20,
  },
  attendanceTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#1E3765",
    marginTop: 50,
    marginBottom: 10,
  },
  classCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    padding: 15,
    borderRadius: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  classIconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "#6C9BCF",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 15,
  },
  classTextContainer: {
    flex: 1,
  },
  searchBar: {
    backgroundColor: "#fff",
    padding: 10,
    borderRadius: 10,
    marginTop: 10,
    fontSize: 14,
    color: "#333",
  },
  studentListContainer: {
    flex: 1,
  },
  studentList: {
    paddingTop: 10,
    paddingBottom: 80,
  },
  studentRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 10,
    marginBottom: 8,
  },
  studentInfo: {
    flexDirection: "row",
    alignItems: "center",
    flex: 2,
  },
  studentIcon: {
    marginRight: 10,
  },
  attendanceStatus: {
    fontSize: 14,
    flex: 1,
    textAlign: "center",
    marginRight: 20,
    minWidth: 80,
  },
  manageButton: {
    borderWidth: 1,
    borderColor: "#285E5E",
    borderRadius: 10,
    paddingVertical: 5,
    paddingHorizontal: 15,
  },
  manageText: {
    fontSize: 14,
    color: "#285E5E",
    fontWeight: "bold",
  },
  summaryContainer: {
    alignItems: "center",
    marginBottom: 20,
  },
  summaryText: {
    fontSize: 15,
    fontWeight: "bold",
    color: "#1E3765",
  },
});

export default ClassDetails;
