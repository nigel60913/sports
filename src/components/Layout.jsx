import React from 'react'
import { NavLink, Outlet } from 'react-router-dom'
import { Home, ClipboardList, Wallet, Users, QrCode, Trophy } from 'lucide-react'
import BrandMark from './BrandMark.jsx'

const NAV = [
  { to: '/', label: '首頁', icon: Home, end: true },
  { to: '/sessions', label: '場次', icon: ClipboardList },
  { to: '/settlement', label: '分帳', icon: Wallet },
  { to: '/members', label: '人員', icon: Users },
  { to: '/payment-info', label: '匯款', icon: QrCode },
  { to: '/scoring', label: '計分', icon: Trophy },
]

export default function Layout() {
  return (
    <div className="min-h-screen flex flex-col md:flex-row">
      <aside className="hidden md:flex md:flex-col md:w-60 border-r border-black/5 bg-white p-4 gap-1">
        <div className="flex items-center gap-2 px-2 pb-4">
          <BrandMark size={38} />
          <span className="font-display text-2xl font-bold text-ink">運動啦</span>
        </div>
        {NAV.map(({ to, label, icon: Icon, end }) => (
          <NavLink key={to} to={to} end={end}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-xl text-base font-medium transition-colors ${
                isActive ? 'bg-orange-light text-orange-dark' : 'text-ink/70 hover:bg-black/5'
              }`
            }>
            <Icon size={20} /> {label}
          </NavLink>
        ))}
      </aside>

      <header className="md:hidden flex items-center gap-2 px-4 py-3 bg-white border-b border-black/5 sticky top-0 z-20">
        <BrandMark size={32} />
        <span className="font-display text-xl font-bold text-ink">運動啦</span>
      </header>

      <main className="flex-1 pb-24 md:pb-8 px-4 py-5 md:px-8 md:py-8 max-w-3xl w-full mx-auto">
        <Outlet />
      </main>

      <nav className="md:hidden fixed bottom-0 inset-x-0 bg-white border-t border-black/5 flex justify-around py-1.5 z-20">
        {NAV.map(({ to, label, icon: Icon, end }) => (
          <NavLink key={to} to={to} end={end}
            className={({ isActive }) =>
              `flex flex-col items-center gap-0.5 px-2 py-1.5 rounded-lg text-xs font-medium ${
                isActive ? 'text-orange' : 'text-ink/50'
              }`
            }>
            <Icon size={22} /> {label}
          </NavLink>
        ))}
      </nav>
    </div>
  )
}
