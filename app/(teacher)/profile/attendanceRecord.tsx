import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  Image,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import { useLocalSearchParams } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { auth } from "@/firebaseConfig";
import { ip } from "@/utils/server_ip.json";
import ProfilePic from "../../../assets/images/profilepic.svg";

export default function AttendanceRecord() {
  const { date, id: childId } = useLocalSearchParams();
  const [entry, setEntry] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [selectedImage, setSelectedImage] = useState<ImagePicker.ImagePickerAsset | null>(null);
  const apiURL = `http://${ip}:8000`;

  useEffect(() => {
    fetchDetails();
  }, [date, childId]);

  const fetchDetails = async () => {
    setLoading(true);
    const user = auth.currentUser;
    if (!user) return;
    const token = await user.getIdToken();

    try {
      const res = await fetch(`${apiURL}/attendance/${date}?childid=${childId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) {
        setEntry(null);
        return;
      }

      const data = await res.json(); // [{ childid, image, present }]
      const matched = data.find((e: any) => e.childid === childId);

      if (!matched) {
        setEntry(null);
        return;
      }

      const childRes = await fetch(`${apiURL}/child/${childId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const childData = await childRes.json();
      setEntry({
        ...matched,
        name: childData.name,
        class: childData.class,
        grade: childData.grade,
        profilepic: childData.profilepic,
      });
    } catch (err) {
      console.error("Error fetching attendance record:", err);
      setEntry(null);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAttendance = async (present: boolean) => {
    const user = auth.currentUser;
    if (!user) return;
    const token = await user.getIdToken();

    const formData = new FormData();
    formData.append("childid", childId as string);
    formData.append("date", date as string);
    formData.append("present", String(present));
    if (selectedImage) {
      const imageName = selectedImage.uri.split("/").pop() || "attendance.jpg";
      formData.append("image", {
        uri: selectedImage.uri,
        name: imageName,
        type: selectedImage.type ?? "image/jpeg",
      } as any);
    }

    try {
      setUploading(true);
      const res = await fetch(`${apiURL}/attendance/update`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
        body: formData,
      });

      if (!res.ok) throw new Error("Attendance update failed");
      await fetchDetails();
      Alert.alert("Success", present ? "Marked Present" : "Marked Absent");
    } catch (err) {
      console.error(err);
      Alert.alert("Error", "Failed to update attendance");
    } finally {
      setUploading(false);
      setSelectedImage(null);
    }
  };

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.6,
    });
    if (!result.canceled && result.assets?.[0]) {
      setSelectedImage(result.assets[0]);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-primary-50 p-5">
      <ScrollView>
        <Text className="text-2xl font-bold text-center mb-4">
          Attendance {formatDisplayDate(date as string)}
        </Text>

        {!entry ? (
          <View className="items-center justify-center mt-20">
            <Text className="text-xl font-semibold text-red-500 mb-2">
              No data recorded for this day
            </Text>
            <Text className="text-base text-gray-500 text-center px-8">
              Contact a teacher if you believe this is an error.
            </Text>
          </View>
        ) : (
          <View className="bg-white rounded-xl px-4 py-6 mb-5 items-center">
            {/* 🔹 Profile Image (top) */}
            {entry.profilepic && entry.profilepic !== "" ? (
              <Image
                source={{ uri: entry.profilepic }}
                className="w-24 h-24 rounded-full mb-2"
              />
            ) : (
              <ProfilePic width={96} height={96} className="mb-2" />
            )}

            <Text className="text-primary-400 font-bold text-lg">{entry.name}</Text>
            <Text className="text-[#6C7A93] mb-4">
              Class: {entry.class}   Grade: {entry.grade}
            </Text>

            <View className="flex-row items-center justify-between w-full px-4">
              {entry.image && entry.image !== "null" ? (
                <Image
                  source={{ uri: entry.image }}
                  className="w-32 h-32 rounded-xl"
                />
              ) : (
                <ProfilePic width={128} height={128} />
              )}
              <Text
                className={`text-lg font-bold ${
                  entry.present ? "text-green-600" : "text-red-600"
                }`}
              >
                {entry.present ? "Present" : "Absent"}
              </Text>
            </View>
          </View>
        )}

        {/* 🔹 Optional Image Preview */}
        {selectedImage && (
          <Image
            source={{ uri: selectedImage.uri }}
            className="w-full h-48 rounded-xl mb-4"
            resizeMode="cover"
          />
        )}

        {/* 🔹 Upload + Action Buttons */}
        <TouchableOpacity
          className="bg-primary-400 py-3 rounded-xl mb-3"
          onPress={pickImage}
        >
          <Text className="text-center text-white font-bold">
            Upload Photo
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          className="bg-green-600 py-3 rounded-xl mb-3"
          onPress={() => handleMarkAttendance(true)}
          disabled={uploading}
        >
          <Text className="text-center text-white font-bold">
            {uploading ? "Uploading..." : "Mark Present"}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          className="bg-red-600 py-3 rounded-xl"
          onPress={() => handleMarkAttendance(false)}
          disabled={uploading}
        >
          <Text className="text-center text-white font-bold">
            {uploading ? "Updating..." : "Mark Absent"}
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

function formatDisplayDate(dateString: string): string {
  if (dateString.length !== 8) return dateString;
  const day = dateString.slice(0, 2);
  const month = dateString.slice(2, 4);
  const year = dateString.slice(4);
  return `${day}/${month}/${year}`;
}
