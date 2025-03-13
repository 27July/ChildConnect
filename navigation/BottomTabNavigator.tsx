import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { FontAwesome5, Ionicons } from "@expo/vector-icons";
import { TouchableOpacity, View, StyleSheet } from "react-native";
import Homepage from "../screens/Homepage";
import MyClasses from "../screens/MyClasses";

const Tab = createBottomTabNavigator();

const CustomTabBarButton = ({ children, onPress }) => (
  <TouchableOpacity style={styles.chatButtonContainer} onPress={onPress}>
    <View style={styles.chatButton}>{children}</View>
  </TouchableOpacity>
);

const BottomTabNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, size }) => {
          let iconName;
          let iconColor = focused ? "#fff" : "rgba(255, 255, 255, 0.6)";

          if (route.name === "Home") iconName = "home";
          else if (route.name === "Classes") iconName = "book";
          else if (route.name === "School") iconName = "school";
          else if (route.name === "Profile") iconName = "user";

          return <FontAwesome5 name={iconName} size={size} color={iconColor} />;
        },
        tabBarStyle: styles.tabBar,
        tabBarActiveTintColor: "#fff",
        tabBarInactiveTintColor: "rgba(255, 255, 255, 0.6)",
        headerShown: false,
      })}
    >
      <Tab.Screen name="Home" component={Homepage} />
      <Tab.Screen name="Classes" component={MyClasses} />

      {/* Floating Chat Button */}
      <Tab.Screen
        name="Chat"
        component={Homepage} // Replace with your Chat screen
        options={{
          tabBarButton: (props) => (
            <CustomTabBarButton {...props}>
              <Ionicons name="chatbubbles" size={28} color="#fff" />
            </CustomTabBarButton>
          ),
        }}
      />

      <Tab.Screen name="School" component={Homepage} />
      <Tab.Screen name="Profile" component={Homepage} />
    </Tab.Navigator>
  );
};

// Styles
const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: "#285E5E",
    height: 70,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    position: "absolute",
  },
  chatButtonContainer: {
    top: -25,
    justifyContent: "center",
    alignItems: "center",
  },
  chatButton: {
    width: 70,
    height: 70,
    backgroundColor: "#285E5E",
    borderRadius: 35,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 5,
  },
});

export default BottomTabNavigator;
