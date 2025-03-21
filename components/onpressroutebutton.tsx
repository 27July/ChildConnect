import React from "react";
import { TouchableOpacity, Text } from "react-native";
import { useRouter } from "expo-router";

type OnPressRouteButtonProps = {
  title: string;
  to?: string;  // ✅ Optional route for navigation
  onPress?: () => void; // ✅ Allows custom functions
};

export default function OnPressRouteButton({ title, to, onPress }: OnPressRouteButtonProps) {
  const router = useRouter();

  return (
    <TouchableOpacity
      className="bg-primary-400 py-4 rounded-lg w-full"
      onPress={() => {
        if (onPress) {
          onPress(); // ✅ Call function if provided
        } else if (to) {
          router.push(to); // ✅ Navigate if route is provided
        }
      }}
    >
      <Text className="text-white text-lg font-bold text-center">
        {title}
      </Text>
    </TouchableOpacity>
  );
}
