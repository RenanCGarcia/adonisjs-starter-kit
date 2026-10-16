const TOKEN_KEY = 'token'

export const auth = {
  getToken: () => localStorage.getItem(TOKEN_KEY),
  setToken: (token: string) => localStorage.setItem(TOKEN_KEY, token),
  clearToken: () => localStorage.removeItem(TOKEN_KEY),
  isAuthenticated: () => localStorage.getItem(TOKEN_KEY) !== null,
}

export type Auth = typeof auth
