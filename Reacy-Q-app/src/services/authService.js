// Authentication service — Firebase Auth only (no Firestore)
import { signInWithPopup, signOut, onAuthStateChanged } from 'firebase/auth'
import { auth, googleProvider } from '../firebase'

export const loginWithGoogle = async () => {
  const result = await signInWithPopup(auth, googleProvider)
  return result.user
}

export const logout = async () => {
  await signOut(auth)
}

export const subscribeToAuthChanges = (callback) => {
  return onAuthStateChanged(auth, callback)
}
