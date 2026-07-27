import { useState, useEffect, useCallback } from 'react'
import { MessageSquare, RefreshCw, CheckCircle, Clock, AlertCircle, Send, X, ChevronRight } from 'lucide-react'
import api from '../lib/api'

const STATUS_CFG = {
  aberto:       { label: 'Aberto',       color: '#f87171', bg: 'rgba(248,113,113,0.12)' },
  em_andamento: { label: 'Em andamento', color: '#facc15', bg: 'rgba(250,204,21,0.12)' },
  resolvido:    { label: 'Resolvido',    color: '#4ade80', bg: 'rgba(74,222,128,0.12)' },
}

function StatusPill({ status }) {
  const cfg = STATUS_CFG[status] || STATUS_CFG.aberto
  return (
    <span style={{ display:'inline-flex', alignItems:'center', gap:5, padding:'3px 10px', borderRadius:999, fontSize:11, fontWeight:700, letterSpacing:0.5, textTransform:'uppercase', background:cfg.bg, color:cfg.color }}>
      <span style={{ width:5, height:5, borderRadius:'50%', background:cfg.color }} />
      {cfg.label}
    </span>
  )
}

function fmtDate(d) {
  if (!d) return '—'
  return new Date(d).toLocaleString('pt-BR', { day:'2-digit', month:'2-digit', year:'numeric', hour:'2-digit', minute:'2-digit' })
}

