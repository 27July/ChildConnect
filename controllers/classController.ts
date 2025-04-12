// controllers/classController.ts
import {
  fetchChildrenFromClass,
  fetchAttendanceForDate,
  toggleAttendance,
} from "@/models/classModel";

export async function loadChildrenAndAttendance(classId: string) {
  const children = await fetchChildrenFromClass(classId);
  const childIds = children.map((c) => c.id);

  const today = new Date();
  const docId = today.toLocaleDateString("en-GB").split("/").join("");
  const attendanceData = await fetchAttendanceForDate(docId);

  const presentIds = new Set(attendanceData.map((d) => d.childid));
  const attendanceMap = {};
  childIds.forEach((id) => {
    attendanceMap[id] = presentIds.has(id);
  });

  return { children, attendanceMap };
}

export async function toggleChildAttendance(childid: string) {
  const today = new Date();
  const docId = today.toLocaleDateString("en-GB").split("/").join("");
  const result = await toggleAttendance(childid, docId);
  return result.status === "present";
}
