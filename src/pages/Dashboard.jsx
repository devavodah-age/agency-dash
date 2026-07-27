import { useState, useEffect, useCallback } from 'react'
import { TrendingUp, Users, DollarSign, MousePointer, RefreshCw, Target, ChevronUp, ChevronDown, ChevronsUpDown } from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts'
import api from '../lib/api'

const PERIODS = [
  { key: 'today', label: 'Hoje' },
  { key: 'last_7d', label: '7 dias' },
  { key: 'last_30d', label: '30 dias' },
  { key: 'this_month', label: 'Este mês' },
]

const COLS = [
  { key: 'name',   label: 'Cliente' },
  { key: 'spend',  label: 'Investido' },
  { key: 'clicks', label: 'Cliques' },
  { key: 'leads',  label: 'Leads' },
  { key: 'cpl',    label: 'CPL' },
]

function fmt(val, prefix = '') {
  if (val == null || val === 0) return '—'
  return prefix + Number(val).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}
function fmtInt(val) {
  if (val == null) return '—'
  return Number(val).toLocaleString('pt-BR')
}
function cplColor(v) {
  if (!v) return '#6b7280'
  if (v < 20) return '#4ade80'
  if (v < 50) return '#facc15'
  return '#f87171'
}

const CustomTooltip = ({ active, payload }) => {
  if (!active || !payload?.length) return null
  const d = payload[0].payload
  return (
    <div style={{ background: '#111', border: '1px solid #222', borderRadius: 10, padding: '10px 14px' }}>
      <p style={{ color: 'white', fontWeight: 700, fontSize: 13, marginBottom: 4 }}>{d.name}</p>
      <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: 12 }}>R$ {Number(d.spend).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
    </div>
  )
}

