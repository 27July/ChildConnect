import React from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Image,
  Dimensions,
} from "react-native";
import { useRouter } from "expo-router";
import { FontAwesome5 } from "@expo/vector-icons";

// Import Profile Image

// Get screen width dynamically
const screenWidth = Dimensions.get("window").width;

const classes = [
  {
    id: "1",
    name: "1E4",
    subject: "Science",
    teacher: "Form Teacher",
    color: "#6C9BCF",
  },
  {
    id: "2",
    name: "2K2",
    subject: "Science",
    teacher: "Form Teacher",
    color: "#F7A7A6",
  },
  {
    id: "3",
    name: "2K1",
    subject: "Science",
    teacher: "Teacher",
    color: "#FAD02E",
  },
];

const MyClasses = () => {
  const router = useRouter();

  return (
    <View className="flex-1 bg-[#E6F0EE] px-5 items-center">
      <Image
        // source={profileImage}
        className="w-15 h-15 rounded-full mt-20 mb-2"
      />
      <View className="bg-[#C6E3DE] py-3 px-5 rounded-lg mb-5">
        <Text className="text-base font-bold text-center">
          Experimental Primary School
        </Text>
      </View>
      <Text className="text-xl font-bold mb-2 text-center">Classes</Text>
      <FlatList
        data={classes}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingTop: 10, paddingBottom: 20 }}
        renderItem={({ item }) => (
          <TouchableOpacity
            className="flex-row items-center bg-white py-5 px-5 rounded-lg mb-3 shadow-card"
            style={{ width: screenWidth * 0.9 }}
            onPress={() => router.push(`/class-details/${item.id}`)}
          >
            <View
              className={`w-11 h-11 rounded-full justify-center items-center mr-4`}
              style={{ backgroundColor: item.color }}
            >
              <FontAwesome5 name="book" size={18} color="#fff" />
            </View>
            <View className="flex-1 justify-center">
              <Text className="text-lg font-bold">{item.name}</Text>
              <Text className="text-sm text-[#6C9BCF] mt-1">
                {item.subject}
              </Text>
            </View>
            <View className="justify-center items-end">
              <Text className="text-sm text-gray-600 mb-1">{item.teacher}</Text>
              <Text className="text-sm text-[#285E5E] font-bold">
                View Details
              </Text>
            </View>
          </TouchableOpacity>
        )}
      />
    </View>
  );
};

export default MyClasses;
