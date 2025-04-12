import { auth } from "@/firebaseConfig";
import { ip } from "@/utils/server_ip.json";
import { Child } from "./ChildrenModel";
import * as Location from "expo-location";
import { 
  startForegroundTracking, 
  stopForegroundTracking 
} from "@/components/ChildLocationTracker";

export interface Teacher {
  name: string;
  profilepic?: string;
  role: string;
  userid: string;
}

export interface SchoolLocation {
  latitude: number;
  longitude: number;
  radius: number;
}

export interface Attendance {
  date: string;
  present: boolean;
  image?: string;
}

export function useChildDetailModel() {
  const apiURL = `http://${ip}:8000`;

  const getChildDetail = async (childId: string): Promise<Child> => {
    const user = auth.currentUser;
    if (!user) {
      throw new Error("No user logged in.");
    }
    const token = await user.getIdToken();

    try {
      const childRes = await fetch(`${apiURL}/child/${childId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      if (!childRes.ok) throw new Error("Failed to fetch child details");
      
      const childData = await childRes.json();
      return childData as Child;
    } catch (error: any) {
      console.error("Error fetching child detail:", error);
      throw new Error(error.message || "Failed to load child details");
    }
  };

  const getTeachers = async (childId: string): Promise<Teacher[]> => {
    const user = auth.currentUser;
    if (!user) {
      throw new Error("No user logged in.");
    }
    const token = await user.getIdToken();

    try {
      // First, get the child data to find their class
      const childRes = await fetch(`${apiURL}/child/${childId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      if (!childRes.ok) throw new Error("Failed to fetch child details");
      
      const childData = await childRes.json();
      
      // Get the class information
      const classRes = await fetch(`${apiURL}/classbyname/${childData.class}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      if (!classRes.ok) throw new Error("Failed to fetch class details");
      
      const classData = await classRes.json();
      
      // Get teachers for this class
      const teacherEntries = [
        { id: classData.teacherId, role: "Form Teacher" },
        ...(classData.subteachers || []).map((id: string) => ({
          id,
          role: "Teacher",
        })),
      ];

      const teacherResults = await Promise.all(
        teacherEntries.map(async ({ id, role }) => {
          const res = await fetch(`${apiURL}/users/${id}`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          if (res.ok) {
            const { name, profilepic } = await res.json();
            return { name, profilepic, role, userid: id };
          }
          return null;
        })
      );

      return teacherResults.filter((t) => t !== null) as Teacher[];
    } catch (error: any) {
      console.error("Error fetching teachers:", error);
      throw new Error(error.message || "Failed to load teachers");
    }
  };

  const getChildLocation = async (childId: string): Promise<any> => {
    const user = auth.currentUser;
    if (!user) {
      throw new Error("No user logged in.");
    }
    const token = await user.getIdToken();

    try {
      const res = await fetch(`${apiURL}/location/${childId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) throw new Error("Failed to fetch location");

      const data = await res.json();
      return data;
    } catch (error: any) {
      console.error(`Error fetching location for child ${childId}:`, error);
      throw new Error(error.message || "Failed to load location data");
    }
  };

  const getSchoolLocation = async (childId: string): Promise<SchoolLocation> => {
    const user = auth.currentUser;
    if (!user) {
      throw new Error("No user logged in.");
    }
    const token = await user.getIdToken();

    try {
      const res = await fetch(`${apiURL}/school/child/${childId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) throw new Error("Failed to fetch school location");

      const data = await res.json();
      return {
        latitude: data.latitude,
        longitude: data.longitude,
        radius: 200, // Default radius, can be adjusted if API provides it
      };
    } catch (error: any) {
      console.error("Error fetching school location:", error);
      throw new Error(error.message || "Failed to load school location");
    }
  };

  const getUserLocation = async (): Promise<Location.LocationObjectCoords> => {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== "granted") {
      throw new Error("Location permission not granted");
    }

    try {
      const currentLocation = await Location.getCurrentPositionAsync({});
      return currentLocation.coords;
    } catch (error: any) {
      console.error("Error fetching user location:", error);
      throw new Error(error.message || "Failed to get your location");
    }
  };

  const getChildAttendance = async (childId: string, date: string): Promise<Attendance> => {
    const user = auth.currentUser;
    if (!user) {
      throw new Error("No user logged in.");
    }
    const token = await user.getIdToken();

    try {
      const res = await fetch(
        `${apiURL}/attendance/${date}?childid=${childId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      
      if (!res.ok) {
        return { date, present: false };
      }
      
      const data = await res.json();
      const childAttendance = data[0]; // should return one entry
      
      return {
        date,
        present: childAttendance?.present ?? false,
        image: childAttendance?.image
      };
    } catch (error: any) {
      console.error("Error fetching attendance:", error);
      throw new Error(error.message || "Failed to load attendance");
    }
  };

  const getTodayDateString = (): string => {
    const today = new Date();
    const dd = String(today.getDate()).padStart(2, "0");
    const mm = String(today.getMonth() + 1).padStart(2, "0");
    const yyyy = today.getFullYear();
    return `${dd}${mm}${yyyy}`;
  };

  const startLocationTracking = async (
    childId: string, 
    locationCallback: (coords: Location.LocationObjectCoords) => void
  ): Promise<void> => {
    const user = auth.currentUser;
    if (!user) {
      throw new Error("No user logged in.");
    }
    const token = await user.getIdToken();

    try {
      // Start local foreground tracking
      await startForegroundTracking(locationCallback);

      // Notify backend to start tracking
      await fetch(`${apiURL}/location/set-tracking`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          childid: childId,
          istracking: true,
        }),
      });
    } catch (error: any) {
      console.error("Error starting tracking:", error);
      throw new Error(error.message || "Failed to start tracking");
    }
  };

  const stopLocationTracking = async (childId: string): Promise<void> => {
    const user = auth.currentUser;
    if (!user) {
      throw new Error("No user logged in.");
    }
    const token = await user.getIdToken();

    try {
      // Stop tracking locally
      await stopForegroundTracking();

      // Notify backend to stop tracking
      await fetch(`${apiURL}/location/stop`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ childid: childId }),
      });
    } catch (error: any) {
      console.error("Error stopping tracking:", error);
      throw new Error(error.message || "Failed to stop tracking");
    }
  };

  const startChatWithTeacher = async (teacherId: string): Promise<string> => {
    const user = auth.currentUser;
    if (!user) {
      throw new Error("No user logged in.");
    }
    const token = await user.getIdToken();

    try {
      const res = await fetch(`${apiURL}/startchatwith/${teacherId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      if (!res.ok) throw new Error("Failed to start chat");
      
      const data = await res.json();
      return data.id;
    } catch (error: any) {
      console.error("Error starting chat:", error);
      throw new Error(error.message || "Failed to start chat");
    }
  };

  const checkPasswordExistence = async (childId: string): Promise<boolean> => {
    const user = auth.currentUser;
    if (!user) {
      throw new Error("No user logged in.");
    }
    const token = await user.getIdToken();

    try {
      const res = await fetch(
        `${apiURL}/childmode-password/${childId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (!res.ok) {
        if (res.status === 404) {
          // No password set
          return false;
        } else {
          throw new Error("Error fetching password");
        }
      }
      
      // Password exists
      return true;
    } catch (error: any) {
      console.error("Error checking password:", error);
      throw new Error(error.message || "Failed to check password");
    }
  };

  return {
    getChildDetail,
    getTeachers,
    getChildLocation,
    getSchoolLocation,
    getUserLocation,
    getChildAttendance,
    getTodayDateString,
    startLocationTracking,
    stopLocationTracking,
    startChatWithTeacher,
    checkPasswordExistence
  };
}