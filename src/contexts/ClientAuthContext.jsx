import { createContext, useContext, useState, useEffect } from 'react'

const API = import.meta.env.VITE_API_URL || 'https://agency-dash-api-production.up.railway.app'
const ClientAuthCtx = createContext(null)

export function ClientAuthProvider({ children }) {
  const [clientUser, setClientUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem('client_token')
    if (!token) { setLoading(false); return }
    fetch(`${API}/client-auth/me`, { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.ok ? r.json() : Promise.reject())
      .then(u => setClientUser(u))
      .catch(() => localStorage.removeItem('client_token'))
      .finally(() => setLoading(false))
  }, [])

  const login = async (email, password) => {
    const r = await fetch(`${API}/client-auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    })
    const data = await r.json()
    if (!r.ok) throw new Error(data.error || 'Erro ao entrar')
    localStorage.setItem('client_token', data.token)
    setClientUser(data.user)
    return data.user
  }

  const register = async (name, email, password) => {
    const r = await fetch(`${API}/client-auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password })
    })
    const data = await r.json()
    if (!r.ok) throw new Error(data.error || 'Erro ao criar conta')
    localStorage.setItem('client_token', data.token)
    setClientUser(data.user)
    return data.user
  }

  const logout = () => {
    localStorage.removeItem('client_token')
    setClientUser(null)
  }

  return (
    <ClientAuthCtx.Provider value={{ clientUser, loading, login, register, logout }}>
      {children}
    </ClientAuthCtx.Provider>
  )
}

export const useClientAuth = () => useContext(ClientAuthCtx)
