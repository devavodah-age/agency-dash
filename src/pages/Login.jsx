import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

/* ── SVG paths que formam o monograma AV ─────────────────────────
   Cada segmento é animado em sequência, criando o efeito de "luz
   traçando" as letras, como a marca do Zorro — mas lento e suave.
──────────────────────────────────────────────────────────────── */
const AV_PATHS = [
  // Perna esquerda do A
  { d: 'M 12,148 L 72,12',          len: 150, delay: 0   },
  // Perna direita do A descendo até o fundo do V
  { d: 'M 72,12 L 116,100',         len: 100, delay: 0.9 },
  // Perna esquerda do V subindo
  { d: 'M 116,100 L 160,12',        len: 100, delay: 1.6 },
  // Perna direita do V
  { d: 'M 160,12 L 220,148',        len: 150, delay: 2.3 },
  // Barra interna do A (esquerda)
  { d: 'M 38,100 L 72,12',          len:  95, delay: 3.1 },
  // Barra interna do A (direita) / encontra o V
  { d: 'M 72,12 L 96,68',           len:  65, delay: 3.7 },
  // Completar inner do V (direita)
  { d: 'M 96,68 L 116,100 L 138,68',len:  60, delay: 4.2 },
  // Inner direita do V até o topo
  { d: 'M 138,68 L 160,12',         len:  95, delay: 4.7 },
]

