import { Tabs } from "expo-router";
import {
  Home,
  Baby,
  School,
  User,
  MessageCircle,
  BookOpen,
} from "lucide-react-native";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";

export default function ParentTabLayout() {
  return (
    <SafeAreaProvider>
      <SafeAreaView
        style={{ flex: 1, backgroundColor: "#f6fff8" }} // bg-primary-400
        edges={["top"]}
      >
        <Tabs
          screenOptions={{
            headerShown: false,
            tabBarActiveTintColor: "white",
            tabBarInactiveTintColor: "#d1d5db",
            tabBarStyle: {
              backgroundColor: "#6b9080", // bg-primary-400
              borderTopLeftRadius: 20,
              borderTopRightRadius: 20,
              height: 70,
              paddingBottom: 10,
            },
            tabBarLabelStyle: {
              fontSize: 12,
            },
          }}
        >
          <Tabs.Screen
            name="home"
            options={{
              title: "Home",
              tabBarIcon: ({ color, size }) => (
                <Home color={color} size={size} />
              ),
            }}
          />
          <Tabs.Screen
            name="classes"
            options={{
              title: "Classes",
              tabBarIcon: ({ color, size }) => (
                <BookOpen color={color} size={size} />
              ),
            }}
          />
          <Tabs.Screen
            name="chatlist"
            options={{
              title: "Chats",
              tabBarIcon: ({ color }) => (
                <MessageCircle
                  size={30}
                  color={color}
                  style={{
                    backgroundColor: "#6b9080", // bg-primary-300
                    padding: 12,
                    borderRadius: 50,
                  }}
                />
              ),
            }}
          />
          
          <Tabs.Screen
            name="profile"
            options={{
              title: "Profile",
              tabBarIcon: ({ color, size }) => (
                <User color={color} size={size} />
              ),
            }}
          />
        </Tabs>
      </SafeAreaView>
    </SafeAreaProvider>
  );
}
