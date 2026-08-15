import React, { useState } from 'react'
import BadmintonScorer from './scoring/BadmintonScorer.jsx'
import PickleballScorer from './scoring/PickleballScorer.jsx'

export default function Scoring() {
  const [sport, setSport] = useState('badminton')
  return (
    <div className="space-y-5">
      <h1 className="font-display text-2xl font-bold text-ink">計分</h1>
      <div className="flex bg-white rounded-full p-1 shadow-card w-fit">
        {[{ id: 'badminton', label: '羽球' }, { id: 'pickleball', label: '匹克球' }].map(o => (
          <button key={o.id} onClick={() => setSport(o.id)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${sport === o.id ? 'bg-orange text-white' : 'text-ink/50'}`}>
            {o.label}
          </button>
        ))}
      </div>
      {sport === 'badminton' ? <BadmintonScorer /> : <PickleballScorer />}
    </div>
  )
}