export default function Dashboard() {
  const [period, setPeriod] = useState('last_30d')
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [sort, setSort] = useState({ key: 'spend', dir: 'desc' })

  const load = useCallback(async () => {
    setLoading(true); setError(null)
    try {
      const { data: res } = await api.get(`/meta/overview?period=${period}`)
      setData(res)
    } catch (err) {
      setError(err.response?.data?.error || 'Erro ao carregar dados')
    }
    setLoading(false)
  }, [period])

  useEffect(() => { load() }, [load])

  const toggleSort = key => {
    setSort(s => s.key === key ? { key, dir: s.dir === 'desc' ? 'asc' : 'desc' } : { key, dir: 'desc' })
  }

  const sorted = data?.clients ? [...data.clients].sort((a, b) => {
    const av = a[sort.key] ?? (sort.key === 'name' ? '' : -1)
    const bv = b[sort.key] ?? (sort.key === 'name' ? '' : -1)
    if (sort.key === 'name') return sort.dir === 'asc' ? av.localeCompare(bv) : bv.localeCompare(av)
    return sort.dir === 'asc' ? av - bv : bv - av
  }) : []

  const totalSpend = sorted.reduce((sum, c) => sum + (c.spend || 0), 0)

  const stats = data ? [
    { label: 'Investimento Total', value: fmt(data.totals.spend, 'R$ '), icon: DollarSign, sub: 'período selecionado' },
    { label: 'Clientes', value: fmtInt(data.total_clients), icon: Users, sub: `${data.active_clients} com gastos no período` },
    { label: 'Leads', value: fmtInt(data.totals.leads), icon: Target, sub: 'conversões registradas' },
    { label: 'CPL Médio', value: fmt(data.totals.cpl, 'R$ '), icon: TrendingUp, sub: 'custo por lead' },
    { label: 'Cliques', value: fmtInt(data.totals.clicks), icon: MousePointer, sub: 'total no período' },
  ] : []

  const SortIcon = ({ col }) => {
    if (sort.key !== col) return <ChevronsUpDown className="w-3 h-3 opacity-30" />
    return sort.dir === 'asc' ? <ChevronUp className="w-3 h-3 opacity-70" /> : <ChevronDown className="w-3 h-3 opacity-70" />
  }

  return (
    <div className="p-6 lg:p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
        <div>
          <h1 className="text-white text-2xl font-bold">Dashboard</h1>
          <p className="text-brand-dim text-sm mt-1">Visão geral da agência</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex bg-surface-card border border-surface-border rounded-lg overflow-hidden">
            {PERIODS.map(p => (
              <button key={p.key} onClick={() => setPeriod(p.key)}
                className={`px-3 py-1.5 text-xs font-medium transition-colors ${period === p.key ? 'bg-accent text-white' : 'text-brand-dim hover:text-white'}`}>
                {p.label}
              </button>
            ))}
          </div>
          <button onClick={load} disabled={loading}
            className="p-2 bg-surface-card border border-surface-border rounded-lg text-brand-dim hover:text-white transition-colors">
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm">{error}</div>
      )}

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 mb-6">
        {loading
          ? Array(5).fill(0).map((_, i) => (
              <div key={i} className="bg-surface-card border border-surface-border rounded-xl p-5 animate-pulse">
                <div className="h-3 bg-surface-border rounded w-2/3 mb-4" />
                <div className="h-7 bg-surface-border rounded w-1/2" />
              </div>
            ))
          : stats.map(({ label, value, icon: Icon, sub }) => (
              <div key={label} className="bg-surface-card border border-surface-border rounded-xl p-5 relative overflow-hidden group hover:border-white/20 transition-colors">
                <div className="flex items-center justify-between mb-3">
                  <p className="text-brand-dim text-[10px] uppercase tracking-widest font-semibold">{label}</p>
                  <Icon className="w-4 h-4 text-accent opacity-50 group-hover:opacity-80 transition-opacity" />
                </div>
                <p className="text-white text-2xl font-bold tracking-tight">{value}</p>
                <p className="text-brand-dim text-[10px] mt-1.5 opacity-50">{sub}</p>
              </div>
            ))
        }
      </div>

      {/* Chart + Table layout */}
      {!loading && data?.clients?.length > 0 && (
        <div className="mb-6 bg-surface-card border border-surface-border rounded-xl p-5">
          <p className="text-white font-semibold text-sm mb-1">Investimento por Cliente</p>
          <p className="text-brand-dim text-xs mb-5">Distribuição do gasto no período</p>
          <ResponsiveContainer width="100%" height={Math.max(120, data.clients.length * 40)}>
            <BarChart
              layout="vertical"
              data={[...data.clients].sort((a, b) => (b.spend || 0) - (a.spend || 0))}
              margin={{ left: 0, right: 40, top: 0, bottom: 0 }}
            >
              <XAxis type="number" hide />
              <YAxis
                type="category" dataKey="name" width={110}
                tick={{ fill: 'rgba(255,255,255,0.45)', fontSize: 11 }}
                axisLine={false} tickLine={false}
              />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.03)' }} />
              <Bar dataKey="spend" radius={[0, 6, 6, 0]} barSize={18}>
                {[...data.clients].sort((a, b) => (b.spend || 0) - (a.spend || 0)).map((entry, i) => (
                  <Cell key={i} fill={i === 0 ? 'rgba(255,255,255,0.85)' : `rgba(255,255,255,${Math.max(0.12, 0.55 - i * 0.1)})`} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Client table */}
      <div className="bg-surface-card border border-surface-border rounded-xl overflow-hidden">
        <div className="p-5 border-b border-surface-border flex items-center justify-between">
          <div>
            <p className="text-white font-semibold">Performance por Cliente</p>
            <p className="text-brand-dim text-xs mt-1">
              {loading ? 'Carregando...' : data ? `${data.active_clients} clientes com dados no período` : ''}
            </p>
          </div>
        </div>

        {loading ? (
          <div className="p-8 flex items-center justify-center">
            <RefreshCw className="w-5 h-5 animate-spin text-brand-dim" />
          </div>
        ) : !data || sorted.length === 0 ? (
          <div className="p-8 text-center">
            <p className="text-brand-dim text-sm">
              {error ? 'Configure a integração Meta na aba Integrações' : 'Nenhum cliente com dados no período'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-surface-border">
                  {COLS.map(col => (
                    <th key={col.key}
                      onClick={() => toggleSort(col.key)}
                      className="text-left px-5 py-3 cursor-pointer select-none group">
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs text-brand-dim uppercase tracking-wider group-hover:text-white transition-colors">{col.label}</span>
                        <SortIcon col={col.key} />
                      </div>
                    </th>
                  ))}
                  <th className="px-5 py-3 text-xs text-brand-dim uppercase tracking-wider text-left">% Gasto</th>
                </tr>
              </thead>
              <tbody>
                {sorted.map((c, i) => {
                  const pct = totalSpend > 0 ? ((c.spend || 0) / totalSpend) * 100 : 0
                  return (
                    <tr key={c.id} className={`border-b border-surface-border/50 hover:bg-white/[0.02] transition-colors ${i === sorted.length - 1 ? 'border-0' : ''}`}>
                      <td className="px-5 py-4 text-white font-medium text-sm">{c.name}</td>
                      <td className="px-5 py-4 text-white text-sm font-mono">{fmt(c.spend, 'R$ ')}</td>
                      <td className="px-5 py-4 text-brand-dim text-sm">{fmtInt(c.clicks)}</td>
                      <td className="px-5 py-4 text-brand-dim text-sm">{fmtInt(c.leads)}</td>
                      <td className="px-5 py-4 text-sm">
                        <span className="font-medium" style={{ color: cplColor(c.cpl) }}>
                          {fmt(c.cpl, 'R$ ')}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="flex-1 h-1.5 bg-surface-border rounded-full overflow-hidden" style={{ minWidth: 60 }}>
                            <div className="h-full rounded-full bg-white/50 transition-all" style={{ width: `${pct}%` }} />
                          </div>
                          <span className="text-brand-dim text-xs font-mono w-10 text-right">{pct.toFixed(0)}%</span>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
