import React from "react";
import { TouchableOpacity, Text } from "react-native";
import { useNavigation } from "@react-navigation/native";
import SmallRouteButton from "@/components/smallroutebutton";


interface ChatButtonProps { 
  onPress?: () => void; //Optional onPress function
}

export function ChatButton({ onPress }: ChatButtonProps) {

  const handlePress = () => {
    if(onPress) {
        onPress();
    }else{
        return <SmallRouteButton title="Chat" to="/Chat" /> // Navigate to Chat screen
    }
    
  };

  return (
    <TouchableOpacity
      onPress={handlePress}
      className="ml-4 px-4 py-2 rounded-lg"
    >
      <Text className="text-blue-500 font-semibold">Chat</Text>
    </TouchableOpacity>
  );
}
