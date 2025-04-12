import { FirebaseAuthStrategy } from "@/strategies/firebaseAuthStrategy";
import { fetchUserProfile } from "@/models/userModel";
import { ip } from "../utils/server_ip.json";

const authStrategy = new FirebaseAuthStrategy();

export async function loginUser(email: string, password: string) {
  const token = await authStrategy.login(email, password);
  const data = await fetchUserProfile(token);

  return { token, role: data.role, name: data.name };
}
