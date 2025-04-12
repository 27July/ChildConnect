// factories/profileImageFactory.tsx
import React from "react";
import { Image } from "react-native";
import ProfilePic from "@/assets/images/profilepic.svg";

export function createProfileImage(uri: string) {
  if (!uri || uri.trim() === "") {
    return <ProfilePic width={40} height={40} />;
  }
  return <Image source={{ uri }} className="w-10 h-10 rounded-full" />;
}
