import React, { useState } from 'react'
import { Undo2, RotateCcw, Pencil } from 'lucide-react'

const initState = { a: 0, b: 0, servingTeam: 'A', serverNumber: 2 }

export default function PickleballScorer() {
  const [s, setS] = useState(initState)
  const [history, setHistory] = useState([])
  const [gameOver, setGameOver] = useState(false)
  const [names, setNames] = useState({ a: 'A 隊', b: 'B 隊' })
  const [editing, setEditing] = useState(null)

  const isWin = (mine, theirs) => mine >= 11 && mine - theirs >= 2

  const rallyWonBy = (team) => {
    if (gameOver) return
    setHistory(h => [...h, s])
    setS(prev => {
      let { a, b, servingTeam, serverNumber } = prev
      if (team === servingTeam) {
        if (servingTeam === 'A') a += 1; else b += 1
      } else {
        if (serverNumber === 1) {
          serverNumber = 2
        } else {
          servingTeam = team
          serverNumber = 1
        }
      }
      const next = { a, b, servingTeam, serverNumber }
      if (isWin(a, b) || isWin(b, a)) setGameOver(true)
      return next
    })
  }

  const undo = () => {
    if (!history.length) return
    setS(history[history.length - 1])
    setHistory(h => h.slice(0, -1))
  }

  const resetAll = () => { setS(initState); setHistory([]); setGameOver(false) }

  const servingScore = s.servingTeam === 'A' ? s.a : s.b
  const receivingScore = s.servingTeam === 'A' ? s.b : s.a
  const callout = `${servingScore} - ${receivingScore} - ${s.serverNumber}`

  const NameLabel = ({ side }) => (
    editing === side ? (
      <input autoFocus defaultValue={names[side]} onClick={e => e.stopPropagation()}
        onBlur={e => { setNames(n => ({ ...n, [side]: e.target.value || (side === 'a' ? 'A 隊' : 'B 隊') })); setEditing(null) }}
        onKeyDown={e => e.key === 'Enter' && e.target.blur()}
        className="w-24 text-center rounded-lg px-1 py-0.5 text-ink text-sm font-medium" />
    ) : (
      <button onClick={e => { e.stopPropagation(); setEditing(side) }} className="flex items-center gap-1 text-white/85 text-sm font-medium">
        {names[side]} <Pencil size={12} />
      </button>
    )
  )

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between text-sm text-ink/50 px-1">
        <span>11 分制・需領先 2 分</span>
        <div className="flex gap-3">
          <button onClick={undo} className="flex items-center gap-1"><Undo2 size={15} /> 復原</button>
          <button onClick={resetAll} className="flex items-center gap-1"><RotateCcw size={15} /> 重設</button>
        </div>
      </div>

      {gameOver && (
        <div className="text-center bg-orange-light text-orange-dark rounded-2xl py-2 text-base font-semibold">
          比賽結束！{s.a > s.b ? names.a : names.b} 獲勝 🏆
        </div>
      )}

      <div className="bg-ink rounded-3xl py-6 text-center shadow-card">
        <div className="text-white/50 text-sm mb-1">發球方報分</div>
        <div className="text-white font-display text-4xl font-bold tracking-wide">{callout}</div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div role="button" tabIndex={0} onClick={() => rallyWonBy('A')} onKeyDown={e => e.key === 'Enter' && rallyWonBy('A')}
          className="bg-green rounded-3xl py-8 flex flex-col items-center gap-1 active:scale-[0.98] transition-transform shadow-card cursor-pointer select-none">
          <NameLabel side="a" />
          <span className="text-white/70 text-xs">贏這球 {s.servingTeam === 'A' && '· 發球中'}</span>
          <span className="text-white font-display text-5xl font-bold">{s.a}</span>
        </div>
        <div role="button" tabIndex={0} onClick={() => rallyWonBy('B')} onKeyDown={e => e.key === 'Enter' && rallyWonBy('B')}
          className="bg-orange rounded-3xl py-8 flex flex-col items-center gap-1 active:scale-[0.98] transition-transform shadow-card cursor-pointer select-none">
          <NameLabel side="b" />
          <span className="text-white/70 text-xs">贏這球 {s.servingTeam === 'B' && '· 發球中'}</span>
          <span className="text-white font-display text-5xl font-bold">{s.b}</span>
        </div>
      </div>
      <p className="text-sm text-ink/40 text-center px-4">
        點選隊伍卡片代表該隊贏得這一分的來回；系統會自動判斷是得分還是換發球
      </p>
    </div>
  )
}
