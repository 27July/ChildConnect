import React, { useState } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import { useRouter } from "expo-router";

export const options = {
  href: null,
};


export default function ChildrenScreen() {
  const router = useRouter();

  // Sample children data (Replace with actual API data)
  const [children, setChildren] = useState([
    { id: "1", name: "Lebron James", age: 7 },
    { id: "2", name: "Keerthi", age: 9 },
  ]);

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Select a Child</Text>
      <FlatList
        data={children}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.childCard}
            onPress={() => router.push(`./childinfo`)} // ✅ Navigates to sample child screen
          >
            <Text style={styles.childName}>{item.name}</Text>
            <Text style={styles.childAge}>{item.age} years old</Text>
          </TouchableOpacity>
        )}
      />
    </View>
  );
}

// ✅ Styles
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#E6F0EE",
    padding: 20,
  },
  header: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#285E5E",
    marginBottom: 15,
  },
  childCard: {
    backgroundColor: "#fff",
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
  },
  childName: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#285E5E",
  },
  childAge: {
    fontSize: 14,
    color: "#666",
  },
});
