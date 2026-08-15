import React, { useState } from 'react'
import { Undo2, RotateCcw, Pencil } from 'lucide-react'

const initGame = { a: 0, b: 0, server: 'A' }

export default function BadmintonScorer() {
  const [game, setGame] = useState(initGame)
  const [history, setHistory] = useState([])
  const [games, setGames] = useState([])
  const [matchOver, setMatchOver] = useState(false)
  const [names, setNames] = useState({ a: 'A 隊', b: 'B 隊' })
  const [editing, setEditing] = useState(null)

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

  const NameLabel = ({ side }) => (
    editing === side ? (
      <input autoFocus defaultValue={names[side]} onClick={e => e.stopPropagation()}
        onBlur={e => { setNames(n => ({ ...n, [side]: e.target.value || (side === 'a' ? 'A 隊' : 'B 隊') })); setEditing(null) }}
        onKeyDown={e => e.key === 'Enter' && e.target.blur()}
        className="w-24 text-center rounded-lg px-1 py-0.5 text-ink text-sm font-medium" />
    ) : (
      <button onClick={e => { e.stopPropagation(); setEditing(side) }} className="flex items-center gap-1 text-white/85 text-base font-medium">
        {names[side]} <Pencil size={13} />
      </button>
    )
  )

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between text-sm text-ink/50 px-1">
        <span>局數 {winsA} : {winsB}　·　21 分制（20 平需領先 2 分，最高 30 分）</span>
        <div className="flex gap-3">
          <button onClick={undo} className="flex items-center gap-1"><Undo2 size={15} /> 復原</button>
          <button onClick={resetAll} className="flex items-center gap-1"><RotateCcw size={15} /> 重設</button>
        </div>
      </div>

      {matchOver && (
        <div className="text-center bg-orange-light text-orange-dark rounded-2xl py-2 text-base font-semibold">
          比賽結束！{winsA > winsB ? names.a : names.b} 獲勝 🏆
        </div>
      )}

      <div className="grid grid-cols-2 gap-3">
        <div role="button" tabIndex={0} onClick={() => point('A')} onKeyDown={e => e.key === 'Enter' && point('A')}
          className="bg-green rounded-3xl py-10 flex flex-col items-center gap-2 active:scale-[0.98] transition-transform shadow-card cursor-pointer select-none">
          <NameLabel side="a" />
          {game.server === 'A' && <span className="text-white/70 text-xs -mt-1">發球中</span>}
          <span className="text-white font-display text-6xl font-bold">{game.a}</span>
        </div>
        <div role="button" tabIndex={0} onClick={() => point('B')} onKeyDown={e => e.key === 'Enter' && point('B')}
          className="bg-orange rounded-3xl py-10 flex flex-col items-center gap-2 active:scale-[0.98] transition-transform shadow-card cursor-pointer select-none">
          <NameLabel side="b" />
          {game.server === 'B' && <span className="text-white/70 text-xs -mt-1">發球中</span>}
          <span className="text-white font-display text-6xl font-bold">{game.b}</span>
        </div>
      </div>

      {games.length > 0 && (
        <div className="flex gap-2 justify-center flex-wrap">
          {games.map((g, i) => (
            <span key={i} className="text-sm bg-white shadow-card rounded-full px-3 py-1 text-ink/60">
              第{i + 1}局 {g.a}:{g.b}
            </span>
          ))}
        </div>
      )}
    </div>
  )
}
