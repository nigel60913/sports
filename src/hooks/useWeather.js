import { useEffect, useState } from 'react'

// 台中市（市政府附近）座標
const LAT = 24.1477
const LON = 120.6736

// 一次抓：現在天氣、未來 8 天每日預報、未來 8 天逐時預報，
// 首頁的天氣卡片和場次清單的天氣標籤共用同一份資料，只打一次 API。
export function useWeather() {
  const [state, setState] = useState({ loading: true, error: false, current: null, dailyByDate: {}, hourlyByDate: {} })

  useEffect(() => {
    let cancelled = false
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${LAT}&longitude=${LON}` +
      `&current=temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m` +
      `&hourly=temperature_2m,weather_code` +
      `&daily=weather_code,temperature_2m_max,temperature_2m_min` +
      `&forecast_days=8&timezone=Asia%2FTaipei`

    fetch(url)
      .then(res => res.json())
      .then(json => {
        if (cancelled) return

        const dailyByDate = {}
        const days = json.daily?.time || []
        days.forEach((date, i) => {
          dailyByDate[date] = {
            code: json.daily.weather_code[i],
            max: Math.round(json.daily.temperature_2m_max[i]),
            min: Math.round(json.daily.temperature_2m_min[i]),
          }
        })

        const hourlyByDate = {}
        const hours = json.hourly?.time || []
        hours.forEach((iso, i) => {
          const [date, time] = iso.split('T')
          const hourLabel = time.slice(0, 5) // "HH:MM"
          if (!hourlyByDate[date]) hourlyByDate[date] = {}
          hourlyByDate[date][hourLabel] = {
            code: json.hourly.weather_code[i],
            temp: Math.round(json.hourly.temperature_2m[i]),
          }
        })

        setState({ loading: false, error: false, current: json.current, dailyByDate, hourlyByDate })
      })
      .catch(() => { if (!cancelled) setState(s => ({ ...s, loading: false, error: true })) })

    return () => { cancelled = true }
  }, [])

  return state
}

// 把場次的 startTime/endTime（例如 "18:00"、"22:00"）展開成整點清單 ["18:00","19:00",...,"22:00"]
export function hourRange(startTime, endTime) {
  if (!startTime || !endTime) return []
  const startH = parseInt(startTime.split(':')[0], 10)
  const endH = parseInt(endTime.split(':')[0], 10)
  const hours = []
  for (let h = startH; h <= endH && h <= 23; h++) {
    hours.push(`${String(h).padStart(2, '0')}:00`)
  }
  return hours
}
