import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  FlatList,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import DateTimePickerModal from "react-native-modal-datetime-picker";
import { useLocalSearchParams, useRouter } from "expo-router";
import { auth } from "@/firebaseConfig";
import { ip } from "@/utils/server_ip.json";
import { submitHomework } from "@/controllers/homeworkController";

const subjects = ["Math", "Science", "English", "Mother Tongue"];

export default function AddHomeworkScreen() {
  const { id: classid } = useLocalSearchParams();
  const [name, setName] = useState("");
  const [content, setContent] = useState("");
  const [subject, setSubject] = useState("Math");
  const [showSubjectDropdown, setShowSubjectDropdown] = useState(false);
  const [duedate, setDuedate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const apiURL = `http://${ip}:8000`;

  const handleSubmit = async () => {
    if (!name || !content || !subject || !duedate) {
      Alert.alert("Missing Fields", "Please fill in all fields.");
      return;
    }

    try {
      setLoading(true);
      await submitHomework({ classid, name, content, subject, duedate });
      Alert.alert("Success", "Homework assigned.");
      router.back();
    } catch (err) {
      console.error(err);
      Alert.alert("Error", "Submission failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-primary-50 px-5 pt-6">
      <Text className="text-3xl font-extrabold text-[#2A2E43] mb-6 text-center">
        Assign Homework
      </Text>

      {/* Title */}
      <Text className="text-[#2A2E43] font-semibold mb-1">Title</Text>
      <TextInput
        value={name}
        onChangeText={setName}
        placeholder="e.g. Math Homework"
        placeholderTextColor="#999"
        className="bg-white rounded-xl px-4 py-3 border border-gray-300 mb-4 text-[#2A2E43]"
      />

      {/* Content */}
      <Text className="text-[#2A2E43] font-semibold mb-1">Content</Text>
      <TextInput
        value={content}
        onChangeText={setContent}
        placeholder="e.g. Page 15 Q1-5"
        placeholderTextColor="#999"
        multiline
        className="bg-white rounded-xl px-4 py-3 border border-gray-300 mb-4 text-[#2A2E43]"
        style={{ minHeight: 100 }}
      />

      {/* Due Date */}
      <Text className="text-[#2A2E43] font-semibold mb-1">Due Date</Text>
      <TouchableOpacity
        onPress={() => setShowDatePicker(true)}
        className="bg-white rounded-xl border border-gray-300 px-4 py-3 mb-4"
      >
        <Text className="text-[#2A2E43]">
          {duedate.toLocaleDateString("en-SG", {
            day: "numeric",
            month: "long",
            year: "numeric",
          })}
        </Text>
      </TouchableOpacity>

      <DateTimePickerModal
        isVisible={showDatePicker}
        mode="date"
        onConfirm={(date) => {
          setDuedate(date);
          setShowDatePicker(false);
        }}
        onCancel={() => setShowDatePicker(false)}
      />

      {/* Subject */}
      <Text className="text-[#2A2E43] font-semibold mb-1">Subject</Text>
      <TouchableOpacity
        onPress={() => setShowSubjectDropdown(!showSubjectDropdown)}
        className="bg-white rounded-xl border border-gray-300 px-4 py-3"
      >
        <Text className="text-[#2A2E43]">{subject}</Text>
      </TouchableOpacity>

      {showSubjectDropdown && (
        <View className="bg-white border border-gray-300 rounded-xl mt-1 mb-6 overflow-hidden">
          {subjects.map((item) => (
            <TouchableOpacity
              key={item}
              onPress={() => {
                setSubject(item);
                setShowSubjectDropdown(false);
              }}
              className="py-3 px-4 border-b border-gray-200"
            >
              <Text className="text-[#2A2E43] text-center">{item}</Text>
            </TouchableOpacity>
          ))}
        </View>
      )}

      {/* Submit Button */}
      <TouchableOpacity
        className={`bg-primary-400 py-4 rounded-full ${
          loading ? "opacity-50" : ""
        }`}
        onPress={handleSubmit}
        disabled={loading}
      >
        <Text className="text-white font-bold text-center text-base">
          {loading ? "Submitting..." : "Submit Homework"}
        </Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}
