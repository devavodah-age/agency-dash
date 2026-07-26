import { useState, useEffect } from 'react'
import { Plus, Pencil, Trash2, X, Link, Users } from 'lucide-react'
import api from '../lib/api'

const EMPTY = { name: '', email: '', meta_account_id: '' }

export default function Clients() {
  const [clients, setClients] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [form, setForm] = useState(EMPTY)
  const [saving, setSaving] = useState(false)

  const [linkingId, setLinkingId] = useState(null)
  const [linkEmail, setLinkEmail] = useState('')
  const [linkMsg, setLinkMsg] = useState(null)
  const [linking, setLinking] = useState(false)

  const [linkedUsers, setLinkedUsers] = useState({})

  const load = async () => {
    try {
      const { data } = await api.get('/clients')
      setClients(data)
    } catch {}
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  const openNew = () => { setForm(EMPTY); setEditingId(null); setShowForm(true) }
  const openEdit = (c) => {
    setForm({ name: c.name, email: c.email || '', meta_account_id: c.meta_account_id || '' })
    setEditingId(c.id)
    setShowForm(true)
  }
  const closeForm = () => { setShowForm(false); setEditingId(null); setForm(EMPTY) }

  const handleSubmit = async e => {
    e.preventDefault(); setSaving(true)
    try {
      if (editingId) await api.put(`/clients/${editingId}`, form)
      else await api.post('/clients', form)
      closeForm(); load()
    } catch {}
    setSaving(false)
  }

  const handleDelete = async id => {
    if (!confirm('Remover cliente?')) return
    await api.delete(`/clients/${id}`); load()
  }

  const openLink = async (c) => {
    setLinkingId(c.id); setLinkEmail(''); setLinkMsg(null)
    try {
      const { data } = await api.get(`/clients/${c.id}/linked-users`)
      setLinkedUsers(prev => ({ ...prev, [c.id]: data }))
    } catch {}
  }

  const handleLink = async e => {
    e.preventDefault(); setLinking(true); setLinkMsg(null)
    try {
      await api.post(`/clients/${linkingId}/link-user`, { email: linkEmail })
      setLinkMsg({ ok: true, text: 'Usuário vinculado com sucesso!' })
      setLinkEmail('')
      const { data } = await api.get(`/clients/${linkingId}/linked-users`)
      setLinkedUsers(prev => ({ ...prev, [linkingId]: data }))
    } catch (err) {
      setLinkMsg({ ok: false, text: err?.response?.data?.error || 'Erro ao vincular' })
    }
    setLinking(false)
  }

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-white text-2xl font-bold">Clientes</h1>
          <p className="text-brand-dim text-sm mt-1">{clients.length} cliente{clients.length !== 1 ? 's' : ''} cadastrado{clients.length !== 1 ? 's' : ''}</p>
        </div>
        <button onClick={openNew} className="flex items-center gap-2 bg-white text-black text-sm font-bold px-4 py-2.5 rounded-lg hover:bg-gray-100 transition-colors">
          <Plus className="w-4 h-4" /> Novo Cliente
        </button>
      </div>

      {/* Edit/Create Form */}
      {showForm && (
        <form onSubmit={handleSubmit} className="bg-surface-card border border-surface-border rounded-xl p-6 mb-6 space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-white font-semibold">{editingId ? 'Editar Cliente' : 'Novo Cliente'}</p>
            <button type="button" onClick={closeForm} className="text-brand-dim hover:text-white transition-colors">
              <X className="w-4 h-4" />
            </button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs text-brand-dim mb-1.5 uppercase tracking-wider">Nome *</label>
              <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} required
                className="w-full bg-surface border border-surface-border rounded-lg px-3 py-2.5 text-white text-sm outline-none focus:border-white transition-colors"
                placeholder="Nome do cliente" />
            </div>
            <div>
              <label className="block text-xs text-brand-dim mb-1.5 uppercase tracking-wider">Email</label>
              <input type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                className="w-full bg-surface border border-surface-border rounded-lg px-3 py-2.5 text-white text-sm outline-none focus:border-white transition-colors"
                placeholder="email@cliente.com" />
            </div>
            <div>
              <label className="block text-xs text-brand-dim mb-1.5 uppercase tracking-wider">ID Conta Meta</label>
              <input value={form.meta_account_id} onChange={e => setForm(f => ({ ...f, meta_account_id: e.target.value }))}
                className="w-full bg-surface border border-surface-border rounded-lg px-3 py-2.5 text-white text-sm outline-none focus:border-white transition-colors"
                placeholder="940976846408593" />
              <p className="text-xs text-brand-dim mt-1">Só o número, sem act_</p>
            </div>
          </div>
          <div className="flex gap-3">
            <button type="submit" disabled={saving} className="bg-white text-black text-sm font-bold px-5 py-2.5 rounded-lg hover:bg-gray-100 transition-colors disabled:opacity-50">
              {saving ? 'Salvando...' : editingId ? 'Atualizar' : 'Salvar'}
            </button>
            <button type="button" onClick={closeForm} className="text-brand-dim text-sm px-5 py-2.5 rounded-lg hover:text-white transition-colors">
              Cancelar
            </button>
          </div>
        </form>
      )}

      {/* Link user panel */}
      {linkingId && (
        <div className="bg-surface-card border border-surface-border rounded-xl p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-brand-dim" />
              <p className="text-white font-semibold text-sm">Vincular usuário ao cliente</p>
            </div>
            <button onClick={() => { setLinkingId(null); setLinkMsg(null) }} className="text-brand-dim hover:text-white transition-colors">
              <X className="w-4 h-4" />
            </button>
          </div>

          <p className="text-xs text-brand-dim mb-4">Digite o e-mail da conta de cliente que deseja vincular. O cliente precisa ter criado a conta no portal primeiro.</p>

          <form onSubmit={handleLink} className="flex gap-3 mb-4">
            <input type="email" value={linkEmail} onChange={e => setLinkEmail(e.target.value)} required
              placeholder="email@cliente.com"
              className="flex-1 bg-surface border border-surface-border rounded-lg px-3 py-2.5 text-white text-sm outline-none focus:border-white transition-colors" />
            <button type="submit" disabled={linking} className="flex items-center gap-2 bg-white text-black text-xs font-bold px-4 py-2.5 rounded-lg hover:bg-gray-100 transition-colors disabled:opacity-50">
              <Link className="w-3.5 h-3.5" /> {linking ? 'Vinculando...' : 'Vincular'}
            </button>
          </form>

          {linkMsg && (
            <p className={`text-xs mb-4 ${linkMsg.ok ? 'text-green-400' : 'text-red-400'}`}>{linkMsg.text}</p>
          )}

          {linkedUsers[linkingId]?.length > 0 && (
            <div>
              <p className="text-xs text-brand-dim uppercase tracking-wider mb-2">Usuários vinculados</p>
              <div className="space-y-1">
                {linkedUsers[linkingId].map(u => (
                  <div key={u.id} className="flex items-center justify-between bg-surface rounded-lg px-3 py-2">
                    <p className="text-white text-sm">{u.name}</p>
                    <p className="text-brand-dim text-xs">{u.email}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {linkedUsers[linkingId]?.length === 0 && (
            <p className="text-xs text-brand-dim">Nenhum usuário vinculado a este cliente ainda.</p>
          )}
        </div>
      )}

      {/* List */}
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
                      <button onClick={() => openLink(c)} className="p-1.5 text-brand-dim hover:text-white transition-colors" title="Vincular usuário">
                        <Users className="w-4 h-4" />
                      </button>
                      <button onClick={() => openEdit(c)} className="p-1.5 text-brand-dim hover:text-white transition-colors">
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
