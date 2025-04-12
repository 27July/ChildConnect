import { auth } from "@/firebaseConfig";
import { ip } from "@/utils/server_ip.json";

// Types
export type Chat = {
  id: string;
  otherUserName: string;
  isRead: boolean;
  type?: "chat";
};

export type TeacherClass = {
  id: string;
  name: string;
  grade: string;
  studentCount: number;
};

export type TeacherHomeData = {
  profilePic: string | null;
  unreadChats: Chat[];
};

export function useTeacherModel() {
  const apiURL = `http://${ip}:8000`;

  const getHomeData = async (): Promise<TeacherHomeData> => {
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

      // Unread Chats only
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
        unreadChats,
      };
    } catch (err: any) {
      console.error("❌ Home fetch error:", err.message);
      throw new Error("Could not load home screen data.");
    }
  };

  const getClasses = async (): Promise<TeacherClass[]> => {
    const user = auth.currentUser;
    if (!user) {
      throw new Error("No user logged in.");
    }

    try {
      const token = await user.getIdToken();
      const response = await fetch(`${apiURL}/classes`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      if (!response.ok) {
        throw new Error(`Failed to fetch classes: ${response.statusText}`);
      }
      
      const data = await response.json();
      return data.classes || [];
    } catch (err: any) {
      console.error("Error fetching classes:", err.message);
      throw new Error("Could not load classes data.");
    }
  };

  return {
    getHomeData,
    getClasses,
  };
}