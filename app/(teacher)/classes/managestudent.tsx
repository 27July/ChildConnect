import React from "react";
import { View, Text, StyleSheet, ScrollView, Dimensions } from "react-native";
import { FontAwesome5 } from "@expo/vector-icons";
import { useLocalSearchParams } from "expo-router";

// ✅ Sample data (replace with Firestore fetch based on student ID)
const studentData = {
  id: "1",
  name: "Keerthi",
  fatherName: "Mr. Tan",
  motherName: "Mrs. Tan",
  fatherContact: "+65 9123 4567",
  motherContact: "+65 9876 5432",
};

export default function ManageStudentScreen() {
  const { studentId = "1" } = useLocalSearchParams();
  const student = studentData; // ✅ Replace this with backend lookup using studentId

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.container}>
      <View style={styles.contentWrapper}>
        <View style={styles.iconBox}>
          <FontAwesome5 name="user-circle" size={100} color="#1E3765" />
          <Text style={styles.name}>{student.name}</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Parental Info</Text>

          <View style={styles.infoCard}>
            <Text style={styles.label}>Father's Name</Text>
            <Text style={styles.value}>{student.fatherName}</Text>
          </View>

          <View style={styles.infoCard}>
            <Text style={styles.label}>Mother's Name</Text>
            <Text style={styles.value}>{student.motherName}</Text>
          </View>

          <View style={styles.infoCard}>
            <Text style={styles.label}>Father's Contact</Text>
            <Text style={styles.value}>{student.fatherContact}</Text>
          </View>

          <View style={styles.infoCard}>
            <Text style={styles.label}>Mother's Contact</Text>
            <Text style={styles.value}>{student.motherContact}</Text>
          </View>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#f6fff8",
  },
  container: {
    flexGrow: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 40,
  },
  contentWrapper: {
    width: "90%",
    maxWidth: 500,
  },
  iconBox: {
    alignItems: "center",
    marginBottom: 32,
  },
  name: {
    fontSize: 26,
    fontWeight: "bold",
    color: "#1E3765",
    marginTop: 12,
  },
  section: {
    marginTop: 10,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1E3765",
    marginBottom: 16,
    textAlign: "center",
  },
  infoCard: {
    backgroundColor: "#ffffff",
    borderRadius: 14,
    padding: 16,
    marginBottom: 14,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  label: {
    fontSize: 13,
    color: "#6c757d",
    marginBottom: 4,
  },
  value: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1E3765",
  },
});
