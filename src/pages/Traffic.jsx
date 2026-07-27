import { useState, useEffect, useCallback } from 'react'
import { RefreshCw, Play, Pause, TrendingUp, Sparkles, ChevronDown, Check, X, AlertCircle, Zap, ImageOff } from 'lucide-react'
import api from '../lib/api'

const PERIODS = [
  { key: 'today', label: 'Hoje' },
  { key: 'last_7d', label: '7 dias' },
  { key: 'last_30d', label: '30 dias' },
  { key: 'this_month', label: 'Este mês' },
]
const TABS = [
  { key: 'campaigns', label: 'Campanhas' },
  { key: 'adsets', label: 'Conjuntos' },
  { key: 'ads', label: 'Criativos' },
]
const SCALE_OPTS = [10, 20, 50]
const OBJ_LABEL = {
  OUTCOME_ENGAGEMENT:'OUTCOME ENGAGEMENT',OUTCOME_TRAFFIC:'OUTCOME TRAFFIC',
  OUTCOME_LEADS:'OUTCOME LEADS',OUTCOME_SALES:'OUTCOME SALES',
  OUTCOME_AWARENESS:'OUTCOME AWARENESS',LINK_CLICKS:'LINK CLICKS',
  CONVERSIONS:'CONVERSIONS',VIDEO_VIEWS:'VIDEO VIEWS',
}
const OPT_LABEL = {
  LINK_CLICKS:'CLIQUES',LEAD_GENERATION:'LEADS',CONVERSIONS:'CONVERSÕES',
  REACH:'ALCANCE',IMPRESSIONS:'IMPRESSÕES',LANDING_PAGE_VIEWS:'VIEWS LP',
  OFFSITE_CONVERSIONS:'CONVERSÕES',VIDEO_VIEWS:'VIEWS',POST_ENGAGEMENT:'ENGAJAMENTO',
}

function fmtBRL(v) {
  if (v == null || v === 0) return '—'
  return 'R$\u00a0' + Number(v).toLocaleString('pt-BR', { minimumFractionDigits:2, maximumFractionDigits:2 })
}
function fmtInt(v) { return v != null ? Number(v).toLocaleString('pt-BR') : '—' }

function StatusPill({ status }) {
  const active = status === 'ACTIVE'
  return (
    <span style={{ display:'inline-flex', alignItems:'center', gap:5, padding:'4px 10px', borderRadius:999, fontSize:11, fontWeight:700, letterSpacing:0.5, textTransform:'uppercase', background: active ? 'rgba(74,222,128,0.12)' : 'rgba(248,113,113,0.12)', color: active ? '#4ade80' : '#f87171' }}>
      <span style={{ width:6, height:6, borderRadius:'50%', background: active ? '#4ade80' : '#f87171', flexShrink:0 }} />
      {active ? 'Ativo' : 'Pausado'}
    </span>
  )
}

function CplCell({ cpl }) {
  if (cpl == null) return <span style={{ color:'rgba(255,255,255,0.2)' }}>—</span>
  const color = cpl < 20 ? '#4ade80' : cpl < 50 ? '#facc15' : '#f87171'
  return <span style={{ color, fontWeight:600 }}>{fmtBRL(cpl)}</span>
}

function PriorityDot({ p }) {
  const c = { alta:'#f87171', media:'#facc15', baixa:'#4ade80' }[p] || '#6b7280'
  return <span style={{ width:7, height:7, borderRadius:'50%', background:c, display:'inline-block', flexShrink:0 }} />
}

