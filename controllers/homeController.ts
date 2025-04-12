// controllers/homeController.ts
import { auth } from "@/firebaseConfig";
import { ip } from "@/utils/server_ip.json";

const apiURL = `http://${ip}:8000`;

export async function fetchHomeData(role: "parent" | "teacher") {
  const user = auth.currentUser;
  if (!user) throw new Error("User not logged in");

  const token = await user.getIdToken();

  // 🔹 Profile pic
  const profileRes = await fetch(`${apiURL}/profile`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const profileData = await profileRes.json();
  const profilePic = profileData.profilepic || null;

  // 🔹 Unread Chats
  const chatRes = await fetch(`${apiURL}/findchats`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const chatData = await chatRes.json();
  const unreadChats = chatData
    .filter((c: any) => !c.isRead)
    .map((c: any) => ({ ...c, type: "chat" }));

  // 🔹 Announcements (only if role is parent)
  let announcements = [];
  if (role === "parent") {
    const annRes = await fetch(`${apiURL}/homeparentinfo`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const annData = await annRes.json();
    announcements = (annData.announcements || []).map((a: any) => ({
      ...a,
      type: "announcement",
    }));
  }

  return {
    profilePic,
    unreadChats,
    announcements,
  };
}
