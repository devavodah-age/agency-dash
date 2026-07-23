import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

const API = import.meta.env.VITE_API_URL

export default function Register() {
  const [form, setForm] = useState({ name:'', email:'', password:'', confirm:'' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const navigate = useNavigate()
  const { login } = useAuth()

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const handleSubmit = async e => {
    e.preventDefault(); setError(''); 
    if (form.password !== form.confirm) { setError('As senhas não coincidem'); return }
    setLoading(true)
    try {
      const r = await fetch(`${API}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, agency_id: 1 })
      })
      const data = await r.json()
      if (!r.ok) { setError(data.error || 'Erro ao criar conta'); setLoading(false); return }
      // auto-login after register
      await login(form.email, form.password)
      navigate('/')
    } catch { setError('Erro de conexão') }
    setLoading(false)
  }

  const inputStyle = {
    width:'100%', background:'#0e0e0e', border:'1px solid #1e1e1e',
    borderRadius:'10px', padding:'13px 16px', color:'white',
    fontSize:'14px', outline:'none', transition:'border-color .2s',
    boxSizing:'border-box'
  }

  return (
    <div style={{ minHeight:'100vh', display:'flex', alignItems:'center',
      justifyContent:'center', background:'#060606', padding:'20px' }}>
      <div style={{ width:'100%', maxWidth:'380px' }}>
        <div style={{ marginBottom:'32px', textAlign:'center' }}>
          <h2 style={{ fontSize:'22px', fontWeight:700, color:'white', marginBottom:'8px' }}>
            Criar conta</h2>
          <p style={{ fontSize:'13px', color:'rgba(255,255,255,0.32)' }}>
            Preencha os dados abaixo para se cadastrar</p>
        </div>

        {success ? (
          <div style={{ textAlign:'center', padding:'24px', background:'rgba(74,222,128,0.08)',
            border:'1px solid rgba(74,222,128,0.2)', borderRadius:'12px' }}>
            <p style={{ color:'#4ade80', fontWeight:600 }}>Conta criada com sucesso!</p>
            <p style={{ color:'rgba(255,255,255,0.4)', fontSize:'13px', marginTop:'8px' }}>
              Redirecionando para o login...</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} style={{ display:'flex', flexDirection:'column', gap:'14px' }}>
            {[
              { label:'Nome completo', key:'name', type:'text', placeholder:'Seu nome' },
              { label:'Email', key:'email', type:'email', placeholder:'seu@email.com' },
              { label:'Senha', key:'password', type:'password', placeholder:'••••••••' },
].map(({ label, key, type, placeholder }) => (
              <div key={key}>
                <label style={{ display:'block', fontSize:'10px', color:'rgba(255,255,255,0.35)',
                  marginBottom:'8px', letterSpacing:'2px', textTransform:'uppercase' }}>{label}</label>
                <input type={type} value={form[key]} placeholder={placeholder}
                  onChange={e => set(key, e.target.value)} required style={inputStyle}
                  onFocus={e => e.target.style.borderColor='rgba(255,255,255,0.25)'}
                  onBlur={e => e.target.style.borderColor='#1e1e1e'}/>
              </div>
            ))}

            {error && <p style={{ fontSize:'13px', color:'#f87171' }}>{error}</p>}

            <button type="submit" disabled={loading} style={{
              width:'100%', background:'white', color:'black', border:'none',
              borderRadius:'10px', padding:'14px', fontSize:'12px', fontWeight:700,
              letterSpacing:'2px', textTransform:'uppercase',
              cursor: loading ? 'not-allowed':'pointer',
              opacity: loading ? .6 : 1, marginTop:'4px' }}>
              {loading ? 'Criando...' : 'Criar conta'}
            </button>

            <p style={{ textAlign:'center', fontSize:'12px', color:'rgba(255,255,255,0.2)', marginTop:'8px' }}>
              Já tem conta?{' '}
              <a href='/login' style={{ color:'rgba(255,255,255,0.6)', textDecoration:'none', fontWeight:600 }}>
                Entrar
              </a>
            </p>
          </form>
        )}
      </div>
    </div>
  )
}
