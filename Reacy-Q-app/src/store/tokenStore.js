// Zustand store for user's active tokens
import { create } from 'zustand'

const useTokenStore = create((set) => ({
  myTokens: [], // tokens purchased by current user
  setMyTokens: (tokens) => set({ myTokens: tokens }),
  addToken: (token) => set((state) => ({ myTokens: [token, ...state.myTokens] })),
  removeToken: (tokenId) =>
    set((state) => ({ myTokens: state.myTokens.filter((t) => t.id !== tokenId) })),
}))

export default useTokenStore
