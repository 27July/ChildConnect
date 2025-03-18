import React from "react";
import { createStackNavigator } from "@react-navigation/stack"; //Allow switching between screens
import { NavigationContainer } from "@react-navigation/native"; //Wraps the whole app to enable navigation
//import BottomTabNavigator from "./BottomTabNavigator"; //Handle bottom tabs for main app navigation
import OnboardScreen from "../screens/OnboardScreen";
import LoginScreen from "../screens/LoginScreen";
import { Text } from "react-native"; 



export type RootStackParamList = {
    Onboard: undefined;
    Login: undefined;
    Main: undefined;
  };
const Stack = createStackNavigator<RootStackParamList>(); //Navigator object that keeps track of which screen is currently displayed

export default function AppNavigator() {
    return (
      <NavigationContainer> 
        <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen
            name="Onboard"
            component={OnboardScreen}
            options={{ headerTitle: () => <Text>Onboard Screen</Text> }} // ✅ Wrap title in <Text>
            />
            <Stack.Screen
            name="Login"
            component={LoginScreen}
            options={{ headerTitle: () => <Text>Login</Text> }} // ✅ Wrap title in <Text>
            />
        </Stack.Navigator>
      </NavigationContainer>
    );
  }



  
