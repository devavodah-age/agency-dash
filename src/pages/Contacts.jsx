import { useState, useEffect } from 'react'
import { Phone, RefreshCw, Search } from 'lucide-react'

const CLIENTS = [
  {
    id: 'kaique',
    name: 'Kaique Motos',
    color: '#a78bfa',
    apiUrl: import.meta.env.VITE_KAIQUE_API_URL || 'https://horoscopo-api-production.up.railway.app',
    endpoint: '/api/kaique/leads',
  },
  // future clients go here
]

function formatDate(str) {
  if (!str) return '—'
  const d = new Date(str.replace(' ', 'T') + 'Z')
  return d.toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', year: '2-digit', hour: '2-digit', minute: '2-digit' })
}

function formatPhone(num) {
  if (!num) return '—'
  const d = num.replace(/\D/g, '')
  if (d.length === 11) return `(${d.slice(0,2)}) ${d.slice(2,7)}-${d.slice(7)}`
  if (d.length === 10) return `(${d.slice(0,2)}) ${d.slice(2,6)}-${d.slice(6)}`
  return num
}

function ClientLeads({ client }) {
  const [leads, setLeads] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [refreshing, setRefreshing] = useState(false)

  const load = async (silent = false) => {
    if (!silent) setLoading(true)
    else setRefreshing(true)
    try {
      const res = await fetch(`${client.apiUrl}${client.endpoint}`)
      const data = await res.json()
      setLeads(Array.isArray(data) ? data : [])
    } catch {}
    setLoading(false)
    setRefreshing(false)
  }

  useEffect(() => { load() }, [client.id])

  const filtered = leads.filter(l =>
    !search ||
    l.nome?.toLowerCase().includes(search.toLowerCase()) ||
    l.whatsapp?.includes(search) ||
    l.categoria?.toLowerCase().includes(search.toLowerCase())
  )

  const today = new Date().toISOString().slice(0, 10)

  return (
    <>
      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginBottom: '24px' }}>
        {[
          { label: 'Total de contatos', value: leads.length },
          { label: 'Hoje', value: leads.filter(l => l.created_at?.startsWith(today)).length },
          { label: 'Categorias únicas', value: [...new Set(leads.map(l => l.categoria).filter(Boolean))].length },
        ].map(({ label, value }) => (
          <div key={label} style={{ background: '#111', border: '1px solid #1a1a1a', borderRadius: '12px', padding: '20px 24px' }}>
            <p style={{ fontSize: '28px', fontWeight: 800, color: client.color, marginBottom: '4px' }}>{value}</p>
            <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.3)' }}>{label}</p>
          </div>
        ))}
      </div>

      {/* Search + refresh */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginBottom: '16px' }}>
        <div style={{ position: 'relative' }}>
          <Search size={13} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'rgba(255,255,255,0.3)' }} />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Buscar..."
            style={{
              background: '#1a1a1a', border: '1px solid #222', borderRadius: '8px',
              padding: '8px 12px 8px 30px', color: '#fff', fontSize: '13px',
              outline: 'none', width: '200px'
            }}
          />
        </div>
        <button
          onClick={() => load(true)}
          style={{
            display: 'flex', alignItems: 'center', gap: '6px',
            padding: '8px 14px', borderRadius: '8px', border: '1px solid #222',
            background: '#1a1a1a', color: 'rgba(255,255,255,0.5)', fontSize: '12px',
            cursor: 'pointer', fontWeight: 600
          }}>
          <RefreshCw size={12} style={{ animation: refreshing ? 'spin 1s linear infinite' : 'none' }} />
          Atualizar
        </button>
      </div>

      {/* Table */}
      <div style={{ background: '#111', border: '1px solid #1a1a1a', borderRadius: '12px', overflow: 'hidden' }}>
        {loading ? (
          <div style={{ padding: '60px', textAlign: 'center', color: 'rgba(255,255,255,0.2)', fontSize: '13px' }}>Carregando...</div>
        ) : filtered.length === 0 ? (
          <div style={{ padding: '60px', textAlign: 'center', color: 'rgba(255,255,255,0.2)', fontSize: '13px' }}>
            {search ? 'Nenhum resultado encontrado.' : 'Nenhum contato ainda.'}
          </div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid #1a1a1a' }}>
                {['Nome', 'WhatsApp', 'Interesse', 'Origem', 'Campanha', 'Data'].map(h => (
                  <th key={h} style={{ padding: '12px 16px', textAlign: 'left', fontSize: '11px', fontWeight: 700, color: 'rgba(255,255,255,0.25)', textTransform: 'uppercase', letterSpacing: '1px' }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((lead, i) => (
                <tr key={lead.id}
                  style={{ borderBottom: i < filtered.length - 1 ? '1px solid #161616' : 'none', transition: 'background .15s' }}
                  onMouseEnter={e => e.currentTarget.style.background = '#161616'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                  <td style={{ padding: '14px 16px', fontSize: '13px', fontWeight: 600, color: '#fff' }}>{lead.nome || '—'}</td>
                  <td style={{ padding: '14px 16px', fontSize: '13px', color: 'rgba(255,255,255,0.6)' }}>
                    <a href={`https://wa.me/55${lead.whatsapp?.replace(/\D/g,'')}`} target="_blank" rel="noreferrer"
                      style={{ color: '#25d366', textDecoration: 'none', fontWeight: 600 }}>
                      {formatPhone(lead.whatsapp)}
                    </a>
                  </td>
                  <td style={{ padding: '14px 16px' }}>
                    <span style={{ background: `${client.color}18`, color: client.color, padding: '3px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: 600 }}>
                      {lead.categoria || '—'}
                    </span>
                  </td>
                  <td style={{ padding: '14px 16px', fontSize: '12px', color: 'rgba(255,255,255,0.35)' }}>{lead.utm_source || '—'}</td>
                  <td style={{ padding: '14px 16px', fontSize: '12px', color: 'rgba(255,255,255,0.35)' }}>{lead.utm_campaign || '—'}</td>
                  <td style={{ padding: '14px 16px', fontSize: '12px', color: 'rgba(255,255,255,0.35)' }}>{formatDate(lead.created_at)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </>
  )
}

export default function Contacts() {
  const [activeClient, setActiveClient] = useState(CLIENTS[0].id)
  const client = CLIENTS.find(c => c.id === activeClient)

  return (
    <div style={{ padding: '32px' }}>
      {/* Header */}
      <div style={{ marginBottom: '28px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
          <Phone size={18} color="#a78bfa" />
          <h1 style={{ fontSize: '20px', fontWeight: 800, color: '#fff' }}>Contatos</h1>
        </div>
        <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.3)' }}>Leads capturados por cliente</p>
      </div>

      {/* Client tabs */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '28px', borderBottom: '1px solid #1a1a1a', paddingBottom: '0' }}>
        {CLIENTS.map(c => (
          <button
            key={c.id}
            onClick={() => setActiveClient(c.id)}
            style={{
              padding: '10px 20px',
              background: 'transparent',
              border: 'none',
              borderBottom: activeClient === c.id ? `2px solid ${c.color}` : '2px solid transparent',
              color: activeClient === c.id ? c.color : 'rgba(255,255,255,0.35)',
              fontSize: '13px',
              fontWeight: activeClient === c.id ? 700 : 400,
              cursor: 'pointer',
              transition: 'all .15s',
              marginBottom: '-1px',
            }}>
            {c.name}
          </button>
        ))}
      </div>

      <ClientLeads key={activeClient} client={client} />
      <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
    </div>
  )
}
