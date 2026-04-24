// Token service — localStorage based
const TOKENS_KEY = 'qapp_tokens'
const COMPANIES_KEY = 'qapp_companies'

const getAllTokens = () => {
  try { return JSON.parse(localStorage.getItem(TOKENS_KEY) || '[]') }
  catch { return [] }
}

const saveAllTokens = (tokens) => {
  localStorage.setItem(TOKENS_KEY, JSON.stringify(tokens))
}

const getAllCompanies = () => {
  try { return JSON.parse(localStorage.getItem(COMPANIES_KEY) || '[]') }
  catch { return [] }
}

const saveAllCompanies = (companies) => {
  localStorage.setItem(COMPANIES_KEY, JSON.stringify(companies))
}

/** Buy a token for a company */
export const buyToken = async (company, user) => {
  const companies = getAllCompanies()
  const idx = companies.findIndex((c) => c.id === company.id)
  if (idx === -1) throw new Error('Company not found')

  // Increment current token number
  companies[idx].currentToken = (companies[idx].currentToken || 0) + 1
  const tokenNumber = companies[idx].currentToken
  saveAllCompanies(companies)

  // Create token record
  const token = {
    id: Date.now().toString(),
    companyId: company.id,
    companyName: company.name,
    companyOpens: company.opens,
    companyCloses: company.closes,
    tokenNumber,
    totalTokens: companies[idx].totalTokens || 0,
    estimatedWaitMinutes: tokenNumber * (companies[idx].timePerToken || 5),
    userId: user.uid,
    userName: user.displayName,
    userEmail: user.email,
    userPhoto: user.photoURL,
    status: 'active', // active | cancelled
    purchasedAt: new Date().toISOString(),
  }

  const tokens = getAllTokens()
  tokens.unshift(token)
  saveAllTokens(tokens)
  return token
}

/** Cancel a token */
export const cancelToken = async (tokenId) => {
  const tokens = getAllTokens()
  const idx = tokens.findIndex((t) => t.id === tokenId)
  if (idx !== -1) {
    tokens[idx].status = 'cancelled'
    saveAllTokens(tokens)
  }
}

/** Get tokens for a specific user */
export const fetchMyTokens = async (userId) => {
  const tokens = getAllTokens()
  return tokens.filter((t) => t.userId === userId && t.status === 'active')
}

/** Search companies by name */
export const searchCompanies = async (query) => {
  const companies = getAllCompanies()
  if (!query.trim()) return companies
  return companies.filter((c) =>
    c.name.toLowerCase().includes(query.toLowerCase())
  )
}

/** Get single company by id (with fresh token data) */
export const getCompanyById = (id) => {
  const companies = getAllCompanies()
  return companies.find((c) => c.id === id) || null
}
