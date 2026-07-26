import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useClientAuth } from '../../contexts/ClientAuthContext'
import { MessageSquare, LogOut, TrendingUp, DollarSign, Send, PhoneCall } from 'lucide-react'

const API = import.meta.env.VITE_API_URL || 'https://agency-dash-api-production.up.railway.app'

const PERIODS = [
  { label: 'Hoje', value: 'today' },
  { label: '7 dias', value: '7d' },
  { label: '30 dias', value: '30d' },
]

function authHeaders() {
  const t = localStorage.getItem('client_token')
  return { Authorization: `Bearer ${t}`, 'Content-Type': 'application/json' }
}

export default function ClientDashboard() {
  const { clientUser, loading: authLoading, logout } = useClientAuth()
  const navigate = useNavigate()

  const [period, setPeriod] = useState('30d')
  const [metrics, setMetrics] = useState(null)
  const [metricsLoading, setMetricsLoading] = useState(true)

  const [tickets, setTickets] = useState([])
  const [ticketsLoading, setTicketsLoading] = useState(true)
  const [showTicketForm, setShowTicketForm] = useState(false)
  const [ticketForm, setTicketForm] = useState({ subject: '', message: '' })
  const [submitting, setSubmitting] = useState(false)

  const [support, setSupport] = useState(null)

  useEffect(() => {
    if (!authLoading && !clientUser) navigate('/client/login')
  }, [authLoading, clientUser])

  useEffect(() => {
    if (!clientUser) return
    setMetricsLoading(true)
    fetch(`${API}/client-portal/metrics?period=${period}`, { headers: authHeaders() })
      .then(r => r.json())
      .then(d => setMetrics(d))
      .catch(() => {})
      .finally(() => setMetricsLoading(false))
  }, [period, clientUser])

  useEffect(() => {
    if (!clientUser) return
    fetch(`${API}/client-portal/tickets`, { headers: authHeaders() })
      .then(r => r.json())
      .then(d => setTickets(Array.isArray(d) ? d : []))
      .catch(() => {})
      .finally(() => setTicketsLoading(false))

    fetch(`${API}/client-portal/support-info`, { headers: authHeaders() })
      .then(r => r.json())
      .then(d => setSupport(d))
      .catch(() => {})
  }, [clientUser])

  const submitTicket = async e => {
    e.preventDefault()
    setSubmitting(true)
    try {
      const r = await fetch(`${API}/client-portal/tickets`, {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify(ticketForm)
      })
      if (r.ok) {
        setTicketForm({ subject: '', message: '' })
        setShowTicketForm(false)
        const { rows } = await fetch(`${API}/client-portal/tickets`, { headers: authHeaders() }).then(x => x.json())
        setTickets(Array.isArray(rows) ? rows : await fetch(`${API}/client-portal/tickets`, { headers: authHeaders() }).then(x => x.json()))
      }
    } catch {}
    setSubmitting(false)
  }

  const handleLogout = () => { logout(); navigate('/client/login') }

  const fmt = v => 'R$ ' + Number(v || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })

  if (authLoading) return (
    <div style={{ minHeight:'100vh', background:'#060606', display:'flex', alignItems:'center', justifyContent:'center' }}>
      <div style={{ width:24, height:24, border:'2px solid white', borderTopColor:'transparent', borderRadius:'50%', animation:'spin 1s linear infinite' }} />
      <style>{`@keyframes spin { to { transform:rotate(360deg) } }`}</style>
    </div>
  )

  if (!clientUser?.client_id) return (
    <div style={{ minHeight:'100vh', background:'#060606', display:'flex', alignItems:'center', justifyContent:'center', padding:'24px' }}>
      <div style={{ textAlign:'center', maxWidth:360 }}>
        <div style={{ width:48, height:48, borderRadius:'50%', background:'rgba(255,255,255,0.05)', display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 16px' }}>
          <TrendingUp size={22} color="rgba(255,255,255,0.4)" />
        </div>
        <h2 style={{ color:'white', fontSize:18, fontWeight:700, marginBottom:8 }}>Conta pendente de vinculação</h2>
        <p style={{ color:'rgba(255,255,255,0.4)', fontSize:13, lineHeight:1.6, marginBottom:24 }}>
          Sua conta ainda não foi vinculada a nenhum cliente.<br />
          Aguarde a agência confirmar o vínculo ou entre em contato pelo suporte.
        </p>
        {support && (
          <a href={`https://wa.me/${support.whatsapp}`} target="_blank" rel="noreferrer"
            style={{ display:'inline-flex', alignItems:'center', gap:8, background:'#25D366', color:'white', textDecoration:'none', padding:'12px 20px', borderRadius:10, fontSize:13, fontWeight:700 }}>
            <PhoneCall size={16} /> Falar com a agência
          </a>
        )}
        <button onClick={handleLogout} style={{ display:'block', margin:'16px auto 0', background:'none', border:'none', color:'rgba(255,255,255,0.3)', fontSize:12, cursor:'pointer' }}>
          Sair
        </button>
      </div>
    </div>
  )

  return (
    <div style={{ minHeight:'100vh', background:'#060606', color:'white' }}>
      <style>{`@keyframes spin { to { transform:rotate(360deg) } }`}</style>

      {/* Header */}
      <div style={{ borderBottom:'1px solid #111', padding:'16px 24px', display:'flex', alignItems:'center', justifyContent:'space-between' }}>
        <div>
          <p style={{ fontSize:11, letterSpacing:4, color:'rgba(255,255,255,0.3)', textTransform:'uppercase', marginBottom:2 }}>Portal do Cliente</p>
          <p style={{ fontSize:15, fontWeight:600 }}>Olá, {clientUser.name?.split(' ')[0]}</p>
        </div>
        <button onClick={handleLogout} style={{ background:'none', border:'1px solid #222', borderRadius:8, padding:'8px 12px', color:'rgba(255,255,255,0.5)', fontSize:12, cursor:'pointer', display:'flex', alignItems:'center', gap:6 }}>
          <LogOut size={13} /> Sair
        </button>
      </div>

      <div style={{ maxWidth:720, margin:'0 auto', padding:'32px 24px' }}>

        {/* Period selector */}
        <div style={{ display:'flex', gap:8, marginBottom:24 }}>
          {PERIODS.map(p => (
            <button key={p.value} onClick={() => setPeriod(p.value)} style={{
              padding:'7px 16px', borderRadius:8, border:'1px solid',
              borderColor: period === p.value ? 'rgba(255,255,255,0.5)' : '#222',
              background: period === p.value ? 'rgba(255,255,255,0.05)' : 'transparent',
              color: period === p.value ? 'white' : 'rgba(255,255,255,0.4)',
              fontSize:12, fontWeight:600, cursor:'pointer', transition:'all .2s'
            }}>
              {p.label}
            </button>
          ))}
        </div>

        {/* Metrics cards */}
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12, marginBottom:32 }}>
          <div style={{ background:'#0e0e0e', border:'1px solid #1a1a1a', borderRadius:14, padding:'20px' }}>
            <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:12 }}>
              <DollarSign size={16} color="rgba(255,255,255,0.3)" />
              <p style={{ fontSize:11, color:'rgba(255,255,255,0.35)', letterSpacing:2, textTransform:'uppercase' }}>Investimento</p>
            </div>
            {metricsLoading
              ? <div style={{ width:20, height:20, border:'2px solid #333', borderTopColor:'white', borderRadius:'50%', animation:'spin 1s linear infinite' }} />
              : <p style={{ fontSize:26, fontWeight:700 }}>{fmt(metrics?.spend)}</p>
            }
          </div>

          <div style={{ background:'#0e0e0e', border:'1px solid #1a1a1a', borderRadius:14, padding:'20px' }}>
            <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:12 }}>
              <TrendingUp size={16} color="rgba(255,255,255,0.3)" />
              <p style={{ fontSize:11, color:'rgba(255,255,255,0.35)', letterSpacing:2, textTransform:'uppercase' }}>Cliques</p>
            </div>
            {metricsLoading
              ? <div style={{ width:20, height:20, border:'2px solid #333', borderTopColor:'white', borderRadius:'50%', animation:'spin 1s linear infinite' }} />
              : <p style={{ fontSize:26, fontWeight:700 }}>{Number(metrics?.clicks || 0).toLocaleString('pt-BR')}</p>
            }
          </div>
        </div>

        {/* Tickets section */}
        <div style={{ marginBottom:16, display:'flex', alignItems:'center', justifyContent:'space-between' }}>
          <div style={{ display:'flex', alignItems:'center', gap:8 }}>
            <MessageSquare size={16} color="rgba(255,255,255,0.4)" />
            <p style={{ fontSize:14, fontWeight:600 }}>Suporte</p>
          </div>
          <button onClick={() => setShowTicketForm(v => !v)} style={{
            background:'white', color:'black', border:'none', borderRadius:8,
            padding:'8px 16px', fontSize:12, fontWeight:700, cursor:'pointer', letterSpacing:1
          }}>
            + Abrir chamado
          </button>
        </div>

        {showTicketForm && (
          <form onSubmit={submitTicket} style={{ background:'#0e0e0e', border:'1px solid #222', borderRadius:12, padding:20, marginBottom:16, display:'flex', flexDirection:'column', gap:12 }}>
            <div>
              <label style={{ display:'block', fontSize:10, color:'rgba(255,255,255,0.35)', marginBottom:6, letterSpacing:2, textTransform:'uppercase' }}>Assunto</label>
              <input value={ticketForm.subject} onChange={e => setTicketForm(f => ({ ...f, subject: e.target.value }))} required
                placeholder="Ex: Dúvida sobre relatório" style={{ width:'100%', background:'#0a0a0a', border:'1px solid #1e1e1e', borderRadius:8, padding:'10px 14px', color:'white', fontSize:13, outline:'none' }} />
            </div>
            <div>
              <label style={{ display:'block', fontSize:10, color:'rgba(255,255,255,0.35)', marginBottom:6, letterSpacing:2, textTransform:'uppercase' }}>Mensagem</label>
              <textarea value={ticketForm.message} onChange={e => setTicketForm(f => ({ ...f, message: e.target.value }))} required rows={4}
                placeholder="Descreva sua dúvida ou solicitação..."
                style={{ width:'100%', background:'#0a0a0a', border:'1px solid #1e1e1e', borderRadius:8, padding:'10px 14px', color:'white', fontSize:13, outline:'none', resize:'vertical', fontFamily:'inherit' }} />
            </div>
            <div style={{ display:'flex', gap:10 }}>
              <button type="submit" disabled={submitting} style={{ background:'white', color:'black', border:'none', borderRadius:8, padding:'10px 20px', fontSize:12, fontWeight:700, cursor:'pointer', display:'flex', alignItems:'center', gap:6 }}>
                <Send size={13} /> {submitting ? 'Enviando...' : 'Enviar'}
              </button>
              <button type="button" onClick={() => setShowTicketForm(false)} style={{ background:'none', border:'none', color:'rgba(255,255,255,0.4)', fontSize:12, cursor:'pointer' }}>
                Cancelar
              </button>
            </div>
          </form>
        )}

        {ticketsLoading ? (
          <div style={{ display:'flex', justifyContent:'center', padding:'32px 0' }}>
            <div style={{ width:20, height:20, border:'2px solid #333', borderTopColor:'white', borderRadius:'50%', animation:'spin 1s linear infinite' }} />
          </div>
        ) : tickets.length === 0 ? (
          <div style={{ background:'#0e0e0e', border:'1px dashed #1a1a1a', borderRadius:12, padding:'32px', textAlign:'center' }}>
            <p style={{ color:'rgba(255,255,255,0.25)', fontSize:13 }}>Nenhum chamado aberto.</p>
          </div>
        ) : (
          <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
            {tickets.map(t => (
              <div key={t.id} style={{ background:'#0e0e0e', border:'1px solid #1a1a1a', borderRadius:12, padding:'16px 20px' }}>
                <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:6 }}>
                  <p style={{ fontSize:14, fontWeight:600 }}>{t.subject}</p>
                  <span style={{
                    fontSize:10, fontWeight:700, letterSpacing:1, textTransform:'uppercase', padding:'3px 10px', borderRadius:6,
                    background: t.status === 'open' ? 'rgba(251,191,36,0.1)' : 'rgba(34,197,94,0.1)',
                    color: t.status === 'open' ? '#fbbf24' : '#22c55e'
                  }}>
                    {t.status === 'open' ? 'Aberto' : 'Resolvido'}
                  </span>
                </div>
                <p style={{ fontSize:13, color:'rgba(255,255,255,0.45)', lineHeight:1.5 }}>{t.message}</p>
                <p style={{ fontSize:11, color:'rgba(255,255,255,0.2)', marginTop:8 }}>
                  {new Date(t.created_at).toLocaleDateString('pt-BR', { day:'2-digit', month:'short', year:'numeric', hour:'2-digit', minute:'2-digit' })}
                </p>
              </div>
            ))}
          </div>
        )}

        {/* Support contact */}
        {support && (
          <div style={{ marginTop:32, background:'#0e0e0e', border:'1px solid #1a1a1a', borderRadius:12, padding:'20px', textAlign:'center' }}>
            <p style={{ fontSize:11, color:'rgba(255,255,255,0.3)', letterSpacing:2, textTransform:'uppercase', marginBottom:12 }}>Contato direto</p>
            <div style={{ display:'flex', gap:12, justifyContent:'center', flexWrap:'wrap' }}>
              <a href={`https://wa.me/${support.whatsapp}`} target="_blank" rel="noreferrer"
                style={{ display:'inline-flex', alignItems:'center', gap:6, background:'#25D366', color:'white', textDecoration:'none', padding:'10px 18px', borderRadius:8, fontSize:12, fontWeight:700 }}>
                <PhoneCall size={14} /> WhatsApp
              </a>
              <a href={`mailto:${support.email}`}
                style={{ display:'inline-flex', alignItems:'center', gap:6, background:'rgba(255,255,255,0.08)', color:'white', textDecoration:'none', padding:'10px 18px', borderRadius:8, fontSize:12, fontWeight:700 }}>
                E-mail
              </a>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
