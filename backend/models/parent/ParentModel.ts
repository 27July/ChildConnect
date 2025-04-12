import { auth } from "@/firebaseConfig";
import { Alert } from "react-native";
import { ip } from "@/utils/server_ip.json";

// Types
export type Announcement = {
  id: string;
  name: string;
  content: string;
  classname: string;
  teachername: string;
  children?: string[];
  type?: "announcement";
};

export type Chat = {
  id: string;
  otherUserName: string;
  isRead: boolean;
  type?: "chat";
};

export type ParentHomeData = {
  profilePic: string | null;
  announcements: Announcement[];
  unreadChats: Chat[];
};

export function useParentModel() {
  const apiURL = `http://${ip}:8000`;

  const getHomeData = async (): Promise<ParentHomeData> => {
    const user = auth.currentUser;
    if (!user) {
      throw new Error("No user logged in.");
    }

    try {
      const token = await user.getIdToken();

      // Profile picture
      const profileRes = await fetch(`${apiURL}/profile`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const profileData = await profileRes.json();
      const profilePic = profileData.profilepic || null;

      // Announcements
      const annRes = await fetch(`${apiURL}/homeparentinfo`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const annData = await annRes.json();
      const announcements: Announcement[] = (annData.announcements || []).map((ann: any) => ({
        ...ann,
        type: "announcement",
      }));

      // Unread Chats
      const chatRes = await fetch(`${apiURL}/findchats`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const chatData = await chatRes.json();
      const unreadChats: Chat[] = chatData
        .filter((chat: Chat) => !chat.isRead)
        .map((chat: any) => ({
          ...chat,
          type: "chat",
        }));

      return {
        profilePic,
        announcements,
        unreadChats,
      };
    } catch (err: any) {
      console.error("❌ Home fetch error:", err.message);
      throw new Error("Could not load home screen data.");
    }
  };

  return {
    getHomeData,
  };
}