// models/classModel.ts
import { auth } from "@/firebaseConfig";
import { ip } from "@/utils/server_ip.json";

const apiURL = `http://${ip}:8000`;

export async function fetchChildrenFromClass(classId: string) {
  const token = await auth.currentUser?.getIdToken();
  const res = await fetch(`${apiURL}/class/${classId}/children`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return await res.json();
}

export async function fetchAttendanceForDate(docId: string) {
  const token = await auth.currentUser?.getIdToken();
  const res = await fetch(`${apiURL}/attendance-for-date/${docId}`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!res.ok) return [];
  return await res.json();
}

export async function toggleAttendance(childid: string, date: string) {
  const token = await auth.currentUser?.getIdToken();
  const res = await fetch(`${apiURL}/attendance/toggle`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ childid, date }),
  });

  if (!res.ok) throw new Error("Toggle failed");
  return await res.json();
}
