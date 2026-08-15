import React from 'react'
import { Routes, Route } from 'react-router-dom'
import Layout from './components/Layout.jsx'
import Home from './pages/Home.jsx'
import Sessions from './pages/Sessions.jsx'
import Members from './pages/Members.jsx'
import PaymentInfo from './pages/PaymentInfo.jsx'
import Settlement from './pages/Settlement.jsx'
import Scoring from './pages/Scoring.jsx'

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<Home />} />
        <Route path="/sessions" element={<Sessions />} />
        <Route path="/members" element={<Members />} />
        <Route path="/payment-info" element={<PaymentInfo />} />
        <Route path="/settlement" element={<Settlement />} />
        <Route path="/scoring" element={<Scoring />} />
      </Route>
    </Routes>
  )
}
