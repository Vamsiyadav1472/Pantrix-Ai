import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth, initializeAuth, getReactNativePersistence } from 'firebase/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

// TODO: Replace with your actual Firebase project configuration
const firebaseConfig = {
  apiKey: "YOUR_FIREBASE_API_KEY", // Get from Firebase Console
  authDomain: "pantrixai-b71e8.firebaseapp.com",
  projectId: "pantrixai-b71e8",
  storageBucket: "pantrixai-b71e8.appspot.com",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID"
};

let app;
if (!getApps().length) {
  app = initializeApp(firebaseConfig);
} else {
  app = getApp();
}

// Initialize Auth conditionally for Web and React Native
let auth;
if (Platform.OS === 'web') {
  auth = getAuth(app); // Uses default web persistence (IndexedDB/localStorage)
} else {
  auth = initializeAuth(app, {
    persistence: getReactNativePersistence(AsyncStorage)
  });
}

export { app, auth };
