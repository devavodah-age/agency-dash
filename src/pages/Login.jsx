import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

/*
  A: centrado em x=60, paths independentes do V
  V: centrado em x=185, paths independentes do A
  Gap de ~65px entre eles
*/
const SEGMENTS = [
  // ── Letra A ──────────────────────────────
  { d: 'M 8,148 L 60,8',    len: 150, delay: 0.0 }, // perna esquerda sobe
  { d: 'M 60,8 L 112,148',  len: 150, delay: 0.9 }, // perna direita desce
  { d: 'M 28,105 L 60,28',  len:  90, delay: 1.8 }, // inner esquerda sobe
  { d: 'M 60,28 L 90,105',  len:  90, delay: 2.5 }, // inner direita desce

  // ── Letra V ──────────────────────────────
  { d: 'M 138,8 L 185,148', len: 150, delay: 3.4 }, // perna esquerda desce
  { d: 'M 185,148 L 232,8', len: 150, delay: 4.3 }, // perna direita sobe
  { d: 'M 158,8 L 185,95',  len:  98, delay: 5.2 }, // inner esquerda desce
  { d: 'M 185,95 L 212,8',  len:  98, delay: 5.9 }, // inner direita sobe
]

function AvodahLogo() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '36px' }}>
      <svg viewBox="0 0 240 160" width="300" height="200" fill="none">
        <defs>
          <filter id="glow">
            <feGaussianBlur stdDeviation="3.5" result="blur"/>
            <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
          </filter>
          <filter id="tip">
            <feGaussianBlur stdDeviation="7" result="blur"/>
            <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
          </filter>
        </defs>

        {SEGMENTS.map((s, i) => (
          <g key={i}>
            {/* rastro base */}
            <path d={s.d} stroke="rgba(255,255,255,0.06)" strokeWidth="3.5" strokeLinecap="round"
              style={{ strokeDasharray: s.len, strokeDashoffset: s.len,
                animation: `draw .85s ease forwards`, animationDelay: `${s.delay}s` }}/>
            {/* traço branco principal */}
            <path d={s.d} stroke="white" strokeWidth="2" strokeLinecap="round" filter="url(#glow)"
              style={{ strokeDasharray: s.len, strokeDashoffset: s.len,
                animation: `draw .85s ease forwards`, animationDelay: `${s.delay}s` }}/>
            {/* ponto de luz na ponta */}
            <path d={s.d} stroke="rgba(255,255,255,0.9)" strokeWidth="6" strokeLinecap="round" filter="url(#tip)"
              style={{ strokeDasharray: `3 ${s.len + 10}`, strokeDashoffset: s.len,
                animation: `tip .85s ease forwards`, animationDelay: `${s.delay}s` }}/>
          </g>
        ))}

        <style>{`
          @keyframes draw { to { stroke-dashoffset: 0; } }
          @keyframes tip  { to { stroke-dashoffset: -210; } }
        `}</style>
      </svg>

      {/* texto */}
      <div style={{ textAlign: 'center', opacity: 0,
        animation: 'fadein 1.2s ease forwards', animationDelay: '6.8s' }}>
        <p style={{ fontSize:'11px', fontWeight:700, letterSpacing:'6px',
          color:'rgba(255,255,255,0.88)', textTransform:'uppercase' }}>
          AGENCIA AVODAH
        </p>
        <p style={{ fontSize:'10px', fontWeight:400, letterSpacing:'3px',
          color:'rgba(255,255,255,0.28)', marginTop:'6px', textTransform:'uppercase' }}>
          Agency Dashboard
        </p>
      </div>

      <style>{`
        @keyframes fadein {
          from { opacity:0; transform:translateY(8px); }
          to   { opacity:1; transform:translateY(0); }
        }
      `}</style>
    </div>
  )
}

export default function Login() {
  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')
  const [error, setError]       = useState('')
  const [loading, setLoading]   = useState(false)
  const { login }  = useAuth()
  const navigate   = useNavigate()

  const handleSubmit = async e => {
    e.preventDefault(); setError(''); setLoading(true)
    try { await login(email, password); navigate('/') }
    catch { setError('Email ou senha incorretos') }
    finally { setLoading(false) }
  }

  const inputStyle = {
    width:'100%', background:'#0e0e0e', border:'1px solid #1e1e1e',
    borderRadius:'10px', padding:'13px 16px', color:'white',
    fontSize:'14px', outline:'none', transition:'border-color .2s',
  }

  return (
    <div style={{ minHeight:'100vh', display:'flex', background:'#060606' }}>

      {/* ── Esquerda: logo ── */}
      <div style={{
        flex: 1, display:'flex', alignItems:'center', justifyContent:'center',
        borderRight:'1px solid #111', position:'relative', overflow:'hidden',
      }}>
        <div style={{
          position:'absolute', width:'480px', height:'480px', borderRadius:'50%',
          background:'radial-gradient(circle, rgba(255,255,255,0.025) 0%, transparent 70%)',
          pointerEvents:'none',
        }}/>
        <AvodahLogo />
      </div>

      {/* ── Direita: form ── */}
      <div style={{ flex:1, display:'flex', alignItems:'center', justifyContent:'center', padding:'40px 32px' }}>
        <div style={{ width:'100%', maxWidth:'380px' }}>
          <div style={{ marginBottom:'32px' }}>
            <h2 style={{ fontSize:'22px', fontWeight:700, color:'white', marginBottom:'8px' }}>
              Bem-vindo de volta
            </h2>
            <p style={{ fontSize:'13px', color:'rgba(255,255,255,0.32)' }}>
              Entre com suas credenciais para acessar o painel
            </p>
          </div>

          <form onSubmit={handleSubmit} style={{ display:'flex', flexDirection:'column', gap:'16px' }}>
            <div>
              <label style={{ display:'block', fontSize:'10px', color:'rgba(255,255,255,0.35)',
                marginBottom:'8px', letterSpacing:'2px', textTransform:'uppercase' }}>Email</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                required placeholder="seu@email.com" style={inputStyle}
                onFocus={e => e.target.style.borderColor='rgba(255,255,255,0.25)'}
                onBlur={e => e.target.style.borderColor='#1e1e1e'}/>
            </div>

            <div>
              <label style={{ display:'block', fontSize:'10px', color:'rgba(255,255,255,0.35)',
                marginBottom:'8px', letterSpacing:'2px', textTransform:'uppercase' }}>Senha</label>
              <input type="password" value={password} onChange={e => setPassword(e.target.value)}
                required placeholder="••••••••" style={inputStyle}
                onFocus={e => e.target.style.borderColor='rgba(255,255,255,0.25)'}
                onBlur={e => e.target.style.borderColor='#1e1e1e'}/>
            </div>

            {error && <p style={{ fontSize:'13px', color:'#f87171' }}>{error}</p>}

            <button type="submit" disabled={loading} style={{
              width:'100%', background:'white', color:'black', border:'none',
              borderRadius:'10px', padding:'14px', fontSize:'12px', fontWeight:700,
              letterSpacing:'2px', textTransform:'uppercase', cursor: loading ? 'not-allowed':'pointer',
              opacity: loading ? .6 : 1, marginTop:'4px', transition:'opacity .2s',
            }}>
              {loading ? 'Entrando...' : 'Entrar'}
            </button>
          </form>

          <p style={{ textAlign:'center', fontSize:'11px', color:'rgba(255,255,255,0.12)', marginTop:'32px' }}>
            Agência Avodah © 2026
          </p>
        </div>
      </div>
    </div>
  )
}
