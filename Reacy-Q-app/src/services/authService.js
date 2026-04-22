// Authentication service — handles Firebase Auth operations
import { signInWithPopup, signOut, onAuthStateChanged } from 'firebase/auth'
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore'
import { auth, facebookProvider, db } from '../firebase'

/**
 * Sign in with Facebook popup.
 * After login, saves/updates user data in Firestore `users` collection.
 */
export const loginWithFacebook = async () => {
  const result = await signInWithPopup(auth, facebookProvider)
  const user = result.user

  // Build user profile from Firebase Auth data
  const userProfile = {
    uid: user.uid,
    name: user.displayName || '',
    email: user.email || '',
    photoURL: user.photoURL || '',
    updatedAt: serverTimestamp(),
  }

  const userRef = doc(db, 'users', user.uid)
  const userSnap = await getDoc(userRef)

  if (!userSnap.exists()) {
    // First time login — set createdAt
    await setDoc(userRef, { ...userProfile, createdAt: serverTimestamp() })
  } else {
    // Returning user — just update profile fields
    await setDoc(userRef, userProfile, { merge: true })
  }

  return user
}

/**
 * Sign out the current user.
 */
export const logout = async () => {
  await signOut(auth)
}

/**
 * Subscribe to auth state changes.
 * Returns the unsubscribe function.
 */
export const subscribeToAuthChanges = (callback) => {
  return onAuthStateChanged(auth, callback)
}
