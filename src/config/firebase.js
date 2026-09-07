import { initializeApp } from 'firebase/app';
import { initializeAuth, getReactNativePersistence } from 'firebase/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';

const firebaseConfig = {
  apiKey: 'AIzaSyDtHtYFIX8EfQGbW1W40lYVRWc6wYpY7h0',
  authDomain: 'soulsync-3fa1e.firebaseapp.com',
  projectId: 'soulsync-3fa1e',
  storageBucket: 'soulsync-3fa1e.firebasestorage.app',
  messagingSenderId: '1034285525321',
  appId: '1:1034285525321:web:c61997f27baaf8b047d298',
};

const app = initializeApp(firebaseConfig);

export const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(AsyncStorage),
});