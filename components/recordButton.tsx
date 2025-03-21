import React from "react";
import { TouchableOpacity, Text } from "react-native";
import SmallRouteButton from "./smallroutebutton";

interface RecordButtonProps {
  label: string;
  destination: string;
}

export function RecordButton({ label , destination }: RecordButtonProps) {
  return (
    <TouchableOpacity className="bg-primary-400 py-4 rounded-lg items-center mb-2">
      <SmallRouteButton title={label} to= {destination} className="text-grey-700"/>
    </TouchableOpacity>
  );
}
