import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  Alert,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import { useLocalSearchParams, useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { auth } from "@/firebaseConfig";
import { ip } from "@/utils/server_ip.json";

export default function DocumentationForm() {
  const { id: childId } = useLocalSearchParams();
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [image, setImage] = useState<string | null>(null);
  const apiURL = `http://${ip}:8000`;

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.7,
      base64: true,
    });

    if (!result.canceled && result.assets.length > 0) {
      setImage(`data:image/jpeg;base64,${result.assets[0].base64}`);
    }
  };

  const handleSubmit = async () => {
    if (!title.trim()) {
      Alert.alert("Error", "Please enter a title.");
      return;
    }

    const user = auth.currentUser;
    if (!user) return;

    const token = await user.getIdToken();

    try {
      const res = await fetch(`${apiURL}/createdocument`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: title,
          content,
          image,
          childid: childId,
        }),
      });

      if (!res.ok) throw new Error("Failed to create document");
      Alert.alert("Success", "Documentation added!");
      router.back();
    } catch (err) {
      console.error("Error submitting documentation:", err);
      Alert.alert("Error", "Failed to add documentation.");
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-primary-50 p-5">
      <Text className="text-2xl font-bold text-center mb-5">
        Add Documentation
      </Text>

      <TextInput
        className="bg-white rounded-xl px-4 py-3 mb-4"
        placeholder="Title"
        placeholderTextColor="#999"
        value={title}
        onChangeText={setTitle}
      />

      <TextInput
        className="bg-white rounded-xl px-4 py-3 mb-4"
        placeholder="Content"
        placeholderTextColor="#999"
        value={content}
        onChangeText={setContent}
        multiline
        numberOfLines={4}
      />

      <TouchableOpacity
        className="bg-primary-400 py-3 rounded-xl mb-3"
        onPress={pickImage}
      >
        <Text className="text-white text-center font-bold">
          {image ? "Change Image" : "Upload Image"}
        </Text>
      </TouchableOpacity>

      {image && (
        <Image
          source={{ uri: image }}
          className="w-full h-48 rounded-xl mb-4"
          resizeMode="cover"
        />
      )}

      <TouchableOpacity
        className="bg-[#2A2E43] py-3 rounded-xl mt-3"
        onPress={handleSubmit}
      >
        <Text className="text-white text-center font-bold">Submit</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}
