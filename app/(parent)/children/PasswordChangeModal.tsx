import React, { useState } from "react";
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from "react-native";
import { auth } from "@/firebaseConfig";
import { ip } from "@/utils/server_ip.json";

interface Props {
  visible: boolean;
  onClose: () => void;
  childId: string;
  mode?: "update" | "create";
}

export default function PasswordChangeModal({
  visible,
  onClose,
  childId,
  mode = "update",
}: Props) {
  const [password, setPassword] = useState("");

  const handleSubmit = async () => {
    if (password.length !== 4) {
      Alert.alert("Error", "Password must be 4 digits.");
      return;
    }

    try {
      const token = await auth.currentUser?.getIdToken();
      const res = await fetch(
        `http://${ip}:8000/childmode-password/${childId}`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ password }),
        }
      );

      if (!res.ok) throw new Error("Failed to update password");

      Alert.alert(
        "Success",
        mode === "create" ? "Password created." : "Password updated."
      );
      setPassword("");
      onClose();
    } catch (err) {
      console.error("❌ Error:", err);
      Alert.alert("Error", "Failed to save password.");
    }
  };

  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={styles.overlay}>
        <View style={styles.container}>
          <Text style={styles.title}>
            {mode === "create" ? "Set Child Mode Password" : "Change Password"}
          </Text>

          {/* Hidden input */}
          <TextInput
            style={styles.hiddenInput}
            keyboardType="numeric"
            maxLength={4}
            value={password}
            onChangeText={(text) => {
              const digitsOnly = text.replace(/\D/g, "");
              setPassword(digitsOnly);
            }}
            autoFocus
          />

          {/* Custom display of 4 boxes */}
          <View style={styles.codeBoxes}>
            {[0, 1, 2, 3].map((i) => (
              <View key={i} style={styles.codeBox}>
                <Text style={styles.codeText}>{password[i] || ""}</Text>
              </View>
            ))}
          </View>

          <View style={styles.buttons}>
            <TouchableOpacity style={styles.confirm} onPress={handleSubmit}>
              <Text style={styles.btnText}>Save</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.cancel} onPress={onClose}>
              <Text style={styles.btnText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  container: {
    width: "80%",
    backgroundColor: "white",
    padding: 24,
    borderRadius: 12,
    alignItems: "center",
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#285E5E",
    marginBottom: 16,
    textAlign: "center",
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
  buttons: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  confirm: {
    backgroundColor: "#285E5E",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    marginRight: 10,
  },
  cancel: {
    backgroundColor: "#e53935",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  btnText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 16,
  },
});
