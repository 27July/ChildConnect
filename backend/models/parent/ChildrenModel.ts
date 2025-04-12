import { auth } from "@/firebaseConfig";
import { ip } from "@/utils/server_ip.json";

export interface Child {
  id: string;
  name: string;
  school: string;
  grade?: string;
  class?: string;
  age?: number;
  gender?: string;
  profilepic?: string;
  location?: {
    latitude: number;
    longitude: number;
    timestamp: number;
  };
}

export function useChildrenModel() {
  const apiURL = `http://${ip}:8000`;

  const getChildren = async (): Promise<Child[]> => {
    const user = auth.currentUser;
    if (!user) {
      throw new Error("No user logged in.");
    }

    try {
      const token = await user.getIdToken();
      const response = await fetch(`${apiURL}/mychildren`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) throw new Error("Failed to fetch children");

      const data = await response.json();
      return data as Child[];
    } catch (error: any) {
      console.error("Error fetching children:", error);
      throw new Error(error.message || "Failed to load children");
    }
  };

  const getChildById = async (childId: string): Promise<Child> => {
    const user = auth.currentUser;
    if (!user) {
      throw new Error("No user logged in.");
    }

    try {
      const token = await user.getIdToken();
      const response = await fetch(`${apiURL}/child/${childId}`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) throw new Error("Failed to fetch child details");

      const data = await response.json();
      return data as Child;
    } catch (error: any) {
      console.error(`Error fetching child ${childId}:`, error);
      throw new Error(error.message || "Failed to load child details");
    }
  };

  const getChildLocation = async (childId: string): Promise<any> => {
    const user = auth.currentUser;
    if (!user) {
      throw new Error("No user logged in.");
    }

    try {
      const token = await user.getIdToken();
      const response = await fetch(`${apiURL}/location/${childId}`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) throw new Error("Failed to fetch location");

      const data = await response.json();
      return data;
    } catch (error: any) {
      console.error(`Error fetching location for child ${childId}:`, error);
      throw new Error(error.message || "Failed to load location data");
    }
  };

  return {
    getChildren,
    getChildById,
    getChildLocation,
  };
}