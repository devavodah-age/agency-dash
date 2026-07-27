import { useState, useEffect, useCallback } from 'react'
import { RefreshCw, Play, Pause, TrendingUp, Sparkles, ChevronDown, Check, X, AlertCircle, Zap } from 'lucide-react'
import api from '../lib/api'

const PERIODS = [
  { key: 'today', label: 'Hoje' },
  { key: 'last_7d', label: '7 dias' },
  { key: 'last_30d', label: '30 dias' },
  { key: 'this_month', label: 'Este mês' },
]

const SCALE_OPTS = [10, 20, 50]

function fmt(v, pre='') { return v != null ? pre + Number(v).toLocaleString('pt-BR', {minimumFractionDigits:2,maximumFractionDigits:2}) : '—' }
function fmtInt(v) { return v != null ? Number(v).toLocaleString('pt-BR') : '—' }

function StatusBadge({ status }) {
  const active = status === 'ACTIVE'
  return (
    <span style={{
      display:'inline-flex', alignItems:'center', gap:5, padding:'3px 10px', borderRadius:20,
      fontSize:10, fontWeight:700, letterSpacing:1, textTransform:'uppercase',
      background: active ? 'rgba(74,222,128,0.1)' : 'rgba(248,113,113,0.1)',
      color: active ? '#4ade80' : '#f87171',
      border: `1px solid ${active ? 'rgba(74,222,128,0.2)' : 'rgba(248,113,113,0.2)'}`,
    }}>
      <span style={{ width:5, height:5, borderRadius:'50%', background: active ? '#4ade80' : '#f87171' }} />
      {active ? 'Ativo' : 'Pausado'}
    </span>
  )
}

function PriorityDot({ p }) {
  const c = p === 'alta' ? '#f87171' : p === 'media' ? '#facc15' : '#4ade80'
  return <span style={{ width:7, height:7, borderRadius:'50%', background:c, display:'inline-block', marginRight:6 }} />
}

function ActionLabel({ acao }) {
  const map = { pausar:'Pausar', escalar:'Escalar', reduzir:'Reduzir', manter:'Manter' }
  const color = { pausar:'#f87171', escalar:'#4ade80', reduzir:'#facc15', manter:'#6b7280' }
  return <span style={{ color: color[acao], fontWeight:700, fontSize:12 }}>{map[acao] || acao}</span>
}

