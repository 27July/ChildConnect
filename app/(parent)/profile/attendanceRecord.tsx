import React from 'react';
import { View, Text, Image, SafeAreaView } from 'react-native';
import { Calendar } from 'react-native-calendars';
import { child } from "@/components/data/childData";
import { attendanceData, getPresenceColor } from "@/components/data/calendarData";
//import { generateMarkedDates } from "@/components/utils/calendarUtils"; // Import the reusable function


// Might need to move out this function later on
export function generateMarkedDates(
  data: { date: string; isPresent: boolean }[],
  getColor: (isPresent: boolean) => string
): { [key: string]: { selected: boolean; selectedColor: string } } {
  return data.reduce((acc, entry) => {
    acc[entry.date] = {
      selected: true,
      selectedColor: getColor(entry.isPresent),
    };
    return acc;
  }, {} as { [key: string]: { selected: boolean, selectedColor: string } });
}

const AttendanceScreen = () => {
  // Generate marked dates for the calendar using the reusable function
  const markedDates = generateMarkedDates(attendanceData, getPresenceColor);

  return (
    <View className="flex-1 bg-primary-100 justify-center py-20">
      <Text className="text-xl font-bold text-gray-800 text-center mb-4">
        Attendance Record Calendar View
      </Text>

      {/* Profile Section */}
      <View className="items-center bg-primary-100 p-4">
        <Image source={child.profileImage} className="w-28 h-28 rounded-full" />
        <Text className="text-xl font-semibold text-gray-800 mt-3">{child.name}</Text>
        <Text className="text-lg text-gray-700">{child.school}</Text>
        <Text className="text-sm text-gray-600"></Text>
      </View>

      {/* Calendar */}
      <View className="mt-6">
        <Calendar
          markedDates={markedDates}
        />
      </View>
    </View>
  );
};

export default AttendanceScreen;
