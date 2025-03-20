import React from "react";
import { View, Text, TextInput } from "react-native";
import RouteButton from "@/components/routebutton";
import SmallRouteButton from "@/components/smallroutebutton";
import LoginImg from "@/assets/images/loginimg.svg"; // Import the SVG

export default function LoginScreen() {
  return (
    <View className="flex-1 bg-primary-50 px-5 pt-40">
      {/* Title & Illustration */}
      <View className="items-center mb-6">
      <Text className="text-2xl font-bold text-primary-400 mb-2">
          Welcome Back
        </Text>
        <LoginImg width={250} height={250} className="mb-6" />
      </View>

      {/* Email Input */}
      <TextInput
        className="bg-white rounded-md px-4 py-3 mb-4"
        placeholder="Enter your email"
        placeholderTextColor="#999"
      />

      {/* Password Input */}
      <TextInput
        className="bg-white rounded-md px-4 py-3 mb-2"
        placeholder="Enter your password"
        placeholderTextColor="#999"
        secureTextEntry
      />

      {/* Forgot Password Link */}
      <View className="mb-6">
        <SmallRouteButton title="Forgot Password" to="/forget" />
      </View>

      {/* Login Button (full-width) */}
      <View className="mb-4 pt-20">
        <RouteButton title="Login" to="/login" />
      </View>

      {/* Register Link */}
      <View className="flex-row justify-center mt-4">
        <Text className="text-gray-500 mr-1">Don’t have an account?</Text>
        <SmallRouteButton title="Register" to="/register" />
      </View>
    </View>
  );
}
