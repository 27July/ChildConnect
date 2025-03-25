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
import ProfilePic from "../../../assets/images/profilepic.svg";
import { useRouter } from "expo-router";



export default function ChildDetailScreen() {
  const { id } = useLocalSearchParams();
  const [child, setChild] = useState<any>(null);
  const [teachers, setTeachers] = useState<any[]>([]);
  const apiURL = `http://${ip}:8000`;
  const router = useRouter();

  useEffect(() => {
    const fetchData = async () => {
      const user = auth.currentUser;
      if (!user) return;
      const token = await user.getIdToken();

      try {
        // 🔹 Get child
        const childRes = await fetch(`${apiURL}/child/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const childData = await childRes.json();
        setChild(childData);

        // 🔹 Get class by class name
        const classRes = await fetch(
          `${apiURL}/classbyname/${childData.class}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        const classData = await classRes.json();

        const teacherEntries = [
          { id: classData.teacherId, role: "Form Teacher" },
          ...(classData.subteachers || []).map((id: string) => ({
            id,
            role: "Teacher",
          })),
        ];

        const teacherResults = await Promise.all(
          teacherEntries.map(async ({ id, role }) => {
            const res = await fetch(`${apiURL}/users/${id}`, {
              headers: { Authorization: `Bearer ${token}` },
            });
            if (res.ok) {
              const { name, profilepic } = await res.json();
              return { name, profilepic, role };
            }
            return null;
          })
        );

        setTeachers(teacherResults.filter((t) => t !== null));
      } catch (err) {
        console.error("Error fetching detail:", err);
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
          {child.profilepic ? (
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
          Class: {child.class}   Grade: {child.grade}
        </Text>

        {/* 🔹 Attendance */}
        <View className="bg-[#C6E3DE] px-4 py-3 rounded-full mt-5 mb-4">
          <Text className="text-center font-bold text-[#2A2E43]">
            Today's Attendance: <Text className="text-[#00B6AC]">Present</Text>
          </Text>
        </View>

        {/* 🔹 Teachers */}
        {teachers.map((teacher, idx) => (
          <View
            key={idx}
            className="flex-row bg-white rounded-xl items-center p-4 mb-3"
          >
            {renderProfileImage(teacher.profilepic)}
            <View className="flex-1 ml-4">
              <Text className="font-semibold text-[#2A2E43]">
                {teacher.name}
              </Text>
              <Text className="text-[#6C7A93] text-sm">{teacher.role}</Text>
            </View>
            <View>
              <Text className="text-blue-600 mb-1">Chat</Text>
              <Text className="text-blue-600">Contact Information</Text>
            </View>
          </View>
        ))}

        {/* 🔹 Buttons */}
        <TouchableOpacity
        className="bg-[#C6E3DE] py-4 rounded-full mb-3"
        onPress={() => router.push({ pathname: "../../profile/attendance", params: { id } })}
        >
        <Text className="text-center font-bold text-[#2A2E43]">
            Attendance Records
        </Text>
        </TouchableOpacity>



        <TouchableOpacity
          className="bg-[#C6E3DE] py-4 rounded-full"
          onPress={() => router.push({ pathname: "../../profile/documentationlist", params: { id} })}
        >
          <Text className="text-center font-bold text-[#2A2E43]">
            Documentation
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}
