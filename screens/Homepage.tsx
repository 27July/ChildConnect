import React from "react";
import { View, Text, StyleSheet, Image } from "react-native";

// Profile Image URL (Replace with real image URL)
const profileImage = require("../assets/female_profile_pic.webp");

const Homepage = () => {
  return (
    <View style={styles.container}>
      <Image source={profileImage} style={styles.profileImage} />

      <Text style={styles.welcomeText}>Welcome back, Jaslyn</Text>
      <View style={styles.announcementBox}>
        <Text style={styles.announcementTitle}>Announcements</Text>
        <Text style={styles.announcementText}>
          You have no new announcements
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#E6F0EE",
    alignItems: "center",
    justifyContent: "center",
  },
  profileImage: { width: 80, height: 80, borderRadius: 40, marginBottom: 10 },
  welcomeText: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 20,
    color: "#000",
  },
  announcementBox: {
    width: "80%",
    backgroundColor: "#C6E3DE",
    padding: 20,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 10,
  },
  announcementTitle: { fontSize: 16, fontWeight: "bold", marginBottom: 5 },
  announcementText: { fontSize: 14, color: "gray" },
});

export default Homepage;
