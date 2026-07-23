import { useState, useEffect } from 'react'
import { CheckCircle, XCircle, RefreshCw, Plug } from 'lucide-react'

const API = import.meta.env.VITE_API_URL

export default function Integrations() {
  const [clients, setClients] = useState([])
  const [testing, setTesting] = useState({})
  const [status, setStatus] = useState({})
  const [editing, setEditing] = useState({})
  const [saving, setSaving] = useState({})

  const token = localStorage.getItem('token')
  const headers = { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }

  useEffect(() => {
    fetch(`${API}/clients`, { headers })
      .then(r => r.json())
      .then(setClients)
  }, [])

  const testConnection = async (clientId) => {
    setTesting(t => ({ ...t, [clientId]: true }))
    setStatus(s => ({ ...s, [clientId]: null }))
    try {
      const r = await fetch(`${API}/meta/test/${clientId}`, { headers })
      const data = await r.json()
      setStatus(s => ({ ...s, [clientId]: r.ok ? { ok: true, name: data.account_name } : { ok: false, msg: data.error } }))
    } catch {
      setStatus(s => ({ ...s, [clientId]: { ok: false, msg: 'Erro de conexão' } }))
    }
    setTesting(t => ({ ...t, [clientId]: false }))
  }

  const saveCredentials = async (client) => {
    setSaving(s => ({ ...s, [client.id]: true }))
    const ed = editing[client.id] || {}
    await fetch(`${API}/clients/${client.id}`, {
      method: 'PUT',
      headers,
      body: JSON.stringify({
        name: client.name,
        email: client.email,
        meta_account_id: ed.meta_account_id ?? client.meta_account_id,
        meta_access_token: ed.meta_access_token ?? client.meta_access_token,
      })
    })
    setClients(cs => cs.map(c => c.id === client.id
      ? { ...c, ...ed }
      : c
    ))
    setEditing(e => ({ ...e, [client.id]: undefined }))
    setSaving(s => ({ ...s, [client.id]: false }))
    await testConnection(client.id)
  }

  const inputStyle = {
    width: '100%', background: '#0e0e0e', border: '1px solid #1e1e1e',
    borderRadius: '8px', padding: '10px 12px', color: 'white',
    fontSize: '13px', outline: 'none', fontFamily: 'monospace'
  }

  return (
    <div style={{ padding: '32px', maxWidth: '860px' }}>
      <div style={{ marginBottom: '28px' }}>
        <h1 style={{ fontSize: '22px', fontWeight: 700, color: 'white', marginBottom: '6px' }}>
          Integrações
        </h1>
        <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.35)' }}>
          Conecte as contas Meta Ads de cada cliente
        </p>
      </div>

      {clients.length === 0 && (
        <div style={{ color: 'rgba(255,255,255,0.3)', fontSize: '14px', marginTop: '40px', textAlign: 'center' }}>
          Nenhum cliente cadastrado ainda. Crie clientes primeiro.
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {clients.map(client => {
          const ed = editing[client.id] || {}
          const st = status[client.id]
          const hasCredentials = client.meta_account_id && client.meta_access_token
          const isEdited = ed.meta_account_id !== undefined || ed.meta_access_token !== undefined

          return (
            <div key={client.id} style={{
              background: '#0e0e0e', border: '1px solid #1e1e1e',
              borderRadius: '12px', padding: '20px'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                <div>
                  <p style={{ fontWeight: 600, color: 'white', fontSize: '15px' }}>{client.name}</p>
                  {client.email && <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.3)', marginTop: '2px' }}>{client.email}</p>}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  {st && (
                    st.ok
                      ? <div style={{ display:'flex', alignItems:'center', gap:'6px', color:'#4ade80', fontSize:'12px' }}>
                          <CheckCircle size={14}/> {st.name}
                        </div>
                      : <div style={{ display:'flex', alignItems:'center', gap:'6px', color:'#f87171', fontSize:'12px' }}>
                          <XCircle size={14}/> {st.msg}
                        </div>
                  )}
                  {!st && hasCredentials && (
                    <div style={{ display:'flex', alignItems:'center', gap:'6px', color:'rgba(255,255,255,0.3)', fontSize:'12px' }}>
                      <Plug size={14}/> Configurado
                    </div>
                  )}
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '14px' }}>
                <div>
                  <label style={{ display:'block', fontSize:'10px', color:'rgba(255,255,255,0.35)',
                    marginBottom:'6px', letterSpacing:'2px', textTransform:'uppercase' }}>
                    Account ID
                  </label>
                  <input
                    style={inputStyle}
                    placeholder="Ex: 1234567890"
                    defaultValue={client.meta_account_id || ''}
                    onChange={e => setEditing(ed => ({ ...ed, [client.id]: { ...(ed[client.id]||{}), meta_account_id: e.target.value } }))}
                  />
                </div>
                <div>
                  <label style={{ display:'block', fontSize:'10px', color:'rgba(255,255,255,0.35)',
                    marginBottom:'6px', letterSpacing:'2px', textTransform:'uppercase' }}>
                    Access Token
                  </label>
                  <input
                    style={inputStyle}
                    placeholder="EAAxxxxxxxx..."
                    defaultValue={client.meta_access_token || ''}
                    type="password"
                    onChange={e => setEditing(ed => ({ ...ed, [client.id]: { ...(ed[client.id]||{}), meta_access_token: e.target.value } }))}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', gap: '8px' }}>
                {isEdited && (
                  <button
                    onClick={() => saveCredentials(client)}
                    disabled={saving[client.id]}
                    style={{
                      background: 'white', color: 'black', border: 'none',
                      borderRadius: '8px', padding: '8px 18px', fontSize: '12px',
                      fontWeight: 700, cursor: 'pointer', letterSpacing: '1px',
                      opacity: saving[client.id] ? 0.6 : 1
                    }}>
                    {saving[client.id] ? 'Salvando...' : 'Salvar'}
                  </button>
                )}
                {hasCredentials && !isEdited && (
                  <button
                    onClick={() => testConnection(client.id)}
                    disabled={testing[client.id]}
                    style={{
                      background: 'transparent', color: 'rgba(255,255,255,0.6)',
                      border: '1px solid #1e1e1e', borderRadius: '8px',
                      padding: '8px 16px', fontSize: '12px', cursor: 'pointer',
                      display: 'flex', alignItems: 'center', gap: '6px'
                    }}>
                    <RefreshCw size={12} style={{ animation: testing[client.id] ? 'spin 1s linear infinite' : 'none' }}/>
                    {testing[client.id] ? 'Testando...' : 'Testar conexão'}
                  </button>
                )}
              </div>
            </div>
          )
        })}
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}
