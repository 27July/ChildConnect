// controllers/homeworkController.ts
import { auth } from "@/firebaseConfig";
import { ip } from "@/utils/server_ip.json";

const apiURL = `http://${ip}:8000`;

export const submitHomework = async ({
  classid,
  name,
  content,
  subject,
  duedate,
}: {
  classid: string;
  name: string;
  content: string;
  subject: string;
  duedate: Date;
}) => {
  const token = await auth.currentUser?.getIdToken();
  const teacherid = auth.currentUser?.uid;

  if (!token || !teacherid) throw new Error("Authentication failed");

  const payload = {
    classid,
    name,
    content,
    duedate,
    subject,
    teacherid,
  };

  const res = await fetch(`${apiURL}/addhomework`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    throw new Error("Failed to assign homework");
  }
};
