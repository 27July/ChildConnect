import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams, useRouter } from "expo-router";
import { auth } from "@/firebaseConfig";
import { ip } from "@/utils/server_ip.json";
import Slider from "@react-native-community/slider";

export default function NewTestScreen() {
  const { id } = useLocalSearchParams(); // classid
  const [classname, setClassname] = useState("");
  const [children, setChildren] = useState([]);
  const [scores, setScores] = useState({});
  const [testname, setTestname] = useState("");
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const apiURL = `http://${ip}:8000`;

  useEffect(() => {
    if (id) {
      fetchClassInfo();
      fetchChildren();
    }
  }, [id]);

  const fetchClassInfo = async () => {
    const token = await auth.currentUser.getIdToken();
    const res = await fetch(`${apiURL}/class/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();
    setClassname(data.name || "");
  };

  const fetchChildren = async () => {
    const token = await auth.currentUser.getIdToken();
    const res = await fetch(`${apiURL}/class/${id}/children`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();
    setChildren(data);
    setLoading(false);
  };

  const handleSubmit = async () => {
    if (!testname.trim()) {
      Alert.alert("Missing Test Name", "Please enter a name for the test.");
      return;
    }

    const childrenid = children.map((child) => child.id);
    const childrenname = children.map((child) => child.name);
    const childrenscore = children.map((child) => parseFloat(scores[child.id]) || 0);

    const payload = {
      testname,
      classid: id,
      class: classname,
      childrenid,
      childrenname,
      childrenscore,
    };

    try {
      const token = await auth.currentUser.getIdToken();
      const res = await fetch(`${apiURL}/grades/add-test`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error("Failed to create test");

      Alert.alert("Success", "Test scores saved successfully!");
      router.back();
    } catch (err) {
      console.error("Submit error:", err);
      Alert.alert("Error", "Failed to save test data.");
    }
  };

  const renderChildItem = ({ item }) => {
    const score = scores[item.id] ?? 0;

    return (
      <View className="bg-white px-4 py-3 rounded-xl mb-4 shadow-sm">
        <Text className="text-base font-semibold text-gray-800 mb-1">{item.name}</Text>

        {/* 🔹 Text Input */}
        <TextInput
          placeholder="Enter score"
          keyboardType="numeric"
          value={score.toString()}
          onChangeText={(text) => {
            let val = parseFloat(text);
            if (isNaN(val)) val = 0;
            if (val > 100) val = 100;
            if (val < 0) val = 0;
            setScores((prev) => ({ ...prev, [item.id]: val }));
          }}
          className="bg-primary-50 px-4 py-2 rounded-lg border border-gray-200 mb-2"
        />

        {/* 🔹 Slider */}
        <Slider
          style={{ width: "100%", height: 40 }}
          minimumValue={0}
          maximumValue={100}
          step={1}
          value={score}
          minimumTrackTintColor="#2A9D8F"
          maximumTrackTintColor="#ccc"
          onValueChange={(val) =>
            setScores((prev) => ({ ...prev, [item.id]: Math.round(val) }))
          }
        />

        <Text className="text-sm text-gray-500 mt-1">Score: {score}/100</Text>
      </View>
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-primary-50 px-5 pt-6">
      <Text className="text-2xl font-extrabold text-[#2A2E43] mb-2">New Test</Text>
      <Text className="text-base text-gray-500 mb-4">Class: {classname}</Text>

      {/* Test Name */}
      <TextInput
        placeholder="Test name"
        value={testname}
        onChangeText={setTestname}
        className="bg-white px-4 py-3 rounded-xl border border-gray-300 mb-5 text-base"
      />

      {loading ? (
        <ActivityIndicator size="large" color="#999" />
      ) : (
        <FlatList
          data={children}
          renderItem={renderChildItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ paddingBottom: 100 }}
        />
      )}

      {/* Save Button */}
      <TouchableOpacity
        className="absolute bottom-6 left-5 right-5 bg-primary-400 py-3 rounded-xl items-center"
        onPress={handleSubmit}
      >
        <Text className="text-white font-semibold text-base">Save Test</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}
