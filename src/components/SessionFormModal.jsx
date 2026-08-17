import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X } from 'lucide-react'
import { useData } from '../context/DataContext.jsx'

const emptyForm = { date: '', startTime: '18:00', endTime: '21:00', activityTypes: [], totalCost: '', payerId: '', location: '', attendeeIds: [] }

export default function SessionFormModal({ session, onClose }) {
  const { members, activityTypes, addActivityType, deleteActivityType, addSession, updateSession } = useData()
  const [form, setForm] = useState(() => session ? {
    ...emptyForm, ...session,
    activityTypes: session.activityTypes || (session.activityType ? [session.activityType] : []),
    totalCost: String(session.totalCost),
  } : emptyForm)
  const [newType, setNewType] = useState('')

  const activeMembers = members.filter(m => m.active !== false)

  const toggleAttendee = (id) => {
    setForm(f => ({ ...f, attendeeIds: f.attendeeIds.includes(id) ? f.attendeeIds.filter(x => x !== id) : [...f.attendeeIds, id] }))
  }
  const toggleType = (name) => {
    setForm(f => ({ ...f, activityTypes: f.activityTypes.includes(name) ? f.activityTypes.filter(x => x !== name) : [...f.activityTypes, name] }))
  }
  const removeType = (e, t) => {
    e.stopPropagation()
    if (!window.confirm(`確定刪除活動項目「${t.name}」？之前用過這個項目的場次紀錄不受影響，只是之後選單裡不會再出現。`)) return
    deleteActivityType(t.id)
    setForm(f => ({ ...f, activityTypes: f.activityTypes.filter(x => x !== t.name) }))
  }

  const submit = async (e) => {
    e.preventDefault()
    if (!form.date || !form.activityTypes.length || !form.totalCost || !form.payerId) return
    const { activityType, ...rest } = form
    const payload = { ...rest, totalCost: parseFloat(form.totalCost) }
    if (session) await updateSession(session.id, payload)
    else await addSession(payload)
    onClose()
  }

  const addType = async () => {
    if (!newType.trim()) return
    await addActivityType(newType.trim())
    setForm(f => ({ ...f, activityTypes: [...f.activityTypes, newType.trim()] }))
    setNewType('')
  }

  return (
    <AnimatePresence>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/40 z-30 flex items-end md:items-center justify-center" onClick={onClose}>
        <motion.form onClick={e => e.stopPropagation()} onSubmit={submit}
          initial={{ y: 40, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 40, opacity: 0 }}
          className="bg-white rounded-t-3xl md:rounded-3xl w-full md:max-w-md max-h-[90vh] overflow-y-auto p-5 space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-lg font-bold">{session ? '編輯場次' : '新增場次'}</h2>
            <button type="button" onClick={onClose}><X size={20} /></button>
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

          <label className="text-xs text-ink/50 block">活動項目（可複選）
            <div className="flex flex-wrap gap-1.5 mt-1">
              {activityTypes.map(t => (
                <span key={t.id}
                  className={`flex items-center gap-1 pl-3 pr-1.5 py-1 rounded-full text-xs font-medium border ${form.activityTypes.includes(t.name) ? 'bg-orange text-white border-orange' : 'border-black/10 text-ink/70'}`}>
                  <button type="button" onClick={() => toggleType(t.name)}>{t.name}</button>
                  <button type="button" onClick={e => removeType(e, t)} className={form.activityTypes.includes(t.name) ? 'text-white/70' : 'text-ink/30'}>
                    <X size={12} />
                  </button>
                </span>
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
            {session ? '儲存變更' : '新增場次'}
          </button>
        </motion.form>
      </motion.div>
    </AnimatePresence>
  )
}
