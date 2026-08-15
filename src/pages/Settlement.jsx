import React, { useMemo, useState } from 'react'
import { ChevronDown, CheckCircle2, Circle, Plus, Trash2, X } from 'lucide-react'
import { useData } from '../context/DataContext.jsx'
import { computeBalances, simplifyDebts } from '../utils/settleDebts.js'
import QrImage from '../components/QrImage.jsx'

const FILTERS = [
  { id: 'all', label: '全部' },
  { id: 'unpaid', label: '未付款' },
  { id: 'paid', label: '已付款' },
]

export default function Settlement() {
  const {
    sessions, members, settlementRounds, closeSettlementRound, paidMarks, setPaidMark,
    manualEntries, addManualEntry, updateManualEntry, deleteManualEntry,
  } = useData()
  const [expanded, setExpanded] = useState(null)
  const [filter, setFilter] = useState('all')
  const [addingManual, setAddingManual] = useState(false)
  const [manualForm, setManualForm] = useState({ from: '', to: '', amount: '', note: '' })

  const lastRound = settlementRounds.length ? settlementRounds[settlementRounds.length - 1] : null
  const roundKey = lastRound ? lastRound.id : 'r0'
  const lastRoundMillis = lastRound?.closedAt?.toMillis ? lastRound.closedAt.toMillis() : 0

  const pendingSessions = useMemo(() => sessions.filter(s => {
    const t = s.createdAt?.toMillis ? s.createdAt.toMillis() : Infinity
    return t >= lastRoundMillis
  }), [sessions, lastRoundMillis])

  const { net, detail } = useMemo(() => computeBalances(pendingSessions, members), [pendingSessions, members])
  const transactions = useMemo(() => simplifyDebts(net), [net])

  const isPaid = (t) => !!paidMarks.find(p => p.id === `${roundKey}_${t.from}_${t.to}`)?.paid
  const togglePaid = (t) => setPaidMark(`${roundKey}_${t.from}_${t.to}`, !isPaid(t))

  const filtered = transactions.filter(t => filter === 'all' ? true : filter === 'paid' ? isPaid(t) : !isPaid(t))
  const filteredManual = manualEntries.filter(m => filter === 'all' ? true : filter === 'paid' ? m.paid : !m.paid)

  const memberName = (id) => members.find(m => m.id === id)?.name || '—'
  const memberMethods = (id) => members.find(m => m.id === id)?.paymentMethods || []

  const totalOutstanding = transactions.filter(t => !isPaid(t)).reduce((s, t) => s + t.amount, 0)
    + manualEntries.filter(m => !m.paid).reduce((s, m) => s + m.amount, 0)

  const hasItems = transactions.length > 0 || manualEntries.length > 0
  const allPaid = transactions.every(isPaid) && manualEntries.every(m => m.paid)

  const submitManual = async (e) => {
    e.preventDefault()
    if (!manualForm.from || !manualForm.to || !manualForm.amount) return
    await addManualEntry({
      from: manualForm.from, to: manualForm.to,
      amount: parseFloat(manualForm.amount), note: manualForm.note.trim(),
    })
    setManualForm({ from: '', to: '', amount: '', note: '' })
    setAddingManual(false)
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-3xl font-bold text-ink">分帳</h1>
        {hasItems && (
          <div className="text-right">
            <button
              disabled={!allPaid}
              onClick={() => window.confirm('確定所有款項都已完成轉帳了嗎？結清後這期間的場次將不再計入分帳。') && closeSettlementRound()}
              className={`text-sm font-medium px-3 py-1.5 rounded-full flex items-center gap-1 ${
                allPaid ? 'text-green-dark bg-green-light' : 'text-ink/30 bg-black/5 cursor-not-allowed'
              }`}>
              <CheckCircle2 size={16} /> 全部結清
            </button>
            {!allPaid && <div className="text-xs text-ink/30 mt-1">所有項目都標記已付款後才能結清</div>}
          </div>
        )}
      </div>

      {!hasItems ? (
        <div className="text-center py-10 text-base text-ink/40 bg-white rounded-2xl shadow-card">
          目前沒有需要分帳的款項 🎉
        </div>
      ) : (
        <>
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div className="flex bg-white rounded-full p-1 shadow-card w-fit">
              {FILTERS.map(f => (
                <button key={f.id} onClick={() => setFilter(f.id)}
                  className={`px-3.5 py-1.5 rounded-full text-sm font-medium transition-colors ${filter === f.id ? 'bg-orange text-white' : 'text-ink/50'}`}>
                  {f.label}
                </button>
              ))}
            </div>
            <div className="text-sm text-ink/40">未付款合計 ${totalOutstanding}</div>
          </div>

          {filtered.length === 0 && filteredManual.length === 0 && (
            <div className="text-center py-8 text-sm text-ink/40 bg-white rounded-2xl shadow-card">這個篩選條件下沒有資料</div>
          )}

          <div className="space-y-3">
            {filtered.map((t, i) => {
              const key = `${t.from}-${t.to}`
              const isOpen = expanded === key
              const paid = isPaid(t)
              const payerDetail = detail[t.from] || []
              const methods = memberMethods(t.to)
              return (
                <div key={i} className={`bg-white rounded-2xl shadow-card overflow-hidden ${paid ? 'opacity-60' : ''}`}>
                  <div className="w-full flex items-center justify-between px-4 py-3.5">
                    <button onClick={() => togglePaid(t)} className="shrink-0 mr-3" aria-label={paid ? '標記為未付款' : '標記為已付款'}>
                      {paid ? <CheckCircle2 size={22} className="text-green" /> : <Circle size={22} className="text-ink/25" />}
                    </button>
                    <button onClick={() => setExpanded(isOpen ? null : key)} className="flex-1 flex items-center justify-between text-left">
                      <div className={`text-base ${paid ? 'line-through' : ''}`}>
                        <span className="font-semibold text-ink">{memberName(t.from)}</span>
                        <span className="text-ink/40 mx-1">付給</span>
                        <span className="font-semibold text-ink">{memberName(t.to)}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-orange-dark text-lg">${t.amount}</span>
                        <ChevronDown size={18} className={`transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                      </div>
                    </button>
                  </div>
                  {isOpen && (
                    <div className="px-4 pb-4 border-t border-black/5 pt-3 space-y-3">
                      <div>
                        <div className="text-xs font-medium text-ink/40 mb-1">相關場次</div>
                        <div className="space-y-1">
                          {payerDetail.map((d, idx) => (
                            <div key={idx} className="flex justify-between text-sm text-ink/60">
                              <span>{d.date} · {d.activityTypeLabel}</span>
                              <span>${Math.round(d.share)}</span>
                            </div>
                          ))}
                          {payerDetail.length === 0 && <div className="text-sm text-ink/30">（金額已經過債務簡化，非單一場次直接對應）</div>}
                        </div>
                      </div>
                      {methods.length > 0 && (
                        <div>
                          <div className="text-xs font-medium text-ink/40 mb-1">{memberName(t.to)} 的收款方式（點圖放大掃描）</div>
                          <div className="flex flex-wrap gap-3">
                            {methods.map(m => (
                              <div key={m.id} className="flex items-center gap-2 bg-paper rounded-xl p-2">
                                <QrImage src={m.qrcodeUrl} label={`${memberName(t.to)} · ${m.type}`} size="lg" />
                                <div className="text-sm">
                                  <div className="font-medium">{m.type}</div>
                                  <div className="text-ink/50">{m.account}</div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )
            })}

            {filteredManual.map(m => (
              <div key={m.id} className={`bg-white rounded-2xl shadow-card px-4 py-3.5 flex items-center justify-between ${m.paid ? 'opacity-60' : ''}`}>
                <button onClick={() => updateManualEntry(m.id, { paid: !m.paid })} className="shrink-0 mr-3">
                  {m.paid ? <CheckCircle2 size={22} className="text-green" /> : <Circle size={22} className="text-ink/25" />}
                </button>
                <div className={`flex-1 text-base ${m.paid ? 'line-through' : ''}`}>
                  <span className="font-semibold text-ink">{memberName(m.from)}</span>
                  <span className="text-ink/40 mx-1">付給</span>
                  <span className="font-semibold text-ink">{memberName(m.to)}</span>
                  {m.note && <span className="text-ink/40 text-sm ml-2">（{m.note}）</span>}
                </div>
                <span className="font-bold text-accent text-lg mr-3">${m.amount}</span>
                <button onClick={() => window.confirm('確定刪除這筆手動項目？') && deleteManualEntry(m.id)} className="text-ink/30 hover:text-red-500">
                  <Trash2 size={18} />
                </button>
              </div>
            ))}
          </div>
        </>
      )}

      <div className="bg-white rounded-2xl shadow-card p-4">
        {addingManual ? (
          <form onSubmit={submitManual} className="space-y-2.5">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-ink">新增手動項目</h3>
              <button type="button" onClick={() => setAddingManual(false)}><X size={18} /></button>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <select value={manualForm.from} onChange={e => setManualForm(f => ({ ...f, from: e.target.value }))}
                className="rounded-lg border border-black/10 px-2 py-2 text-sm" required>
                <option value="">付款人</option>
                {members.map(mm => <option key={mm.id} value={mm.id}>{mm.name}</option>)}
              </select>
              <select value={manualForm.to} onChange={e => setManualForm(f => ({ ...f, to: e.target.value }))}
                className="rounded-lg border border-black/10 px-2 py-2 text-sm" required>
                <option value="">收款人</option>
                {members.map(mm => <option key={mm.id} value={mm.id}>{mm.name}</option>)}
              </select>
            </div>
            <input type="number" min="0" value={manualForm.amount} onChange={e => setManualForm(f => ({ ...f, amount: e.target.value }))}
              placeholder="金額" className="w-full rounded-lg border border-black/10 px-3 py-2 text-sm" required />
            <input value={manualForm.note} onChange={e => setManualForm(f => ({ ...f, note: e.target.value }))}
              placeholder="備註（選填）" className="w-full rounded-lg border border-black/10 px-3 py-2 text-sm" />
            <button className="w-full bg-orange text-white rounded-xl py-2.5 font-semibold active:scale-95 transition-transform">新增</button>
          </form>
        ) : (
          <button onClick={() => setAddingManual(true)} className="w-full flex items-center justify-center gap-1 text-sm font-medium text-accent py-1">
            <Plus size={16} /> 新增手動項目
          </button>
        )}
      </div>
    </div>
  )
}
