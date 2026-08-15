import React, { useMemo, useState } from 'react'
import { ChevronDown, QrCode, CheckCircle2 } from 'lucide-react'
import { useData } from '../context/DataContext.jsx'
import { computeBalances, simplifyDebts } from '../utils/settleDebts.js'

export default function Settlement() {
  const { sessions, members, settlementRounds, closeSettlementRound } = useData()
  const [expanded, setExpanded] = useState(null)

  const lastRoundMillis = useMemo(() => {
    if (!settlementRounds.length) return 0
    const last = settlementRounds[settlementRounds.length - 1]
    return last.closedAt?.toMillis ? last.closedAt.toMillis() : 0
  }, [settlementRounds])

  const pendingSessions = useMemo(() => sessions.filter(s => {
    const t = s.createdAt?.toMillis ? s.createdAt.toMillis() : Infinity
    return t >= lastRoundMillis
  }), [sessions, lastRoundMillis])

  const { net, detail } = useMemo(() => computeBalances(pendingSessions, members), [pendingSessions, members])
  const transactions = useMemo(() => simplifyDebts(net), [net])

  const memberName = (id) => members.find(m => m.id === id)?.name || '—'
  const memberMethods = (id) => members.find(m => m.id === id)?.paymentMethods || []

  const totalOutstanding = transactions.reduce((s, t) => s + t.amount, 0)

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-2xl font-bold text-ink">分帳</h1>
        {transactions.length > 0 && (
          <button
            onClick={() => window.confirm('確定所有款項都已完成轉帳了嗎？結清後這期間的場次將不再計入分帳。') && closeSettlementRound()}
            className="text-xs font-medium text-green-dark bg-green-light px-3 py-1.5 rounded-full flex items-center gap-1">
            <CheckCircle2 size={14} /> 全部結清
          </button>
        )}
      </div>

      {transactions.length === 0 ? (
        <div className="text-center py-10 text-sm text-ink/40 bg-white rounded-2xl shadow-card">
          目前沒有需要分帳的款項 🎉
        </div>
      ) : (
        <>
          <div className="text-xs text-ink/40">共 {transactions.length} 筆轉帳・合計 ${totalOutstanding}</div>
          <div className="space-y-3">
            {transactions.map((t, i) => {
              const key = `${t.from}-${t.to}`
              const isOpen = expanded === key
              const payerDetail = (detail[t.from] || []).filter(d => true)
              const methods = memberMethods(t.to)
              return (
                <div key={i} className="bg-white rounded-2xl shadow-card overflow-hidden">
                  <button onClick={() => setExpanded(isOpen ? null : key)} className="w-full flex items-center justify-between px-4 py-3.5">
                    <div className="text-sm">
                      <span className="font-semibold text-ink">{memberName(t.from)}</span>
                      <span className="text-ink/40 mx-1">付給</span>
                      <span className="font-semibold text-ink">{memberName(t.to)}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-orange-dark">${t.amount}</span>
                      <ChevronDown size={16} className={`transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                    </div>
                  </button>
                  {isOpen && (
                    <div className="px-4 pb-4 border-t border-black/5 pt-3 space-y-3">
                      <div>
                        <div className="text-[11px] font-medium text-ink/40 mb-1">相關場次</div>
                        <div className="space-y-1">
                          {payerDetail.map((d, idx) => (
                            <div key={idx} className="flex justify-between text-xs text-ink/60">
                              <span>{d.date} · {d.activityType}</span>
                              <span>${Math.round(d.share)}</span>
                            </div>
                          ))}
                          {payerDetail.length === 0 && <div className="text-xs text-ink/30">（金額已經過債務簡化，非單一場次直接對應）</div>}
                        </div>
                      </div>
                      {methods.length > 0 && (
                        <div>
                          <div className="text-[11px] font-medium text-ink/40 mb-1">{memberName(t.to)} 的收款方式</div>
                          <div className="flex flex-wrap gap-2">
                            {methods.map(m => (
                              <div key={m.id} className="flex items-center gap-2 bg-paper rounded-xl p-2">
                                {m.qrcodeUrl ? <img src={m.qrcodeUrl} className="w-9 h-9 rounded-lg object-cover" /> : <QrCode size={18} className="text-ink/30" />}
                                <div className="text-[11px]">
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
          </div>
        </>
      )}
    </div>
  )
}
