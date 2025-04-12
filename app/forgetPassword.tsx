import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  Alert,
  Keyboard,
  KeyboardAvoidingView,
  TouchableWithoutFeedback,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import ForgotPasswordImg from "@/assets/images/forgetpassword.svg";
import OnPressRouteButton from "@/components/onpressroutebutton";
import SmallRouteButton from "@/components/smallroutebutton";
import { auth } from "@/firebaseConfig";
import { sendPasswordResetEmail } from "firebase/auth";
import { resetPassword } from "@/controllers/passwordResetController";

export default function ForgetScreen() {
  const router = useRouter();
  const [email, setEmail] = useState("");

  const handleResetPassword = async () => {
    try {
      await resetPassword(email); // ✅ uses controller logic
      Alert.alert("Password Reset Email Sent", "Check your inbox.");
      router.back();
    } catch (err: any) {
      Alert.alert("Reset Failed", err.message || "Try again later.");
    }
  };

  return (
    <KeyboardAvoidingView
      className="flex-1"
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 20}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <SafeAreaView className="flex-1 bg-primary-50">
          <View className="flex-1 justify-center px-5">
            <View className="items-center mb-6">
              <Text className="text-2xl font-bold text-primary-400 mb-2">
                Reset Password
              </Text>
              <ForgotPasswordImg width={250} height={250} className="mb-6" />
            </View>

            <TextInput
              className="bg-white rounded-md px-4 py-3 mb-6"
              placeholder="Enter your email"
              placeholderTextColor="#999"
              keyboardType="email-address"
              autoCapitalize="none"
              value={email}
              onChangeText={setEmail}
            />

            <View className="mb-4">
              <OnPressRouteButton
                title="Send Reset Email"
                onPress={handleResetPassword}
              />
            </View>

            <View className="flex-row justify-center mt-4">
              <Text className="text-gray-500 mr-1">
                Remember your password?
              </Text>
              <SmallRouteButton title="Login" to="/login" />
            </View>
          </View>
        </SafeAreaView>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
}
