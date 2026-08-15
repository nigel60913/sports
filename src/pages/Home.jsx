import React, { useMemo, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronLeft, ChevronRight, Clock, MapPin, Users as UsersIcon } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useData } from '../context/DataContext.jsx'
import { buildCalendarGrid, fmt, isSameMonth, isSameDay } from '../utils/dateUtils.js'

export default function Home() {
  const { sessions, members } = useData()
  const [monthDate, setMonthDate] = useState(new Date())
  const [selected, setSelected] = useState(fmt(new Date()))

  const days = useMemo(() => buildCalendarGrid(monthDate), [monthDate])
  const sessionsByDate = useMemo(() => {
    const map = {}
    sessions.forEach(s => { (map[s.date] = map[s.date] || []).push(s) })
    return map
  }, [sessions])

  const memberName = (id) => members.find(m => m.id === id)?.name || '—'
  const todaysSessions = sessionsByDate[selected] || []

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-2xl font-bold text-ink">
          {fmt(monthDate, 'yyyy 年 M 月')}
        </h1>
        <div className="flex gap-1">
          <button onClick={() => setMonthDate(d => new Date(d.getFullYear(), d.getMonth() - 1, 1))}
            className="p-2 rounded-full hover:bg-black/5"><ChevronLeft size={20} /></button>
          <button onClick={() => setMonthDate(d => new Date(d.getFullYear(), d.getMonth() + 1, 1))}
            className="p-2 rounded-full hover:bg-black/5"><ChevronRight size={20} /></button>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-card p-3">
        <div className="grid grid-cols-7 text-center text-xs text-ink/40 font-medium mb-1">
          {['日', '一', '二', '三', '四', '五', '六'].map(d => <div key={d} className="py-1">{d}</div>)}
        </div>
        <div className="grid grid-cols-7 gap-1">
          {days.map(day => {
            const key = fmt(day)
            const items = sessionsByDate[key] || []
            const inMonth = isSameMonth(day, monthDate)
            const today = isSameDay(day, new Date())
            const isSelected = key === selected
            return (
              <button key={key} onClick={() => setSelected(key)}
                className={`relative aspect-square rounded-xl flex flex-col items-center justify-center text-sm transition-colors
                  ${isSelected ? 'bg-orange text-white font-semibold' : inMonth ? 'text-ink hover:bg-orange-light' : 'text-ink/25'}
                  ${today && !isSelected ? 'ring-2 ring-orange animate-pulse' : ''}`}>
                <span>{fmt(day, 'd')}</span>
                {items.length > 0 && (
                  <span className={`absolute bottom-1 flex gap-0.5`}>
                    {items.slice(0, 3).map((it, i) => (
                      <span key={i} className={`w-1.5 h-1.5 rounded-full ${isSelected ? 'bg-white' : it.activityType === '羽球' ? 'bg-green' : 'bg-accent'}`} />
                    ))}
                  </span>
                )}
              </button>
            )
          })}
        </div>
      </div>

      <AnimatePresence mode="wait">
        <motion.div key={selected} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.2 }} className="space-y-3">
          <h2 className="text-sm font-medium text-ink/60">{fmt(new Date(selected), 'M 月 d 日')} 的場次</h2>
          {todaysSessions.length === 0 && (
            <div className="text-center py-8 text-ink/40 text-sm bg-white rounded-2xl shadow-card">
              這天還沒有安排場次，去「場次」頁新增一筆吧
            </div>
          )}
          {todaysSessions.map(s => (
            <Link to="/sessions" key={s.id} className="block bg-white rounded-2xl shadow-card p-4 hover:shadow-lg transition-shadow">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-green-light text-green-dark">{s.activityType}</span>
                <span className="text-orange-dark font-semibold">${s.totalCost}</span>
              </div>
              <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-ink/60">
                <span className="flex items-center gap-1"><Clock size={13} /> {s.startTime}–{s.endTime}</span>
                {s.location && <span className="flex items-center gap-1"><MapPin size={13} /> {s.location}</span>}
                <span className="flex items-center gap-1"><UsersIcon size={13} /> {s.attendeeIds?.length || 0} 人 · 付款人 {memberName(s.payerId)}</span>
              </div>
            </Link>
          ))}
        </motion.div>
      </AnimatePresence>
    </div>
  )
}
