import React from "react";
import { View, Text } from "react-native";
import OnboardingSVG from "@/assets/images/onboardingimg.svg";
import RouteButton from "@/components/routebutton"; // Updated button component

export default function OnboardingScreen() {
  return (
    <View className="flex-1 bg-primary-50 px-5">
      {/* SVG + Text section */}
      <View className="flex-1 items-center justify-end pb-20">
        <OnboardingSVG width={250} height={250} className="mb-6" />
        <Text className="text-2xl font-bold text-primary-400 mb-2">
          Welcome to ChildConnect
        </Text>
        <Text className="text-base text-primary-300 text-center">
          Ensuring Every Child’s Safety and Well-being...
        </Text>
      </View>

      {/* Reusable buttons */}
      <View className="flex pb-20 px-6 pt-20">
        <RouteButton title="Get Started" to="/login" />
        <RouteButton title="Parent" to="/(parent)/home" className="mt-4" />
        <RouteButton
          title="Teacher"
          to="./(teacher)/home"
          className="mt-4"
        />
      </View>
    </View>
  );
}
