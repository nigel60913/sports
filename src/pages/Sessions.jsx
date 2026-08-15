import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, Trash2, Pencil, X, Clock, MapPin, UserPlus } from 'lucide-react'
import { useData } from '../context/DataContext.jsx'
import JoinSessionModal from '../components/JoinSessionModal.jsx'

const emptyForm = { date: '', startTime: '', endTime: '', activityType: '', totalCost: '', payerId: '', location: '', attendeeIds: [] }

export default function Sessions() {
  const { sessions, members, activityTypes, addActivityType, addSession, updateSession, deleteSession } = useData()
  const [open, setOpen] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [form, setForm] = useState(emptyForm)
  const [newType, setNewType] = useState('')
  const [joiningSession, setJoiningSession] = useState(null)

  const activeMembers = members.filter(m => m.active !== false)

  const openNew = () => { setForm(emptyForm); setEditingId(null); setOpen(true) }
  const openEdit = (s) => { setForm({ ...emptyForm, ...s, totalCost: String(s.totalCost) }); setEditingId(s.id); setOpen(true) }

  const toggleAttendee = (id) => {
    setForm(f => ({ ...f, attendeeIds: f.attendeeIds.includes(id) ? f.attendeeIds.filter(x => x !== id) : [...f.attendeeIds, id] }))
  }

  const submit = async (e) => {
    e.preventDefault()
    if (!form.date || !form.activityType || !form.totalCost || !form.payerId) return
    const payload = { ...form, totalCost: parseFloat(form.totalCost) }
    if (editingId) await updateSession(editingId, payload)
    else await addSession(payload)
    setOpen(false)
  }

  const addType = async () => {
    if (!newType.trim()) return
    await addActivityType(newType.trim())
    setForm(f => ({ ...f, activityType: newType.trim() }))
    setNewType('')
  }

  const sorted = [...sessions].sort((a, b) => (a.date < b.date ? 1 : -1))
  const memberName = (id) => members.find(m => m.id === id)?.name || '—'

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
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
                  <span className="text-sm font-semibold px-2 py-0.5 rounded-full bg-green-light text-green-dark">{s.activityType}</span>
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

      <AnimatePresence>
        {open && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/40 z-30 flex items-end md:items-center justify-center" onClick={() => setOpen(false)}>
            <motion.form onClick={e => e.stopPropagation()} onSubmit={submit}
              initial={{ y: 40, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 40, opacity: 0 }}
              className="bg-white rounded-t-3xl md:rounded-3xl w-full md:max-w-md max-h-[90vh] overflow-y-auto p-5 space-y-3">
              <div className="flex items-center justify-between">
                <h2 className="font-display text-lg font-bold">{editingId ? '編輯場次' : '新增場次'}</h2>
                <button type="button" onClick={() => setOpen(false)}><X size={20} /></button>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <label className="text-xs text-ink/50">日期
                  <input type="date" value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))}
                    className="mt-1 w-full rounded-lg border border-black/10 px-3 py-2 text-sm" required />
                </label>
                <div />
                <label className="text-xs text-ink/50">開始時間
                  <input type="time" value={form.startTime} onChange={e => setForm(f => ({ ...f, startTime: e.target.value }))}
                    className="mt-1 w-full rounded-lg border border-black/10 px-3 py-2 text-sm" />
                </label>
                <label className="text-xs text-ink/50">結束時間
                  <input type="time" value={form.endTime} onChange={e => setForm(f => ({ ...f, endTime: e.target.value }))}
                    className="mt-1 w-full rounded-lg border border-black/10 px-3 py-2 text-sm" />
                </label>
              </div>

              <label className="text-xs text-ink/50 block">活動項目
                <div className="flex flex-wrap gap-1.5 mt-1">
                  {activityTypes.map(t => (
                    <button type="button" key={t.id} onClick={() => setForm(f => ({ ...f, activityType: t.name }))}
                      className={`px-3 py-1 rounded-full text-xs font-medium border ${form.activityType === t.name ? 'bg-orange text-white border-orange' : 'border-black/10 text-ink/70'}`}>
                      {t.name}
                    </button>
                  ))}
                </div>
                <div className="flex gap-1.5 mt-2">
                  <input value={newType} onChange={e => setNewType(e.target.value)} placeholder="自訂新項目，如：羽球"
                    className="flex-1 rounded-lg border border-black/10 px-3 py-1.5 text-xs" />
                  <button type="button" onClick={addType} className="text-xs px-3 rounded-lg bg-black/5 font-medium">新增</button>
                </div>
              </label>

              <label className="text-xs text-ink/50 block">場地
                <input value={form.location} onChange={e => setForm(f => ({ ...f, location: e.target.value }))}
                  className="mt-1 w-full rounded-lg border border-black/10 px-3 py-2 text-sm" placeholder="選填" />
              </label>

              <label className="text-xs text-ink/50 block">費用總計
                <input type="number" min="0" value={form.totalCost} onChange={e => setForm(f => ({ ...f, totalCost: e.target.value }))}
                  className="mt-1 w-full rounded-lg border border-black/10 px-3 py-2 text-sm" required />
              </label>

              <label className="text-xs text-ink/50 block">付款人
                <select value={form.payerId} onChange={e => setForm(f => ({ ...f, payerId: e.target.value }))}
                  className="mt-1 w-full rounded-lg border border-black/10 px-3 py-2 text-sm" required>
                  <option value="">請選擇</option>
                  {activeMembers.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
                </select>
              </label>

              <div className="text-xs text-ink/50 block">
                出席人員
                <div className="flex flex-wrap gap-1.5 mt-1">
                  {activeMembers.map(m => (
                    <button type="button" key={m.id} onClick={() => toggleAttendee(m.id)}
                      className={`px-3 py-1 rounded-full text-xs font-medium border ${form.attendeeIds.includes(m.id) ? 'bg-green text-white border-green' : 'border-black/10 text-ink/70'}`}>
                      {m.name}
                    </button>
                  ))}
                </div>
              </div>

              <button className="w-full bg-orange text-white rounded-xl py-3 font-semibold mt-2 active:scale-95 transition-transform">
                {editingId ? '儲存變更' : '新增場次'}
              </button>
            </motion.form>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
