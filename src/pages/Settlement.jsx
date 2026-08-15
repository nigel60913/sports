import React, { useMemo, useState } from 'react'
import { Pencil, Trash2, ChevronDown } from 'lucide-react'
import { useData } from '../context/DataContext.jsx'
import { fmtDateWithWeekday, fmt } from '../utils/dateUtils.js'
import { sessionTypeLabel, sessionEmoji } from '../utils/session.js'
import SessionFormModal from '../components/SessionFormModal.jsx'
import QrImage from '../components/QrImage.jsx'

export default function Settlement() {
  const { sessions, members, activityTypes, deleteSession, updateSession } = useData()
  const [typeFilter, setTypeFilter] = useState('all')
  const [editingSession, setEditingSession] = useState(null)
  const [showMethodsFor, setShowMethodsFor] = useState(null)

  const memberName = (id) => members.find(m => m.id === id)?.name || '—'
  const memberMethods = (id) => members.find(m => m.id === id)?.paymentMethods || []
  const today = fmt(new Date())

  const filtered = useMemo(() => {
    const list = typeFilter === 'all' ? sessions : sessions.filter(s => sessionTypeLabel(s).includes(typeFilter))
    return [...list].sort((a, b) => (a.date < b.date ? 1 : -1))
  }, [sessions, typeFilter])

  const togglePersonPaid = (session, memberId) => {
    const paidMemberIds = session.paidMemberIds || []
    const next = paidMemberIds.includes(memberId)
      ? paidMemberIds.filter(id => id !== memberId)
      : [...paidMemberIds, memberId]
    updateSession(session.id, { paidMemberIds: next })
  }

  return (
    <div className="space-y-5">
      <div className="flex items-start justify-between gap-2 flex-wrap">
        <div>
          <div className="text-sm text-accent font-medium">歷史紀錄</div>
          <h1 className="font-display text-3xl font-bold text-ink">所有場次</h1>
        </div>
        <select value={typeFilter} onChange={e => setTypeFilter(e.target.value)}
          className="rounded-xl border border-black/10 bg-white px-3 py-2 text-sm font-medium shadow-card">
          <option value="all">全部項目</option>
          {activityTypes.map(t => <option key={t.id} value={t.name}>{t.name}</option>)}
        </select>
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-10 text-base text-ink/40 bg-white rounded-2xl shadow-card">還沒有任何場次紀錄</div>
      )}

      <div className="space-y-4">
        {filtered.map(session => {
          const attendees = session.attendeeIds || []
          const paidIds = session.paidMemberIds || []
          const isPaidPerson = (id) => id === session.payerId || paidIds.includes(id)
          const paidCount = attendees.filter(isPaidPerson).length
          const unpaidCount = attendees.length - paidCount
          const upcoming = session.date > today
          const perPerson = attendees.length ? session.totalCost / attendees.length : session.totalCost
          const methods = session.payerId ? memberMethods(session.payerId) : []

          return (
            <div key={session.id}
              className={`rounded-2xl shadow-card p-4 border ${upcoming ? 'bg-amber-50 border-amber-200' : 'bg-white border-transparent'}`}>
              <div className="flex items-start justify-between flex-wrap gap-2">
                <div className="flex items-center gap-2 flex-wrap">
                  {upcoming && (
                    <span className="text-xs font-semibold px-2 py-1 rounded-full bg-amber-100 text-amber-700">時間未到</span>
                  )}
                  <span className="font-semibold text-ink text-base">{fmtDateWithWeekday(session.date)}</span>
                  <span className="text-sm text-ink/50">{session.startTime}-{session.endTime}</span>
                  <span className="text-sm font-semibold px-2 py-0.5 rounded-full bg-green-light text-green-dark">
                    {sessionEmoji(session)} {sessionTypeLabel(session)}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-green-light text-green-dark">{paidCount} 已付款</span>
                  <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-red-100 text-red-500">{unpaidCount} 未付款</span>
                  <button onClick={() => setEditingSession(session)} className="text-sm font-medium text-accent bg-accent-light px-2.5 py-1 rounded-full flex items-center gap-1">
                    <Pencil size={13} /> 編輯
                  </button>
                  <button onClick={() => window.confirm('確定刪除此場次？') && deleteSession(session.id)}
                    className="text-sm font-medium text-red-500 bg-red-50 px-2.5 py-1 rounded-full flex items-center gap-1">
                    <Trash2 size={13} /> 刪除
                  </button>
                </div>
              </div>

              <div className="text-sm text-ink/60 mt-2">
                總費用 ${session.totalCost} · {attendees.length} 人 · 每人 ${perPerson.toFixed(2)} · 付款人 {session.payerId ? memberName(session.payerId) : '待確認'}
              </div>

              {attendees.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-3">
                  {attendees.map(id => {
                    const paid = isPaidPerson(id)
                    const isPayer = id === session.payerId
                    return (
                      <div key={id}
                        className={`flex items-center gap-2 pl-3 pr-1.5 py-1 rounded-xl border text-sm font-medium ${
                          paid ? 'bg-green-light border-green/40 text-green-dark' : 'bg-red-50 border-red-200 text-red-500'
                        }`}>
                        <span className={isPayer ? 'text-ink' : ''}>{memberName(id)}</span>
                        <select
                          value={paid ? 'paid' : 'unpaid'}
                          disabled={isPayer}
                          onChange={() => togglePersonPaid(session, id)}
                          className={`bg-transparent text-xs font-semibold pr-1 focus:outline-none ${isPayer ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer'}`}>
                          <option value="paid">已付款</option>
                          <option value="unpaid">未付款</option>
                        </select>
                      </div>
                    )
                  })}
                </div>
              )}

              {session.payerId && (
                <div className="mt-3">
                  <button onClick={() => setShowMethodsFor(showMethodsFor === session.id ? null : session.id)}
                    className="flex items-center gap-1 text-sm font-medium text-accent">
                    {memberName(session.payerId)} 的收款方式
                    <ChevronDown size={14} className={`transition-transform ${showMethodsFor === session.id ? 'rotate-180' : ''}`} />
                  </button>
                  {showMethodsFor === session.id && (
                    methods.length === 0 ? (
                      <div className="text-sm text-ink/40 mt-2">這個人還沒有設定收款方式</div>
                    ) : (
                      <div className="flex flex-wrap gap-3 mt-2">
                        {methods.map(m => (
                          <div key={m.id} className="flex items-center gap-2 bg-paper rounded-xl p-2">
                            <QrImage src={m.qrcodeUrl} label={`${memberName(session.payerId)} · ${m.type}`} size="lg" />
                            <div className="text-sm">
                              <div className="font-medium">{m.type}</div>
                              <div className="text-ink/50">{m.account}</div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )
                  )}
                </div>
              )}
            </div>
          )
        })}
      </div>

      {editingSession && <SessionFormModal session={editingSession} onClose={() => setEditingSession(null)} />}
    </div>
  )
}
