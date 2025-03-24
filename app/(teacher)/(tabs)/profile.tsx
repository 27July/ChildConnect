import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  Image,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
} from "react-native";

const ProfileScreen = () => {
  const [userData, setUserData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // ✅ Simulating data fetch - Replace this with real Firestore fetch
    const fetchSampleData = async () => {
      const sampleData = {
        name: "John Tan",
        role: "teacher",
        email: "john.tan@example.com",
        phone: "+65 9123 4567",
        address: "123 Clementi Road, Singapore 123456",
        school: "Anderson Primary School",
        profilepic: "https://via.placeholder.com/100x100.png?text=John",
      };
      setTimeout(() => {
        setUserData(sampleData);
        setLoading(false);
      }, 1000);
    };

    fetchSampleData();
  }, []);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#1E3765" />
      </View>
    );
  }

  if (!userData) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={{ color: "red" }}>Unable to load profile data.</Text>
      </View>
    );
  }

  return (
    <ScrollView
      contentContainerStyle={styles.container}
      bounces={false}
      showsVerticalScrollIndicator={false}
    >
      <Image
        source={{
          uri:
            userData.profilepic ||
            "https://via.placeholder.com/100x100.png?text=Profile",
        }}
        style={styles.avatar}
      />

      <Text style={styles.name}>{userData.name}</Text>
      <Text style={styles.role}>{userData.role?.toUpperCase()}</Text>

      {/* ✅ These fields are linked to Firestore fields under users/{uid} */}

      <View style={styles.infoBox}>
        <Text style={styles.label}>Email</Text>
        <Text style={styles.value}>{userData.email}</Text>
      </View>

      <View style={styles.infoBox}>
        <Text style={styles.label}>Phone</Text>
        <Text style={styles.value}>{userData.phone || "-"}</Text>
      </View>

      <View style={styles.infoBox}>
        <Text style={styles.label}>Address</Text>
        <Text style={styles.value}>{userData.address || "-"}</Text>
      </View>

      <View style={styles.infoBox}>
        <Text style={styles.label}>School</Text>
        <Text style={styles.value}>{userData.school || "-"}</Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f6fff8",
  },
  container: {
    flexGrow: 1,
    backgroundColor: "#f6fff8",
    alignItems: "center",
    padding: 20,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 15,
  },
  name: {
    fontSize: 22,
    fontWeight: "700",
    color: "#1E3765",
    marginBottom: 4,
  },
  role: {
    fontSize: 14,
    color: "#6c757d",
    marginBottom: 20,
  },
  infoBox: {
    width: "100%",
    backgroundColor: "#ffffff",
    padding: 15,
    borderRadius: 10,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  label: {
    fontSize: 13,
    color: "#888",
    marginBottom: 4,
  },
  value: {
    fontSize: 15,
    color: "#1E3765",
    fontWeight: "500",
  },
});

export default ProfileScreen;
