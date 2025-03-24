import { Stack } from "expo-router";
import { StatusBar } from "react-native";
import "./globals.css";

export default function RootLayout() {
  return (
    <>
      {/* ✅ Global Dark Status Bar */}
      <StatusBar barStyle="dark-content" backgroundColor="#E6F0EC" />
      <Stack screenOptions={{ headerShown: false, gestureEnabled: false }} />
    </>
  );
}
