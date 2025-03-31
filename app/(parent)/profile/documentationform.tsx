import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  Alert,
  Keyboard,
  TouchableWithoutFeedback,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import * as DocumentPicker from "expo-document-picker";
import * as ImagePicker from "expo-image-picker";
import * as FileSystem from "expo-file-system";
import { useLocalSearchParams, useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { auth } from "@/firebaseConfig";
import { ip } from "@/utils/server_ip.json";

export default function DocumentationForm() {
  const { id: childId } = useLocalSearchParams();
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [imageData, setImageData] = useState<string | null>(null);
  const [fileData, setFileData] = useState<string | null>(null);
  const [fileType, setFileType] = useState<string | null>(null);
  const apiURL = `http://${ip}:8000`;

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.7,
      base64: true,
    });

    if (!result.canceled && result.assets.length > 0) {
      const base64 = result.assets[0].base64;
      setImageData(`data:image/jpeg;base64,${base64}`);
    }
  };

  const pickFile = async () => {
    const result = await DocumentPicker.getDocumentAsync({
      type: ["application/pdf"],
      copyToCacheDirectory: true,
      multiple: false,
    });

    if (result.canceled || !result.assets?.[0]) return;

    const file = result.assets[0];
    const base64 = await FileSystem.readAsStringAsync(file.uri, {
      encoding: FileSystem.EncodingType.Base64,
    });

    const mimeType = file.mimeType || "application/octet-stream";
    setFileData(`data:${mimeType};base64,${base64}`);
    setFileType(mimeType);
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
          image: imageData,
          file: fileData,
          filetype: fileType,
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
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
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

          {/* 🔹 Upload Image Button */}
          <TouchableOpacity
            className="bg-primary-400 py-3 rounded-xl mb-3"
            onPress={pickImage}
          >
            <Text className="text-white text-center font-bold">
              {imageData ? "Change Image" : "Upload Image"}
            </Text>
          </TouchableOpacity>

          {imageData && (
            <Image
              source={{ uri: imageData }}
              className="w-full h-48 rounded-xl mb-4"
              resizeMode="cover"
            />
          )}

          {/* 🔹 Upload File Button */}
          <TouchableOpacity
            className="bg-primary-400 py-3 rounded-xl mb-3"
            onPress={pickFile}
          >
            <Text className="text-white text-center font-bold">
              {fileData ? "Change File" : "Upload PDF"}
            </Text>
          </TouchableOpacity>

          {fileData && fileType?.includes("pdf") && (
            <Text className="text-sm italic text-gray-700 mb-3">
              📄 PDF file attached
            </Text>
          )}

          <TouchableOpacity
            className="bg-[#2A2E43] py-3 rounded-xl mt-3"
            onPress={handleSubmit}
          >
            <Text className="text-white text-center font-bold">Submit</Text>
          </TouchableOpacity>
        </SafeAreaView>
      </KeyboardAvoidingView>
    </TouchableWithoutFeedback>
  );
}
