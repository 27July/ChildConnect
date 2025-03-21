import React from "react";
import { TouchableOpacity, Text } from "react-native";
import { useRouter } from "expo-router";

interface RecordButtonProps {
  label: string;
  destination: string;
}

export function RecordButton({ label, destination }: RecordButtonProps) {
  const router = useRouter();

  return (
    <TouchableOpacity
      className="bg-primary-400 py-4 rounded-lg items-center mb-2"
      onPress={() => router.push(destination as any)}

    >
      <Text className="text-grey-700 font-bold">{label}</Text>
    </TouchableOpacity>
  );
}
