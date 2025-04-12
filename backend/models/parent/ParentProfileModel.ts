import { auth } from "@/firebaseConfig";
import { ip } from "@/utils/server_ip.json";

export interface ProfileData {
  id?: string;
  name: string;
  email: string;
  phone: string;
  workPhone: string;
  address: string;
  profilepic: string;
  role?: string;
}

export function useParentProfileModel() {
  const apiURL = `http://${ip}:8000`;

  const getProfileData = async (): Promise<ProfileData> => {
    const user = auth.currentUser;
    if (!user) {
      throw new Error("No user logged in.");
    }

    try {
      const token = await user.getIdToken();
      const userRes = await fetch(`${apiURL}/users/${user.uid}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      if (!userRes.ok) {
        throw new Error("Failed to fetch profile data");
      }
      
      return await userRes.json();
    } catch (err: any) {
      console.error("Error loading profile data", err);
      throw new Error(err.message || "Failed to load profile data");
    }
  };

  const updateProfile = async (profileData: Partial<ProfileData>): Promise<void> => {
    const user = auth.currentUser;
    if (!user) {
      throw new Error("No user logged in.");
    }

    try {
      const token = await user.getIdToken();
      const res = await fetch(`${apiURL}/updateprofile`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(profileData),
      });

      if (!res.ok) {
        throw new Error("Update failed");
      }
    } catch (err: any) {
      console.error("Error updating user:", err);
      throw new Error(err.message || "Failed to update profile");
    }
  };

  return {
    getProfileData,
    updateProfile,
  };
}