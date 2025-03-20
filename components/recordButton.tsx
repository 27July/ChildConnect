import React from "react";
import { TouchableOpacity, Text } from "react-native";

interface RecordButtonProps {
  label: string;
}

export function RecordButton({ label }: RecordButtonProps) {
  return (
    <TouchableOpacity className="bg-primary-300 py-4 rounded-lg items-center mb-3">
      <Text className="text-grey-700 font-bold text-lg">{label}</Text>
    </TouchableOpacity>
  );
}
