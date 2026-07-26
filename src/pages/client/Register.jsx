import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useClientAuth } from '../../contexts/ClientAuthContext'

const inputStyle = {
  width:'100%', background:'#0e0e0e', border:'1px solid #1e1e1e',
  borderRadius:'10px', padding:'13px 16px', color:'white',
  fontSize:'14px', outline:'none', transition:'border-color .2s',
}

export default function ClientRegister() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { register } = useClientAuth()
  const navigate = useNavigate()

  const handleSubmit = async e => {
    e.preventDefault(); setError(''); setLoading(true)
    try {
      await register(name, email, password)
      navigate('/client/dashboard')
    } catch (err) {
      setError(err.message || 'Erro ao criar conta')
    }
    setLoading(false)
  }

  return (
    <div style={{ minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center', background:'#060606', padding:'24px' }}>
      <div style={{ width:'100%', maxWidth:'380px' }}>
        <div style={{ textAlign:'center', marginBottom:'40px' }}>
          <p style={{ fontSize:'11px', fontWeight:700, letterSpacing:'6px', color:'rgba(255,255,255,0.5)', textTransform:'uppercase', marginBottom:'12px' }}>AGÊNCIA AVODAH</p>
          <h2 style={{ fontSize:'24px', fontWeight:700, color:'white', marginBottom:'8px' }}>Criar conta</h2>
          <p style={{ fontSize:'13px', color:'rgba(255,255,255,0.32)' }}>Preencha os dados para acessar o portal</p>
        </div>

        <form onSubmit={handleSubmit} style={{ display:'flex', flexDirection:'column', gap:'16px' }}>
          <div>
            <label style={{ display:'block', fontSize:'10px', color:'rgba(255,255,255,0.35)', marginBottom:'8px', letterSpacing:'2px', textTransform:'uppercase' }}>Nome</label>
            <input type="text" value={name} onChange={e => setName(e.target.value)} required
              placeholder="Seu nome" style={inputStyle}
              onFocus={e => e.target.style.borderColor='rgba(255,255,255,0.25)'}
              onBlur={e => e.target.style.borderColor='#1e1e1e'} />
          </div>
          <div>
            <label style={{ display:'block', fontSize:'10px', color:'rgba(255,255,255,0.35)', marginBottom:'8px', letterSpacing:'2px', textTransform:'uppercase' }}>Email</label>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} required
              placeholder="seu@email.com" style={inputStyle}
              onFocus={e => e.target.style.borderColor='rgba(255,255,255,0.25)'}
              onBlur={e => e.target.style.borderColor='#1e1e1e'} />
          </div>
          <div>
            <label style={{ display:'block', fontSize:'10px', color:'rgba(255,255,255,0.35)', marginBottom:'8px', letterSpacing:'2px', textTransform:'uppercase' }}>Senha</label>
            <input type="password" value={password} onChange={e => setPassword(e.target.value)} required
              placeholder="Mínimo 6 caracteres" minLength={6} style={inputStyle}
              onFocus={e => e.target.style.borderColor='rgba(255,255,255,0.25)'}
              onBlur={e => e.target.style.borderColor='#1e1e1e'} />
          </div>

          {error && <p style={{ fontSize:'13px', color:'#f87171' }}>{error}</p>}

          <button type="submit" disabled={loading} style={{
            width:'100%', background:'white', color:'black', border:'none',
            borderRadius:'10px', padding:'14px', fontSize:'12px', fontWeight:700,
            letterSpacing:'2px', textTransform:'uppercase', cursor: loading ? 'not-allowed':'pointer',
            opacity: loading ? .6 : 1, marginTop:'4px', transition:'opacity .2s' }}>
            {loading ? 'Criando...' : 'Criar conta'}
          </button>
        </form>

        <Link to="/client/login" style={{
          display:'block', textAlign:'center', marginTop:'16px', padding:'13px',
          borderRadius:'10px', border:'1px solid rgba(255,255,255,0.12)',
          fontSize:'12px', fontWeight:600, letterSpacing:'1px', textTransform:'uppercase',
          color:'rgba(255,255,255,0.7)', textDecoration:'none' }}>
          Já tenho conta
        </Link>

        <p style={{ textAlign:'center', fontSize:'11px', color:'rgba(255,255,255,0.12)', marginTop:'16px' }}>
          Agência Avodah © 2026
        </p>
      </div>
    </div>
  )
}
