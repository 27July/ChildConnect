// 🔹 addAnnouncement.tsx
import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams, useRouter } from "expo-router";
import { auth } from "@/firebaseConfig";
import { ip } from "@/utils/server_ip.json";

export default function AddAnnouncementScreen() {
  const { id: classid } = useLocalSearchParams();
  const [classname, setClassname] = useState("");
  const [teacherName, setTeacherName] = useState("");
  const [name, setName] = useState("");
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const apiURL = `http://${ip}:8000`;

  useEffect(() => {
    const fetchInitialDetails = async () => {
      const user = auth.currentUser;
      const token = await user.getIdToken();

      const classRes = await fetch(`${apiURL}/class/${classid}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const classData = await classRes.json();
      setClassname(classData.name);

      const userRes = await fetch(`${apiURL}/users/${user.uid}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const userData = await userRes.json();
      setTeacherName(userData.name);
    };

    fetchInitialDetails();
  }, [classid]);

  const handleSubmit = async () => {
    if (!name || !content) {
      Alert.alert("Missing Fields", "Please enter both name and content.");
      return;
    }

    try {
      setLoading(true);
      const user = auth.currentUser;
      const token = await user.getIdToken();

      const payload = {
        classid,
        classname,
        name,
        content,
        teachername: teacherName,
        teacheruserid: user.uid,
      };

      const res = await fetch(`${apiURL}/addannouncement`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error("Failed to create announcement");

      Alert.alert("Success", "Announcement added.");
      router.back();
    } catch (err) {
      console.error(err);
      Alert.alert("Error", "Could not create announcement.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-primary-50 px-5 pt-6">
      <Text className="text-3xl font-extrabold text-[#2A2E43] mb-6 text-center">
        Add Announcement
      </Text>

      <Text className="text-[#2A2E43] font-semibold mb-1">Title</Text>
      <TextInput
        value={name}
        onChangeText={setName}
        placeholder="e.g. Exam Reminder"
        placeholderTextColor="#999"
        className="bg-white rounded-xl px-4 py-3 border border-gray-300 mb-4 text-[#2A2E43]"
      />

      <Text className="text-[#2A2E43] font-semibold mb-1">Content</Text>
      <TextInput
        value={content}
        onChangeText={setContent}
        placeholder="e.g. Science exam on Friday at 9am"
        placeholderTextColor="#999"
        multiline
        className="bg-white rounded-xl px-4 py-3 border border-gray-300 mb-6 text-[#2A2E43]"
        style={{ minHeight: 100 }}
      />

      <TouchableOpacity
        className={`bg-primary-400 py-4 rounded-full ${loading ? "opacity-50" : ""}`}
        onPress={handleSubmit}
        disabled={loading}
      >
        <Text className="text-white font-bold text-center text-base">
          {loading ? "Submitting..." : "Submit Announcement"}
        </Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}
