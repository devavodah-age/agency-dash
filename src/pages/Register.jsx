import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

const API = import.meta.env.VITE_API_URL

export default function Register() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()
  const { login } = useAuth()

  const handleSubmit = async e => {
    e.preventDefault()
    setError('')
    if (password !== confirm) { setError('As senhas não coincidem'); return }
    if (password.length < 6) { setError('A senha deve ter pelo menos 6 caracteres'); return }
    setLoading(true)
    try {
      const r = await fetch(`${API}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password, agency_id: 1 })
      })
      const data = await r.json()
      if (!r.ok) { setError(data.error || 'Erro ao criar conta'); setLoading(false); return }
      await login(email, password)
      navigate('/')
    } catch {
      setError('Erro de conexão')
    }
    setLoading(false)
  }

  const inputStyle = {
    width: '100%', background: '#0e0e0e', border: '1px solid #1e1e1e',
    borderRadius: '10px', padding: '13px 16px', color: 'white',
    fontSize: '14px', outline: 'none', transition: 'border-color .2s',
    boxSizing: 'border-box'
  }

  const labelStyle = {
    display: 'block', fontSize: '10px', color: 'rgba(255,255,255,0.35)',
    marginBottom: '8px', letterSpacing: '2px', textTransform: 'uppercase'
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center',
      justifyContent: 'center', background: '#060606', padding: '20px' }}>
      <div style={{ width: '100%', maxWidth: '380px' }}>
        <div style={{ marginBottom: '32px', textAlign: 'center' }}>
          <h2 style={{ fontSize: '22px', fontWeight: 700, color: 'white', marginBottom: '8px' }}>
            Criar conta
          </h2>
          <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.32)' }}>
            Preencha os dados abaixo para se cadastrar
          </p>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div>
            <label style={labelStyle}>Nome completo</label>
            <input type="text" value={name} onChange={e => setName(e.target.value)}
              required placeholder="Seu nome" style={inputStyle}
              onFocus={e => e.target.style.borderColor='rgba(255,255,255,0.25)'}
              onBlur={e => e.target.style.borderColor='#1e1e1e'}/>
          </div>

          <div>
            <label style={labelStyle}>Email</label>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)}
              required placeholder="seu@email.com" style={inputStyle}
              onFocus={e => e.target.style.borderColor='rgba(255,255,255,0.25)'}
              onBlur={e => e.target.style.borderColor='#1e1e1e'}/>
          </div>

          <div>
            <label style={labelStyle}>Senha</label>
            <input type="password" value={password} onChange={e => setPassword(e.target.value)}
              required placeholder="Mínimo 6 caracteres" style={inputStyle}
              onFocus={e => e.target.style.borderColor='rgba(255,255,255,0.25)'}
              onBlur={e => e.target.style.borderColor='#1e1e1e'}/>
          </div>

          <div>
            <label style={labelStyle}>Confirmar senha</label>
            <input type="password" value={confirm} onChange={e => setConfirm(e.target.value)}
              required placeholder="Repita a senha" style={inputStyle}
              onFocus={e => e.target.style.borderColor='rgba(255,255,255,0.25)'}
              onBlur={e => e.target.style.borderColor='#1e1e1e'}/>
          </div>

          {error && <p style={{ fontSize: '13px', color: '#f87171' }}>{error}</p>}

          <button type="submit" disabled={loading} style={{
            width: '100%', background: 'white', color: 'black', border: 'none',
            borderRadius: '10px', padding: '14px', fontSize: '12px', fontWeight: 700,
            letterSpacing: '2px', textTransform: 'uppercase',
            cursor: loading ? 'not-allowed' : 'pointer',
            opacity: loading ? 0.6 : 1, marginTop: '4px' }}>
            {loading ? 'Criando...' : 'Criar conta'}
          </button>

          <p style={{ textAlign: 'center', fontSize: '12px', color: 'rgba(255,255,255,0.2)', marginTop: '8px' }}>
            Já tem conta?{' '}
            <a href="/login" style={{ color: 'rgba(255,255,255,0.6)', textDecoration: 'none', fontWeight: 600 }}>
              Entrar
            </a>
          </p>
        </form>
      </div>
    </div>
  )
}
