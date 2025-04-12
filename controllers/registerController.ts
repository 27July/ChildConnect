// controllers/registerController.ts
import { auth } from "@/firebaseConfig";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { ip } from "@/utils/serverIp.json";

export async function registerUser(
  email: string,
  password: string,
  name: string,
  phone: string,
  role: "parent" | "teacher"
) {
  const apiURL = `http://${ip}:8000`;

  // ✅ Firebase Auth
  const userCredential = await createUserWithEmailAndPassword(
    auth,
    email,
    password
  );
  const user = userCredential.user;
  const token = await user.getIdToken();

  // ✅ API call to FastAPI backend
  const response = await fetch(`${apiURL}/register${role}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ name, phone }),
  });

  if (!response.ok) throw new Error("Failed to save user profile.");
}
