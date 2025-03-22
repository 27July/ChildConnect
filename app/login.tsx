import React, { useState, useEffect } from "react";
import { View, Text, TextInput, Alert } from "react-native";
import { useRouter } from "expo-router";
import OnPressRouteButton from "@/components/onpressroutebutton";
import SmallRouteButton from "@/components/smallroutebutton";
import LoginImg from "@/assets/images/loginimg.svg";
import { auth } from "../firebaseConfig";
import { signInWithEmailAndPassword } from "firebase/auth";
import { ip } from "../utils/server_ip.json";

export default function LoginScreen() {
  const router = useRouter();
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [apiURL, setApiURL] = useState<string>("http://127.0.0.1:8000"); // Default

  useEffect(() => {
    const fetchIP = async () => {
      console.log("Using API URL:", `http://${ip}:8000`);
      setApiURL(`http://${ip}:8000`);
    };
    fetchIP();
  }, []);

  const handleLogin = async () => {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      const token: string = await user.getIdToken();

      console.log("API URL being used:", apiURL);
      console.log("Firebase ID Token:", token);

      const response = await fetch(`${apiURL}/profile`, {
        method: "GET",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const data = await response.json();
      console.log("Backend Response:", data);
      Alert.alert("Login Successful", `${data.email}`);

      router.push("./(parent)/home");
    } catch (error: any) {
      console.error("Login Error:", error.message);
      Alert.alert("Login Failed,\n Please Try Again!");
    }
  };

  return (
    <View className="flex-1 bg-primary-50 px-5 pt-40">
      <View className="items-center mb-6">
        <Text className="text-2xl font-bold text-primary-400 mb-2">Welcome Back</Text>
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

      <View className="mb-6">
        <SmallRouteButton title="Forgot Password" to="/forget" />
      </View>

      <View className="mb-4 pt-20">
        <OnPressRouteButton title="Login" onPress={handleLogin} />
      </View>

      <View className="flex-row justify-center mt-4">
        <Text className="text-gray-500 mr-1">Don’t have an account?</Text>
        <SmallRouteButton title="Register" to="/register" />
      </View>
    </View>
  );
}
