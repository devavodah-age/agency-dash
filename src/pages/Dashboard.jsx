import { useState, useEffect, useCallback } from 'react'
import { TrendingUp, Users, DollarSign, MousePointer, RefreshCw, Target } from 'lucide-react'
import api from '../lib/api'

const PERIODS = [
  { key: 'today', label: 'Hoje' },
  { key: 'last_7d', label: '7 dias' },
  { key: 'last_30d', label: '30 dias' },
  { key: 'this_month', label: 'Este mês' },
]

function fmt(val, prefix = '') {
  if (val == null) return '—'
  return prefix + val.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

function fmtInt(val) {
  if (val == null) return '—'
  return val.toLocaleString('pt-BR')
}

export default function Dashboard() {
  const [period, setPeriod] = useState('last_30d')
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const { data: res } = await api.get(`/meta/overview?period=${period}`)
      setData(res)
    } catch (err) {
      setError(err.response?.data?.error || 'Erro ao carregar dados')
    }
    setLoading(false)
  }, [period])

  useEffect(() => { load() }, [load])

  const stats = data ? [
    { label: 'Investimento Total', value: fmt(data.totals.spend, 'R$ '), icon: DollarSign },
    { label: 'Clientes Ativos', value: `${data.active_clients} / ${data.total_clients}`, icon: Users },
    { label: 'Leads', value: fmtInt(data.totals.leads), icon: Target },
    { label: 'CPL Médio', value: fmt(data.totals.cpl, 'R$ '), icon: TrendingUp },
    { label: 'Cliques', value: fmtInt(data.totals.clicks), icon: MousePointer },
  ] : []

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
              <button
                key={p.key}
                onClick={() => setPeriod(p.key)}
                className={`px-3 py-1.5 text-xs font-medium transition-colors ${
                  period === p.key
                    ? 'bg-accent text-white'
                    : 'text-brand-dim hover:text-white'
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>
          <button
            onClick={load}
            disabled={loading}
            className="p-2 bg-surface-card border border-surface-border rounded-lg text-brand-dim hover:text-white transition-colors"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm">
          {error}
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
        {loading
          ? Array(5).fill(0).map((_, i) => (
              <div key={i} className="bg-surface-card border border-surface-border rounded-xl p-5 animate-pulse">
                <div className="h-3 bg-surface-border rounded w-2/3 mb-4" />
                <div className="h-7 bg-surface-border rounded w-1/2" />
              </div>
            ))
          : stats.map(({ label, value, icon: Icon }) => (
              <div key={label} className="bg-surface-card border border-surface-border rounded-xl p-5">
                <div className="flex items-center justify-between mb-3">
                  <p className="text-brand-dim text-xs uppercase tracking-wider">{label}</p>
                  <Icon className="w-4 h-4 text-accent opacity-70" />
                </div>
                <p className="text-white text-xl font-bold">{value}</p>
              </div>
            ))
        }
      </div>

      {/* Tabela por cliente */}
      <div className="bg-surface-card border border-surface-border rounded-xl overflow-hidden">
        <div className="p-5 border-b border-surface-border">
          <p className="text-white font-semibold">Performance por Cliente</p>
          <p className="text-brand-dim text-xs mt-1">
            {loading ? 'Carregando...' : data ? `${data.active_clients} clientes com dados no período` : ''}
          </p>
        </div>

        {loading ? (
          <div className="p-8 flex items-center justify-center">
            <RefreshCw className="w-5 h-5 animate-spin text-brand-dim" />
          </div>
        ) : !data || data.clients.length === 0 ? (
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
                  {['Cliente', 'Investido', 'Cliques', 'Leads', 'CPL'].map(h => (
                    <th key={h} className="text-left text-xs text-brand-dim uppercase tracking-wider px-5 py-3">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {data.clients.map((c, i) => (
                  <tr key={c.id} className={`border-b border-surface-border/50 hover:bg-white/[0.02] transition-colors ${i === data.clients.length - 1 ? 'border-0' : ''}`}>
                    <td className="px-5 py-4 text-white font-medium text-sm">{c.name}</td>
                    <td className="px-5 py-4 text-white text-sm">{fmt(c.spend, 'R$ ')}</td>
                    <td className="px-5 py-4 text-brand-dim text-sm">{fmtInt(c.clicks)}</td>
                    <td className="px-5 py-4 text-brand-dim text-sm">{fmtInt(c.leads)}</td>
                    <td className="px-5 py-4 text-sm">
                      <span className={`font-medium ${c.cpl ? (c.cpl < 20 ? 'text-green-400' : c.cpl < 50 ? 'text-yellow-400' : 'text-red-400') : 'text-brand-dim'}`}>
                        {fmt(c.cpl, 'R$ ')}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
