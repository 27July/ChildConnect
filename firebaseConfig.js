import { initializeApp } from "firebase/app";
import { getAuth, initializeAuth, getReactNativePersistence } from "firebase/auth";
import AsyncStorage from "@react-native-async-storage/async-storage";

// 🔹 Replace with your Firebase project credentials
const firebaseConfig = {

    apiKey : "AIzaSyDXAziqCQ9v93gYP28tk9FpMZOlFNr2K3E",
    authDomain : "childconnect-1eacf.firebaseapp.com",
    projectId : "childconnect-1eacf",
    storageBucket : "childconnect-1eacf.firebasestorage.app",
    messagingSenderId : "565810748414",
    appId : "1:565810748414:web:a04f8e3f08233b268b3eaf",
    measurementId : "G-VDZL2YY9M2"
};

// Initialize Firebase App
const app = initializeApp(firebaseConfig);

// Enable Persistent Auth State
const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(AsyncStorage),
});

export { auth };
