import { useState, useEffect } from 'react'
import { CheckCircle, XCircle, RefreshCw } from 'lucide-react'

const API = import.meta.env.VITE_API_URL

export default function Integrations() {
  const [bmId, setBmId] = useState('')
  const [token, setToken] = useState('')
  const [hasToken, setHasToken] = useState(false)
  const [saving, setSaving] = useState(false)
  const [testing, setTesting] = useState(false)
  const [status, setStatus] = useState(null)
  const [saved, setSaved] = useState(false)

  const authHeaders = {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${localStorage.getItem('token')}`
  }

  useEffect(() => {
    fetch(`${API}/settings/meta`, { headers: authHeaders })
      .then(r => r.json())
      .then(data => {
        setBmId(data.meta_bm_id || '')
        setHasToken(data.has_token)
      })
  }, [])

  const save = async () => {
    setSaving(true); setSaved(false); setStatus(null)
    const r = await fetch(`${API}/settings/meta`, {
      method: 'PUT',
      headers: authHeaders,
      body: JSON.stringify({ meta_bm_id: bmId, meta_access_token: token })
    })
    setSaving(false)
    if (r.ok) { setSaved(true); setHasToken(true); setToken('') }
  }

  const test = async () => {
    setTesting(true); setStatus(null)
    const r = await fetch(`${API}/settings/meta/test`, { headers: authHeaders })
    const data = await r.json()
    setStatus(r.ok ? { ok: true, name: data.bm_name } : { ok: false, msg: data.error })
    setTesting(false)
  }

  const inputStyle = {
    width: '100%', background: '#0e0e0e', border: '1px solid #1e1e1e',
    borderRadius: '8px', padding: '11px 14px', color: 'white',
    fontSize: '13px', outline: 'none', fontFamily: 'monospace'
  }

  return (
    <div style={{ padding: '32px', maxWidth: '600px' }}>
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ fontSize: '22px', fontWeight: 700, color: 'white', marginBottom: '6px' }}>
          Integrações
        </h1>
        <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.35)' }}>
          Configure as credenciais da sua Business Manager. O token será usado para todos os clientes.
        </p>
      </div>

      {/* Meta Ads Card */}
      <div style={{ background: '#0e0e0e', border: '1px solid #1e1e1e', borderRadius: '14px', padding: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
          <div style={{ width: '36px', height: '36px', background: '#1877f2', borderRadius: '8px',
            display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900,
            fontSize: '16px', color: 'white' }}>f</div>
          <div>
            <p style={{ fontWeight: 600, color: 'white', fontSize: '15px' }}>Meta Business Manager</p>
            <p style={{ fontSize: '12px', color: hasToken ? '#4ade80' : 'rgba(255,255,255,0.3)', marginTop: '2px' }}>
              {hasToken ? 'Token configurado' : 'Não configurado'}
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginBottom: '20px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '10px', color: 'rgba(255,255,255,0.35)',
              marginBottom: '7px', letterSpacing: '2px', textTransform: 'uppercase' }}>
              Business Manager ID
            </label>
            <input
              style={inputStyle}
              placeholder="Ex: 123456789" autoComplete="off"
              value={bmId}
              onChange={e => { setBmId(e.target.value); setSaved(false) }}
            />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '10px', color: 'rgba(255,255,255,0.35)',
              marginBottom: '7px', letterSpacing: '2px', textTransform: 'uppercase' }}>
              Access Token {hasToken && <span style={{ color: '#4ade80' }}>— já salvo (preencha para atualizar)</span>}
            </label>
            <input
              style={inputStyle}
              type="password" autoComplete="new-password"
              placeholder={hasToken ? '••••••••••••• (deixe vazio para manter)' : 'EAAxxxxxxxx...'}
              value={token}
              onChange={e => { setToken(e.target.value); setSaved(false) }}
            />
          </div>
        </div>

        {status && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px',
            color: status.ok ? '#4ade80' : '#f87171', fontSize: '13px', marginBottom: '16px' }}>
            {status.ok ? <CheckCircle size={15}/> : <XCircle size={15}/>}
            {status.ok ? `Conectado: ${status.name}` : status.msg}
          </div>
        )}

        {saved && !status && (
          <p style={{ fontSize: '13px', color: '#4ade80', marginBottom: '16px' }}>Salvo com sucesso!</p>
        )}

        <div style={{ display: 'flex', gap: '10px' }}>
          <button onClick={save} disabled={saving || (!bmId || (!token && !hasToken))}
            style={{ background: 'white', color: 'black', border: 'none', borderRadius: '8px',
              padding: '10px 20px', fontSize: '12px', fontWeight: 700, cursor: 'pointer',
              letterSpacing: '1px', opacity: (saving || (!bmId || (!token && !hasToken))) ? 0.4 : 1 }}>
            {saving ? 'Salvando...' : 'Salvar'}
          </button>

          {hasToken && (
            <button onClick={test} disabled={testing}
              style={{ background: 'transparent', color: 'rgba(255,255,255,0.6)',
                border: '1px solid #1e1e1e', borderRadius: '8px', padding: '10px 16px',
                fontSize: '12px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <RefreshCw size={12} style={{ animation: testing ? 'spin 1s linear infinite' : 'none' }}/>
              {testing ? 'Testando...' : 'Testar conexão'}
            </button>
          )}
        </div>
      </div>

      <div style={{ marginTop: '20px', background: '#0e0e0e', border: '1px solid #1e1e1e',
        borderRadius: '12px', padding: '16px' }}>
        <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.35)', lineHeight: '1.7' }}>
          <strong style={{ color: 'rgba(255,255,255,0.6)' }}>Como obter o token:</strong><br/>
          1. Acesse developers.facebook.com → Graph API Explorer<br/>
          2. Selecione sua BM e gere um token com permissões <code style={{color:'#60a5fa'}}>ads_read</code> e <code style={{color:'#60a5fa'}}>business_management</code><br/>
          3. Para token de longa duração, use o endpoint de extensão de token
        </p>
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}
