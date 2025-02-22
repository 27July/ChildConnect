import { StatusBar } from 'expo-status-bar'; // Import StatusBar
import React from 'react';
import AppNavigator from './navigation/AppNavigator';

export default function App() {
  return (
    <>
      <StatusBar style="dark" /> 
      <AppNavigator />
    </>
  );
}
