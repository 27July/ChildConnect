import * as FileSystem from "expo-file-system";

// Ensure we access the file inside Expo's utils folder
const filePath = "./utils/server_ip.json";

export const getLocalIP = async (): Promise<string> => {
  try {
    console.log("📡 Checking for Server IP file...");

    const fileExists = await FileSystem.getInfoAsync(filePath);
    if (!fileExists.exists) {
      console.error("❌ Server IP file does not exist.");
      return "127.0.0.1"; // Fallback to localhost
    }

    const fileContent = await FileSystem.readAsStringAsync(filePath);
    const data = JSON.parse(fileContent);

    console.log("✅ Detected FastAPI Server IP from file:", data.ip);
    return data.ip || "127.0.0.1"; // Fallback in case of failure
  } catch (error) {
    console.error("❌ Error reading FastAPI IP from file:", error);
    return "127.0.0.1"; // Fallback
  }
};
