import { View, Text, TouchableOpacity } from "react-native";
import { Slot, useRouter } from "expo-router";
import {
  Home,
  BookOpen,
  School,
  User,
  MessageCircle,
} from "lucide-react-native";

export default function Layout() {
  const router = useRouter();

  return (
    <View className="flex-1 bg-background">
      {/* Page Content */}
      <Slot />

      {/* Bottom Tab Bar */}
      <View className="flex-row justify-between items-center bg-primary-600 py-3 px-6 rounded-t-2xl absolute bottom-0 w-full">
        <TouchableOpacity
          onPress={() => router.push("/teacher/home/home")}
          className="items-center"
        >
          <Home size={24} color="white" />
          <Text className="text-white text-xs">Home</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => router.push("/teacher/classes/classes")}
          className="items-center"
        >
          <BookOpen size={24} color="white" />
          <Text className="text-white text-xs">Classes</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => router.push("/teacher/chat")}
          className="items-center bg-primary-500 p-4 rounded-full"
        >
          <MessageCircle size={30} color="white" />
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => router.push("/teacher/school/school")}
          className="items-center"
        >
          <School size={24} color="white" />
          <Text className="text-white text-xs">School</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => router.push("/teacher/profile/profile")}
          className="items-center"
        >
          <User size={24} color="white" />
          <Text className="text-white text-xs">Profile</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
