import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Plus, Check } from 'lucide-react'
import { useData } from '../context/DataContext.jsx'
import { sessionTypeLabel } from '../utils/session.js'

export default function JoinSessionModal({ session, onClose }) {
  const { members, addMember, updateSession } = useData()
  const activeMembers = members.filter(m => m.active !== false)
  const [selected, setSelected] = useState(session.attendeeIds || [])
  const [newName, setNewName] = useState('')
  const [saving, setSaving] = useState(false)

  const limit = session.maxAttendees || null
  const isFull = limit && selected.length >= limit

  const toggle = (id) => {
    setSelected(s => {
      const already = s.includes(id)
      if (!already && limit && s.length >= limit) {
        window.alert(`這個場次已經額滿（${limit} 人），沒辦法再加入了。`)
        return s
      }
      return already ? s.filter(x => x !== id) : [...s, id]
    })
  }

  const addSelf = async () => {
    if (!newName.trim()) return
    if (limit && selected.length >= limit) {
      window.alert(`這個場次已經額滿（${limit} 人），沒辦法再加入了。`)
      return
    }
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
          <div className="flex items-center justify-between">
            <p className="text-sm text-ink/50">{session.date} · {sessionTypeLabel(session)}</p>
            {limit && (
              <span className={`text-sm font-semibold ${isFull ? 'text-red-500' : 'text-ink/40'}`}>
                {selected.length} / {limit} 人{isFull ? '・已額滿' : ''}
              </span>
            )}
          </div>

          <div className="flex flex-wrap gap-2 max-h-56 overflow-y-auto">
            {activeMembers.map(m => {
              const on = selected.includes(m.id)
              const disabled = !on && isFull
              return (
                <button key={m.id} type="button" onClick={() => toggle(m.id)} disabled={disabled}
                  className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-sm font-medium border ${
                    on ? 'bg-green text-white border-green' : disabled ? 'border-black/5 text-ink/25' : 'border-black/10 text-ink/70'
                  }`}>
                  {on && <Check size={14} />} {m.name}
                </button>
              )
            })}
          </div>

          <div className="pt-2 border-t border-black/5">
            <div className="text-xs text-ink/40 mb-1">
              {isFull ? '已經額滿，沒辦法再加入囉' : '不在名單裡？直接輸入名字加入'}
            </div>
            <div className="flex gap-2">
              <input value={newName} onChange={e => setNewName(e.target.value)} placeholder="你的名字" disabled={isFull}
                className="flex-1 rounded-lg border border-black/10 px-3 py-2 text-sm disabled:opacity-50" />
              <button onClick={addSelf} disabled={isFull} className="bg-black/5 rounded-lg px-3 flex items-center disabled:opacity-50"><Plus size={16} /></button>
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
