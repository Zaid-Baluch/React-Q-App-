// Zustand store for company state
import { create } from 'zustand'

const useCompanyStore = create((set) => ({
  companies: [],
  loading: false,
  setCompanies: (companies) => set({ companies }),
  addCompany: (company) => set((state) => ({ companies: [company, ...state.companies] })),
  removeCompany: (id) => set((state) => ({ companies: state.companies.filter((c) => c.id !== id) })),
  setLoading: (loading) => set({ loading }),
}))

export default useCompanyStore
