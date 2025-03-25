import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  Image,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { auth } from "@/firebaseConfig";
import { ip } from "@/utils/server_ip.json";
import ProfilePic from "@/assets/images/profilepic.svg";
import * as ImagePicker from "expo-image-picker";

export default function Profile() {
  const [userData, setUserData] = useState<any>(null);
  const [children, setChildren] = useState<any[]>([]);
  const [editing, setEditing] = useState(false);
  const [editableUserData, setEditableUserData] = useState<any>({});
  const apiURL = `http://${ip}:8000`;

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    const user = auth.currentUser;
    if (!user) return;
    const token = await user.getIdToken();

    try {
      const userRes = await fetch(`${apiURL}/users/${user.uid}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const profile = await userRes.json();
      setUserData(profile);
      setEditableUserData({ ...profile });
    } catch (err) {
      console.error("Error loading profile data", err);
    }
  };

  const groupedBySchool = children.reduce((acc: any, child: any) => {
    const school = child.school || "Unknown School";
    if (!acc[school]) acc[school] = [];
    acc[school].push(child);
    return acc;
  }, {});

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.7,
      base64: true,
    });

    if (!result.canceled && result.assets.length > 0) {
      const base64Img = `data:image/jpeg;base64,${result.assets[0].base64}`;
      setEditableUserData((prev: any) => ({ ...prev, profilepic: base64Img }));
    }
  };

  const handleSave = async () => {
    const user = auth.currentUser;
    if (!user) return;
    const token = await user.getIdToken();

    try {
      const res = await fetch(`${apiURL}/updateprofile`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(editableUserData),
      });

      if (!res.ok) throw new Error("Update failed");

      Alert.alert("Success", "Profile updated");
      setEditing(false);
      fetchData();
    } catch (err) {
      console.error("Error updating user:", err);
      Alert.alert("Error", "Update failed");
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-primary-50 px-5">
      <View className="flex-row justify-between items-center mb-4">
        <Text className="text-2xl font-bold">Profile</Text>
        <TouchableOpacity onPress={() => setEditing(!editing)}>
          <Text className="text-primary-400 font-bold">
            {editing ? "Cancel" : "Edit"}
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView>
        <View className="items-center">
          {userData?.profilepic ? (
            <Image
              source={{ uri: userData.profilepic }}
              className="w-28 h-28 rounded-full mb-3"
            />
          ) : (
            <ProfilePic width={96} height={96} className="mb-3" />
          )}

          {editing && (
            <TouchableOpacity onPress={pickImage}>
              <Text className="text-primary-500 underline mb-3">
                {editableUserData.profilepic ? "Change" : "Upload"} Profile
                Picture
              </Text>
            </TouchableOpacity>
          )}
        </View>

        {/* 🔹 Profile Fields */}
        {["name", "email", "phone", "workPhone", "address"].map((field) => (
          <View key={field} className="mb-3">
            <Text className="text-gray-600 mb-1 capitalize">{field}</Text>
            <TextInput
              editable={field !== "name" && field !== "email" && editing}
              value={editableUserData[field] || ""}
              onChangeText={(val) =>
                setEditableUserData((prev: any) => ({ ...prev, [field]: val }))
              }
              className={`bg-white px-4 py-3 rounded-xl ${
                editing && field !== "name" && field !== "email"
                  ? "border border-primary-400"
                  : "text-gray-800"
              }`}
            />
          </View>
        ))}

        {editing && (
          <TouchableOpacity
            className="bg-primary-400 py-3 mt-4 rounded-xl"
            onPress={handleSave}
          >
            <Text className="text-white font-bold text-center">Save</Text>
          </TouchableOpacity>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
