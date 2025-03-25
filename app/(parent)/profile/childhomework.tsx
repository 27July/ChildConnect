import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { auth } from "@/firebaseConfig";
import { ip } from "@/utils/server_ip.json";

export default function ChildHomeworkScreen() {
  const { childId } = useLocalSearchParams();
  console.log("📦 childhomework.tsx received param childId:", childId);

  const [homework, setHomework] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const apiURL = `http://${ip}:8000`;

  useEffect(() => {
    console.log("🔍 useEffect triggered with childId:", childId);

    const fetchHomework = async () => {
      const user = auth.currentUser;
      if (!user) return;

      const token = await user.getIdToken();

      try {
        // 1. Get the child info
        console.log("📁 Fetching child data from:", `${apiURL}/child/${childId}`);
        const childRes = await fetch(`${apiURL}/child/${childId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const childData = await childRes.json();
        console.log("👦 Child data:", childData);

        // 2. Get class document to retrieve class ID
        console.log("🏫 Fetching class data for class:", childData.class);
        const classRes = await fetch(`${apiURL}/classbynamewithid/${childData.class}`, {

          headers: { Authorization: `Bearer ${token}` },
        });
        const classData = await classRes.json();
        const classid = classData?.id;
        console.log("📘 Class ID:", classid);

        // 3. Get all homework documents for this class
        console.log("📝 Fetching homework for class ID:", classid);
        const homeworkRes = await fetch(`${apiURL}/homework/class/${classid}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const homeworkList = await homeworkRes.json();
        console.log("📚 Homework list:", homeworkList);

        // 4. Enrich each homework with teacher name
        const enrichedHomework = await Promise.all(
          homeworkList.map(async (hw: any) => {
            let teacherName = "Unknown";
            try {
              const userRes = await fetch(`${apiURL}/users/${hw.teacherid}`, {
                headers: { Authorization: `Bearer ${token}` },
              });
              if (userRes.ok) {
                const data = await userRes.json();
                teacherName = data.name;
              }
            } catch (err) {
              console.warn("⚠️ Failed to fetch teacher name:", err);
            }

            return {
              ...hw,
              teacherName,
            };
          })
        );

        setHomework(enrichedHomework);
      } catch (err) {
        console.error("❌ Failed to load homework:", err);
      } finally {
        setLoading(false);
      }
    };

    if (childId) {
      fetchHomework();
    }
  }, [childId]);

  const formatDate = (timestamp: any) => {
    try {
      const date = new Date(timestamp.seconds * 1000);
      return date.toLocaleDateString("en-SG", {
        year: "numeric",
        month: "short",
        day: "numeric",
      });
    } catch {
      return "";
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-primary-50 p-5">
      <Text className="text-2xl font-bold text-center mb-6">Homework List</Text>

      {loading ? (
        <ActivityIndicator size="large" color="#285E5E" />
      ) : homework.length === 0 ? (
        <Text className="text-center text-gray-500 mt-10">
          No homework assigned for this class.
        </Text>
      ) : (
        <ScrollView>
          {homework.map((hw, idx) => (
            <View
              key={idx}
              className="bg-white rounded-3xl p-5 mb-4"
            >
              <Text className="text-lg font-bold text-[#2A2E43] mb-1">
                {hw.name}
              </Text>
              <Text className="text-base text-[#2A2E43] mb-2">
                {hw.content}
              </Text>
              <Text className="text-sm text-gray-600">
                Due: {formatDate(hw.duedate)}
              </Text>
              <Text className="text-sm text-gray-600">
                Status: {hw.status}
              </Text>
              <Text className="text-sm text-gray-600 italic mt-1">
                Assigned by: {hw.teacherName}
              </Text>
            </View>
          ))}
        </ScrollView>
      )}
    </SafeAreaView>
  );
}
