import React, { useState } from 'react'
import { Undo2, RotateCcw } from 'lucide-react'

const initState = { a: 0, b: 0, servingTeam: 'A', serverNumber: 2 }

export default function PickleballScorer() {
  const [s, setS] = useState(initState)
  const [history, setHistory] = useState([])
  const [gameOver, setGameOver] = useState(false)

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

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between text-xs text-ink/50 px-1">
        <span>11 分制・需領先 2 分</span>
        <div className="flex gap-3">
          <button onClick={undo} className="flex items-center gap-1"><Undo2 size={14} /> 復原</button>
          <button onClick={resetAll} className="flex items-center gap-1"><RotateCcw size={14} /> 重設</button>
        </div>
      </div>

      {gameOver && (
        <div className="text-center bg-orange-light text-orange-dark rounded-2xl py-2 text-sm font-semibold">
          比賽結束！{s.a > s.b ? 'A 隊' : 'B 隊'} 獲勝 🏆
        </div>
      )}

      <div className="bg-ink rounded-3xl py-6 text-center shadow-card">
        <div className="text-white/50 text-xs mb-1">發球方報分</div>
        <div className="text-white font-display text-4xl font-bold tracking-wide">{callout}</div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <button onClick={() => rallyWonBy('A')}
          className="bg-green rounded-3xl py-8 flex flex-col items-center gap-1 active:scale-[0.98] transition-transform shadow-card">
          <span className="text-white/80 text-sm font-medium">A 隊贏這球 {s.servingTeam === 'A' && '· 發球中'}</span>
          <span className="text-white font-display text-5xl font-bold">{s.a}</span>
        </button>
        <button onClick={() => rallyWonBy('B')}
          className="bg-orange rounded-3xl py-8 flex flex-col items-center gap-1 active:scale-[0.98] transition-transform shadow-card">
          <span className="text-white/80 text-sm font-medium">B 隊贏這球 {s.servingTeam === 'B' && '· 發球中'}</span>
          <span className="text-white font-display text-5xl font-bold">{s.b}</span>
        </button>
      </div>
      <p className="text-[11px] text-ink/40 text-center px-4">
        點選「贏這球」代表該隊贏得這一分的來回；系統會自動判斷是得分還是換發球
      </p>
    </div>
  )
}
