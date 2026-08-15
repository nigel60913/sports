import React, { useState } from 'react'
import { Undo2, RotateCcw } from 'lucide-react'

const initGame = { a: 0, b: 0, server: 'A' }

export default function BadmintonScorer() {
  const [game, setGame] = useState(initGame)
  const [history, setHistory] = useState([])
  const [games, setGames] = useState([])
  const [matchOver, setMatchOver] = useState(false)

  const isWin = (mine, theirs) => (mine >= 21 && mine - theirs >= 2) || mine === 30

  const point = (side) => {
    if (matchOver) return
    setHistory(h => [...h, game])
    setGame(g => {
      const next = { ...g, [side.toLowerCase()]: g[side.toLowerCase()] + 1, server: side }
      if (isWin(next.a, next.b) || isWin(next.b, next.a)) {
        setTimeout(() => finishGame(next), 0)
      }
      return next
    })
  }

  const finishGame = (finalScore) => {
    setGames(prev => {
      const updated = [...prev, finalScore]
      const winsA = updated.filter(g => g.a > g.b).length
      const winsB = updated.filter(g => g.b > g.a).length
      if (winsA === 2 || winsB === 2) setMatchOver(true)
      return updated
    })
    setGame(initGame)
    setHistory([])
  }

  const undo = () => {
    if (!history.length) return
    setGame(history[history.length - 1])
    setHistory(h => h.slice(0, -1))
  }

  const resetAll = () => { setGame(initGame); setHistory([]); setGames([]); setMatchOver(false) }

  const winsA = games.filter(g => g.a > g.b).length
  const winsB = games.filter(g => g.b > g.a).length

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between text-xs text-ink/50 px-1">
        <span>局數 {winsA} : {winsB}　·　21 分制（雙方 20 平需領先 2 分，最高 30 分）</span>
        <div className="flex gap-3">
          <button onClick={undo} className="flex items-center gap-1"><Undo2 size={14} /> 復原</button>
          <button onClick={resetAll} className="flex items-center gap-1"><RotateCcw size={14} /> 重設</button>
        </div>
      </div>

      {matchOver && (
        <div className="text-center bg-orange-light text-orange-dark rounded-2xl py-2 text-sm font-semibold">
          比賽結束！{winsA > winsB ? 'A 隊' : 'B 隊'} 獲勝 🏆
        </div>
      )}

      <div className="grid grid-cols-2 gap-3">
        <button onClick={() => point('A')}
          className="bg-green rounded-3xl py-10 flex flex-col items-center gap-2 active:scale-[0.98] transition-transform shadow-card">
          <span className="text-white/80 text-sm font-medium">A 隊 {game.server === 'A' && '· 發球'}</span>
          <span className="text-white font-display text-6xl font-bold">{game.a}</span>
        </button>
        <button onClick={() => point('B')}
          className="bg-orange rounded-3xl py-10 flex flex-col items-center gap-2 active:scale-[0.98] transition-transform shadow-card">
          <span className="text-white/80 text-sm font-medium">B 隊 {game.server === 'B' && '· 發球'}</span>
          <span className="text-white font-display text-6xl font-bold">{game.b}</span>
        </button>
      </div>

      {games.length > 0 && (
        <div className="flex gap-2 justify-center flex-wrap">
          {games.map((g, i) => (
            <span key={i} className="text-xs bg-white shadow-card rounded-full px-3 py-1 text-ink/60">
              第{i + 1}局 {g.a}:{g.b}
            </span>
          ))}
        </div>
      )}
    </div>
  )
}
