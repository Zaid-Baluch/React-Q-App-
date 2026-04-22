// Zustand store for authentication state
import { create } from 'zustand'

const useAuthStore = create((set) => ({
  // Current authenticated user (null if not logged in)
  user: null,
  // Loading state while checking auth
  loading: true,

  setUser: (user) => set({ user }),
  setLoading: (loading) => set({ loading }),
  clearUser: () => set({ user: null }),
}))

export default useAuthStore
