import React, { useEffect, useState } from 'react'
import { Droplets, Wind } from 'lucide-react'
import { describeWeatherCode } from '../utils/weatherCodes.js'

// 台中市（市政府附近）座標
const LAT = 24.1477
const LON = 120.6736

export default function WeatherWidget() {
  const [data, setData] = useState(null)
  const [error, setError] = useState(false)

  useEffect(() => {
    let cancelled = false
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${LAT}&longitude=${LON}` +
      `&current=temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m` +
      `&daily=temperature_2m_max,temperature_2m_min` +
      `&timezone=Asia%2FTaipei`

    fetch(url)
      .then(res => res.json())
      .then(json => { if (!cancelled) setData(json) })
      .catch(() => { if (!cancelled) setError(true) })

    return () => { cancelled = true }
  }, [])

  if (error) return null // 天氣抓不到就整塊不顯示，不影響其他功能
  if (!data) {
    return (
      <div className="bg-white rounded-2xl shadow-card px-4 py-3 animate-pulse">
        <div className="h-4 w-24 bg-black/5 rounded" />
      </div>
    )
  }

  const { label, icon } = describeWeatherCode(data.current?.weather_code)
  const temp = Math.round(data.current?.temperature_2m)
  const humidity = data.current?.relative_humidity_2m
  const wind = data.current?.wind_speed_10m
  const high = Math.round(data.daily?.temperature_2m_max?.[0])
  const low = Math.round(data.daily?.temperature_2m_min?.[0])

  return (
    <div className="bg-white rounded-2xl shadow-card px-4 py-3 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <span className="text-3xl">{icon}</span>
        <div>
          <div className="font-display text-lg font-bold text-ink">台中 {temp}°C</div>
          <div className="text-sm text-ink/50">{label} · 今日 {low}° - {high}°</div>
        </div>
      </div>
      <div className="text-right text-xs text-ink/40 space-y-1">
        <div className="flex items-center gap-1 justify-end"><Droplets size={13} /> {humidity}%</div>
        <div className="flex items-center gap-1 justify-end"><Wind size={13} /> {wind} km/h</div>
      </div>
    </div>
  )
}
