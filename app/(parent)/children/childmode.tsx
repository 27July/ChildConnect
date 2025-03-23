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
import { useRouter, useNavigation } from "expo-router";
import { FontAwesome5 } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  startForegroundTracking,
  stopForegroundTracking,
} from "../../../components/ChildLocationTracker";

const PRESET_EXIT_CODE = "1234";
const SCREEN_WIDTH = Dimensions.get("window").width;

export default function ChildModeScreen() {
  const router = useRouter();
  const navigation = useNavigation();
  const [homeworkList, setHomeworkList] = useState([]);
  const [isModalVisible, setModalVisible] = useState(false);
  const [exitCode, setExitCode] = useState("");
  const [isTracking, setIsTracking] = useState(false);
  //Disable Gestures
  useEffect(() => {
    navigation.setOptions({
      gestureEnabled: false, // disables swipe to go back
    });
  }, []);
  useEffect(() => {
    let parent = navigation.getParent();
    while (parent) {
      parent.setOptions({ gestureEnabled: false });
      parent = parent.getParent();
    }

    return () => {
      let parent = navigation.getParent();
      while (parent) {
        parent.setOptions({ gestureEnabled: true });
        parent = parent.getParent();
      }
    };
  }, [navigation]);

  // REMOTE CONTROLLED TRACKING FLAG — Can be toggled by parent (e.g. via Appwrite)
  // const shouldStartTracking = false;

  // useEffect(() => {
  //   if (shouldStartTracking && !isTracking) {
  //     startForegroundTracking((coords) => {
  //       console.log("Remote-triggered tracking:", coords);
  //       // TODO: Send to backend
  //     });
  //     setIsTracking(true);
  //   }
  // }, [shouldStartTracking]);

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

  const handleExitChildMode = async () => {
    if (exitCode === PRESET_EXIT_CODE) {
      try {
        await stopForegroundTracking(); // force stop it
        setIsTracking(false);
      } catch (err) {
        console.warn("Failed to tracking:", err);
      }

      setModalVisible(false);

      // Force gestures back on before navigating
      let parent = navigation.getParent();
      while (parent) {
        parent.setOptions({ gestureEnabled: true });
        parent = parent.getParent();
      }

      router.replace("./childinfo");
    } else {
      Alert.alert("Incorrect Code", "The exit code entered is incorrect.");
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.header}>Child Mode Enabled</Text>
      <Text style={styles.description}>
        This device is now in child mode. Below is the list of homework
        assigned.
      </Text>

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

      {/* Start Tracking Button (I'm leaving)*/}
      {!isTracking && (
        <TouchableOpacity
          style={[styles.exitButton, { backgroundColor: "#285E5E" }]}
          onPress={async () => {
            try {
              console.log("Attempting to start foreground tracking...");
              await startForegroundTracking((coords) => {
                console.log("Tracked Location:", coords);
                // TODO: Send this to Appwrite backend here
              });
              setIsTracking(true);
              Alert.alert(
                "Tracking Started",
                "Your location is now being tracked."
              );
            } catch (err) {
              console.error("Failed to start foreground tracking:", err);
              Alert.alert(
                "Error",
                "Could not start tracking. Check permissions."
              );
            }
          }}
        >
          <Text style={styles.exitButtonText}>I'm Leaving Home/School</Text>
        </TouchableOpacity>
      )}

      {/* Tracking Banner */}
      {isTracking && (
        <View style={styles.trackingBanner}>
          <Text style={styles.trackingText}>📍 Tracking in progress...</Text>
        </View>
      )}

      {/* Exit Child Mode Button */}
      <TouchableOpacity
        style={styles.exitButton}
        onPress={() => setModalVisible(true)}
      >
        <Text style={styles.exitButtonText}>Exit Child Mode</Text>
      </TouchableOpacity>

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
  trackingBanner: {
    marginTop: 10,
    padding: 8,
    backgroundColor: "#d0f0c0",
    borderRadius: 8,
    alignItems: "center",
  },
  trackingText: {
    color: "#285E5E",
    fontWeight: "600",
    fontSize: 14,
  },
});
