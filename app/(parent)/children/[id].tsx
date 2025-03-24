import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  Image,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import { useLocalSearchParams } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { auth } from "@/firebaseConfig";
import { ip } from "@/utils/server_ip.json";
import ProfilePic from "../../../assets/images/profilepic.svg"; // ✅ Adjusted path if needed

export default function ChildDetailScreen() {
  const { id } = useLocalSearchParams();
  const [child, setChild] = useState<any>(null);
  const [father, setFather] = useState<any>(null);
  const [mother, setMother] = useState<any>(null);
  const apiURL = `http://${ip}:8000`;

  useEffect(() => {
    const fetchData = async () => {
      const user = auth.currentUser;
      if (!user) return;

      const token = await user.getIdToken();

      try {
        // 🔹 Get child data
        const childRes = await fetch(`${apiURL}/child/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const childData = await childRes.json();
        setChild(childData);

        // 🔹 Get parents
        const [fatherRes, motherRes] = await Promise.all([
          fetch(`${apiURL}/users/${childData.fatherid}`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          fetch(`${apiURL}/users/${childData.motherid}`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);

        if (fatherRes.ok) {
            const userData = await fatherRes.json();
            const { name, profilepic, role } = userData;
            setFather({ name, profilepic, role });
          }
          
        if (motherRes.ok) {
            const userData = await motherRes.json();
            const { name, profilepic, role } = userData;
            setMother({ name, profilepic, role });
          }
          

      } catch (err) {
        console.error("Error fetching child detail:", err);
      }
    };

    fetchData();
  }, [id]);

  if (!child) return null;

  const renderProfileImage = (uri: string | null) => {
    if (!uri || uri.trim() === "") {
      return <ProfilePic width={48} height={48} />;
    }
    return <Image source={{ uri }} className="w-12 h-12 rounded-full" />;
  };

  return (
    <SafeAreaView className="flex-1 bg-primary-50">
      <ScrollView contentContainerStyle={{ padding: 20 }}>
        {/* 🔹 Child Image */}
        <View className="items-center mb-4">
          {child.profilepic && child.profilepic !== "" ? (
            <Image
              source={{ uri: child.profilepic }}
              className="w-32 h-32 rounded-full"
            />
          ) : (
            <ProfilePic width={128} height={128} />
          )}
        </View>

        {/* 🔹 Name, School, Class */}
        <Text className="text-xl font-bold text-center text-[#2A2E43]">
          {child.name}
        </Text>
        <Text className="text-center text-[#2A2E43] mt-1">{child.school}</Text>
        <Text className="text-center text-[#2A2E43] mt-1">
          Class: {child.class}{"   "}Grade: {child.grade}
        </Text>

        {/* 🔹 Attendance */}
        <View className="bg-[#C6E3DE] px-4 py-3 rounded-full mt-5 mb-4">
          <Text className="text-center font-bold text-[#2A2E43]">
            Today's Attendance: <Text className="text-[#00B6AC]">Present</Text>
          </Text>
        </View>

        {/* 🔹 Parents */}
        {[
            father ? { ...father, relation: "Father" } : null,
            mother ? { ...mother, relation: "Mother" } : null,
            ]
            .filter((p) => p !== null)
            .map((parent, idx) => (

            <View
              key={idx}
              className="flex-row bg-white rounded-xl items-center p-4 mb-3"
            >
              {renderProfileImage(parent.profilepic)}
              <View className="flex-1 ml-4">
                <Text className="font-semibold text-[#2A2E43]">
                  {parent.name}
                </Text>
                <Text className="text-[#6C7A93] text-sm">
                    {parent.relation}
                </Text>
              </View>
              <View>
                <Text className="text-blue-600 mb-1">Chat</Text>
                <Text className="text-blue-600">Contact Information</Text>
              </View>
            </View>
          ))}

        {/* 🔹 Buttons */}
        <TouchableOpacity className="bg-[#C6E3DE] py-4 rounded-full mb-3">
          <Text className="text-center font-bold text-[#2A2E43]">
            Attendance Records
          </Text>
        </TouchableOpacity>

        <TouchableOpacity className="bg-[#C6E3DE] py-4 rounded-full">
          <Text className="text-center font-bold text-[#2A2E43]">
            Documentation
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}
