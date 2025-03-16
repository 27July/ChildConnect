import React from "react";
import { View, Text, StyleSheet, Image, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";

// Define types for parent data
type ParentInfo = {
  name: string;
  relation: string;
  avatar: any; // For image source
};

// Define props interface if needed
interface ChildPresentProfileProps {
  // Add any props if necessary
}

const ChildPresentProfile: React.FC<ChildPresentProfileProps> = () => {
  // Mock data
  const childName = "Jaslyn";
  const schoolName = "Isaac Predatory Primary School";
  const classInfo = "1E4";
  const gradeInfo = "P1";
  const attendanceStatus = "Present";
  const profileImage = require("../assets/female_profile_pic.webp"); // Replace with actual asset path
  
  const parents: ParentInfo[] = [
    {
      name: "Jack",
      relation: "Father",
      avatar: require("../assets/speed.webp"), // Replace with actual asset path
    },
    {
      name: "Chloe",
      relation: "Mother",
      avatar: require("../assets/ksi.png"), // Replace with actual asset path
    },
  ];

  const getAttendanceStatusStyle = () => {
    return {
      fontSize: 14,
      fontWeight: "500",
      color: attendanceStatus.toLowerCase() === "absent" ? "#ff3b30" : "#64b6ac"
    };
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header with time and status icons */}

      {/* Profile section */}
      <View style={styles.profileSection}>
        <Image source={profileImage} style={styles.profileImage} />
        
        <Text style={styles.childName}>{childName}</Text>
        <Text style={styles.schoolName}>{schoolName}</Text>
        <Text style={styles.classInfo}>Class: {classInfo}   Grade: {gradeInfo}</Text>
        
        <View style={styles.attendanceIndicator}>
          <Text style={styles.attendanceText}>Today's Attendance: </Text>
          <Text style={getAttendanceStatusStyle()}>{attendanceStatus}</Text>
        </View>
      </View>

      {/* Parents section */}
      <View style={styles.parentsSection}>
        {parents.map((parent, index) => (
          <View key={index} style={styles.parentCard}>
            <View style={styles.parentInfo}>
              <Image source={parent.avatar} style={styles.parentAvatar} />
              <View style={styles.parentTextInfo}>
                <Text style={styles.parentName}>{parent.name}</Text>
                <Text style={styles.parentRelation}>{parent.relation}</Text>
              </View>
            </View>
            
            <View style={styles.contactButtons}>
              <TouchableOpacity style={styles.contactButton}>
                <Text style={styles.contactButtonText}>Chat</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.contactButton}>
                <Text style={styles.contactButtonText}>Contact Information</Text>
              </TouchableOpacity>
            </View>
          </View>
        ))}
      </View>

      {/* Records buttons */}
      <View style={styles.recordsSection}>
        <TouchableOpacity style={styles.recordButton}>
          <Text style={styles.recordButtonText}>Attendance Records</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.recordButton}>
          <Text style={styles.recordButtonText}>Documentation</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f0f5f3",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: 10,
    backgroundColor: "#e5f0ea",
  },
  statusIcons: {
    flexDirection: "row",
    alignItems: "center",
  },
  iconSpacing: {
    marginLeft: 6,
  },
  profileSection: {
    alignItems: "center",
    paddingTop: 50,
    paddingBottom: 30,
  },
  profileImage: {
    width: 120,
    height: 120,
    borderRadius: 50,
  },
  childName: {
    fontSize: 20,
    fontWeight: "600",
    color: "#40506a",
    marginBottom: 4,
  },
  schoolName: {
    fontSize: 16,
    color: "#40506a",
    marginBottom: 4,
  },
  classInfo: {
    fontSize: 14,
    color: "#40506a",
    marginBottom: 12,
  },
  attendanceIndicator: {
    flexDirection: "row",
    backgroundColor: "#e5f0ea",
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 25,
    marginTop: 5,
  },
  attendanceText: {
    fontSize: 14,
    color: "#40506a",
  },
  parentsSection: {
    paddingHorizontal: 15,
    marginTop: 10,
  },
  parentCard: {
    backgroundColor: "white",
    borderRadius: 10,
    padding: 15,
    marginBottom: 10,
  },
  parentInfo: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 15,
  },
  parentAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  parentTextInfo: {
    marginLeft: 10,
  },
  parentName: {
    fontWeight: "600",
    fontSize: 14,
  },
  parentRelation: {
    color: "#8a95a5",
    fontSize: 13,
  },
  contactButtons: {
    flexDirection: "row",
    justifyContent: "flex-end",
  },
  contactButton: {
    marginLeft: 15,
  },
  contactButtonText: {
    color: "#5271ff",
    fontSize: 12,
  },
  recordsSection: {
    paddingHorizontal: 15,
    marginTop: 10,
  },
  recordButton: {
    backgroundColor: "#e5f0ea",
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
    marginBottom: 10,
  },
  recordButtonText: {
    color: "#40506a",
    fontWeight: "600",
    fontSize: 16,
  },
});

export default ChildPresentProfile;