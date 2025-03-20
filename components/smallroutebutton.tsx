// app/components/SmallRouteButton.tsx
import React from "react";
import { Text, TouchableOpacity } from "react-native";
import { useRouter } from "expo-router";

type SmallRouteButtonProps = {
  title: string;
  to: string;
};

export default function SmallRouteButton({ title, to }: SmallRouteButtonProps) {
  const router = useRouter();

  return (
    <TouchableOpacity onPress={() => router.push(to)}>
      <Text className="text-primary-400 font-bold">{title}</Text>
    </TouchableOpacity>
  );
}