function ScaleMenu({ item, level, scaling, setScaling, setScaleOpen, customBudget, setCustomBudget, setData }) {
  const scaleBudget = async (pct) => {
    if (!item.daily_budget) return alert('Sem orçamento diário configurado.')
    const nb = +(item.daily_budget * (1 + pct / 100)).toFixed(2)
    setScaling(s => ({ ...s, [item.id]: true })); setScaleOpen(null)
    try {
      await api.post(`/traffic/${level}/${item.id}/budget`, { daily_budget: nb })
      setData(p => p.map(x => x.id === item.id ? { ...x, daily_budget: nb } : x))
    } catch (err) { alert(err.response?.data?.error || 'Erro ao escalar') }
    setScaling(s => ({ ...s, [item.id]: false }))
  }
  const applyCustom = async () => {
    const val = parseFloat(customBudget[item.id])
    if (isNaN(val) || val <= 0) return alert('Valor inválido')
    setScaling(s => ({ ...s, [item.id]: true })); setScaleOpen(null)
    try {
      await api.post(`/traffic/${level}/${item.id}/budget`, { daily_budget: val.toFixed(2) })
      setData(p => p.map(x => x.id === item.id ? { ...x, daily_budget: val } : x))
    } catch (err) { alert(err.response?.data?.error || 'Erro ao atualizar') }
    setScaling(s => ({ ...s, [item.id]: false }))
  }
  return (
    <div style={{ position:'absolute', right:0, top:34, zIndex:99, background:'#1c1c1c', border:'1px solid rgba(255,255,255,0.1)', borderRadius:10, padding:6, minWidth:185, boxShadow:'0 8px 32px rgba(0,0,0,0.6)' }}>
      <p style={{ fontSize:10, color:'rgba(255,255,255,0.25)', letterSpacing:1.5, textTransform:'uppercase', padding:'4px 8px 6px', margin:0 }}>Escalar orçamento</p>
      {SCALE_OPTS.map(pct => (
        <button key={pct} onClick={() => scaleBudget(pct)}
          style={{ width:'100%', textAlign:'left', padding:'8px 10px', borderRadius:7, background:'none', border:'none', color:'rgba(255,255,255,0.75)', fontSize:12, cursor:'pointer', display:'flex', justifyContent:'space-between' }}
          onMouseEnter={e => e.currentTarget.style.background='rgba(255,255,255,0.06)'}
          onMouseLeave={e => e.currentTarget.style.background='none'}>
          <span style={{ color:'#4ade80', fontWeight:700 }}>+{pct}%</span>
          {item.daily_budget && <span style={{ color:'rgba(255,255,255,0.3)', fontSize:11 }}>{fmtBRL(item.daily_budget * (1 + pct / 100))}</span>}
        </button>
      ))}
      <div style={{ borderTop:'1px solid rgba(255,255,255,0.06)', margin:'4px 0 0', padding:'8px 6px 4px' }}>
        <p style={{ fontSize:10, color:'rgba(255,255,255,0.25)', marginBottom:5, paddingLeft:4 }}>Valor fixo (R$)</p>
        <div style={{ display:'flex', gap:5 }}>
          <input type="number" min="1" step="0.01" value={customBudget[item.id] || ''} placeholder="50,00"
            onChange={e => setCustomBudget(b => ({ ...b, [item.id]: e.target.value }))}
            style={{ flex:1, background:'#111', border:'1px solid rgba(255,255,255,0.1)', borderRadius:6, padding:'6px 8px', color:'white', fontSize:12, outline:'none' }} />
          <button onClick={applyCustom} style={{ padding:'6px 10px', background:'white', color:'black', border:'none', borderRadius:6, fontSize:11, fontWeight:700, cursor:'pointer' }}>OK</button>
        </div>
      </div>
    </div>
  )
}

