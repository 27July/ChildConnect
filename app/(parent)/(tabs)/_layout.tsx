import { Tabs } from "expo-router";
import {
  Home,
  Baby,
  School,
  User,
  MessageCircle,
} from "lucide-react-native";

export default function ParentTabLayout() {
  return (
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
          tabBarIcon: ({ color, size }) => <Home color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="children"
        options={{
          title: "Children",
          tabBarIcon: ({ color, size }) => <Baby color={color} size={size} />,
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
        name="schools"
        options={{
          title: "School",
          tabBarIcon: ({ color, size }) => <School color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",
          tabBarIcon: ({ color, size }) => <User color={color} size={size} />,
        }}
      />
    </Tabs>
  );
}
