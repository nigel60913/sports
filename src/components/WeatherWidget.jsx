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
  const todayStr = fmt(new Date())
  const today = weather.dailyByDate[todayStr]
  const currentHour = new Date().getHours()

  const hourlyToday = weather.hourlyByDate[todayStr] || {}
  const hourEntries = Array.from({ length: 24 }, (_, h) => `${String(h).padStart(2, '0')}:00`)
    .map(hour => ({ hour, data: hourlyToday[hour] }))
    .filter(e => e.data)

  return (
    <div className="bg-white rounded-2xl shadow-card px-4 py-3">
      <div className="flex items-center justify-between">
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

      {hourEntries.length > 0 && (
        <div className="flex gap-1.5 overflow-x-auto mt-3 pt-3 border-t border-black/5 -mx-1 px-1">
          {hourEntries.map(({ hour, data }) => {
            const isNow = parseInt(hour, 10) === currentHour
            const { icon: hIcon } = describeWeatherCode(data.code)
            return (
              <div key={hour}
                className={`flex flex-col items-center rounded-lg px-2 py-1.5 shrink-0 min-w-[46px] ${
                  isNow ? 'bg-orange-light' : 'bg-paper'
                }`}>
                <span className={`text-[10px] ${isNow ? 'text-orange-dark font-semibold' : 'text-ink/40'}`}>
                  {isNow ? '現在' : hour}
                </span>
                <span className="text-sm">{hIcon}</span>
                <span className="text-xs font-medium text-ink">{data.temp}°</span>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