export default function Traffic() {
  const [clients, setClients] = useState([])
  const [selectedClient, setSelectedClient] = useState('all')
  const [period, setPeriod] = useState('last_30d')
  const [campaigns, setCampaigns] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const [toggling, setToggling] = useState({})
  const [scaling, setScaling] = useState({})
  const [scaleOpen, setScaleOpen] = useState(null)
  const [customBudget, setCustomBudget] = useState({})

  const [aiLoading, setAiLoading] = useState(false)
  const [aiResult, setAiResult] = useState(null)
  const [aiError, setAiError] = useState(null)
  const [applying, setApplying] = useState({})

  useEffect(() => {
    api.get('/traffic/clients').then(r => setClients(r.data)).catch(() => {})
  }, [])

  const loadCampaigns = useCallback(async () => {
    setLoading(true); setError(null)
    try {
      const params = period ? `?period=${period}` : ''
      const clientParam = selectedClient !== 'all' ? `${params ? '&' : '?'}client_id=${selectedClient}` : ''
      const { data } = await api.get(`/traffic/campaigns${params}${clientParam}`)
      setCampaigns(Array.isArray(data) ? data : [])
    } catch (err) {
      setError(err.response?.data?.error || 'Erro ao carregar campanhas')
    }
    setLoading(false)
  }, [selectedClient, period])

  useEffect(() => { loadCampaigns() }, [loadCampaigns])

  const toggleStatus = async (c) => {
    const next = c.status === 'ACTIVE' ? 'PAUSED' : 'ACTIVE'
    setToggling(t => ({ ...t, [c.id]: true }))
    try {
      await api.post(`/traffic/campaigns/${c.id}/status`, { status: next, account_id: c.meta_account_id })
      setCampaigns(prev => prev.map(x => x.id === c.id ? { ...x, status: next, effective_status: next } : x))
    } catch (err) {
      alert(err.response?.data?.error || 'Erro ao atualizar status')
    }
    setToggling(t => ({ ...t, [c.id]: false }))
  }

  const scaleCampaign = async (c, pct) => {
    if (!c.daily_budget) return alert('Esta campanha não tem orçamento diário configurado.')
    const newBudget = c.daily_budget * (1 + pct / 100)
    setScaling(s => ({ ...s, [c.id]: true }))
    setScaleOpen(null)
    try {
      await api.post(`/traffic/campaigns/${c.id}/budget`, { daily_budget: newBudget.toFixed(2) })
      setCampaigns(prev => prev.map(x => x.id === c.id ? { ...x, daily_budget: newBudget } : x))
    } catch (err) {
      alert(err.response?.data?.error || 'Erro ao escalar orçamento')
    }
    setScaling(s => ({ ...s, [c.id]: false }))
  }

  const setCustomAndScale = async (c) => {
    const val = parseFloat(customBudget[c.id])
    if (isNaN(val) || val <= 0) return alert('Valor inválido')
    setScaling(s => ({ ...s, [c.id]: true }))
    setScaleOpen(null)
    try {
      await api.post(`/traffic/campaigns/${c.id}/budget`, { daily_budget: val.toFixed(2) })
      setCampaigns(prev => prev.map(x => x.id === c.id ? { ...x, daily_budget: val } : x))
    } catch (err) {
      alert(err.response?.data?.error || 'Erro ao atualizar orçamento')
    }
    setScaling(s => ({ ...s, [c.id]: false }))
  }

  const runOptimize = async () => {
    setAiLoading(true); setAiResult(null); setAiError(null)
    try {
      const { data } = await api.post('/traffic/optimize', {
        client_id: selectedClient !== 'all' ? selectedClient : undefined,
        period
      })
      setAiResult(data)
    } catch (err) {
      setAiError(err.response?.data?.error || 'Erro ao gerar análise')
    }
    setAiLoading(false)
  }

  const applyRec = async (rec) => {
    if (rec.acao === 'manter') return
    setApplying(a => ({ ...a, [rec.campaign_id]: true }))
    try {
      if (rec.acao === 'pausar') {
        await api.post(`/traffic/campaigns/${rec.campaign_id}/status`, { status: 'PAUSED' })
        setCampaigns(prev => prev.map(x => x.id === rec.campaign_id ? { ...x, status: 'PAUSED', effective_status: 'PAUSED' } : x))
      } else if (rec.acao === 'escalar' || rec.acao === 'reduzir') {
        const camp = campaigns.find(x => x.id === rec.campaign_id)
        if (camp?.daily_budget && rec.percentual) {
          const sign = rec.acao === 'reduzir' ? -1 : 1
          const nb = camp.daily_budget * (1 + (sign * rec.percentual) / 100)
          await api.post(`/traffic/campaigns/${rec.campaign_id}/budget`, { daily_budget: nb.toFixed(2) })
          setCampaigns(prev => prev.map(x => x.id === rec.campaign_id ? { ...x, daily_budget: nb } : x))
        }
      }
      setAiResult(r => ({
        ...r,
        recomendacoes: r.recomendacoes.map(x => x.campaign_id === rec.campaign_id ? { ...x, _applied: true } : x)
      }))
    } catch (err) {
      alert(err.response?.data?.error || 'Erro ao aplicar recomendação')
    }
    setApplying(a => ({ ...a, [rec.campaign_id]: false }))
  }

  const grouped = campaigns.reduce((acc, c) => {
    if (!acc[c.client_name]) acc[c.client_name] = []
    acc[c.client_name].push(c)
    return acc
  }, {})

  return (
    <div className="p-6 lg:p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
        <div>
          <h1 className="text-white text-2xl font-bold">Tráfego</h1>
          <p className="text-brand-dim text-sm mt-1">{campaigns.length} campanha{campaigns.length !== 1 ? 's' : ''} encontrada{campaigns.length !== 1 ? 's' : ''}</p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {/* Client filter */}
          <select value={selectedClient} onChange={e => setSelectedClient(e.target.value)}
            className="bg-surface-card border border-surface-border rounded-lg px-3 py-1.5 text-white text-xs outline-none focus:border-white transition-colors cursor-pointer">
            <option value="all">Todos os clientes</option>
            {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>

          {/* Period */}
          <div className="flex bg-surface-card border border-surface-border rounded-lg overflow-hidden">
            {PERIODS.map(p => (
              <button key={p.key} onClick={() => setPeriod(p.key)}
                className={`px-3 py-1.5 text-xs font-medium transition-colors ${period === p.key ? 'bg-accent text-white' : 'text-brand-dim hover:text-white'}`}>
                {p.label}
              </button>
            ))}
          </div>

          <button onClick={loadCampaigns} disabled={loading}
            className="p-2 bg-surface-card border border-surface-border rounded-lg text-brand-dim hover:text-white transition-colors">
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>

          {/* AI button */}
          <button onClick={runOptimize} disabled={aiLoading || campaigns.length === 0}
            style={{ background: aiLoading ? 'rgba(167,139,250,0.3)' : 'rgba(167,139,250,0.15)', border: '1px solid rgba(167,139,250,0.4)' }}
            className="flex items-center gap-2 px-4 py-1.5 rounded-lg text-xs font-bold transition-all disabled:opacity-50"
            onMouseEnter={e => !aiLoading && (e.currentTarget.style.background='rgba(167,139,250,0.25)')}
            onMouseLeave={e => !aiLoading && (e.currentTarget.style.background='rgba(167,139,250,0.15)')}>
            {aiLoading
              ? <><RefreshCw className="w-3.5 h-3.5 animate-spin" style={{color:'#a78bfa'}} /><span style={{color:'#a78bfa'}}>Analisando...</span></>
              : <><Sparkles className="w-3.5 h-3.5" style={{color:'#a78bfa'}} /><span style={{color:'#a78bfa'}}>Otimizar com IA</span></>
            }
          </button>
        </div>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm flex items-center gap-2">
          <AlertCircle className="w-4 h-4 flex-shrink-0" /> {error}
        </div>
      )}

      {/* AI Result panel */}
      {(aiResult || aiError) && (
        <div className="mb-6 bg-surface-card border rounded-xl overflow-hidden"
          style={{ borderColor: aiError ? 'rgba(248,113,113,0.3)' : 'rgba(167,139,250,0.3)' }}>
          <div className="flex items-center justify-between px-5 py-4 border-b border-surface-border">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4" style={{color:'#a78bfa'}} />
              <p className="text-white font-semibold text-sm">Análise de IA — Claude</p>
            </div>
            <button onClick={() => { setAiResult(null); setAiError(null) }} className="text-brand-dim hover:text-white transition-colors">
              <X className="w-4 h-4" />
            </button>
          </div>

          {aiError ? (
            <div className="p-5 text-red-400 text-sm">{aiError}</div>
          ) : (
            <div className="p-5">
              {aiResult.resumo && (
                <p className="text-white/70 text-sm leading-relaxed mb-5 pb-5 border-b border-surface-border">{aiResult.resumo}</p>
              )}
              <div className="space-y-3">
                {aiResult.recomendacoes?.map((rec, i) => (
                  <div key={i} className={`flex items-start gap-4 p-4 rounded-xl border transition-all ${rec._applied ? 'opacity-50' : ''}`}
                    style={{ background:'rgba(255,255,255,0.02)', borderColor:'rgba(255,255,255,0.07)' }}>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <PriorityDot p={rec.prioridade} />
                        <span className="text-white text-sm font-medium truncate">{rec.campaign_name}</span>
                        <span className="text-brand-dim text-xs">· {rec.cliente}</span>
                        <ActionLabel acao={rec.acao} />
                        {rec.percentual && <span className="text-xs text-brand-dim">{rec.acao === 'reduzir' ? '-' : '+'}{rec.percentual}%</span>}
                      </div>
                      <p className="text-brand-dim text-xs leading-relaxed">{rec.motivo}</p>
                    </div>
                    {rec._applied ? (
                      <span className="flex items-center gap-1 text-green-400 text-xs font-bold flex-shrink-0">
                        <Check className="w-3.5 h-3.5" /> Aplicado
                      </span>
                    ) : rec.acao !== 'manter' ? (
                      <button onClick={() => applyRec(rec)} disabled={!!applying[rec.campaign_id]}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold flex-shrink-0 transition-colors"
                        style={{ background:'rgba(167,139,250,0.15)', color:'#a78bfa', border:'1px solid rgba(167,139,250,0.3)' }}>
                        {applying[rec.campaign_id] ? <RefreshCw className="w-3 h-3 animate-spin" /> : <Zap className="w-3 h-3" />}
                        {applying[rec.campaign_id] ? 'Aplicando...' : 'Aplicar'}
                      </button>
                    ) : (
                      <span className="text-brand-dim text-xs flex-shrink-0">Manter</span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Campaigns */}
      {loading ? (
        <div className="flex justify-center py-20">
          <RefreshCw className="w-5 h-5 animate-spin text-brand-dim" />
        </div>
      ) : campaigns.length === 0 ? (
        <div className="bg-surface-card border border-dashed border-surface-border rounded-xl p-12 text-center">
          <TrendingUp className="w-8 h-8 text-brand-dim mx-auto mb-3 opacity-40" />
          <p className="text-brand-dim text-sm">Nenhuma campanha encontrada. Verifique o token Meta nas Integrações.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {Object.entries(grouped).map(([clientName, cList]) => (
            <div key={clientName} className="bg-surface-card border border-surface-border rounded-xl overflow-hidden">
              <div className="px-5 py-3.5 border-b border-surface-border flex items-center gap-2">
                <p className="text-white font-semibold text-sm">{clientName}</p>
                <span className="text-brand-dim text-xs">· {cList.length} campanha{cList.length !== 1 ? 's' : ''}</span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-surface-border">
                      {['Campanha','Status','Orçamento/dia','Gasto','Cliques','Leads','CPL','CTR','Ações'].map(h => (
                        <th key={h} className="text-left px-4 py-2.5 text-[10px] text-brand-dim uppercase tracking-wider whitespace-nowrap">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {cList.map(c => (
                      <tr key={c.id} className="border-b border-surface-border/50 last:border-0 hover:bg-white/[0.02] transition-colors">
                        <td className="px-4 py-3.5 text-white text-sm font-medium max-w-[220px]">
                          <span className="block truncate" title={c.name}>{c.name}</span>
                          <span className="text-brand-dim text-[10px]">{c.objective?.replace(/_/g,' ')}</span>
                        </td>
                        <td className="px-4 py-3.5 whitespace-nowrap">
                          <StatusBadge status={c.effective_status} />
                        </td>
                        <td className="px-4 py-3.5 text-brand-dim text-sm font-mono whitespace-nowrap">
                          {c.daily_budget ? `R$ ${c.daily_budget.toLocaleString('pt-BR',{minimumFractionDigits:2})}` : '—'}
                        </td>
                        <td className="px-4 py-3.5 text-white text-sm font-mono whitespace-nowrap">{fmt(c.spend, 'R$ ')}</td>
                        <td className="px-4 py-3.5 text-brand-dim text-sm">{fmtInt(c.clicks)}</td>
                        <td className="px-4 py-3.5 text-brand-dim text-sm">{fmtInt(c.leads)}</td>
                        <td className="px-4 py-3.5 text-sm whitespace-nowrap">
                          {c.cpl != null
                            ? <span style={{ color: c.cpl < 20 ? '#4ade80' : c.cpl < 50 ? '#facc15' : '#f87171', fontWeight:600 }}>
                                R$ {c.cpl.toLocaleString('pt-BR',{minimumFractionDigits:2})}
                              </span>
                            : <span className="text-brand-dim">—</span>
                          }
                        </td>
                        <td className="px-4 py-3.5 text-brand-dim text-sm">{c.ctr != null ? `${c.ctr.toFixed(2)}%` : '—'}</td>
                        <td className="px-4 py-3.5">
                          <div className="flex items-center gap-1.5 relative">
                            {/* Pause/Activate */}
                            <button onClick={() => toggleStatus(c)} disabled={!!toggling[c.id]}
                              title={c.status === 'ACTIVE' ? 'Pausar' : 'Ativar'}
                              className="p-1.5 rounded-lg text-brand-dim hover:text-white transition-colors"
                              style={{ background:'rgba(255,255,255,0.05)' }}>
                              {toggling[c.id]
                                ? <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                                : c.status === 'ACTIVE'
                                  ? <Pause className="w-3.5 h-3.5" />
                                  : <Play className="w-3.5 h-3.5 text-green-400" />
                              }
                            </button>

                            {/* Scale */}
                            <div className="relative">
                              <button onClick={() => setScaleOpen(scaleOpen === c.id ? null : c.id)} disabled={!!scaling[c.id]}
                                className="flex items-center gap-1 p-1.5 rounded-lg text-brand-dim hover:text-white transition-colors"
                                style={{ background:'rgba(255,255,255,0.05)' }}>
                                {scaling[c.id]
                                  ? <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                                  : <><TrendingUp className="w-3.5 h-3.5" /><ChevronDown className="w-3 h-3" /></>
                                }
                              </button>

                              {scaleOpen === c.id && (
                                <div className="absolute right-0 top-8 z-50 bg-[#1a1a1a] border border-surface-border rounded-xl shadow-2xl p-2 min-w-[160px]">
                                  <p className="text-brand-dim text-[10px] uppercase tracking-wider px-2 pb-1.5">Escalar orçamento</p>
                                  {SCALE_OPTS.map(pct => (
                                    <button key={pct} onClick={() => scaleCampaign(c, pct)}
                                      className="w-full text-left px-3 py-2 text-sm text-white hover:bg-white/10 rounded-lg transition-colors">
                                      +{pct}% {c.daily_budget ? `→ R$ ${(c.daily_budget*(1+pct/100)).toLocaleString('pt-BR',{minimumFractionDigits:2})}` : ''}
                                    </button>
                                  ))}
                                  <div className="border-t border-surface-border mt-1 pt-1.5 px-2">
                                    <p className="text-brand-dim text-[10px] mb-1">Valor fixo (R$)</p>
                                    <div className="flex gap-1">
                                      <input type="number" min="1" step="0.01"
                                        value={customBudget[c.id] || ''}
                                        onChange={e => setCustomBudget(b => ({...b, [c.id]: e.target.value}))}
                                        className="flex-1 bg-surface border border-surface-border rounded-lg px-2 py-1 text-white text-xs outline-none"
                                        placeholder="50.00" />
                                      <button onClick={() => setCustomAndScale(c)}
                                        className="px-2 py-1 bg-white text-black text-xs font-bold rounded-lg">
                                        OK
                                      </button>
                                    </div>
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
