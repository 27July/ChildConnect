import React from 'react';
import { View, Text, Image, StyleSheet, SafeAreaView } from 'react-native';
import { Calendar } from 'react-native-calendars';
import { Ionicons } from '@expo/vector-icons';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { NavigationContainer } from '@react-navigation/native';

const AttendanceScreen = () => {
  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.header}>Attendance Record Calendar View</Text>
      <View style={styles.profileContainer}>
        <Image
          source={{ uri: 'https://via.placeholder.com/100' }}
          style={styles.profileImage}
        />
        <Text style={styles.name}>Lex</Text>
        <Text style={styles.school}>Experimental Primary School</Text>
        <Text style={styles.classInfo}>Class: 1E4  Grade: P1</Text>
      </View>
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
    </SafeAreaView>
  );
};

const Tab = createBottomTabNavigator();

const App = () => {
  return (
    <NavigationContainer>
      <Tab.Navigator screenOptions={{ headerShown: false }}>
        <Tab.Screen
          name="Home"
          component={AttendanceScreen}
          options={{
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="home-outline" size={size} color={color} />
            ),
          }}
        />
        <Tab.Screen
          name="Classes"
          component={AttendanceScreen}
          options={{
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="book-outline" size={size} color={color} />
            ),
          }}
        />
        <Tab.Screen
          name="School"
          component={AttendanceScreen}
          options={{
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="chatbubble-outline" size={size} color={color} />
            ),
          }}
        />
        <Tab.Screen
          name="Profile"
          component={AttendanceScreen}
          options={{
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="person-outline" size={size} color={color} />
            ),
          }}
        />
      </Tab.Navigator>
    </NavigationContainer>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#EEF3F6', padding: 20 },
  header: { fontSize: 18, fontWeight: 'bold', textAlign: 'center', marginBottom: 10 },
  profileContainer: { alignItems: 'center', marginBottom: 20 },
  profileImage: { width: 100, height: 100, borderRadius: 50, marginBottom: 10 },
  name: { fontSize: 20, fontWeight: 'bold' },
  school: { fontSize: 14, color: '#555' },
  classInfo: { fontSize: 14, color: '#777' },
});

export default App;
