import React, { useState, useEffect } from "react";
import { View, Text, TextInput, Alert, ScrollView } from "react-native";
import { useRouter } from "expo-router";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth } from "@/firebaseConfig";
import OnPressRouteButton from "@/components/onpressroutebutton";
import { ip } from "@/utils/server_ip.json";
import { registerUser } from "@/controllers/registerController";


export default function RegisterTeacher() {
  const router = useRouter();
  const [apiURL, setApiURL] = useState("http://127.0.0.1:8000");

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState("");

  useEffect(() => {
    setApiURL(`http://${ip}:8000`);
  }, []);

  const handleRegister = async () => {
    if (!name || !email || !password || !phone) {
      Alert.alert("Missing Fields", "Please fill in all fields.");
      return;
    }
  
    try {
      await registerUser(email, password, name, phone, "teacher");
      Alert.alert("Success", "Account created!");
      router.push("/login");
    } catch (error: any) {
      console.error("Registration Error:", error.message);
      if (error.code === "auth/email-already-in-use") {
        Alert.alert("This email is already registered.");
      } else {
        Alert.alert("Registration failed", error.message);
      }
    }
  };

      if (!response.ok) {
        throw new Error("Failed to save user profile.");
      }

      Alert.alert("Success", "Account created!");
      router.push("/login");
    } catch (error: any) {
      console.error("Registration Error:", error.message);
      if (error.code === "auth/email-already-in-use") {
        Alert.alert("This email is already registered.");
      } else {
        Alert.alert("Registration failed", error.message);
      }
    }
  };

  return (
    <ScrollView className="flex-1 bg-primary-50 px-6 pt-20">
      <Text className="text-2xl font-bold text-primary-400 mb-6">
        Teacher Registration
      </Text>

      <TextInput
        className="bg-white rounded-md px-4 py-3 mb-4"
        placeholder="Full Name"
        placeholderTextColor="#999"
        value={name}
        onChangeText={setName}
      />

      <TextInput
        className="bg-white rounded-md px-4 py-3 mb-4"
        placeholder="Email"
        placeholderTextColor="#999"
        autoCapitalize="none"
        keyboardType="email-address"
        value={email}
        onChangeText={setEmail}
      />

      <TextInput
        className="bg-white rounded-md px-4 py-3 mb-4"
        placeholder="Phone Number"
        placeholderTextColor="#999"
        keyboardType="phone-pad"
        value={phone}
        onChangeText={setPhone}
      />

      <TextInput
        className="bg-white rounded-md px-4 py-3 mb-4"
        placeholder="Password"
        placeholderTextColor="#999"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />

      <OnPressRouteButton title="Register" onPress={handleRegister} />
    </ScrollView>
  );
}
