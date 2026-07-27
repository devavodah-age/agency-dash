import { useState, useEffect, useCallback } from 'react'
import { RefreshCw, Play, Pause, TrendingUp, Sparkles, ChevronDown, Check, X, AlertCircle, Zap } from 'lucide-react'
import api from '../lib/api'

const PERIODS = [
  { key: 'today',      label: 'Hoje' },
  { key: 'last_7d',   label: '7 dias' },
  { key: 'last_30d',  label: '30 dias' },
  { key: 'this_month',label: 'Este mês' },
]
const SCALE_OPTS = [10, 20, 50]

const OBJ_LABEL = {
  OUTCOME_ENGAGEMENT: 'OUTCOME ENGAGEMENT',
  OUTCOME_TRAFFIC: 'OUTCOME TRAFFIC',
  OUTCOME_LEADS: 'OUTCOME LEADS',
  OUTCOME_SALES: 'OUTCOME SALES',
  OUTCOME_AWARENESS: 'OUTCOME AWARENESS',
  OUTCOME_APP_PROMOTION: 'OUTCOME APP PROMOTION',
  LINK_CLICKS: 'LINK CLICKS',
  CONVERSIONS: 'CONVERSIONS',
  VIDEO_VIEWS: 'VIDEO VIEWS',
}

function fmtBRL(v) {
  if (v == null || v === 0) return '—'
  const s = Number(v).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
  return 'R$\u00a0' + s
}
function fmtInt(v) { return v != null ? Number(v).toLocaleString('pt-BR') : '—' }

function StatusPill({ status }) {
  const active = status === 'ACTIVE'
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 5,
      padding: '4px 10px', borderRadius: 999,
      fontSize: 11, fontWeight: 700, letterSpacing: 0.5, textTransform: 'uppercase',
      background: active ? 'rgba(74,222,128,0.12)' : 'rgba(248,113,113,0.12)',
      color: active ? '#4ade80' : '#f87171',
    }}>
      <span style={{ width: 6, height: 6, borderRadius: '50%', background: active ? '#4ade80' : '#f87171', flexShrink: 0 }} />
      {active ? 'Ativo' : 'Pausado'}
    </span>
  )
}

function CplCell({ cpl }) {
  if (cpl == null) return <span style={{ color: 'rgba(255,255,255,0.2)' }}>—</span>
  const color = cpl < 20 ? '#4ade80' : cpl < 50 ? '#facc15' : '#f87171'
  return <span style={{ color, fontWeight: 600 }}>{fmtBRL(cpl)}</span>
}

function PriorityDot({ p }) {
  const c = { alta: '#f87171', media: '#facc15', baixa: '#4ade80' }[p] || '#6b7280'
  return <span style={{ width: 7, height: 7, borderRadius: '50%', background: c, display: 'inline-block', flexShrink: 0 }} />
}

