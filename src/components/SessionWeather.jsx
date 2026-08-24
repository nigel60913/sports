import React from 'react'
import { describeWeatherCode } from '../utils/weatherCodes.js'
import { hourRange } from '../hooks/useWeather.js'

// 場次旁邊的天氣顯示：今天的場次秀「逐時預報」，未來幾天的場次秀單一天氣摘要。
// 超過 Open-Meteo 回傳範圍（8 天）的場次，資料庫裡沒有對應日期，就整個不顯示。
export default function SessionWeather({ session, weather, isToday }) {
  if (weather.loading || weather.error) return null

  const daily = weather.dailyByDate[session.date]
  if (!daily) return null

  if (isToday) {
    const hours = hourRange(session.startTime, session.endTime)
    const hourlyForDay = weather.hourlyByDate[session.date] || {}
    const entries = hours.map(h => ({ hour: h, data: hourlyForDay[h] })).filter(e => e.data)
    if (!entries.length) return null

    return (
      <div className="flex gap-1.5 overflow-x-auto mt-2 pb-0.5 -mx-1 px-1">
        {entries.map(({ hour, data }) => {
          const { icon } = describeWeatherCode(data.code)
          return (
            <div key={hour} className="flex flex-col items-center bg-paper rounded-lg px-2 py-1 shrink-0 min-w-[44px]">
              <span className="text-[10px] text-ink/40">{hour}</span>
              <span className="text-sm">{icon}</span>
              <span className="text-xs font-medium text-ink">{data.temp}°</span>
            </div>
          )
        })}
      </div>
    )
  }

  const { icon, label } = describeWeatherCode(daily.code)
  return (
    <span className="flex items-center gap-1 text-sm text-ink/60" title={label}>
      {icon} {daily.min}°-{daily.max}°
    </span>
  )
}
