import React from "react";
import { View, Text, Image } from "react-native";

// Profile Image URL (Replace with real image URL)
const profileImage = require("../../../assets/images/female_profile_pic.webp");

const Homepage = () => {
  return (
    <View className="flex-1 bg-[#f6fff8] items-center justify-center">
      <Image source={profileImage} className="w-20 h-20 rounded-full mb-2" />
      <Text className="text-lg font-semibold mb-5 text-black">
        Welcome back, Jaslyn
      </Text>
      <View className="w-4/5 bg-[#C6E3DE] p-5 rounded-lg items-center mt-2">
        <Text className="text-base font-bold mb-1">Announcements</Text>
        <Text className="text-sm text-gray-600">
          You have no new announcements
        </Text>
      </View>
    </View>
  );
};

export default Homepage;
