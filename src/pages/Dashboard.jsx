import { TrendingUp, Users, DollarSign, MousePointer } from 'lucide-react'

const stats = [
  { label: 'Investimento Total', value: 'R$ 0,00', icon: DollarSign, change: '—' },
  { label: 'Clientes Ativos', value: '0', icon: Users, change: '—' },
  { label: 'Cliques', value: '0', icon: MousePointer, change: '—' },
  { label: 'CPL Médio', value: 'R$ 0,00', icon: TrendingUp, change: '—' },
]

export default function Dashboard() {
  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-white text-2xl font-bold">Dashboard</h1>
        <p className="text-brand-dim text-sm mt-1">Visão geral da agência</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map(({ label, value, icon: Icon, change }) => (
          <div key={label} className="bg-surface-card border border-surface-border rounded-xl p-5">
            <div className="flex items-center justify-between mb-4">
              <p className="text-brand-dim text-xs uppercase tracking-wider">{label}</p>
              <Icon className="w-4 h-4 text-brand-dim" />
            </div>
            <p className="text-white text-2xl font-bold">{value}</p>
            <p className="text-brand-dim text-xs mt-1">{change}</p>
          </div>
        ))}
      </div>

      {/* Placeholder gráfico */}
      <div className="bg-surface-card border border-surface-border rounded-xl p-6">
        <p className="text-white font-semibold mb-1">Performance por Cliente</p>
        <p className="text-brand-dim text-sm mb-6">Conecte as contas Meta Ads para ver os dados</p>
        <div className="h-48 flex items-center justify-center border border-dashed border-surface-border rounded-lg">
          <p className="text-brand-dim text-sm">Aguardando integração Meta Ads</p>
        </div>
      </div>
    </div>
  )
}
