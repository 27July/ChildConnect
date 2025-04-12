import { StyleSheet, Text, View } from "react-native";
import React from "react";
import OnboardingSVG from "../assets/images/onboardingimg.svg";
import { generateRoleButtons } from "@/factories/roleViewFactory";

const RoleSelection = () => {
  return (
    <View className="flex-1 bg-primary-50 px-5">
      {/* SVG + Text section */}
      <View className="flex-1 items-center justify-end pb-20">
        <OnboardingSVG width={250} height={250} className="mt-20 mb-10" />
        <Text className="text-2xl font-bold text-primary-400 mb-2">
          Tell me more about yourself...
        </Text>
        <Text className="text-lg text-primary-300 text-center">
          Are you a Parent or a Teacher?
        </Text>
      </View>

      {/* Buttons generated via Factory */}
      <View className="flex pb-20 px-6 pt-0 space-y-4">
        {generateRoleButtons()}
      </View>
    </View>
  );
};

export default RoleSelection;
