import { auth } from "@/firebaseConfig";
import { ip } from "@/utils/server_ip.json";

export interface Chat {
  id: string;
  userID1: string;
  userID2: string;
  otherUserName: string;
  otherUserPic?: string;
  lastMessage?: string;
  lastUpdated?: any; // Could be Date or Firestore timestamp
  isRead: boolean;
  childNames?: string[];
}

export function useChatModel() {
  const apiURL = `http://${ip}:8000`;

  const getChats = async (): Promise<Chat[]> => {
    const user = auth.currentUser;
    if (!user) {
      throw new Error("No user logged in.");
    }
    const token = await user.getIdToken();
    const myUserId = user.uid;

    try {
      // Get chat list
      const res = await fetch(`${apiURL}/findchats`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();

      // Get my children
      const myChildrenRes = await fetch(`${apiURL}/mychildren`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const myChildren = await myChildrenRes.json();
      const myChildrenByClass = {};
      myChildren.forEach((child) => {
        if (!myChildrenByClass[child.class]) {
          myChildrenByClass[child.class] = [];
        }
        myChildrenByClass[child.class].push(child.name);
      });

      // Enrich chat data
      const enrichedChats = await Promise.all(
        data.map(async (chat) => {
          const otherUserId =
            chat.userID1 === myUserId ? chat.userID2 : chat.userID1;

          try {
            // Fetch the teacher's classes
            const classesRes = await fetch(
              `${apiURL}/classesof/${otherUserId}`,
              {
                headers: { Authorization: `Bearer ${token}` },
              }
            );
            const teacherClasses = await classesRes.json();
            const classNames = teacherClasses.map((c) => c.name);

            // Filter my children who are in this teacher's class
            const relevantChildren = Object.entries(myChildrenByClass)
              .filter(([className]) => classNames.includes(className))
              .flatMap(([_, names]) => names);

            chat.childNames = relevantChildren;
            return chat;
          } catch (err) {
            console.error("Error fetching teacher's classes:", err);
            chat.childNames = [];
            return chat;
          }
        })
      );

      // Sort by last message time
      const sorted = enrichedChats.sort((a, b) => {
        const aTime =
          a.lastUpdated?._seconds || new Date(a.lastUpdated).getTime() / 1000;
        const bTime =
          b.lastUpdated?._seconds || new Date(b.lastUpdated).getTime() / 1000;
        return bTime - aTime;
      });

      return sorted;
    } catch (err: any) {
      console.error("Error loading chats:", err);
      throw new Error(err.message || "Failed to load chats");
    }
  };

  const getChatById = async (chatId: string): Promise<any> => {
    const user = auth.currentUser;
    if (!user) {
      throw new Error("No user logged in.");
    }
    const token = await user.getIdToken();

    try {
      const res = await fetch(`${apiURL}/findspecificchat/${chatId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      if (!res.ok) throw new Error("Failed to fetch chat");
      
      const data = await res.json();
      return data;
    } catch (err: any) {
      console.error(`Error fetching chat ${chatId}:`, err);
      throw new Error(err.message || "Failed to load chat");
    }
  };

  const markChatAsRead = async (chatId: string): Promise<void> => {
    const user = auth.currentUser;
    if (!user) {
      throw new Error("No user logged in.");
    }
    const token = await user.getIdToken();

    try {
      const res = await fetch(`${apiURL}/markread/${chatId}`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
      });
      
      if (!res.ok) throw new Error("Failed to mark chat as read");
    } catch (err: any) {
      console.error(`Error marking chat ${chatId} as read:`, err);
      throw new Error(err.message || "Failed to mark chat as read");
    }
  };

  return {
    getChats,
    getChatById,
    markChatAsRead
  };
}