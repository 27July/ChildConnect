import React from "react";
import { createStackNavigator } from "@react-navigation/stack"; //Allow switching between screens
import { NavigationContainer } from "@react-navigation/native"; //Wraps the whole app to enable navigation
//import BottomTabNavigator from "./BottomTabNavigator"; //Handle bottom tabs for main app navigation
import InitialScreen from "../screens/InitialScreen";
import LoginScreen from "../screens/LoginScreen";
import { Text } from "react-native"; 



export type RootStackParamList = {
    Initial: undefined;
    Login: undefined;
    Main: undefined;
  };
const Stack = createStackNavigator<RootStackParamList>(); //Navigator object that keeps track of which screen is currently displayed

export default function AppNavigator() {
    return (
      <NavigationContainer> 
        <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen
            name="Initial"
            component={InitialScreen}
            options={{ headerTitle: () => <Text>Initial Screen</Text> }} // ✅ Wrap title in <Text>
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


  
