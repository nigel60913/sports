import React from 'react'
import { Droplets, Wind } from 'lucide-react'
import { describeWeatherCode } from '../utils/weatherCodes.js'
import { fmt } from '../utils/dateUtils.js'

export default function WeatherWidget({ weather }) {
  if (weather.error) return null // 天氣抓不到就整塊不顯示，不影響其他功能
  if (weather.loading || !weather.current) {
    return (
      <div className="bg-white rounded-2xl shadow-card px-4 py-3 animate-pulse">
        <div className="h-4 w-24 bg-black/5 rounded" />
      </div>
    )
  }

  const { label, icon } = describeWeatherCode(weather.current.weather_code)
  const temp = Math.round(weather.current.temperature_2m)
  const humidity = weather.current.relative_humidity_2m
  const wind = weather.current.wind_speed_10m
  const today = weather.dailyByDate[fmt(new Date())]

  return (
    <div className="bg-white rounded-2xl shadow-card px-4 py-3 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <span className="text-3xl">{icon}</span>
        <div>
          <div className="font-display text-lg font-bold text-ink">台中 {temp}°C</div>
          <div className="text-sm text-ink/50">
            {label}{today ? ` · 今日 ${today.min}° - ${today.max}°` : ''}
          </div>
        </div>
      </div>
      <div className="text-right text-xs text-ink/40 space-y-1">
        <div className="flex items-center gap-1 justify-end"><Droplets size={13} /> {humidity}%</div>
        <div className="flex items-center gap-1 justify-end"><Wind size={13} /> {wind} km/h</div>
      </div>
    </div>
  )
}
