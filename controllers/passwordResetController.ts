// controllers/passwordResetController.ts
import { auth } from "@/firebaseConfig";
import { sendPasswordResetEmail } from "firebase/auth";

export async function resetPassword(email: string) {
  if (!email) throw new Error("Please enter your email.");
  await sendPasswordResetEmail(auth, email);
}
