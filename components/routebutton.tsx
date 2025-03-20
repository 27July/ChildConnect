import React from "react";
import { TouchableOpacity, Text } from "react-native";
import { useRouter } from "expo-router";

type RouteButtonProps = {
  title: string;
  to: string; // Destination route
};

export default function RouteButton({ title, to }: RouteButtonProps) {
  const router = useRouter();

  return (
    <TouchableOpacity
      className="bg-primary-400 py-4 rounded-lg w-full"
      onPress={() => router.push(to)}
    >
      <Text className="text-white text-lg font-bold text-center">
        {title}
      </Text>
    </TouchableOpacity>
  );
}
