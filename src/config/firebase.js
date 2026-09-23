import { getReactNativePersistence, initializeAuth } from '@firebase/auth/dist/rn';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { initializeApp } from 'firebase/app';

const firebaseConfig = {
  apiKey: 'AIzaSyDtHtYFIX8EfQGbW1W40lYVRWc6wYpY7h0',
  authDomain: 'soulsync-3fa1e.firebaseapp.com',
  projectId: 'soulsync-3fa1e',
  storageBucket: 'soulsync-3fa1e.firebasestorage.app',
  messagingSenderId: '1034285525321',
  appId: '1:1034285525321:web:c61997f27baaf8b047d298',
};

const app = initializeApp(firebaseConfig);

const authOptions =
  typeof getReactNativePersistence === 'function'
    ? {
        persistence: getReactNativePersistence(AsyncStorage),
      }
    : undefined;

export const auth = initializeAuth(app, authOptions);