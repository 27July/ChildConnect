// app/teacher/student/[id].tsx

import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  Image,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { auth } from "@/firebaseConfig";
import { ip } from "@/utils/server_ip.json";
import ProfilePic from "@/assets/images/profilepic.svg";

export default function StudentProfileScreen() {
  const { id } = useLocalSearchParams();
  const [child, setChild] = useState(null);
  const [father, setFather] = useState(null);
  const [mother, setMother] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const apiURL = `http://${ip}:8000`;

  useEffect(() => {
    const fetchData = async () => {
      const user = auth.currentUser;
      const token = await user.getIdToken();
      const res = await fetch(`${apiURL}/child/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setChild(data);

      const [fRes, mRes] = await Promise.all([
        fetch(`${apiURL}/users/${data.fatherid}`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch(`${apiURL}/users/${data.motherid}`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      if (fRes.ok) {
        const fData = await fRes.json();
        setFather(fData);
      }
      if (mRes.ok) {
        const mData = await mRes.json();
        setMother(mData);
      }
      setLoading(false);
    };
    fetchData();
  }, [id]);

  const renderProfileImage = (uri) =>
    !uri || uri === "" ? (
      <ProfilePic width={48} height={48} />
    ) : (
      <Image source={{ uri }} className="w-12 h-12 rounded-full" />
    );

  if (loading || !child) {
    return (
      <SafeAreaView className="flex-1 justify-center items-center bg-white">
        <ActivityIndicator size="large" color="#285E5E" />
        <Text className="mt-4 text-gray-600">Loading student profile...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-primary-50">
      <ScrollView contentContainerStyle={{ padding: 20 }}>
        <View className="items-center mb-4">
          {child.profilepic ? (
            <Image
              source={{ uri: child.profilepic }}
              className="w-32 h-32 rounded-full"
            />
          ) : (
            <ProfilePic width={128} height={128} />
          )}
        </View>

        <Text className="text-xl font-bold text-center text-[#2A2E43]">{child.name}</Text>
        <Text className="text-center text-[#2A2E43] mt-1">{child.school}</Text>
        <Text className="text-center text-[#2A2E43] mt-1">
          Class: {child.class}   Grade: {child.grade}
        </Text>

        {[father, mother].map((p, idx) =>
          p ? (
            <View
              key={idx}
              className="flex-row bg-white rounded-xl items-center p-4 mb-3"
            >
              {renderProfileImage(p.profilepic)}
              <View className="flex-1 ml-4">
                <Text className="font-semibold text-[#2A2E43]">{p.name}</Text>
                <Text className="text-[#6C7A93] text-sm">
                  {idx === 0 ? "Father" : "Mother"}
                </Text>
              </View>
              <View>
                <Text className="text-blue-600 mb-1">Chat</Text>
                <Text className="text-blue-600">Contact Info</Text>
              </View>
            </View>
          ) : null
        )}

        {[
          { label: "Attendance Records", path: "/(teacher)/profile/attendance" },
          { label: "Documentation", path: "/(teacher)/profile/documentationlist" },
          { label: "Homework List", path: "/teacher/profile/childhomework" },
        ].map((item, i) => (
          <TouchableOpacity
            key={i}
            onPress={() => router.push({ pathname: item.path, params: { id } })}
            className="bg-[#C6E3DE] py-4 rounded-full mb-3"
          >
            <Text className="text-center font-bold text-[#2A2E43]">
              {item.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}
