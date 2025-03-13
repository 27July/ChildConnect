import React from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Image,
  Dimensions,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { FontAwesome5 } from "@expo/vector-icons";

// Import Profile Image
const profileImage = require("../assets/female_profile_pic.webp");

// Get screen width dynamically
const screenWidth = Dimensions.get("window").width;

const classes = [
  {
    id: "1",
    name: "1E4",
    subject: "Science",
    teacher: "Form Teacher",
    color: "#6C9BCF",
  },
  {
    id: "2",
    name: "2K2",
    subject: "Science",
    teacher: "Form Teacher",
    color: "#F7A7A6",
  },
  {
    id: "3",
    name: "2K1",
    subject: "Science",
    teacher: "Teacher",
    color: "#FAD02E",
  },
];

const MyClasses = () => {
  const navigation = useNavigation();

  return (
    <View style={styles.container}>
      {/*  More Space Above Profile */}
      <Image source={profileImage} style={styles.profileImage} />

      {/*  School Banner */}
      <View style={styles.schoolBanner}>
        <Text style={styles.schoolName}>Experimental Primary School</Text>
      </View>

      {/*  Section Title */}
      <Text style={styles.sectionTitle}>Classes</Text>

      <FlatList
        data={classes}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingTop: 10, paddingBottom: 20 }}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[styles.classItem, { width: screenWidth * 0.9 }]} // Responsive width
            onPress={() =>
              navigation.navigate("ClassDetails", { classData: item })
            }
          >
            {/* ✅ Left Side: Rounded Colored Icon */}
            <View
              style={[styles.iconContainer, { backgroundColor: item.color }]}
            >
              <FontAwesome5 name="book" size={18} color="#fff" />
            </View>

            {/* ✅ Middle Section: Class Name & Subject */}
            <View style={styles.textContainer}>
              <Text style={styles.className}>{item.name}</Text>
              <Text style={styles.classSubject}>{item.subject}</Text>
            </View>

            {/* ✅ Right Side: Teacher & View Details (Now Aligned) */}
            <View style={styles.detailsContainer}>
              <Text style={styles.teacherText}>{item.teacher}</Text>
              <Text style={styles.viewDetails}>View Details</Text>
            </View>
          </TouchableOpacity>
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#E6F0EE",
    paddingHorizontal: 20,
    alignItems: "center",
  },
  profileImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginTop: 80,
    marginBottom: 10,
  },
  schoolBanner: {
    backgroundColor: "#C6E3DE",
    padding: 12,
    borderRadius: 20,
    alignSelf: "center",
    marginBottom: 20,
  },
  schoolName: {
    fontSize: 16,
    fontWeight: "bold",
    textAlign: "center",
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 10,
    textAlign: "center",
  },
  classItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    padding: 20, // ✅ Increased padding for better spacing
    borderRadius: 15, // ✅ Softer, rounded edges
    marginBottom: 12,
    minHeight: 80, // ✅ Ensures proper height
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  iconContainer: {
    width: 45, // ✅ Ensures proper size
    height: 45,
    borderRadius: 50, // ✅ Fully rounded
    justifyContent: "center",
    alignItems: "center",
    marginRight: 15,
  },
  textContainer: {
    flex: 1,
    justifyContent: "center",
  },
  detailsContainer: {
    justifyContent: "center",
    alignItems: "flex-end", // ✅ Aligns teacher name and "View Details"
  },
  className: {
    fontSize: 16,
    fontWeight: "bold",
  },
  classSubject: {
    fontSize: 12,
    color: "#6C9BCF", // ✅ Light blue color for the subject text
    marginTop: 2,
  },
  teacherText: {
    fontSize: 14,
    color: "#666",
    marginBottom: 2, // ✅ Ensures even spacing
  },
  viewDetails: {
    fontSize: 14,
    color: "#285E5E",
    fontWeight: "bold",
  },
});

export default MyClasses;
