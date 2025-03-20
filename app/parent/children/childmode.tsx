import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  Alert,
} from "react-native";
import { useRouter } from "expo-router";
import { FontAwesome5 } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";

const PRESET_EXIT_CODE = "1234"; // 🔑 Replace with a secure stored value

export default function ChildModeScreen() {
  const router = useRouter();
  const navigation = useNavigation();
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

  // ✅ Verify Exit Code
  const handleExitChildMode = () => {
    if (exitCode === PRESET_EXIT_CODE) {
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
        This device is now in child mode. Limited functionality is available.
      </Text>

      {/* ✅ Exit Code Input */}
      <Text style={styles.inputLabel}>Enter Exit Code:</Text>
      <TextInput
        style={styles.inputBox}
        placeholder="Enter code"
        placeholderTextColor="#666"
        secureTextEntry
        keyboardType="numeric"
        value={exitCode}
        onChangeText={setExitCode}
      />

      {/* ✅ Exit Child Mode Button */}
      <TouchableOpacity style={styles.exitButton} onPress={handleExitChildMode}>
        <Text style={styles.exitButtonText}>Exit Child Mode</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

// ✅ Styles
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#E6F0EE",
    alignItems: "center",
    justifyContent: "center",
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
  inputLabel: {
    fontSize: 16,
    color: "#444",
    marginBottom: 5,
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
  exitButton: {
    backgroundColor: "#e53935",
    padding: 12,
    borderRadius: 10,
  },
  exitButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
});
