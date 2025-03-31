import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  Image,
  ScrollView,
  TouchableOpacity,
  Linking,
  ActivityIndicator,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams } from "expo-router";
import { auth } from "@/firebaseConfig";
import { ip } from "@/utils/server_ip.json";
import ProfilePic from "@/assets/images/profilepic.svg";

export default function OtherContact() {
  const { id } = useLocalSearchParams();
  const [contact, setContact] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const apiURL = `http://${ip}:8000`;

  useEffect(() => {
    const fetchContact = async () => {
      try {
        const user = auth.currentUser;
        if (!user) return;
        const token = await user.getIdToken();
        const res = await fetch(`${apiURL}/users/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!res.ok) throw new Error("Failed to fetch contact");
        const data = await res.json();
        setContact(data);
      } catch (err) {
        console.error("Error loading contact info", err);
        Alert.alert("Error", "Unable to load contact information.");
      } finally {
        setLoading(false);
      }
    };

    fetchContact();
  }, [id]);

  const openDial = (number: string) => {
    Linking.openURL(`tel:${number}`);
  };

  const openEmail = (email: string) => {
    Linking.openURL(`mailto:${email}`);
  };

  if (loading) {
    return (
      <SafeAreaView className="flex-1 justify-center items-center bg-white">
        <ActivityIndicator size="large" color="#285E5E" />
        <Text className="mt-4 text-gray-600">Loading contact info...</Text>
      </SafeAreaView>
    );
  }

  if (!contact) {
    return (
      <SafeAreaView className="flex-1 justify-center items-center bg-white">
        <Text className="text-gray-600">Contact not found.</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-primary-50 px-5">
      <ScrollView showsVerticalScrollIndicator={false} className="mt-6">
        <View className="items-center mb-4">
          {contact.profilepic ? (
            <Image
              source={{ uri: contact.profilepic }}
              className="w-28 h-28 rounded-full border-4 border-primary-200 shadow-sm"
            />
          ) : (
            <ProfilePic width={112} height={112} />
          )}
        </View>

        <View className="bg-white rounded-2xl px-5 py-6 shadow-sm border border-primary-100">
          {[
            { label: "Name", value: contact.name },
            {
              label: "Email",
              value: contact.email,
              onPress: () => openEmail(contact.email),
            },
            {
              label: "Phone",
              value: contact.phone,
              onPress: () => openDial(contact.phone),
            },
            contact.workPhone && {
              label: "Work Phone",
              value: contact.workPhone,
              onPress: () => openDial(contact.workPhone),
            },
          ]
            .filter(Boolean)
            .map((field, idx) => (
              <TouchableOpacity
                key={idx}
                onPress={field.onPress}
                disabled={!field.onPress}
                className="mb-5"
              >
                <Text className="text-gray-700 font-medium mb-1">
                  {field.label}
                </Text>
                <Text className="text-base bg-primary-50 px-4 py-3 rounded-xl text-gray-800">
                  {field.value || "-"}
                </Text>
              </TouchableOpacity>
            ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}