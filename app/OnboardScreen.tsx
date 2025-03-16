// screens/InitialScreen.tsx
import React from "react";
import { View, Text, Button, StyleSheet, TouchableOpacity } from "react-native";
import { Image } from "react-native";
import { StackScreenProps } from "@react-navigation/stack"; // Import type
import type { RootStackParamList } from "../navigation/AppNavigator"; // Import stack param list
import OnboardingSVG from "../assets/onboarding.svg";



// Define props type
type Props = StackScreenProps<RootStackParamList, "Onboard">;

export default function OnboardingScreen({ navigation }: Props) {
  return (
    <View style={styles.container}>
      <OnboardingSVG width={250} height={250} />
      <Text style={styles.title}>Welcome to ChildConnect</Text>
      <Text style={styles.subtitle}>Ensuring Every Child’s Safety and Well-being...</Text>
      
      <Text style={styles.SmallerText}>New here? Lets get you started</Text>
      <TouchableOpacity style={styles.button} onPress={() => navigation.navigate("Login")}>
        <Text style={styles.buttonText}>Get Started</Text>
      </TouchableOpacity>
      
      <Text style={styles.signInText}>
        Already have an account?{" "}
        <Text style={styles.signInLink} onPress={() => navigation.navigate("Login")}>
          Sign In
        </Text>
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#E6F0EC",
    padding: 20,
  },
  image: {
    width: 200,
    height: 200,
    marginBottom: 20,
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
    marginBottom: 60,
  },
  
  button: {
    backgroundColor: "#6B9080",
    paddingVertical: 12,
    paddingHorizontal: 50,
    borderRadius: 10,
  },
  buttonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
  SmallerText: {
    marginTop: 7,
    color: "#666",
    marginBottom: 5
  },
  signInText: {
    marginTop: 7,
    color: "#666",
  },
  signInLink: {
    color: "#6B9080",
    fontWeight: "bold",
  },
});