import React, { useState } from 'react'
import { Plus, Trash2, Pencil, Check, X } from 'lucide-react'
import { useData } from '../context/DataContext.jsx'

export default function Members() {
  const { members, addMember, updateMember, deleteMember } = useData()
  const [form, setForm] = useState({ name: '', email: '' })
  const [editingId, setEditingId] = useState(null)
  const [editForm, setEditForm] = useState({ name: '', email: '' })

  const submit = (e) => {
    e.preventDefault()
    if (!form.name.trim()) return
    addMember({ name: form.name.trim(), email: form.email.trim() })
    setForm({ name: '', email: '' })
  }

  const startEdit = (m) => { setEditingId(m.id); setEditForm({ name: m.name, email: m.email || '' }) }
  const saveEdit = () => {
    if (editForm.name.trim()) updateMember(editingId, { name: editForm.name.trim(), email: editForm.email.trim() })
    setEditingId(null)
  }

  return (
    <div className="space-y-5">
      <h1 className="font-display text-3xl font-bold text-ink">人員設定</h1>

      <form onSubmit={submit} className="bg-white rounded-2xl shadow-card p-4 space-y-2">
        <div className="flex gap-2">
          <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="姓名"
            className="flex-1 rounded-xl border border-black/10 px-4 py-2.5 text-base focus:outline-none focus:ring-2 focus:ring-orange" />
          <button className="bg-orange text-white rounded-xl px-4 flex items-center gap-1 font-medium text-sm active:scale-95 transition-transform">
            <Plus size={16} /> 新增
          </button>
        </div>
        <input type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
          placeholder="Email（選填，用來收場次提醒信）"
          className="w-full rounded-xl border border-black/10 px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange" />
      </form>

      <div className="bg-white rounded-2xl shadow-card divide-y divide-black/5">
        {members.length === 0 && <div className="p-6 text-center text-sm text-ink/40">尚未新增任何人員</div>}
        {members.map(m => (
          <div key={m.id} className="flex items-center justify-between px-4 py-3 gap-2">
            {editingId === m.id ? (
              <div className="flex flex-col gap-1.5 flex-1">
                <div className="flex items-center gap-2">
                  <input value={editForm.name} onChange={e => setEditForm(f => ({ ...f, name: e.target.value }))} autoFocus
                    className="flex-1 rounded-lg border border-black/10 px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange" />
                  <button onClick={saveEdit} className="text-green"><Check size={18} /></button>
                  <button onClick={() => setEditingId(null)} className="text-ink/40"><X size={18} /></button>
                </div>
                <input type="email" value={editForm.email} onChange={e => setEditForm(f => ({ ...f, email: e.target.value }))}
                  placeholder="Email（選填）" className="rounded-lg border border-black/10 px-3 py-1.5 text-xs" />
              </div>
            ) : (
              <>
                <div>
                  <div className="flex items-center gap-2">
                    <span className={`font-medium text-base ${m.active === false ? 'text-ink/30 line-through' : 'text-ink'}`}>{m.name}</span>
                    {m.active === false && <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-black/5 text-ink/40">已停用</span>}
                  </div>
                  {m.email && <div className="text-xs text-ink/40 mt-0.5">{m.email}</div>}
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <button onClick={() => updateMember(m.id, { active: m.active === false })}
                    className="text-xs text-accent font-medium">
                    {m.active === false ? '啟用' : '停用'}
                  </button>
                  <button onClick={() => startEdit(m)} className="text-ink/40 hover:text-ink"><Pencil size={16} /></button>
                  <button onClick={() => window.confirm(`確定刪除 ${m.name}？這個人會同時從所有場次的出席名單和付款紀錄中移除，相關場次的人數與分攤金額會自動重新計算。`) && deleteMember(m.id)}
                    className="text-ink/40 hover:text-red-500"><Trash2 size={16} /></button>
                </div>
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
