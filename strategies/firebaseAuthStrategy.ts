import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "@/firebaseConfig";

export class FirebaseAuthStrategy implements AuthStrategy {
  async login(email: string, password: string): Promise<string> {
    const userCredential = await signInWithEmailAndPassword(
      auth,
      email,
      password
    );
    return userCredential.user.getIdToken();
  }
}
