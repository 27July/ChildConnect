import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  ActivityIndicator,
  Image,
  TouchableOpacity,
  TextInput,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams, useRouter } from "expo-router";
import { auth } from "@/firebaseConfig";
import { ip } from "@/utils/server_ip.json";
import ProfilePic from "@/assets/images/profilepic.svg";

export default function ClassDetailScreen() {
  const { id, name } = useLocalSearchParams();
  const [children, setChildren] = useState([]);
  const [attendanceMap, setAttendanceMap] = useState({});
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const apiURL = `http://${ip}:8000`;
  const router = useRouter();

  useEffect(() => {
    fetchChildren();
  }, [id]);

  const fetchChildren = async () => {
    const token = await auth.currentUser.getIdToken();
    const res = await fetch(`${apiURL}/class/${id}/children`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();
    setChildren(data);
    fetchAttendance(data.map((c) => c.id));
  };

  const fetchAttendance = async (childIds) => {
    const today = new Date();
    const docId = today.toLocaleDateString("en-GB").split("/").join(""); // e.g. 30032025
    const token = await auth.currentUser.getIdToken();

    try {
      const res = await fetch(`${apiURL}/attendance-for-date/${docId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) {
        setAttendanceMap({});
        setLoading(false);
        return;
      }

      const data = await res.json();
      const presentIds = new Set(data.map((d) => d.childid));
      const map = {};
      childIds.forEach((id) => {
        map[id] = presentIds.has(id); // present: true, else false
      });

      setAttendanceMap(map);
    } catch (err) {
      console.error("Error fetching attendance:", err);
      setAttendanceMap({});
    } finally {
      setLoading(false);
    }
  };

  const filteredChildren = children?.filter((child) =>
    child.name.toLowerCase().includes(search.toLowerCase())
  );

  const renderChild = ({ item }) => {
    const isPresent =
      attendanceMap.hasOwnProperty(item.id) ? attendanceMap[item.id] : false;

    return (
      <View className="flex-row justify-between items-center py-4 px-3 bg-white rounded-xl mb-3 shadow-sm">
        <View className="flex-row items-center space-x-3 flex-1">
          {item.profilepic ? (
            <Image
              source={{ uri: item.profilepic }}
              className="w-10 h-10 rounded-full"
            />
          ) : (
            <ProfilePic width={40} height={40} />
          )}
          <View>
            <Text className="text-base font-semibold text-gray-800">
              {item.name}
            </Text>
            <Text className="text-sm text-gray-500">
              Attendance:{" "}
              <Text
                className={`font-semibold ${
                  isPresent ? "text-green-600" : "text-red-500"
                }`}
              >
                {isPresent ? "Present" : "Absent"}
              </Text>
            </Text>
          </View>
        </View>

        <View className="space-y-2 items-end">
        <TouchableOpacity
  className="px-4 py-1 border border-gray-400 rounded-full"
  onPress={() => router.push({ pathname: "/(teacher)/student/[id]", params: { id: item.id } })}
>
  <Text className="text-gray-600 text-sm font-semibold">Profile</Text>
</TouchableOpacity>


          <TouchableOpacity className="px-4 py-1 bg-primary-400 rounded-full">
            <Text className="text-white text-sm font-semibold">
              Take Attendance
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-primary-50 px-5">
      <Text className="text-3xl font-extrabold text-[#2A2E43] mt-6 mb-4">
        {name}
      </Text>

      <View className="flex-row justify-between mb-4 space-x-3">
        <TouchableOpacity className="flex-1 bg-primary-400 px-4 py-2 rounded-xl shadow-sm items-center">
          <Text className="text-white font-semibold">Assign Homework</Text>
        </TouchableOpacity>
        <TouchableOpacity className="flex-1 bg-primary-400 px-4 py-2 rounded-xl shadow-sm items-center">
          <Text className="text-white font-semibold">Add Announcement</Text>
        </TouchableOpacity>
      </View>

      <TextInput
        placeholder="Search for someone"
        value={search}
        onChangeText={setSearch}
        className="bg-white px-4 py-3 rounded-xl border border-gray-200 mb-4 text-base"
      />

      {loading ? (
        <ActivityIndicator size="large" color="#999" className="mt-10" />
      ) : (
        <FlatList
          data={filteredChildren}
          renderItem={renderChild}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ paddingBottom: 20 }}
        />
      )}
    </SafeAreaView>
  );
}
