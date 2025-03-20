import React from "react";
import { View, Text, Image } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { ContactButton } from "@/components/contactButton";
import { RecordButton } from "@/components/recordButton";
//remove later using this because now dont have a database
import { child } from "@/components/data/childData";
import { parents } from "@/components/data/parentData";
import { ChatButton } from "@/components/chatButton";

const ChildPresentProfile = () => {
  return (
    <View className="flex-1 bg-primary-100 py-6 px-4">
      {/* Profile Section */}
      <View className="items-center py-10">
        <Image source={child.profileImage} className="w-28 h-28 rounded-full" />
        <Text className="text-xl font-semibold text-gray-800 mt-3">{child.name}</Text>
        <Text className="text-lg text-gray-700">{child.school}</Text>
        <Text className="text-sm text-gray-600">
          Class: {child.classInfo} | Grade: {child.grade}
        </Text>

        {/* Attendance Badge */}
        <View className="flex-row bg-primary-300 px-6 py-3 mt-4 rounded-full">
          <Text className="text-grey-700 text-lg font-bold">Today's Attendance: </Text>
          <Text className={child.attendanceStatus === "Absent" ? "text-red-500 text-lg font-semibold" : "text-green-300 text-lg font-semibold"}>
            {child.attendanceStatus}
          </Text>
        </View>
      </View>

      {/* Parents Section */}
      <View className="mt-3">
        {parents.map((parent, index) => (
          <View key={index} className="bg-white px-3 py-3 rounded-lg mb-3 shadow-sm">
            {/* Image, Name, and Chat Button Row */}
            <View className="flex-row items-center justify-between">
              <Image source={parent.avatar} className="w-10 h-10 rounded-full" />
              <View className="flex-1 ml-3">
                <Text className="font-semibold text-base">{parent.name}</Text>
              </View>
              <ChatButton />
            </View>

            {/* Relationship and Contact Information Row */}
            <View className="flex-row items-center justify-between mt-2">
              <View className="flex-1">
                <Text className="text-gray-500 text-">{parent.relation}</Text>
              </View>
              <ContactButton label="Contact" phoneNumber={parent.phoneNumber} />
            </View>
          </View>
        ))}
      </View>

      {/* Records Section */}
      <View className="mt-6">
        <RecordButton label="Attendance Records" />
        <RecordButton label="Documentation" />
      </View>
    </View>
  );
};

export default ChildPresentProfile;
