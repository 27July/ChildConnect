import React from 'react';
import { View, Text, Image, SafeAreaView } from 'react-native';
import { Calendar } from 'react-native-calendars';

const AttendanceScreen = () => {
  return (
    <SafeAreaView className="flex-1 bg-white p-4">
      <Text className="text-xl font-bold text-gray-800 text-center mb-4">
        Attendance Record Calendar View
      </Text>

      {/* Profile Section */}
      <View className="items-center bg-gray-100 p-4 rounded-lg shadow-md">
        <Image
          source={{ uri: 'https://via.placeholder.com/100' }}
          className="w-24 h-24 rounded-full mb-2"
        />
        <Text className="text-lg font-semibold text-gray-900">Lex</Text>
        <Text className="text-gray-600">Experimental Primary School</Text>
        <Text className="text-gray-500">Class: 1E4 | Grade: P1</Text>
      </View>

      {/* Calendar */}
      <View className="mt-6">
        <Calendar
          markedDates={{
            '2023-02-01': { selected: true, selectedColor: 'green' },
            '2023-02-02': { selected: true, selectedColor: 'green' },
            '2023-02-03': { selected: true, selectedColor: 'red' },
          }}
          theme={{
            selectedDayBackgroundColor: '#4CAF50',
            todayTextColor: '#FF5722',
            arrowColor: 'black',
          }}
        />
      </View>
    </SafeAreaView>
  );
};

export default AttendanceScreen;
