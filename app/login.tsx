import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  Alert,
  Keyboard,
  KeyboardAvoidingView,
  TouchableWithoutFeedback,
  Platform,
  ScrollView,
} from "react-native";
import { useRouter } from "expo-router";
import OnPressRouteButton from "@/components/onpressroutebutton";
import SmallRouteButton from "@/components/smallroutebutton";
import LoginImg from "@/assets/images/loginimg.svg";
import { auth } from "../firebaseConfig";
import { signInWithEmailAndPassword } from "firebase/auth";
import { ip } from "../utils/server_ip.json";
import { SafeAreaView } from "react-native-safe-area-context";
import { loginUser } from "@/controllers/authController";

export default function LoginScreen() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [apiURL, setApiURL] = useState("http://127.0.0.1:8000");

  useEffect(() => {
    setApiURL(`http://${ip}:8000`);
  }, []);

  const handleLogin = async () => {
    try {
      const { name, role } = await loginUser(email, password);
      Alert.alert("Login Successful", name);

      if (role === "parent") {
        router.replace("/(parent)/(tabs)/home");
      } else if (role === "teacher") {
        router.replace("/(teacher)/(tabs)/home");
      }
    } catch (err: any) {
      Alert.alert("Login Failed", err.message || "Please try again.");
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
                Welcome Back
              </Text>
              <LoginImg width={250} height={250} className="mb-6" />
            </View>

            <TextInput
              className="bg-white rounded-md px-4 py-3 mb-4"
              placeholder="Enter your email"
              placeholderTextColor="#999"
              autoCapitalize="none"
              keyboardType="email-address"
              value={email}
              onChangeText={setEmail}
            />

            <TextInput
              className="bg-white rounded-md px-4 py-3 mb-2"
              placeholder="Enter your password"
              placeholderTextColor="#999"
              secureTextEntry
              value={password}
              onChangeText={setPassword}
            />

            <View className="mb-6 pt-5">
              <SmallRouteButton title="Forgot Password?" to="/forget" />
            </View>

            <View className="mb-4">
              <OnPressRouteButton title="Login" onPress={handleLogin} />
            </View>

            <View className="flex-row justify-center mt-4">
              <Text className="text-gray-500 mr-1">Don’t have an account?</Text>
              <SmallRouteButton title="Register Here" to="/roleselection" />
            </View>
          </View>
        </SafeAreaView>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
}
