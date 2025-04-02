import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  Button,
  ActivityIndicator,
  Alert,
} from "react-native";
import { auth } from "@/firebaseConfig";
import { ip } from "@/utils/server_ip.json";

type Props = {
  childId: string;
};

const ChildModePasswordManager = ({ childId }: Props) => {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [viewing, setViewing] = useState(false);

  const apiURL = `http://${ip}:8000`;

  const fetchPassword = async () => {
    setLoading(true);
    try {
      const user = auth.currentUser;
      if (!user) return;
      const token = await user.getIdToken();

      const res = await fetch(`${apiURL}/childmode-password/${childId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) throw new Error("Could not fetch password");

      const data = await res.json();
      setCurrentPassword(data.password);
      setViewing(true);
    } catch (error) {
      Alert.alert("Error", "Unable to fetch password");
    } finally {
      setLoading(false);
    }
  };

  const updatePassword = async () => {
    if (newPassword.length < 4) {
      Alert.alert("Invalid PIN", "Password must be at least 4 characters.");
      return;
    }

    setLoading(true);
    try {
      const user = auth.currentUser;
      if (!user) return;
      const token = await user.getIdToken();

      const res = await fetch(`${apiURL}/childmode-password/${childId}`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ password: newPassword }),
      });

      if (!res.ok) throw new Error("Failed to update");

      Alert.alert("Success", "Child Mode password updated.");
      setCurrentPassword(newPassword);
      setNewPassword("");
    } catch (error) {
      Alert.alert("Error", "Failed to update password.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View className="bg-white rounded-xl p-4 shadow-md mt-3">
      <Text className="font-bold text-lg text-[#2A2E43] mb-2">
        Child Mode Password
      </Text>

      {loading ? (
        <ActivityIndicator size="small" color="#285E5E" />
      ) : viewing ? (
        <Text className="mb-3 text-gray-700">
          Current password:{" "}
          <Text className="font-semibold">{currentPassword}</Text>
        </Text>
      ) : (
        <Button title="View Current Password" onPress={fetchPassword} />
      )}

      <TextInput
        value={newPassword}
        onChangeText={setNewPassword}
        placeholder="Enter new password"
        keyboardType="numeric"
        className="border border-gray-300 rounded-md px-3 py-2 my-3"
      />

      <Button title="Update Password" onPress={updatePassword} />
    </View>
  );
};

export default ChildModePasswordManager;
