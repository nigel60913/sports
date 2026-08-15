import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Plus, Check } from 'lucide-react'
import { useData } from '../context/DataContext.jsx'

export default function JoinSessionModal({ session, onClose }) {
  const { members, addMember, updateSession } = useData()
  const activeMembers = members.filter(m => m.active !== false)
  const [selected, setSelected] = useState(session.attendeeIds || [])
  const [newName, setNewName] = useState('')
  const [saving, setSaving] = useState(false)

  const toggle = (id) => setSelected(s => s.includes(id) ? s.filter(x => x !== id) : [...s, id])

  const addSelf = async () => {
    if (!newName.trim()) return
    const ref = await addMember({ name: newName.trim() })
    setSelected(s => [...s, ref.id])
    setNewName('')
  }

  const save = async () => {
    setSaving(true)
    await updateSession(session.id, { attendeeIds: selected })
    setSaving(false)
    onClose()
  }

  return (
    <AnimatePresence>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        onClick={onClose} className="fixed inset-0 bg-black/40 z-30 flex items-end md:items-center justify-center">
        <motion.div onClick={e => e.stopPropagation()} initial={{ y: 40, opacity: 0 }} animate={{ y: 0, opacity: 1 }}
          exit={{ y: 40, opacity: 0 }} className="bg-white rounded-t-3xl md:rounded-3xl w-full md:max-w-sm p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-lg font-bold">我要加入</h2>
            <button onClick={onClose}><X size={20} /></button>
          </div>
          <p className="text-sm text-ink/50">{session.date} · {session.activityType}</p>

          <div className="flex flex-wrap gap-2 max-h-56 overflow-y-auto">
            {activeMembers.map(m => {
              const on = selected.includes(m.id)
              return (
                <button key={m.id} type="button" onClick={() => toggle(m.id)}
                  className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-sm font-medium border ${
                    on ? 'bg-green text-white border-green' : 'border-black/10 text-ink/70'
                  }`}>
                  {on && <Check size={14} />} {m.name}
                </button>
              )
            })}
          </div>

          <div className="pt-2 border-t border-black/5">
            <div className="text-xs text-ink/40 mb-1">不在名單裡？直接輸入名字加入</div>
            <div className="flex gap-2">
              <input value={newName} onChange={e => setNewName(e.target.value)} placeholder="你的名字"
                className="flex-1 rounded-lg border border-black/10 px-3 py-2 text-sm" />
              <button onClick={addSelf} className="bg-black/5 rounded-lg px-3 flex items-center"><Plus size={16} /></button>
            </div>
          </div>

          <button onClick={save} disabled={saving}
            className="w-full bg-orange text-white rounded-xl py-3 font-semibold active:scale-95 transition-transform disabled:opacity-50">
            {saving ? '儲存中…' : '確認出席'}
          </button>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}
