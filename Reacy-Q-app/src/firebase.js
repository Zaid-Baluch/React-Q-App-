// Firebase configuration and service initialization
import { initializeApp } from 'firebase/app'
import { getAuth, FacebookAuthProvider } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'
import { getStorage } from 'firebase/storage'

// Firebase project config — replace with your own values or use .env
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyB013deda2vuO74DsaZ2lUG92ZLrhwVfGg",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "my-react-app-e9e8e.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "my-react-app-e9e8e",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "my-react-app-e9e8e.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "459240823776",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:459240823776:web:932f7ec470a4c02affa985",
}

// Initialize Firebase app
const app = initializeApp(firebaseConfig)

// Auth instance with Facebook provider
export const auth = getAuth(app)
export const facebookProvider = new FacebookAuthProvider()

// Firestore database instance
export const db = getFirestore(app)

// Firebase Storage instance
export const storage = getStorage(app)

export default app

