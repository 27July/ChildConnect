// controllers/chatController.ts
import { auth } from "@/firebaseConfig";
import { ip } from "@/utils/server_ip.json";
import { Audio } from "expo-av";
import { Message, Translation } from "@/models/chatModel";

const apiURL = `http://${ip}:8000`;

export async function fetchMessages(chatId: string): Promise<Message[]> {
  const token = await auth.currentUser?.getIdToken();
  const res = await fetch(`${apiURL}/findspecificchat/${chatId}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const data = await res.json();
  return data.sort((a, b) => a.timestamp._seconds - b.timestamp._seconds);
}

export async function markMessagesAsRead(chatId: string) {
  const token = await auth.currentUser?.getIdToken();
  await fetch(`${apiURL}/markread/${chatId}`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
  });
}

export async function sendMessage(
  chatId: string,
  message: string,
  imageBase64: string | null
) {
  const token = await auth.currentUser?.getIdToken();
  const payload = { chatId, message, image: imageBase64 };
  await fetch(`${apiURL}/sendmessage`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });
}

export async function transcribeAudio(uri: string): Promise<string> {
  const formData = new FormData();
  formData.append("file", {
    uri,
    name: "audio.wav",
    type: "audio/wav",
  } as any);
  const res = await fetch(`${apiURL}/transcribe`, {
    method: "POST",
    body: formData,
    headers: { "Content-Type": "multipart/form-data" },
  });
  const json = await res.json();
  return json.text || "";
}

export async function fetchOtherUserProfile(chatId: string) {
  const token = await auth.currentUser?.getIdToken();
  const res = await fetch(`${apiURL}/chat/${chatId}/otheruser`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.json();
}

export async function playTextToSpeech(text: string, lang: string) {
  const res = await fetch(`${apiURL}/speak`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text, language_code: lang }),
  });
  const json = await res.json();
  const { audio_url } = json;
  if (!audio_url) throw new Error("No audio_url received");
  const { sound } = await Audio.Sound.createAsync({ uri: audio_url });
  await sound.playAsync();
}

export async function translateText(
  original: string,
  targetLang: string
): Promise<string> {
  const res = await fetch(
    "https://translate-text-565810748414.asia-southeast1.run.app",
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        text: original,
        source: "en",
        target: targetLang,
      }),
    }
  );
  const data = await res.json();
  return data.translatedText || "⚠️ Failed";
}
