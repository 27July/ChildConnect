import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { useRouter } from "expo-router";
import OnboardingSVG from "@/assets/images/onboardingimg.svg"; // Import SVG

export default function OnboardingScreen() {
  const router = useRouter();

  return (
    <View className="flex-1 bg-primary-50 px-5">
      {/* SVG + Text section (pushed higher) */}
      <View className="flex-1 items-center justify-end pb-20">
        <OnboardingSVG width={250} height={250} className="mb-6" />
        <Text className="text-2xl font-bold text-primary-400 mb-2">
          Welcome to ChildConnect
        </Text>
        <Text className="text-base text-primary-300 text-center">
          Ensuring Every Child’s Safety and Well-being...
        </Text>
      </View>

      {/* "Get Started" Button (pushed down) */}
      <View className="flex pb-20 px-6 pt-20">
        <TouchableOpacity
          className="bg-primary-400 py-4 rounded-lg w-full"
          onPress={() => router.push("/login")}
        >
          <Text className="text-white text-lg font-bold text-center">
            Get Started
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
