import React from "react";
import { TouchableOpacity, Text } from "react-native";
import { Linking } from "react-native";

interface ContactButtonProps {
  phoneNumber: string; // Phone number of the parent
  onPress?: () => void; // Optional onPress function
  label: string; // Name of the parent
}

export function ContactButton({ label, phoneNumber, onPress }: ContactButtonProps) {
  //function that handles missing phone number of missing onpress
  const handlePress = () => {
    if (onPress) {
      onPress();
    } else if (phoneNumber) {
      Linking.openURL(`tel:${phoneNumber}`).catch((err) =>
        console.error("Error opening dialer", err)
      );
    }
  };

  return (
    <TouchableOpacity
      onPress={handlePress}
      className="ml-4 px-4 py-2 rounded-lg"
    >
      <Text className="text-blue-500 font-semibold">{label}</Text>
    </TouchableOpacity>
  );
}
