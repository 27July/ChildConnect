import React from "react";
import { TouchableOpacity, Text } from "react-native";
import { Linking } from 'react-native';

interface ContactButtonProps {
    phoneNumber: string; //phone number of the parent
    onPress: () => void;
    label: String //name of the parent
}

export function ContactButton ({label, phoneNumber}): ContactButtonProps {
  return (
    <TouchableOpacity 
        onPress={onPress}
        className="ml-4 px-4 py-2 bg-blue-500 rounded-lg">
      <Text className="text-white font-semibold">{phoneNumber}</Text>
    </TouchableOpacity>
  );
};

export default ContactButton;
