import React from 'react';
import { View, Text, Image, TouchableOpacity, SafeAreaView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const DocumentListScreen = () => {
  return (
    <View className="flex-1 bg-primary-100 py-10">
      {/* Header */}
      <View className="p-4">
        <Text className="text-lg font-semibold text-gray-700">Document List</Text>
      </View>

      {/* Teacher Info Card */}
      <View className="bg-white mx-4 p-4 rounded-lg shadow-md flex-row items-center">
        <View className="bg-blue-100 p-3 rounded-full">
          <Ionicons name="document-text" size={24} color="blue" />
        </View>
        <View className="ml-4 flex-1">
          <Text className="text-base font-semibold">1E4</Text>
          <Text className="text-sm text-blue-500">Science</Text>
          <Text className="text-sm text-gray-600">Form Teacher</Text>
        </View>
        <TouchableOpacity>
          <Text className="text-blue-500 font-semibold">View Details</Text>
        </TouchableOpacity>
      </View>

      {/* Document List Section */}
      <View className="bg-white mx-4 mt-6 p-4 rounded-lg shadow-md">
        <Text className="text-lg font-bold text-gray-700 text-center">Document List</Text>
        <View className="mt-4">
          <Text className="text-base font-bold">Science</Text>
          <Text className="text-sm text-gray-600">Jaslyn</Text>
          <Text className="text-sm text-gray-700">Trip to Science Center</Text>
        </View>
      </View>

      {/* Add Document Button */}
      <TouchableOpacity className="bg-gray-300 mx-4 mt-4 p-3 rounded-lg items-center">
        <Text className="text-lg font-bold text-blue-900">ADD DOCUMENT</Text>
      </TouchableOpacity>
    </View>

  );
};

export default DocumentListScreen;