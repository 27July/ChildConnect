import * as FileSystem from "expo-file-system";

// Ensure we access the file inside Expo's utils folder
const filePath = "./utils/server_ip.json";
const fallbackIP = "192.168.1.9"; // Replace with your local machine's IP

export const getLocalIP = async (): Promise<string> => {
  try {
    console.log("📡 Checking for Server IP file...");

    const fileExists = await FileSystem.getInfoAsync(filePath);
    if (!fileExists.exists) {
      console.error("❌ Server IP file does not exist.");
      return fallbackIP; // Fallback to localhost
    }

    const fileContent = await FileSystem.readAsStringAsync(filePath);
    const data = JSON.parse(fileContent);

    console.log("✅ Detected FastAPI Server IP from file:", data.ip);
    return data.ip || fallbackIP; // Fallback in case of failure
  } catch (error) {
    console.error("❌ Error reading FastAPI IP from file:", error);
    return fallbackIP; // Fallback
  }
};