export default function Traffic() {
  const [clients, setClients]           = useState([])
  const [selectedClient, setSelectedClient] = useState('all')
  const [period, setPeriod]             = useState('last_30d')
  const [campaigns, setCampaigns]       = useState([])
  const [loading, setLoading]           = useState(false)
  const [error, setError]               = useState(null)

  const [toggling, setToggling]         = useState({})
  const [scaling, setScaling]           = useState({})
  const [scaleOpen, setScaleOpen]       = useState(null)
  const [customBudget, setCustomBudget] = useState({})

  const [aiLoading, setAiLoading]       = useState(false)
  const [aiResult, setAiResult]         = useState(null)
  const [aiError, setAiError]           = useState(null)
  const [applying, setApplying]         = useState({})

  useEffect(() => {
    api.get('/traffic/clients').then(r => setClients(r.data)).catch(() => {})
  }, [])

  const loadCampaigns = useCallback(async () => {
    setLoading(true); setError(null)
    try {
      const p = `?period=${period}${selectedClient !== 'all' ? `&client_id=${selectedClient}` : ''}`
      const { data } = await api.get(`/traffic/campaigns${p}`)
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
      await api.post(`/traffic/campaigns/${c.id}/status`, { status: next })
      setCampaigns(prev => prev.map(x => x.id === c.id ? { ...x, status: next, effective_status: next } : x))
    } catch (err) { alert(err.response?.data?.error || 'Erro ao atualizar status') }
    setToggling(t => ({ ...t, [c.id]: false }))
  }

  const scaleCampaign = async (c, pct) => {
    if (!c.daily_budget) return alert('Campanha sem orçamento diário configurado.')
    const nb = +(c.daily_budget * (1 + pct / 100)).toFixed(2)
    setScaling(s => ({ ...s, [c.id]: true })); setScaleOpen(null)
    try {
      await api.post(`/traffic/campaigns/${c.id}/budget`, { daily_budget: nb })
      setCampaigns(prev => prev.map(x => x.id === c.id ? { ...x, daily_budget: nb } : x))
    } catch (err) { alert(err.response?.data?.error || 'Erro ao escalar') }
    setScaling(s => ({ ...s, [c.id]: false }))
  }

  const applyCustom = async (c) => {
    const val = parseFloat(customBudget[c.id])
    if (isNaN(val) || val <= 0) return alert('Valor inválido')
    setScaling(s => ({ ...s, [c.id]: true })); setScaleOpen(null)
    try {
      await api.post(`/traffic/campaigns/${c.id}/budget`, { daily_budget: val.toFixed(2) })
      setCampaigns(prev => prev.map(x => x.id === c.id ? { ...x, daily_budget: val } : x))
    } catch (err) { alert(err.response?.data?.error || 'Erro ao atualizar') }
    setScaling(s => ({ ...s, [c.id]: false }))
  }

  const runOptimize = async () => {
    setAiLoading(true); setAiResult(null); setAiError(null)
    try {
      const { data } = await api.post('/traffic/optimize', {
        client_id: selectedClient !== 'all' ? selectedClient : undefined, period
      })
      setAiResult(data)
    } catch (err) { setAiError(err.response?.data?.error || 'Erro ao gerar análise') }
    setAiLoading(false)
  }

  const applyRec = async (rec) => {
    if (rec.acao === 'manter') return
    setApplying(a => ({ ...a, [rec.campaign_id]: true }))
    try {
      if (rec.acao === 'pausar') {
        await api.post(`/traffic/campaigns/${rec.campaign_id}/status`, { status: 'PAUSED' })
        setCampaigns(prev => prev.map(x => x.id === rec.campaign_id ? { ...x, status: 'PAUSED', effective_status: 'PAUSED' } : x))
      } else if ((rec.acao === 'escalar' || rec.acao === 'reduzir') && rec.percentual) {
        const camp = campaigns.find(x => x.id === rec.campaign_id)
        if (camp?.daily_budget) {
          const sign = rec.acao === 'reduzir' ? -1 : 1
          const nb = +(camp.daily_budget * (1 + sign * rec.percentual / 100)).toFixed(2)
          await api.post(`/traffic/campaigns/${rec.campaign_id}/budget`, { daily_budget: nb })
          setCampaigns(prev => prev.map(x => x.id === rec.campaign_id ? { ...x, daily_budget: nb } : x))
        }
      }
      setAiResult(r => ({ ...r, recomendacoes: r.recomendacoes.map(x => x.campaign_id === rec.campaign_id ? { ...x, _applied: true } : x) }))
    } catch (err) { alert(err.response?.data?.error || 'Erro ao aplicar') }
    setApplying(a => ({ ...a, [rec.campaign_id]: false }))
  }

  const TH = ({ children, right }) => (
    <th style={{
      padding: '10px 16px', textAlign: right ? 'right' : 'left',
      fontSize: 10, fontWeight: 700, letterSpacing: 1.5, textTransform: 'uppercase',
      color: 'rgba(255,255,255,0.3)', whiteSpace: 'nowrap',
      borderBottom: '1px solid rgba(255,255,255,0.06)',
      background: 'rgba(255,255,255,0.02)',
    }}>{children}</th>
  )

  const TD = ({ children, mono, right, dim }) => (
    <td style={{
      padding: '14px 16px', textAlign: right ? 'right' : 'left',
      fontSize: 13, fontFamily: mono ? 'monospace' : 'inherit',
      color: dim ? 'rgba(255,255,255,0.35)' : 'rgba(255,255,255,0.85)',
      borderBottom: '1px solid rgba(255,255,255,0.04)',
      whiteSpace: 'nowrap',
    }}>{children}</td>
  )

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>

      {/* Top bar */}
      <div style={{ padding: '24px 28px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12, flexShrink: 0 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 700, color: 'white', margin: 0 }}>Tráfego</h1>
          <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.3)', marginTop: 4 }}>
            {loading ? 'Carregando...' : `${campaigns.length} campanha${campaigns.length !== 1 ? 's' : ''} encontrada${campaigns.length !== 1 ? 's' : ''}`}
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
          {/* Client selector */}
          <select value={selectedClient} onChange={e => setSelectedClient(e.target.value)} style={{
            background: '#1a1a1a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8,
            padding: '7px 12px', color: 'white', fontSize: 12, outline: 'none', cursor: 'pointer',
            fontWeight: 500,
          }}>
            <option value="all">Todos os clientes</option>
            {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>

          {/* Period */}
          <div style={{ display: 'flex', background: '#1a1a1a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, overflow: 'hidden' }}>
            {PERIODS.map(p => (
              <button key={p.key} onClick={() => setPeriod(p.key)} style={{
                padding: '7px 14px', border: 'none', fontSize: 12, fontWeight: 600, cursor: 'pointer',
                transition: 'all .15s',
                background: period === p.key ? '#a78bfa' : 'transparent',
                color: period === p.key ? 'white' : 'rgba(255,255,255,0.35)',
              }}>{p.label}</button>
            ))}
          </div>

          <button onClick={loadCampaigns} disabled={loading} style={{
            width: 34, height: 34, borderRadius: 8, background: '#1a1a1a',
            border: '1px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.4)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
          }}>
            <RefreshCw size={14} style={{ animation: loading ? 'spin 1s linear infinite' : 'none' }} />
          </button>

          {/* AI button */}
          <button onClick={runOptimize} disabled={aiLoading || campaigns.length === 0} style={{
            display: 'flex', alignItems: 'center', gap: 7, padding: '7px 16px', borderRadius: 8,
            background: 'rgba(167,139,250,0.12)', border: '1px solid rgba(167,139,250,0.35)',
            color: '#a78bfa', fontSize: 12, fontWeight: 700, cursor: aiLoading ? 'not-allowed' : 'pointer',
            opacity: (aiLoading || campaigns.length === 0) ? 0.5 : 1, transition: 'all .2s',
          }}>
            {aiLoading
              ? <><RefreshCw size={13} style={{ animation: 'spin 1s linear infinite' }} /> Analisando...</>
              : <><Sparkles size={13} /> Otimizar com IA</>
            }
          </button>
        </div>
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>

      {error && (
        <div style={{ margin: '0 28px 16px', padding: '12px 16px', background: 'rgba(248,113,113,0.08)', border: '1px solid rgba(248,113,113,0.2)', borderRadius: 10, color: '#f87171', fontSize: 13, display: 'flex', gap: 8, alignItems: 'center', flexShrink: 0 }}>
          <AlertCircle size={15} /> {error}
        </div>
      )}

      {/* AI panel */}
      {(aiResult || aiError) && (
        <div style={{ margin: '0 28px 16px', background: '#131313', border: '1px solid rgba(167,139,250,0.25)', borderRadius: 12, overflow: 'hidden', flexShrink: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 18px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <Sparkles size={14} color="#a78bfa" />
              <span style={{ color: 'white', fontWeight: 600, fontSize: 13 }}>Análise de IA — Claude</span>
            </div>
            <button onClick={() => { setAiResult(null); setAiError(null) }} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.3)', cursor: 'pointer' }}>
              <X size={15} />
            </button>
          </div>
          {aiError ? (
            <div style={{ padding: '16px 18px', color: '#f87171', fontSize: 13 }}>{aiError}</div>
          ) : (
            <div style={{ padding: '16px 18px' }}>
              {aiResult?.resumo && (
                <p style={{ color: 'rgba(255,255,255,0.55)', fontSize: 13, lineHeight: 1.6, marginBottom: 14, paddingBottom: 14, borderBottom: '1px solid rgba(255,255,255,0.06)' }}>{aiResult.resumo}</p>
              )}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {aiResult?.recomendacoes?.map((rec, i) => {
                  const acolor = { pausar: '#f87171', escalar: '#4ade80', reduzir: '#facc15', manter: '#6b7280' }[rec.acao]
                  return (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 14px', background: 'rgba(255,255,255,0.02)', borderRadius: 8, border: '1px solid rgba(255,255,255,0.05)', opacity: rec._applied ? 0.45 : 1 }}>
                      <PriorityDot p={rec.prioridade} />
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                          <span style={{ color: 'white', fontSize: 12, fontWeight: 600 }}>{rec.campaign_name}</span>
                          <span style={{ color: 'rgba(255,255,255,0.3)', fontSize: 11 }}>· {rec.cliente}</span>
                          <span style={{ color: acolor, fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.5 }}>
                            {rec.acao}{rec.percentual ? ` ${rec.acao==='reduzir'?'-':'+'}${rec.percentual}%` : ''}
                          </span>
                        </div>
                        <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: 11, marginTop: 3 }}>{rec.motivo}</p>
                      </div>
                      {rec._applied ? (
                        <span style={{ color: '#4ade80', fontSize: 11, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 4, flexShrink: 0 }}>
                          <Check size={12} /> Aplicado
                        </span>
                      ) : rec.acao !== 'manter' ? (
                        <button onClick={() => applyRec(rec)} disabled={!!applying[rec.campaign_id]} style={{
                          display: 'flex', alignItems: 'center', gap: 5, padding: '5px 12px', borderRadius: 6,
                          background: 'rgba(167,139,250,0.12)', border: '1px solid rgba(167,139,250,0.3)',
                          color: '#a78bfa', fontSize: 11, fontWeight: 700, cursor: 'pointer', flexShrink: 0,
                        }}>
                          {applying[rec.campaign_id] ? <RefreshCw size={11} style={{ animation: 'spin 1s linear infinite' }} /> : <Zap size={11} />}
                          {applying[rec.campaign_id] ? 'Aplicando...' : 'Aplicar'}
                        </button>
                      ) : (
                        <span style={{ color: 'rgba(255,255,255,0.2)', fontSize: 11, flexShrink: 0 }}>Manter</span>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Table */}
      <div style={{ flex: 1, overflowY: 'auto', overflowX: 'auto', padding: '0 28px 28px' }}>
        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', paddingTop: 60 }}>
            <RefreshCw size={20} color="rgba(255,255,255,0.2)" style={{ animation: 'spin 1s linear infinite' }} />
          </div>
        ) : campaigns.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 0', color: 'rgba(255,255,255,0.2)', fontSize: 13 }}>
            <TrendingUp size={28} style={{ margin: '0 auto 12px', opacity: 0.3 }} />
            <p>Nenhuma campanha encontrada. Verifique o token Meta nas Integrações.</p>
          </div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse', background: '#111', borderRadius: 12, overflow: 'hidden', border: '1px solid rgba(255,255,255,0.06)' }}>
            <thead>
              <tr>
                <TH>Campanha</TH>
                <TH>Cliente</TH>
                <TH>Status</TH>
                <TH>Orçamento/dia</TH>
                <TH right>Gasto</TH>
                <TH right>Cliques</TH>
                <TH right>Leads</TH>
                <TH right>CPL</TH>
                <TH right>CTR</TH>
                <TH right>Ações</TH>
              </tr>
            </thead>
            <tbody>
              {campaigns.map((c) => (
                <tr key={c.id} style={{ transition: 'background .1s' }}
                  onMouseEnter={e => e.currentTarget.style.background='rgba(255,255,255,0.025)'}
                  onMouseLeave={e => e.currentTarget.style.background='transparent'}>

                  {/* Campaign name + objective */}
                  <td style={{ padding: '13px 16px', borderBottom: '1px solid rgba(255,255,255,0.04)', maxWidth: 280 }}>
                    <p style={{ fontSize: 13, fontWeight: 500, color: 'rgba(255,255,255,0.88)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={c.name}>{c.name}</p>
                    <p style={{ fontSize: 10, color: 'rgba(255,255,255,0.25)', marginTop: 2, letterSpacing: 0.5 }}>{OBJ_LABEL[c.objective] || c.objective || '—'}</p>
                  </td>

                  <TD dim>{c.client_name}</TD>

                  {/* Status */}
                  <td style={{ padding: '13px 16px', borderBottom: '1px solid rgba(255,255,255,0.04)', whiteSpace: 'nowrap' }}>
                    <StatusPill status={c.effective_status} />
                  </td>

                  {/* Budget */}
                  <td style={{ padding: '13px 16px', borderBottom: '1px solid rgba(255,255,255,0.04)', fontFamily: 'monospace', fontSize: 13, color: 'rgba(255,255,255,0.55)', whiteSpace: 'nowrap' }}>
                    {c.daily_budget ? fmtBRL(c.daily_budget) : '—'}
                  </td>

                  <TD mono right>{fmtBRL(c.spend)}</TD>
                  <TD mono right>{fmtInt(c.clicks)}</TD>
                  <TD mono right dim>{fmtInt(c.leads)}</TD>

                  {/* CPL */}
                  <td style={{ padding: '13px 16px', borderBottom: '1px solid rgba(255,255,255,0.04)', textAlign: 'right', fontFamily: 'monospace', fontSize: 13, whiteSpace: 'nowrap' }}>
                    <CplCell cpl={c.cpl} />
                  </td>

                  {/* CTR */}
                  <td style={{ padding: '13px 16px', borderBottom: '1px solid rgba(255,255,255,0.04)', textAlign: 'right', fontFamily: 'monospace', fontSize: 13, color: 'rgba(255,255,255,0.5)', whiteSpace: 'nowrap' }}>
                    {c.ctr != null ? `${Number(c.ctr).toFixed(2)}%` : '—'}
                  </td>

                  {/* Actions */}
                  <td style={{ padding: '13px 16px', borderBottom: '1px solid rgba(255,255,255,0.04)', textAlign: 'right', whiteSpace: 'nowrap' }}>
                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                      {/* Pause / Activate */}
                      <button onClick={() => toggleStatus(c)} disabled={!!toggling[c.id]} title={c.status === 'ACTIVE' ? 'Pausar' : 'Ativar'} style={{
                        width: 30, height: 30, borderRadius: 6, border: '1px solid rgba(255,255,255,0.08)',
                        background: 'rgba(255,255,255,0.04)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                        color: c.status === 'ACTIVE' ? '#f87171' : '#4ade80', transition: 'all .15s',
                      }}>
                        {toggling[c.id]
                          ? <RefreshCw size={12} style={{ animation: 'spin 1s linear infinite', color: 'rgba(255,255,255,0.4)' }} />
                          : c.status === 'ACTIVE' ? <Pause size={12} /> : <Play size={12} />
                        }
                      </button>

                      {/* Scale dropdown */}
                      <div style={{ position: 'relative' }}>
                        <button onClick={() => setScaleOpen(scaleOpen === c.id ? null : c.id)} disabled={!!scaling[c.id]} style={{
                          height: 30, padding: '0 8px', borderRadius: 6, border: '1px solid rgba(255,255,255,0.08)',
                          background: 'rgba(255,255,255,0.04)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 3,
                          color: 'rgba(255,255,255,0.5)', transition: 'all .15s',
                        }}>
                          {scaling[c.id]
                            ? <RefreshCw size={12} style={{ animation: 'spin 1s linear infinite' }} />
                            : <><TrendingUp size={12} /><ChevronDown size={11} /></>
                          }
                        </button>

                        {scaleOpen === c.id && (
                          <div style={{ position: 'absolute', right: 0, top: 34, zIndex: 99, background: '#1c1c1c', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 10, padding: 6, minWidth: 180, boxShadow: '0 8px 32px rgba(0,0,0,0.6)' }}>
                            <p style={{ fontSize: 10, color: 'rgba(255,255,255,0.25)', letterSpacing: 1.5, textTransform: 'uppercase', padding: '4px 8px 6px', margin: 0 }}>Escalar orçamento</p>
                            {SCALE_OPTS.map(pct => (
                              <button key={pct} onClick={() => scaleCampaign(c, pct)} style={{
                                width: '100%', textAlign: 'left', padding: '8px 10px', borderRadius: 7,
                                background: 'none', border: 'none', color: 'rgba(255,255,255,0.75)',
                                fontSize: 12, cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                              }}
                              onMouseEnter={e => e.currentTarget.style.background='rgba(255,255,255,0.06)'}
                              onMouseLeave={e => e.currentTarget.style.background='none'}>
                                <span style={{ color: '#4ade80', fontWeight: 700 }}>+{pct}%</span>
                                {c.daily_budget && <span style={{ color: 'rgba(255,255,255,0.3)', fontSize: 11 }}>{fmtBRL(c.daily_budget * (1 + pct / 100))}</span>}
                              </button>
                            ))}
                            <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)', marginTop: 4, paddingTop: 8, padding: '8px 6px 4px' }}>
                              <p style={{ fontSize: 10, color: 'rgba(255,255,255,0.25)', marginBottom: 5, paddingLeft: 4, letterSpacing: 1 }}>Valor fixo (R$)</p>
                              <div style={{ display: 'flex', gap: 5 }}>
                                <input type="number" min="1" step="0.01"
                                  value={customBudget[c.id] || ''}
                                  onChange={e => setCustomBudget(b => ({ ...b, [c.id]: e.target.value }))}
                                  placeholder="50,00"
                                  style={{ flex: 1, background: '#111', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 6, padding: '6px 8px', color: 'white', fontSize: 12, outline: 'none' }} />
                                <button onClick={() => applyCustom(c)} style={{ padding: '6px 10px', background: 'white', color: 'black', border: 'none', borderRadius: 6, fontSize: 11, fontWeight: 700, cursor: 'pointer' }}>OK</button>
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
        )}
      </div>
    </div>
  )
}
