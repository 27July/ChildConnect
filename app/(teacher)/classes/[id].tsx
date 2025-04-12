// (teacher)/classes/[id].tsx (View)

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
import ProfilePic from "@/assets/images/profilepic.svg";
import {
  loadChildrenAndAttendance,
  toggleChildAttendance,
} from "@/controllers/classController";

export default function ClassDetailScreen() {
  const { id, name } = useLocalSearchParams();
  const [children, setChildren] = useState([]);
  const [attendanceMap, setAttendanceMap] = useState({});
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const router = useRouter();

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      try {
        const { children, attendanceMap } = await loadChildrenAndAttendance(id);
        setChildren(children);
        setAttendanceMap(attendanceMap);
      } catch (err) {
        console.error("Error loading class data:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [id]);

  const handleToggleAttendance = async (childid) => {
    try {
      const isNowPresent = await toggleChildAttendance(childid);
      setAttendanceMap((prev) => ({
        ...prev,
        [childid]: isNowPresent,
      }));
    } catch (err) {
      console.error("Toggle failed:", err);
    }
  };

  const filteredChildren = children?.filter((child) =>
    child.name.toLowerCase().includes(search.toLowerCase())
  );

  const renderChild = ({ item }) => {
    const isPresent = attendanceMap[item.id] ?? false;

    return (
      <TouchableOpacity
        onPress={() => handleToggleAttendance(item.id)}
        activeOpacity={0.9}
        className="flex-row justify-between items-center py-4 px-3 bg-white rounded-xl mb-3 shadow-sm"
      >
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

        <TouchableOpacity
          className="px-4 py-1 border border-gray-400 rounded-full"
          onPress={(e) => {
            e.stopPropagation();
            router.push({
              pathname: "/(teacher)/student/[id]",
              params: { id: item.id },
            });
          }}
        >
          <Text className="text-gray-600 text-sm font-semibold">Profile</Text>
        </TouchableOpacity>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-primary-50 px-5">
      <Text className="text-3xl font-extrabold text-[#2A2E43] mt-6 mb-4">
        {name}
      </Text>

      {/* 🔹 Top Buttons */}
      <View className="flex-row justify-between space-x-3 mb-4">
        <TouchableOpacity
          className="flex-1 bg-white px-4 py-2 rounded-xl shadow-sm border border-primary-400 items-center"
          onPress={() =>
            router.push({
              pathname: "/(teacher)/profile/homeworkList",
              params: { id },
            })
          }
        >
          <Text className="text-primary-400 font-semibold">Homework List</Text>
        </TouchableOpacity>

        <TouchableOpacity
          className="flex-1 bg-white px-4 py-2 rounded-xl shadow-sm border border-primary-400 items-center"
          onPress={() =>
            router.push({
              pathname: "/(teacher)/profile/announcementList",
              params: { id },
            })
          }
        >
          <Text className="text-primary-400 font-semibold">
            Announcement List
          </Text>
        </TouchableOpacity>
      </View>

      {/* 🔹 Middle Buttons */}
      <View className="flex-row justify-between mb-4 space-x-3">
        <TouchableOpacity
          className="flex-1 bg-primary-400 px-4 py-2 rounded-xl shadow-sm items-center"
          onPress={() =>
            router.push({
              pathname: "/(teacher)/classes/addHomework",
              params: { id },
            })
          }
        >
          <Text className="text-white font-semibold">Assign Homework</Text>
        </TouchableOpacity>

        <TouchableOpacity
          className="flex-1 bg-primary-400 px-4 py-2 rounded-xl shadow-sm items-center"
          onPress={() =>
            router.push({
              pathname: "/(teacher)/profile/addAnnouncement",
              params: { id },
            })
          }
        >
          <Text className="text-white font-semibold">Add Announcement</Text>
        </TouchableOpacity>
      </View>

      <View className="mb-4 px-2">
        <TouchableOpacity
          className="w-full bg-primary-400 px-4 py-3 rounded-xl shadow-sm items-center"
          onPress={() =>
            router.push({
              pathname: "/(teacher)/profile/gradeList",
              params: { id },
            })
          }
        >
          <Text className="text-white font-semibold">Grades</Text>
        </TouchableOpacity>
      </View>

      {/* 🔍 Search */}
      <TextInput
        placeholder="Search for someone"
        value={search}
        onChangeText={setSearch}
        className="bg-white px-4 py-3 rounded-xl border border-gray-200 mb-4 text-base"
      />

      {/* 👇 Student List */}
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
