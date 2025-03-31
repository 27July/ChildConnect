import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Image,
  Alert,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { auth } from "@/firebaseConfig";
import { ip } from "@/utils/server_ip.json";

export default function DocumentationList() {
  const { id: childId } = useLocalSearchParams();
  const router = useRouter();
  const [documents, setDocuments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const apiURL = `http://${ip}:8000`;

  useEffect(() => {
    const fetchDocs = async () => {
      const user = auth.currentUser;
      if (!user) return;
      const token = await user.getIdToken();

      try {
        const res = await fetch(`${apiURL}/documents/${childId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!res.ok) throw new Error("Failed to fetch documents");
        const docs = await res.json();

        const enriched = await Promise.all(
          docs.map(async (doc: any) => {
            let createdByName = "";
            let createdByRole = "";

            if (doc.createdby) {
              try {
                const userRes = await fetch(`${apiURL}/users/${doc.createdby}`, {
                  headers: { Authorization: `Bearer ${token}` },
                });

                if (userRes.ok) {
                  const userData = await userRes.json();
                  createdByName = userData.name || "";
                  createdByRole = userData.role || "";
                }
              } catch (err) {
                console.warn("Failed to fetch creator user", err);
              }
            }

            return {
              ...doc,
              createdByName,
              createdByRole,
            };
          })
        );

        setDocuments(enriched);
      } catch (err) {
        console.error("Error fetching documents:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchDocs();
  }, [childId]);

  return (
    <SafeAreaView className="flex-1 bg-primary-50 p-5">
      <Text className="text-2xl font-bold text-center mb-6">
        Documentation List
      </Text>

      {loading ? (
        <ActivityIndicator size="large" color="#285E5E" />
      ) : (
        <>
          <FlatList
            data={documents}
            keyExtractor={(item) => item.id || item.name}
            renderItem={({ item }) => (
              <View className="bg-white rounded-3xl p-5 mb-4 items-center">
                {/* 🔹 Only show image if available */}
                {item.image && item.image.trim() !== "" && (
                  <Image
                    source={{ uri: item.image }}
                    className="w-full h-48 rounded-xl mb-3"
                    resizeMode="cover"
                  />
                )}

                {/* 🔹 Title + Content */}
                <Text className="text-lg font-bold text-[#2A2E43] text-center">
                  {item.name || "Untitled"}
                </Text>
                <Text className="text-base text-[#2A2E43] mt-1 text-center">
                  {item.content || "No description"}
                </Text>

                {/* 🔹 Creator Info */}
                {item.createdByName && (
                  <Text className="text-sm text-gray-600 mt-2 italic text-center">
                    Created by: {item.createdByName},{" "}
                    {capitalize(item.createdByRole)}
                  </Text>
                )}

                {/* 🔹 Created Date */}
                {item.created && (
                  <Text className="text-sm text-gray-500 mt-1 text-center">
                    {formatDate(item.created)}
                  </Text>
                )}
              </View>
            )}
            ListEmptyComponent={() => (
              <Text className="text-center text-gray-500 mt-10">
                No documentation found for this child.
              </Text>
            )}
          />

          {/* ✅ Add Documentation Button */}
          <TouchableOpacity
            className="bg-primary-400 py-4 rounded-full mt-6"
            onPress={() =>
              router.push({
                pathname: "../../profile/documentationform",
                params: { id: childId },
              })
            }
          >
            <Text className="text-center font-bold text-white">
              Add Documentation
            </Text>
          </TouchableOpacity>
        </>
      )}
    </SafeAreaView>
  );
}

function formatDate(dateStr: string) {
  try {
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-SG", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  } catch {
    return "";
  }
}

function capitalize(word: string) {
  if (!word) return "";
  return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
}