export default function Tickets() {
  const [tickets, setTickets]       = useState([])
  const [statusCount, setStatusCount] = useState({})
  const [loading, setLoading]       = useState(true)
  const [selected, setSelected]     = useState(null)
  const [thread, setThread]         = useState(null)
  const [threadLoading, setThreadLoading] = useState(false)
  const [reply, setReply]           = useState('')
  const [sending, setSending]       = useState(false)
  const [statusFilter, setStatusFilter] = useState('all')

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const { data } = await api.get('/tickets')
      setTickets(data.tickets || data)
      setStatusCount(data.status_count || {})
    } catch { }
    setLoading(false)
  }, [])

  useEffect(() => { load() }, [load])

  const openTicket = async (ticket) => {
    setSelected(ticket)
    setThreadLoading(true)
    setThread(null)
    try {
      const { data } = await api.get(`/tickets/${ticket.id}`)
      setThread(data)
    } catch { }
    setThreadLoading(false)
  }

  const sendReply = async () => {
    if (!reply.trim() || !selected) return
    setSending(true)
    try {
      const { data } = await api.post(`/tickets/${selected.id}/messages`, { message: reply })
      setReply('')
      setThread(t => ({ ...t, messages: [...(t.messages || []), data.message] }))
      setTickets(ts => ts.map(t => t.id === selected.id ? { ...t, status: data.status, updated_at: new Date() } : t))
      setSelected(s => ({ ...s, status: data.status }))
    } catch { }
    setSending(false)
  }

  const changeStatus = async (status) => {
    try {
      await api.patch(`/tickets/${selected.id}/status`, { status })
      setTickets(ts => ts.map(t => t.id === selected.id ? { ...t, status } : t))
      setSelected(s => ({ ...s, status }))
      setThread(t => ({ ...t, status }))
    } catch { }
  }

  const filtered = statusFilter === 'all' ? tickets : tickets.filter(t => t.status === statusFilter)

  return (
    <div style={{ display:'flex', height:'100%' }}>
      <style>{`@keyframes spin { to { transform:rotate(360deg) } }`}</style>

      {/* Left panel */}
      <div style={{ width: selected ? 380 : '100%', flexShrink:0, display:'flex', flexDirection:'column', borderRight: selected ? '1px solid rgba(255,255,255,0.06)' : 'none', transition:'width .2s' }}>
        {/* Header */}
        <div style={{ padding:'24px 28px 0', flexShrink:0 }}>
          <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:20 }}>
            <div>
              <h1 style={{ fontSize:22, fontWeight:700, color:'white', margin:0 }}>Chamados</h1>
              <p style={{ fontSize:12, color:'rgba(255,255,255,0.3)', marginTop:4 }}>
                {loading ? 'Carregando...' : `${filtered.length} chamado${filtered.length !== 1 ? 's' : ''}`}
              </p>
            </div>
            <button onClick={load} disabled={loading} style={{ width:34, height:34, borderRadius:8, background:'#1a1a1a', border:'1px solid rgba(255,255,255,0.1)', color:'rgba(255,255,255,0.4)', display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer' }}>
              <RefreshCw size={14} style={{ animation: loading ? 'spin 1s linear infinite' : 'none' }} />
            </button>
          </div>

          {/* Status filter */}
          <div style={{ display:'flex', gap:8, marginBottom:16, flexWrap:'wrap' }}>
            {[
              { k:'all', label:'Todos', count: tickets.length },
              { k:'aberto', label:'Abertos', count: statusCount.aberto || 0 },
              { k:'em_andamento', label:'Em andamento', count: statusCount.em_andamento || 0 },
              { k:'resolvido', label:'Resolvidos', count: statusCount.resolvido || 0 },
            ].map(({ k, label, count }) => (
              <button key={k} onClick={() => setStatusFilter(k)}
                style={{ display:'flex', alignItems:'center', gap:6, padding:'5px 12px', borderRadius:8, border:'1px solid', fontSize:12, fontWeight:600, cursor:'pointer', transition:'all .15s',
                  background: statusFilter === k ? 'rgba(167,139,250,0.15)' : 'rgba(255,255,255,0.03)',
                  borderColor: statusFilter === k ? 'rgba(167,139,250,0.4)' : 'rgba(255,255,255,0.08)',
                  color: statusFilter === k ? '#a78bfa' : 'rgba(255,255,255,0.4)' }}>
                {label}
                <span style={{ background:'rgba(255,255,255,0.08)', borderRadius:99, padding:'0 6px', fontSize:10 }}>{count}</span>
              </button>
            ))}
          </div>
        </div>

        {/* List */}
        <div style={{ flex:1, overflowY:'auto', padding:'0 28px 28px' }}>
          {loading ? (
            <div style={{ display:'flex', justifyContent:'center', paddingTop:60 }}>
              <RefreshCw size={20} color="rgba(255,255,255,0.2)" style={{ animation:'spin 1s linear infinite' }} />
            </div>
          ) : filtered.length === 0 ? (
            <div style={{ textAlign:'center', padding:'60px 0', color:'rgba(255,255,255,0.2)', fontSize:13 }}>
              <MessageSquare size={28} style={{ margin:'0 auto 12px', opacity:0.3 }} />
              <p>Nenhum chamado encontrado.</p>
            </div>
          ) : (
            <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
              {filtered.map(ticket => (
                <div key={ticket.id} onClick={() => openTicket(ticket)}
                  style={{ padding:'14px 16px', borderRadius:10, border:'1px solid', cursor:'pointer', transition:'all .15s',
                    background: selected?.id === ticket.id ? 'rgba(167,139,250,0.08)' : 'rgba(255,255,255,0.02)',
                    borderColor: selected?.id === ticket.id ? 'rgba(167,139,250,0.3)' : 'rgba(255,255,255,0.06)' }}>
                  <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', gap:8 }}>
                    <div style={{ flex:1, minWidth:0 }}>
                      <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:4 }}>
                        <StatusPill status={ticket.status} />
                        <span style={{ fontSize:10, color:'rgba(255,255,255,0.2)' }}>#{ticket.id}</span>
                      </div>
                      <p style={{ fontSize:13, fontWeight:600, color:'rgba(255,255,255,0.88)', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{ticket.subject}</p>
                      <p style={{ fontSize:11, color:'rgba(255,255,255,0.35)', marginTop:3 }}>{ticket.client_name} · {ticket.client_user_name || ticket.client_user_email}</p>
                    </div>
                    <ChevronRight size={14} color="rgba(255,255,255,0.2)" style={{ flexShrink:0, marginTop:4 }} />
                  </div>
                  <p style={{ fontSize:10, color:'rgba(255,255,255,0.2)', marginTop:8 }}>{fmtDate(ticket.created_at)}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Right panel — thread */}
      {selected && (
        <div style={{ flex:1, display:'flex', flexDirection:'column', minWidth:0 }}>
          {/* Thread header */}
          <div style={{ padding:'20px 24px', borderBottom:'1px solid rgba(255,255,255,0.06)', flexShrink:0, display:'flex', alignItems:'flex-start', justifyContent:'space-between', gap:12 }}>
            <div style={{ flex:1, minWidth:0 }}>
              <p style={{ fontSize:10, color:'rgba(255,255,255,0.3)', letterSpacing:1.5, textTransform:'uppercase', marginBottom:5 }}>Chamado #{selected.id}</p>
              <h2 style={{ fontSize:16, fontWeight:700, color:'white', margin:0 }}>{selected.subject}</h2>
              <p style={{ fontSize:12, color:'rgba(255,255,255,0.35)', marginTop:4 }}>{selected.client_name} · {selected.client_user_name || selected.client_user_email}</p>
            </div>
            <div style={{ display:'flex', alignItems:'center', gap:8, flexShrink:0 }}>
              <select value={thread?.status || selected.status}
                onChange={e => changeStatus(e.target.value)}
                style={{ background:'#1a1a1a', border:'1px solid rgba(255,255,255,0.1)', borderRadius:8, padding:'6px 10px', color:'white', fontSize:12, outline:'none', cursor:'pointer' }}>
                <option value="aberto">Aberto</option>
                <option value="em_andamento">Em andamento</option>
                <option value="resolvido">Resolvido</option>
              </select>
              <button onClick={() => setSelected(null)} style={{ width:30, height:30, borderRadius:6, background:'rgba(255,255,255,0.05)', border:'1px solid rgba(255,255,255,0.08)', color:'rgba(255,255,255,0.4)', display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer' }}>
                <X size={13} />
              </button>
            </div>
          </div>

          {/* Messages */}
          <div style={{ flex:1, overflowY:'auto', padding:'20px 24px', display:'flex', flexDirection:'column', gap:12 }}>
            {threadLoading ? (
              <div style={{ display:'flex', justifyContent:'center', paddingTop:40 }}>
                <RefreshCw size={18} color="rgba(255,255,255,0.2)" style={{ animation:'spin 1s linear infinite' }} />
              </div>
            ) : (
              <>
                {/* Original message */}
                {thread && (
                  <div style={{ alignSelf:'flex-start', maxWidth:'75%' }}>
                    <p style={{ fontSize:10, color:'rgba(255,255,255,0.25)', marginBottom:5 }}>
                      {thread.client_user_name || thread.client_user_email} · {fmtDate(thread.created_at)}
                    </p>
                    <div style={{ background:'rgba(255,255,255,0.05)', border:'1px solid rgba(255,255,255,0.08)', borderRadius:'12px 12px 12px 4px', padding:'12px 16px' }}>
                      <p style={{ fontSize:13, color:'rgba(255,255,255,0.85)', lineHeight:1.6 }}>{thread.message}</p>
                    </div>
                  </div>
                )}
                {/* Thread messages */}
                {thread?.messages?.map(msg => (
                  <div key={msg.id} style={{ alignSelf: msg.sender_type === 'agency' ? 'flex-end' : 'flex-start', maxWidth:'75%' }}>
                    <p style={{ fontSize:10, color:'rgba(255,255,255,0.25)', marginBottom:5, textAlign: msg.sender_type === 'agency' ? 'right' : 'left' }}>
                      {msg.sender_name} · {fmtDate(msg.created_at)}
                    </p>
                    <div style={{ background: msg.sender_type === 'agency' ? 'rgba(167,139,250,0.15)' : 'rgba(255,255,255,0.05)', border:`1px solid ${msg.sender_type === 'agency' ? 'rgba(167,139,250,0.25)' : 'rgba(255,255,255,0.08)'}`, borderRadius: msg.sender_type === 'agency' ? '12px 12px 4px 12px' : '12px 12px 12px 4px', padding:'12px 16px' }}>
                      <p style={{ fontSize:13, color:'rgba(255,255,255,0.85)', lineHeight:1.6 }}>{msg.message}</p>
                    </div>
                  </div>
                ))}
              </>
            )}
          </div>

          {/* Reply box */}
          <div style={{ padding:'16px 24px', borderTop:'1px solid rgba(255,255,255,0.06)', flexShrink:0 }}>
            <div style={{ display:'flex', gap:10 }}>
              <textarea
                value={reply}
                onChange={e => setReply(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) sendReply() }}
                placeholder="Digite sua resposta... (Ctrl+Enter para enviar)"
                rows={3}
                style={{ flex:1, background:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.1)', borderRadius:10, padding:'12px 14px', color:'white', fontSize:13, outline:'none', resize:'none', lineHeight:1.5 }}
              />
              <button onClick={sendReply} disabled={!reply.trim() || sending}
                style={{ width:44, alignSelf:'flex-end', height:44, borderRadius:10, background: reply.trim() ? '#a78bfa' : 'rgba(255,255,255,0.05)', border:'none', color:'white', display:'flex', alignItems:'center', justifyContent:'center', cursor: reply.trim() ? 'pointer' : 'default', transition:'all .15s', flexShrink:0 }}>
                {sending ? <RefreshCw size={16} style={{ animation:'spin 1s linear infinite' }} /> : <Send size={16} />}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
