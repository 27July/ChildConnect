import React from "react";
import { createStackNavigator } from "@react-navigation/stack";
import { NavigationContainer } from "@react-navigation/native";
import BottomTabNavigator from "./BottomTabNavigator"; // ✅ Taskbar Navigation
import OnboardScreen from "../screens/OnboardScreen";
import LoginScreen from "../screens/LoginScreen";
import ClassDetailsScreen from "../screens/ClassDetailsScreen";

export type RootStackParamList = {
  Onboard: undefined;
  Login: undefined;
  Main: undefined;
  ClassDetails: { classData: any };
};

const Stack = createStackNavigator<RootStackParamList>();

export default function AppNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{ headerShown: false }}
        initialRouteName="Main"
      >
        {/* ✅ Start with Main (HomePage) */}
        <Stack.Screen name="Main" component={BottomTabNavigator} />

        {/* Class details page (Opens from MyClasses) */}
        <Stack.Screen name="ClassDetails" component={ClassDetailsScreen} />

        {/* Onboarding & Login (If needed later) */}
        <Stack.Screen name="Onboard" component={OnboardScreen} />
        <Stack.Screen name="Login" component={LoginScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
