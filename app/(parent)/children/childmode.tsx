import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  FlatList,
  StyleSheet,
  Alert,
  Modal,
  Dimensions,
} from "react-native";
import { useRouter } from "expo-router";
import { FontAwesome5 } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";

const PRESET_EXIT_CODE = "1234"; // 🔑 Replace with a secure stored value
const SCREEN_WIDTH = Dimensions.get("window").width;

export const options = {
  href: null,
};

export default function ChildModeScreen() {
  const router = useRouter();
  const navigation = useNavigation();
  const [homeworkList, setHomeworkList] = useState([]);
  const [isModalVisible, setModalVisible] = useState(false);
  const [exitCode, setExitCode] = useState("");

  useEffect(() => {
    // ✅ Disable swipe gestures
    let parent = navigation.getParent();
    while (parent) {
      parent.setOptions({ gestureEnabled: false });
      parent = parent.getParent();
    }

    // ✅ Re-enable swipe gestures when leaving
    return () => {
      let parent = navigation.getParent();
      while (parent) {
        parent.setOptions({ gestureEnabled: true });
        parent = parent.getParent();
      }
    };
  }, [navigation]);

  // ✅ Sample Homework Data
  useEffect(() => {
    setHomeworkList([
      {
        id: "1",
        subject: "Math",
        task: "Complete worksheet 3",
        due: "March 25",
      },
      { id: "2", subject: "English", task: "Write an essay", due: "March 26" },
      {
        id: "3",
        subject: "Science",
        task: "Finish lab report",
        due: "March 27",
      },
    ]);
  }, []);

  // ✅ Verify Exit Code
  const handleExitChildMode = () => {
    if (exitCode === PRESET_EXIT_CODE) {
      setModalVisible(false);
      router.push("./childinfo"); // ✅ Navigate back to parent screen
    } else {
      Alert.alert("Incorrect Code", "The exit code entered is incorrect.");
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* ✅ Child Mode Header */}
      <Text style={styles.header}>Child Mode Enabled</Text>
      <Text style={styles.description}>
        This device is now in child mode. Below is the list of homework
        assigned.
      </Text>

      {/* ✅ Homework List (Adapts to Screen Size) */}
      <FlatList
        data={homeworkList}
        keyExtractor={(item) => item.id}
        contentContainerStyle={[
          styles.listContainer,
          { width: SCREEN_WIDTH * 0.9 },
        ]}
        renderItem={({ item }) => (
          <View style={styles.homeworkCard}>
            <Text style={styles.subject}>{item.subject}</Text>
            <Text style={styles.task}>{item.task}</Text>
            <Text style={styles.dueDate}>Due: {item.due}</Text>
          </View>
        )}
      />

      {/* ✅ Exit Child Mode Button */}
      <TouchableOpacity
        style={styles.exitButton}
        onPress={() => setModalVisible(true)} // Show exit code modal
      >
        <Text style={styles.exitButtonText}>Exit Child Mode</Text>
      </TouchableOpacity>

      {/* ✅ Exit Code Modal */}
      <Modal
        transparent={true}
        animationType="slide"
        visible={isModalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>Enter Exit Code</Text>
            <TextInput
              style={styles.inputBox}
              placeholder="Enter code"
              placeholderTextColor="#666"
              secureTextEntry
              keyboardType="numeric"
              value={exitCode}
              onChangeText={setExitCode}
            />
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, { backgroundColor: "#285E5E" }]}
                onPress={handleExitChildMode}
              >
                <Text style={styles.modalButtonText}>Confirm</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, { backgroundColor: "#e53935" }]}
                onPress={() => setModalVisible(false)}
              >
                <Text style={styles.modalButtonText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

// ✅ Styles
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#E6F0EE",
    alignItems: "center",
    padding: 20,
  },
  header: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#285E5E",
    marginBottom: 10,
  },
  description: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
    marginBottom: 20,
  },
  listContainer: {
    width: "100%",
    paddingBottom: 20,
  },
  homeworkCard: {
    backgroundColor: "#fff",
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
    width: "100%",
  },
  subject: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#285E5E",
  },
  task: {
    fontSize: 14,
    color: "#444",
  },
  dueDate: {
    fontSize: 12,
    color: "#999",
  },
  exitButton: {
    backgroundColor: "#e53935",
    padding: 12,
    borderRadius: 10,
    marginTop: 20,
  },
  exitButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
  modalOverlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  modalContainer: {
    width: "80%",
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 10,
    alignItems: "center",
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#285E5E",
    marginBottom: 10,
  },
  inputBox: {
    width: "80%",
    padding: 12,
    borderRadius: 8,
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#ccc",
    textAlign: "center",
    fontSize: 18,
    marginBottom: 15,
  },
  modalButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
  },
  modalButton: {
    flex: 1,
    padding: 12,
    marginHorizontal: 5,
    borderRadius: 8,
    alignItems: "center",
  },
  modalButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
});
