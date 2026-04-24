// Company service — localStorage (temporary until Firestore is ready)
const STORAGE_KEY = 'qapp_companies'

const getAllCompanies = () => {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]')
  } catch {
    return []
  }
}

const saveAllCompanies = (companies) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(companies))
}

export const addCompany = async (companyData, userId) => {
  const companies = getAllCompanies()
  const newCompany = {
    ...companyData,
    id: Date.now().toString(),
    ownerId: userId,
    createdAt: new Date().toISOString(),
    currentToken: 0,
    totalTokens: 0,
    tokensEnabled: true,
  }
  companies.unshift(newCompany)
  saveAllCompanies(companies)
  return newCompany
}

export const fetchMyCompanies = async (userId) => {
  const companies = getAllCompanies()
  return companies.filter((c) => c.ownerId === userId)
}

/** Delete a company by id */
export const deleteCompany = async (companyId) => {
  const companies = getAllCompanies()
  saveAllCompanies(companies.filter((c) => c.id !== companyId))
}
