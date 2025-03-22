import React from "react";
import { View, Text, Image } from "react-native";
import { getAuth, signOut } from "firebase/auth"; // For logout
import { useRouter } from "expo-router";
import OnPressRouteButton from "@/components/onpressroutebutton";

// Profile Image URL (Replace with real image URL)
const profileImage = require("../../../assets/images/female_profile_pic.webp");

const Homepage = () => {
  const router = useRouter(); // ✅ Move useRouter() inside the component

  // ✅ Logout function
  const handleLogout = async () => {
    try {
      const auth = getAuth();
      await signOut(auth);
      console.log("✅ Logged out");

      // ✅ Navigate user back to login screen
      router.replace("/login");
    } catch (error) {
      console.error("❌ Logout failed:", error);
    }
  };

  return (
    <View className="flex-1 bg-[#E6F0EE] items-center justify-center">
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
      <View className="mb-4 pt-20">
        <OnPressRouteButton title="Logout" onPress={handleLogout} />
      </View>
    </View>
  );
};

export default Homepage;
