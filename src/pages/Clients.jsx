import { useState, useEffect } from 'react'
import { Plus, Pencil, Trash2 } from 'lucide-react'
import api from '../lib/api'

export default function Clients() {
  const [clients, setClients] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ name: '', email: '', meta_account_id: '' })
  const [saving, setSaving] = useState(false)

  const load = async () => {
    try {
      const { data } = await api.get('/clients')
      setClients(data)
    } catch {}
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  const handleSubmit = async e => {
    e.preventDefault()
    setSaving(true)
    try {
      await api.post('/clients', form)
      setForm({ name: '', email: '', meta_account_id: '' })
      setShowForm(false)
      load()
    } catch {}
    setSaving(false)
  }

  const handleDelete = async id => {
    if (!confirm('Remover cliente?')) return
    await api.delete(`/clients/${id}`)
    load()
  }

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-white text-2xl font-bold">Clientes</h1>
          <p className="text-brand-dim text-sm mt-1">{clients.length} cliente{clients.length !== 1 ? 's' : ''} cadastrado{clients.length !== 1 ? 's' : ''}</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 bg-white text-black text-sm font-bold px-4 py-2.5 rounded-lg hover:bg-gray-100 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Novo Cliente
        </button>
      </div>

      {/* Form */}
      {showForm && (
        <form onSubmit={handleSubmit} className="bg-surface-card border border-surface-border rounded-xl p-6 mb-6 space-y-4">
          <p className="text-white font-semibold">Novo Cliente</p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs text-brand-dim mb-1.5 uppercase tracking-wider">Nome *</label>
              <input
                value={form.name}
                onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                required
                className="w-full bg-surface border border-surface-border rounded-lg px-3 py-2.5 text-white text-sm outline-none focus:border-white transition-colors"
                placeholder="Nome do cliente"
              />
            </div>
            <div>
              <label className="block text-xs text-brand-dim mb-1.5 uppercase tracking-wider">Email</label>
              <input
                type="email"
                value={form.email}
                onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                className="w-full bg-surface border border-surface-border rounded-lg px-3 py-2.5 text-white text-sm outline-none focus:border-white transition-colors"
                placeholder="email@cliente.com"
              />
            </div>
            <div>
              <label className="block text-xs text-brand-dim mb-1.5 uppercase tracking-wider">ID Conta Meta</label>
              <input
                value={form.meta_account_id}
                onChange={e => setForm(f => ({ ...f, meta_account_id: e.target.value }))}
                className="w-full bg-surface border border-surface-border rounded-lg px-3 py-2.5 text-white text-sm outline-none focus:border-white transition-colors"
                placeholder="act_XXXXXXXXXX"
              />
            </div>
          </div>
          <div className="flex gap-3">
            <button type="submit" disabled={saving} className="bg-white text-black text-sm font-bold px-5 py-2.5 rounded-lg hover:bg-gray-100 transition-colors disabled:opacity-50">
              {saving ? 'Salvando...' : 'Salvar'}
            </button>
            <button type="button" onClick={() => setShowForm(false)} className="text-brand-dim text-sm px-5 py-2.5 rounded-lg hover:text-white transition-colors">
              Cancelar
            </button>
          </div>
        </form>
      )}

      {/* Lista */}
      {loading ? (
        <div className="flex justify-center py-20">
          <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
        </div>
      ) : clients.length === 0 ? (
        <div className="bg-surface-card border border-dashed border-surface-border rounded-xl p-12 text-center">
          <p className="text-brand-dim">Nenhum cliente cadastrado ainda.</p>
        </div>
      ) : (
        <div className="bg-surface-card border border-surface-border rounded-xl overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-surface-border">
                <th className="text-left px-6 py-3 text-xs text-brand-dim uppercase tracking-wider">Nome</th>
                <th className="text-left px-6 py-3 text-xs text-brand-dim uppercase tracking-wider">Email</th>
                <th className="text-left px-6 py-3 text-xs text-brand-dim uppercase tracking-wider">Conta Meta</th>
                <th className="px-6 py-3" />
              </tr>
            </thead>
            <tbody>
              {clients.map(c => (
                <tr key={c.id} className="border-b border-surface-border last:border-0 hover:bg-surface-hover transition-colors">
                  <td className="px-6 py-4 text-white text-sm font-medium">{c.name}</td>
                  <td className="px-6 py-4 text-brand-dim text-sm">{c.email || '—'}</td>
                  <td className="px-6 py-4 text-brand-dim text-sm font-mono">{c.meta_account_id || '—'}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-end gap-2">
                      <button className="p-1.5 text-brand-dim hover:text-white transition-colors">
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button onClick={() => handleDelete(c.id)} className="p-1.5 text-brand-dim hover:text-red-400 transition-colors">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