function ActionBtns({ item, level, toggling, setToggling, scaling, setScaling, scaleOpen, setScaleOpen, customBudget, setCustomBudget, setData }) {
  const hasbudget = level !== 'ads'
  const toggleStatus = async () => {
    const next = item.status === 'ACTIVE' ? 'PAUSED' : 'ACTIVE'
    setToggling(t => ({ ...t, [item.id]: true }))
    try {
      await api.post(`/traffic/${level}/${item.id}/status`, { status: next })
      setData(p => p.map(x => x.id === item.id ? { ...x, status: next, effective_status: next } : x))
    } catch (err) { alert(err.response?.data?.error || 'Erro ao atualizar status') }
    setToggling(t => ({ ...t, [item.id]: false }))
  }
  return (
    <div style={{ display:'inline-flex', alignItems:'center', gap:4 }}>
      <button onClick={toggleStatus} disabled={!!toggling[item.id]} title={item.status === 'ACTIVE' ? 'Pausar' : 'Ativar'} style={{ width:30, height:30, borderRadius:6, border:'1px solid rgba(255,255,255,0.08)', background:'rgba(255,255,255,0.04)', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', color: item.status === 'ACTIVE' ? '#f87171' : '#4ade80', transition:'all .15s' }}>
        {toggling[item.id] ? <RefreshCw size={12} style={{ animation:'spin 1s linear infinite', color:'rgba(255,255,255,0.4)' }} /> : item.status === 'ACTIVE' ? <Pause size={12} /> : <Play size={12} />}
      </button>
      {hasbudget && (
        <div style={{ position:'relative' }}>
          <button onClick={() => setScaleOpen(scaleOpen === item.id ? null : item.id)} disabled={!!scaling[item.id]} style={{ height:30, padding:'0 8px', borderRadius:6, border:'1px solid rgba(255,255,255,0.08)', background:'rgba(255,255,255,0.04)', cursor:'pointer', display:'flex', alignItems:'center', gap:3, color:'rgba(255,255,255,0.5)' }}>
            {scaling[item.id] ? <RefreshCw size={12} style={{ animation:'spin 1s linear infinite' }} /> : <><TrendingUp size={12} /><ChevronDown size={11} /></>}
          </button>
          {scaleOpen === item.id && <ScaleMenu item={item} level={level} scaling={scaling} setScaling={setScaling} setScaleOpen={setScaleOpen} customBudget={customBudget} setCustomBudget={setCustomBudget} setData={setData} />}
        </div>
      )}
    </div>
  )
}

function PreviewModal({ item, onClose }) {
  return (
    <div onClick={onClose} style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.85)', zIndex:1000, display:'flex', alignItems:'center', justifyContent:'center', padding:24, backdropFilter:'blur(6px)' }}>
      <div onClick={e => e.stopPropagation()} style={{ background:'#141414', border:'1px solid rgba(255,255,255,0.1)', borderRadius:16, overflow:'hidden', maxWidth:480, width:'100%', boxShadow:'0 24px 80px rgba(0,0,0,0.8)' }}>
        <div style={{ background:'#0a0a0a', display:'flex', alignItems:'center', justifyContent:'center', minHeight:280, position:'relative' }}>
          {item.thumbnail_url
            ? <img src={item.thumbnail_url} alt={item.name} style={{ maxWidth:'100%', maxHeight:360, objectFit:'contain', display:'block' }} />
            : <div style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:10, color:'rgba(255,255,255,0.2)' }}>
                <ImageOff size={40} />
                <span style={{ fontSize:12 }}>Sem prévia disponível</span>
              </div>
          }
          <button onClick={onClose} style={{ position:'absolute', top:12, right:12, width:30, height:30, borderRadius:'50%', background:'rgba(0,0,0,0.6)', border:'1px solid rgba(255,255,255,0.15)', color:'white', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center' }}>
            <X size={14} />
          </button>
        </div>
        <div style={{ padding:'20px 24px' }}>
          <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', gap:12, marginBottom:16 }}>
            <div style={{ minWidth:0 }}>
              <p style={{ color:'white', fontWeight:700, fontSize:15, marginBottom:4, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{item.name}</p>
              <p style={{ color:'rgba(255,255,255,0.35)', fontSize:12, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{item.adset_name || '—'}</p>
            </div>
            <StatusPill status={item.effective_status} />
          </div>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10 }}>
            {[
              { label:'Campanha', value: item.campaign_name || '—' },
              { label:'Cliente', value: item.client_name || '—' },
              { label:'Gasto', value: item.spend > 0 ? fmtBRL(item.spend) : '—' },
              { label:'Impressões', value: fmtInt(item.impressions) },
              { label:'Cliques', value: fmtInt(item.clicks) },
              { label:'CTR', value: item.ctr != null ? Number(item.ctr).toFixed(2) + '%' : '—' },
            ].map(({ label, value }) => (
              <div key={label} style={{ background:'rgba(255,255,255,0.03)', borderRadius:8, padding:'10px 12px' }}>
                <p style={{ fontSize:10, color:'rgba(255,255,255,0.3)', letterSpacing:1.5, textTransform:'uppercase', marginBottom:4 }}>{label}</p>
                <p style={{ fontSize:13, color:'white', fontWeight:500, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{value}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default function Traffic() {
  const [clients, setClients]           = useState([])
  const [selectedClient, setSelectedClient] = useState('all')
  const [period, setPeriod]             = useState('today')
  const [tab, setTab]                   = useState('campaigns')
  const [campaigns, setCampaigns]       = useState([])
  const [adsets, setAdsets]             = useState([])
  const [ads, setAds]                   = useState([])
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
  const [preview, setPreview]           = useState(null)

  useEffect(() => { api.get('/traffic/clients').then(r => setClients(r.data)).catch(() => {}) }, [])

  const loadData = useCallback(async () => {
    setLoading(true); setError(null)
    const p = '?period=' + period + (selectedClient !== 'all' ? '&client_id=' + selectedClient : '')
    try {
      if (tab === 'campaigns') { const { data } = await api.get('/traffic/campaigns' + p); setCampaigns(Array.isArray(data) ? data : []) }
      else if (tab === 'adsets') { const { data } = await api.get('/traffic/adsets' + p); setAdsets(Array.isArray(data) ? data : []) }
      else { const { data } = await api.get('/traffic/ads' + p); setAds(Array.isArray(data) ? data : []) }
    } catch (err) { setError(err.response?.data?.error || 'Erro ao carregar dados') }
    setLoading(false)
  }, [tab, selectedClient, period])

  useEffect(() => { loadData() }, [loadData])

  const runOptimize = async () => {
    setAiLoading(true); setAiResult(null); setAiError(null)
    try {
      const { data } = await api.post('/traffic/optimize', { client_id: selectedClient !== 'all' ? selectedClient : undefined, period })
      setAiResult(data)
    } catch (err) { setAiError(err.response?.data?.error || 'Erro ao gerar análise') }
    setAiLoading(false)
  }

  const applyRec = async (rec) => {
    if (rec.acao === 'manter') return
    setApplying(a => ({ ...a, [rec.campaign_id]: true }))
    try {
      if (rec.acao === 'pausar') {
        await api.post('/traffic/campaigns/' + rec.campaign_id + '/status', { status: 'PAUSED' })
        setCampaigns(p => p.map(x => x.id === rec.campaign_id ? { ...x, status:'PAUSED', effective_status:'PAUSED' } : x))
      } else if ((rec.acao === 'escalar' || rec.acao === 'reduzir') && rec.percentual) {
        const c = campaigns.find(x => x.id === rec.campaign_id)
        if (c && c.daily_budget) {
          const sign = rec.acao === 'reduzir' ? -1 : 1
          const nb = +(c.daily_budget * (1 + sign * rec.percentual / 100)).toFixed(2)
          await api.post('/traffic/campaigns/' + rec.campaign_id + '/budget', { daily_budget: nb })
          setCampaigns(p => p.map(x => x.id === rec.campaign_id ? { ...x, daily_budget: nb } : x))
        }
      }
      setAiResult(r => ({ ...r, recomendacoes: r.recomendacoes.map(x => x.campaign_id === rec.campaign_id ? { ...x, _applied: true } : x) }))
    } catch (err) { alert(err.response?.data?.error || 'Erro ao aplicar') }
    setApplying(a => ({ ...a, [rec.campaign_id]: false }))
  }

  const currentData = tab === 'campaigns' ? campaigns : tab === 'adsets' ? adsets : ads
  const setCurrentData = tab === 'campaigns' ? setCampaigns : tab === 'adsets' ? setAdsets : setAds

  const TH = ({ children, right }) => (
    <th style={{ padding:'10px 16px', textAlign: right ? 'right' : 'left', fontSize:10, fontWeight:700, letterSpacing:1.5, textTransform:'uppercase', color:'rgba(255,255,255,0.3)', whiteSpace:'nowrap', borderBottom:'1px solid rgba(255,255,255,0.06)', background:'rgba(255,255,255,0.02)' }}>{children}</th>
  )

  return (
    <div style={{ display:'flex', flexDirection:'column', height:'100%' }}>
      <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>

      {/* Top bar */}
      <div style={{ padding:'24px 28px 0', flexShrink:0 }}>
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', flexWrap:'wrap', gap:12, marginBottom:20 }}>
          <div>
            <h1 style={{ fontSize:22, fontWeight:700, color:'white', margin:0 }}>Tráfego</h1>
            <p style={{ fontSize:12, color:'rgba(255,255,255,0.3)', marginTop:4 }}>
              {loading ? 'Carregando...' : currentData.length + ' ' + (tab === 'campaigns' ? 'campanha' : tab === 'adsets' ? 'conjunto' : 'criativo') + (currentData.length !== 1 ? 's' : '')}
            </p>
          </div>
          <div style={{ display:'flex', alignItems:'center', gap:8, flexWrap:'wrap' }}>
            <select value={selectedClient} onChange={e => setSelectedClient(e.target.value)} style={{ background:'#1a1a1a', border:'1px solid rgba(255,255,255,0.1)', borderRadius:8, padding:'7px 12px', color:'white', fontSize:12, outline:'none', cursor:'pointer', fontWeight:500 }}>
              <option value="all">Todos os clientes</option>
              {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
            <div style={{ display:'flex', background:'#1a1a1a', border:'1px solid rgba(255,255,255,0.1)', borderRadius:8, overflow:'hidden' }}>
              {PERIODS.map(p => (
                <button key={p.key} onClick={() => setPeriod(p.key)} style={{ padding:'7px 14px', border:'none', fontSize:12, fontWeight:600, cursor:'pointer', transition:'all .15s', background: period === p.key ? '#a78bfa' : 'transparent', color: period === p.key ? 'white' : 'rgba(255,255,255,0.35)' }}>{p.label}</button>
              ))}
            </div>
            <button onClick={loadData} disabled={loading} style={{ width:34, height:34, borderRadius:8, background:'#1a1a1a', border:'1px solid rgba(255,255,255,0.1)', color:'rgba(255,255,255,0.4)', display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer' }}>
              <RefreshCw size={14} style={{ animation: loading ? 'spin 1s linear infinite' : 'none' }} />
            </button>
            <button onClick={runOptimize} disabled={aiLoading || campaigns.length === 0} style={{ display:'flex', alignItems:'center', gap:7, padding:'7px 16px', borderRadius:8, background:'rgba(167,139,250,0.12)', border:'1px solid rgba(167,139,250,0.35)', color:'#a78bfa', fontSize:12, fontWeight:700, cursor:'pointer', opacity: aiLoading ? 0.6 : 1 }}>
              {aiLoading ? <><RefreshCw size={13} style={{ animation:'spin 1s linear infinite' }} /> Analisando...</> : <><Sparkles size={13} /> Otimizar com IA</>}
            </button>
          </div>
        </div>
        <div style={{ display:'flex', gap:0, borderBottom:'1px solid rgba(255,255,255,0.06)' }}>
          {TABS.map(t => (
            <button key={t.key} onClick={() => setTab(t.key)} style={{ padding:'10px 20px', border:'none', background:'none', cursor:'pointer', fontSize:13, fontWeight:600, transition:'all .15s', color: tab === t.key ? 'white' : 'rgba(255,255,255,0.3)', borderBottom: tab === t.key ? '2px solid #a78bfa' : '2px solid transparent', marginBottom:-1 }}>{t.label}</button>
          ))}
        </div>
      </div>

      {error && (
        <div style={{ margin:'12px 28px 0', padding:'12px 16px', background:'rgba(248,113,113,0.08)', border:'1px solid rgba(248,113,113,0.2)', borderRadius:10, color:'#f87171', fontSize:13, display:'flex', gap:8, alignItems:'center', flexShrink:0 }}>
          <AlertCircle size={15} /> {error}
        </div>
      )}

      {/* AI panel */}
      {(aiResult || aiError) && (
        <div style={{ margin:'12px 28px 0', background:'#131313', border:'1px solid rgba(167,139,250,0.25)', borderRadius:12, overflow:'hidden', flexShrink:0 }}>
          <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'12px 18px', borderBottom:'1px solid rgba(255,255,255,0.06)' }}>
            <div style={{ display:'flex', alignItems:'center', gap:8 }}>
              <Sparkles size={14} color="#a78bfa" />
              <span style={{ color:'white', fontWeight:600, fontSize:13 }}>Análise de IA — Claude</span>
            </div>
            <button onClick={() => { setAiResult(null); setAiError(null) }} style={{ background:'none', border:'none', color:'rgba(255,255,255,0.3)', cursor:'pointer' }}><X size={15} /></button>
          </div>
          {aiError ? <div style={{ padding:'16px 18px', color:'#f87171', fontSize:13 }}>{aiError}</div> : (
            <div style={{ padding:'14px 18px' }}>
              {aiResult && aiResult.resumo && <p style={{ color:'rgba(255,255,255,0.5)', fontSize:13, lineHeight:1.6, marginBottom:12, paddingBottom:12, borderBottom:'1px solid rgba(255,255,255,0.06)' }}>{aiResult.resumo}</p>}
              <div style={{ display:'flex', flexDirection:'column', gap:6 }}>
                {aiResult && aiResult.recomendacoes && aiResult.recomendacoes.map((rec, i) => {
                  const acolor = { pausar:'#f87171', escalar:'#4ade80', reduzir:'#facc15', manter:'#6b7280' }[rec.acao]
                  return (
                    <div key={i} style={{ display:'flex', alignItems:'center', gap:12, padding:'10px 14px', background:'rgba(255,255,255,0.02)', borderRadius:8, border:'1px solid rgba(255,255,255,0.05)', opacity: rec._applied ? 0.45 : 1 }}>
                      <PriorityDot p={rec.prioridade} />
                      <div style={{ flex:1, minWidth:0 }}>
                        <div style={{ display:'flex', alignItems:'center', gap:8, flexWrap:'wrap' }}>
                          <span style={{ color:'white', fontSize:12, fontWeight:600 }}>{rec.campaign_name}</span>
                          <span style={{ color:'rgba(255,255,255,0.3)', fontSize:11 }}>· {rec.cliente}</span>
                          <span style={{ color:acolor, fontSize:11, fontWeight:700, textTransform:'uppercase' }}>{rec.acao}{rec.percentual ? ' ' + (rec.acao === 'reduzir' ? '-' : '+') + rec.percentual + '%' : ''}</span>
                        </div>
                        <p style={{ color:'rgba(255,255,255,0.35)', fontSize:11, marginTop:2 }}>{rec.motivo}</p>
                      </div>
                      {rec._applied
                        ? <span style={{ color:'#4ade80', fontSize:11, fontWeight:700, display:'flex', alignItems:'center', gap:4, flexShrink:0 }}><Check size={12} /> Aplicado</span>
                        : rec.acao !== 'manter'
                          ? <button onClick={() => applyRec(rec)} disabled={!!applying[rec.campaign_id]} style={{ display:'flex', alignItems:'center', gap:5, padding:'5px 12px', borderRadius:6, background:'rgba(167,139,250,0.12)', border:'1px solid rgba(167,139,250,0.3)', color:'#a78bfa', fontSize:11, fontWeight:700, cursor:'pointer', flexShrink:0 }}>
                              {applying[rec.campaign_id] ? <RefreshCw size={11} style={{ animation:'spin 1s linear infinite' }} /> : <Zap size={11} />}
                              {applying[rec.campaign_id] ? 'Aplicando...' : 'Aplicar'}
                            </button>
                          : <span style={{ color:'rgba(255,255,255,0.2)', fontSize:11, flexShrink:0 }}>Manter</span>
                      }
                    </div>
                  )
                })}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Table */}
      <div style={{ flex:1, overflowY:'auto', overflowX:'auto', padding:'16px 28px 28px' }}>
        {loading ? (
          <div style={{ display:'flex', justifyContent:'center', paddingTop:60 }}>
            <RefreshCw size={20} color="rgba(255,255,255,0.2)" style={{ animation:'spin 1s linear infinite' }} />
          </div>
        ) : currentData.length === 0 ? (
          <div style={{ textAlign:'center', padding:'60px 0', color:'rgba(255,255,255,0.2)', fontSize:13 }}>
            <TrendingUp size={28} style={{ margin:'0 auto 12px', opacity:0.3 }} />
            <p>Nenhum dado encontrado. Verifique o token Meta nas Integrações.</p>
          </div>
        ) : (
          <table style={{ width:'100%', borderCollapse:'collapse', background:'#111', borderRadius:12, overflow:'hidden', border:'1px solid rgba(255,255,255,0.06)' }}>
            <thead>
              <tr>
                {tab === 'ads' && <TH>Thumb</TH>}
                <TH>{tab === 'campaigns' ? 'Campanha' : tab === 'adsets' ? 'Conjunto' : 'Anúncio'}</TH>
                {tab !== 'campaigns' && <TH>Campanha</TH>}
                <TH>Cliente</TH>
                <TH>Status</TH>
                {tab !== 'ads' && <TH>Orçamento/dia</TH>}
                <TH right>Gasto</TH>
                <TH right>Impressões</TH>
                <TH right>Cliques</TH>
                <TH right>Leads</TH>
                <TH right>CPL</TH>
                <TH right>CTR</TH>
                <TH right>Ações</TH>
              </tr>
            </thead>
            <tbody>
              {currentData.map(item => (
                <tr key={item.id}
                  onMouseEnter={e => e.currentTarget.style.background='rgba(255,255,255,0.025)'}
                  onMouseLeave={e => e.currentTarget.style.background='transparent'}
                  style={{ transition:'background .1s' }}>

                  {tab === 'ads' && (
                    <td style={{ padding:'10px 16px', borderBottom:'1px solid rgba(255,255,255,0.04)', width:56 }}>
                      <div onClick={() => setPreview(item)} style={{ cursor:'pointer', width:40, height:40, borderRadius:6, overflow:'hidden', background:'rgba(255,255,255,0.05)', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }} title="Ver prévia">
                        {item.thumbnail_url
                          ? <img src={item.thumbnail_url} alt="" style={{ width:40, height:40, objectFit:'cover', display:'block' }} />
                          : <ImageOff size={14} color="rgba(255,255,255,0.2)" />
                        }
                      </div>
                    </td>
                  )}

                  <td style={{ padding:'13px 16px', borderBottom:'1px solid rgba(255,255,255,0.04)', maxWidth:260 }}>
                    <p style={{ fontSize:13, fontWeight:500, color:'rgba(255,255,255,0.88)', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }} title={item.name}>{item.name}</p>
                    <p style={{ fontSize:10, color:'rgba(255,255,255,0.22)', marginTop:2, letterSpacing:0.5 }}>
                      {tab === 'campaigns' && (OBJ_LABEL[item.objective] || item.objective || '—')}
                      {tab === 'adsets' && (OPT_LABEL[item.optimization_goal] || item.optimization_goal || '—')}
                      {tab === 'ads' && (item.adset_name || '—')}
                    </p>
                  </td>

                  {tab !== 'campaigns' && (
                    <td style={{ padding:'13px 16px', borderBottom:'1px solid rgba(255,255,255,0.04)', maxWidth:200 }}>
                      <span style={{ fontSize:12, color:'rgba(255,255,255,0.4)', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap', display:'block' }} title={item.campaign_name}>{item.campaign_name}</span>
                    </td>
                  )}

                  <td style={{ padding:'13px 16px', borderBottom:'1px solid rgba(255,255,255,0.04)', fontSize:12, color:'rgba(255,255,255,0.35)', whiteSpace:'nowrap' }}>{item.client_name}</td>
                  <td style={{ padding:'13px 16px', borderBottom:'1px solid rgba(255,255,255,0.04)', whiteSpace:'nowrap' }}><StatusPill status={item.effective_status} /></td>
                  {tab !== 'ads' && <td style={{ padding:'13px 16px', borderBottom:'1px solid rgba(255,255,255,0.04)', fontFamily:'monospace', fontSize:13, color:'rgba(255,255,255,0.5)', whiteSpace:'nowrap' }}>{item.daily_budget ? fmtBRL(item.daily_budget) : '—'}</td>}
                  <td style={{ padding:'13px 16px', borderBottom:'1px solid rgba(255,255,255,0.04)', textAlign:'right', fontFamily:'monospace', fontSize:13, color:'rgba(255,255,255,0.85)', whiteSpace:'nowrap' }}>{fmtBRL(item.spend)}</td>
                  <td style={{ padding:'13px 16px', borderBottom:'1px solid rgba(255,255,255,0.04)', textAlign:'right', fontFamily:'monospace', fontSize:13, color:'rgba(255,255,255,0.4)', whiteSpace:'nowrap' }}>{fmtInt(item.impressions)}</td>
                  <td style={{ padding:'13px 16px', borderBottom:'1px solid rgba(255,255,255,0.04)', textAlign:'right', fontFamily:'monospace', fontSize:13, color:'rgba(255,255,255,0.5)', whiteSpace:'nowrap' }}>{fmtInt(item.clicks)}</td>
                  <td style={{ padding:'13px 16px', borderBottom:'1px solid rgba(255,255,255,0.04)', textAlign:'right', fontFamily:'monospace', fontSize:13, color:'rgba(255,255,255,0.4)', whiteSpace:'nowrap' }}>{fmtInt(item.leads)}</td>
                  <td style={{ padding:'13px 16px', borderBottom:'1px solid rgba(255,255,255,0.04)', textAlign:'right', whiteSpace:'nowrap' }}><CplCell cpl={item.cpl} /></td>
                  <td style={{ padding:'13px 16px', borderBottom:'1px solid rgba(255,255,255,0.04)', textAlign:'right', fontFamily:'monospace', fontSize:13, color:'rgba(255,255,255,0.4)', whiteSpace:'nowrap' }}>{item.ctr != null ? Number(item.ctr).toFixed(2) + '%' : '—'}</td>
                  <td style={{ padding:'13px 16px', borderBottom:'1px solid rgba(255,255,255,0.04)', textAlign:'right', whiteSpace:'nowrap' }}>
                    <ActionBtns item={item} level={tab} toggling={toggling} setToggling={setToggling} scaling={scaling} setScaling={setScaling} scaleOpen={scaleOpen} setScaleOpen={setScaleOpen} customBudget={customBudget} setCustomBudget={setCustomBudget} setData={setCurrentData} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {preview && <PreviewModal item={preview} onClose={() => setPreview(null)} />}
    </div>
  )
}
