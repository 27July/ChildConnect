import { View, Text, TouchableOpacity } from "react-native";
import { Slot, useRouter, useSegments } from "expo-router";
import { Home, Baby, School, User, MessageCircle } from "lucide-react-native";

export default function Layout() {
  const router = useRouter();
  const segments = useSegments();

  // ✅ Hide tab bar on specific screens
  const hideTabBar =
    segments.includes("chatpage") || segments.includes("childmode");

  return (
    <View className="flex-1 bg-background">
      {/* Page Content */}
      <Slot />

      {/* Bottom Tab Bar - Hidden on Specific Screens */}
      {!hideTabBar && (
        <View className="flex-row justify-between items-center bg-primary-400 py-3 px-6 rounded-t-2xl absolute bottom-0 w-full">
          <TouchableOpacity
            onPress={() => router.push("/parent/home/home")}
            className="items-center"
          >
            <Home size={24} color="white" />
            <Text className="text-white text-xs">Home</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => router.push("/parent/children/children")}
            className="items-center"
          >
            <Baby size={24} color="white" />
            <Text className="text-white text-xs">Children</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => router.push("/parent/chat/chatlist")}
            className="items-center bg-primary-300 p-4 rounded-full"
          >
            <MessageCircle size={30} color="white" />
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => router.push("/parent/school/school")}
            className="items-center"
          >
            <School size={24} color="white" />
            <Text className="text-white text-xs">School</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => router.push("/parent/profile/profile")}
            className="items-center"
          >
            <User size={24} color="white" />
            <Text className="text-white text-xs">Profile</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}
