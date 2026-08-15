// 債務簡化演算法：輸入每人淨額（正=該收錢，負=該付錢），
// 輸出最少轉帳筆數的「誰付給誰多少錢」清單。
export function simplifyDebts(balances) {
  const creditors = []
  const debtors = []
  Object.entries(balances).forEach(([id, amt]) => {
    const rounded = Math.round(amt)
    if (rounded > 0) creditors.push({ id, amt: rounded })
    else if (rounded < 0) debtors.push({ id, amt: -rounded })
  })
  creditors.sort((a, b) => b.amt - a.amt)
  debtors.sort((a, b) => b.amt - a.amt)

  const transactions = []
  let i = 0, j = 0
  while (i < debtors.length && j < creditors.length) {
    const d = debtors[i]
    const c = creditors[j]
    const pay = Math.min(d.amt, c.amt)
    if (pay > 0) transactions.push({ from: d.id, to: c.id, amount: pay })
    d.amt -= pay
    c.amt -= pay
    if (d.amt === 0) i++
    if (c.amt === 0) j++
  }
  return transactions
}

// 計算每場次每人分攤金額與付款人淨額
export function computeBalances(sessions, members) {
  const net = {}
  members.forEach(m => { net[m.id] = 0 })
  const detail = {}
  members.forEach(m => { detail[m.id] = [] })

  sessions.forEach(s => {
    const attendees = s.attendeeIds && s.attendeeIds.length ? s.attendeeIds : []
    if (!attendees.length || !s.payerId) return
    const share = s.totalCost / attendees.length
    attendees.forEach(mid => {
      if (!(mid in net)) net[mid] = 0
      if (mid !== s.payerId) {
        net[mid] -= share
        net[s.payerId] = (net[s.payerId] || 0) + share
        if (!detail[mid]) detail[mid] = []
        detail[mid].push({ sessionId: s.id, date: s.date, activityType: s.activityType, share })
      }
    })
  })
  return { net, detail }
}
