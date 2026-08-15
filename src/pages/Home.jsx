import React, { useMemo, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronLeft, ChevronRight, Clock, MapPin, Users as UsersIcon, X } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useData } from '../context/DataContext.jsx'
import { buildCalendarGrid, fmt, isSameMonth, isSameDay } from '../utils/dateUtils.js'

export default function Home() {
  const { sessions, members } = useData()
  const [monthDate, setMonthDate] = useState(new Date())
  const [selected, setSelected] = useState(null) // null = 顯示全部即將到來的場次

  const days = useMemo(() => buildCalendarGrid(monthDate), [monthDate])
  const sessionsByDate = useMemo(() => {
    const map = {}
    sessions.forEach(s => { (map[s.date] = map[s.date] || []).push(s) })
    return map
  }, [sessions])

  const today = fmt(new Date())
  const upcoming = useMemo(
    () => [...sessions].filter(s => s.date >= today).sort((a, b) => a.date < b.date ? -1 : 1),
    [sessions, today]
  )
  const listSessions = selected ? (sessionsByDate[selected] || []) : upcoming

  const memberName = (id) => members.find(m => m.id === id)?.name || '—'

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 bg-white rounded-2xl shadow-card px-4 py-3">
        <span className="text-3xl animate-brandBounce inline-block">🏸</span>
        <div>
          <div className="font-display text-xl font-bold text-ink">運動啦，走吧！</div>
          <div className="text-sm text-ink/50">看看最近有哪些場次揪團</div>
        </div>
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-2xl font-bold text-ink">
            {selected ? fmt(new Date(selected), 'M 月 d 日') + ' 的場次' : '即將到來的場次'}
          </h2>
          {selected && (
            <button onClick={() => setSelected(null)} className="flex items-center gap-1 text-sm font-medium text-accent">
              <X size={14} /> 顯示全部
            </button>
          )}
        </div>

        <AnimatePresence mode="popLayout">
          {listSessions.length === 0 && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              className="text-center py-10 text-base text-ink/40 bg-white rounded-2xl shadow-card">
              目前沒有安排的場次，去「場次」頁新增一筆吧 🏓
            </motion.div>
          )}
          {listSessions.map(s => (
            <motion.div key={s.id} layout initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
              <Link to="/sessions" className="block bg-white rounded-2xl shadow-card p-4 hover:shadow-lg transition-shadow">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-base">{s.activityType === '羽球' ? '🏸' : s.activityType === '匹克球' ? '🎾' : '⚡️'}</span>
                    <span className="font-semibold text-ink">{fmt(new Date(s.date), 'M/d')}</span>
                    <span className="text-sm font-semibold px-2 py-0.5 rounded-full bg-green-light text-green-dark">{s.activityType}</span>
                  </div>
                  <span className="text-orange-dark font-bold text-lg">${s.totalCost}</span>
                </div>
                <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-ink/60">
                  <span className="flex items-center gap-1"><Clock size={14} /> {s.startTime}–{s.endTime}</span>
                  {s.location && <span className="flex items-center gap-1"><MapPin size={14} /> {s.location}</span>}
                  <span className="flex items-center gap-1"><UsersIcon size={14} /> {s.attendeeIds?.length || 0} 人 · 付款人 {memberName(s.payerId)}</span>
                </div>
              </Link>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      <div className="bg-white rounded-2xl shadow-card p-3">
        <div className="flex items-center justify-between mb-2 px-1">
          <span className="font-display text-base font-bold text-ink">{fmt(monthDate, 'yyyy 年 M 月')}</span>
          <div className="flex gap-1">
            <button onClick={() => setMonthDate(d => new Date(d.getFullYear(), d.getMonth() - 1, 1))}
              className="p-1.5 rounded-full hover:bg-black/5"><ChevronLeft size={18} /></button>
            <button onClick={() => setMonthDate(d => new Date(d.getFullYear(), d.getMonth() + 1, 1))}
              className="p-1.5 rounded-full hover:bg-black/5"><ChevronRight size={18} /></button>
          </div>
        </div>
        <div className="grid grid-cols-7 text-center text-xs text-ink/40 font-medium mb-0.5">
          {['日', '一', '二', '三', '四', '五', '六'].map(d => <div key={d} className="py-0.5">{d}</div>)}
        </div>
        <div className="grid grid-cols-7 gap-0.5">
          {days.map(day => {
            const key = fmt(day)
            const items = sessionsByDate[key] || []
            const inMonth = isSameMonth(day, monthDate)
            const isToday = isSameDay(day, new Date())
            const isSelected = key === selected
            return (
              <button key={key} onClick={() => setSelected(isSelected ? null : key)}
                className={`relative h-9 rounded-lg flex flex-col items-center justify-center text-xs transition-colors
                  ${isSelected ? 'bg-orange text-white font-semibold' : inMonth ? 'text-ink hover:bg-orange-light' : 'text-ink/25'}
                  ${isToday && !isSelected ? 'ring-2 ring-orange' : ''}`}>
                <span>{fmt(day, 'd')}</span>
                {items.length > 0 && (
                  <span className="absolute bottom-0.5 flex gap-0.5">
                    {items.slice(0, 3).map((it, i) => (
                      <span key={i} className={`w-1 h-1 rounded-full ${isSelected ? 'bg-white' : it.activityType === '羽球' ? 'bg-green' : 'bg-accent'}`} />
                    ))}
                  </span>
                )}
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}
