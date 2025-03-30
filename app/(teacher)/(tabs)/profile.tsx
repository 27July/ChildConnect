import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  Image,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
  Modal,
  Pressable,
  useColorScheme,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { getAuth, signOut } from "firebase/auth";
import { auth } from "@/firebaseConfig";
import { ip } from "@/utils/server_ip.json";
import ProfilePic from "@/assets/images/profilepic.svg";
import * as ImagePicker from "expo-image-picker";
import { MotiView, AnimatePresence } from "moti";

export default function Profile() {
  const [userData, setUserData] = useState<any>(null);
  const [editing, setEditing] = useState(false);
  const [editableUserData, setEditableUserData] = useState<any>({});
  const [loadingImage, setLoadingImage] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [showLogout, setShowLogout] = useState(true);
  const [showImageModal, setShowImageModal] = useState(false);
  const apiURL = `http://${ip}:8000`;
  const colorScheme = useColorScheme();
  const router = useRouter();

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

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.7,
      base64: true,
    });

    if (!result.canceled && result.assets.length > 0) {
      const base64Img = `data:image/jpeg;base64,${result.assets[0].base64}`;
      setLoadingImage(true);
      setImageLoaded(false);
      setEditableUserData((prev: any) => ({ ...prev, profilepic: base64Img }));
      setTimeout(() => {
        setLoadingImage(false);
      }, 1000);
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

  const confirmLogout = () => {
    Alert.alert(
      "Confirm Logout",
      "Are you sure you want to log out?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Logout",
          style: "destructive",
          onPress: async () => {
            try {
              setShowLogout(false);
              setTimeout(async () => {
                const auth = getAuth();
                await signOut(auth);
                router.replace("/login");
              }, 500);
            } catch (error) {
              console.error("❌ Logout failed:", error);
            }
          },
        },
      ],
      { cancelable: true }
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-primary-50 px-5">
      <Modal visible={showImageModal} transparent animationType="fade">
        <Pressable
          onPress={() => setShowImageModal(false)}
          className="flex-1 bg-black/70 justify-center items-center"
        >
          {editableUserData?.profilepic ? (
            <Image
              source={{ uri: editableUserData.profilepic }}
              className="w-64 h-64 rounded-full border-4 border-white"
              resizeMode="cover"
            />
          ) : (
            <ProfilePic width={160} height={160} />
          )}
        </Pressable>
      </Modal>

      <View className="flex-row justify-between items-center mt-6 mb-4">
        <Text className="text-3xl font-extrabold text-[#2A2E43]">My Profile</Text>
        <TouchableOpacity onPress={() => setEditing(!editing)}>
          <Text className="text-primary-400 font-semibold text-base">
            {editing ? "Cancel" : "Edit"}
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        <View className="items-center mb-4">
          <TouchableOpacity
            className="w-28 h-28 rounded-full border-4 border-primary-200 shadow-sm overflow-hidden mb-2 relative items-center justify-center"
            disabled={editing}
            onPress={() => setShowImageModal(true)}
          >
            {loadingImage ? (
              <View className="absolute inset-0 items-center justify-center bg-primary-100">
                <ActivityIndicator size="small" color="#666" />
              </View>
            ) : editableUserData?.profilepic ? (
              <Image
                key="profilepic-image"
                source={{ uri: editableUserData.profilepic }}
                className="w-full h-full opacity-0"
                onLoad={() => setImageLoaded(true)}
                style={{
                  opacity: imageLoaded ? 1 : 0,
                  transition: "opacity 0.5s ease-in-out",
                }}
              />
            ) : (
              <ProfilePic key="profilepic-svg" width={112} height={112} />
            )}
          </TouchableOpacity>

          {editing && (
            <TouchableOpacity onPress={pickImage}>
              <Text className="text-primary-400 underline mt-2">
                {editableUserData.profilepic ? "Change" : "Upload"} Profile Picture
              </Text>
            </TouchableOpacity>
          )}
        </View>

        <View className="bg-white rounded-2xl px-5 py-6 shadow-sm border border-primary-100">
          {[
            "name",
            "email",
            "phone",
            "workPhone",
            "address",
          ].map((field, index) => {
            const isReadOnly = field === "name" || field === "email";
            const label =
              field === "workPhone"
                ? "Work Phone"
                : field.charAt(0).toUpperCase() + field.slice(1);

            return (
              <AnimatePresence key={field}>
                <MotiView
                  from={{ opacity: 0, translateY: 10 }}
                  animate={{ opacity: 1, translateY: 0 }}
                  transition={{ delay: index * 50, type: "timing" }}
                  className="mb-5"
                >
                  <Text className="text-gray-700 font-medium mb-1">{label}</Text>
                  <TextInput
                    editable={!isReadOnly && editing}
                    value={editableUserData[field] || ""}
                    onChangeText={(val) =>
                      setEditableUserData((prev: any) => ({ ...prev, [field]: val }))
                    }
                    placeholder={`Enter ${label}`}
                    placeholderTextColor="#B0B0B0"
                    className={`px-4 py-3 rounded-xl text-base ${
                      isReadOnly
                        ? "bg-primary-100 text-gray-400"
                        : editing
                        ? "bg-white border border-primary-300 text-gray-800"
                        : "bg-primary-50 text-gray-800"
                    }`}
                  />
                </MotiView>
              </AnimatePresence>
            );
          })}
        </View>

        {editing && (
          <TouchableOpacity
            className="bg-primary-400 py-4 mt-6 rounded-xl shadow-md"
            onPress={handleSave}
          >
            <Text className="text-white font-bold text-center text-base">
              Save Changes
            </Text>
          </TouchableOpacity>
        )}

        <AnimatePresence>
          {showLogout && (
            <MotiView
              from={{ opacity: 0, translateX: 50 }}
              animate={{ opacity: 1, translateX: 0 }}
              exit={{ opacity: 0, translateX: 100 }}
              transition={{ type: "timing", duration: 400 }}
              className="mt-6"
            >
              <TouchableOpacity
                className="bg-primary-400 py-4 rounded-xl shadow-md"
                onPress={confirmLogout}
              >
                <Text className="text-white font-bold text-center text-base">
                  Logout
                </Text>
              </TouchableOpacity>
            </MotiView>
          )}
        </AnimatePresence>
      </ScrollView>
    </SafeAreaView>
  );
}