function AvodahLogo() {
  const [phase, setPhase] = useState('drawing') // drawing | done

  useEffect(() => {
    const total = 4.7 + 1.2
    const t = setTimeout(() => setPhase('done'), total * 1000)
    return () => clearTimeout(t)
  }, [])

  return (
    <div className="flex flex-col items-center gap-10 select-none">
      <svg
        viewBox="0 0 232 160"
        width="260"
        height="180"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <filter id="glow" x="-40%" y="-40%" width="180%" height="180%">
            <feGaussianBlur stdDeviation="4" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <filter id="glow-strong" x="-60%" y="-60%" width="220%" height="220%">
            <feGaussianBlur stdDeviation="8" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {AV_PATHS.map((p, i) => (
          <g key={i}>
            {/* Traço base (branco suave, aparece junto) */}
            <path
              d={p.d}
              stroke="rgba(255,255,255,0.08)"
              strokeWidth="3"
              strokeLinecap="round"
              style={{
                strokeDasharray: p.len,
                strokeDashoffset: p.len,
                animation: `draw-path ${0.8}s ease forwards`,
                animationDelay: `${p.delay}s`,
              }}
            />
            {/* Traço principal branco */}
            <path
              d={p.d}
              stroke="white"
              strokeWidth="2.5"
              strokeLinecap="round"
              filter="url(#glow)"
              style={{
                strokeDasharray: p.len,
                strokeDashoffset: p.len,
                animation: `draw-path ${0.8}s ease forwards`,
                animationDelay: `${p.delay}s`,
              }}
            />
            {/* Ponto de luz na ponta da escrita */}
            <path
              d={p.d}
              stroke="rgba(255,255,255,0.95)"
              strokeWidth="5"
              strokeLinecap="round"
              filter="url(#glow-strong)"
              style={{
                strokeDasharray: `4 ${p.len}`,
                strokeDashoffset: p.len,
                animation: `draw-tip ${0.8}s ease forwards`,
                animationDelay: `${p.delay}s`,
              }}
            />
          </g>
        ))}

        <style>{`
          @keyframes draw-path {
            to { stroke-dashoffset: 0; }
          }
          @keyframes draw-tip {
            to { stroke-dashoffset: -${200}; }
          }
        `}</style>
      </svg>

      {/* Texto AGENCIA AVODAH */}
      <div
        className="text-center"
        style={{
          opacity: 0,
          animation: 'fade-in 1.2s ease forwards',
          animationDelay: '5.2s',
        }}
      >
        <p
          style={{
            fontFamily: 'Inter, sans-serif',
            fontSize: '11px',
            fontWeight: 700,
            letterSpacing: '6px',
            color: 'rgba(255,255,255,0.9)',
            textTransform: 'uppercase',
          }}
        >
          AGENCIA AVODAH
        </p>
        <p
          style={{
            fontFamily: 'Inter, sans-serif',
            fontSize: '10px',
            fontWeight: 400,
            letterSpacing: '3px',
            color: 'rgba(255,255,255,0.3)',
            marginTop: '6px',
            textTransform: 'uppercase',
          }}
        >
          Agency Dashboard
        </p>
      </div>

      <style>{`
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(6px); }
          to   { opacity: 1; transform: translateY(0); }
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
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await login(email, password)
      navigate('/')
    } catch {
      setError('Email ou senha incorretos')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex" style={{ background: '#060606' }}>

      {/* ── Lado esquerdo — logo animada ── */}
      <div
        className="hidden lg:flex flex-1 items-center justify-center relative overflow-hidden"
        style={{ borderRight: '1px solid #141414' }}
      >
        {/* Gradiente radial sutil atrás do logo */}
        <div
          style={{
            position: 'absolute',
            width: '500px',
            height: '500px',
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(255,255,255,0.03) 0%, transparent 70%)',
            pointerEvents: 'none',
          }}
        />
        <AvodahLogo />
      </div>

      {/* ── Lado direito — formulário ── */}
      <div
        className="flex flex-1 items-center justify-center px-8"
        style={{ maxWidth: '520px', margin: '0 auto' }}
      >
        <div className="w-full" style={{ maxWidth: '380px' }}>

          {/* Logo mobile */}
          <div className="lg:hidden text-center mb-10">
            <p style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '6px', color: 'white', textTransform: 'uppercase' }}>
              AGENCIA AVODAH
            </p>
          </div>

          <div className="mb-8">
            <h2 style={{ fontSize: '22px', fontWeight: 700, color: 'white', marginBottom: '6px' }}>
              Bem-vindo de volta
            </h2>
            <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.35)' }}>
              Entre com suas credenciais para acessar o painel
            </p>
          </div>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '11px', color: 'rgba(255,255,255,0.4)', marginBottom: '8px', letterSpacing: '2px', textTransform: 'uppercase' }}>
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                placeholder="seu@email.com"
                style={{
                  width: '100%',
                  background: '#0e0e0e',
                  border: '1px solid #1e1e1e',
                  borderRadius: '10px',
                  padding: '13px 16px',
                  color: 'white',
                  fontSize: '14px',
                  outline: 'none',
                  transition: 'border-color 0.2s',
                }}
                onFocus={e => e.target.style.borderColor = 'rgba(255,255,255,0.3)'}
                onBlur={e => e.target.style.borderColor = '#1e1e1e'}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '11px', color: 'rgba(255,255,255,0.4)', marginBottom: '8px', letterSpacing: '2px', textTransform: 'uppercase' }}>
                Senha
              </label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                placeholder="••••••••"
                style={{
                  width: '100%',
                  background: '#0e0e0e',
                  border: '1px solid #1e1e1e',
                  borderRadius: '10px',
                  padding: '13px 16px',
                  color: 'white',
                  fontSize: '14px',
                  outline: 'none',
                  transition: 'border-color 0.2s',
                }}
                onFocus={e => e.target.style.borderColor = 'rgba(255,255,255,0.3)'}
                onBlur={e => e.target.style.borderColor = '#1e1e1e'}
              />
            </div>

            {error && (
              <p style={{ fontSize: '13px', color: '#f87171' }}>{error}</p>
            )}

            <button
              type="submit"
              disabled={loading}
              style={{
                width: '100%',
                background: 'white',
                color: 'black',
                border: 'none',
                borderRadius: '10px',
                padding: '14px',
                fontSize: '13px',
                fontWeight: 700,
                letterSpacing: '2px',
                textTransform: 'uppercase',
                cursor: loading ? 'not-allowed' : 'pointer',
                opacity: loading ? 0.6 : 1,
                marginTop: '4px',
                transition: 'opacity 0.2s',
              }}
            >
              {loading ? 'Entrando...' : 'Entrar'}
            </button>
          </form>

          <p style={{ textAlign: 'center', fontSize: '11px', color: 'rgba(255,255,255,0.15)', marginTop: '32px' }}>
            Agência Avodah © 2026
          </p>
        </div>
      </div>
    </div>
  )
}
