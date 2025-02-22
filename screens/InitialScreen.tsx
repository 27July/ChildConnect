// screens/InitialScreen.tsx
import React from "react";
import { View, Text, Button, StyleSheet } from "react-native";
import { StackScreenProps } from "@react-navigation/stack"; // Import type
import type { RootStackParamList } from "../navigation/AppNavigator"; // Import stack param list


// Define props type
type Props = StackScreenProps<RootStackParamList, "Initial">;

export default function InitialScreen({ navigation }: Props) {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Welcome to Initial Screen</Text>
      <Button title="Go to Login" onPress={() => navigation.navigate("Login")} />
    </View>
  );
}
const styles = StyleSheet.create({
    container: {
      flex: 1,             // Takes full height of the screen
      justifyContent: "center", // Centers content vertically
      alignItems: "center", // Centers content horizontally
      backgroundColor: "#F5F5F5", // Adds a light gray background
    },
    text: {
      fontSize: 20,
      fontWeight: "bold",
      marginBottom: 20, // Adds spacing below the text
    },
  });
