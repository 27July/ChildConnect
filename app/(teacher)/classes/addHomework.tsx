import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Alert,
  Modal,
} from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import { useNavigation } from "@react-navigation/native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function AddHomeworkScreen() {
  const navigation = useNavigation();
  const [name, setName] = useState("");
  const [content, setContent] = useState("");
  const [classId, setClassId] = useState("");
  const [dueDate, setDueDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [tempDate, setTempDate] = useState(new Date());

  const handleAddHomework = async () => {
    const homeworkData = {
      name,
      content,
      classid: classId,
      status: "open",
      duedate: dueDate,
    };

    console.log("Homework Data:", homeworkData);

    try {
      // TODO: Send data to backend (e.g., Firestore)
      Alert.alert("Success", "Homework added successfully");
      navigation.goBack();
    } catch (error) {
      console.error("Error adding homework: ", error);
      Alert.alert("Error", "Failed to add homework");
    }
  };

  const handleDateChange = (event, selectedDate) => {
    if (selectedDate) {
      setTempDate(selectedDate);
    }
  };

  const formatDate = (date) => {
    return date.toLocaleDateString("en-GB", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.container}
      >
        <Text style={styles.title}>New Homework</Text>

        <TextInput
          style={styles.input}
          placeholder="Homework Name"
          placeholderTextColor="#666"
          value={name}
          onChangeText={setName}
        />
        <TextInput
          style={[styles.input, styles.multilineInput]}
          placeholder="Content (e.g., Write a paragraph on water cycle)"
          placeholderTextColor="#666"
          value={content}
          onChangeText={setContent}
          multiline
        />
        <TextInput
          style={styles.input}
          placeholder="Class ID"
          placeholderTextColor="#666"
          value={classId}
          onChangeText={setClassId}
        />

        <TouchableOpacity
          style={[styles.input, styles.datePicker]}
          onPress={() => {
            setTempDate(dueDate);
            setShowDatePicker(true);
          }}
        >
          <Text style={{ color: "#1E3765", fontSize: 15 }}>
            Due Date: {formatDate(dueDate)}
          </Text>
        </TouchableOpacity>

        <Modal transparent visible={showDatePicker} animationType="fade">
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <DateTimePicker
                value={tempDate}
                mode="date"
                display="spinner"
                onChange={handleDateChange}
                themeVariant="light"
                style={{ backgroundColor: "white" }}
              />
              <TouchableOpacity
                style={styles.doneButton}
                onPress={() => {
                  setDueDate(tempDate);
                  setShowDatePicker(false);
                }}
              >
                <Text style={styles.doneButtonText}>Done</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>

        <TouchableOpacity style={styles.button} onPress={handleAddHomework}>
          <Text style={styles.buttonText}>Add Homework</Text>
        </TouchableOpacity>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#f6fff8",
  },
  container: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 30,
  },
  title: {
    fontSize: 22,
    fontWeight: "700",
    color: "#1E3765",
    marginBottom: 24,
    textAlign: "center",
  },
  input: {
    backgroundColor: "#ffffff",
    borderRadius: 12,
    padding: 16,
    fontSize: 15,
    marginBottom: 16,
    borderColor: "#d1d5db",
    borderWidth: 1,
    color: "#1E3765",
  },
  multilineInput: {
    minHeight: 100,
    textAlignVertical: "top",
  },
  datePicker: {
    justifyContent: "center",
  },
  button: {
    backgroundColor: "#285E5E",
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 10,
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.4)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    backgroundColor: "white",
    borderRadius: 16,
    padding: 20,
    alignItems: "center",
    width: "85%",
  },
  doneButton: {
    marginTop: 12,
    backgroundColor: "#285E5E",
    paddingVertical: 10,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  doneButtonText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 15,
  },
});
