import React, { useState } from 'react'
import { Plus, Trash2, Pencil, Clock, MapPin, UserPlus } from 'lucide-react'
import { useData } from '../context/DataContext.jsx'
import JoinSessionModal from '../components/JoinSessionModal.jsx'
import SessionFormModal from '../components/SessionFormModal.jsx'
import { sessionTypeLabel } from '../utils/session.js'

export default function Sessions() {
  const { sessions, members, deleteSession } = useData()
  const [open, setOpen] = useState(false)
  const [editingSession, setEditingSession] = useState(null)
  const [joiningSession, setJoiningSession] = useState(null)

  const openNew = () => { setEditingSession(null); setOpen(true) }
  const openEdit = (s) => { setEditingSession(s); setOpen(true) }

  const sorted = [...sessions].sort((a, b) => (a.date < b.date ? 1 : -1))
  const memberName = (id) => members.find(m => m.id === id)?.name || '—'

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <h1 className="font-display text-3xl font-bold text-ink">場次紀錄</h1>
        <button onClick={openNew} className="bg-orange text-white rounded-xl px-3 py-2 flex items-center gap-1 text-base font-medium active:scale-95 transition-transform">
          <Plus size={18} /> 新增場次
        </button>
      </div>

      <div className="space-y-3">
        {sorted.length === 0 && <div className="text-center py-10 text-sm text-ink/40 bg-white rounded-2xl shadow-card">還沒有任何場次紀錄</div>}
        {sorted.map(s => (
          <div key={s.id} className="bg-white rounded-2xl shadow-card p-4">
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-semibold text-ink text-lg">{s.date}</span>
                  <span className="text-sm font-semibold px-2 py-0.5 rounded-full bg-green-light text-green-dark">{sessionTypeLabel(s)}</span>
                </div>
                <div className="flex flex-wrap gap-x-3 gap-y-1 text-sm text-ink/60">
                  <span className="flex items-center gap-1"><Clock size={14} /> {s.startTime}–{s.endTime}</span>
                  {s.location && <span className="flex items-center gap-1"><MapPin size={14} /> {s.location}</span>}
                </div>
                <div className="text-sm text-ink/50 mt-1">
                  出席：{(s.attendeeIds || []).map(memberName).join('、') || '無'}
                </div>
                <button onClick={() => setJoiningSession(s)}
                  className="mt-2 flex items-center gap-1 text-sm font-semibold text-orange-dark bg-orange-light px-3 py-1 rounded-full active:scale-95 transition-transform">
                  <UserPlus size={14} /> 我要加入
                </button>
              </div>
              <div className="text-right shrink-0 ml-2">
                <div className="text-orange-dark font-bold text-lg">${s.totalCost}</div>
                <div className="text-xs text-ink/40">付款人 {memberName(s.payerId)}</div>
                <div className="flex gap-2 mt-2 justify-end">
                  <button onClick={() => openEdit(s)} className="text-ink/40 hover:text-ink"><Pencil size={16} /></button>
                  <button onClick={() => window.confirm('確定刪除此場次？') && deleteSession(s.id)} className="text-ink/40 hover:text-red-500"><Trash2 size={16} /></button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {joiningSession && <JoinSessionModal session={joiningSession} onClose={() => setJoiningSession(null)} />}
      {open && <SessionFormModal session={editingSession} onClose={() => setOpen(false)} />}
    </div>
  )
}
