// 新增場次成功後，呼叫 Google Apps Script Web App 建立 Google 日曆活動並寄出邀請信。
// 這裡完全不會用到任何 Google OAuth 憑證——Web App 網址本身就是唯一需要的東西，
// 授權是在 Apps Script 那一側、用部署者自己的帳號完成的。
const WEBHOOK_URL = import.meta.env.VITE_CALENDAR_WEBHOOK_URL
const WEBHOOK_TOKEN = import.meta.env.VITE_CALENDAR_WEBHOOK_TOKEN

export async function syncSessionToCalendar(payload, members) {
  if (!WEBHOOK_URL) return // 沒設定就直接略過，不影響場次本身的新增

  const attendees = (payload.attendeeIds || [])
    .map(id => members.find(m => m.id === id))
    .filter(m => m && m.email)
    .map(m => ({ name: m.name, email: m.email }))

  const body = {
    date: payload.date,
    startTime: payload.startTime,
    endTime: payload.endTime,
    activityTypes: payload.activityTypes || [],
    location: payload.location || '',
    attendees,
    token: WEBHOOK_TOKEN || undefined,
  }

  try {
    // 用 text/plain 而不是 application/json，避免瀏覽器送出 CORS 預檢請求
    // （Apps Script Web App 不處理 OPTIONS，預檢會失敗），內容本身還是 JSON 字串。
    await fetch(WEBHOOK_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify(body),
    })
  } catch (err) {
    console.warn('同步到 Google 日曆失敗（場次已經正常建立，不受影響）：', err)
  }
}
