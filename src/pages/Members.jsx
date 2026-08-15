import React, { useState } from 'react'
import { Plus, Trash2, Pencil, Check, X } from 'lucide-react'
import { useData } from '../context/DataContext.jsx'

export default function Members() {
  const { members, addMember, updateMember, deleteMember } = useData()
  const [name, setName] = useState('')
  const [editingId, setEditingId] = useState(null)
  const [editName, setEditName] = useState('')

  const submit = (e) => {
    e.preventDefault()
    if (!name.trim()) return
    addMember({ name: name.trim() })
    setName('')
  }

  const startEdit = (m) => { setEditingId(m.id); setEditName(m.name) }
  const saveEdit = () => {
    if (editName.trim()) updateMember(editingId, { name: editName.trim() })
    setEditingId(null)
  }

  return (
    <div className="space-y-5">
      <h1 className="font-display text-2xl font-bold text-ink">人員設定</h1>

      <form onSubmit={submit} className="flex gap-2">
        <input value={name} onChange={e => setName(e.target.value)} placeholder="輸入姓名新增人員"
          className="flex-1 rounded-xl border border-black/10 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange" />
        <button className="bg-orange text-white rounded-xl px-4 flex items-center gap-1 font-medium text-sm active:scale-95 transition-transform">
          <Plus size={16} /> 新增
        </button>
      </form>

      <div className="bg-white rounded-2xl shadow-card divide-y divide-black/5">
        {members.length === 0 && <div className="p-6 text-center text-sm text-ink/40">尚未新增任何人員</div>}
        {members.map(m => (
          <div key={m.id} className="flex items-center justify-between px-4 py-3">
            {editingId === m.id ? (
              <div className="flex items-center gap-2 flex-1">
                <input value={editName} onChange={e => setEditName(e.target.value)} autoFocus
                  className="flex-1 rounded-lg border border-black/10 px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange" />
                <button onClick={saveEdit} className="text-green"><Check size={18} /></button>
                <button onClick={() => setEditingId(null)} className="text-ink/40"><X size={18} /></button>
              </div>
            ) : (
              <>
                <div className="flex items-center gap-2">
                  <span className={`font-medium text-sm ${m.active === false ? 'text-ink/30 line-through' : 'text-ink'}`}>{m.name}</span>
                  {m.active === false && <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-black/5 text-ink/40">已停用</span>}
                </div>
                <div className="flex items-center gap-3">
                  <button onClick={() => updateMember(m.id, { active: m.active === false })}
                    className="text-xs text-accent font-medium">
                    {m.active === false ? '啟用' : '停用'}
                  </button>
                  <button onClick={() => startEdit(m)} className="text-ink/40 hover:text-ink"><Pencil size={16} /></button>
                  <button onClick={() => window.confirm(`確定刪除 ${m.name}？`) && deleteMember(m.id)}
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
