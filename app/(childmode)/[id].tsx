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
import { useRouter, useNavigation, useLocalSearchParams } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  startForegroundTracking,
  stopForegroundTracking,
} from "../../components/ChildLocationTracker";
import { auth } from "@/firebaseConfig";
import { ip } from "@/utils/server_ip.json";
import { useFocusEffect } from "@react-navigation/native";
import { getFirestore, doc, onSnapshot, updateDoc } from "firebase/firestore";

const SCREEN_WIDTH = Dimensions.get("window").width;

export default function ChildModeScreen() {
  const { id: childId } = useLocalSearchParams();
  const router = useRouter();
  const navigation = useNavigation();
  const [homeworkList, setHomeworkList] = useState([]);
  const [isModalVisible, setModalVisible] = useState(false);
  const [exitCode, setExitCode] = useState("");
  const [isTracking, setIsTracking] = useState(false);
  const [actualPassword, setActualPassword] = useState("");

  // Lock gestures while in child mode
  useFocusEffect(
    React.useCallback(() => {
      navigation.setOptions({ gestureEnabled: false });
      return () => navigation.setOptions({ gestureEnabled: true });
    }, [navigation])
  );

  const formatDate = (dateStr: string) => {
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString("en-SG", {
        year: "numeric",
        month: "short",
        day: "numeric",
      });
    } catch (err) {
      return "Invalid date";
    }
  };

  //Fetch the actual password from the server
  useEffect(() => {
    const fetchPassword = async () => {
      try {
        const token = await auth.currentUser?.getIdToken();
        const res = await fetch(
          `http://${ip}:8000/childmode-password/${childId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (!res.ok) throw new Error("Failed to fetch password");
        const data = await res.json();
        setActualPassword(data.password);
      } catch (err) {
        console.error("❌ Could not fetch child mode password:", err);
        Alert.alert("Error", "Unable to fetch child mode password.");
      }
    };

    fetchPassword();
  }, [childId]);

  // Listen to real-time tracking status
  useEffect(() => {
    const db = getFirestore();
    const docRef = doc(db, "locations", childId);

    let trackingStarted = false; // prevent multiple triggers

    const unsubscribe = onSnapshot(docRef, (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        const newTrackingStatus = data.istracking === true;

        // If tracking just switched ON
        if (newTrackingStatus && !trackingStarted) {
          trackingStarted = true;
          setIsTracking(true);
          startForegroundTracking(async (coords) => {
            const token = await auth.currentUser?.getIdToken();

            await fetch(`http://${ip}:8000/location/update`, {
              method: "POST",
              headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                childid: childId,
                latitude: coords.latitude,
                longitude: coords.longitude,
                istracking: true,
              }),
            });
          });
        }

        // If tracking is turned off
        if (!newTrackingStatus) {
          trackingStarted = false;
          stopForegroundTracking();
          setIsTracking(false);
        }
      }
    });

    return () => unsubscribe();
  }, [childId]);

  // Fetch homework data
  useEffect(() => {
    const fetchHomeworkForChild = async () => {
      try {
        const token = await auth.currentUser?.getIdToken();

        // Step 1: Get child data
        const childRes = await fetch(`http://${ip}:8000/child/${childId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const childData = await childRes.json();

        // Step 2: Get class document to retrieve class ID
        const classRes = await fetch(
          `http://${ip}:8000/classbynamewithid/${childData.class}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        const classData = await classRes.json();
        const classid = classData.id;

        // Step 3: Fetch homework for that class
        const hwRes = await fetch(
          `http://${ip}:8000/homework/class/${classid}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (!hwRes.ok) throw new Error("Failed to fetch homework");

        const homeworkData = await hwRes.json();
        console.log("📚 Homework Data:", homeworkData); //for debugging
        setHomeworkList(homeworkData);
      } catch (err) {
        console.error("❌ Error loading homework:", err);
      }
    };

    fetchHomeworkForChild();
  }, [childId]);

  const handleExitChildMode = async () => {
    if (exitCode === actualPassword) {
      try {
        await stopForegroundTracking();
        const token = await auth.currentUser?.getIdToken();

        await fetch(`http://${ip}:8000/location/stop`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ childid: childId }),
        });
      } catch (err) {
        console.warn("Failed to stop tracking:", err);
      }

      setModalVisible(false);
      router.back();
    } else {
      Alert.alert("Incorrect Code", "The exit code entered is incorrect.");
    }
  };

  const startTracking = async () => {
    try {
      await startForegroundTracking(async (coords) => {
        const token = await auth.currentUser?.getIdToken();

        await fetch(`http://${ip}:8000/location/update`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            childid: childId,
            latitude: coords.latitude,
            longitude: coords.longitude,
            istracking: true,
          }),
        });
      });

      Alert.alert("Tracking Started", "Your location is now being tracked.");
    } catch (err) {
      console.error("Failed to start foreground tracking:", err);
      Alert.alert("Error", "Could not start tracking. Check permissions.");
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
            <Text style={styles.subject}>{item.name}</Text>
            <Text style={styles.task}>{item.content}</Text>
            <Text style={styles.dueDate}>Due: {formatDate(item.duedate)}</Text>
          </View>
        )}
      />

      {!isTracking && (
        <TouchableOpacity
          style={[styles.exitButton, { backgroundColor: "#285E5E" }]}
          onPress={startTracking}
        >
          <Text style={styles.exitButtonText}>I'm Leaving Home/School</Text>
        </TouchableOpacity>
      )}

      {isTracking && (
        <View style={styles.trackingBanner}>
          <Text style={styles.trackingText}>📍 Tracking in progress...</Text>
        </View>
      )}

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

            {/* Hidden TextInput */}
            <TextInput
              style={styles.hiddenInput}
              keyboardType="number-pad"
              maxLength={4}
              value={exitCode}
              onChangeText={(text) => {
                const digits = text.replace(/\D/g, "");
                setExitCode(digits);
              }}
              autoFocus
            />

            {/* 4 digit boxes */}
            <View style={styles.codeBoxes}>
              {[0, 1, 2, 3].map((i) => (
                <View key={i} style={styles.codeBox}>
                  <Text style={styles.codeText}>{exitCode[i] || ""}</Text>
                </View>
              ))}
            </View>

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
  hiddenInput: {
    height: 0,
    width: 0,
    opacity: 0,
  },
  codeBoxes: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginVertical: 20,
  },
  codeBox: {
    width: 50,
    height: 50,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    marginHorizontal: 5,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F3F4F6",
  },
  codeText: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333",
  },
});
