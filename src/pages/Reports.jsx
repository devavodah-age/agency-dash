import { useState, useEffect, useCallback } from 'react'
import { FileText, RefreshCw, Sparkles, Trash2, Download, X, TrendingUp, Users, MousePointer, DollarSign, Bot, Play, ToggleLeft, ToggleRight, Mail, Clock } from 'lucide-react'
import api from '../lib/api'

const PERIODS = [
  { key: 'today',      label: 'Hoje' },
  { key: 'last_7d',    label: 'Últimos 7 dias' },
  { key: 'last_30d',   label: 'Últimos 30 dias' },
  { key: 'this_month', label: 'Este mês' },
]

function fmtBRL(v) {
  if (!v && v !== 0) return '—'
  return 'R$\u00a0' + Number(v).toLocaleString('pt-BR', { minimumFractionDigits:2, maximumFractionDigits:2 })
}
function fmtInt(v) { return v != null ? Number(v).toLocaleString('pt-BR') : '—' }
function fmtDate(d) {
  if (!d) return '—'
  return new Date(d).toLocaleDateString('pt-BR', { day:'2-digit', month:'2-digit', year:'numeric' })
}

function MetricCard({ icon: Icon, label, value, color }) {
  return (
    <div style={{ background:'rgba(255,255,255,0.03)', border:'1px solid rgba(255,255,255,0.06)', borderRadius:12, padding:'16px 20px', display:'flex', alignItems:'center', gap:14 }}>
      <div style={{ width:40, height:40, borderRadius:10, background:`${color}18`, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
        <Icon size={18} color={color} />
      </div>
      <div>
        <p style={{ fontSize:10, color:'rgba(255,255,255,0.3)', letterSpacing:1.5, textTransform:'uppercase', marginBottom:4 }}>{label}</p>
        <p style={{ fontSize:18, fontWeight:700, color:'white' }}>{value}</p>
      </div>
    </div>
  )
}

function ReportView({ report, onClose, onDelete }) {
  const m = report.metrics || {}
  const ai = report.ai_content || {}

  const printReport = () => {
    const win = window.open('', '_blank')
    const topRows = (m.top_campaigns||[]).map(c=>`
      <tr>
        <td style="padding:10px 14px;border-bottom:1px solid #f0f0f0;font-size:13px;color:#222;max-width:200px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${c.name}</td>
        <td style="padding:10px 14px;border-bottom:1px solid #f0f0f0;font-size:13px;color:#444;font-weight:600">R$ ${Number(c.spend||0).toFixed(2).replace('.',',')}</td>
        <td style="padding:10px 14px;border-bottom:1px solid #f0f0f0;font-size:13px;color:#444">${c.results??c.leads??0}</td>
        <td style="padding:10px 14px;border-bottom:1px solid #f0f0f0;font-size:13px;color:#444">${(c.cost_per_result??c.cpl) ? 'R$ '+Number(c.cost_per_result??c.cpl).toFixed(2).replace('.',',') : '—'}</td>
      </tr>`).join('')

    win.document.write(`<!DOCTYPE html><html><head><title>${report.title}</title>
    <style>
      * { margin:0; padding:0; box-sizing:border-box; }
      body { background:#fff; color:#111; font-family:Arial,sans-serif; max-width:760px; margin:0 auto; padding:48px 40px; }
      .header-bar { background:#0d0d0d; border-radius:12px; padding:28px 32px; margin-bottom:28px; -webkit-print-color-adjust:exact; print-color-adjust:exact; }
      .header-bar .agency { font-size:10px; color:rgba(255,255,255,0.4); letter-spacing:2px; text-transform:uppercase; margin-bottom:10px; }
      .header-bar .manchete { font-size:26px; font-weight:700; color:#fff; margin-bottom:6px; line-height:1.3; }
      .header-bar .subtitle { font-size:13px; color:rgba(255,255,255,0.45); }
      .metrics { display:grid; grid-template-columns:repeat(4,1fr); gap:12px; margin-bottom:24px; }
      .metric { border:2px solid #f0f0f0; border-radius:10px; padding:14px 16px; }
      .metric .lbl { font-size:9px; color:#888; text-transform:uppercase; letter-spacing:1.5px; margin-bottom:6px; font-weight:600; }
      .metric .val { font-size:20px; font-weight:700; color:#111; }
      .metric.purple { border-color:#7c3aed; }
      .metric.purple .lbl { color:#7c3aed; }
      .section { margin-bottom:20px; }
      .section-title { font-size:10px; font-weight:700; letter-spacing:1.5px; text-transform:uppercase; padding-bottom:8px; border-bottom:2px solid #f0f0f0; margin-bottom:14px; color:#555; }
      .resumo { background:#faf8ff; border-left:4px solid #7c3aed; border-radius:0 8px 8px 0; padding:16px 18px; margin-bottom:20px; }
      .resumo p { font-size:14px; color:#333; line-height:1.75; }
      .grid2 { display:grid; grid-template-columns:1fr 1fr; gap:16px; margin-bottom:20px; }
      .card-green { background:#f0fdf4; border:1px solid #bbf7d0; border-radius:10px; padding:16px 18px; }
      .card-yellow { background:#fffbeb; border:1px solid #fde68a; border-radius:10px; padding:16px 18px; }
      .card-title-green { font-size:10px; font-weight:700; color:#16a34a; text-transform:uppercase; letter-spacing:1px; margin-bottom:10px; }
      .card-title-yellow { font-size:10px; font-weight:700; color:#d97706; text-transform:uppercase; letter-spacing:1px; margin-bottom:10px; }
      ul { list-style:none; padding:0; }
      li { font-size:13px; color:#333; line-height:1.6; margin-bottom:8px; padding-left:18px; position:relative; }
      li::before { position:absolute; left:0; }
      li.green::before { content:"✓"; color:#16a34a; font-weight:700; }
      li.yellow::before { content:"→"; color:#d97706; font-weight:700; }
      table { width:100%; border-collapse:collapse; }
      th { padding:10px 14px; text-align:left; font-size:10px; font-weight:700; letter-spacing:1px; text-transform:uppercase; color:#888; background:#f9f9f9; border-bottom:2px solid #eee; }
      .conclusao { font-size:13px; color:#555; line-height:1.7; font-style:italic; border-top:1px solid #f0f0f0; padding-top:20px; margin-top:4px; }
      .footer { margin-top:36px; padding-top:16px; border-top:1px solid #eee; font-size:11px; color:#aaa; text-align:center; }
      @media print { body { padding:24px 28px; } .header-bar { -webkit-print-color-adjust:exact; print-color-adjust:exact; } }
    </style></head><body>

    <div class="header-bar">
      <div class="agency">Agência Avodah · Relatório de Performance</div>
      <div class="manchete">${ai.manchete || report.title}</div>
      <div class="subtitle">${report.period_label || report.period} &nbsp;·&nbsp; Gerado em ${fmtDate(report.created_at)}</div>
    </div>

    <div class="metrics">
      <div class="metric purple"><div class="lbl">Valor investido</div><div class="val">R$ ${Number(m.total_spend||0).toFixed(2).replace('.',',')}</div></div>
      <div class="metric"><div class="lbl">${m.result_label||'Resultados'}</div><div class="val">${m.total_results??m.total_leads??0}</div></div>
      <div class="metric"><div class="lbl">Custo por resultado</div><div class="val">${(m.cost_per_result??m.avg_cpl) ? 'R$ '+Number(m.cost_per_result??m.avg_cpl).toFixed(2).replace('.',',') : '—'}</div></div>
      <div class="metric"><div class="lbl">Cliques nos anúncios</div><div class="val">${Number(m.total_clicks||0).toLocaleString('pt-BR')}</div></div>
    </div>

    ${ai.resumo_executivo ? `<div class="resumo"><p>${ai.resumo_executivo}</p></div>` : ''}

    <div class="grid2">
      ${ai.destaques?.length ? `<div class="card-green">
        <div class="card-title-green">✓ Destaques do período</div>
        <ul>${ai.destaques.map(d=>`<li class="green">${d}</li>`).join('')}</ul>
      </div>` : ''}
      ${ai.recomendacoes?.length ? `<div class="card-yellow">
        <div class="card-title-yellow">→ O que fazer agora</div>
        <ul>${ai.recomendacoes.map(r=>`<li class="yellow">${r}</li>`).join('')}</ul>
      </div>` : ''}
    </div>

    ${m.top_campaigns?.length ? `<div class="section">
      <div class="section-title">Campanhas em destaque</div>
      <table><thead><tr>
        <th>Campanha</th><th>Valor investido</th><th>${m.result_label||'Resultados'}</th><th>Custo por resultado</th>
      </tr></thead><tbody>${topRows}</tbody></table>
    </div>` : ''}

    ${ai.conclusao ? `<p class="conclusao">"${ai.conclusao}"</p>` : ''}

    <div class="footer">Relatório gerado pela Agência Avodah &nbsp;·&nbsp; ${report.title}</div>
    </body></html>`)
    win.document.close()
    win.print()
  }

  return (
    <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.85)', backdropFilter:'blur(4px)', zIndex:1000, display:'flex', alignItems:'flex-start', justifyContent:'center', overflowY:'auto', padding:'40px 20px' }}>
      <div style={{ width:'100%', maxWidth:760, background:'#111', borderRadius:16, border:'1px solid rgba(255,255,255,0.1)', overflow:'hidden' }}>
        {/* Modal header */}
        <div style={{ padding:'20px 24px', borderBottom:'1px solid rgba(255,255,255,0.06)', display:'flex', alignItems:'center', justifyContent:'space-between' }}>
          <div>
            <p style={{ fontSize:10, color:'rgba(255,255,255,0.3)', letterSpacing:1.5, textTransform:'uppercase', marginBottom:4 }}>Relatório · {report.period_label || report.period}</p>
            <h2 style={{ fontSize:18, fontWeight:700, color:'white', margin:0 }}>{ai.manchete || report.title}</h2>
          </div>
          <div style={{ display:'flex', gap:8 }}>
            <button onClick={printReport} style={{ display:'flex', alignItems:'center', gap:6, padding:'7px 14px', borderRadius:8, background:'rgba(255,255,255,0.05)', border:'1px solid rgba(255,255,255,0.1)', color:'rgba(255,255,255,0.6)', fontSize:12, fontWeight:600, cursor:'pointer' }}>
              <Download size={13} /> Exportar PDF
            </button>
            <button onClick={() => onDelete(report.id)} style={{ width:32, height:32, borderRadius:8, background:'rgba(248,113,113,0.08)', border:'1px solid rgba(248,113,113,0.2)', color:'#f87171', display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer' }}>
              <Trash2 size={13} />
            </button>
            <button onClick={onClose} style={{ width:32, height:32, borderRadius:8, background:'rgba(255,255,255,0.05)', border:'1px solid rgba(255,255,255,0.08)', color:'rgba(255,255,255,0.4)', display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer' }}>
              <X size={13} />
            </button>
          </div>
        </div>

        {/* Content */}
        <div style={{ padding:'24px' }}>
          {/* Metrics grid */}
          <div style={{ display:'grid', gridTemplateColumns:'repeat(2,1fr)', gap:12, marginBottom:24 }}>
            <MetricCard icon={DollarSign}   label="Valor investido"                   value={fmtBRL(m.total_spend)} color="#a78bfa" />
            <MetricCard icon={Users}        label={m.result_label || 'Resultados'}   value={fmtInt(m.total_results ?? m.total_leads)} color="#4ade80" />
            <MetricCard icon={TrendingUp}   label="Custo por resultado"              value={fmtBRL(m.cost_per_result ?? m.avg_cpl)} color="#facc15" />
            <MetricCard icon={MousePointer} label="Cliques nos anúncios"             value={fmtInt(m.total_clicks)} color="#60a5fa" />
          </div>

          {/* AI content */}
          {ai.resumo_executivo && (
            <div style={{ marginBottom:20, padding:'16px 20px', background:'rgba(167,139,250,0.06)', border:'1px solid rgba(167,139,250,0.15)', borderRadius:12 }}>
              <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:10 }}>
                <Sparkles size={14} color="#a78bfa" />
                <p style={{ fontSize:12, fontWeight:700, color:'#a78bfa', letterSpacing:0.5, textTransform:'uppercase' }}>Resumo Executivo</p>
              </div>
              <p style={{ fontSize:14, color:'rgba(255,255,255,0.75)', lineHeight:1.7 }}>{ai.resumo_executivo}</p>
            </div>
          )}

          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:16, marginBottom:20 }}>
            {ai.destaques?.length > 0 && (
              <div style={{ padding:'16px 20px', background:'rgba(74,222,128,0.05)', border:'1px solid rgba(74,222,128,0.12)', borderRadius:12 }}>
                <p style={{ fontSize:11, fontWeight:700, color:'#4ade80', letterSpacing:1, textTransform:'uppercase', marginBottom:12 }}>Destaques</p>
                <ul style={{ listStyle:'none', padding:0, margin:0, display:'flex', flexDirection:'column', gap:8 }}>
                  {ai.destaques.map((d, i) => (
                    <li key={i} style={{ display:'flex', gap:8, fontSize:13, color:'rgba(255,255,255,0.7)', lineHeight:1.5 }}>
                      <span style={{ color:'#4ade80', flexShrink:0 }}>✓</span> {d}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {ai.recomendacoes?.length > 0 && (
              <div style={{ padding:'16px 20px', background:'rgba(250,204,21,0.05)', border:'1px solid rgba(250,204,21,0.12)', borderRadius:12 }}>
                <p style={{ fontSize:11, fontWeight:700, color:'#facc15', letterSpacing:1, textTransform:'uppercase', marginBottom:12 }}>Recomendações</p>
                <ul style={{ listStyle:'none', padding:0, margin:0, display:'flex', flexDirection:'column', gap:8 }}>
                  {ai.recomendacoes.map((r, i) => (
                    <li key={i} style={{ display:'flex', gap:8, fontSize:13, color:'rgba(255,255,255,0.7)', lineHeight:1.5 }}>
                      <span style={{ color:'#facc15', flexShrink:0 }}>→</span> {r}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* Top campaigns */}
          {m.top_campaigns?.length > 0 && (
            <div style={{ marginBottom:20 }}>
              <p style={{ fontSize:11, fontWeight:700, color:'rgba(255,255,255,0.3)', letterSpacing:1.5, textTransform:'uppercase', marginBottom:12 }}>Campanhas em Destaque</p>
              <div style={{ background:'#0d0d0d', borderRadius:10, overflow:'hidden', border:'1px solid rgba(255,255,255,0.06)' }}>
                <table style={{ width:'100%', borderCollapse:'collapse' }}>
                  <thead>
                    <tr>
                      {['Campanha','Valor investido', m.result_label||'Resultados','Custo por resultado'].map(h => (
                        <th key={h} style={{ padding:'10px 14px', textAlign:'left', fontSize:10, fontWeight:700, letterSpacing:1.5, textTransform:'uppercase', color:'rgba(255,255,255,0.3)', borderBottom:'1px solid rgba(255,255,255,0.06)', background:'rgba(255,255,255,0.02)' }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {m.top_campaigns.map((c, i) => (
                      <tr key={i}>
                        <td style={{ padding:'11px 14px', fontSize:13, color:'rgba(255,255,255,0.8)', borderBottom:'1px solid rgba(255,255,255,0.04)', maxWidth:200, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{c.name}</td>
                        <td style={{ padding:'11px 14px', fontSize:13, color:'rgba(255,255,255,0.6)', borderBottom:'1px solid rgba(255,255,255,0.04)', fontFamily:'monospace' }}>{fmtBRL(c.spend)}</td>
                        <td style={{ padding:'11px 14px', fontSize:13, color:'rgba(255,255,255,0.6)', borderBottom:'1px solid rgba(255,255,255,0.04)' }}>{c.results ?? c.leads ?? '—'}</td>
                        <td style={{ padding:'11px 14px', fontSize:13, color:'rgba(255,255,255,0.6)', borderBottom:'1px solid rgba(255,255,255,0.04)', fontFamily:'monospace' }}>{fmtBRL(c.cost_per_result ?? c.cpl)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {ai.conclusao && (
            <div style={{ padding:'14px 18px', background:'rgba(255,255,255,0.02)', border:'1px solid rgba(255,255,255,0.06)', borderRadius:10 }}>
              <p style={{ fontSize:13, color:'rgba(255,255,255,0.5)', lineHeight:1.7, fontStyle:'italic' }}>"{ai.conclusao}"</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default function Reports() {
  const [clients, setClients]         = useState([])
  const [reports, setReports]         = useState([])
  const [loading, setLoading]         = useState(true)
  const [generating, setGenerating]   = useState(false)
  const [genError, setGenError]       = useState(null)
  const [selectedClient, setSelectedClient] = useState('')
  const [period, setPeriod]           = useState('last_30d')
  const [viewReport, setViewReport]   = useState(null)
  const [activeTab, setActiveTab]     = useState('reports') // 'reports' | 'agent'
  const [agentClients, setAgentClients] = useState([])
  const [agentLoading, setAgentLoading] = useState(false)
  const [running, setRunning]         = useState({})
  const [editEmail, setEditEmail]     = useState({})

  const loadReports = useCallback(async () => {
    setLoading(true)
    try {
      const { data } = await api.get('/reports')
      setReports(Array.isArray(data) ? data : [])
    } catch { }
    setLoading(false)
  }, [])

  const loadAgentConfig = useCallback(async () => {
    setAgentLoading(true)
    try {
      const { data } = await api.get('/agent/config')
      setAgentClients(data)
    } catch { }
    setAgentLoading(false)
  }, [])

  useEffect(() => {
    api.get('/traffic/clients').then(r => { setClients(r.data); if (r.data[0]) setSelectedClient(String(r.data[0].id)) }).catch(() => {})
    loadReports()
    loadAgentConfig()
  }, [loadReports, loadAgentConfig])

  const toggleAgent = async (client) => {
    const newVal = !client.auto_report_enabled
    setAgentClients(prev => prev.map(c => c.id === client.id ? { ...c, auto_report_enabled: newVal } : c))
    try {
      await api.put(`/agent/config/${client.id}`, { auto_report_enabled: newVal })
    } catch { setAgentClients(prev => prev.map(c => c.id === client.id ? { ...c, auto_report_enabled: !newVal } : c)) }
  }

  const saveEmail = async (client) => {
    const email = editEmail[client.id] !== undefined ? editEmail[client.id] : client.report_email
    try {
      const { data } = await api.put(`/agent/config/${client.id}`, { report_email: email })
      setAgentClients(prev => prev.map(c => c.id === client.id ? { ...c, ...data } : c))
      setEditEmail(e => { const n = {...e}; delete n[client.id]; return n })
    } catch { }
  }

  const savePeriod = async (client, period) => {
    try {
      const { data } = await api.put(`/agent/config/${client.id}`, { report_period: period })
      setAgentClients(prev => prev.map(c => c.id === client.id ? { ...c, ...data } : c))
    } catch { }
  }

  const runNow = async (client) => {
    setRunning(r => ({ ...r, [client.id]: true }))
    try {
      await api.post('/agent/run', { client_id: client.id })
      await loadAgentConfig()
      alert(`Relatório enviado para ${client.report_email || client.email}!`)
    } catch (err) { alert(err.response?.data?.error || 'Erro ao executar agente') }
    setRunning(r => ({ ...r, [client.id]: false }))
  }

  const generate = async () => {
    if (!selectedClient) return
    setGenerating(true); setGenError(null)
    try {
      const { data } = await api.post('/reports/generate', { client_id: parseInt(selectedClient), period })
      setReports(prev => [data, ...prev])
      setViewReport(data)
    } catch (err) {
      setGenError(err.response?.data?.error || 'Erro ao gerar relatório')
    }
    setGenerating(false)
  }

  const deleteReport = async (id) => {
    if (!confirm('Deletar este relatório?')) return
    try {
      await api.delete(`/reports/${id}`)
      setReports(prev => prev.filter(r => r.id !== id))
      if (viewReport?.id === id) setViewReport(null)
    } catch { }
  }

  const openReport = async (report) => {
    try {
      const { data } = await api.get(`/reports/${report.id}`)
      setViewReport(data)
    } catch { setViewReport(report) }
  }

  return (
    <div style={{ display:'flex', flexDirection:'column', height:'100%' }}>
      <style>{`@keyframes spin { to { transform:rotate(360deg) } }`}</style>

      {/* Header */}
      <div style={{ padding:'24px 28px 0', flexShrink:0, borderBottom:'1px solid rgba(255,255,255,0.06)' }}>
        <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', flexWrap:'wrap', gap:16, marginBottom:20 }}>
          <div>
            <h1 style={{ fontSize:22, fontWeight:700, color:'white', margin:0 }}>Relatórios</h1>
            <p style={{ fontSize:12, color:'rgba(255,255,255,0.3)', marginTop:4 }}>Gere e envie relatórios de desempenho para os clientes</p>
          </div>

          {activeTab === 'reports' && (
            <div style={{ display:'flex', alignItems:'center', gap:10, flexWrap:'wrap' }}>
              <select value={selectedClient} onChange={e => setSelectedClient(e.target.value)}
                style={{ background:'#1a1a1a', border:'1px solid rgba(255,255,255,0.1)', borderRadius:8, padding:'7px 12px', color:'white', fontSize:12, outline:'none', cursor:'pointer' }}>
                <option value="">Selecionar cliente</option>
                {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
              <div style={{ display:'flex', background:'#1a1a1a', border:'1px solid rgba(255,255,255,0.1)', borderRadius:8, overflow:'hidden' }}>
                {PERIODS.map(p => (
                  <button key={p.key} onClick={() => setPeriod(p.key)}
                    style={{ padding:'7px 12px', border:'none', fontSize:11, fontWeight:600, cursor:'pointer', transition:'all .15s', background: period === p.key ? '#a78bfa' : 'transparent', color: period === p.key ? 'white' : 'rgba(255,255,255,0.35)' }}>{p.label}</button>
                ))}
              </div>
              <button onClick={generate} disabled={generating || !selectedClient}
                style={{ display:'flex', alignItems:'center', gap:7, padding:'7px 18px', borderRadius:8, background: selectedClient ? 'rgba(167,139,250,0.15)' : 'rgba(255,255,255,0.04)', border:`1px solid ${selectedClient ? 'rgba(167,139,250,0.4)' : 'rgba(255,255,255,0.08)'}`, color: selectedClient ? '#a78bfa' : 'rgba(255,255,255,0.3)', fontSize:12, fontWeight:700, cursor: selectedClient ? 'pointer' : 'default', opacity: generating ? 0.7 : 1, transition:'all .15s' }}>
                {generating ? <><RefreshCw size={13} style={{ animation:'spin 1s linear infinite' }} /> Gerando...</> : <><Sparkles size={13} /> Gerar Relatório</>}
              </button>
            </div>
          )}
        </div>

        {/* Tabs */}
        <div style={{ display:'flex', gap:0 }}>
          {[{k:'reports',label:'Relatórios',icon:FileText},{k:'agent',label:'Automações',icon:Bot}].map(({k,label,icon:Icon}) => (
            <button key={k} onClick={() => setActiveTab(k)} style={{ display:'flex', alignItems:'center', gap:7, padding:'10px 20px', border:'none', background:'none', cursor:'pointer', fontSize:13, fontWeight:600, transition:'all .15s', color: activeTab === k ? 'white' : 'rgba(255,255,255,0.3)', borderBottom: activeTab === k ? '2px solid #a78bfa' : '2px solid transparent', marginBottom:-1 }}>
              <Icon size={14} /> {label}
            </button>
          ))}
        </div>

        {genError && (
          <div style={{ marginTop:12, padding:'10px 14px', background:'rgba(248,113,113,0.08)', border:'1px solid rgba(248,113,113,0.2)', borderRadius:8, color:'#f87171', fontSize:13 }}>
            {genError}
          </div>
        )}
      </div>

      {/* Reports list */}
      {activeTab === 'reports' && <div style={{ flex:1, overflowY:'auto', padding:'20px 28px' }}>
        {loading ? (
          <div style={{ display:'flex', justifyContent:'center', paddingTop:60 }}>
            <RefreshCw size={20} color="rgba(255,255,255,0.2)" style={{ animation:'spin 1s linear infinite' }} />
          </div>
        ) : reports.length === 0 ? (
          <div style={{ textAlign:'center', padding:'60px 0', color:'rgba(255,255,255,0.2)' }}>
            <FileText size={28} style={{ margin:'0 auto 12px', opacity:0.3 }} />
            <p style={{ fontSize:13 }}>Nenhum relatório gerado ainda.</p>
            <p style={{ fontSize:12, marginTop:6 }}>Selecione um cliente e clique em "Gerar Relatório".</p>
          </div>
        ) : (
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(320px, 1fr))', gap:16 }}>
            {reports.map(report => (
              <div key={report.id}
                style={{ background:'rgba(255,255,255,0.02)', border:'1px solid rgba(255,255,255,0.06)', borderRadius:12, padding:'18px 20px', cursor:'pointer', transition:'all .15s' }}
                onMouseEnter={e => { e.currentTarget.style.borderColor='rgba(167,139,250,0.3)'; e.currentTarget.style.background='rgba(167,139,250,0.04)' }}
                onMouseLeave={e => { e.currentTarget.style.borderColor='rgba(255,255,255,0.06)'; e.currentTarget.style.background='rgba(255,255,255,0.02)' }}
                onClick={() => openReport(report)}>
                <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', gap:8, marginBottom:12 }}>
                  <div style={{ width:36, height:36, borderRadius:9, background:'rgba(167,139,250,0.12)', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                    <FileText size={16} color="#a78bfa" />
                  </div>
                  <button onClick={e => { e.stopPropagation(); deleteReport(report.id) }}
                    style={{ width:28, height:28, borderRadius:6, background:'rgba(248,113,113,0.08)', border:'1px solid rgba(248,113,113,0.15)', color:'#f87171', display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer', flexShrink:0 }}>
                    <Trash2 size={11} />
                  </button>
                </div>
                <p style={{ fontSize:14, fontWeight:600, color:'rgba(255,255,255,0.88)', marginBottom:4, lineHeight:1.4 }}>{report.title}</p>
                <p style={{ fontSize:11, color:'rgba(255,255,255,0.3)', marginBottom:10 }}>{report.client_name} · {fmtDate(report.created_at)}</p>
                {report.summary && (
                  <p style={{ fontSize:12, color:'rgba(255,255,255,0.4)', lineHeight:1.6, overflow:'hidden', display:'-webkit-box', WebkitLineClamp:2, WebkitBoxOrient:'vertical' }}>{report.summary}</p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>}

      {/* Agent tab */}
      {activeTab === 'agent' && (
        <div style={{ flex:1, overflowY:'auto', padding:'20px 28px' }}>
          <div style={{ marginBottom:20, padding:'14px 18px', background:'rgba(167,139,250,0.06)', border:'1px solid rgba(167,139,250,0.15)', borderRadius:10, display:'flex', alignItems:'center', gap:10 }}>
            <Bot size={16} color="#a78bfa" />
            <p style={{ fontSize:13, color:'rgba(255,255,255,0.6)', margin:0 }}>
              O agente roda todo dia às <strong style={{color:'#a78bfa'}}>8h</strong> e envia o relatório automaticamente por email. Configure o email e o período por cliente abaixo.
            </p>
          </div>

          {agentLoading ? (
            <div style={{ display:'flex', justifyContent:'center', paddingTop:60 }}>
              <RefreshCw size={20} color="rgba(255,255,255,0.2)" style={{ animation:'spin 1s linear infinite' }} />
            </div>
          ) : (
            <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
              {agentClients.filter(c => c.meta_account_id).map(client => (
                <div key={client.id} style={{ background:'rgba(255,255,255,0.02)', border:'1px solid rgba(255,255,255,0.06)', borderRadius:12, padding:'16px 20px' }}>
                  <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', flexWrap:'wrap', gap:12 }}>
                    <div style={{ display:'flex', alignItems:'center', gap:14 }}>
                      {/* Toggle */}
                      <button onClick={() => toggleAgent(client)} style={{ background:'none', border:'none', cursor:'pointer', color: client.auto_report_enabled ? '#4ade80' : 'rgba(255,255,255,0.2)', padding:0, display:'flex' }}>
                        {client.auto_report_enabled ? <ToggleRight size={28} /> : <ToggleLeft size={28} />}
                      </button>
                      <div>
                        <p style={{ fontSize:14, fontWeight:600, color:'rgba(255,255,255,0.88)', margin:0 }}>{client.name}</p>
                        <p style={{ fontSize:11, color:'rgba(255,255,255,0.3)', marginTop:2 }}>
                          {client.auto_report_enabled ? <span style={{color:'#4ade80'}}>● Ativo</span> : <span>● Inativo</span>}
                          {client.last_report_sent_at && <span> · Último envio: {fmtDate(client.last_report_sent_at)}</span>}
                        </p>
                      </div>
                    </div>

                    <div style={{ display:'flex', alignItems:'center', gap:8, flexWrap:'wrap' }}>
                      {/* Period */}
                      <select value={client.report_period || 'last_7d'} onChange={e => savePeriod(client, e.target.value)}
                        style={{ background:'#1a1a1a', border:'1px solid rgba(255,255,255,0.1)', borderRadius:8, padding:'6px 10px', color:'white', fontSize:11, outline:'none', cursor:'pointer' }}>
                        {PERIODS.map(p => <option key={p.key} value={p.key}>{p.label}</option>)}
                      </select>

                      {/* Email */}
                      <div style={{ display:'flex', alignItems:'center', gap:6 }}>
                        <Mail size={13} color="rgba(255,255,255,0.3)" />
                        <input
                          value={editEmail[client.id] !== undefined ? editEmail[client.id] : (client.report_email || client.email || '')}
                          onChange={e => setEditEmail(prev => ({ ...prev, [client.id]: e.target.value }))}
                          onBlur={() => saveEmail(client)}
                          placeholder="email@cliente.com"
                          style={{ background:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.08)', borderRadius:8, padding:'6px 10px', color:'white', fontSize:11, outline:'none', width:180 }}
                        />
                      </div>

                      {/* Run now */}
                      <button onClick={() => runNow(client)} disabled={running[client.id]}
                        style={{ display:'flex', alignItems:'center', gap:5, padding:'6px 12px', borderRadius:8, background:'rgba(74,222,128,0.1)', border:'1px solid rgba(74,222,128,0.25)', color:'#4ade80', fontSize:11, fontWeight:700, cursor:'pointer', opacity: running[client.id] ? 0.6 : 1 }}>
                        {running[client.id] ? <RefreshCw size={12} style={{ animation:'spin 1s linear infinite' }} /> : <Play size={12} />}
                        Enviar agora
                      </button>
                    </div>
                  </div>
                </div>
              ))}

              {agentClients.filter(c => c.meta_account_id).length === 0 && (
                <div style={{ textAlign:'center', padding:'60px 0', color:'rgba(255,255,255,0.2)' }}>
                  <Bot size={28} style={{ margin:'0 auto 12px', opacity:0.3 }} />
                  <p style={{ fontSize:13 }}>Nenhum cliente com conta Meta configurada.</p>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {viewReport && <ReportView report={viewReport} onClose={() => setViewReport(null)} onDelete={deleteReport} />}
    </div>
  )
}
