// models/userModel.ts
export async function fetchUserProfile(token: string) {
  const response = await fetch(`http://${ip}:8000/profile`, {
    method: "GET",
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!response.ok) throw new Error("User profile fetch failed");
  return await response.json();
}
